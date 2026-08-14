from data._compact_destination import build_compact_destination, place, source, validate_compact_destination


PERU_SOURCE = source("Peru Travel", "https://www.peru.travel/en", notes="Official tourism website for Peru.")


def get_peru_seed_dataset():
    return build_compact_destination(
        slug="peru", name="Peru", country_code="PE", region="South America",
        currency_name="Peruvian sol", currency_code="PEN", languages=["Spanish", "Quechua", "Aymara", "English used in some visitor areas"],
        timezone="America/Lima", emergency_numbers=["105 police", "116 fire", "106 medical"],
        travel_styles=["Archaeology", "Food", "Mountains", "Culture", "Nature", "Trekking"],
        featured_category="Andes and Food", journey_title="Lima to Cusco and the Sacred Valley",
        journey_intro="A route through coastal food, Andean heritage, markets, and mountain sites.",
        overview="Peru brings together Andean archaeology, Amazon and desert landscapes, Lima's food scene, Indigenous culture, colonial cities, and high-altitude trekking.",
        phrases=[("Hello", "Hola", "oh-lah"), ("Thank you", "Gracias", "grah-syahs"), ("How much?", "Cuanto cuesta", "kwan-toh kwes-tah")],
        source_record=PERU_SOURCE, image_url="https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=1800&q=85",
        places=[
            place("lima", "peru", "Lima", "Lima Region", "Coastal capital and food city", "Lima combines Pacific cliffs, museums, historic plazas, neighborhoods, seafood, and one of Latin America's strongest food scenes.", ["Food", "Museums", "Pacific cliffs", "Historic center", "Neighborhoods"], ["food", "city", "coast", "museums", "culture"], ["Food", "Museums", "Walking", "Coastal views"], PERU_SOURCE, "https://images.unsplash.com/photo-1531968455001-5c5272a41129?auto=format&fit=crop&w=900&q=84"),
            place("cusco", "peru", "Cusco", "Cusco Region", "Andean heritage city", "Cusco is a high-altitude base for Inca heritage, colonial streets, markets, nearby ruins, and Sacred Valley routes.", ["Inca heritage", "Markets", "Colonial streets", "Ruins", "Sacred Valley"], ["archaeology", "culture", "mountains", "markets", "history"], ["Archaeology", "Markets", "Walking", "Day trips"], PERU_SOURCE, "https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=900&q=84"),
            place("arequipa", "peru", "Arequipa", "Arequipa Region", "Volcano-framed colonial city", "Arequipa offers white-stone architecture, regional food, volcano views, monasteries, and access toward Colca Canyon.", ["Architecture", "Food", "Volcano views", "Monastery", "Colca access"], ["food", "architecture", "volcanoes", "culture", "city"], ["Food", "Walking", "Museums", "Canyon trips"], PERU_SOURCE, "https://images.unsplash.com/photo-1587595431973-160d0d94add1?auto=format&fit=crop&w=900&q=84"),
        ],
        weather_summary="August is dry season in much of the Andes, useful for Cusco and trekking, while Lima is often cool and cloudy.",
        temperature_range="Cool in highlands, mild on the coast, with cold nights at altitude.",
        rainfall_summary="Drier in the Andes; coastal Lima can be cloudy with little rain.",
        seasonal_highlights=["Andean ruins", "Trekking", "Food", "Markets", "Mountain views"],
        seasonal_activities=["Archaeology", "Food", "Trekking", "Markets", "Museums"],
        affordability="Peru can be strong value, but permits, trains, and high-demand sites need early planning.",
    )


def validate_peru_seed_dataset():
    return validate_compact_destination(get_peru_seed_dataset())
