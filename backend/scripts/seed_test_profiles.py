from pathlib import Path
import sys

from bson import ObjectId
from datetime import datetime


BACKEND_DIR = Path(__file__).resolve().parents[1]

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from auth import hash_password
from database import (
    get_group_voyages_collection,
    get_profiles_collection,
    get_users_collection,
)


TEST_PASSWORD = "CoVoyageTest123!"

TEST_TRAVELERS = [
    {
        "name": "Maya Chen",
        "username": "maya.bali.frames",
        "email": "maya.chen@covoyagetest.com",
        "age": 29,
        "gender": "Female",
        "preferred_travel_gender": "Female",
        "country": "Indonesia",
        "city": "Canggu",
        "bio": "Slow traveler chasing sunrise walks, beach cafes, and quiet photography spots.",
        "profile_picture_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
        "preferred_destinations": ["Bali", "Lombok", "Chiang Mai"],
        "interests": [
            "Photography",
            "Beaches",
            "Local Food",
            "Slow Travel",
            "Coffee Culture",
            "Hidden Gems",
            "Street Food",
            "Cultural Immersion",
            "Yoga",
        ],
        "travel_style": "Slow Travel",
        "budget_range": "Budget-friendly",
        "preferred_trip_duration": "1 week",
        "languages_spoken": ["English", "Mandarin"],
        "available_from": "2026-08-01",
        "available_to": "2026-08-14",
    },
    {
        "name": "Arjun Mehta",
        "username": "arjun.nomad",
        "email": "arjun.mehta@covoyagetest.com",
        "age": 31,
        "gender": "Male",
        "preferred_travel_gender": "Anyone",
        "country": "India",
        "city": "Bengaluru",
        "bio": "Remote worker who likes affordable stays, scooters, food markets, and gentle adventure.",
        "profile_picture_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
        "preferred_destinations": ["Bali", "Chiang Mai", "Da Nang"],
        "interests": [
            "Photography",
            "Local Food",
            "Digital Nomad Travel",
            "Beaches",
            "Workations",
            "Coffee Culture",
            "Road Trips",
            "Budget Travel",
            "Street Food",
            "Group Travel",
        ],
        "travel_style": "Slow Travel",
        "budget_range": "Budget-friendly",
        "preferred_trip_duration": "1 week",
        "languages_spoken": ["English", "Hindi"],
        "available_from": "2026-08-05",
        "available_to": "2026-08-20",
    },
    {
        "name": "Elena Rossi",
        "username": "elena.seasides",
        "email": "elena.rossi@covoyagetest.com",
        "age": 28,
        "gender": "Female",
        "preferred_travel_gender": "Female",
        "country": "Italy",
        "city": "Rome",
        "bio": "Culture-first beach wanderer looking for relaxed days, markets, and scenic walks.",
        "profile_picture_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
        "preferred_destinations": ["Bali", "Lisbon", "Madeira"],
        "interests": [
            "Beaches",
            "Street Food",
            "Photography",
            "Cultural Immersion",
            "Local Food",
            "Historical Sites",
            "Festivals",
            "Slow Travel",
            "Architecture",
        ],
        "travel_style": "Slow Travel",
        "budget_range": "Budget-friendly",
        "preferred_trip_duration": "1 week",
        "languages_spoken": ["English", "Italian"],
        "available_from": "2026-08-03",
        "available_to": "2026-08-12",
    },
    {
        "name": "Noah Williams",
        "username": "noah.photo.walks",
        "email": "noah.williams@covoyagetest.com",
        "age": 34,
        "gender": "Male",
        "preferred_travel_gender": "Female",
        "country": "United States",
        "city": "San Francisco",
        "bio": "City photographer planning warm destinations with easy food, beaches, and unhurried mornings.",
        "profile_picture_url": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d",
        "preferred_destinations": ["Bali", "Lombok", "Lisbon"],
        "interests": [
            "Photography",
            "Coffee Culture",
            "Beaches",
            "Hidden Gems",
            "Architecture",
            "Local Food",
            "Street Food",
            "Slow Travel",
        ],
        "travel_style": "Slow Travel",
        "budget_range": "Mid-range",
        "preferred_trip_duration": "1 week",
        "languages_spoken": ["English", "Spanish"],
        "available_from": "2026-08-10",
        "available_to": "2026-08-25",
    },
    {
        "name": "Sofia Almeida",
        "username": "sofia.lisbon.lanes",
        "email": "sofia.almeida@covoyagetest.com",
        "age": 30,
        "gender": "Female",
        "preferred_travel_gender": "Anyone",
        "country": "Portugal",
        "city": "Lisbon",
        "bio": "Museum lover and food-map maker planning slow European city breaks.",
        "profile_picture_url": "https://images.unsplash.com/photo-1517841905240-472988babdf9",
        "preferred_destinations": ["Lisbon", "Porto", "Barcelona"],
        "interests": [
            "Museums",
            "Street Food",
            "Architecture",
            "Local Food",
            "Historical Sites",
            "Coffee Culture",
            "Cultural Immersion",
            "Wine Tasting",
            "Slow Travel",
            "UNESCO Sites",
        ],
        "travel_style": "Cultural Travel",
        "budget_range": "Mid-range",
        "preferred_trip_duration": "10 days",
        "languages_spoken": ["English", "Portuguese"],
        "available_from": "2026-09-01",
        "available_to": "2026-09-15",
    },
    {
        "name": "Mateo Silva",
        "username": "mateo.tables",
        "email": "mateo.silva@covoyagetest.com",
        "age": 33,
        "gender": "Male",
        "preferred_travel_gender": "Anyone",
        "country": "Portugal",
        "city": "Porto",
        "bio": "Food-focused traveler happiest around markets, tiled streets, and late dinners.",
        "profile_picture_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
        "preferred_destinations": ["Lisbon", "Porto", "Seville"],
        "interests": [
            "Street Food",
            "Architecture",
            "Museums",
            "Wine Tasting",
            "Local Food",
            "Coffee Culture",
            "Historical Sites",
            "Cultural Immersion",
            "Festivals",
        ],
        "travel_style": "Cultural Travel",
        "budget_range": "Mid-range",
        "preferred_trip_duration": "10 days",
        "languages_spoken": ["English", "Portuguese", "Spanish"],
        "available_from": "2026-09-05",
        "available_to": "2026-09-18",
    },
    {
        "name": "Priya Nair",
        "username": "priya.trails",
        "email": "priya.nair@covoyagetest.com",
        "age": 27,
        "gender": "Female",
        "preferred_travel_gender": "Female",
        "country": "India",
        "city": "Kochi",
        "bio": "Trail-first traveler looking for mountain mornings, simple stays, and strong coffee.",
        "profile_picture_url": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1",
        "preferred_destinations": ["Nepal", "Bhutan", "Ladakh"],
        "interests": [
            "Hiking",
            "Trekking",
            "Mountains",
            "Photography",
            "Backpacking",
            "Camping",
            "Road Trips",
            "Stargazing",
            "National Parks",
            "Rock Climbing",
            "Wildlife Safaris",
        ],
        "travel_style": "Adventure Travel",
        "budget_range": "Budget-friendly",
        "preferred_trip_duration": "2 weeks",
        "languages_spoken": ["English", "Hindi", "Malayalam"],
        "available_from": "2026-10-01",
        "available_to": "2026-10-20",
    },
    {
        "name": "Daniel Kim",
        "username": "daniel.highpasses",
        "email": "daniel.kim@covoyagetest.com",
        "age": 32,
        "gender": "Male",
        "preferred_travel_gender": "Anyone",
        "country": "South Korea",
        "city": "Seoul",
        "bio": "Backpacker planning high passes, mountain villages, and photography-heavy days.",
        "profile_picture_url": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d",
        "preferred_destinations": ["Nepal", "Ladakh", "Patagonia"],
        "interests": [
            "Hiking",
            "Backpacking",
            "Mountains",
            "Trekking",
            "Camping",
            "Road Trips",
            "Photography",
            "Offbeat Destinations",
            "National Parks",
            "Rock Climbing",
        ],
        "travel_style": "Adventure Travel",
        "budget_range": "Budget-friendly",
        "preferred_trip_duration": "2 weeks",
        "languages_spoken": ["English", "Korean"],
        "available_from": "2026-10-08",
        "available_to": "2026-10-28",
    },
    {
        "name": "Amina Hassan",
        "username": "amina.desertlight",
        "email": "amina.hassan@covoyagetest.com",
        "age": 35,
        "gender": "Female",
        "preferred_travel_gender": "Anyone",
        "country": "Morocco",
        "city": "Marrakech",
        "bio": "Landscape photographer drawn to deserts, mountain light, and quiet overland routes.",
        "profile_picture_url": "https://images.unsplash.com/photo-1531123897727-8f129e1688ce",
        "preferred_destinations": ["Morocco", "Jordan", "Ladakh"],
        "interests": [
            "Photography",
            "Deserts",
            "Road Trips",
            "Cultural Immersion",
            "Mountains",
            "Camping",
            "Local Food",
            "Offbeat Destinations",
            "Stargazing",
        ],
        "travel_style": "Adventure Travel",
        "budget_range": "Mid-range",
        "preferred_trip_duration": "2 weeks",
        "languages_spoken": ["English", "Arabic", "French"],
        "available_from": "2026-10-15",
        "available_to": "2026-11-02",
    },
    {
        "name": "Liam O'Connor",
        "username": "liam.rail.days",
        "email": "liam.oconnor@covoyagetest.com",
        "age": 38,
        "gender": "Male",
        "preferred_travel_gender": "Anyone",
        "country": "Ireland",
        "city": "Dublin",
        "bio": "Rail journey enthusiast looking for scenic routes, old stations, and easy conversation.",
        "profile_picture_url": "https://images.unsplash.com/photo-1519345182560-3f2917c472ef",
        "preferred_destinations": ["Switzerland", "Austria", "Scotland"],
        "interests": [
            "Train Journeys",
            "Mountains",
            "Architecture",
            "Coffee Culture",
            "Museums",
            "Historical Sites",
            "Photography",
            "Hidden Gems",
        ],
        "travel_style": "Scenic Travel",
        "budget_range": "Mid-range",
        "preferred_trip_duration": "10 days",
        "languages_spoken": ["English"],
        "available_from": "2026-07-10",
        "available_to": "2026-07-22",
    },
    {
        "name": "Hana Novak",
        "username": "hana.alpine",
        "email": "hana.novak@covoyagetest.com",
        "age": 29,
        "gender": "Female",
        "preferred_travel_gender": "Anyone",
        "country": "Czechia",
        "city": "Prague",
        "bio": "Alpine walker mixing train days, museums, and mountain views.",
        "profile_picture_url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2",
        "preferred_destinations": ["Switzerland", "Slovenia", "Austria"],
        "interests": [
            "Train Journeys",
            "Mountains",
            "Hiking",
            "Museums",
            "Architecture",
            "Photography",
            "Historical Sites",
            "Coffee Culture",
            "Lakes",
            "Slow Travel",
        ],
        "travel_style": "Scenic Travel",
        "budget_range": "Mid-range",
        "preferred_trip_duration": "10 days",
        "languages_spoken": ["English", "Czech"],
        "available_from": "2026-07-12",
        "available_to": "2026-07-24",
    },
    {
        "name": "Grace Thompson",
        "username": "grace.luxe",
        "email": "grace.thompson@covoyagetest.com",
        "age": 41,
        "gender": "Female",
        "preferred_travel_gender": "Female",
        "country": "United Kingdom",
        "city": "London",
        "bio": "Luxury traveler planning wellness escapes, fine dining, and boutique stays.",
        "profile_picture_url": "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c",
        "preferred_destinations": ["Maldives", "Seychelles", "Dubai"],
        "interests": [
            "Luxury Travel",
            "Spa Experiences",
            "Fine Dining",
            "Beaches",
            "Wellness Retreats",
            "Shopping",
            "Island Hopping",
            "Local Food",
            "Sailing",
        ],
        "travel_style": "Luxury Travel",
        "budget_range": "Luxury",
        "preferred_trip_duration": "1 week",
        "languages_spoken": ["English", "French"],
        "available_from": "2026-12-01",
        "available_to": "2026-12-12",
    },
    {
        "name": "Omar Farouk",
        "username": "omar.citynights",
        "email": "omar.farouk@covoyagetest.com",
        "age": 26,
        "gender": "Male",
        "preferred_travel_gender": "Anyone",
        "country": "United Arab Emirates",
        "city": "Dubai",
        "bio": "Nightlife and food traveler looking for fast-paced city weekends.",
        "profile_picture_url": "https://images.unsplash.com/photo-1527980965255-d3b416303d12",
        "preferred_destinations": ["Tokyo", "Seoul", "Bangkok"],
        "interests": [
            "Nightlife",
            "Street Food",
            "Shopping",
            "Coffee Culture",
            "Local Food",
            "Architecture",
            "Weekend Getaways",
            "Museums",
            "Festivals",
            "Group Travel",
        ],
        "travel_style": "City Break",
        "budget_range": "Mid-range",
        "preferred_trip_duration": "Weekend",
        "languages_spoken": ["English", "Arabic"],
        "available_from": "2026-11-05",
        "available_to": "2026-11-10",
    },
    {
        "name": "Yuki Tanaka",
        "username": "yuki.nomad.cafes",
        "email": "yuki.tanaka@covoyagetest.com",
        "age": 30,
        "gender": "Non-binary",
        "preferred_travel_gender": "Anyone",
        "country": "Japan",
        "city": "Tokyo",
        "bio": "Cafe-hopping remote worker who likes workations, local food, and efficient transit.",
        "profile_picture_url": "https://images.unsplash.com/photo-1554151228-14d9def656e4",
        "preferred_destinations": ["Seoul", "Taipei", "Da Nang"],
        "interests": [
            "Digital Nomad Travel",
            "Coffee Culture",
            "Local Food",
            "Workations",
            "Street Food",
            "Shopping",
            "Train Journeys",
            "Budget Travel",
            "Weekend Getaways",
        ],
        "travel_style": "Digital Nomad Travel",
        "budget_range": "Mid-range",
        "preferred_trip_duration": "1 month",
        "languages_spoken": ["English", "Japanese"],
        "available_from": "2026-08-18",
        "available_to": "2026-09-18",
    },
    {
        "name": "Nora Ellis",
        "username": "nora.templedays",
        "email": "nora.ellis@covoyagetest.com",
        "age": 36,
        "gender": "Female",
        "preferred_travel_gender": "Anyone",
        "country": "Japan",
        "city": "Kyoto",
        "bio": "Quiet itinerary builder interested in temples, tea, gardens, and slow mornings.",
        "profile_picture_url": "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f",
        "preferred_destinations": ["Kyoto", "Nara", "Kanazawa"],
        "interests": [
            "Museums",
            "Historical Sites",
            "Cultural Immersion",
            "Local Food",
            "Architecture",
            "Slow Travel",
            "Coffee Culture",
            "Hidden Gems",
            "UNESCO Sites",
            "Festivals",
            "Forests",
        ],
        "travel_style": "Cultural Travel",
        "budget_range": "Mid-range",
        "preferred_trip_duration": "10 days",
        "languages_spoken": ["English"],
        "available_from": "2026-04-01",
        "available_to": "2026-04-14",
    },
]

