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


VISIT_GUATEMALA = source(
    "Visit Guatemala",
    "https://visitguatemala.gt/en/",
    "official-tourism-board",
    "Official Guatemala tourism website from INGUAT.",
)

ASISTUR = source(
    "ASISTUR Guatemala",
    "https://asistur.gt/informacion-turistica/",
    "official-tourist-assistance",
    "Official tourist assistance and visitor information for Guatemala.",
)

TRAVEL_STATE_GUATEMALA = source(
    "U.S. Department of State - Guatemala Travel Advisory",
    "https://travel.state.gov/en/international-travel/travel-advisories/guatemala.html",
    "government-travel-advisory",
    "Government travel advisory used for emergency numbers, safety, and money/payment notes.",
)

TIKAL_TICKETS = source(
    "Ministerio de Cultura y Deportes Guatemala - Tikal Tickets",
    "https://boletos.culturaguate.gob.gt/en/",
    "official-site-operator",
    "Official ticketing and visitor information for Tikal National Park.",
)

TIKAL_FOREIGN_VISITORS = source(
    "Ministerio de Cultura y Deportes Guatemala - Tikal Foreign Visitors",
    "https://boletos.culturaguate.gob.gt/en/foreign-visitors-tickets/",
    "official-site-operator",
    "Official ticket requirements and visitor-category information for foreign visitors to Tikal.",
)

INSIVUMEH = source(
    "INSIVUMEH Guatemala",
    "https://insivumeh.gob.gt/",
    "meteorological-agency",
    "Guatemala's national institute for seismology, volcanology, meteorology, and hydrology.",
)


