from datetime import datetime
import os

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import BackgroundTasks, Depends, FastAPI, HTTPException, status
from pymongo.errors import DuplicateKeyError
from starlette.staticfiles import StaticFiles

from models import (
    EmailVerificationConfirm,
    PasswordChangeRequest,
    PasswordResetConfirm,
    PasswordResetRequest,
    PROFILE_ENUM_OPTIONS,
    ProfileImageUpload,
    TravelProfileUpsert,
    TribeDiscoverabilityUpdate,
    UserCreate,
    UserLogin,
)
from auth import hash_password, verify_password
from dependencies import (
    get_account_tokens_or_503,
    get_connection_requests_or_503,
    get_current_user,
    get_profiles_or_503,
    get_tribe_blocks_or_503,
    get_users_or_503,
)
from jwt_handler import create_access_token
from fastapi.middleware.cors import CORSMiddleware
from routers.assistant import router as assistant_router
from routers.backpack import router as backpack_router
from routers.blogs import router as blogs_router
from routers.chats import router as chats_router
from routers.community import router as community_router
from routers.connections import router as connections_router
from routers.destinations import router as destinations_router
from routers.essentials import router as essentials_router
from routers.events import router as events_router
from routers.group_voyages import router as group_voyages_router
from routers.matches import router as matches_router
from routers.trips import router as trips_router
from services.profile_embedding_sync import synchronize_profile_embedding
from services.ai_matching_pipeline import MatchingServiceError, find_ai_profile_matches
from services.profile_completeness import (
    REQUIRED_AI_MATCHING_FIELDS,
    evaluate_profile_completeness,
)
from services.account_identity import (
    EMAIL_ALREADY_REGISTERED_MESSAGE,
    USERNAME_ALREADY_EXISTS_MESSAGE,
    duplicate_key_error_matches,
    find_user_by_email,
    is_email_available_for_registration,
    is_username_available_for_user,
    is_username_available_for_registration,
)
from services.account_tokens import (
    EMAIL_VERIFICATION_EXPIRY,
    EMAIL_VERIFICATION_PURPOSE,
    PASSWORD_RESET_EXPIRY,
    PASSWORD_RESET_PURPOSE,
    consume_account_token,
    create_account_token,
    email_delivery_configured,
)
from vector_store import fetch_profile_vector
from services.blocks import users_are_blocked
from services.connections import (
    get_relationship_document,
    users_have_accepted_connection,
)
from services.profile_media import (
    MEDIA_ROOT,
    delete_local_profile_image,
    ensure_media_directories,
    save_profile_image,
)
from services.profile_privacy import (
    is_tribe_discoverable,
    serialize_tribe_match_profile,
    serialize_tribe_profile,
    serialize_value,
)


PROFILE_RESPONSE_DEFAULTS = {
    "preferred_destinations": [],
    "interests": [],
    "travel_style": None,
    "budget_range": None,
    "preferred_trip_duration": None,
    "languages_spoken": [],
    "bio": None,
    "profile_picture_url": None,
    "age": None,
    "gender": None,
    "preferred_travel_gender": "Anyone",
    "country": None,
    "city": None,
    "previously_visited_countries": [],
    "linkedin": None,
    "instagram": None,
    "personal_website": None,
    "available_from": None,
    "available_to": None,
    "tribe_discoverable": False,
}

ensure_media_directories()

LOCAL_CORS_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
LOCAL_CORS_ORIGIN_REGEX = r"http://(localhost|127\.0\.0\.1):30\d{2}"


def parse_cors_origins():
    configured_origins = [
        origin.strip()
        for origin in os.getenv("COVOYAGE_CORS_ORIGINS", "").split(",")
        if origin.strip()
    ]
    return list(dict.fromkeys([*LOCAL_CORS_ORIGINS, *configured_origins]))


def get_cors_origin_regex():
    configured_regex = os.getenv("COVOYAGE_CORS_ORIGIN_REGEX", "").strip()
    return configured_regex or LOCAL_CORS_ORIGIN_REGEX


app = FastAPI()
app.mount("/media", StaticFiles(directory=MEDIA_ROOT), name="media")
app.add_middleware(
    CORSMiddleware,
    allow_origins=parse_cors_origins(),
    allow_origin_regex=get_cors_origin_regex(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(blogs_router)
app.include_router(backpack_router)
app.include_router(essentials_router)
app.include_router(assistant_router)
app.include_router(destinations_router)
app.include_router(community_router)
app.include_router(events_router)
app.include_router(matches_router)
app.include_router(connections_router)
app.include_router(group_voyages_router)
app.include_router(trips_router)
app.include_router(chats_router)


def fetch_profile_vector_or_503(user_id: str):
    try:
        return fetch_profile_vector(user_id)
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Vector database is unavailable",
        ) from error


def serialize_auth_user(user):
    user_id = str(user["_id"])

    return {
        "id": user_id,
        "user_id": user_id,
        "name": user.get("name"),
        "username": user.get("username"),
        "email": user.get("email"),
        "email_verified": user.get("email_verified") is True,
        "email_verified_at": serialize_value(user.get("email_verified_at")),
    }


def account_token_user_query(token_document):
    try:
        return {"_id": ObjectId(token_document["user_id"])}
    except (InvalidId, TypeError, KeyError) as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account token is invalid.",
        ) from error


