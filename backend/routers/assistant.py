from __future__ import annotations

from typing import Any, List, Optional

from bson import ObjectId
from fastapi import APIRouter, HTTPException, status
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel, Field

from services.destination_recommendations import (
    get_country_recommendations,
    get_featured_recommendations,
    resolve_year_month,
)
from services.gemini_local_vibe import (
    GeminiAssistantError,
    build_local_vibe_context,
    generate_chat_message,
    generate_discovery_chat_message,
    generate_itinerary as generate_gemini_itinerary,
    log_gemini_fallback,
)


router = APIRouter(prefix="/assistant", tags=["assistant"])


class LocalVibeChatRequest(BaseModel):
    country_slug: str = Field(..., min_length=2, max_length=80)
    country: Optional[str] = Field(default=None, max_length=120)
    message: str = Field(..., min_length=1, max_length=1200)
    year: Optional[int] = Field(default=None, ge=2000, le=2100)
    month: Optional[int] = Field(default=None, ge=1, le=12)
    selected_place_slugs: List[str] = Field(default_factory=list, max_length=8)


class LocalVibeItineraryRequest(BaseModel):
    country_slug: str = Field(..., min_length=2, max_length=80)
    country: Optional[str] = Field(default=None, max_length=120)
    days: int = Field(default=5, ge=1, le=21)
    budget: Optional[str] = Field(default=None, max_length=120)
    interests: Optional[str] = Field(default=None, max_length=300)
    pace: Optional[str] = Field(default="Balanced", max_length=80)
    year: Optional[int] = Field(default=None, ge=2000, le=2100)
    month: Optional[int] = Field(default=None, ge=1, le=12)
    selected_place_slugs: List[str] = Field(default_factory=list, max_length=8)


class LocalVibeDiscoveryChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1200)
    year: Optional[int] = Field(default=None, ge=2000, le=2100)
    month: Optional[int] = Field(default=None, ge=1, le=12)


MONTH_NAMES = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
]


def month_name(month: int) -> str:
    return MONTH_NAMES[month - 1]


def selected_recommendations(
    recommendations: list[dict[str, Any]],
    selected_place_slugs: list[str],
) -> list[dict[str, Any]]:
    if not selected_place_slugs:
        return recommendations

    selected = [
        recommendation
        for recommendation in recommendations
        if recommendation.get("place_slug") in selected_place_slugs
    ]
    return selected or recommendations


def destination_context_or_404(
    country_slug: str,
    *,
    year: int | None,
    month: int | None,
):
    context = get_country_recommendations(
        country_slug,
        year=year,
        month=month,
        limit=4,
    )

    if context is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Destination country not found",
        )

    return context


def format_place_names(places: list[dict[str, Any]]) -> str:
    names = [
        str(place.get("place_name") or place.get("place_slug")).strip()
        for place in places
        if place.get("place_name") or place.get("place_slug")
    ]

    if not names:
        return "the recommended places"

    if len(names) == 1:
        return names[0]

    return f"{', '.join(names[:-1])}, and {names[-1]}"


def build_deterministic_chat_answer(
    *,
    country_name: str,
    year: int,
    month: int,
    monthly_factor: dict[str, Any],
    places: list[dict[str, Any]],
    user_message: str,
) -> str:
    place_names = format_place_names(places)
    first_place = places[0] if places else {}
    message = user_message.strip().lower()

    if "pack" in message:
        return (
            f"For {country_name} in {month_name(month)} {year}, pack around the season first: "
            f"{monthly_factor.get('weather_suitability_input') or 'expect regional variation and check local forecasts.'} "
            "Bring comfortable walking shoes, a light layer, weather protection, a backup payment method, "
            "and offline copies of bookings and maps."
        )

    if "budget" in message or "cost" in message:
        return (
            f"For {country_name}, the current value signal is: "
            f"{monthly_factor.get('affordability_value_input') or first_place.get('budget_value') or 'plan a flexible budget around accommodation, transport, food, and key experiences.'} "
            f"Prioritize {place_names} and book the logistics that are hardest to replace."
        )

    if "route" in message or "first" in message or "itinerary" in message:
        return (
            f"Start with {place_names}. These are the strongest CoVoyage picks for "
            f"{month_name(month)} {year}. Keep the route simple, anchor each stop around one main experience, "
            "and leave buffers for weather, transport, and local meals."
        )

    if "etiquette" in message or "culture" in message:
        notes = (
            monthly_factor.get("_country_etiquette_notes")
            or monthly_factor.get("_country_culture_notes")
            or []
        )
        note_text = notes[0].get("body") if notes else None

        return (
            f"For {country_name}, the useful starting point is: "
            f"{note_text or 'observe local pace, greet people politely, ask before photographing people, and follow rules at cultural, religious, and natural sites.'}"
        )

    return (
        f"I am grounding this in CoVoyage's {month_name(month)} {year} destination data for {country_name}. "
        f"The best current places to build around are {place_names}. "
        f"{monthly_factor.get('weather_suitability_input') or first_place.get('seasonal_note') or 'Use the current season, local access, and community context to shape the route.'}"
    )


