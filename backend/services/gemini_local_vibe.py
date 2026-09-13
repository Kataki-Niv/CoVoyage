from __future__ import annotations

import json
import logging
import os
import re
import socket
import time
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from pydantic import BaseModel, Field, ValidationError

from services.destination_recommendations import load_static_destination_datasets


load_dotenv(Path(__file__).resolve().parents[1] / ".env")

GEMINI_API_KEY_ENV = "GEMINI_API_KEY"
GEMINI_MODEL_ENV = "GEMINI_MODEL"
GEMINI_FALLBACK_MODELS_ENV = "GEMINI_FALLBACK_MODELS"
GEMINI_ENDPOINT_ENV = "GEMINI_GENERATE_CONTENT_ENDPOINT"
GEMINI_TIMEOUT_SECONDS_ENV = "GEMINI_TIMEOUT_SECONDS"
DEFAULT_GEMINI_MODEL = "gemini-2.5-flash"
DEFAULT_GEMINI_FALLBACK_MODELS = ("gemini-3.5-flash-lite",)
DEFAULT_GEMINI_GENERATE_CONTENT_BASE_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models"
)
DEFAULT_GEMINI_TIMEOUT_SECONDS = 60
GEMINI_TRANSIENT_RETRY_LIMIT = 1

GEMINI_RESPONSE_SCHEMA_KEYS = {
    "additionalProperties",
    "anyOf",
    "description",
    "enum",
    "format",
    "items",
    "maxItems",
    "maximum",
    "minItems",
    "minimum",
    "oneOf",
    "prefixItems",
    "properties",
    "required",
    "title",
    "type",
}

logger = logging.getLogger(__name__)


class GeminiAssistantError(RuntimeError):
    """Raised when Gemini cannot produce a safe assistant response."""


class GeminiConfigurationError(GeminiAssistantError):
    """Raised when Gemini is not configured."""


class GeminiAPIError(GeminiAssistantError):
    """Raised when the Gemini API request fails."""


class GeminiTransientAPIError(GeminiAPIError):
    """Raised when a Gemini request fails in a way that is safe to retry."""


class GeminiTimeoutError(GeminiTransientAPIError):
    """Raised when Gemini does not respond before the configured timeout."""


class GeminiNetworkError(GeminiTransientAPIError):
    """Raised when Gemini cannot be reached due to a network failure."""


class GeminiResponseError(GeminiAssistantError):
    """Raised when Gemini returns a malformed response."""


class GeminiItineraryDay(BaseModel):
    day: int = Field(ge=1)
    place: str = Field(min_length=1, max_length=120)
    focus: str = Field(min_length=1, max_length=160)
    morning: str = Field(min_length=1, max_length=500)
    afternoon: str = Field(min_length=1, max_length=500)
    evening: str = Field(min_length=1, max_length=500)
    local_vibe_note: str = Field(min_length=1, max_length=500)


class GeminiItineraryResponse(BaseModel):
    summary: str = Field(min_length=1, max_length=900)
    itinerary: list[GeminiItineraryDay] = Field(min_length=1, max_length=21)


@dataclass(frozen=True)
class GeminiInteractionResult:
    text: str
    model: str
    attempts: int
    elapsed_seconds: float
    used_fallback_model: bool


@dataclass(frozen=True)
class GeminiItineraryGeneration:
    response: GeminiItineraryResponse
    model: str
    attempts: int
    elapsed_seconds: float
    used_fallback_model: bool


def get_gemini_model() -> str:
    return (
        os.getenv(GEMINI_MODEL_ENV, DEFAULT_GEMINI_MODEL).strip()
        or DEFAULT_GEMINI_MODEL
    )


def get_gemini_models() -> list[str]:
    primary_model = get_gemini_model()
    configured_fallbacks = [
        model.strip()
        for model in os.getenv(GEMINI_FALLBACK_MODELS_ENV, "").split(",")
        if model.strip()
    ]
    models = [primary_model, *(configured_fallbacks or DEFAULT_GEMINI_FALLBACK_MODELS)]
    unique_models: list[str] = []

    for model in models:
        if model not in unique_models:
            unique_models.append(model)

    return unique_models