GUATEMALA_COUNTRY = {
    "slug": "guatemala",
    "name": "Guatemala",
    "country_code": "GT",
    "flag": "ðŸ‡¬ðŸ‡¹",
    "region": "Central America",
    "currency": {
        "name": "Guatemalan quetzal",
        "code": "GTQ",
    },
    "languages": [
        "Spanish",
        "Mayan languages spoken in many communities",
        "English used in some visitor services",
    ],
    "timezone": "America/Guatemala",
    "emergency_numbers": ["110 police", "122 ambulance", "123 ambulance", "1500 tourist assistance"],
    "visa_entry_summary": {
        "title": "Entry requirements vary by nationality",
        "body": (
            "Short-stay entry and visa requirements depend on nationality. Travelers should "
            "confirm current requirements with official Guatemalan or consular sources before departure."
        ),
        "sources": [VISIT_GUATEMALA],
    },
    "travel_styles": [
        "Culture",
        "Archaeology",
        "Nature",
        "Volcanoes",
        "Food",
        "Budget Travel",
    ],
    "hero_media": {
        "url": "https://images.unsplash.com/photo-1602120012884-6aa678fa79c7?auto=format&fit=crop&w=1800&q=85",
        "alt_text": "Antigua Guatemala archway and cobblestone street",
        "credit": "Unsplash",
        "source": VISIT_GUATEMALA,
    },
    "featured_category": "Budget-Friendly",
    "journey_title": "Colonial Streets to Jungle Ruins",
    "journey_intro": (
        "A compact route through volcano-framed streets, lakeside villages, markets, and Maya heritage."
    ),
    "overview": (
        "Guatemala combines Maya heritage, colonial architecture, volcanic landscapes, lakeside "
        "villages, markets, rainforests, and archaeological sites. A thoughtful trip balances "
        "cultural respect, transport planning, weather awareness, and time between regions."
    ),
    "culture_notes": [
        {
            "title": "Maya heritage and living culture",
            "body": (
                "Guatemala's cultural identity is shaped by Maya heritage, local languages, "
                "textiles, markets, food traditions, Catholic and Indigenous practices, and regional diversity."
            ),
            "sources": [VISIT_GUATEMALA, ASISTUR],
        },
        {
            "title": "Food culture",
            "body": (
                "Travelers commonly encounter corn-based dishes, beans, stews, coffee, cacao, "
                "market snacks, tortillas, and regional recipes influenced by local ingredients."
            ),
            "sources": [VISIT_GUATEMALA],
        },
    ],
    "etiquette_notes": [
        {
            "title": "Respect people and textiles",
            "body": (
                "Ask before photographing people, especially in markets and Indigenous communities. "
                "Treat traditional clothing and local ceremonies with respect."
            ),
            "sources": [VISIT_GUATEMALA, ASISTUR],
        },
        {
            "title": "Use local guidance",
            "body": (
                "For volcano hikes, archaeological sites, and remote routes, local guides and official "
                "visitor information help travelers avoid preventable problems."
            ),
            "sources": [ASISTUR, TIKAL_TICKETS],
        },
    ],
    "communication_notes": [
        {
            "title": "Language and tone",
            "body": (
                "Spanish is the main national language for travelers, while many communities also use "
                "Mayan languages. Polite greetings and patient communication are useful outside major visitor hubs."
            ),
            "sources": [VISIT_GUATEMALA],
        }
    ],
    "common_visitor_mistakes": [
        {
            "title": "Trying to cover too much too quickly",
            "body": (
                "Distances can be slow by road. Antigua, Lake Atitlán, and Tikal are better experienced "
                "with realistic transfer time rather than rushed same-day movement."
            ),
            "sources": [VISIT_GUATEMALA, ASISTUR],
        },
        {
            "title": "Ignoring local safety guidance",
            "body": (
                "Travelers should use official tourist assistance, reliable transport, and local advice "
                "when moving between regions or visiting unfamiliar areas."
            ),
            "sources": [ASISTUR, TRAVEL_STATE_GUATEMALA],
        },
    ],
    "local_insights": [
        {
            "title": "Maya culture is living culture",
            "category": "culture",
            "content": (
                "Maya heritage is visible in archaeology, languages, textiles, markets, foodways, and ceremonies. "
                "Treat it as contemporary community life, not only as ancient history."
            ),
            "sources": [VISIT_GUATEMALA, ASISTUR],
        },
        {
            "title": "Markets reward slow looking",
            "category": "everyday-life",
            "content": (
                "Markets are social and practical spaces as much as shopping stops. Ask before photographing people "
                "or textiles and leave time for respectful conversation."
            ),
            "sources": [VISIT_GUATEMALA, ASISTUR],
        },
        {
            "title": "Highland mornings and evenings feel different",
            "category": "climate-rhythm",
            "content": (
                "Highland destinations such as Antigua and Lake Atitlán can start cool, turn bright, and shift with "
                "wet-season showers, so layers and rain protection make daily movement easier."
            ),
            "sources": [INSIVUMEH, VISIT_GUATEMALA],
        },
        {
            "title": "Volcano views come with volcano awareness",
            "category": "safety-culture",
            "content": (
                "Volcanoes shape Guatemala's scenery and travel identity. Official monitoring and local guidance are "
                "important when planning hikes or regional movement."
            ),
            "sources": [INSIVUMEH, ASISTUR],
        },
        {
            "title": "Transfers need more time than maps suggest",
            "category": "transport",
            "content": (
                "Road travel between Antigua, Lake Atitlán, and northern sites can be slow. Reliable shuttles, flights, "
                "or guided transfers help keep plans realistic."
            ),
            "sources": [VISIT_GUATEMALA, ASISTUR],
        },
        {
            "title": "Tikal has formal visitor rules",
            "category": "heritage-sites",
            "content": (
                "Tikal is a protected archaeological destination with official ticketing and visitor categories. "
                "Plan entry through current official information rather than relying on informal advice."
            ),
            "sources": [TIKAL_TICKETS, TIKAL_FOREIGN_VISITORS],
        },
    ],
    "local_phrases": [
        {
            "english": "Hello",
            "local": "Hola",
            "pronunciation": "OH-lah",
            "usage_note": "Works in almost every everyday greeting.",
            "sources": [VISIT_GUATEMALA],
        },
        {
            "english": "Good morning",
            "local": "Buenos días",
            "pronunciation": "BWEH-nos DEE-as",
            "usage_note": "A polite way to greet drivers, hosts, vendors, and guides in the morning.",
            "sources": [VISIT_GUATEMALA],
        },
        {
            "english": "Thank you",
            "local": "Gracias",
            "pronunciation": "GRAH-syahs",
            "usage_note": "Use often; it is simple and appreciated.",
            "sources": [VISIT_GUATEMALA],
        },
        {
            "english": "Please",
            "local": "Por favor",
            "pronunciation": "por fah-VOR",
            "usage_note": "Helpful in markets, cafes, transport, and ticket offices.",
            "sources": [VISIT_GUATEMALA],
        },
        {
            "english": "How much does it cost?",
            "local": "¿Cuánto cuesta?",
            "pronunciation": "KWAN-toh KWES-tah",
            "usage_note": "Useful when asking prices in markets or small shops.",
            "sources": [VISIT_GUATEMALA],
        },
        {
            "english": "Excuse me",
            "local": "Disculpe",
            "pronunciation": "dees-KOOL-peh",
            "usage_note": "A polite opener when asking for help or directions.",
            "sources": [VISIT_GUATEMALA],
        },
        {
            "english": "Where is the bus?",
            "local": "¿Dónde está el bus?",
            "pronunciation": "DON-deh es-TAH el boos",
            "usage_note": "Useful around shuttles, terminals, and local transport stops.",
            "sources": [ASISTUR, VISIT_GUATEMALA],
        },
        {
            "english": "Yes",
            "local": "Sí",
            "pronunciation": "see",
            "usage_note": "Simple confirmation in shops, cafes, and transport settings.",
            "sources": [VISIT_GUATEMALA],
        },
        {
            "english": "No",
            "local": "No",
            "pronunciation": "noh",
            "usage_note": "Useful for simple polite responses.",
            "sources": [VISIT_GUATEMALA],
        },
    ],
    "practical_notes": [
        {
            "title": "Money and payment",
            "body": (
                "The official currency is the Guatemalan quetzal. Cards are common in Guatemala City, "
                "Antigua, and tourist areas, but cash is useful for smaller businesses and rural areas."
            ),
            "sources": [TRAVEL_STATE_GUATEMALA, VISIT_GUATEMALA],
        },
        {
            "title": "Tourist assistance",
            "body": (
                "ASISTUR provides tourist assistance and can be reached through the 1500 tourist assistance line."
            ),
            "sources": [ASISTUR, TRAVEL_STATE_GUATEMALA],
        },
        {
            "title": "Transport planning",
            "body": (
                "Use reliable shuttles, private transfers, flights, or organized transport for long routes. "
                "Road travel times can be longer than distances suggest."
            ),
            "sources": [VISIT_GUATEMALA, ASISTUR],
        },
        {
            "title": "Packing guidance",
            "body": (
                "Pack rain protection for the wet season, sun protection, sturdy footwear for ruins and "
                "cobblestones, and layers for highland mornings and evenings."
            ),
            "sources": [INSIVUMEH, VISIT_GUATEMALA],
        },
    ],
    "sources": [VISIT_GUATEMALA, ASISTUR, TRAVEL_STATE_GUATEMALA, INSIVUMEH],
}


