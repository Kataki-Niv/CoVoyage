from data._compact_destination import build_compact_destination, place, source, validate_compact_destination


THAILAND_SOURCE = source("Tourism Authority of Thailand", "https://www.tourismthailand.org/", notes="Official Thailand tourism website.")


def get_thailand_seed_dataset():
    return build_compact_destination(
        slug="thailand", name="Thailand", country_code="TH", region="Southeast Asia",
        currency_name="Thai baht", currency_code="THB", languages=["Thai", "English used in many visitor areas"],
        timezone="Asia/Bangkok", emergency_numbers=["191 police", "1669 medical emergency", "1155 tourist police"],
        travel_styles=["Food", "Temples", "Beaches", "Wellness", "Night Markets", "Islands"],
        featured_category="Food and Islands", journey_title="Bangkok Markets to Southern Beaches",
        journey_intro="A warm-season route through temples, street food, northern culture, and island downtime.",
        overview="Thailand combines temples, street food, beaches, islands, wellness, markets, national parks, and warm hospitality across strongly varied regions.",
        phrases=[("Hello", "Sawasdee", "sah-wah-dee"), ("Thank you", "Khob khun", "khop khun"), ("How much?", "Tao rai", "tao rye")],
        source_record=THAILAND_SOURCE, image_url="https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1800&q=85",
        places=[
            place("bangkok", "thailand", "Bangkok", "Central Thailand", "Capital city and food hub", "Bangkok is a high-energy mix of temples, river life, malls, markets, street food, and nightlife.", ["Street food", "Temples", "River", "Markets", "Nightlife"], ["city", "food", "temples", "markets", "nightlife"], ["Food walks", "Temple visits", "Markets", "Boat rides"], THAILAND_SOURCE, "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=900&q=84"),
            place("chiang-mai", "thailand", "Chiang Mai", "Northern Thailand", "Temple and mountain city", "Chiang Mai offers old-city temples, night markets, mountain trips, craft culture, cafes, and slower northern pacing.", ["Temples", "Night markets", "Mountains", "Crafts", "Cafes"], ["temples", "markets", "mountains", "culture", "food"], ["Temple visits", "Markets", "Cooking", "Hiking"], THAILAND_SOURCE, "https://images.unsplash.com/photo-1598970605070-a38a6ccd3a2d?auto=format&fit=crop&w=900&q=84"),
            place("krabi", "thailand", "Krabi", "Southern Thailand", "Limestone coast and island base", "Krabi is known for limestone cliffs, beaches, island trips, kayaking, climbing, and relaxed coastal stays.", ["Beaches", "Limestone cliffs", "Island trips", "Kayaking", "Climbing"], ["beaches", "islands", "nature", "adventure", "coast"], ["Beach time", "Boat trips", "Kayaking", "Climbing"], THAILAND_SOURCE, "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=84"),
        ],
        weather_summary="August is within the rainy season for much of Thailand, with warm humidity, showers, and regional differences between coasts.",
        temperature_range="Warm to hot and humid.",
        rainfall_summary="Rain showers and storms are common; coastal conditions vary by side of the peninsula.",
        seasonal_highlights=["Street food", "Temples", "Wellness", "Green landscapes", "Lower-season value"],
        seasonal_activities=["Food walks", "Markets", "Temple visits", "Wellness", "Boat trips"],
        affordability="Thailand remains strong value, though island and resort pricing varies by coast and demand.",
    )


def validate_thailand_seed_dataset():
    return validate_compact_destination(get_thailand_seed_dataset())