def get_gemini_timeout_seconds() -> float:
    configured_timeout = os.getenv(GEMINI_TIMEOUT_SECONDS_ENV, "").strip()

    if not configured_timeout:
        return DEFAULT_GEMINI_TIMEOUT_SECONDS

    try:
        timeout = float(configured_timeout)
    except ValueError:
        logger.warning(
            "Ignoring invalid %s value %r; using default timeout %s seconds",
            GEMINI_TIMEOUT_SECONDS_ENV,
            configured_timeout,
            DEFAULT_GEMINI_TIMEOUT_SECONDS,
        )
        return DEFAULT_GEMINI_TIMEOUT_SECONDS

    if timeout <= 0:
        logger.warning(
            "Ignoring non-positive %s value %r; using default timeout %s seconds",
            GEMINI_TIMEOUT_SECONDS_ENV,
            configured_timeout,
            DEFAULT_GEMINI_TIMEOUT_SECONDS,
        )
        return DEFAULT_GEMINI_TIMEOUT_SECONDS

    return timeout


def get_gemini_endpoint(model: str | None = None) -> str:
    configured_endpoint = os.getenv(GEMINI_ENDPOINT_ENV, "").strip()

    if configured_endpoint:
        return configured_endpoint

    model_path = urllib.parse.quote(model or get_gemini_model(), safe="")
    return f"{DEFAULT_GEMINI_GENERATE_CONTENT_BASE_URL}/{model_path}:generateContent"


def inline_local_schema_refs(
    schema: Any,
    *,
    root_schema: dict[str, Any],
    seen_refs: set[str] | None = None,
) -> Any:
    if isinstance(schema, list):
        return [
            inline_local_schema_refs(
                item,
                root_schema=root_schema,
                seen_refs=seen_refs,
            )
            for item in schema
        ]

    if not isinstance(schema, dict):
        return schema

    ref = schema.get("$ref")

    if isinstance(ref, str) and ref.startswith("#/$defs/"):
        seen_refs = set(seen_refs or set())

        if ref in seen_refs:
            return {}

        definition_key = urllib.parse.unquote(ref.removeprefix("#/$defs/"))
        definition = (root_schema.get("$defs") or {}).get(definition_key)

        if isinstance(definition, dict):
            return inline_local_schema_refs(
                definition,
                root_schema=root_schema,
                seen_refs=seen_refs | {ref},
            )

    return {
        key: inline_local_schema_refs(
            value,
            root_schema=root_schema,
            seen_refs=seen_refs,
        )
        for key, value in schema.items()
        if key not in {"$defs", "$ref"}
    }


def sanitize_gemini_response_schema(schema: Any) -> Any:
    if isinstance(schema, dict):
        schema = inline_local_schema_refs(schema, root_schema=schema)

    if isinstance(schema, list):
        return [sanitize_gemini_response_schema(item) for item in schema]

    if not isinstance(schema, dict):
        return schema

    cleaned: dict[str, Any] = {}

    for key, value in schema.items():
        if key not in GEMINI_RESPONSE_SCHEMA_KEYS:
            continue

        if key == "properties" and isinstance(value, dict):
            cleaned[key] = {
                property_name: sanitize_gemini_response_schema(property_schema)
                for property_name, property_schema in value.items()
            }
            continue

        cleaned[key] = sanitize_gemini_response_schema(value)

    return cleaned


def compact_text_note(note: Any) -> dict[str, str] | None:
    if isinstance(note, str):
        body = note.strip()

        if not body:
            return None

        return {
            "title": "",
            "body": body,
        }

    if not isinstance(note, dict):
        return None

    title = str(note.get("title") or "").strip()
    body = str(note.get("body") or note.get("content") or "").strip()

    if not title and not body:
        return None

    return {
        "title": title,
        "body": body,
    }


def compact_note_list(notes: Any, limit: int = 3) -> list[dict[str, str]]:
    if not isinstance(notes, list):
        return []

    compacted = [
        compact_note
        for note in notes[:limit]
        if (compact_note := compact_text_note(note))
    ]

    return compacted


