from typing import Final


INTEREST_TAG_CATEGORIES: Final[dict[str, tuple[str, ...]]] = {
    "Adventure": (
        "Backpacking",
        "Hiking",
        "Trekking",
        "Camping",
        "Road Trips",
        "Solo Travel",
        "Group Travel",
        "Offbeat Destinations",
        "Wildlife Safaris",
        "Scuba Diving",
    ),
    "Nature": (
        "Beaches",
        "Mountains",
        "National Parks",
        "Forests",
        "Deserts",
        "Lakes",
        "Waterfalls",
        "Stargazing",
        "Eco Travel",
        "Photography",
    ),
    "Food And Culture": (
        "Local Food",
        "Street Food",
        "Fine Dining",
        "Coffee Culture",
        "Wine Tasting",
        "Museums",
        "Historical Sites",
        "Architecture",
        "Festivals",
        "Cultural Immersion",
    ),
    "Lifestyle": (
        "Luxury Travel",
        "Budget Travel",
        "Wellness Retreats",
        "Yoga",
        "Spa Experiences",
        "Shopping",
        "Nightlife",
        "Digital Nomad Travel",
        "Slow Travel",
        "Volunteer Travel",
    ),
    "Sports And Activities": (
        "Skiing",
        "Snowboarding",
        "Surfing",
        "Cycling",
        "Kayaking",
        "Rafting",
        "Rock Climbing",
        "Running",
        "Golf",
        "Sailing",
    ),
    "Travel Preferences": (
        "Family Travel",
        "Couples Travel",
        "Pet-Friendly Travel",
        "Train Journeys",
        "Cruises",
        "Island Hopping",
        "Weekend Getaways",
        "Workations",
        "Hidden Gems",
        "UNESCO Sites",
    ),
}

INTEREST_TAGS: Final[list[str]] = [
    tag
    for tags in INTEREST_TAG_CATEGORIES.values()
    for tag in tags
]
