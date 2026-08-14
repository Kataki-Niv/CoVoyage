from data._compact_destination import build_compact_destination, place, source, validate_compact_destination


MEXICO_SOURCE = source("Visit Mexico", "https://visitmexico.com/eng/", notes="Official Mexico tourism website.")


def get_mexico_seed_dataset():
    return build_compact_destination(
        slug="mexico", name="Mexico", country_code="MX", region="North America",
        currency_name="Mexican peso", currency_code="MXN", languages=["Spanish", "Indigenous languages", "English used in many visitor areas"],
        timezone="America/Mexico_City", emergency_numbers=["911"],
        travel_styles=["Food", "Culture", "Beaches", "Archaeology", "Cities", "Nature"],
        featured_category="Food and Heritage", journey_title="Mexico City to Oaxaca and Yucatan",
        journey_intro="A route through museums, markets, regional food, ruins, and Caribbean water.",
        overview="Mexico offers major cities, Indigenous and colonial heritage, beaches, archaeological sites, regional cuisine, festivals, deserts, mountains, and dense craft traditions.",
        phrases=[("Hello", "Hola", "oh-lah"), ("Thank you", "Gracias", "grah-syahs"), ("Please", "Por favor", "por fah-vor")],
        source_record=MEXICO_SOURCE, image_url="https://images.unsplash.com/photo-1512813195386-6cf811ad3542?auto=format&fit=crop&w=1800&q=85",
        places=[
            place("mexico-city", "mexico", "Mexico City", "Central Mexico", "Capital, museum, and food city", "Mexico City brings museums, markets, neighborhoods, parks, street food, design, and layered history.", ["Museums", "Street food", "Markets", "Parks", "Architecture"], ["city", "food", "museums", "markets", "culture"], ["Museums", "Food", "Markets", "Walking"], MEXICO_SOURCE, "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?auto=format&fit=crop&w=900&q=84"),
            place("oaxaca", "mexico", "Oaxaca", "Oaxaca", "Food and craft city", "Oaxaca is known for markets, mole, mezcal, textiles, nearby ruins, Indigenous culture, and colorful streets.", ["Food", "Markets", "Mezcal", "Textiles", "Ruins"], ["food", "craft", "markets", "culture", "history"], ["Food", "Markets", "Crafts", "Archaeology"], MEXICO_SOURCE, "https://images.unsplash.com/photo-1585464231875-d9ef1f5ad396?auto=format&fit=crop&w=900&q=84"),
            place("yucatan", "mexico", "Yucatan", "Yucatan Peninsula", "Maya heritage and cenote region", "Yucatan connects Maya ruins, cenotes, colonial towns, local cuisine, beaches, and warm tropical travel.", ["Maya ruins", "Cenotes", "Colonial towns", "Food", "Beaches"], ["archaeology", "nature", "food", "beaches", "culture"], ["Archaeology", "Swimming", "Food", "Road trips"], MEXICO_SOURCE, "https://images.unsplash.com/photo-1512813195386-6cf811ad3542?auto=format&fit=crop&w=900&q=84"),
        ],
        weather_summary="August is warm to hot, with rainy-season showers in many areas and tropical-storm awareness on some coasts.",
        temperature_range="Warm to hot; humid in coastal and tropical regions.",
        rainfall_summary="Rainy-season showers are common in many regions.",
        seasonal_highlights=["Food", "Museums", "Markets", "Cenotes", "Archaeology"],
        seasonal_activities=["Food walks", "Museums", "Markets", "Archaeology", "Swimming"],
        affordability="Mexico offers broad value, from local food and buses to high-demand resort and boutique stays.",
    )


def validate_mexico_seed_dataset():
    return validate_compact_destination(get_mexico_seed_dataset())