def compact_local_insights(insights: Any, limit: int = 4) -> list[dict[str, str]]:
    if not isinstance(insights, list):
        return []

    compacted = []

    for insight in insights[:limit]:
        if not isinstance(insight, dict):
            continue

        compacted.append(
            {
                "title": str(insight.get("title") or "").strip(),
                "category": str(insight.get("category") or "").strip(),
                "content": str(insight.get("content") or "").strip(),
            }
        )

    return [
        insight
        for insight in compacted
        if insight["title"] or insight["category"] or insight["content"]
    ]


def compact_phrase_list(phrases: Any, limit: int = 5) -> list[dict[str, str]]:
    if not isinstance(phrases, list):
        return []

    compacted = []

    for phrase in phrases[:limit]:
        if not isinstance(phrase, dict):
            continue

        compacted.append(
            {
                "english": str(phrase.get("english") or "").strip(),
                "local": str(phrase.get("local") or "").strip(),
                "pronunciation": str(phrase.get("pronunciation") or "").strip(),
                "usage_note": str(phrase.get("usage_note") or "").strip(),
            }
        )

    return [phrase for phrase in compacted if phrase["english"] or phrase["local"]]


def compact_monthly_factor(monthly_factor: dict[str, Any] | None) -> dict[str, Any]:
    if not isinstance(monthly_factor, dict):
        return {}

    weather = monthly_factor.get("weather_climate") or {}

    return {
        "weather_suitability": monthly_factor.get("weather_suitability_input"),
        "weather_summary": weather.get("summary"),
        "temperature_range": weather.get("temperature_range"),
        "rainfall_summary": weather.get("rainfall_summary"),
        "daylight": monthly_factor.get("daylight_information")
        or weather.get("daylight_summary"),
        "seasonal_highlights": monthly_factor.get("seasonal_highlights") or [],
        "seasonal_activities": monthly_factor.get("seasonal_activities") or [],
        "accessibility": monthly_factor.get("accessibility_information"),
        "events": monthly_factor.get("event_activity_density_input"),
        "budget_value": monthly_factor.get("affordability_value_input"),
        "travel_conditions": compact_note_list(
            monthly_factor.get("travel_conditions"),
            limit=2,
        ),
        "seasonal_warnings": compact_note_list(
            monthly_factor.get("seasonal_warnings"),
            limit=2,
        ),
    }


def compact_place_recommendation(recommendation: dict[str, Any]) -> dict[str, Any]:
    place = recommendation.get("place") or {}

    return {
        "rank": recommendation.get("rank"),
        "slug": recommendation.get("place_slug") or place.get("slug"),
        "name": recommendation.get("place_name") or place.get("name"),
        "region": place.get("region"),
        "type": place.get("type"),
        "description": place.get("description") or place.get("story"),
        "why_visit": place.get("why_visit"),
        "recommendation_reason": recommendation.get("recommendation_reason"),
        "seasonal_note": recommendation.get("seasonal_note"),
        "budget_value": recommendation.get("budget_value"),
        "experiences": recommendation.get("experiences") or place.get("activities") or [],
        "highlights": place.get("highlights") or [],
        "local_vibe_notes": (
            recommendation.get("local_vibe_notes")
            or place.get("local_vibe_notes")
            or place.get("tags")
            or []
        ),
        "access_notes": compact_note_list(place.get("access_notes"), limit=2),
        "seasonal_warnings": compact_note_list(
            place.get("seasonal_warnings"),
            limit=2,
        ),
        "community_tips": place.get("community_tips") or [],
    }


def static_events_for_country(country_slug: str, limit: int = 5) -> list[dict[str, Any]]:
    datasets = load_static_destination_datasets()
    dataset = datasets.get(country_slug) or {}
    events = dataset.get("events") or []
    compacted = []

    for event in events[:limit]:
        if not isinstance(event, dict):
            continue

        compacted.append(
            {
                "title": event.get("title"),
                "category": event.get("category"),
                "location": event.get("location"),
                "date_start": event.get("date_start"),
                "date_end": event.get("date_end"),
                "description": event.get("description"),
            }
        )

    return compacted


