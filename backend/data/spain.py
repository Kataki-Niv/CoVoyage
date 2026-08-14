from datetime import datetime, timezone

from models import (
    DestinationCountryCreate,
    DestinationMonthlyFactorsCreate,
    DestinationPlaceCreate,
)


VERIFIED_AT = datetime(2026, 8, 14, tzinfo=timezone.utc)


def source(
    source_name: str,
    source_url: str,
    source_type: str,
    notes: str | None = None,
    confidence: float = 0.9,
):
    return {
        "source_name": source_name,
        "source_url": source_url,
        "source_type": source_type,
        "retrieved_at": VERIFIED_AT,
        "last_verified_at": VERIFIED_AT,
        "confidence": confidence,
        "verification_status": "source-recorded",
        "notes": notes,
    }


SPAIN_INFO = source(
    "Spain.info",
    "https://www.spain.info/en/",
    "official-tourism-board",
    "Official tourism website for Spain.",
)

SPAIN_INFO_ABOUT = source(
    "Spain.info - Information of interest about Spain",
    "https://www.spain.info/en/about-spain/",
    "official-tourism-board",
    "Official practical, cultural, and climate overview for Spain.",
)

SPAIN_BARCELONA = source(
    "Spain.info - Barcelona",
    "https://www.spain.info/en/destination/barcelona/",
    "official-tourism-board",
    "Official Barcelona destination information.",
)

SPAIN_SEVILLE = source(
    "Spain.info - Seville",
    "https://www.spain.info/en/destination/seville/",
    "official-tourism-board",
    "Official Seville destination information.",
)

SPAIN_BALEARIC = source(
    "Spain.info - Balearic Islands",
    "https://www.spain.info/en/region/balearic-islands/",
    "official-tourism-board",
    "Official Balearic Islands destination information.",
)

SPAIN_PALMA = source(
    "Spain.info - Palma",
    "https://www.spain.info/en/destination/palma/",
    "official-tourism-board",
    "Official Palma and Majorca destination information.",
)

AEMET = source(
    "AEMET",
    "https://www.aemet.es/en/portada",
    "meteorological-agency",
    "Spain's national meteorological agency.",
)

SPAIN_TRAVEL_STATE = source(
    "U.S. Department of State - Spain Travel Advisory",
    "https://travel.state.gov/en/international-travel/travel-advisories/spain.html",
    "government-travel-advisory",
    "Government travel advisory used as a fallback for visitor safety and emergency context.",
)


