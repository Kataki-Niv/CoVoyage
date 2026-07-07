from pathlib import Path
import sys


BACKEND_DIR = Path(__file__).resolve().parents[1]

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from auth import hash_password
from database import get_profiles_collection, get_users_collection


TEST_PASSWORD = "CoVoyageTest123!"
TEST_EMAIL_DOMAIN = "seed.covoyage.test"

TEST_TRAVELERS = [
    {
        "name": "Maya Chen",
        "username": "maya.bali.frames",
        "email": "maya.chen@seed.covoyage.test",
        "age": 29,
        "gender": "Female",
        "preferred_travel_gender": "Female",
        "bio": "Slow traveler chasing sunrise walks, beach cafes, and quiet photography spots.",
        "profile_picture_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
        "preferred_destinations": ["Bali", "Lombok", "Chiang Mai"],
        "interests": ["Photography", "Beaches", "Local Food", "Slow Travel"],
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
        "email": "arjun.mehta@seed.covoyage.test",
        "age": 31,
        "gender": "Male",
        "preferred_travel_gender": "Anyone",
        "bio": "Remote worker who likes affordable stays, scooters, food markets, and gentle adventure.",
        "profile_picture_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
        "preferred_destinations": ["Bali", "Chiang Mai", "Da Nang"],
        "interests": ["Photography", "Local Food", "Digital Nomad Travel", "Beaches"],
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
        "email": "elena.rossi@seed.covoyage.test",
        "age": 28,
        "gender": "Female",
        "preferred_travel_gender": "Female",
        "bio": "Culture-first beach wanderer looking for relaxed days, markets, and scenic walks.",
        "profile_picture_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
        "preferred_destinations": ["Bali", "Lisbon", "Madeira"],
        "interests": ["Beaches", "Street Food", "Photography", "Cultural Immersion"],
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
        "email": "noah.williams@seed.covoyage.test",
        "age": 34,
        "gender": "Male",
        "preferred_travel_gender": "Female",
        "bio": "City photographer planning warm destinations with easy food, beaches, and unhurried mornings.",
        "profile_picture_url": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d",
        "preferred_destinations": ["Bali", "Lombok", "Lisbon"],
        "interests": ["Photography", "Coffee Culture", "Beaches", "Hidden Gems"],
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
        "email": "sofia.almeida@seed.covoyage.test",
        "age": 30,
        "gender": "Female",
        "preferred_travel_gender": "Anyone",
        "bio": "Museum lover and food-map maker planning slow European city breaks.",
        "profile_picture_url": "https://images.unsplash.com/photo-1517841905240-472988babdf9",
        "preferred_destinations": ["Lisbon", "Porto", "Barcelona"],
        "interests": ["Museums", "Street Food", "Architecture", "Local Food"],
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
        "email": "mateo.silva@seed.covoyage.test",
        "age": 33,
        "gender": "Male",
        "preferred_travel_gender": "Anyone",
        "bio": "Food-focused traveler happiest around markets, tiled streets, and late dinners.",
        "profile_picture_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
        "preferred_destinations": ["Lisbon", "Porto", "Seville"],
        "interests": ["Street Food", "Architecture", "Museums", "Wine Tasting"],
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
        "email": "priya.nair@seed.covoyage.test",
        "age": 27,
        "gender": "Female",
        "preferred_travel_gender": "Female",
        "bio": "Trail-first traveler looking for mountain mornings, simple stays, and strong coffee.",
        "profile_picture_url": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1",
        "preferred_destinations": ["Nepal", "Bhutan", "Ladakh"],
        "interests": ["Hiking", "Trekking", "Mountains", "Photography"],
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
        "email": "daniel.kim@seed.covoyage.test",
        "age": 32,
        "gender": "Male",
        "preferred_travel_gender": "Anyone",
        "bio": "Backpacker planning high passes, mountain villages, and photography-heavy days.",
        "profile_picture_url": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d",
        "preferred_destinations": ["Nepal", "Ladakh", "Patagonia"],
        "interests": ["Hiking", "Backpacking", "Mountains", "Trekking"],
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
        "email": "amina.hassan@seed.covoyage.test",
        "age": 35,
        "gender": "Female",
        "preferred_travel_gender": "Anyone",
        "bio": "Landscape photographer drawn to deserts, mountain light, and quiet overland routes.",
        "profile_picture_url": "https://images.unsplash.com/photo-1531123897727-8f129e1688ce",
        "preferred_destinations": ["Morocco", "Jordan", "Ladakh"],
        "interests": ["Photography", "Deserts", "Road Trips", "Cultural Immersion"],
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
        "email": "liam.oconnor@seed.covoyage.test",
        "age": 38,
        "gender": "Male",
        "preferred_travel_gender": "Anyone",
        "bio": "Rail journey enthusiast looking for scenic routes, old stations, and easy conversation.",
        "profile_picture_url": "https://images.unsplash.com/photo-1519345182560-3f2917c472ef",
        "preferred_destinations": ["Switzerland", "Austria", "Scotland"],
        "interests": ["Train Journeys", "Mountains", "Architecture", "Coffee Culture"],
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
        "email": "hana.novak@seed.covoyage.test",
        "age": 29,
        "gender": "Female",
        "preferred_travel_gender": "Anyone",
        "bio": "Alpine walker mixing train days, museums, and mountain views.",
        "profile_picture_url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2",
        "preferred_destinations": ["Switzerland", "Slovenia", "Austria"],
        "interests": ["Train Journeys", "Mountains", "Hiking", "Museums"],
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
        "email": "grace.thompson@seed.covoyage.test",
        "age": 41,
        "gender": "Female",
        "preferred_travel_gender": "Female",
        "bio": "Luxury traveler planning wellness escapes, fine dining, and boutique stays.",
        "profile_picture_url": "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c",
        "preferred_destinations": ["Maldives", "Seychelles", "Dubai"],
        "interests": ["Luxury Travel", "Spa Experiences", "Fine Dining", "Beaches"],
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
        "email": "omar.farouk@seed.covoyage.test",
        "age": 26,
        "gender": "Male",
        "preferred_travel_gender": "Anyone",
        "bio": "Nightlife and food traveler looking for fast-paced city weekends.",
        "profile_picture_url": "https://images.unsplash.com/photo-1527980965255-d3b416303d12",
        "preferred_destinations": ["Tokyo", "Seoul", "Bangkok"],
        "interests": ["Nightlife", "Street Food", "Shopping", "Coffee Culture"],
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
        "email": "yuki.tanaka@seed.covoyage.test",
        "age": 30,
        "gender": "Non-binary",
        "preferred_travel_gender": "Anyone",
        "bio": "Cafe-hopping remote worker who likes workations, local food, and efficient transit.",
        "profile_picture_url": "https://images.unsplash.com/photo-1554151228-14d9def656e4",
        "preferred_destinations": ["Seoul", "Taipei", "Da Nang"],
        "interests": ["Digital Nomad Travel", "Coffee Culture", "Local Food", "Workations"],
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
        "email": "nora.ellis@seed.covoyage.test",
        "age": 36,
        "gender": "Female",
        "preferred_travel_gender": "Anyone",
        "bio": "Quiet itinerary builder interested in temples, tea, gardens, and slow mornings.",
        "profile_picture_url": "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f",
        "preferred_destinations": ["Kyoto", "Nara", "Kanazawa"],
        "interests": ["Museums", "Historical Sites", "Cultural Immersion", "Local Food"],
        "travel_style": "Cultural Travel",
        "budget_range": "Mid-range",
        "preferred_trip_duration": "10 days",
        "languages_spoken": ["English"],
        "available_from": "2026-04-01",
        "available_to": "2026-04-14",
    },
]