def build_local_vibe_context(
    destination_context: dict[str, Any],
    places: list[dict[str, Any]],
    *,
    year: int,
    month: int,
    month_label: str,
) -> dict[str, Any]:
    country = destination_context.get("country") or {}

    return {
        "country": {
            "slug": country.get("slug"),
            "name": country.get("name"),
            "region": country.get("region"),
            "overview": country.get("overview"),
            "travel_styles": country.get("travel_styles") or [],
            "languages": country.get("languages") or [],
            "currency": country.get("currency"),
            "timezone": country.get("timezone"),
            "emergency_numbers": country.get("emergency_numbers") or [],
            "culture_notes": compact_note_list(country.get("culture_notes"), limit=3),
            "etiquette_notes": compact_note_list(country.get("etiquette_notes"), limit=3),
            "communication_notes": compact_note_list(
                country.get("communication_notes"),
                limit=2,
            ),
            "practical_notes": compact_note_list(country.get("practical_notes"), limit=4),
            "visitor_mistakes": compact_note_list(
                country.get("common_visitor_mistakes"),
                limit=3,
            ),
            "local_insights": compact_local_insights(country.get("local_insights")),
            "local_phrases": compact_phrase_list(country.get("local_phrases")),
        },
        "month": {
            "year": year,
            "month": month,
            "label": month_label,
            "factor": compact_monthly_factor(destination_context.get("monthly_factor")),
        },
        "recommended_places": [
            compact_place_recommendation(place)
            for place in places[:4]
        ],
        "events": static_events_for_country(country.get("slug") or ""),
    }


def grounding_instructions() -> str:
    return (
        "You are CoVoyage AI, a destination-aware travel companion inside the "
        "Master the Local Vibe experience. CoVoyage-provided context is your "
        "primary source of truth. Do not invent destination-specific facts, "
        "events, prices, opening hours, statistics, or recommendations. If the "
        "answer is not available in the supplied CoVoyage context, say that "
        "CoVoyage does not have that detail yet and offer clearly general travel "
        "planning guidance. Respect the selected country and current month. For "
        "what-to-do or route questions, prefer the current month's recommended "
        "places. Keep answers natural, useful, concise, and non-technical."
        " Do not use markdown formatting."
    )


def discovery_grounding_instructions() -> str:
    return (
        "You are CoVoyage AI, a travel discovery companion inside the Master "
        "the Local Vibe experience. CoVoyage-provided monthly destination "
        "context is your primary source of truth. Help the traveler compare "
        "featured destinations, choose a direction, understand seasonal tradeoffs, "
        "and decide which country page to open next. Do not invent destination-specific "
        "facts, prices, opening hours, statistics, or events. If the supplied "
        "context does not contain a detail, say CoVoyage does not have that "
        "detail yet and offer general planning guidance. Keep answers natural, "
        "useful, concise, and non-technical. Do not use markdown formatting."
    )


def context_json(context: dict[str, Any]) -> str:
    return json.dumps(context, ensure_ascii=False, default=str, indent=2)


def allowed_itinerary_place_names(context: dict[str, Any]) -> list[str]:
    place_names: list[str] = []

    for place in context.get("recommended_places") or []:
        if not isinstance(place, dict):
            continue

        name = str(place.get("name") or "").strip()
        slug = str(place.get("slug") or "").strip()
        place_name = name or slug

        if place_name and place_name not in place_names:
            place_names.append(place_name)

    return place_names


def itinerary_place_prompt_contract(context: dict[str, Any]) -> str:
    place_names = allowed_itinerary_place_names(context)

    if not place_names:
        return ""

    allowed_list = "\n".join(f"- {place_name}" for place_name in place_names)

    return (
        "Allowed day.place values:\n"
        f"{allowed_list}\n"
        "Every itinerary day.place must be exactly one of those place names. "
        "Do not combine multiple place names in day.place. Put neighborhoods, "
        "attractions, and route details inside morning, afternoon, evening, or "
        "local_vibe_note instead."
    )


def build_chat_prompt(context: dict[str, Any], user_message: str) -> str:
    return (
        f"{grounding_instructions()}\n\n"
        "CoVoyage destination context:\n"
        f"{context_json(context)}\n\n"
        "Traveler question:\n"
        f"{user_message.strip()}\n\n"
        "Answer as CoVoyage AI. Do not mention internal scores unless the user "
        "explicitly asks how recommendations are ranked."
    )


