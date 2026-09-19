import os
from pathlib import Path

import certifi
from dotenv import load_dotenv
from pymongo import MongoClient

from services.account_identity import EMAIL_COLLATION


load_dotenv(Path(__file__).with_name(".env"))

client = None
database = None


def get_database_config():
    mongodb_uri = os.getenv("MONGODB_URI", "").strip()
    database_name = os.getenv("DATABASE_NAME", "").strip()
    tls_ca_file = os.getenv("MONGODB_TLS_CA_FILE", "").strip() or certifi.where()

    if not mongodb_uri:
        raise RuntimeError("MONGODB_URI is not set in the environment")

    if not database_name:
        raise RuntimeError("DATABASE_NAME is not set in the environment")

    return mongodb_uri, database_name, tls_ca_file


def connect_to_mongodb():
    global client, database

    if client is not None and database is not None:
        return database

    mongodb_uri, database_name, tls_ca_file = get_database_config()
    client = MongoClient(
        mongodb_uri,
        serverSelectionTimeoutMS=5000,
        tlsCAFile=tls_ca_file,
    )
    database = client[database_name]
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


def get_backpack_items_collection():
    if database is None:
        connect_to_mongodb()

    backpack_items = database["backpack_items"]
    backpack_items.create_index("user_id")
    backpack_items.create_index("product_slug")
    backpack_items.create_index(
        "user_product_key",
        unique=True,
        name="backpack_user_product_unique",
    )
    return backpack_items


def get_chats_collection():
    if database is None:
        connect_to_mongodb()

    chats = database["chats"]
    chats.create_index("participant_ids")
    chats.create_index(
        "pair_key",
        unique=True,
        sparse=True,
        name="chat_pair_unique",
    )
    chats.create_index(
        "group_voyage_key",
        unique=True,
        sparse=True,
        name="chat_group_voyage_unique",
    )
    chats.create_index("type")
    chats.create_index("voyage_id")
    chats.create_index("updated_at")
    chats.create_index("last_message_at")
    return chats


def get_messages_collection():
    if database is None:
        connect_to_mongodb()

    messages = database["messages"]
    messages.create_index(
        [("conversation_id", 1), ("created_at", 1)],
        name="conversation_created_at",
    )
    messages.create_index("sender_id")
    messages.create_index("recipient_id")
    messages.create_index(
        [("recipient_id", 1), ("read_at", 1)],
        name="recipient_read_state",
    )
    return messages


def get_connection_requests_collection():
    if database is None:
        connect_to_mongodb()

    connection_requests = database["connection_requests"]
    connection_requests.create_index("requester_id")
    connection_requests.create_index("recipient_id")
    connection_requests.create_index("status")
    connection_requests.create_index(
        "active_pair_key",
        unique=True,
        sparse=True,
        name="active_connection_pair_unique",
    )
    return connection_requests


def get_tribe_blocks_collection():
    if database is None:
        connect_to_mongodb()

    tribe_blocks = database["tribe_blocks"]
    tribe_blocks.create_index("blocker_id")
    tribe_blocks.create_index("blocked_user_id")
    tribe_blocks.create_index("blocked_pair_key")
    tribe_blocks.create_index(
        "block_key",
        unique=True,
        name="tribe_block_unique",
    )
    return tribe_blocks


def get_tribe_reports_collection():
    if database is None:
        connect_to_mongodb()

    tribe_reports = database["tribe_reports"]
    tribe_reports.create_index("reporter_id")
    tribe_reports.create_index("reported_user_id")
    tribe_reports.create_index("created_at")
    tribe_reports.create_index(
        "active_report_key",
        unique=True,
        sparse=True,
        name="active_tribe_report_unique",
    )
    return tribe_reports


def get_account_tokens_collection():
    if database is None:
        connect_to_mongodb()

    account_tokens = database["account_tokens"]
    account_tokens.create_index("user_id")
    account_tokens.create_index("purpose")
    account_tokens.create_index(
        "token_hash",
        unique=True,
        name="account_token_hash_unique",
    )
    account_tokens.create_index(
        "expires_at",
        expireAfterSeconds=0,
        name="account_token_expiry",
    )
    return account_tokens


def get_group_voyages_collection():
    if database is None:
        connect_to_mongodb()

    group_voyages = database["group_voyages"]
    group_voyages.create_index("creator_id")
    group_voyages.create_index("destination")
    group_voyages.create_index("status")
    group_voyages.create_index("visibility")
    group_voyages.create_index("start_date")
    return group_voyages


def get_group_voyage_join_requests_collection():
    if database is None:
        connect_to_mongodb()

    join_requests = database["group_voyage_join_requests"]
    join_requests.create_index("voyage_id")
    join_requests.create_index("requester_id")
    join_requests.create_index("creator_id")
    join_requests.create_index("status")
    join_requests.create_index(
        "active_request_key",
        unique=True,
        sparse=True,
        name="active_group_join_request_unique",
    )
    return join_requests


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
    community_tips.create_index("category")
    community_tips.create_index("author_id")
    community_tips.create_index("moderation_status")
    community_tips.create_index("created_at")
    return community_tips


def get_community_replies_collection():
    if database is None:
        connect_to_mongodb()

    community_replies = database["community_replies"]
    community_replies.create_index("tip_id")
    community_replies.create_index("author_id")
    return community_replies


def get_destination_events_collection():
    if database is None:
        connect_to_mongodb()

    destination_events = database["destination_events"]
    destination_events.create_index("country_slug")
    destination_events.create_index("place_slug")
    destination_events.create_index("date_start")
    destination_events.create_index("verification_status")
    destination_events.create_index("organizer_id")
    destination_events.create_index("category")
    return destination_events


def get_event_participants_collection():
    if database is None:
        connect_to_mongodb()

    event_participants = database["event_participants"]
    event_participants.create_index("event_id")
    event_participants.create_index("user_id")
    event_participants.create_index(
        "event_user_key",
        unique=True,
        name="event_participant_unique",
    )
    return event_participants


def get_saved_events_collection():
    if database is None:
        connect_to_mongodb()

    saved_events = database["saved_events"]
    saved_events.create_index("event_id")
    saved_events.create_index("user_id")
    saved_events.create_index(
        "event_user_key",
        unique=True,
        name="saved_event_unique",
    )
    return saved_events