TEST_GROUP_VOYAGES = [
    {
        "seed_key": "tokyo-winter-food-photo",
        "title": "Tokyo Food Alleys & Photo Walks",
        "destination": "Tokyo",
        "creator_username": "omar.citynights",
        "participant_usernames": ["yuki.nomad.cafes", "nora.templedays"],
        "start_date": "2026-11-06",
        "end_date": "2026-11-10",
        "description": (
            "A compact city break for street food, night neighborhoods, cafe "
            "stops, and easy photo walks by train."
        ),
        "tags": ["Street Food", "Photography", "City Break"],
        "budget_range": "Mid-range",
        "max_participants": 6,
    },
    {
        "seed_key": "bali-slow-workation",
        "title": "Bali Slow Workation Circle",
        "destination": "Bali",
        "creator_username": "maya.bali.frames",
        "participant_usernames": ["arjun.nomad", "elena.seasides"],
        "start_date": "2026-11-18",
        "end_date": "2026-11-27",
        "description": (
            "A relaxed shared base for sunrise walks, coworking-friendly days, "
            "local food, beaches, and low-pressure exploring."
        ),
        "tags": ["Slow Travel", "Workations", "Beaches"],
        "budget_range": "Budget-friendly",
        "max_participants": 8,
    },
    {
        "seed_key": "lisbon-market-museum",
        "title": "Lisbon Markets, Museums & Late Dinners",
        "destination": "Lisbon",
        "creator_username": "sofia.lisbon.lanes",
        "participant_usernames": ["mateo.tables"],
        "start_date": "2026-10-08",
        "end_date": "2026-10-17",
        "description": (
            "A cultural city route built around markets, tiled streets, museums, "
            "architecture, and unhurried dinners."
        ),
        "tags": ["Museums", "Architecture", "Local Food"],
        "budget_range": "Mid-range",
        "max_participants": 5,
    },
    {
        "seed_key": "ladakh-mountain-light",
        "title": "Ladakh Mountain Roads & Stargazing",
        "destination": "Ladakh",
        "creator_username": "priya.trails",
        "participant_usernames": ["daniel.highpasses", "amina.desertlight"],
        "start_date": "2026-10-18",
        "end_date": "2026-10-30",
        "description": (
            "A small adventure group for mountain roads, simple stays, careful "
            "acclimatization, landscape photography, and clear-night stargazing."
        ),
        "tags": ["Mountains", "Road Trips", "Stargazing"],
        "budget_range": "Budget-friendly",
        "max_participants": 6,
    },
]