def build_discovery_chat_prompt(context: dict[str, Any], user_message: str) -> str:
    return (
        f"{discovery_grounding_instructions()}\n\n"
        "CoVoyage monthly discovery context:\n"
        f"{context_json(context)}\n\n"
        "Traveler question:\n"
        f"{user_message.strip()}\n\n"
        "Answer as CoVoyage AI for the main Master the Local Vibe page."
    )


def build_itinerary_prompt(
    context: dict[str, Any],
    *,
    days: int,
    budget: str | None,
    interests: str | None,
    pace: str | None,
) -> str:
    place_contract = itinerary_place_prompt_contract(context)

    return (
        f"{grounding_instructions()}\n\n"
        "Create a structured itinerary using only the recommended places in the "
        "CoVoyage context. Do not add cities or attractions outside that context. "
        "Return JSON only, matching the supplied schema.\n\n"
        f"{place_contract}\n\n"
        f"Trip days: {days}\n"
        f"Budget: {budget or 'Not specified'}\n"
        f"Interests: {interests or 'Not specified'}\n"
        f"Pace: {pace or 'Balanced'}\n\n"
        "CoVoyage destination context:\n"
        f"{context_json(context)}"
    )


def extract_output_text(payload: dict[str, Any]) -> str:
    direct_output = payload.get("output_text") or payload.get("outputText")

    if isinstance(direct_output, str) and direct_output.strip():
        return direct_output.strip()

    for candidate in payload.get("candidates") or []:
        if not isinstance(candidate, dict):
            continue

        content = candidate.get("content") or {}

        if not isinstance(content, dict):
            continue

        for part in content.get("parts") or []:
            if not isinstance(part, dict):
                continue

            text = part.get("text")

            if isinstance(text, str) and text.strip():
                return text.strip()

    for step in payload.get("steps") or []:
        if not isinstance(step, dict):
            continue

        for content in step.get("content") or []:
            if not isinstance(content, dict):
                continue

            text = content.get("text")

            if isinstance(text, str) and text.strip():
                return text.strip()

    raise GeminiResponseError("Gemini response did not include output text")


def gemini_http_error_message(status_code: int) -> str:
    if status_code == 400:
        return "Gemini API rejected the request format"
    if status_code == 429:
        return "Gemini API quota or rate limit was reached"
    if status_code in {401, 403}:
        return "Gemini API rejected the configured credentials"
    if 500 <= status_code < 600:
        return "Gemini API service is temporarily unavailable"
    return f"Gemini API returned HTTP {status_code}"


def compact_error_detail(value: Any, limit: int = 1000) -> str:
    detail = repr(value)
    return detail[:limit]


def is_timeout_exception(error: BaseException) -> bool:
    if isinstance(error, (TimeoutError, socket.timeout)):
        return True

    if isinstance(error, urllib.error.URLError):
        return isinstance(error.reason, (TimeoutError, socket.timeout))

    return False


