from data._compact_destination import build_compact_destination, place, source, validate_compact_destination


MOROCCO_SOURCE = source("Visit Morocco", "https://www.visitmorocco.com/en", notes="Official website of the Moroccan National Tourism Office.")


def get_morocco_seed_dataset():
    return build_compact_destination(
        slug="morocco", name="Morocco", country_code="MA", region="North Africa",
        currency_name="Moroccan dirham", currency_code="MAD", languages=["Arabic", "Amazigh languages", "French", "English used in some visitor areas"],
        timezone="Africa/Casablanca", emergency_numbers=["19 police", "15 ambulance/fire"],
        travel_styles=["Culture", "Markets", "Desert", "Food", "Architecture", "Coast"],
        featured_category="Markets and Desert", journey_title="Medina Streets to Sahara Edges",
        journey_intro="A route through old cities, craft markets, mountains, and desert gateways.",
        overview="Morocco combines medinas, desert landscapes, mountain villages, Atlantic coast, traditional craft, cuisine, contemporary cities, and strong hospitality culture.",
        phrases=[("Hello", "Salam", "sah-lam"), ("Thank you", "Shukran", "shook-ran"), ("Please", "Afak", "ah-fak")],
        source_record=MOROCCO_SOURCE, image_url="https://images.unsplash.com/photo-1539020140153-e8c237112e53?auto=format&fit=crop&w=1800&q=85",
        places=[
            place("marrakech", "morocco", "Marrakech", "Marrakech-Safi", "Medina and garden city", "Marrakech centers on souks, gardens, palaces, riads, food stalls, hammams, and intense old-city energy.", ["Souks", "Gardens", "Riads", "Palaces", "Food"], ["markets", "culture", "food", "architecture", "city"], ["Markets", "Food", "Gardens", "Hammam"], MOROCCO_SOURCE, "https://images.unsplash.com/photo-1548018560-c7196548e84d?auto=format&fit=crop&w=900&q=84"),
            place("fes", "morocco", "Fes", "Fes-Meknes", "Historic medina and craft city", "Fes is known for its old medina, craft workshops, religious heritage, madrasas, food, and labyrinthine streets.", ["Medina", "Crafts", "Madrasas", "Food", "History"], ["history", "craft", "markets", "food", "culture"], ["Walking", "Craft visits", "Food", "History"], MOROCCO_SOURCE, "https://images.unsplash.com/photo-1549144511-f099e773c147?auto=format&fit=crop&w=900&q=84"),
            place("merzouga", "morocco", "Merzouga", "Drâa-Tafilalet", "Sahara dune gateway", "Merzouga is a desert gateway near Erg Chebbi dunes, camel treks, camps, stars, and Berber culture.", ["Dunes", "Desert camps", "Stars", "Camel treks", "Music"], ["desert", "adventure", "culture", "photography", "nature"], ["Desert camp", "Photography", "Camel trek", "Music"], MOROCCO_SOURCE, "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=900&q=84"),
        ],
        weather_summary="August is very hot inland and in desert regions; coastal and mountain routing can improve comfort.",
        temperature_range="Hot to extremely hot inland and desert areas; milder on some coasts and mountains.",
        rainfall_summary="Generally dry in many visitor regions, with local variation.",
        seasonal_highlights=["Medinas", "Crafts", "Coast", "Desert nights", "Food"],
        seasonal_activities=["Markets", "Food", "Architecture", "Desert camps", "Coastal breaks"],
        affordability="Morocco offers good value, but private transfers, desert camps, and riads vary widely by comfort level.",
    )


def validate_morocco_seed_dataset():
    return validate_compact_destination(get_morocco_seed_dataset())