def slugify_seed_value(value: str) -> str:
    return (
        value.lower()
        .replace("&", "and")
        .replace(" ", "-")
        .replace(",", "")
        .replace(".", "")
    )


def build_generated_group_voyages() -> list[dict]:
    generated_voyages = []
    destinations = []
    seen_destinations = set()

    for traveler in TEST_TRAVELERS:
        for destination in traveler["preferred_destinations"]:
            normalized_destination = destination.strip().lower()

            if normalized_destination in seen_destinations:
                continue

            seen_destinations.add(normalized_destination)
            destinations.append((destination, traveler))

    for generated_index, (destination, traveler) in enumerate(destinations, start=1):
        host_candidates = [
            candidate
            for candidate in TEST_TRAVELERS
            if destination not in candidate["preferred_destinations"]
            and candidate["username"] != traveler["username"]
        ]

        host_traveler = (
            host_candidates[generated_index % len(host_candidates)]
            if host_candidates
            else traveler
        )
        participant_travelers = [
            candidate
            for candidate in host_candidates
            if candidate["username"] != host_traveler["username"]
        ][:2]

        generated_voyages.append(
            {
                "seed_key": f"generated-{slugify_seed_value(destination)}-discover",
                "title": f"{destination} Shared Discovery Circle",
                "destination": destination,
                "creator_username": host_traveler["username"],
                "participant_usernames": [
                    candidate["username"]
                    for candidate in participant_travelers
                ],
                "start_date": f"2026-12-{min(24, 2 + generated_index):02d}",
                "end_date": f"2026-12-{min(28, 6 + generated_index):02d}",
                "description": (
                    f"A small hosted group for travelers with {destination} "
                    "on their saved profile, built around easy planning, "
                    "shared local experiences, and compatible travel rhythms."
                ),
                "tags": ["Shared Plans", "Local Food", "Culture"],
                "budget_range": traveler["budget_range"],
                "max_participants": 6,
            }
        )

    return generated_voyages


