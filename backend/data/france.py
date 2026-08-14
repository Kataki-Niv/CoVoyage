from data._compact_destination import build_compact_destination, place, source, validate_compact_destination


FRANCE_SOURCE = source("France.fr", "https://www.france.fr/en/", notes="Official tourism board website for France.")


def get_france_seed_dataset():
    return build_compact_destination(
        slug="france", name="France", country_code="FR", region="Western Europe",
        currency_name="Euro", currency_code="EUR", languages=["French", "English used in many visitor areas"],
        timezone="Europe/Paris", emergency_numbers=["112", "15 ambulance", "17 police", "18 fire"],
        travel_styles=["Culture", "Food", "Art", "Wine", "Cities", "Coast"],
        featured_category="Art, Food, and Regions", journey_title="Paris to Provence Summer Route",
        journey_intro="A city-to-region route through museums, markets, vineyards, and Mediterranean light.",
        overview="France combines world-class museums, regional food, wine routes, villages, coastlines, mountains, and strong local identities.",
        phrases=[("Hello", "Bonjour", "bon-zhoor"), ("Thank you", "Merci", "mehr-see"), ("Please", "S'il vous plait", "seel voo pleh")],
        source_record=FRANCE_SOURCE, image_url="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1800&q=85",
        places=[
            place("paris", "france", "Paris", "Ile-de-France", "Capital city and museum hub", "Paris layers museums, cafes, river walks, architecture, fashion, neighborhoods, and major monuments.", ["Museums", "Cafes", "Architecture", "River walks", "Shopping"], ["city", "art", "food", "architecture", "walking"], ["Museums", "Cafe stops", "Walking", "Shopping"], FRANCE_SOURCE, "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=84"),
            place("provence", "france", "Provence", "Southeastern France", "Village, food, and landscape region", "Provence brings markets, hill towns, lavender country, Roman heritage, wine, and warm summer evenings.", ["Markets", "Villages", "Lavender", "Wine", "Roman sites"], ["villages", "food", "wine", "summer", "culture"], ["Markets", "Wine", "Village walks", "Photography"], FRANCE_SOURCE, "https://images.unsplash.com/photo-1499002238440-d264edd596ec?auto=format&fit=crop&w=900&q=84"),
            place("french-riviera", "france", "French Riviera", "Cote d'Azur", "Mediterranean coast", "The Riviera connects Nice, coastal towns, beaches, art museums, hill villages, and summer seaside energy.", ["Beaches", "Nice", "Art", "Coastal towns", "Sea views"], ["coast", "beaches", "art", "food", "summer"], ["Beach time", "Museums", "Coastal walks", "Food"], FRANCE_SOURCE, "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=900&q=84"),
        ],
        weather_summary="August is peak summer, with warm to hot weather, busy cities and coasts, and strong outdoor dining and festival energy.",
        temperature_range="Warm to hot, especially inland and in the south.",
        rainfall_summary="Generally drier in Mediterranean areas, with regional storms possible.",
        seasonal_highlights=["Outdoor dining", "Museums", "Coast", "Markets", "Summer events"],
        seasonal_activities=["Museums", "Markets", "Beach time", "Wine routes", "City walks"],
        affordability="August is high season in Paris and coastal regions, so early booking improves value.",
    )


def validate_france_seed_dataset():
    return validate_compact_destination(get_france_seed_dataset())