def serialize_profile(profile):
    profile.pop("_id", None)

    for field_name, default_value in PROFILE_RESPONSE_DEFAULTS.items():
        profile.setdefault(
            field_name,
            default_value.copy() if isinstance(default_value, list) else default_value,
        )

    return serialize_value(profile)


def build_initial_profile(current_user):
    return serialize_profile(
        {
            "user_id": str(current_user["_id"]),
            "name": current_user.get("name"),
            "username": current_user.get("username"),
            "email": current_user.get("email"),
            "tribe_discoverable": False,
            "preferred_travel_gender": None,
        }
    )


def raise_matching_service_unavailable(error: MatchingServiceError) -> None:
    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail={
            "code": error.code,
            "message": error.message,
        },
    ) from error


def user_can_view_tribe_profile(
    current_user_id,
    current_profile,
    target_profile,
    profiles,
    connection_requests,
    tribe_blocks,
):
    target_user_id = target_profile.get("user_id")

    if target_user_id and users_are_blocked(
        tribe_blocks,
        current_user_id,
        target_user_id,
    ):
        return False

    if target_user_id and users_have_accepted_connection(
        connection_requests,
        current_user_id,
        target_user_id,
    ):
        return True

    relationship = (
        get_relationship_document(connection_requests, current_user_id, target_user_id)
        if target_user_id
        else None
    )

    if relationship and relationship.get("active_pair_key"):
        return True

    if not is_tribe_discoverable(current_profile) or not is_tribe_discoverable(
        target_profile,
    ):
        return False

    return any(
        match.user_id == target_user_id
        for match in find_ai_profile_matches(current_profile, profiles)
    )


def raise_username_conflict():
    raise HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail=USERNAME_ALREADY_EXISTS_MESSAGE,
    )


def raise_email_conflict():
    raise HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail=EMAIL_ALREADY_REGISTERED_MESSAGE,
    )


def raise_incomplete_profile_conflict(completeness):
    raise HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail={
            "code": "profile_incomplete",
            "message": (
                "Your profile is incomplete. You can save your progress, "
                "but you will not be able to use Find Your Tribe until all "
                "required fields are completed."
            ),
            "profile_completeness": completeness.to_dict(),
        },
    )


@app.get("/")
def home():
    return {"message": "CoVoyage Backend Running"}


@app.post("/register")
def register(user: UserCreate):
    users = get_users_or_503()
    profiles = get_profiles_or_503()

    if not is_username_available_for_registration(
        profiles,
        users,
        user.username,
    ):
        raise_username_conflict()

    if not is_email_available_for_registration(users, user.email):
        raise_email_conflict()

    hashed_password = hash_password(user.password)

    user_data = {
        "name": user.name,
        "username": user.username,
        "email": user.email,
        "password": hashed_password,
        "email_verified": False,
        "created_at": datetime.utcnow(),
    }

    try:
        users.insert_one(user_data)
    except DuplicateKeyError as error:
        if duplicate_key_error_matches(error, "username"):
            raise_username_conflict()

        if duplicate_key_error_matches(error, "email"):
            raise_email_conflict()

        raise

    return {"message": "User registered successfully"}


