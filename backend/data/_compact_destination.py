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
    source_type: str = "official-tourism-board",
    notes: str | None = None,
    confidence: float = 0.88,
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


def text_note(title: str, body: str, sources: list[dict]):
    return {"title": title, "body": body, "sources": sources}


def media(url: str, alt_text: str, source_record: dict):
    return {
        "url": url,
        "alt_text": alt_text,
        "credit": "Unsplash",
        "source": source_record,
    }


def place(
    slug: str,
    country_slug: str,
    name: str,
    region: str,
    kind: str,
    description: str,
    highlights: list[str],
    tags: list[str],
    activities: list[str],
    source_record: dict,
    image_url: str,
):
    return {
        "slug": slug,
        "country_slug": country_slug,
        "name": name,
        "region": region,
        "type": kind,
        "story": description,
        "description": description,
        "media": [media(image_url, f"{name} travel landscape", source_record)],
        "why_visit": f"Visit for {', '.join(highlights[:3]).lower()} and a strong local travel rhythm.",
        "time_required": "2-4 days",
        "highlights": highlights,
        "tags": tags,
        "activities": activities,
        "local_experience": (
            "Use the destination as more than a checklist stop: leave time for neighborhoods, "
            "local food, seasonal pacing, and transit buffers."
        ),
        "access_notes": [
            text_note(
                "Plan local access",
                "Check official transport, opening, and visitor guidance before finalizing the route.",
                [source_record],
            )
        ],
        "local_vibe_notes": tags[:5],
        "safety_warnings": [
            text_note(
                "Use normal visitor awareness",
                "Keep valuables secure, follow local guidance, and adjust plans around weather or crowd conditions.",
                [source_record],
            )
        ],
        "seasonal_warnings": [
            text_note(
                "August conditions",
                "August can bring heat, rain, crowds, or high demand depending on region and elevation.",
                [source_record],
            )
        ],
        "sources": [source_record],
    }


def build_compact_destination(
    *,
    slug: str,
    name: str,
    country_code: str,
    region: str,
    currency_name: str,
    currency_code: str,
    languages: list[str],
    timezone: str,
    emergency_numbers: list[str],
    travel_styles: list[str],
    featured_category: str,
    journey_title: str,
    journey_intro: str,
    overview: str,
    phrases: list[tuple[str, str, str]],
    source_record: dict,
    image_url: str,
    places: list[dict],
    weather_summary: str,
    temperature_range: str,
    rainfall_summary: str,
    seasonal_highlights: list[str],
    seasonal_activities: list[str],
    affordability: str,
):
    country = {
        "slug": slug,
        "name": name,
        "country_code": country_code,
        "region": region,
        "currency": {"name": currency_name, "code": currency_code},
        "languages": languages,
        "timezone": timezone,
        "emergency_numbers": emergency_numbers,
        "visa_entry_summary": text_note(
            "Entry requirements vary by nationality",
            "Travelers should verify current passport, visa, eTA, or entry rules with official sources before departure.",
            [source_record],
        ),
        "travel_styles": travel_styles,
        "hero_media": media(image_url, f"{name} travel landscape", source_record),
        "featured_category": featured_category,
        "journey_title": journey_title,
        "journey_intro": journey_intro,
        "overview": overview,
        "culture_notes": [
            text_note(
                "Local identity",
                f"{name} rewards travelers who respect regional identity, food traditions, public spaces, and local pace.",
                [source_record],
            )
        ],
        "etiquette_notes": [
            text_note(
                "Be locally observant",
                "Greet people politely, ask before photographing people, and follow posted rules at religious, natural, and heritage sites.",
                [source_record],
            )
        ],
        "communication_notes": [
            text_note(
                "Language basics help",
                "English may be available in visitor areas, but simple local greetings make everyday exchanges easier.",
                [source_record],
            )
        ],
        "common_visitor_mistakes": [
            text_note(
                "Overpacking the itinerary",
                "Travel times, weather, crowds, and regional distances can make rushed plans feel brittle.",
                [source_record],
            )
        ],
        "local_insights": [
            {
                "title": "Start with regional context",
                "category": "culture",
                "content": "Food, etiquette, transport, and daily rhythm can shift meaningfully between regions.",
                "sources": [source_record],
            },
            {
                "title": "Let season shape the route",
                "category": "seasonal-rhythm",
                "content": "August plans work best when heat, rain, daylight, and peak-season demand are treated as planning inputs.",
                "sources": [source_record],
            },
        ],
        "local_phrases": [
            {
                "english": english,
                "local": local,
                "pronunciation": pronunciation,
                "usage_note": "Useful for simple, polite visitor interactions.",
                "sources": [source_record],
            }
            for english, local, pronunciation in phrases
        ],
        "practical_notes": [
            text_note(
                "Money and payment",
                f"{name} uses the {currency_name}. Carry a backup payment method and some small local cash where appropriate.",
                [source_record],
            ),
            text_note(
                "Emergency",
                f"Emergency numbers commonly used by visitors include: {', '.join(emergency_numbers)}.",
                [source_record],
            ),
        ],
        "sources": [source_record],
    }
    monthly_factor = {
        "year": 2026,
        "month": 8,
        "country_slug": slug,
        "weather_climate": {
            "summary": weather_summary,
            "temperature_range": temperature_range,
            "rainfall_summary": rainfall_summary,
            "daylight_summary": "August daylight generally supports full travel days, with local variation by latitude.",
            "sources": [source_record],
        },
        "weather_suitability_input": weather_summary,
        "daylight_information": "Plan early starts for outdoor highlights and keep flexibility for evenings.",
        "seasonal_conditions": [
            text_note("August travel season", weather_summary, [source_record])
        ],
        "seasonal_highlights": seasonal_highlights,
        "accessibility_information": "Major visitor routes are accessible, but local transport, tickets, and weather checks still matter.",
        "seasonal_activities": seasonal_activities,
        "event_activity_density_input": "August supports visitor activity; specific event dates should be verified with official organizers.",
        "affordability_value_input": affordability,
        "travel_conditions": [
            text_note(
                "Book key logistics early",
                "Popular routes, accommodation, and guided experiences can sell out during busy periods.",
                [source_record],
            )
        ],
        "seasonal_warnings": [
            text_note(
                "Seasonal awareness",
                "Check official guidance for weather, health, safety, and site access before travel.",
                [source_record],
            )
        ],
        "sources": [source_record],
    }
    return {
        "country": country,
        "places": places,
        "monthly_factors": [monthly_factor],
    }


def validate_compact_destination(dataset: dict):
    country = DestinationCountryCreate(**dataset["country"])
    places = [DestinationPlaceCreate(**place_data) for place_data in dataset["places"]]
    monthly_factors = [
        DestinationMonthlyFactorsCreate(**monthly_factor)
        for monthly_factor in dataset["monthly_factors"]
    ]
    invalid_places = [
        place_data.slug
        for place_data in places
        if place_data.country_slug != country.slug
    ]
    invalid_months = [
        monthly_factor.month
        for monthly_factor in monthly_factors
        if monthly_factor.country_slug != country.slug
    ]

    if invalid_places:
        raise ValueError(f"Places reference unknown country_slug: {invalid_places}")

    if invalid_months:
        raise ValueError(f"Monthly factors reference unknown country_slug: {invalid_months}")

    return {
        "country_slug": country.slug,
        "place_slugs": [place_data.slug for place_data in places],
        "monthly_factors": [
            {"year": monthly_factor.year, "month": monthly_factor.month}
            for monthly_factor in monthly_factors
        ],
    }
