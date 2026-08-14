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


VISIT_ICELAND = source(
    "Visit Iceland",
    "https://www.visiticeland.com/",
    "official-tourism-board",
    "Official Iceland travel resource from Business Iceland, the Icelandic Tourist Board, and government partners.",
)

VISIT_SOUTH_ICELAND = source(
    "Visit South Iceland",
    "https://visitsouthiceland.is/",
    "official-regional-tourism-board",
    "Official destination marketing office for South Iceland.",
)

ISLAND_IS_ENTRY = source(
    "Island.is - Entry requirements to Iceland",
    "https://island.is/en/entry-requirements-to-iceland",
    "government",
    "Official Icelandic government guidance for entry and travel document requirements.",
)

EMERGENCY_112 = source(
    "112 Iceland",
    "https://www.112.is/en/112",
    "official-emergency-service",
    "Official Icelandic emergency hotline information.",
)

ROAD_AUTHORITY = source(
    "Icelandic Road and Coastal Administration - Mountain roads",
    "https://www.vegagerdin.is/en/travel-info/mountain-roads",
    "official-road-authority",
    "Official information about Icelandic mountain roads and changing road conditions.",
)

ROAD_OPENINGS = source(
    "Icelandic Road and Coastal Administration - Opening of mountain roads",
    "https://www.vegagerdin.is/en/the-transportation-system/the-road-system/roads/opening-of-mountain-roads",
    "official-road-authority",
    "Official seasonal mountain-road opening information and highland travel guidance.",
)

ICELAND_MET = source(
    "Icelandic Meteorological Office - Climate of Iceland",
    "https://en.vedur.is/climatology/iceland/nr/1268",
    "meteorological-agency",
    "Official climate overview from the Icelandic Meteorological Office.",
)

VISIT_REYKJAVIK_PAYMENTS = source(
    "Visit Reykjavik - Currency, credit cards and banks",
    "https://visitreykjavik.is/currency-credit-cards-and-banks",
    "official-local-tourism-board",
    "Official Reykjavik visitor information about Icelandic currency and payments.",
)

LANDMANNALAUGAR_RESERVATIONS = source(
    "Landmannalaugar Reservations",
    "https://landmannalaugar.org/reservations/",
    "destination-operator",
    "Visitor reservation and service-fee information for Landmannalaugar.",
)

SAFE_TRAVEL = source(
    "SafeTravel Iceland",
    "https://safetravel.is/",
    "official-safety-resource",
    "Official safety resource for Iceland travel conditions and trip preparation.",
)