GUATEMALA_PLACES = [
    {
        "slug": "antigua-guatemala",
        "country_slug": "guatemala",
        "name": "Antigua Guatemala",
        "region": "Sacatepéquez",
        "type": "Colonial city and cultural base",
        "story": (
            "Antigua Guatemala is a walkable colonial city framed by volcanoes, cobblestone streets, "
            "ruins, courtyards, churches, cafés, and craft traditions."
        ),
        "description": (
            "A historic city known for Spanish colonial architecture, volcano views, food, coffee, "
            "markets, and easy access to nearby outdoor experiences."
        ),
        "media": [
            {
                "url": "https://images.unsplash.com/photo-1602120012884-6aa678fa79c7?auto=format&fit=crop&w=900&q=84",
                "alt_text": "Antigua Guatemala archway and cobblestone street",
                "credit": "Unsplash",
                "source": VISIT_GUATEMALA,
            }
        ],        "why_visit": (
            "Visit for a concentrated mix of architecture, food, coffee culture, volcano views, "
            "and a soft landing into Guatemala's highland travel rhythm."
        ),
        "time_required": "2-4 days",
        "highlights": ["Colonial streets", "Church ruins", "Volcano views", "Coffee culture", "Markets"],
        "tags": ["culture", "architecture", "food", "coffee", "volcanoes"],
        "activities": ["Walking", "Photography", "Local Food", "Coffee", "Markets"],
        "local_experience": (
            "Slow mornings, courtyard cafés, market browsing, and sunset viewpoints make Antigua "
            "feel more rewarding when not rushed."
        ),
        "access_notes": [
            {
                "title": "Regional base",
                "body": (
                    "Antigua is commonly reached by road from Guatemala City and works well as a base "
                    "for nearby cultural and volcano experiences."
                ),
                "sources": [VISIT_GUATEMALA, ASISTUR],
            }
        ],
        "local_vibe_notes": ["Colonial", "Walkable", "Coffee", "Volcano views", "Cultural"],
        "safety_warnings": [
            {
                "title": "Use reliable transport",
                "body": "Use reputable transport, keep valuables discreet, and follow local visitor guidance.",
                "sources": [ASISTUR, TRAVEL_STATE_GUATEMALA],
            }
        ],
        "seasonal_warnings": [
            {
                "title": "Wet-season showers",
                "body": "August can bring afternoon rain, so plan walking time and transfers with flexibility.",
                "sources": [INSIVUMEH],
            }
        ],
        "sources": [VISIT_GUATEMALA, ASISTUR],
    },
    {
        "slug": "lake-atitlan",
        "country_slug": "guatemala",
        "name": "Lake Atitlán",
        "region": "Sololá",
        "type": "Volcanic lake and village region",
        "story": (
            "Lake Atitlán is a highland lake ringed by volcanoes and lakeside communities, each with "
            "its own rhythm, markets, crafts, views, and transport patterns."
        ),
        "description": (
            "A scenic lake destination for village-hopping, views, kayaking, culture, markets, "
            "slow travel, and highland mornings."
        ),
        "media": [
            {
                "url": "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?auto=format&fit=crop&w=900&q=84",
                "alt_text": "Lake surrounded by mountains and villages",
                "credit": "Unsplash",
                "source": VISIT_GUATEMALA,
            }
        ],        "why_visit": (
            "Go for volcano-backed water views, community life, crafts, relaxed stays, and a slower "
            "counterpoint to city and ruin itineraries."
        ),
        "time_required": "2-4 days",
        "highlights": ["Volcano views", "Lakeside villages", "Boat travel", "Crafts", "Markets"],
        "tags": ["lake", "nature", "culture", "slow-travel", "photography"],
        "activities": ["Boat trips", "Photography", "Markets", "Kayaking", "Village walks"],
        "local_experience": (
            "Base in one village, use boats thoughtfully, and let lake weather shape the day rather "
            "than overloading the itinerary."
        ),
        "access_notes": [
            {
                "title": "Lake transfers",
                "body": (
                    "Most visitors reach the lake by road and move between communities by boat or local transport. "
                    "Weather can affect lake crossings."
                ),
                "sources": [VISIT_GUATEMALA, ASISTUR],
            }
        ],
        "local_vibe_notes": ["Volcanic", "Lakeside", "Crafts", "Slow travel", "Community"],
        "safety_warnings": [
            {
                "title": "Plan transport before dark",
                "body": "Plan boat and road transfers carefully and follow local safety advice.",
                "sources": [ASISTUR, TRAVEL_STATE_GUATEMALA],
            }
        ],
        "seasonal_warnings": [
            {
                "title": "Rain and lake conditions",
                "body": "Rainy-season weather can affect roads, trails, and boat comfort.",
                "sources": [INSIVUMEH],
            }
        ],
        "sources": [VISIT_GUATEMALA, ASISTUR],
    },
    {
        "slug": "tikal",
        "country_slug": "guatemala",
        "name": "Tikal",
        "region": "Petén",
        "type": "Archaeological park and rainforest site",
        "story": (
            "Tikal brings monumental Maya architecture into rainforest soundscapes, with temples, "
            "plazas, wildlife, and early-morning or late-day visiting windows."
        ),
        "description": (
            "A major Maya archaeological site in northern Guatemala, visited for temples, plazas, "
            "history, wildlife, and guided interpretation."
        ),
        "media": [
            {
                "url": "https://images.unsplash.com/photo-1512813195386-6cf811ad3542?auto=format&fit=crop&w=900&q=84",
                "alt_text": "Ancient stone ruins surrounded by forest",
                "credit": "Unsplash",
                "source": TIKAL_TICKETS,
            }
        ],        "why_visit": (
            "Visit for one of Guatemala's defining archaeological landscapes, where ruins and rainforest "
            "make history feel spatial and alive."
        ),
        "time_required": "Full day or overnight near Flores",
        "highlights": ["Maya temples", "Rainforest", "Sunrise/sunset access", "Wildlife", "Guided history"],
        "tags": ["archaeology", "maya", "rainforest", "history", "wildlife"],
        "activities": ["Archaeology", "Guided tours", "Photography", "Wildlife watching", "Walking"],
        "local_experience": (
            "Start early, hire an authorized guide for deeper context, and pace the site for heat, humidity, and distance."
        ),
        "access_notes": [
            {
                "title": "Ticket and entry requirements",
                "body": (
                    "Foreign visitors should buy the correct visitor-category ticket. Sunrise and sunset access "
                    "have separate ticket requirements and do not include guide services."
                ),
                "sources": [TIKAL_TICKETS, TIKAL_FOREIGN_VISITORS],
            }
        ],
        "local_vibe_notes": ["Archaeological", "Rainforest", "Maya history", "Guided", "Wildlife"],
        "safety_warnings": [
            {
                "title": "Heat, distance, and site rules",
                "body": "Bring water, sun/rain protection, and follow park rules and official access requirements.",
                "sources": [TIKAL_TICKETS, TIKAL_FOREIGN_VISITORS],
            }
        ],
        "seasonal_warnings": [
            {
                "title": "Rainy-season humidity",
                "body": "August can be humid and wet, so trails and exposed areas require practical footwear and rain planning.",
                "sources": [INSIVUMEH],
            }
        ],
        "sources": [TIKAL_TICKETS, TIKAL_FOREIGN_VISITORS, VISIT_GUATEMALA],
    },
]


