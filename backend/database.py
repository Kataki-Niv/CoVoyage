import os
from pathlib import Path

import certifi
from dotenv import load_dotenv
from pymongo import MongoClient

from services.account_identity import EMAIL_COLLATION


load_dotenv(Path(__file__).with_name(".env"))

MONGODB_URI = os.getenv("MONGODB_URI", "").strip()
DATABASE_NAME = os.getenv("DATABASE_NAME", "").strip()

if not MONGODB_URI:
    raise ValueError("MONGODB_URI is not set in the environment")

if not DATABASE_NAME:
    raise ValueError("DATABASE_NAME is not set in the environment")

client = None
database = None


def connect_to_mongodb():
    global client, database

    if client is not None and database is not None:
        return database

    client = MongoClient(
        MONGODB_URI,
        serverSelectionTimeoutMS=5000,
        tlsCAFile=certifi.where(),
    )
    database = client[DATABASE_NAME]
    test_mongodb_connection()
    return database


def test_mongodb_connection():
    if client is None:
        raise RuntimeError("MongoDB client is not initialized")

    client.admin.command("ping")
    print("MongoDB Connected Successfully")
    return True


def get_users_collection():
    if database is None:
        connect_to_mongodb()

    users = database["users"]
    users.create_index("username", unique=True, sparse=True)
    users.create_index(
        "email",
        unique=True,
        name="email_unique",
        collation=EMAIL_COLLATION,
    )
    return users


def get_profiles_collection():
    if database is None:
        connect_to_mongodb()

    profiles = database["profiles"]
    profiles.create_index("user_id", unique=True)
    profiles.create_index("username", unique=True, sparse=True)
    return profiles


def get_blogs_collection():
    if database is None:
        connect_to_mongodb()

    blogs = database["blogs"]
    blogs.create_index("author_id")
    blogs.create_index("created_at")
    blogs.create_index("slug", unique=True, sparse=True)
    return blogs


def get_matches_collection():
    if database is None:
        connect_to_mongodb()

    matches = database["matches"]
    matches.create_index("user_id")
    matches.create_index("matched_user_id")
    return matches


def get_trips_collection():
    if database is None:
        connect_to_mongodb()

    trips = database["trips"]
    trips.create_index("user_id")
    return trips


def get_chats_collection():
    if database is None:
        connect_to_mongodb()

    chats = database["chats"]
    chats.create_index("participant_ids")
    return chats
