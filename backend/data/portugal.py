from data._compact_destination import build_compact_destination, place, source, validate_compact_destination


PORTUGAL_SOURCE = source("Visit Portugal", "https://www.visitportugal.com/en", notes="Official website for Portugal as a tourist destination.")


def get_portugal_seed_dataset():
    return build_compact_destination(
        slug="portugal", name="Portugal", country_code="PT", region="Western Europe",
        currency_name="Euro", currency_code="EUR", languages=["Portuguese", "English used in many visitor areas"],
        timezone="Europe/Lisbon", emergency_numbers=["112"],
        travel_styles=["Food", "Coast", "Cities", "Wine", "Surf", "Slow Travel"],
        featured_category="Coast and Cities", journey_title="Lisbon, Porto, and the Algarve",
        journey_intro="A compact route through tiled streets, river views, wine culture, and beaches.",
        overview="Portugal combines Atlantic coast, historic cities, wine regions, surf towns, seafood, azulejo tiles, islands, and approachable travel distances.",
        phrases=[("Hello", "Ola", "oh-lah"), ("Thank you", "Obrigado", "oh-bree-gah-doo"), ("Please", "Por favor", "poor fah-vor")],
        source_record=PORTUGAL_SOURCE, image_url="https://images.unsplash.com/photo-1513735492246-483525079686?auto=format&fit=crop&w=1800&q=85",
        places=[
            place("lisbon", "portugal", "Lisbon", "Lisbon Region", "Capital city and food base", "Lisbon is built around hills, viewpoints, trams, tiled streets, seafood, nightlife, and easy day trips.", ["Viewpoints", "Trams", "Seafood", "Tiles", "Nightlife"], ["city", "food", "views", "history", "walking"], ["Food", "Walking", "Museums", "Day trips"], PORTUGAL_SOURCE, "https://images.unsplash.com/photo-1513735492246-483525079686?auto=format&fit=crop&w=900&q=84"),
            place("porto", "portugal", "Porto", "North Portugal", "River city and wine gateway", "Porto brings Douro river views, port wine cellars, tiled churches, markets, bridges, and northern food.", ["Douro River", "Wine", "Tiles", "Bridges", "Food"], ["wine", "river", "food", "architecture", "city"], ["Wine tasting", "Walking", "Food", "River views"], PORTUGAL_SOURCE, "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=900&q=84"),
            place("algarve", "portugal", "Algarve", "Southern Portugal", "Beach and cliff coast", "The Algarve is known for cliffs, coves, beaches, seafood towns, boat caves, and summer coastal stays.", ["Beaches", "Cliffs", "Sea caves", "Seafood", "Coastal towns"], ["beaches", "coast", "food", "summer", "boats"], ["Beach time", "Boat trips", "Food", "Walking"], PORTUGAL_SOURCE, "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=84"),
        ],
        weather_summary="August is warm, dry, and busy in much of Portugal, especially Lisbon, Porto, and the Algarve coast.",
        temperature_range="Warm to hot, moderated by Atlantic breezes in some coastal areas.",
        rainfall_summary="Generally dry summer conditions, with regional variation.",
        seasonal_highlights=["Beaches", "Seafood", "Wine", "City walks", "Surf"],
        seasonal_activities=["Beach time", "Food", "Wine", "Walking", "Boat trips"],
        affordability="Portugal can be good value, but August coastal demand raises prices in popular beach areas.",
    )


def validate_portugal_seed_dataset():
    return validate_compact_destination(get_portugal_seed_dataset())