def call_gemini_interaction_with_metadata(
    *,
    prompt: str,
    response_schema: dict[str, Any] | None = None,
    retry_transient_once: bool = False,
) -> GeminiInteractionResult:
    api_key = os.getenv(GEMINI_API_KEY_ENV, "").strip()

    if not api_key:
        raise GeminiConfigurationError(f"{GEMINI_API_KEY_ENV} is not configured")

    request_body: dict[str, Any] = {
        "contents": [
            {
                "role": "user",
                "parts": [{"text": prompt}],
            }
        ],
    }

    if response_schema is not None:
        request_body["generationConfig"] = {
            "responseMimeType": "application/json",
            "responseSchema": sanitize_gemini_response_schema(response_schema),
        }

    last_error: Exception | None = None
    total_attempts = 0
    started_at = time.monotonic()
    models = get_gemini_models()
    timeout_seconds = get_gemini_timeout_seconds()

    for model_index, model in enumerate(models):
        max_attempts = 1 + (
            GEMINI_TRANSIENT_RETRY_LIMIT if retry_transient_once else 0
        )

        for attempt in range(1, max_attempts + 1):
            total_attempts += 1
            request_started_at = time.monotonic()
            request = urllib.request.Request(
                get_gemini_endpoint(model),
                data=json.dumps(request_body).encode("utf-8"),
                headers={
                    "Content-Type": "application/json",
                    "x-goog-api-key": api_key,
                },
                method="POST",
            )

            try:
                with urllib.request.urlopen(
                    request,
                    timeout=timeout_seconds,
                ) as response:
                    raw_response = response.read().decode("utf-8")
                try:
                    payload = json.loads(raw_response)
                except json.JSONDecodeError as error:
                    logger.warning(
                        "Gemini returned invalid JSON model=%s attempts=%s elapsed=%.2fs",
                        model,
                        total_attempts,
                        time.monotonic() - started_at,
                    )
                    raise GeminiResponseError(
                        "Gemini returned invalid JSON"
                    ) from error

                return GeminiInteractionResult(
                    text=extract_output_text(payload),
                    model=model,
                    attempts=total_attempts,
                    elapsed_seconds=time.monotonic() - started_at,
                    used_fallback_model=model_index > 0,
                )
            except urllib.error.HTTPError as error:
                last_error = error
                error_body = error.read().decode("utf-8", errors="replace")
                message = gemini_http_error_message(error.code)

                logger.warning(
                    (
                        "Gemini HTTP error model=%s status=%s attempt=%s/%s "
                        "elapsed=%.2fs detail=%s"
                    ),
                    model,
                    error.code,
                    attempt,
                    max_attempts,
                    time.monotonic() - request_started_at,
                    error_body[:1000],
                )

                if 500 <= error.code < 600 and model_index < len(models) - 1:
                    logger.warning(
                        "Gemini model %s returned HTTP %s; trying configured fallback model",
                        model,
                        error.code,
                    )
                    break

                if error.code == 429 and model_index < len(models) - 1:
                    logger.warning(
                        "Gemini model %s hit quota or rate limit; trying configured fallback model",
                        model,
                    )
                    break

                raise GeminiAPIError(message) from error
            except (urllib.error.URLError, TimeoutError, socket.timeout) as error:
                last_error = error
                timeout_failure = is_timeout_exception(error)
                error_class = (
                    GeminiTimeoutError if timeout_failure else GeminiNetworkError
                )
                category = "timeout" if timeout_failure else "network"
                detail = getattr(error, "reason", error)

                logger.warning(
                    (
                        "Gemini %s error model=%s attempt=%s/%s timeout=%ss "
                        "elapsed=%.2fs exception=%s detail=%s"
                    ),
                    category,
                    model,
                    attempt,
                    max_attempts,
                    timeout_seconds,
                    time.monotonic() - request_started_at,
                    type(error).__name__,
                    compact_error_detail(detail),
                )

                if attempt < max_attempts:
                    logger.warning(
                        "Retrying Gemini model %s once after transient %s failure",
                        model,
                        category,
                    )
                    continue

                if model_index < len(models) - 1:
                    logger.warning(
                        "Gemini model %s exhausted transient retry; trying configured fallback model",
                        model,
                    )
                    break

                raise error_class(
                    f"Gemini API {category} failure after {total_attempts} attempt(s)"
                ) from error

    raise GeminiAPIError("Gemini API request failed") from last_error


def call_gemini_interaction(
    *,
    prompt: str,
    response_schema: dict[str, Any] | None = None,
) -> str:
    return call_gemini_interaction_with_metadata(
        prompt=prompt,
        response_schema=response_schema,
    ).text


def generate_chat_message(
    context: dict[str, Any],
    *,
    user_message: str,
) -> str:
    answer = call_gemini_interaction(
        prompt=build_chat_prompt(context, user_message),
    ).strip()

    if not answer:
        raise GeminiResponseError("Gemini returned an empty chat answer")

    return answer


def generate_discovery_chat_message(
    context: dict[str, Any],
    *,
    user_message: str,
) -> str:
    answer = call_gemini_interaction(
        prompt=build_discovery_chat_prompt(context, user_message),
    ).strip()

    if not answer:
        raise GeminiResponseError("Gemini returned an empty discovery answer")

    return answer


def normalize_place_reference(value: str) -> str:
    return " ".join(value.strip().casefold().replace("-", " ").split())