SPAIN_COUNTRY = {
    "slug": "spain",
    "name": "Spain",
    "country_code": "ES",
    "flag": "ðŸ‡ªðŸ‡¸",
    "region": "Southern Europe",
    "currency": {"name": "Euro", "code": "EUR"},
    "languages": ["Spanish", "Catalan", "Galician", "Basque", "English used in many visitor areas"],
    "timezone": "Europe/Madrid",
    "emergency_numbers": ["112"],
    "visa_entry_summary": {
        "title": "Schengen entry rules apply",
        "body": (
            "Spain is part of the Schengen area. Entry requirements depend on nationality, travel purpose, "
            "and length of stay, so travelers should verify current rules before departure."
        ),
        "sources": [SPAIN_INFO],
    },
    "travel_styles": ["Culture", "Food", "Architecture", "Beaches", "Festivals", "City Breaks"],
    "hero_media": {
        "url": "https://images.unsplash.com/photo-1509840841025-9088ba78a826?auto=format&fit=crop&w=1800&q=85",
        "alt_text": "Spanish city street glowing in warm summer light",
        "credit": "Unsplash",
        "source": SPAIN_INFO,
    },
    "featured_category": "Major Festival / Event",
    "journey_title": "Festival Route Through Late Summer Spain",
    "journey_intro": (
        "A late-summer route through city culture, Mediterranean light, regional food, and coastal rhythm."
    ),
    "overview": (
        "Spain offers a wide range of travel experiences, from Mediterranean cities and islands to "
        "Andalusian streets, food culture, beaches, art, architecture, historic routes, and regional identities."
    ),
    "culture_notes": [
        {
            "title": "Regional identity",
            "body": (
                "Spain is culturally diverse, with strong regional languages, cuisines, festivals, histories, "
                "and local rhythms that vary significantly between Catalonia, Andalusia, the Balearic Islands, and beyond."
            ),
            "sources": [SPAIN_INFO, SPAIN_INFO_ABOUT],
        },
        {
            "title": "Food and social rhythm",
            "body": (
                "Food culture is central to travel in Spain, from tapas and markets to late dinners, cafÃ©s, "
                "seafood, regional wines, olive oil, and local festivals."
            ),
            "sources": [SPAIN_INFO_ABOUT, SPAIN_SEVILLE],
        },
    ],
    "etiquette_notes": [
        {
            "title": "Respect local pace",
            "body": (
                "Meal times, shop hours, and evening activity can differ from other countries. Build plans around "
                "local schedules rather than assuming everything follows an early-day rhythm."
            ),
            "sources": [SPAIN_INFO_ABOUT],
        },
        {
            "title": "Historic sites and neighborhoods",
            "body": (
                "Treat religious sites, residential neighborhoods, beaches, and cultural spaces with respect, "
                "especially in high-visitor destinations."
            ),
            "sources": [SPAIN_INFO, SPAIN_BARCELONA, SPAIN_SEVILLE],
        },
    ],
    "communication_notes": [
        {
            "title": "Language and region",
            "body": (
                "Spanish is widely used, but Catalan, Basque, Galician, and other regional languages are part "
                "of local identity. English is common in many visitor services but not universal."
            ),
            "sources": [SPAIN_INFO_ABOUT],
        }
    ],
    "common_visitor_mistakes": [
        {
            "title": "Underestimating August heat",
            "body": (
                "Inland and southern cities can be very hot in August. Plan sightseeing earlier or later in the day "
                "and avoid overpacking midday schedules."
            ),
            "sources": [AEMET, SPAIN_INFO_ABOUT],
        },
        {
            "title": "Treating Spain as one uniform destination",
            "body": (
                "Barcelona, Seville, and Mallorca have different climates, transport patterns, languages, and visitor pressures."
            ),
            "sources": [SPAIN_INFO_ABOUT, SPAIN_BARCELONA, SPAIN_SEVILLE, SPAIN_BALEARIC],
        },
    ],
    "local_insights": [
        {
            "title": "Spain is regional before it is uniform",
            "category": "regional-identity",
            "content": (
                "Local language, food, festivals, architecture, and daily rhythm vary strongly between Catalonia, "
                "Andalusia, the Balearic Islands, and other regions. Treat each stop as its own cultural setting."
            ),
            "sources": [SPAIN_INFO, SPAIN_INFO_ABOUT],
        },
        {
            "title": "Meal timing shapes the day",
            "category": "everyday-life",
            "content": (
                "Lunch, dinner, shop hours, and evening activity often run later than many visitors expect. Planning "
                "around local meal rhythms makes city days feel smoother."
            ),
            "sources": [SPAIN_INFO_ABOUT],
        },
        {
            "title": "August rewards heat-aware planning",
            "category": "seasonal-rhythm",
            "content": (
                "Inland and southern cities can be very hot in August. Morning and evening sightseeing is often more "
                "comfortable than dense midday schedules."
            ),
            "sources": [AEMET, SPAIN_INFO_ABOUT],
        },
        {
            "title": "Beaches and historic centers are lived-in spaces",
            "category": "visitor-etiquette",
            "content": (
                "Popular beaches, old towns, markets, churches, and neighborhoods are part of daily life. Move carefully "
                "through crowded areas and respect residential streets and religious spaces."
            ),
            "sources": [SPAIN_INFO, SPAIN_BARCELONA, SPAIN_SEVILLE, SPAIN_BALEARIC],
        },
        {
            "title": "Transport is excellent but not one-size-fits-all",
            "category": "transport",
            "content": (
                "High-speed rail works well between many mainland cities, while islands such as Mallorca depend on "
                "flights, ferries, and local transport planning."
            ),
            "sources": [SPAIN_INFO, SPAIN_BALEARIC],
        },
        {
            "title": "Local languages matter",
            "category": "communication",
            "content": (
                "Spanish is widely used, but regional languages such as Catalan, Galician, and Basque carry local identity. "
                "Recognizing that diversity helps visitors avoid treating Spain as culturally interchangeable."
            ),
            "sources": [SPAIN_INFO_ABOUT],
        },
    ],
    "local_phrases": [
        {
            "english": "Hello",
            "local": "Hola",
            "pronunciation": "OH-lah",
            "usage_note": "Simple, everyday greeting across Spain.",
            "sources": [SPAIN_INFO_ABOUT],
        },
        {
            "english": "Good morning",
            "local": "Buenos días",
            "pronunciation": "BWEH-nos DEE-as",
            "usage_note": "Polite in cafes, shops, hotels, and transit settings.",
            "sources": [SPAIN_INFO_ABOUT],
        },
        {
            "english": "Thank you",
            "local": "Gracias",
            "pronunciation": "GRAH-syahs",
            "usage_note": "Useful everywhere from tapas bars to museums.",
            "sources": [SPAIN_INFO_ABOUT],
        },
        {
            "english": "Please",
            "local": "Por favor",
            "pronunciation": "por fah-VOR",
            "usage_note": "Good for ordering, asking directions, and ticket counters.",
            "sources": [SPAIN_INFO_ABOUT],
        },
        {
            "english": "The bill, please",
            "local": "La cuenta, por favor",
            "pronunciation": "lah KWEN-tah por fah-VOR",
            "usage_note": "A practical phrase for restaurants and cafes.",
            "sources": [SPAIN_INFO_ABOUT],
        },
        {
            "english": "Excuse me",
            "local": "Perdón",
            "pronunciation": "per-DON",
            "usage_note": "Useful in crowded streets, markets, and transport.",
            "sources": [SPAIN_INFO_ABOUT],
        },
        {
            "english": "Where is the station?",
            "local": "¿Dónde está la estación?",
            "pronunciation": "DON-deh es-TAH lah es-tah-SYON",
            "usage_note": "Helpful for rail, metro, and bus travel.",
            "sources": [SPAIN_INFO, SPAIN_INFO_ABOUT],
        },
    ],
    "practical_notes": [
        {
            "title": "Money and payment",
            "body": "Spain uses the euro. Cards are widely accepted, though small cash can still be useful.",
            "sources": [SPAIN_INFO_ABOUT],
        },
        {
            "title": "Transport overview",
            "body": (
                "Spain has strong rail, air, road, and ferry links. High-speed trains connect major cities, "
                "while islands require flights or ferries."
            ),
            "sources": [SPAIN_INFO, SPAIN_SEVILLE, SPAIN_BALEARIC],
        },
        {
            "title": "August planning",
            "body": (
                "Expect heat in many areas and high demand in coastal and island destinations. Book transport "
                "and accommodation early for peak summer routes."
            ),
            "sources": [SPAIN_INFO_ABOUT, AEMET],
        },
        {
            "title": "Emergency",
            "body": "The emergency number in Spain and across the European Union is 112.",
            "sources": [SPAIN_TRAVEL_STATE],
        },
    ],
    "sources": [SPAIN_INFO, SPAIN_INFO_ABOUT, AEMET, SPAIN_TRAVEL_STATE],
}


