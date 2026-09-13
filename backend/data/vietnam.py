from data._compact_destination import (
    build_compact_destination,
    place,
    source,
    validate_compact_destination,
)


VIETNAM_SOURCE = source(
    "Vietnam Travel",
    "https://vietnam.travel/",
    notes="Official tourism website for Vietnam.",
)


def get_vietnam_seed_dataset():
    return build_compact_destination(
        slug="vietnam",
        name="Vietnam",
        country_code="VN",
        region="Southeast Asia",
        currency_name="Vietnamese dong",
        currency_code="VND",
        languages=["Vietnamese", "English used in many visitor areas"],
        timezone="Asia/Ho_Chi_Minh",
        emergency_numbers=["113 police", "114 fire", "115 ambulance"],
        travel_styles=["Food", "Culture", "Cities", "Coast", "Nature", "Markets"],
        featured_category="Street Food, Heritage, and Coast",
        journey_title="Hanoi to Central Coast Flavor Route",
        journey_intro=(
            "A north-to-central route through old quarters, limestone landscapes, "
            "heritage towns, beaches, markets, and cafe culture."
        ),
        overview=(
            "Vietnam rewards travelers with street food, layered cities, river "
            "towns, coastal stays, limestone scenery, motorbike energy, and "
            "deep regional flavor."
        ),
        phrases=[
            ("Hello", "Xin chao", "sin chow"),
            ("Thank you", "Cam on", "gahm uhn"),
            ("Please", "Lam on", "lahm uhn"),
        ],
        source_record=VIETNAM_SOURCE,
        image_url="https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1800&q=85",
        places=[
            place(
                "hanoi",
                "vietnam",
                "Hanoi",
                "Red River Delta",
                "Capital city and food hub",
                (
                    "Hanoi layers old-quarter lanes, lakes, temples, cafes, "
                    "markets, museums, and some of the country's best everyday food."
                ),
                ["Old Quarter", "Street food", "Cafes", "Lakes", "Museums"],
                ["city", "food", "culture", "markets", "walking"],
                ["Food walks", "Cafe stops", "Museums", "Markets", "Walking"],
                VIETNAM_SOURCE,
                "https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?auto=format&fit=crop&w=900&q=84",
            ),
            place(
                "hoi-an-da-nang",
                "vietnam",
                "Hoi An and Da Nang",
                "Central Vietnam",
                "Heritage town and coastal base",
                (
                    "Hoi An and Da Nang combine lantern-lit streets, beaches, "
                    "markets, tailoring, regional dishes, and easy coastal pacing."
                ),
                ["Lantern streets", "Beaches", "Markets", "Tailoring", "Regional food"],
                ["heritage", "coast", "food", "markets", "slow-travel"],
                ["Food", "Beach time", "Markets", "Walking", "Photography"],
                VIETNAM_SOURCE,
                "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=900&q=84",
            ),
            place(
                "ho-chi-minh-city",
                "vietnam",
                "Ho Chi Minh City",
                "Southern Vietnam",
                "Urban food, history, and nightlife hub",
                (
                    "Ho Chi Minh City brings energetic food streets, coffee shops, "
                    "markets, museums, rooftop views, and contemporary city life."
                ),
                ["Food streets", "Markets", "Museums", "Coffee", "Nightlife"],
                ["city", "food", "history", "nightlife", "markets"],
                ["Food walks", "Museums", "Markets", "Cafe stops", "City walks"],
                VIETNAM_SOURCE,
                "https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=900&q=84",
            ),
            place(
                "ninh-binh",
                "vietnam",
                "Ninh Binh",
                "Northern Vietnam",
                "Limestone landscapes and river routes",
                (
                    "Ninh Binh is known for karst scenery, river boat trips, "
                    "pagodas, rice fields, viewpoints, and slower countryside days."
                ),
                ["Karst scenery", "Boat trips", "Pagodas", "Rice fields", "Viewpoints"],
                ["nature", "culture", "photography", "rivers", "slow-travel"],
                ["Boat trips", "Photography", "Temples", "Cycling", "Walking"],
                VIETNAM_SOURCE,
                "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=900&q=84",
            ),
            place(
                "ha-long-bay",
                "vietnam",
                "Ha Long Bay",
                "Quang Ninh",
                "Bay and limestone-island seascape",
                (
                    "Ha Long Bay centers on limestone islands, boat routes, caves, "
                    "kayaking, seafood meals, and water-level viewpoints."
                ),
                ["Limestone islands", "Boat routes", "Caves", "Kayaking", "Seafood"],
                ["coast", "nature", "boats", "photography", "seafood"],
                ["Boat trips", "Kayaking", "Photography", "Food", "Caves"],
                VIETNAM_SOURCE,
                "https://images.unsplash.com/photo-1504457047772-27faf1c00561?auto=format&fit=crop&w=900&q=84",
            ),
        ],
        weather_summary=(
            "August can be hot and rainy in many regions, so Vietnam works best "
            "with flexible city, food, heritage, and coast plans."
        ),
        temperature_range="Hot and humid in much of the country, with regional mountain and coastal variation.",
        rainfall_summary="Rain is common in many areas, so build in buffers and watch local forecasts.",
        seasonal_highlights=["Street food", "Markets", "Coastal breaks", "Cafe culture", "Heritage towns"],
        seasonal_activities=["Food walks", "Markets", "Museums", "Cafe stops", "Boat trips"],
        affordability=(
            "Vietnam can be strong value year-round, with August value helped by "
            "flexible routing and weather-aware bookings."
        ),
    )


def validate_vietnam_seed_dataset():
    return validate_compact_destination(get_vietnam_seed_dataset())