@app.post("/login")
def login(user: UserLogin):
    users = get_users_or_503()

    existing_user = find_user_by_email(users, user.email)

    if not existing_user or not verify_password(user.password, existing_user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(
        data={"sub": existing_user["email"]}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": serialize_auth_user(existing_user),
    }


@app.get("/auth/session")
def get_auth_session(current_user=Depends(get_current_user)):
    return {
        "authenticated": True,
        "user": serialize_auth_user(current_user),
    }


@app.get("/account")
def get_account(current_user=Depends(get_current_user)):
    return {
        "user": serialize_auth_user(current_user),
        "email_delivery_configured": email_delivery_configured(),
    }


@app.patch("/account/password")
def change_password(
    update: PasswordChangeRequest,
    current_user=Depends(get_current_user),
):
    users = get_users_or_503()
    account_tokens = get_account_tokens_or_503()

    if not verify_password(update.current_password, current_user["password"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect.",
        )

    now = datetime.utcnow()
    users.update_one(
        {"_id": current_user["_id"]},
        {
            "$set": {
                "password": hash_password(update.new_password),
                "password_updated_at": now,
            }
        },
    )
    account_tokens.update_many(
        {
            "user_id": str(current_user["_id"]),
            "purpose": PASSWORD_RESET_PURPOSE,
            "used_at": None,
        },
        {"$set": {"used_at": now, "revoked_at": now}},
    )

    return {"message": "Password updated successfully."}


@app.delete("/account")
def delete_account(current_user=Depends(get_current_user)):
    users = get_users_or_503()
    profiles = get_profiles_or_503()
    account_tokens = get_account_tokens_or_503()
    user_id = str(current_user["_id"])

    profile = profiles.find_one({"user_id": user_id})

    if profile:
        delete_local_profile_image(profile.get("profile_picture_url"))

    profiles.delete_one({"user_id": user_id})
    account_tokens.delete_many({"user_id": user_id})
    users.delete_one({"_id": current_user["_id"]})

    return {"message": "Account deleted successfully."}


@app.post("/account/email/verification/request")
def request_email_verification(current_user=Depends(get_current_user)):
    account_tokens = get_account_tokens_or_503()

    if current_user.get("email_verified") is True:
        return {
            "message": "Email is already verified.",
            "email_delivery_configured": email_delivery_configured(),
        }

    create_account_token(
        account_tokens,
        current_user,
        EMAIL_VERIFICATION_PURPOSE,
        EMAIL_VERIFICATION_EXPIRY,
    )

    return {
        "message": (
            "Email verification is prepared, but email delivery is not configured."
        ),
        "email_delivery_configured": email_delivery_configured(),
    }


@app.post("/account/email/verification/confirm")
def confirm_email_verification(update: EmailVerificationConfirm):
    users = get_users_or_503()
    account_tokens = get_account_tokens_or_503()
    token_document = consume_account_token(
        account_tokens,
        update.token,
        EMAIL_VERIFICATION_PURPOSE,
    )

    if token_document is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification token is invalid or expired.",
        )

    result = users.update_one(
        account_token_user_query(token_document),
        {
            "$set": {
                "email_verified": True,
                "email_verified_at": datetime.utcnow(),
            }
        },
    )

    if result.matched_count != 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification token is invalid or expired.",
        )

    return {"message": "Email verified successfully."}


@app.post("/account/password-reset/request")
def request_password_reset(update: PasswordResetRequest):
    users = get_users_or_503()
    account_tokens = get_account_tokens_or_503()
    user = find_user_by_email(users, update.email)

    if user is not None:
        create_account_token(
            account_tokens,
            user,
            PASSWORD_RESET_PURPOSE,
            PASSWORD_RESET_EXPIRY,
        )

    return {
        "message": (
            "If an account exists for that email, password reset instructions "
            "will be sent when email delivery is configured."
        ),
        "email_delivery_configured": email_delivery_configured(),
    }


@app.post("/account/password-reset/confirm")
def confirm_password_reset(update: PasswordResetConfirm):
    users = get_users_or_503()
    account_tokens = get_account_tokens_or_503()
    token_document = consume_account_token(
        account_tokens,
        update.token,
        PASSWORD_RESET_PURPOSE,
    )

    if token_document is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password reset token is invalid or expired.",
        )

    result = users.update_one(
        account_token_user_query(token_document),
        {
            "$set": {
                "password": hash_password(update.new_password),
                "password_updated_at": datetime.utcnow(),
            }
        },
    )

    if result.matched_count != 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password reset token is invalid or expired.",
        )

    return {"message": "Password updated successfully."}


@app.get("/profile")
def get_profile(current_user=Depends(get_current_user)):
    profiles = get_profiles_or_503()
    profile = profiles.find_one({"user_id": str(current_user["_id"])})

    if profile is None:
        return {
            "profile_created": False,
            "message": "Travel profile is ready to be completed",
            "profile": build_initial_profile(current_user),
        }

    return {
        "profile_created": True,
        "profile": serialize_profile(profile),
    }


@app.post("/profile/image")
def upload_profile_image(
    upload: ProfileImageUpload,
    current_user=Depends(get_current_user),
):
    profiles = get_profiles_or_503()
    user_id = str(current_user["_id"])
    existing_profile = profiles.find_one({"user_id": user_id})
    media_url = save_profile_image(
        user_id,
        upload.content_type,
        upload.content_base64,
    )

    if existing_profile is None:
        profile_document = build_initial_profile(current_user)
        profile_document["profile_picture_url"] = media_url

        try:
            profiles.insert_one(profile_document)
        except DuplicateKeyError:
            profiles.update_one(
                {"user_id": user_id},
                {"$set": {"profile_picture_url": media_url}},
            )
    else:
        profiles.update_one(
            {"user_id": user_id},
            {"$set": {"profile_picture_url": media_url}},
        )
        delete_local_profile_image(existing_profile.get("profile_picture_url"))

    profile = profiles.find_one({"user_id": user_id})

    return {
        "profile_picture_url": media_url,
        "profile": serialize_profile(profile),
    }


