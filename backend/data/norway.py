from data._compact_destination import (
    build_compact_destination,
    place,
    source,
    validate_compact_destination,
)


NORWAY_SOURCE = source(
    "Visit Norway",
    "https://www.visitnorway.com/",
    notes="Official tourism website for Norway.",
)


def get_norway_seed_dataset():
    return build_compact_destination(
        slug="norway",
        name="Norway",
        country_code="NO",
        region="Northern Europe",
        currency_name="Norwegian krone",
        currency_code="NOK",
        languages=["Norwegian", "English widely used in visitor areas"],
        timezone="Europe/Oslo",
        emergency_numbers=["112 police", "110 fire", "113 ambulance"],
        travel_styles=["Nature", "Fjords", "Road trips", "Hiking", "Cities", "Food"],
        featured_category="Fjords, Design, and Long Days",
        journey_title="Oslo to Fjords and Arctic Light Route",
        journey_intro=(
            "A north-leaning route through waterfront cities, fjord scenery, "
            "island roads, mountain viewpoints, and long summer evenings."
        ),
        overview=(
            "Norway is ideal for travelers who want clean city design, fjords, "
            "rail and road scenery, hiking access, coastal towns, and northern light."
        ),
        phrases=[
            ("Hello", "Hei", "hi"),
            ("Thank you", "Takk", "tahk"),
            ("Please", "Vaer sa snill", "var saw snill"),
        ],
        source_record=NORWAY_SOURCE,
        image_url="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=85",
        places=[
            place(
                "oslo",
                "norway",
                "Oslo",
                "Eastern Norway",
                "Capital city and waterfront design hub",
                (
                    "Oslo combines museums, saunas, islands, architecture, parks, "
                    "coffee, and an easy waterfront travel rhythm."
                ),
                ["Museums", "Waterfront", "Saunas", "Architecture", "Islands"],
                ["city", "design", "museums", "food", "waterfront"],
                ["Museums", "Food", "Walking", "Island hops", "Saunas"],
                NORWAY_SOURCE,
                "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?auto=format&fit=crop&w=900&q=84",
            ),
            place(
                "bergen-fjords",
                "norway",
                "Bergen and the Fjords",
                "Western Norway",
                "Fjord gateway and historic harbor",
                (
                    "Bergen anchors fjord trips with a historic harbor, mountain "
                    "viewpoints, seafood, rain-ready museums, and boat routes."
                ),
                ["Fjords", "Historic harbor", "Seafood", "Viewpoints", "Boat routes"],
                ["fjords", "coast", "food", "heritage", "photography"],
                ["Boat trips", "Photography", "Food", "Museums", "Walking"],
                NORWAY_SOURCE,
                "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=900&q=84",
            ),
            place(
                "tromso",
                "norway",
                "Tromso",
                "Northern Norway",
                "Arctic city and northern gateway",
                (
                    "Tromso offers Arctic city culture, cable-car views, island "
                    "drives, seafood, museums, and seasonal light experiences."
                ),
                ["Arctic city", "Cable-car views", "Seafood", "Island drives", "Museums"],
                ["arctic", "city", "nature", "food", "photography"],
                ["Photography", "Museums", "Food", "Road trips", "Viewpoints"],
                NORWAY_SOURCE,
                "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=900&q=84",
            ),
            place(
                "lofoten",
                "norway",
                "Lofoten",
                "Nordland",
                "Island roads and dramatic coast",
                (
                    "Lofoten is made for fishing villages, mountain-backed beaches, "
                    "hiking, viewpoints, kayaking, and slow island drives."
                ),
                ["Fishing villages", "Beaches", "Hiking", "Viewpoints", "Island roads"],
                ["islands", "coast", "hiking", "photography", "road-trip"],
                ["Hiking", "Road trips", "Photography", "Kayaking", "Food"],
                NORWAY_SOURCE,
                "https://images.unsplash.com/photo-1507272931001-fc06c17e4f43?auto=format&fit=crop&w=900&q=84",
            ),
            place(
                "trondheim",
                "norway",
                "Trondheim",
                "Trondelag",
                "Historic university city",
                (
                    "Trondheim adds timber neighborhoods, cathedral history, local "
                    "food, cycling culture, river walks, and a relaxed city pace."
                ),
                ["Cathedral", "River walks", "Timber streets", "Local food", "Cycling"],
                ["city", "history", "food", "walking", "cycling"],
                ["Walking", "Food", "Museums", "Cycling", "Markets"],
                NORWAY_SOURCE,
                "https://images.unsplash.com/photo-1601823984263-b87b59798b70?auto=format&fit=crop&w=900&q=84",
            ),
        ],
        weather_summary=(
            "August is one of Norway's strongest outdoor months, with long "
            "daylight, fjord access, hiking routes, island drives, and busy demand."
        ),
        temperature_range="Mild in cities and fjord areas; cooler in mountains and northern coastal regions.",
        rainfall_summary="Rain can arrive quickly on the coast and in mountain areas, so layers and backup plans matter.",
        seasonal_highlights=["Long daylight", "Fjord access", "Hiking", "Island drives", "Outdoor dining"],
        seasonal_activities=["Hiking", "Road trips", "Boat trips", "Photography", "Food"],
        affordability=(
            "August is high demand in Norway, so value depends on early booking, "
            "rail passes, cabins, and flexible route choices."
        ),
    )


def validate_norway_seed_dataset():
    return validate_compact_destination(get_norway_seed_dataset())
