from fastapi import Depends, FastAPI, HTTPException, status
from pymongo.errors import DuplicateKeyError

from models import PROFILE_ENUM_OPTIONS, TravelProfileUpsert, UserCreate, UserLogin
from auth import hash_password, verify_password
from dependencies import get_current_user, get_profiles_or_503, get_users_or_503
from jwt_handler import create_access_token
from fastapi.middleware.cors import CORSMiddleware
from routers.blogs import router as blogs_router
from routers.chats import router as chats_router
from routers.matches import router as matches_router
from routers.trips import router as trips_router
from services.profile_embedding_sync import synchronize_profile_embedding
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
from vector_store import fetch_profile_vector


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
}

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):30\d{2}",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(blogs_router)
app.include_router(matches_router)
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


def serialize_profile(profile):
    profile.pop("_id", None)

    for field_name, default_value in PROFILE_RESPONSE_DEFAULTS.items():
        profile.setdefault(
            field_name,
            default_value.copy() if isinstance(default_value, list) else default_value,
        )

    return profile


def build_initial_profile(current_user):
    return serialize_profile(
        {
            "user_id": str(current_user["_id"]),
            "name": current_user.get("name"),
            "username": current_user.get("username"),
            "email": current_user.get("email"),
            "preferred_travel_gender": None,
        }
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
        "password": hashed_password
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
        "user": {
            "name": existing_user.get("name"),
            "username": existing_user.get("username"),
            "email": existing_user.get("email"),
        },
    }


@app.get("/auth/session")
def get_auth_session(current_user=Depends(get_current_user)):
    return {
        "authenticated": True,
        "user": {
            "name": current_user.get("name"),
            "username": current_user.get("username"),
            "email": current_user.get("email"),
        },
    }


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

    return {
        "profile": serialize_profile(profile),
    }


@app.put("/profile")
def upsert_profile(
    profile_data: TravelProfileUpsert,
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
    except DuplicateKeyError as error:
        if duplicate_key_error_matches(error, "username"):
            raise_username_conflict()

        raise

    profile = profiles.find_one({"user_id": user_id})
    serialized_profile = serialize_profile(profile)
    vector_upserted = synchronize_profile_embedding(serialized_profile)

    return {
        "message": (
            "Travel profile created successfully"
            if result.upserted_id
            else "Travel profile updated successfully"
        ),
        "profile": serialized_profile,
        "vector_upserted": vector_upserted,
    }


@app.get("/profile/vector")
def get_profile_vector(current_user=Depends(get_current_user)):
    user_id = str(current_user["_id"])
    return fetch_profile_vector_or_503(user_id)