def build_deterministic_itinerary(
    *,
    places: list[dict[str, Any]],
    days_count: int,
) -> list[dict[str, Any]]:
    days = []

    for day_number in range(1, days_count + 1):
        place = places[(day_number - 1) % len(places)]
        place_name = place.get("place_name") or place.get("place_slug")
        experiences = place.get("experiences") or ["local exploring"]
        focus = experiences[(day_number - 1) % len(experiences)]

        days.append(
            {
                "day": day_number,
                "place": place_name,
                "focus": focus,
                "morning": f"Start in {place_name} with a relaxed orientation walk.",
                "afternoon": f"Build the day around {focus} and one local food or culture stop.",
                "evening": "Keep the evening flexible for neighborhood dining, rest, or a community/event option.",
                "local_vibe_note": (
                    place.get("recommendation_reason")
                    or place.get("seasonal_note")
                    or "Let the season shape the pace."
                ),
            }
        )

    return days


def compact_featured_destination(destination: dict[str, Any]) -> dict[str, Any]:
    country = destination.get("country") or {}
    places = destination.get("recommended_places") or destination.get("selected_places") or []

    return {
        "rank": destination.get("rank"),
        "country_slug": destination.get("country_slug") or destination.get("slug"),
        "country_name": destination.get("country_name") or country.get("name"),
        "region": country.get("region"),
        "travel_styles": country.get("travel_styles") or [],
        "recommendation_reason": destination.get("recommendation_reason")
        or destination.get("why_now"),
        "score": destination.get("final_score") or destination.get("score"),
        "recommended_places": [
            {
                "rank": place.get("rank"),
                "slug": place.get("place_slug"),
                "name": place.get("place_name"),
                "reason": place.get("recommendation_reason"),
                "seasonal_note": place.get("seasonal_note"),
                "experiences": place.get("experiences") or [],
                "budget_value": place.get("budget_value"),
            }
            for place in places[:4]
        ],
    }


def build_discovery_context(
    featured_snapshot: dict[str, Any],
    *,
    year: int,
    month: int,
) -> dict[str, Any]:
    return {
        "month": {
            "year": year,
            "month": month,
            "label": month_name(month),
        },
        "featured_destinations": [
            compact_featured_destination(destination)
            for destination in featured_snapshot.get("destinations", [])[:5]
        ],
    }


def build_deterministic_discovery_answer(
    *,
    featured_snapshot: dict[str, Any],
    year: int,
    month: int,
    user_message: str,
) -> str:
    destinations = featured_snapshot.get("destinations", [])
    names = [
        destination.get("country_name")
        or (destination.get("country") or {}).get("name")
        or destination.get("country_slug")
        for destination in destinations[:3]
    ]
    names = [str(name) for name in names if name]
    destination_text = ", ".join(names[:-1]) + f", and {names[-1]}" if len(names) > 1 else (names[0] if names else "the featured destinations")
    message = user_message.strip().lower()

    if "budget" in message or "cheap" in message or "value" in message:
        return (
            f"For {month_name(month)} {year}, compare value by looking at "
            f"{destination_text}. Prioritize destinations with flexible routing, "
            "off-peak accommodation, and shorter local transfers."
        )

    if "where" in message or "best" in message or "recommend" in message:
        return (
            f"Start with {destination_text}. These are the current CoVoyage featured "
            f"destinations for {month_name(month)} {year}; open a country page when "
            "you want place-level routes, etiquette, events, and itinerary help."
        )

    return (
        f"CoVoyage is looking at the {month_name(month)} {year} featured destinations: "
        f"{destination_text}. Ask about budget, weather, culture, events, route style, "
        "or which country page to explore first."
    )


def selected_destination_context(
    request: LocalVibeChatRequest | LocalVibeItineraryRequest,
) -> tuple[dict[str, Any], int, int, str, list[dict[str, Any]]]:
    context = destination_context_or_404(
        request.country_slug,
        year=request.year,
        month=request.month,
    )
    year, month = resolve_year_month(request.year, request.month)
    country_name = context["country"].get("name") or request.country or request.country_slug
    places = selected_recommendations(
        context["recommendations"],
        request.selected_place_slugs,
    )

    return context, year, month, country_name, places


