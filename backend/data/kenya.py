from data._compact_destination import build_compact_destination, place, source, validate_compact_destination


KENYA_SOURCE = source("Tour Kenya", "https://tourkenya.go.ke/", notes="Kenya National Tourism Service Portal.")


def get_kenya_seed_dataset():
    return build_compact_destination(
        slug="kenya", name="Kenya", country_code="KE", region="East Africa",
        currency_name="Kenyan shilling", currency_code="KES", languages=["Swahili", "English"],
        timezone="Africa/Nairobi", emergency_numbers=["999", "112", "911"],
        travel_styles=["Safari", "Wildlife", "Culture", "Coast", "Nature", "Adventure"],
        featured_category="Wildlife and Coast", journey_title="Nairobi to Maasai Mara and Coast",
        journey_intro="A route through city culture, classic safari landscapes, and Indian Ocean beaches.",
        overview="Kenya is known for wildlife safaris, national parks, Maasai and coastal cultures, mountain landscapes, Great Rift Valley scenery, beaches, and urban energy.",
        phrases=[("Hello", "Jambo", "jahm-boh"), ("Thank you", "Asante", "ah-sahn-teh"), ("Please", "Tafadhali", "tah-fah-dhah-lee")],
        source_record=KENYA_SOURCE, image_url="https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1800&q=85",
        places=[
            place("nairobi", "kenya", "Nairobi", "Nairobi County", "Capital and safari gateway", "Nairobi combines restaurants, museums, markets, national-park access, conservation sites, and a practical arrival base.", ["Food", "Museums", "National park", "Markets", "Conservation"], ["city", "food", "wildlife", "culture", "gateway"], ["Museums", "Food", "Markets", "Wildlife visits"], KENYA_SOURCE, "https://images.unsplash.com/photo-1611348586804-61bf6c080437?auto=format&fit=crop&w=900&q=84"),
            place("maasai-mara", "kenya", "Maasai Mara", "Rift Valley", "Wildlife safari reserve", "The Maasai Mara is a major safari landscape known for big cats, grasslands, Maasai culture, and seasonal migration viewing.", ["Safari", "Big cats", "Grasslands", "Maasai culture", "Photography"], ["safari", "wildlife", "culture", "photography", "nature"], ["Game drives", "Photography", "Cultural visits", "Nature"], KENYA_SOURCE, "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=900&q=84"),
            place("diani", "kenya", "Diani Beach", "Kwale County", "Indian Ocean coast", "Diani offers white sand, warm water, coral reef activities, coastal food, and a slower beach rhythm.", ["Beach", "Reef", "Seafood", "Diving", "Relaxation"], ["beach", "coast", "wildlife", "food", "wellness"], ["Beach time", "Snorkeling", "Food", "Boat trips"], KENYA_SOURCE, "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=900&q=84"),
        ],
        weather_summary="August is generally a strong safari month in many Kenyan regions, with cooler highland conditions and warm coastal weather.",
        temperature_range="Mild to warm in highlands and savanna areas; warmer and humid on the coast.",
        rainfall_summary="Often drier in major safari regions than long-rain months, though local variation remains.",
        seasonal_highlights=["Safari", "Wildlife", "Coast", "Photography", "Cultural visits"],
        seasonal_activities=["Game drives", "Beach time", "Photography", "Markets", "Museums"],
        affordability="Safari costs vary widely by lodge, park fees, transport, and guide choices; city and coast options broaden budgets.",
    )


def validate_kenya_seed_dataset():
    return validate_compact_destination(get_kenya_seed_dataset())