SPAIN_PLACES = [
    {
        "slug": "barcelona",
        "country_slug": "spain",
        "name": "Barcelona",
        "region": "Catalonia",
        "type": "Mediterranean city and architecture destination",
        "story": (
            "Barcelona blends Mediterranean city life, beaches, markets, modernist architecture, "
            "neighborhood walks, food, art, and Catalan identity."
        ),
        "description": (
            "A major city destination known for GaudÃ­ architecture, seaside districts, museums, markets, "
            "urban beaches, and layered neighborhoods."
        ),
        "media": [
            {
                "url": "https://images.unsplash.com/photo-1509840841025-9088ba78a826?auto=format&fit=crop&w=900&q=84",
                "alt_text": "Barcelona street and architecture in warm Mediterranean light",
                "credit": "Unsplash",
                "source": SPAIN_BARCELONA,
            }
        ],        "why_visit": (
            "Visit for architecture, food, beach-city energy, galleries, and a cityscape where art and daily life overlap."
        ),
        "time_required": "3-5 days",
        "highlights": ["Sagrada Familia", "Modernist architecture", "Markets", "Urban beaches", "Museums"],
        "tags": ["architecture", "food", "beaches", "city-break", "culture"],
        "activities": ["Architecture", "Museums", "Food markets", "Beach walks", "Neighborhood exploring"],
        "local_experience": (
            "Balance major sights with neighborhood time, market meals, and slower evening walks near the sea."
        ),
        "access_notes": [
            {
                "title": "Major transport hub",
                "body": "Barcelona is well connected by air, rail, road, and local public transport.",
                "sources": [SPAIN_BARCELONA, SPAIN_INFO],
            }
        ],
        "local_vibe_notes": ["Mediterranean", "Architectural", "Catalan", "Food-focused", "Urban"],
        "safety_warnings": [
            {
                "title": "Crowds and belongings",
                "body": "Busy tourist areas require normal city awareness, especially around transport hubs and major sights.",
                "sources": [SPAIN_TRAVEL_STATE, SPAIN_BARCELONA],
            }
        ],
        "seasonal_warnings": [
            {
                "title": "August demand",
                "body": "August can bring heat, beach crowds, and high accommodation demand.",
                "sources": [AEMET, SPAIN_INFO_ABOUT],
            }
        ],
        "sources": [SPAIN_BARCELONA, SPAIN_INFO],
    },
    {
        "slug": "seville",
        "country_slug": "spain",
        "name": "Seville",
        "region": "Andalusia",
        "type": "Historic city and Andalusian culture destination",
        "story": (
            "Seville is a historic Andalusian city of orange-tree courtyards, flamenco, tapas, ceramics, "
            "the Cathedral, La Giralda, Triana, and the Real AlcÃ¡zar."
        ),
        "description": (
            "A southern Spanish city known for monumental architecture, flamenco culture, tapas, plazas, "
            "historic neighborhoods, and strong local tradition."
        ),
        "media": [
            {
                "url": "https://images.unsplash.com/photo-1558642084-fd07fae5282e?auto=format&fit=crop&w=900&q=84",
                "alt_text": "Warm Andalusian city street with festive evening lights",
                "credit": "Unsplash",
                "source": SPAIN_SEVILLE,
            }
        ],        "why_visit": (
            "Visit for Andalusian culture, historic monuments, tapas neighborhoods, flamenco atmosphere, "
            "and evening street life."
        ),
        "time_required": "2-4 days",
        "highlights": ["Cathedral and Giralda", "Real AlcÃ¡zar", "Triana", "Tapas", "Flamenco"],
        "tags": ["culture", "history", "food", "flamenco", "architecture"],
        "activities": ["Historic sites", "Tapas", "Flamenco", "Walking", "Museums"],
        "local_experience": (
            "Shift sightseeing away from midday heat and enjoy evening walks, tapas, and neighborhoods like Triana."
        ),
        "access_notes": [
            {
                "title": "Rail and airport access",
                "body": "Seville is connected by airport, train, bus, and road, including high-speed rail to major cities.",
                "sources": [SPAIN_SEVILLE],
            }
        ],
        "local_vibe_notes": ["Andalusian", "Flamenco", "Tapas", "Historic", "Warm evenings"],
        "safety_warnings": [
            {
                "title": "Heat management",
                "body": "In August, heat can affect comfort and sightseeing pace. Carry water and plan indoor breaks.",
                "sources": [AEMET, SPAIN_SEVILLE],
            }
        ],
        "seasonal_warnings": [
            {
                "title": "Very hot summer days",
                "body": "Seville is one of the destinations where August heat should shape daily planning.",
                "sources": [AEMET, SPAIN_INFO_ABOUT],
            }
        ],
        "sources": [SPAIN_SEVILLE, AEMET],
    },
    {
        "slug": "mallorca",
        "country_slug": "spain",
        "name": "Mallorca",
        "region": "Balearic Islands",
        "type": "Mediterranean island destination",
        "story": (
            "Mallorca combines Palma's old town and cathedral, beaches, coves, cliffs, villages, cycling routes, "
            "and the Serra de Tramuntana."
        ),
        "description": (
            "A Balearic island destination for beaches, Palma, mountain landscapes, coastal villages, boat trips, "
            "food, and summer Mediterranean travel."
        ),
        "media": [
            {
                "url": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=900&q=84",
                "alt_text": "Mallorca coastline and Mediterranean summer atmosphere",
                "credit": "Unsplash",
                "source": SPAIN_BALEARIC,
            }
        ],        "why_visit": (
            "Visit for island scenery, coves, old-town Palma, Mediterranean food, village drives, and sea-and-mountain contrast."
        ),
        "time_required": "4-7 days",
        "highlights": ["Palma", "Coves", "Serra de Tramuntana", "Beaches", "Coastal villages"],
        "tags": ["island", "beaches", "nature", "road-trip", "food"],
        "activities": ["Beach time", "Cycling", "Boat trips", "Village drives", "Food"],
        "local_experience": (
            "Go beyond beach time with Palma, market meals, early drives into mountain villages, and quieter coves."
        ),
        "access_notes": [
            {
                "title": "Island access",
                "body": "Mallorca is reached by flights to Palma and by ferry from mainland Spain and other Balearic ports.",
                "sources": [SPAIN_BALEARIC, SPAIN_PALMA],
            }
        ],
        "local_vibe_notes": ["Island", "Mediterranean", "Beach", "Cycling", "Village drives"],
        "safety_warnings": [
            {
                "title": "Summer crowds and heat",
                "body": "August can bring heavy demand, hot days, and busy beaches or roads. Book ahead and start early.",
                "sources": [SPAIN_BALEARIC, AEMET],
            }
        ],
        "seasonal_warnings": [
            {
                "title": "Peak island season",
                "body": "Accommodation, rental vehicles, ferries, and popular beaches can be busy in August.",
                "sources": [SPAIN_BALEARIC],
            }
        ],
        "sources": [SPAIN_BALEARIC, SPAIN_PALMA],
    },
]