def build_profile_document(user_id: str, traveler: dict) -> dict:
    return {
        "user_id": user_id,
        "tribe_discoverable": True,
        "name": traveler["name"],
        "username": traveler["username"],
        "email": traveler["email"],
        "age": traveler["age"],
        "gender": traveler["gender"],
        "preferred_travel_gender": traveler["preferred_travel_gender"],
        "country": traveler["country"],
        "city": traveler["city"],
        "bio": traveler["bio"],
        "profile_picture_url": traveler.get("profile_picture_url"),
        "preferred_destinations": traveler["preferred_destinations"],
        "interests": traveler["interests"],
        "travel_style": traveler["travel_style"],
        "budget_range": traveler["budget_range"],
        "preferred_trip_duration": traveler["preferred_trip_duration"],
        "languages_spoken": traveler["languages_spoken"],
        "available_from": traveler["available_from"],
        "available_to": traveler["available_to"],
    }


def find_existing_seed_user(users, profiles, traveler: dict):
    profile = profiles.find_one({"username": traveler["username"]})

    if profile and profile.get("user_id"):
        try:
            user = users.find_one({"_id": ObjectId(profile["user_id"])})

            if user:
                return user
        except Exception:
            pass

    return users.find_one({"username": traveler["username"]}) or users.find_one(
        {"email": traveler["email"]},
    )


