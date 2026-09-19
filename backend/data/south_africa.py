from data._compact_destination import (
    build_compact_destination,
    place,
    source,
    validate_compact_destination,
)


SOUTH_AFRICA_SOURCE = source(
    "South African Tourism",
    "https://www.southafrica.net/",
    notes="Official tourism website for South Africa.",
)


def get_south_africa_seed_dataset():
    return build_compact_destination(
        slug="south-africa",
        name="South Africa",
        country_code="ZA",
        region="Southern Africa",
        currency_name="South African rand",
        currency_code="ZAR",
        languages=[
            "English",
            "Zulu",
            "Xhosa",
            "Afrikaans",
            "Multiple other official languages",
        ],
        timezone="Africa/Johannesburg",
        emergency_numbers=["112 mobile emergency", "10111 police", "10177 ambulance"],
        travel_styles=["Wildlife", "Food", "Coast", "Wine", "Cities", "Road trips"],
        featured_category="Wildlife, Coast, and Wine",
        journey_title="Cape Town, Winelands, and Safari Route",
        journey_intro=(
            "A varied route through mountain-backed city life, vineyard towns, "
            "coastal drives, safari landscapes, and contemporary culture."
        ),
        overview=(
            "South Africa combines wildlife viewing, coastlines, wine regions, "
            "urban culture, road trips, and layered history in one high-variety trip."
        ),
        phrases=[
            ("Hello", "Hello", "heh-loh"),
            ("Thank you", "Thank you", "thank you"),
            ("Please", "Please", "pleez"),
        ],
        source_record=SOUTH_AFRICA_SOURCE,
        image_url="https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=1800&q=85",
        places=[
            place(
                "cape-town",
                "south-africa",
                "Cape Town",
                "Western Cape",
                "Coastal city and mountain hub",
                (
                    "Cape Town blends Table Mountain, beaches, design, food markets, "
                    "museums, and day trips around the peninsula."
                ),
                ["Table Mountain", "Beaches", "Food markets", "Museums", "Coastal drives"],
                ["city", "coast", "food", "mountains", "culture"],
                ["Walking", "Food", "Museums", "Coastal drives", "Photography"],
                SOUTH_AFRICA_SOURCE,
                "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=900&q=84",
            ),
            place(
                "kruger-national-park",
                "south-africa",
                "Kruger National Park",
                "Limpopo and Mpumalanga",
                "Safari and wildlife region",
                (
                    "Kruger is a major safari anchor for wildlife drives, bush "
                    "lodges, birding, guided walks, and early-morning game viewing."
                ),
                ["Safari", "Wildlife", "Birding", "Guided drives", "Bush lodges"],
                ["wildlife", "safari", "nature", "photography", "outdoors"],
                ["Wildlife drives", "Photography", "Nature", "Birding", "Guided walks"],
                SOUTH_AFRICA_SOURCE,
                "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=900&q=84",
            ),
            place(
                "garden-route",
                "south-africa",
                "Garden Route",
                "Western Cape and Eastern Cape",
                "Coastal road-trip corridor",
                (
                    "The Garden Route links forests, beaches, lagoons, small towns, "
                    "marine wildlife, and scenic driving days."
                ),
                ["Coastal drives", "Forests", "Beaches", "Lagoons", "Small towns"],
                ["road-trip", "coast", "nature", "walking", "wildlife"],
                ["Road trips", "Coastal walks", "Photography", "Markets", "Nature"],
                SOUTH_AFRICA_SOURCE,
                "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=84",
            ),
            place(
                "stellenbosch-winelands",
                "south-africa",
                "Stellenbosch Winelands",
                "Western Cape",
                "Wine towns and food region",
                (
                    "Stellenbosch offers vineyard estates, Cape Dutch streets, "
                    "restaurant-led day trips, mountain views, and slow lunches."
                ),
                ["Wine estates", "Cape Dutch streets", "Restaurants", "Mountain views", "Markets"],
                ["wine", "food", "heritage", "slow-travel", "mountains"],
                ["Wine routes", "Food", "Markets", "Photography", "Walking"],
                SOUTH_AFRICA_SOURCE,
                "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=900&q=84",
            ),
            place(
                "johannesburg",
                "south-africa",
                "Johannesburg",
                "Gauteng",
                "History, art, and urban culture hub",
                (
                    "Johannesburg adds museums, galleries, design districts, "
                    "neighborhood restaurants, and important contemporary history."
                ),
                ["Museums", "Galleries", "Design districts", "Restaurants", "History"],
                ["city", "history", "art", "food", "culture"],
                ["Museums", "Food", "Galleries", "Markets", "City walks"],
                SOUTH_AFRICA_SOURCE,
                "https://images.unsplash.com/photo-1577948000111-9c970dfe3743?auto=format&fit=crop&w=900&q=84",
            ),
        ],
        weather_summary=(
            "August is late winter and early spring, with strong safari visibility "
            "in drier northern parks and crisp, changeable weather around the Cape."
        ),
        temperature_range="Mild to warm in many interior areas; cooler and wetter in parts of the Western Cape.",
        rainfall_summary="Northern safari regions are often drier, while Cape routes can see winter rain.",
        seasonal_highlights=["Safari visibility", "Wine regions", "Coastal drives", "City culture", "Lower crowds"],
        seasonal_activities=["Wildlife drives", "Food", "Wine routes", "Museums", "Road trips"],
        affordability=(
            "August can offer good value before peak summer demand, especially "
            "when safari and city logistics are booked ahead."
        ),
    )


def validate_south_africa_seed_dataset():
    return validate_compact_destination(get_south_africa_seed_dataset())
