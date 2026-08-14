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


def get_countries_collection():
    if database is None:
        connect_to_mongodb()

    countries = database["countries"]
    countries.create_index("slug", unique=True)
    return countries


def get_places_collection():
    if database is None:
        connect_to_mongodb()

    places = database["places"]
    places.create_index(
        [("country_slug", 1), ("slug", 1)],
        unique=True,
        name="country_slug_slug_unique",
    )
    places.create_index("country_slug")
    return places


def get_destination_monthly_factors_collection():
    if database is None:
        connect_to_mongodb()

    destination_monthly_factors = database["destination_monthly_factors"]
    destination_monthly_factors.create_index(
        [("year", 1), ("month", 1), ("country_slug", 1), ("place_slug", 1)],
        unique=True,
        name="year_month_country_place_unique",
    )
    destination_monthly_factors.create_index(
        [("year", 1), ("month", 1)],
        name="year_month_lookup",
    )
    destination_monthly_factors.create_index("country_slug")
    return destination_monthly_factors


def get_monthly_snapshots_collection():
    if database is None:
        connect_to_mongodb()

    monthly_snapshots = database["monthly_snapshots"]
    monthly_snapshots.create_index(
        [("year", 1), ("month", 1)],
        unique=True,
        name="year_month_unique",
    )
    return monthly_snapshots


def get_community_tips_collection():
    if database is None:
        connect_to_mongodb()

    community_tips = database["community_tips"]
    community_tips.create_index("place_slug")
    community_tips.create_index("country_slug")
    community_tips.create_index("created_at")
    return community_tips


def get_community_replies_collection():
    if database is None:
        connect_to_mongodb()

    community_replies = database["community_replies"]
    community_replies.create_index("tip_id")
    return community_replies


def get_destination_events_collection():
    if database is None:
        connect_to_mongodb()

    destination_events = database["destination_events"]
    destination_events.create_index("country_slug")
    destination_events.create_index("place_slug")
    destination_events.create_index("date_start")
    destination_events.create_index("verification_status")
    return destination_events
