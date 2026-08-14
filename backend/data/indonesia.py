from data._compact_destination import build_compact_destination, place, source, validate_compact_destination


INDONESIA_SOURCE = source("Wonderful Indonesia", "https://www.indonesia.travel/id/en/home", notes="Official Indonesia tourism website.")


def get_indonesia_seed_dataset():
    return build_compact_destination(
        slug="indonesia", name="Indonesia", country_code="ID", region="Southeast Asia",
        currency_name="Indonesian rupiah", currency_code="IDR", languages=["Indonesian", "Regional languages", "English used in many visitor areas"],
        timezone="Asia/Jakarta", emergency_numbers=["112", "110 police", "118 ambulance"],
        travel_styles=["Islands", "Culture", "Food", "Diving", "Temples", "Nature"],
        featured_category="Islands and Culture", journey_title="Bali, Java, and Komodo Gateway",
        journey_intro="A route through temples, surf, volcanic landscapes, food, and island wildlife.",
        overview="Indonesia spans thousands of islands with beaches, temples, volcanoes, rainforests, coral reefs, regional food, crafts, and highly varied local cultures.",
        phrases=[("Hello", "Halo", "hah-loh"), ("Thank you", "Terima kasih", "teh-ree-mah kah-see"), ("Please", "Tolong", "toh-long")],
        source_record=INDONESIA_SOURCE, image_url="https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1800&q=85",
        places=[
            place("bali", "indonesia", "Bali", "Bali", "Island culture and beach base", "Bali combines temples, rice terraces, surf beaches, wellness, food, craft villages, and strong visitor infrastructure.", ["Temples", "Rice terraces", "Surf", "Wellness", "Food"], ["island", "temples", "beaches", "wellness", "food"], ["Temple visits", "Surfing", "Food", "Wellness"], INDONESIA_SOURCE, "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=900&q=84"),
            place("yogyakarta", "indonesia", "Yogyakarta", "Java", "Culture and temple gateway", "Yogyakarta is a cultural hub for batik, royal heritage, street food, art, and access to Borobudur and Prambanan.", ["Borobudur access", "Batik", "Street food", "Palace", "Arts"], ["culture", "temples", "food", "craft", "history"], ["Temples", "Food", "Crafts", "Museums"], INDONESIA_SOURCE, "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=900&q=84"),
            place("labuan-bajo", "indonesia", "Labuan Bajo", "East Nusa Tenggara", "Komodo gateway and island harbor", "Labuan Bajo is the gateway for Komodo National Park trips, boat journeys, diving, islands, and sunset harbor stays.", ["Komodo gateway", "Boat trips", "Diving", "Islands", "Sunsets"], ["islands", "diving", "wildlife", "boats", "adventure"], ["Boat trips", "Diving", "Photography", "Island hopping"], INDONESIA_SOURCE, "https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?auto=format&fit=crop&w=900&q=84"),
        ],
        weather_summary="August is a strong dry-season month for Bali, Java, and many eastern island routes, with warm weather and high visitor demand.",
        temperature_range="Warm to hot and often humid.",
        rainfall_summary="Drier in many southern/eastern visitor regions, though Indonesia varies by island.",
        seasonal_highlights=["Dry-season islands", "Temples", "Diving", "Food", "Volcano views"],
        seasonal_activities=["Temple visits", "Surfing", "Diving", "Food", "Boat trips"],
        affordability="Indonesia can be strong value, but Bali and Komodo-area tours can rise in peak dry season.",
    )


def validate_indonesia_seed_dataset():
    return validate_compact_destination(get_indonesia_seed_dataset())