def build_profile_document(user_id: str, traveler: dict) -> dict:
    return {
        "user_id": user_id,
        "name": traveler["name"],
        "username": traveler["username"],
        "age": traveler["age"],
        "gender": traveler["gender"],
        "preferred_travel_gender": traveler["preferred_travel_gender"],
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


def seed_test_profiles():
    users = get_users_collection()
    profiles = get_profiles_collection()
    password_hash = hash_password(TEST_PASSWORD)
    created_users = 0
    upserted_profiles = 0

    for traveler in TEST_TRAVELERS:
        result = users.update_one(
            {"email": traveler["email"]},
            {
                "$set": {
                    "name": traveler["name"],
                    "password": password_hash,
                    "is_test_seed": True,
                },
                "$setOnInsert": {
                    "email": traveler["email"],
                },
            },
            upsert=True,
        )

        if result.upserted_id is not None:
            created_users += 1

        user = users.find_one({"email": traveler["email"]})
        profile_document = build_profile_document(str(user["_id"]), traveler)
        profile_document["is_test_seed"] = True
        profiles.update_one(
            {"user_id": profile_document["user_id"]},
            {"$set": profile_document},
            upsert=True,
        )
        upserted_profiles += 1

    print(f"Created {created_users} new users")
    print(f"Upserted {upserted_profiles} travel profiles")
    print("Seeding complete")


if __name__ == "__main__":
    seed_test_profiles()