def seed_test_profiles():
    users = get_users_collection()
    profiles = get_profiles_collection()
    group_voyages = get_group_voyages_collection()
    password_hash = hash_password(TEST_PASSWORD)
    created_users = 0
    upserted_profiles = 0
    upserted_group_voyages = 0

    for traveler in TEST_TRAVELERS:
        existing_user = find_existing_seed_user(users, profiles, traveler)
        user_filter = (
            {"_id": existing_user["_id"]}
            if existing_user
            else {"email": traveler["email"]}
        )
        result = users.update_one(
            user_filter,
            {
                "$set": {
                    "name": traveler["name"],
                    "username": traveler["username"],
                    "email": traveler["email"],
                    "password": password_hash,
                    "is_test_seed": True,
                },
            },
            upsert=True,
        )

        if result.upserted_id is not None:
            created_users += 1

        user = users.find_one(user_filter) or users.find_one(
            {"email": traveler["email"]},
        )
        profile_document = build_profile_document(str(user["_id"]), traveler)
        profile_document["is_test_seed"] = True
        profiles.update_one(
            {"user_id": profile_document["user_id"]},
            {"$set": profile_document},
            upsert=True,
        )
        upserted_profiles += 1

    profiles_by_username = {
        profile["username"]: profile
        for profile in profiles.find(
            {"username": {"$in": [traveler["username"] for traveler in TEST_TRAVELERS]}}
        )
    }
    now = datetime.utcnow()

    seed_group_voyages = TEST_GROUP_VOYAGES + build_generated_group_voyages()
    seed_group_voyage_keys = [
        voyage["seed_key"]
        for voyage in seed_group_voyages
    ]

    group_voyages.delete_many(
        {
            "is_test_seed": True,
            "seed_key": {"$nin": seed_group_voyage_keys},
        }
    )

    for voyage in seed_group_voyages:
        creator_profile = profiles_by_username.get(voyage["creator_username"])

        if not creator_profile:
            continue

        participant_ids = [creator_profile["user_id"]]

        for username in voyage["participant_usernames"]:
            participant_profile = profiles_by_username.get(username)

            if participant_profile:
                participant_ids.append(participant_profile["user_id"])

        voyage_document = {
            "seed_key": voyage["seed_key"],
            "title": voyage["title"],
            "destination": voyage["destination"],
            "creator_id": creator_profile["user_id"],
            "participant_ids": list(dict.fromkeys(participant_ids)),
            "start_date": voyage["start_date"],
            "end_date": voyage["end_date"],
            "description": voyage["description"],
            "tags": voyage["tags"],
            "budget_range": voyage["budget_range"],
            "max_participants": voyage["max_participants"],
            "status": "open",
            "visibility": "public",
            "is_test_seed": True,
            "updated_at": now,
        }
        group_voyages.update_one(
            {"seed_key": voyage["seed_key"]},
            {
                "$set": voyage_document,
                "$setOnInsert": {"created_at": now},
            },
            upsert=True,
        )
        upserted_group_voyages += 1

    print(f"Created {created_users} new users")
    print(f"Upserted {upserted_profiles} travel profiles")
    print(f"Upserted {upserted_group_voyages} group voyages")
    print("Seeding complete")


if __name__ == "__main__":
    seed_test_profiles()
