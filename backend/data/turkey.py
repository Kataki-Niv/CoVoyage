from data._compact_destination import (
    build_compact_destination,
    place,
    source,
    validate_compact_destination,
)


TURKEY_SOURCE = source(
    "Go Turkiye",
    "https://goturkiye.com/",
    notes="Official tourism website for Turkey.",
)


def get_turkey_seed_dataset():
    return build_compact_destination(
        slug="turkey",
        name="Turkey",
        country_code="TR",
        region="Eastern Mediterranean and Western Asia",
        currency_name="Turkish lira",
        currency_code="TRY",
        languages=["Turkish", "English used in many visitor areas"],
        timezone="Europe/Istanbul",
        emergency_numbers=["112"],
        travel_styles=["Culture", "Food", "History", "Coast", "Markets", "Landscapes"],
        featured_category="Bazaars, Coast, and Ancient Routes",
        journey_title="Istanbul to Cappadocia and Aegean Route",
        journey_intro=(
            "A culture-rich route through bazaars, historic neighborhoods, cave "
            "landscapes, ruins, beaches, and regional food."
        ),
        overview=(
            "Turkey links Ottoman and Byzantine heritage, market culture, coastal "
            "towns, archaeological sites, tea and breakfast rituals, and dramatic "
            "inland landscapes."
        ),
        phrases=[
            ("Hello", "Merhaba", "mehr-hah-bah"),
            ("Thank you", "Tesekkurler", "teh-shek-kur-ler"),
            ("Please", "Lutfen", "loot-fen"),
        ],
        source_record=TURKEY_SOURCE,
        image_url="https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1800&q=85",
        places=[
            place(
                "istanbul",
                "turkey",
                "Istanbul",
                "Marmara",
                "Historic city and Bosphorus hub",
                (
                    "Istanbul layers mosques, palaces, bazaars, ferry rides, "
                    "coffeehouses, food streets, and neighborhood contrasts."
                ),
                ["Bosphorus", "Bazaars", "Mosques", "Ferries", "Food streets"],
                ["city", "history", "food", "markets", "waterfront"],
                ["Food walks", "Markets", "Museums", "Ferry rides", "Walking"],
                TURKEY_SOURCE,
                "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=900&q=84",
            ),
            place(
                "cappadocia",
                "turkey",
                "Cappadocia",
                "Central Anatolia",
                "Rock valleys and cave-town region",
                (
                    "Cappadocia is known for valley walks, cave hotels, open-air "
                    "museums, viewpoints, local wine, and sunrise balloon scenery."
                ),
                ["Valley walks", "Cave hotels", "Open-air museums", "Viewpoints", "Balloon scenery"],
                ["landscapes", "history", "walking", "photography", "slow-travel"],
                ["Walking", "Photography", "Museums", "Food", "Viewpoints"],
                TURKEY_SOURCE,
                "https://images.unsplash.com/photo-1570939274717-7eda259b50ed?auto=format&fit=crop&w=900&q=84",
            ),
            place(
                "antalya-lycian-coast",
                "turkey",
                "Antalya and the Lycian Coast",
                "Mediterranean Turkey",
                "Coastal cities, beaches, and ruins",
                (
                    "Antalya and the Lycian Coast combine old-town lanes, beaches, "
                    "boat days, ancient ruins, mountain views, and relaxed dinners."
                ),
                ["Beaches", "Old town", "Ruins", "Boat days", "Mountain views"],
                ["coast", "history", "food", "beaches", "road-trip"],
                ["Beach time", "Boat trips", "Walking", "Food", "Photography"],
                TURKEY_SOURCE,
                "https://images.unsplash.com/photo-1601972602237-8c79241e468b?auto=format&fit=crop&w=900&q=84",
            ),
            place(
                "izmir-ephesus",
                "turkey",
                "Izmir and Ephesus",
                "Aegean Turkey",
                "Aegean city and archaeological route",
                (
                    "Izmir and Ephesus pair waterfront food culture, bazaars, "
                    "ancient ruins, nearby villages, and easy Aegean day trips."
                ),
                ["Waterfront", "Ancient ruins", "Bazaars", "Villages", "Aegean food"],
                ["history", "food", "coast", "markets", "archaeology"],
                ["Food", "Markets", "Museums", "Walking", "Day trips"],
                TURKEY_SOURCE,
                "https://images.unsplash.com/photo-1607603750909-408e193868c7?auto=format&fit=crop&w=900&q=84",
            ),
            place(
                "pamukkale",
                "turkey",
                "Pamukkale",
                "Denizli",
                "Travertines and ancient spa landscape",
                (
                    "Pamukkale centers on white travertine terraces, Hierapolis, "
                    "thermal-water history, viewpoints, and short regional stays."
                ),
                ["Travertines", "Hierapolis", "Thermal history", "Viewpoints", "Photography"],
                ["landscapes", "history", "photography", "walking", "wellness"],
                ["Walking", "Photography", "Museums", "Wellness", "Viewpoints"],
                TURKEY_SOURCE,
                "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=900&q=84",
            ),
        ],
        weather_summary=(
            "August is hot and busy, strongest for early starts, evening city life, "
            "coastal stays, market food, and carefully paced heritage routes."
        ),
        temperature_range="Hot in many inland and coastal regions; milder at elevation and in evening hours.",
        rainfall_summary="Generally dry in many summer visitor regions, though local conditions vary.",
        seasonal_highlights=["Evening food culture", "Coast", "Bazaars", "Ancient sites", "Sunrise viewpoints"],
        seasonal_activities=["Food walks", "Markets", "Beach time", "Museums", "Boat trips"],
        affordability=(
            "August is peak demand in coastal areas, while city and inland value "
            "improves with early starts and flexible accommodation choices."
        ),
    )


def validate_turkey_seed_dataset():
    return validate_compact_destination(get_turkey_seed_dataset())
