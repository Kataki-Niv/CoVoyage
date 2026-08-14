from data._compact_destination import build_compact_destination, place, source, validate_compact_destination


ITALY_SOURCE = source("Italia.it", "https://www.italia.it/en", notes="Official tourism website for Italy.")


def get_italy_seed_dataset():
    return build_compact_destination(
        slug="italy", name="Italy", country_code="IT", region="Southern Europe",
        currency_name="Euro", currency_code="EUR", languages=["Italian", "English used in many visitor areas"],
        timezone="Europe/Rome", emergency_numbers=["112"],
        travel_styles=["Food", "Art", "History", "Coast", "Architecture", "Slow Travel"],
        featured_category="Food and Heritage", journey_title="Rome, Tuscany, and Amalfi",
        journey_intro="A classic route through ruins, Renaissance towns, markets, and coast.",
        overview="Italy is a deeply regional destination of art cities, Roman ruins, coastal villages, food traditions, wine regions, islands, and mountain landscapes.",
        phrases=[("Hello", "Ciao", "chow"), ("Thank you", "Grazie", "graht-see-eh"), ("Please", "Per favore", "pair fah-voh-reh")],
        source_record=ITALY_SOURCE, image_url="https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1800&q=85",
        places=[
            place("rome", "italy", "Rome", "Lazio", "Ancient capital and food city", "Rome mixes ancient sites, churches, piazzas, trattorias, fountains, and layered neighborhood life.", ["Colosseum", "Piazzas", "Food", "Churches", "Museums"], ["history", "food", "city", "art", "walking"], ["Historic sites", "Food", "Museums", "Walking"], ITALY_SOURCE, "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=900&q=84"),
            place("florence", "italy", "Florence", "Tuscany", "Renaissance art city", "Florence centers on Renaissance art, Duomo views, markets, bridges, Tuscan food, and nearby hill towns.", ["Renaissance art", "Duomo", "Markets", "Tuscan food", "Views"], ["art", "food", "architecture", "culture", "walking"], ["Museums", "Markets", "Food", "Photography"], ITALY_SOURCE, "https://images.unsplash.com/photo-1541370976299-4d24ebbc9077?auto=format&fit=crop&w=900&q=84"),
            place("amalfi-coast", "italy", "Amalfi Coast", "Campania", "Cliffside coastal region", "The Amalfi Coast is known for steep villages, sea views, boats, lemons, coastal roads, and peak-summer demand.", ["Sea views", "Villages", "Boat trips", "Lemons", "Coastal walks"], ["coast", "villages", "food", "summer", "boats"], ["Boat trips", "Walking", "Food", "Photography"], ITALY_SOURCE, "https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?auto=format&fit=crop&w=900&q=84"),
        ],
        weather_summary="August is hot and busy across much of Italy, ideal for evenings, coast, and museums when midday heat is managed.",
        temperature_range="Warm to hot; southern and inland cities can feel very hot.",
        rainfall_summary="Generally summer-dry in many areas, with regional storms possible.",
        seasonal_highlights=["Coast", "Food", "Museums", "Evening walks", "Festivals"],
        seasonal_activities=["Historic sites", "Food markets", "Museums", "Boat trips", "Wine routes"],
        affordability="Peak summer demand can raise prices in art cities and coastal destinations.",
    )


def validate_italy_seed_dataset():
    return validate_compact_destination(get_italy_seed_dataset())