@app.get("/profile/options")
def get_profile_options(current_user=Depends(get_current_user)):
    return {
        "enum_options": PROFILE_ENUM_OPTIONS,
        "required_ai_matching_fields": list(REQUIRED_AI_MATCHING_FIELDS),
    }


@app.get("/profiles/{profile_identifier}")
def get_public_profile(
    profile_identifier: str,
    current_user=Depends(get_current_user),
):
    profiles = get_profiles_or_503()
    connection_requests = get_connection_requests_or_503()
    tribe_blocks = get_tribe_blocks_or_503()
    current_user_id = str(current_user["_id"])
    profile = profiles.find_one(
        {
            "$or": [
                {"user_id": profile_identifier},
                {"username": profile_identifier},
            ],
        }
    )

    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Traveler profile not found",
        )

    if profile.get("user_id") == current_user_id:
        return {
            "profile": serialize_profile(profile),
        }

    current_profile = profiles.find_one({"user_id": current_user_id})

    if current_profile is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Create a travel profile before viewing Tribe profiles",
        )

    try:
        can_view_profile = user_can_view_tribe_profile(
            current_user_id,
            current_profile,
            profile,
            profiles,
            connection_requests,
            tribe_blocks,
        )
    except MatchingServiceError as error:
        raise_matching_service_unavailable(error)

    if not can_view_profile:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view traveler profiles available through your Tribe matches",
        )

    return {
        "profile": serialize_tribe_match_profile(current_profile, profile),
    }


@app.put("/profile")
def upsert_profile(
    profile_data: TravelProfileUpsert,
    background_tasks: BackgroundTasks,
    confirm_incomplete: bool = False,
    current_user=Depends(get_current_user),
):
    profiles = get_profiles_or_503()
    users = get_users_or_503()
    user_id = str(current_user["_id"])

    if not is_username_available_for_user(
        profiles,
        profile_data.username,
        user_id,
        users,
    ):
        raise_username_conflict()

    profile_document = profile_data.model_dump(mode="json")
    profile_document["user_id"] = user_id
    profile_document["email"] = current_user.get("email")
    completeness = evaluate_profile_completeness(profile_document)

    if not confirm_incomplete and not completeness.complete:
        raise_incomplete_profile_conflict(completeness)

    try:
        result = profiles.update_one(
            {"user_id": user_id},
            {"$set": profile_document},
            upsert=True,
        )
        users.update_one(
            {"_id": current_user["_id"]},
            {
                "$set": {
                    "name": profile_document["name"],
                    "username": profile_document["username"],
                }
            },
        )
    except DuplicateKeyError as error:
        if duplicate_key_error_matches(error, "username"):
            raise_username_conflict()

        raise

    profile = profiles.find_one({"user_id": user_id})
    serialized_profile = serialize_profile(profile)
    background_tasks.add_task(synchronize_profile_embedding, serialized_profile)

    return {
        "message": (
            "Travel profile created successfully"
            if result.upserted_id
            else "Travel profile updated successfully"
        ),
        "profile": serialized_profile,
        "vector_sync_queued": True,
    }


@app.patch("/profile/tribe-discoverable")
def update_tribe_discoverability(
    update: TribeDiscoverabilityUpdate,
    current_user=Depends(get_current_user),
):
    profiles = get_profiles_or_503()
    user_id = str(current_user["_id"])
    existing_profile = profiles.find_one({"user_id": user_id})

    if update.tribe_discoverable:
        profile_for_completeness = existing_profile or build_initial_profile(
            current_user,
        )
        completeness = evaluate_profile_completeness(profile_for_completeness)

        if not completeness.complete:
            raise_incomplete_profile_conflict(completeness)

    if existing_profile is None:
        initial_profile = build_initial_profile(current_user)
        initial_profile["tribe_discoverable"] = update.tribe_discoverable
        profiles.insert_one(initial_profile)
    else:
        profiles.update_one(
            {"user_id": user_id},
            {"$set": {"tribe_discoverable": update.tribe_discoverable}},
        )

    profile = profiles.find_one({"user_id": user_id})

    return {
        "profile": serialize_profile(profile),
    }


@app.get("/profile/vector")
def get_profile_vector(current_user=Depends(get_current_user)):
    user_id = str(current_user["_id"])
    return fetch_profile_vector_or_503(user_id)
