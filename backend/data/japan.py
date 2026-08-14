from data._compact_destination import (
    build_compact_destination,
    place,
    source,
    validate_compact_destination,
)


JAPAN_SOURCE = source(
    "Japan National Tourism Organization",
    "https://www.japan.travel/en/",
    notes="Official Japan travel guide from JNTO.",
)


def get_japan_seed_dataset():
    return build_compact_destination(
        slug="japan",
        name="Japan",
        country_code="JP",
        region="East Asia",
        currency_name="Japanese yen",
        currency_code="JPY",
        languages=["Japanese", "English used in many visitor areas"],
        timezone="Asia/Tokyo",
        emergency_numbers=["110 police", "119 fire and ambulance"],
        travel_styles=["Culture", "Food", "Temples", "Cities", "Nature", "Rail"],
        featured_category="Culture and Food",
        journey_title="Tokyo Energy to Kyoto Ritual",
        journey_intro="A route through city food, temple districts, trains, and summer festivals.",
        overview="Japan blends dense cities, refined food culture, temples, gardens, mountain landscapes, islands, festivals, and one of the world's most useful rail networks.",
        phrases=[("Hello", "Konnichiwa", "kon-nee-chee-wah"), ("Thank you", "Arigato", "ah-ree-gah-toh"), ("Excuse me", "Sumimasen", "soo-mee-mah-sen")],
        source_record=JAPAN_SOURCE,
        image_url="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1800&q=85",
        places=[
            place("tokyo", "japan", "Tokyo", "Kanto", "Megacity and food capital", "Tokyo moves between neon neighborhoods, quiet shrines, design shops, museums, tiny bars, and precise transit.", ["Neighborhoods", "Food", "Museums", "Shopping", "Nightlife"], ["city", "food", "design", "nightlife", "rail"], ["Food walks", "Museums", "Shopping", "Neighborhood exploring"], JAPAN_SOURCE, "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=900&q=84"),
            place("kyoto", "japan", "Kyoto", "Kansai", "Temple and garden city", "Kyoto is known for temples, gardens, traditional streets, seasonal food, craft culture, and nearby mountain walks.", ["Temples", "Gardens", "Tea culture", "Crafts", "Old streets"], ["temples", "gardens", "culture", "food", "walking"], ["Temple visits", "Gardens", "Tea", "Walking"], JAPAN_SOURCE, "https://images.unsplash.com/photo-1493780474015-ba834fd0ce2f?auto=format&fit=crop&w=900&q=84"),
            place("hokkaido", "japan", "Hokkaido", "Northern Japan", "Nature and summer escape", "Hokkaido offers cooler summer air, national parks, flower fields, seafood, lakes, and open-road scenery.", ["Cooler summer", "National parks", "Seafood", "Flower fields", "Road trips"], ["nature", "food", "summer", "road-trip", "parks"], ["Hiking", "Food", "Photography", "Road trips"], JAPAN_SOURCE, "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=900&q=84"),
        ],
        weather_summary="August is hot and humid in much of Japan, with summer festivals, mountain escapes, and cooler northern options such as Hokkaido.",
        temperature_range="Hot and humid in many cities; cooler in northern and mountain regions.",
        rainfall_summary="Summer showers, storms, and typhoon-season awareness can affect plans.",
        seasonal_highlights=["Summer festivals", "Food", "Mountain escapes", "Hokkaido nature", "Evening city life"],
        seasonal_activities=["Food walks", "Festivals", "Temples", "Museums", "Hiking", "Rail travel"],
        affordability="Japan offers broad budget range, from convenience-store meals and rail passes to high-demand summer hotels.",
    )


def validate_japan_seed_dataset():
    return validate_compact_destination(get_japan_seed_dataset())