ICELAND_COUNTRY = {
    "slug": "iceland",
    "name": "Iceland",
    "country_code": "IS",
    "flag": "ðŸ‡®ðŸ‡¸",
    "region": "Nordic Europe",
    "currency": {
        "name": "Icelandic krona",
        "code": "ISK",
    },
    "languages": ["Icelandic", "English widely spoken in visitor areas"],
    "timezone": "Atlantic/Reykjavik",
    "emergency_numbers": ["112"],
    "visa_entry_summary": {
        "title": "Entry requirements",
        "body": (
            "Iceland is part of the Schengen area. Entry rules depend on nationality; "
            "non-EEA/EFTA visitors generally need valid travel documents and may need a visa "
            "unless exempt. Travelers should verify current requirements before departure."
        ),
        "sources": [ISLAND_IS_ENTRY],
    },
    "travel_styles": [
        "Adventure",
        "Nature",
        "Road Trips",
        "Photography",
        "Hiking",
        "Slow Travel",
    ],
    "hero_media": {
        "url": "https://images.unsplash.com/photo-1504829857797-ddff29c27927?auto=format&fit=crop&w=1800&q=85",
        "alt_text": "Icelandic waterfall and green cliffs in summer light",
        "credit": "Unsplash",
        "source": VISIT_ICELAND,
    },
    "featured_category": "Scenic Beauty",
    "journey_title": "Highlands to Black-Sand Coast",
    "journey_intro": (
        "A route shaped by volcanic color, highland tracks, glacial rivers, and coastal drama."
    ),
    "overview": (
        "Iceland is a North Atlantic destination shaped by glaciers, volcanoes, geothermal "
        "landscapes, black-sand coastlines, highland routes, and compact communities. Travel "
        "often rewards flexible planning because weather, roads, and daylight can strongly "
        "shape each day."
    ),
    "culture_notes": [
        {
            "title": "Local culture and landscape",
            "body": (
                "Icelandic travel culture is closely tied to nature, weather awareness, "
                "geothermal bathing, local swimming pools, literature, music, and small-town "
                "hospitality. Respect for fragile landscapes is a practical expectation, not "
                "just a courtesy."
            ),
            "sources": [VISIT_ICELAND, VISIT_SOUTH_ICELAND],
        },
        {
            "title": "Food culture",
            "body": (
                "Visitors commonly encounter seafood, lamb, dairy products, geothermal-grown "
                "greenhouse produce, local bakeries, hot dogs, and coffee culture. In South "
                "Iceland, local seafood and agricultural produce are especially visible."
            ),
            "sources": [VISIT_SOUTH_ICELAND],
        },
    ],
    "etiquette_notes": [
        {
            "title": "Nature-first etiquette",
            "body": (
                "Stay on marked paths, respect closures, avoid damaging moss and fragile "
                "highland vegetation, and check local conditions before entering remote areas."
            ),
            "sources": [ROAD_OPENINGS, SAFE_TRAVEL],
        },
        {
            "title": "Thermal pools and local spaces",
            "body": (
                "Public pools and geothermal bathing are part of everyday life. Follow posted "
                "pool rules, shower before entering pools where required, and keep natural hot "
                "springs clean."
            ),
            "sources": [VISIT_ICELAND],
        },
    ],
    "communication_notes": [
        {
            "title": "Language and communication",
            "body": (
                "Icelandic is the national language. English is widely used in visitor-facing "
                "settings, but a few Icelandic greetings or thanks are a thoughtful gesture."
            ),
            "sources": [VISIT_ICELAND],
        }
    ],
    "common_visitor_mistakes": [
        {
            "title": "Underestimating weather and roads",
            "body": (
                "A common mistake is planning too tightly without allowing for weather changes, "
                "road conditions, long distances, and highland access restrictions."
            ),
            "sources": [ICELAND_MET, ROAD_AUTHORITY, SAFE_TRAVEL],
        },
        {
            "title": "Treating the Highlands like ordinary roads",
            "body": (
                "Highland roads are seasonal, condition-dependent, and often require suitable "
                "vehicles and careful preparation."
            ),
            "sources": [ROAD_AUTHORITY, ROAD_OPENINGS],
        },
    ],
    "local_insights": [
        {
            "title": "Pools are part of daily life",
            "category": "everyday-life",
            "content": (
                "Geothermal pools are not just visitor attractions; they are everyday social spaces. "
                "Follow posted shower and pool rules so the experience stays comfortable for local bathers too."
            ),
            "sources": [VISIT_ICELAND],
        },
        {
            "title": "Weather is a planning partner",
            "category": "travel-rhythm",
            "content": (
                "Local travel planning treats weather and road updates as part of the day. Build flexible routes "
                "and check conditions before committing to remote drives or hikes."
            ),
            "sources": [ICELAND_MET, SAFE_TRAVEL, ROAD_AUTHORITY],
        },
        {
            "title": "Moss and highland ground recover slowly",
            "category": "landscape-etiquette",
            "content": (
                "Fragile vegetation and highland terrain can be damaged by shortcuts or off-road driving. Staying "
                "on marked routes is one of the clearest ways visitors show respect for Iceland's landscape."
            ),
            "sources": [ROAD_OPENINGS, SAFE_TRAVEL],
        },
        {
            "title": "Distances feel different outside Reykjavik",
            "category": "practical-culture",
            "content": (
                "Short-looking drives can involve gravel roads, one-lane bridges, wind, and limited services. "
                "Locals and official safety resources emphasize route checks over fixed schedules."
            ),
            "sources": [ROAD_AUTHORITY, SAFE_TRAVEL],
        },
        {
            "title": "Food reflects sea, farms, and geothermal growing",
            "category": "food-culture",
            "content": (
                "Seafood, lamb, dairy, bakeries, greenhouse produce, coffee, and regional ingredients shape many "
                "visitor meals, especially around South Iceland's coastal and agricultural communities."
            ),
            "sources": [VISIT_SOUTH_ICELAND],
        },
        {
            "title": "English helps, Icelandic still lands warmly",
            "category": "communication",
            "content": (
                "English is widely used in visitor-facing settings, but simple Icelandic greetings and thanks are "
                "a respectful way to acknowledge the local language."
            ),
            "sources": [VISIT_ICELAND],
        },
    ],
    "local_phrases": [
        {
            "english": "Hello",
            "local": "Halló",
            "pronunciation": "HA-loh",
            "usage_note": "A simple casual greeting in visitor-facing settings.",
            "sources": [VISIT_ICELAND],
        },
        {
            "english": "Thank you",
            "local": "Takk",
            "pronunciation": "tahk",
            "usage_note": "Useful after service, directions, or small everyday help.",
            "sources": [VISIT_ICELAND],
        },
        {
            "english": "Goodbye",
            "local": "Bless",
            "pronunciation": "bless",
            "usage_note": "Common informal goodbye.",
            "sources": [VISIT_ICELAND],
        },
        {
            "english": "Cheers",
            "local": "Skál",
            "pronunciation": "skowl",
            "usage_note": "Used when raising a glass.",
            "sources": [VISIT_ICELAND],
        },
        {
            "english": "Excuse me",
            "local": "Afsakið",
            "pronunciation": "AV-sa-kith",
            "usage_note": "Helpful when getting attention politely.",
            "sources": [VISIT_ICELAND],
        },
        {
            "english": "Good day",
            "local": "Góðan daginn",
            "pronunciation": "GO-than DY-in",
            "usage_note": "A polite daytime greeting.",
            "sources": [VISIT_ICELAND],
        },
    ],
    "practical_notes": [
        {
            "title": "Money and payment",
            "body": (
                "The currency is the Icelandic krona. Cards and contactless payments are widely "
                "accepted, and visitors usually need little cash."
            ),
            "sources": [VISIT_REYKJAVIK_PAYMENTS],
        },
        {
            "title": "Transport overview",
            "body": (
                "Self-driving is common outside Reykjavik, but travelers should check road and "
                "weather conditions, especially before rural routes, one-lane bridges, gravel "
                "roads, or highland roads."
            ),
            "sources": [ROAD_AUTHORITY, SAFE_TRAVEL],
        },
        {
            "title": "Packing guidance",
            "body": (
                "Pack layers, waterproof outerwear, sturdy footwear, and backup warmth even in "
                "summer, because Icelandic weather changes quickly."
            ),
            "sources": [ICELAND_MET, SAFE_TRAVEL],
        },
        {
            "title": "Safety and emergency",
            "body": (
                "Call 112 for emergencies. Remote travel should include checking conditions, "
                "sharing plans, and carrying enough supplies for delays."
            ),
            "sources": [EMERGENCY_112, SAFE_TRAVEL],
        },
    ],
    "sources": [
        VISIT_ICELAND,
        ISLAND_IS_ENTRY,
        EMERGENCY_112,
        ROAD_AUTHORITY,
        ICELAND_MET,
        VISIT_REYKJAVIK_PAYMENTS,
    ],
}


