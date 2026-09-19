from data._compact_destination import (
    build_compact_destination,
    place,
    source,
    validate_compact_destination,
)


ARGENTINA_SOURCE = source(
    "Argentina Travel",
    "https://www.argentina.travel/en",
    notes="Official tourism website for Argentina.",
)


def get_argentina_seed_dataset():
    return build_compact_destination(
        slug="argentina",
        name="Argentina",
        country_code="AR",
        region="South America",
        currency_name="Argentine peso",
        currency_code="ARS",
        languages=["Spanish", "English used in some visitor areas"],
        timezone="America/Argentina/Buenos_Aires",
        emergency_numbers=["911", "100 fire", "101 police", "107 ambulance"],
        travel_styles=["Food", "Wine", "Cities", "Nature", "Road trips", "Culture"],
        featured_category="Food, Wine, and Landscapes",
        journey_title="Buenos Aires to Patagonia Flavor Route",
        journey_intro=(
            "A city-to-nature route through cafes, wine country, lake towns, "
            "waterfalls, and glacier landscapes."
        ),
        overview=(
            "Argentina is built for travelers who want expressive cities, late-night "
            "food culture, wine regions, dramatic mountains, waterfalls, and long "
            "scenic routes."
        ),
        phrases=[
            ("Hello", "Hola", "oh-lah"),
            ("Thank you", "Gracias", "grah-see-ahs"),
            ("Please", "Por favor", "por fah-vor"),
        ],
        source_record=ARGENTINA_SOURCE,
        image_url="https://images.unsplash.com/photo-1589909202802-8f4aadce1849?auto=format&fit=crop&w=1800&q=85",
        places=[
            place(
                "buenos-aires",
                "argentina",
                "Buenos Aires",
                "Buenos Aires",
                "Capital city and cultural hub",
                (
                    "Buenos Aires mixes neighborhood cafes, tango, bookstores, "
                    "steakhouses, street art, parks, and grand architecture."
                ),
                ["Tango", "Cafes", "Architecture", "Markets", "Neighborhood walks"],
                ["city", "food", "culture", "nightlife", "walking"],
                ["Food walks", "Museums", "Markets", "Tango", "Cafe stops"],
                ARGENTINA_SOURCE,
                "https://images.unsplash.com/photo-1612294037637-ec328d0e075e?auto=format&fit=crop&w=900&q=84",
            ),
            place(
                "mendoza",
                "argentina",
                "Mendoza",
                "Cuyo",
                "Wine region and Andes gateway",
                (
                    "Mendoza pairs vineyard lunches, mountain views, plazas, "
                    "bodega visits, and easy access toward the Andes."
                ),
                ["Wine", "Andes views", "Bodega lunches", "Plazas", "Cycling"],
                ["wine", "food", "mountains", "slow-travel", "outdoors"],
                ["Wine routes", "Food", "Cycling", "Mountain drives", "Markets"],
                ARGENTINA_SOURCE,
                "https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=900&q=84",
            ),
            place(
                "bariloche",
                "argentina",
                "Bariloche",
                "Rio Negro",
                "Lake district mountain town",
                (
                    "Bariloche brings alpine-style streets, lakes, chocolate shops, "
                    "viewpoints, hiking access, and scenic drives."
                ),
                ["Lakes", "Hiking", "Chocolate", "Viewpoints", "Scenic drives"],
                ["mountains", "lakes", "hiking", "food", "road-trip"],
                ["Hiking", "Road trips", "Photography", "Food", "Lake walks"],
                ARGENTINA_SOURCE,
                "https://images.unsplash.com/photo-1691712988368-ab9cb6cd6ef3?auto=format&fit=crop&w=900&q=84",
            ),
            place(
                "iguazu-falls",
                "argentina",
                "Iguazu Falls",
                "Misiones",
                "Waterfall and rainforest destination",
                (
                    "Iguazu Falls is a rainforest base for waterfall circuits, "
                    "boardwalks, wildlife sightings, and powerful misty viewpoints."
                ),
                ["Waterfalls", "Rainforest", "Boardwalks", "Wildlife", "Photography"],
                ["nature", "waterfalls", "rainforest", "photography", "walking"],
                ["Walking", "Photography", "Wildlife", "Nature", "Viewpoints"],
                ARGENTINA_SOURCE,
                "https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=900&q=84",
            ),
            place(
                "el-calafate",
                "argentina",
                "El Calafate",
                "Santa Cruz",
                "Patagonia glacier gateway",
                (
                    "El Calafate anchors Patagonia plans with glacier viewpoints, "
                    "boat trips, estancia culture, and big-sky landscapes."
                ),
                ["Glaciers", "Boat trips", "Patagonia", "Estancias", "Wide landscapes"],
                ["patagonia", "nature", "glaciers", "photography", "outdoors"],
                ["Photography", "Boat trips", "Walking", "Nature", "Scenic drives"],
                ARGENTINA_SOURCE,
                "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=84",
            ),
        ],
        weather_summary=(
            "August is late winter, favoring Buenos Aires culture, Mendoza wine "
            "routes, crisp lake scenery, and careful Patagonia planning."
        ),
        temperature_range="Cool to mild in the north and center; cold in Patagonia and mountain areas.",
        rainfall_summary="Regional rainfall varies, with drier patterns around Mendoza and wetter or colder conditions farther south.",
        seasonal_highlights=["Winter culture", "Wine routes", "City food", "Lake scenery", "Waterfalls"],
        seasonal_activities=["Food walks", "Museums", "Wine routes", "Photography", "Scenic drives"],
        affordability=(
            "August can be a value-friendly month outside ski hotspots, while "
            "long-distance travel works best with early logistics."
        ),
    )


def validate_argentina_seed_dataset():
    return validate_compact_destination(get_argentina_seed_dataset())