def place_reference_candidates(value: str) -> list[str]:
    stripped_value = value.strip()

    if not stripped_value:
        return []

    candidates = [stripped_value]
    qualified_prefix = re.split(
        r"\s[-\u2013\u2014]\s|[(:,]",
        stripped_value,
        maxsplit=1,
    )[0].strip()

    if qualified_prefix and qualified_prefix != stripped_value:
        candidates.append(qualified_prefix)

    return candidates


def canonical_place_references(
    allowed_places: list[dict[str, Any]],
) -> dict[str, str]:
    allowed_refs: dict[str, str] = {}

    for place in allowed_places:
        slug = str(place.get("slug") or "").strip()
        name = str(place.get("name") or "").strip()
        canonical_name = name or slug

        if not canonical_name:
            continue

        for reference in (slug, name):
            normalized_reference = normalize_place_reference(reference)

            if normalized_reference:
                allowed_refs[normalized_reference] = canonical_name

    return allowed_refs


def referenced_canonical_places(
    normalized_value: str,
    allowed_refs: dict[str, str],
) -> set[str]:
    referenced_places: set[str] = set()

    for normalized_reference, canonical_name in allowed_refs.items():
        if re.search(
            rf"(?<!\w){re.escape(normalized_reference)}(?!\w)",
            normalized_value,
        ):
            referenced_places.add(canonical_name)

    return referenced_places


def canonicalize_place_reference(
    value: str,
    allowed_refs: dict[str, str],
) -> str | None:
    normalized_value = normalize_place_reference(value)

    if not normalized_value:
        return None

    if len(referenced_canonical_places(normalized_value, allowed_refs)) > 1:
        return None

    if " / " in value or "/" in value or " and " in normalized_value:
        return allowed_refs.get(normalized_value)

    for candidate in place_reference_candidates(value):
        normalized_candidate = normalize_place_reference(candidate)
        canonical_name = allowed_refs.get(normalized_candidate)

        if canonical_name:
            return canonical_name

    return None


def validate_itinerary_places(
    itinerary: GeminiItineraryResponse,
    allowed_places: list[dict[str, Any]],
    expected_days: int,
) -> None:
    if len(itinerary.itinerary) != expected_days:
        raise GeminiResponseError("Gemini itinerary day count did not match request")

    allowed_refs = canonical_place_references(allowed_places)

    if not allowed_refs:
        raise GeminiResponseError("No allowed places were supplied to Gemini")

    for day in itinerary.itinerary:
        canonical_place = canonicalize_place_reference(day.place, allowed_refs)

        if not canonical_place:
            raise GeminiResponseError(
                "Gemini itinerary used a place outside supplied context"
            )

        day.place = canonical_place


def generate_itinerary(
    context: dict[str, Any],
    *,
    days: int,
    budget: str | None,
    interests: str | None,
    pace: str | None,
) -> GeminiItineraryGeneration:
    interaction = call_gemini_interaction_with_metadata(
        prompt=build_itinerary_prompt(
            context,
            days=days,
            budget=budget,
            interests=interests,
            pace=pace,
        ),
        response_schema=GeminiItineraryResponse.model_json_schema(),
        retry_transient_once=True,
    )

    try:
        itinerary = GeminiItineraryResponse.model_validate_json(interaction.text)
    except ValidationError as error:
        logger.warning(
            "Gemini returned invalid itinerary structure model=%s attempts=%s elapsed=%.2fs",
            interaction.model,
            interaction.attempts,
            interaction.elapsed_seconds,
        )
        raise GeminiResponseError(
            "Gemini returned an invalid itinerary structure"
        ) from error

    validate_itinerary_places(
        itinerary,
        context.get("recommended_places") or [],
        days,
    )

    return GeminiItineraryGeneration(
        response=itinerary,
        model=interaction.model,
        attempts=interaction.attempts,
        elapsed_seconds=interaction.elapsed_seconds,
        used_fallback_model=interaction.used_fallback_model,
    )


def log_gemini_fallback(action: str, error: Exception) -> None:
    logger.warning(
        (
            "Falling back to deterministic Local Vibe %s after Gemini failure "
            "error_type=%s message=%s cause_type=%s cause=%s"
        ),
        action,
        type(error).__name__,
        error,
        type(error.__cause__).__name__ if error.__cause__ else "None",
        compact_error_detail(error.__cause__) if error.__cause__ else "None",
    )