SPAIN_AUGUST_2026_MONTHLY_FACTORS = {
    "year": 2026,
    "month": 8,
    "country_slug": "spain",
    "weather_climate": {
        "summary": (
            "August is peak summer in Spain. Many areas are hot, sunny, and dry, while coastal and island "
            "destinations can be more moderated by the sea and northern areas can be milder."
        ),
        "temperature_range": "Hot in much of inland and southern Spain; warm to hot in Mediterranean coastal and island areas.",
        "rainfall_summary": "Summer is generally dry in many Spanish regions, though conditions vary by area.",
        "daylight_summary": "Long summer days support city sightseeing, beach time, and evening outdoor activity.",
        "sources": [AEMET, SPAIN_INFO_ABOUT],
    },
    "weather_suitability_input": (
        "August supports beaches, festivals, evening city life, and island travel, but heat should shape inland and southern plans."
    ),
    "daylight_information": "Long daylight and warm evenings make late-day exploring practical.",
    "seasonal_conditions": [
        {
            "title": "Peak summer season",
            "body": "August is a major travel month, especially for coastal, island, and city-break destinations.",
            "sources": [SPAIN_INFO, SPAIN_INFO_ABOUT],
        },
        {
            "title": "Heat-aware planning",
            "body": "Inland and southern areas can be very hot, so travelers should plan early starts, shaded breaks, and hydration.",
            "sources": [AEMET, SPAIN_INFO_ABOUT],
        },
    ],
    "seasonal_highlights": ["Beaches", "Festivals", "Outdoor dining", "City breaks", "Island travel"],
    "accessibility_information": (
        "Spain has strong transport links by rail, air, road, and ferry, though peak-season booking is important."
    ),
    "seasonal_activities": [
        "Beach travel",
        "Food markets",
        "Architecture",
        "Festivals",
        "Island hopping",
        "Evening walks",
    ],
    "event_activity_density_input": (
        "Spain has a strong summer events calendar, but event dates and tickets should be verified with official organizers."
    ),
    "affordability_value_input": (
        "August is peak season in many coastal and island areas, so value is better with early booking and region-aware choices."
    ),
    "travel_conditions": [
        {
            "title": "Book peak routes early",
            "body": "Flights, ferries, rail, rental cars, and popular accommodation can be busy in August.",
            "sources": [SPAIN_INFO, SPAIN_BALEARIC],
        },
        {
            "title": "Use heat-aware pacing",
            "body": "Plan outdoor sightseeing earlier or later in the day, especially in Seville and other hot inland/southern areas.",
            "sources": [AEMET, SPAIN_INFO_ABOUT],
        },
    ],
    "seasonal_warnings": [
        {
            "title": "Heat and sun exposure",
            "body": "Hot weather can affect sightseeing comfort and safety, especially in southern and inland destinations.",
            "sources": [AEMET],
        },
        {
            "title": "Crowds and high demand",
            "body": "Peak summer demand can affect prices, availability, and crowd levels in popular cities, islands, and beaches.",
            "sources": [SPAIN_INFO, SPAIN_BALEARIC],
        },
    ],
    "sources": [SPAIN_INFO, SPAIN_INFO_ABOUT, AEMET, SPAIN_BALEARIC],
}


