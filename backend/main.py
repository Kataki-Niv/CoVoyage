from fastapi import Depends, FastAPI, HTTPException, status

from models import TravelProfileUpsert, UserCreate, UserLogin
from auth import hash_password, verify_password
from dependencies import get_current_user, get_profiles_or_503, get_users_or_503
from jwt_handler import create_access_token
from fastapi.middleware.cors import CORSMiddleware
from routers.blogs import router as blogs_router
from routers.chats import router as chats_router
from routers.matches import router as matches_router
from routers.trips import router as trips_router
from vector_store import fetch_profile_vector, upsert_profile_vector


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


def upsert_profile_vector_or_503(profile):
    try:
        return upsert_profile_vector(profile)
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Vector database is unavailable",
        ) from error


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
    return profile


@app.get("/")
def home():
    return {"message": "CoVoyage Backend Running"}


@app.post("/register")
def register(user: UserCreate):
    users = get_users_or_503()

    existing_user = users.find_one(
        {"email": user.email}
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    hashed_password = hash_password(user.password)

    user_data = {
        "name": user.name,
        "email": user.email,
        "password": hashed_password
    }

    users.insert_one(user_data)

    return {"message": "User registered successfully"}


@app.post("/login")
def login(user: UserLogin):
    users = get_users_or_503()

    existing_user = users.find_one({"email": user.email})

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
            "email": existing_user.get("email"),
        },
    }


@app.get("/auth/session")
def get_auth_session(current_user=Depends(get_current_user)):
    return {
        "authenticated": True,
        "user": {
            "name": current_user.get("name"),
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
            "message": "Travel profile has not been created yet",
            "profile": None,
        }

    return {
        "profile_created": True,
        "profile": serialize_profile(profile),
    }


@app.put("/profile")
def upsert_profile(
    profile_data: TravelProfileUpsert,
    current_user=Depends(get_current_user),
):
    profiles = get_profiles_or_503()
    user_id = str(current_user["_id"])
    profile_document = profile_data.model_dump(mode="json")
    profile_document["user_id"] = user_id

    result = profiles.update_one(
        {"user_id": user_id},
        {"$set": profile_document},
        upsert=True,
    )

    profile = profiles.find_one({"user_id": user_id})
    serialized_profile = serialize_profile(profile)
    upsert_profile_vector_or_503(serialized_profile)

    return {
        "message": (
            "Travel profile created successfully"
            if result.upserted_id
            else "Travel profile updated successfully"
        ),
        "profile": serialized_profile,
        "vector_upserted": True,
    }


@app.get("/profile/vector")
def get_profile_vector(current_user=Depends(get_current_user)):
    user_id = str(current_user["_id"])
    return fetch_profile_vector_or_503(user_id)