GUATEMALA_AUGUST_2026_MONTHLY_FACTORS = {
    "year": 2026,
    "month": 8,
    "country_slug": "guatemala",
    "weather_climate": {
        "summary": (
            "August falls within Guatemala's rainy season. Conditions can vary by elevation and region, "
            "with warm lowlands, cooler highlands, and regular rain or storms."
        ),
        "temperature_range": "Warm in lowlands and milder in highland areas; cooler mornings and evenings at elevation.",
        "rainfall_summary": "Rainy-season showers and storms are common, especially later in the day.",
        "daylight_summary": "Tropical daylight remains relatively steady compared with high-latitude destinations.",
        "sources": [INSIVUMEH],
    },
    "weather_suitability_input": (
        "Travel is feasible in August with flexible planning, rain protection, and realistic transfer buffers."
    ),
    "daylight_information": (
        "Daylight is adequate for full travel days, but afternoon weather can make early starts useful."
    ),
    "seasonal_conditions": [
        {
            "title": "Rainy-season travel",
            "body": "August can bring regular rain, muddy trails, slower roads, and lush landscapes.",
            "sources": [INSIVUMEH],
        },
        {
            "title": "Regional variation",
            "body": "Highlands, rainforest, and lowland regions can feel very different in temperature and humidity.",
            "sources": [INSIVUMEH, VISIT_GUATEMALA],
        },
    ],
    "seasonal_highlights": ["Lush landscapes", "Markets", "Cultural cities", "Maya sites", "Lake views"],
    "accessibility_information": (
        "Core tourism routes are possible, but rain can affect road comfort, trail conditions, and transfer timing."
    ),
    "seasonal_activities": [
        "Cultural walking",
        "Archaeological sites",
        "Market visits",
        "Coffee experiences",
        "Lake travel",
        "Photography",
    ],
    "event_activity_density_input": (
        "August supports cultural travel and local activities, but specific event dates should be verified from official organizers."
    ),
    "affordability_value_input": (
        "Guatemala can offer good value compared with many long-haul destinations, especially when using local transport and guesthouses."
    ),
    "travel_conditions": [
        {
            "title": "Build in transfer buffers",
            "body": "Rain, traffic, roadwork, and mountain roads can make travel times longer than expected.",
            "sources": [ASISTUR, INSIVUMEH],
        },
        {
            "title": "Use tourist assistance resources",
            "body": "ASISTUR and official visitor resources can help travelers plan safer movement between regions.",
            "sources": [ASISTUR],
        },
    ],
    "seasonal_warnings": [
        {
            "title": "Rain and road disruption",
            "body": "Rainy-season weather can affect roads, trails, lake crossings, and outdoor comfort.",
            "sources": [INSIVUMEH],
        },
        {
            "title": "Safety varies by area",
            "body": "Travelers should follow official safety guidance, use reliable transport, and avoid improvising unfamiliar routes.",
            "sources": [ASISTUR, TRAVEL_STATE_GUATEMALA],
        },
    ],
    "sources": [INSIVUMEH, VISIT_GUATEMALA, ASISTUR, TRAVEL_STATE_GUATEMALA],
}


def get_guatemala_seed_dataset():
    return {
        "country": GUATEMALA_COUNTRY,
        "places": GUATEMALA_PLACES,
        "monthly_factors": [GUATEMALA_AUGUST_2026_MONTHLY_FACTORS],
    }


def validate_guatemala_seed_dataset():
    dataset = get_guatemala_seed_dataset()
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