ICELAND_PLACES = [
    {
        "slug": "landmannalaugar",
        "country_slug": "iceland",
        "name": "Landmannalaugar",
        "region": "Fjallabak Nature Reserve, South Highlands",
        "type": "Highland geothermal and hiking area",
        "story": (
            "Landmannalaugar sits among rhyolite mountains, lava fields, hot springs, and "
            "highland trails, making it one of Iceland's most distinctive summer landscapes."
        ),
        "description": (
            "A colorful highland destination known for geothermal bathing, volcanic terrain, "
            "day hikes, and access to longer trekking routes such as the Laugavegur trail."
        ),
        "media": [
            {
                "url": "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=84",
                "alt_text": "Colorful mountain landscape under soft daylight",
                "credit": "Unsplash",
                "source": VISIT_SOUTH_ICELAND,
            }
        ],        "why_visit": (
            "Go for surreal mountain color, geothermal water, highland silence, and hiking "
            "that feels far removed from the coastal ring-road rhythm."
        ),
        "time_required": "Full day or overnight trek base",
        "highlights": [
            "Rhyolite mountains",
            "Laugahraun lava field",
            "Natural geothermal bathing area",
            "Laugavegur trail access",
            "Highland photography",
        ],
        "tags": ["hiking", "nature", "photography", "adventure"],
        "activities": ["Hiking", "Photography", "Geothermal bathing", "Trekking"],
        "local_experience": (
            "Treat the drive and weather window as part of the experience; many visitors pair "
            "short hikes with a soak and a slow return through the Highlands."
        ),
        "access_notes": [
            {
                "title": "Seasonal highland access",
                "body": (
                    "Access depends on highland road openings and current conditions. Visitors "
                    "driving in summer may need to follow reservation and service-fee rules."
                ),
                "sources": [ROAD_AUTHORITY, ROAD_OPENINGS, LANDMANNALAUGAR_RESERVATIONS],
            }
        ],
        "local_vibe_notes": [
            "Highland",
            "Geothermal",
            "Hiking",
            "Photography",
            "Remote",
        ],
        "safety_warnings": [
            {
                "title": "Remote travel preparation",
                "body": (
                    "Check weather and road conditions before departure, plan for delays, and "
                    "avoid treating highland roads as ordinary paved routes."
                ),
                "sources": [ROAD_AUTHORITY, SAFE_TRAVEL],
            }
        ],
        "seasonal_warnings": [
            {
                "title": "Summer access window",
                "body": (
                    "Highland routes generally depend on snowmelt and road conditions, with "
                    "openings varying by year."
                ),
                "sources": [ROAD_OPENINGS],
            }
        ],
        "sources": [VISIT_SOUTH_ICELAND, ROAD_AUTHORITY, LANDMANNALAUGAR_RESERVATIONS],
    },
    {
        "slug": "thorsmork",
        "country_slug": "iceland",
        "name": "ÃžÃ³rsmÃ¶rk",
        "region": "South Highlands",
        "type": "Mountain valley and hiking area",
        "story": (
            "ÃžÃ³rsmÃ¶rk is a sheltered highland valley framed by glaciers, braided rivers, birch "
            "woodland, and volcanic ridges."
        ),
        "description": (
            "A dramatic hiking destination reached through rugged highland terrain, known for "
            "views toward glaciers, green valleys, and links to long-distance trails."
        ),
        "media": [
            {
                "url": "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=900&q=84",
                "alt_text": "Green mountain valley with dramatic peaks",
                "credit": "Unsplash",
                "source": VISIT_SOUTH_ICELAND,
            }
        ],        "why_visit": (
            "Choose ÃžÃ³rsmÃ¶rk for immersive hiking, mountain views, and a feeling of entering a "
            "remote natural amphitheater."
        ),
        "time_required": "Full day with specialized transport or multi-day trek",
        "highlights": [
            "Glacier-framed valleys",
            "Highland hiking routes",
            "Braided river landscapes",
            "Laugavegur and FimmvÃ¶rÃ°uhÃ¡ls trail connections",
        ],
        "tags": ["hiking", "mountains", "nature", "adventure"],
        "activities": ["Hiking", "Trekking", "Photography", "Nature"],
        "local_experience": (
            "Arrive with flexible timing and respect for conditions; many travelers use "
            "specialized buses or guided transport instead of driving themselves."
        ),
        "access_notes": [
            {
                "title": "River crossings and highland roads",
                "body": (
                    "Access to ÃžÃ³rsmÃ¶rk involves highland roads and river crossings. Conditions "
                    "should be checked before travel, and unsuitable vehicles should not attempt "
                    "the route."
                ),
                "sources": [ROAD_AUTHORITY, ROAD_OPENINGS, SAFE_TRAVEL],
            }
        ],
        "local_vibe_notes": ["Remote", "Hiking", "Glacial", "Valley", "Expedition"],
        "safety_warnings": [
            {
                "title": "Do not improvise river crossings",
                "body": (
                    "Travelers should use appropriate transport, check current conditions, and "
                    "avoid crossing rivers without the right vehicle and experience."
                ),
                "sources": [ROAD_AUTHORITY, SAFE_TRAVEL],
            }
        ],
        "seasonal_warnings": [
            {
                "title": "Access changes by season",
                "body": (
                    "Highland access is seasonal and can change quickly with weather and river "
                    "conditions."
                ),
                "sources": [ROAD_AUTHORITY, ROAD_OPENINGS],
            }
        ],
        "sources": [VISIT_SOUTH_ICELAND, ROAD_AUTHORITY, SAFE_TRAVEL],
    },
    {
        "slug": "south-coast",
        "country_slug": "iceland",
        "name": "South Coast",
        "region": "South Iceland",
        "type": "Coastal scenic region",
        "story": (
            "Iceland's South Coast gathers waterfalls, glaciers, black-sand beaches, sea cliffs, "
            "farms, villages, and volcanic landscapes into one of the country's most accessible "
            "travel corridors."
        ),
        "description": (
            "A broad coastal route with famous sights such as waterfalls, glacier views, black "
            "sand beaches, and access points toward hiking regions and VatnajÃ¶kull landscapes."
        ),
        "media": [
            {
                "url": "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=84",
                "alt_text": "Icelandic black sand coast with dramatic mountains",
                "credit": "Unsplash",
                "source": VISIT_ICELAND,
            }
        ],        "why_visit": (
            "Visit for high-impact scenery without committing to remote highland access: "
            "waterfalls, beaches, glaciers, and small-town stops fit naturally into a road trip."
        ),
        "time_required": "One long day to several days",
        "highlights": [
            "Waterfalls",
            "Black-sand beaches",
            "Glacier views",
            "Coastal villages",
            "Volcanic landscapes",
        ],
        "tags": ["waterfalls", "road-trip", "photography", "landscapes"],
        "activities": ["Road Trips", "Photography", "Waterfalls", "Glacier walks", "Food"],
        "local_experience": (
            "Move slowly, watch the weather, and give coastal stops more time than the map "
            "suggests; the route is as much about pauses as destinations."
        ),
        "access_notes": [
            {
                "title": "Road-trip conditions",
                "body": (
                    "The South Coast is more accessible than the Highlands, but weather, wind, "
                    "visibility, coastal hazards, and winter conditions still require planning."
                ),
                "sources": [VISIT_ICELAND, ROAD_AUTHORITY, SAFE_TRAVEL],
            }
        ],
        "local_vibe_notes": ["Coastal", "Scenic", "Accessible", "Waterfalls", "Glaciers"],
        "safety_warnings": [
            {
                "title": "Coastal and weather hazards",
                "body": (
                    "Visitors should follow local warnings near beaches and exposed coastal "
                    "areas and check conditions before driving."
                ),
                "sources": [VISIT_ICELAND, SAFE_TRAVEL],
            }
        ],
        "seasonal_warnings": [
            {
                "title": "Rapid weather changes",
                "body": (
                    "Even accessible routes can be affected by wind, rain, limited visibility, "
                    "and changing road conditions."
                ),
                "sources": [ICELAND_MET, ROAD_AUTHORITY],
            }
        ],
        "sources": [VISIT_ICELAND, VISIT_SOUTH_ICELAND, ROAD_AUTHORITY],
    },
]