@router.post("/local-vibe/chat")
def local_vibe_chat(request: LocalVibeChatRequest):
    context, year, month, country_name, places = selected_destination_context(request)
    monthly_factor = dict(context.get("monthly_factor") or {})
    monthly_factor["_country_etiquette_notes"] = context["country"].get(
        "etiquette_notes"
    ) or []
    monthly_factor["_country_culture_notes"] = context["country"].get(
        "culture_notes"
    ) or []
    assistant_context = build_local_vibe_context(
        context,
        places,
        year=year,
        month=month,
        month_label=month_name(month),
    )

    try:
        answer = generate_chat_message(
            assistant_context,
            user_message=request.message,
        )
        response_source = "gemini"
    except GeminiAssistantError as error:
        log_gemini_fallback("chat", error)
        answer = build_deterministic_chat_answer(
            country_name=country_name,
            year=year,
            month=month,
            monthly_factor=monthly_factor,
            places=places,
            user_message=request.message,
        )
        response_source = "fallback"
    except Exception as error:
        log_gemini_fallback("chat", error)
        answer = build_deterministic_chat_answer(
            country_name=country_name,
            year=year,
            month=month,
            monthly_factor=monthly_factor,
            places=places,
            user_message=request.message,
        )
        response_source = "fallback"

    return jsonable_encoder(
        {
        "country_slug": request.country_slug,
        "country": country_name,
        "year": year,
        "month": month,
        "message": answer,
        "response_source": response_source,
        "recommended_places": places,
        },
        custom_encoder={ObjectId: str},
    )


@router.post("/local-vibe/discovery-chat")
def local_vibe_discovery_chat(request: LocalVibeDiscoveryChatRequest):
    featured_snapshot = get_featured_recommendations(
        year=request.year,
        month=request.month,
        limit=5,
    )
    year, month = resolve_year_month(request.year, request.month)
    assistant_context = build_discovery_context(
        featured_snapshot,
        year=year,
        month=month,
    )

    try:
        answer = generate_discovery_chat_message(
            assistant_context,
            user_message=request.message,
        )
        response_source = "gemini"
    except GeminiAssistantError as error:
        log_gemini_fallback("discovery chat", error)
        answer = build_deterministic_discovery_answer(
            featured_snapshot=featured_snapshot,
            year=year,
            month=month,
            user_message=request.message,
        )
        response_source = "fallback"
    except Exception as error:
        log_gemini_fallback("discovery chat", error)
        answer = build_deterministic_discovery_answer(
            featured_snapshot=featured_snapshot,
            year=year,
            month=month,
            user_message=request.message,
        )
        response_source = "fallback"

    return jsonable_encoder(
        {
        "year": year,
        "month": month,
        "message": answer,
        "response_source": response_source,
        "featured_destinations": assistant_context["featured_destinations"],
        },
        custom_encoder={ObjectId: str},
    )


@router.post("/local-vibe/itinerary")
def local_vibe_itinerary(request: LocalVibeItineraryRequest):
    context, year, month, country_name, selected_places = selected_destination_context(
        request
    )
    places = selected_places[:4]

    if not places:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Destination place recommendations are unavailable",
        )

    assistant_context = build_local_vibe_context(
        context,
        places,
        year=year,
        month=month,
        month_label=month_name(month),
    )
    summary = (
        f"A {request.days}-day {request.pace or 'balanced'} {country_name} itinerary for "
        f"{month_name(month)} {year}, built from CoVoyage's monthly destination recommendations."
    )
    gemini_model = None
    gemini_attempts = 0
    gemini_elapsed_seconds = None
    gemini_used_fallback_model = False

    try:
        gemini_generation = generate_gemini_itinerary(
            assistant_context,
            days=request.days,
            budget=request.budget,
            interests=request.interests,
            pace=request.pace,
        )
        summary = gemini_generation.response.summary
        itinerary = [
            day.model_dump()
            for day in gemini_generation.response.itinerary
        ]
        response_source = "gemini"
        gemini_model = gemini_generation.model
        gemini_attempts = gemini_generation.attempts
        gemini_elapsed_seconds = round(gemini_generation.elapsed_seconds, 2)
        gemini_used_fallback_model = gemini_generation.used_fallback_model
    except GeminiAssistantError as error:
        log_gemini_fallback("itinerary", error)
        itinerary = build_deterministic_itinerary(
            places=places,
            days_count=request.days,
        )
        response_source = "fallback"
    except Exception as error:
        log_gemini_fallback("itinerary", error)
        itinerary = build_deterministic_itinerary(
            places=places,
            days_count=request.days,
        )
        response_source = "fallback"

    response_source_detail = (
        "gemini_fallback_model"
        if response_source == "gemini" and gemini_used_fallback_model
        else response_source
    )

    return jsonable_encoder(
        {
        "country_slug": request.country_slug,
        "country": country_name,
        "year": year,
        "month": month,
        "days": request.days,
        "budget": request.budget,
        "interests": request.interests,
        "pace": request.pace or "Balanced",
        "recommended_places": places,
        "itinerary": itinerary,
        "summary": summary,
        "response_source": response_source,
        "response_source_detail": response_source_detail,
        "gemini_model": gemini_model,
        "gemini_attempts": gemini_attempts,
        "gemini_elapsed_seconds": gemini_elapsed_seconds,
        "gemini_used_fallback_model": gemini_used_fallback_model,
        },
        custom_encoder={ObjectId: str},
    )
