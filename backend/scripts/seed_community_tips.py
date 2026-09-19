from pathlib import Path
import sys
from datetime import datetime


BACKEND_DIR = Path(__file__).resolve().parents[1]

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from database import get_community_tips_collection, get_profiles_collection, get_users_collection


COMMUNITY_TIP_SEEDS = [
    {
        "seed_key": "france-provence-elena-market-morning",
        "username": "elena.seasides",
        "country_slug": "france",
        "place_slug": "provence",
        "category": "Food",
        "text": "Go to village markets early if you want the produce stalls and bakery counters before the lunch rush changes the mood.",
    },
    {
        "seed_key": "italy-rome-mateo-water-fountains",
        "username": "mateo.tables",
        "country_slug": "italy",
        "place_slug": "rome",
        "category": "Hidden Gems",
        "text": "In Rome, plan walks around piazzas and small side streets rather than only monument-to-monument routes; the quieter corners are where the city opens up.",
    },
    {
        "seed_key": "japan-kyoto-nora-temple-morning",
        "username": "nora.templedays",
        "country_slug": "japan",
        "place_slug": "kyoto",
        "category": "Cultural Etiquette",
        "text": "For Kyoto temples, arrive close to opening time and keep narrow residential lanes quiet when moving between the famous stops.",
    },
    {
        "seed_key": "iceland-south-coast-priya-slow-stops",
        "username": "priya.trails",
        "country_slug": "iceland",
        "place_slug": "south-coast",
        "category": "Transport",
        "text": "On the South Coast, choose fewer stops than the map suggests. Wind, photos, and short walks make each waterfall or black-sand stop take longer.",
    },
    {
        "seed_key": "guatemala-lake-atitlan-sofia-village-base",
        "username": "sofia.lisbon.lanes",
        "country_slug": "guatemala",
        "place_slug": "lake-atitlan",
        "category": "Hidden Gems",
        "text": "Pick the Lake Atitlan village based on your pace, not just the name you hear most. Boat-linked villages feel very different from one another.",
    },
    {
        "seed_key": "canada-banff-noah-shuttle-start",
        "username": "noah.photo.walks",
        "country_slug": "canada",
        "place_slug": "banff",
        "category": "Transport",
        "text": "For Banff lake days, sort the shuttle or parking plan before breakfast. The rest of the day feels calmer once access is settled.",
    },
    {
        "seed_key": "norway-bergen-fjords-liam-rain-plan",
        "username": "liam.rail.days",
        "country_slug": "norway",
        "place_slug": "bergen-fjords",
        "category": "Hidden Gems",
        "text": "In Bergen, keep a rain-ready museum or seafood-hall stop near your fjord plan so weather changes do not flatten the day.",
    },
    {
        "seed_key": "vietnam-hoi-an-arjun-evening-lanes",
        "username": "arjun.nomad",
        "country_slug": "vietnam",
        "place_slug": "hoi-an-da-nang",
        "category": "Food",
        "text": "In Hoi An, save the old-town lanes for late afternoon into evening; the food stops and lantern streets make more sense after the heat softens.",
    },
]


def find_seed_profile(username: str):
    profiles = get_profiles_collection()
    users = get_users_collection()
    profile = profiles.find_one({"username": username, "is_test_seed": True})

    if not profile:
        return None

    user = None
    user_id = profile.get("user_id")

    if user_id:
        try:
            from bson import ObjectId

            user = users.find_one({"_id": ObjectId(user_id)})
        except Exception:
            user = users.find_one({"_id": user_id})

    return {
        "author_id": str(user.get("_id")) if user else str(user_id or ""),
        "author": {
            "name": profile["name"],
            "role": "Seeded demo traveler",
            "location": ", ".join(
                part for part in [profile.get("city"), profile.get("country")] if part
            ),
        },
    }


def seed_community_tips():
    tips = get_community_tips_collection()
    now = datetime.utcnow()
    upserted = 0
    skipped = []

    for seed in COMMUNITY_TIP_SEEDS:
        attribution = find_seed_profile(seed["username"])

        if not attribution or not attribution["author_id"]:
            skipped.append(seed["seed_key"])
            continue

        tip_document = {
            "seed_key": seed["seed_key"],
            "country_slug": seed["country_slug"],
            "place_slug": seed["place_slug"],
            "text": seed["text"],
            "category": seed["category"],
            "author_id": attribution["author_id"],
            "author": attribution["author"],
            "moderation_status": "approved",
            "helpful_count": 0,
            "is_test_seed": True,
            "updated_at": now,
        }

        result = tips.update_one(
            {"seed_key": seed["seed_key"]},
            {
                "$set": tip_document,
                "$setOnInsert": {"created_at": now},
            },
            upsert=True,
        )
        upserted += 1 if result.upserted_id is not None or result.modified_count else 0

    print(f"Upserted or refreshed {upserted} seeded community tips")

    if skipped:
        print("Skipped tips because seeded users were not found: " + ", ".join(skipped))


if __name__ == "__main__":
    seed_community_tips()