ICELAND_AUGUST_2026_MONTHLY_FACTORS = {
    "year": 2026,
    "month": 8,
    "country_slug": "iceland",
    "weather_climate": {
        "summary": (
            "August is within Iceland's summer tourist season. Conditions are generally cool, "
            "changeable, and often cloudy or wet, with south and west Iceland receiving more "
            "rainfall than northern areas."
        ),
        "temperature_range": "Cool summer conditions; daytime air is usually cool and nights can be cold.",
        "rainfall_summary": (
            "Rain and cloud are common, especially in the south and west, because mild Atlantic "
            "air frequently meets colder Arctic air."
        ),
        "daylight_summary": (
            "August still has long daylight compared with winter, but daylight is decreasing "
            "from the near-24-hour light of early summer."
        ),
        "sources": [ICELAND_MET],
    },
    "weather_suitability_input": (
        "Summer travel is feasible across many regions, but plans should remain flexible because "
        "Icelandic weather changes quickly and can affect roads, hikes, and visibility."
    ),
    "daylight_information": (
        "Daylight remains generous in August compared with winter months, supporting long travel "
        "days and evening photography, while no longer matching the peak midnight-sun period."
    ),
    "seasonal_conditions": [
        {
            "title": "Summer travel season",
            "body": (
                "August falls inside the late-May to early-September summer tourist season, when "
                "many outdoor routes and services are more accessible than in winter."
            ),
            "sources": [ICELAND_MET],
        },
        {
            "title": "Highland access",
            "body": (
                "Many mountain roads are typically accessed during summer, but openings and "
                "conditions vary and must be checked for the current day."
            ),
            "sources": [ROAD_AUTHORITY, ROAD_OPENINGS],
        },
    ],
    "seasonal_highlights": [
        "Highland hiking",
        "Road trips",
        "Waterfalls",
        "Glacier landscapes",
        "Long daylight photography",
    ],
    "accessibility_information": (
        "August can support access to highland destinations such as Landmannalaugar and "
        "ÃžÃ³rsmÃ¶rk when roads are open, but conditions, vehicle suitability, and reservations "
        "must be checked before travel."
    ),
    "seasonal_activities": [
        "Hiking",
        "Trekking",
        "Road trips",
        "Geothermal bathing",
        "Photography",
        "Glacier-view touring",
    ],
    "event_activity_density_input": (
        "Summer generally brings high visitor activity and more outdoor tour availability. "
        "Specific event dates should be verified from official organizers before publication."
    ),
    "affordability_value_input": (
        "August is part of Iceland's main summer travel season, so travelers should expect high "
        "demand for accommodation, rental vehicles, and guided activities."
    ),
    "travel_conditions": [
        {
            "title": "Road and weather checks",
            "body": (
                "Travelers should check road and weather conditions before setting out, "
                "especially for remote areas, highland routes, and long driving days."
            ),
            "sources": [ROAD_AUTHORITY, SAFE_TRAVEL, ICELAND_MET],
        },
        {
            "title": "Landmannalaugar reservation period",
            "body": (
                "Visitors driving to Landmannalaugar during the summer daytime reservation "
                "period should verify current reservation and service-fee requirements."
            ),
            "sources": [LANDMANNALAUGAR_RESERVATIONS],
        },
    ],
    "seasonal_warnings": [
        {
            "title": "Weather can override plans",
            "body": (
                "Rain, wind, cloud, and fast-changing conditions can affect visibility, hiking, "
                "road safety, and comfort even in summer."
            ),
            "sources": [ICELAND_MET, SAFE_TRAVEL],
        },
        {
            "title": "Highland road restrictions",
            "body": (
                "Mountain-road conditions change through the season; highland routes should not "
                "be attempted without checking current official conditions."
            ),
            "sources": [ROAD_AUTHORITY, ROAD_OPENINGS],
        },
    ],
    "sources": [ICELAND_MET, ROAD_AUTHORITY, ROAD_OPENINGS, SAFE_TRAVEL],
}


def get_iceland_seed_dataset():
    return {
        "country": ICELAND_COUNTRY,
        "places": ICELAND_PLACES,
        "monthly_factors": [ICELAND_AUGUST_2026_MONTHLY_FACTORS],
    }


def validate_iceland_seed_dataset():
    dataset = get_iceland_seed_dataset()
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