def get_spain_seed_dataset():
    return {
        "country": SPAIN_COUNTRY,
        "places": SPAIN_PLACES,
        "monthly_factors": [SPAIN_AUGUST_2026_MONTHLY_FACTORS],
    }


def validate_spain_seed_dataset():
    dataset = get_spain_seed_dataset()
    country = DestinationCountryCreate(**dataset["country"])
    places = [DestinationPlaceCreate(**place) for place in dataset["places"]]
    monthly_factors = [
        DestinationMonthlyFactorsCreate(**monthly_factor)
        for monthly_factor in dataset["monthly_factors"]
    ]

    country_slugs = {country.slug}
    invalid_places = [
        place.slug for place in places if place.country_slug not in country_slugs
    ]
    invalid_months = [
        monthly_factor.month
        for monthly_factor in monthly_factors
        if monthly_factor.country_slug not in country_slugs
    ]

    if invalid_places:
        raise ValueError(f"Places reference unknown country_slug: {invalid_places}")

    if invalid_months:
        raise ValueError(f"Monthly factors reference unknown country_slug: {invalid_months}")

    return {
        "country_slug": country.slug,
        "place_slugs": [place.slug for place in places],
        "monthly_factors": [
            {"year": monthly_factor.year, "month": monthly_factor.month}
            for monthly_factor in monthly_factors
        ],
    }
