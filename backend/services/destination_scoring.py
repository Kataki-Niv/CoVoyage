from __future__ import annotations

import re
from typing import Any


COUNTRY_WEIGHTS = {
    "weather": 25,
    "seasonal": 20,
    "accessibility": 20,
    "safety": 15,
    "affordability": 10,
    "events": 5,
    "source_quality": 5,
}

PLACE_WEIGHTS = {
    "monthly_activity_fit": 25,
    "access_practicality": 20,
    "experience_strength": 20,
    "safety": 15,
    "tag_traveler_appeal": 10,
    "source_completeness": 10,
}

POSITIVE_KEYWORDS = {
    "accessible",
    "access",
    "available",
    "feasible",
    "open",
    "summer",
    "season",
    "supports",
    "long",
    "daylight",
    "hiking",
    "trekking",
    "road",
    "photography",
    "geothermal",
    "activities",
    "highlights",
    "practical",
    "guided",
}

CAUTION_KEYWORDS = {
    "warning",
    "warnings",
    "hazard",
    "hazards",
    "danger",
    "dangerous",
    "unsafe",
    "closed",
    "closure",
    "closures",
    "restricted",
    "restriction",
    "restrictions",
    "delay",
    "delays",
    "difficult",
    "rapid",
    "changing",
    "check",
    "conditions",
    "crossing",
    "crossings",
}

VALUE_POSITIVE_KEYWORDS = {
    "value",
    "affordable",
    "budget",
    "low",
    "reasonable",
    "included",
}

VALUE_CAUTION_KEYWORDS = {
    "high",
    "demand",
    "expensive",
    "peak",
    "limited",
    "book",
    "early",
}


def normalize_score(value: float, minimum: float = 0, maximum: float = 100) -> float:
    return round(max(minimum, min(maximum, value)), 2)


def weighted_score(raw_score: float, weight: float) -> float:
    return normalize_score(raw_score) * weight / 100


def is_mapping(value: Any) -> bool:
    return isinstance(value, dict)


def as_list(value: Any) -> list[Any]:
    if value is None:
        return []

    if isinstance(value, list):
        return value

    return [value]


def text_from_value(value: Any) -> str:
    if value is None:
        return ""

    if isinstance(value, str):
        return value

    if isinstance(value, (int, float)):
        return str(value)

    if isinstance(value, list):
        return " ".join(text_from_value(item) for item in value)

    if isinstance(value, dict):
        return " ".join(text_from_value(item) for item in value.values())

    return ""


def tokenize(value: Any) -> set[str]:
    return set(re.findall(r"[a-z0-9]+", text_from_value(value).lower()))


def extract_numeric_signal(value: Any) -> list[float]:
    return [float(match) for match in re.findall(r"-?\d+(?:\.\d+)?", text_from_value(value))]


def keyword_score(
    value: Any,
    positive_keywords: set[str] | None = None,
    caution_keywords: set[str] | None = None,
    neutral: float = 50,
) -> float:
    tokens = tokenize(value)

    if not tokens:
        return neutral

    positive_hits = len(tokens & (positive_keywords or POSITIVE_KEYWORDS))
    caution_hits = len(tokens & (caution_keywords or CAUTION_KEYWORDS))
    score = neutral + positive_hits * 7 - caution_hits * 5

    return normalize_score(score)


def has_meaningful_text(value: Any) -> bool:
    return bool(text_from_value(value).strip())


def note_count(value: Any) -> int:
    return len(as_list(value))


def warning_penalty(warnings: Any, base_score: float = 70) -> float:
    warnings_list = as_list(warnings)

    if not warnings_list:
        return normalize_score(base_score)

    warning_text = text_from_value(warnings_list)
    caution_hits = len(tokenize(warning_text) & CAUTION_KEYWORDS)
    score = base_score - len(warnings_list) * 8 - caution_hits * 3

    return normalize_score(score, minimum=30, maximum=85)


def collect_sources(value: Any) -> list[dict[str, Any]]:
    sources: list[dict[str, Any]] = []

    if isinstance(value, list):
        for item in value:
            sources.extend(collect_sources(item))

    if isinstance(value, dict):
        nested_sources = value.get("sources")

        if isinstance(nested_sources, list):
            sources.extend(
                source for source in nested_sources if isinstance(source, dict)
            )

        source = value.get("source")

        if isinstance(source, dict):
            sources.append(source)

        for nested_value in value.values():
            if nested_value is nested_sources or nested_value is source:
                continue

            sources.extend(collect_sources(nested_value))

    return sources


def source_quality_score(*records: Any) -> float:
    sources: list[dict[str, Any]] = []

    for record in records:
        if is_mapping(record):
            sources.extend(as_list(record.get("sources")))
        sources.extend(collect_sources(record))

    sources = [source for source in sources if isinstance(source, dict)]

    if not sources:
        return 35

    unique_urls = {
        source.get("source_url")
        for source in sources
        if source.get("source_url")
    }
    verified_count = sum(
        1
        for source in sources
        if source.get("verification_status") in {"source-recorded", "verified"}
    )
    dated_count = sum(
        1
        for source in sources
        if source.get("last_verified_at") or source.get("retrieved_at")
    )
    confidence_values = [
        float(source["confidence"])
        for source in sources
        if isinstance(source.get("confidence"), (int, float))
    ]
    average_confidence = (
        sum(confidence_values) / len(confidence_values)
        if confidence_values
        else 0.55
    )

    score = (
        35
        + min(len(unique_urls), 6) * 7
        + min(verified_count, 6) * 3
        + min(dated_count, 6) * 2
        + average_confidence * 15
    )

    return normalize_score(score)


def build_reason(
    subject: str,
    top_factors: list[str],
    caution: str | None = None,
) -> str:
    readable_factors = [factor.replace("_", " ") for factor in top_factors[:3]]

    if not readable_factors:
        return f"{subject} has limited scoring data for this month."

    if len(readable_factors) == 1:
        factor_text = readable_factors[0]
    else:
        factor_text = ", ".join(readable_factors[:-1])
        factor_text = f"{factor_text}, and {readable_factors[-1]}"

    reason = f"{subject} scores well this month because {factor_text} support the trip."

    if caution:
        reason += f" Travelers should still account for {caution}."

    return reason


def top_reason_factors(breakdown: dict[str, float], limit: int = 3) -> list[str]:
    return [
        key
        for key, _value in sorted(
            breakdown.items(),
            key=lambda item: item[1],
            reverse=True,
        )[:limit]
    ]


def score_weather(monthly_factor: dict[str, Any]) -> float:
    weather_climate = monthly_factor.get("weather_climate")
    text = {
        "weather_climate": weather_climate,
        "weather_suitability_input": monthly_factor.get("weather_suitability_input"),
        "daylight_information": monthly_factor.get("daylight_information"),
    }

    if not has_meaningful_text(text):
        return 50

    return keyword_score(text, neutral=58)


def score_seasonal(monthly_factor: dict[str, Any]) -> float:
    seasonal_count = (
        note_count(monthly_factor.get("seasonal_conditions"))
        + note_count(monthly_factor.get("seasonal_highlights"))
        + note_count(monthly_factor.get("seasonal_activities"))
    )

    if seasonal_count == 0:
        return 50

    score = 50 + min(seasonal_count, 8) * 6
    keyword_adjustment = keyword_score(
        {
            "seasonal_conditions": monthly_factor.get("seasonal_conditions"),
            "seasonal_highlights": monthly_factor.get("seasonal_highlights"),
            "seasonal_activities": monthly_factor.get("seasonal_activities"),
        },
        neutral=50,
    ) - 50

    return normalize_score(score + keyword_adjustment * 0.5)


def score_accessibility(monthly_factor: dict[str, Any]) -> float:
    accessibility_text = {
        "accessibility_information": monthly_factor.get("accessibility_information"),
        "travel_conditions": monthly_factor.get("travel_conditions"),
    }

    if not has_meaningful_text(accessibility_text):
        return 45

    return keyword_score(accessibility_text, neutral=58)


def score_safety(monthly_factor: dict[str, Any], places: list[dict[str, Any]] | None = None) -> float:
    warnings = as_list(monthly_factor.get("seasonal_warnings"))

    for place in places or []:
        warnings.extend(as_list(place.get("safety_warnings")))
        warnings.extend(as_list(place.get("seasonal_warnings")))

    if not warnings:
        return 55

    return warning_penalty(warnings, base_score=78)


def score_affordability(monthly_factor: dict[str, Any]) -> float:
    affordability_text = monthly_factor.get("affordability_value_input")

    if not has_meaningful_text(affordability_text):
        return 50

    return keyword_score(
        affordability_text,
        positive_keywords=VALUE_POSITIVE_KEYWORDS,
        caution_keywords=VALUE_CAUTION_KEYWORDS,
        neutral=55,
    )


def score_events(monthly_factor: dict[str, Any]) -> float:
    events_text = monthly_factor.get("event_activity_density_input")

    if not has_meaningful_text(events_text):
        return 50

    return keyword_score(events_text, neutral=55)


def combine_weighted_scores(
    raw_scores: dict[str, float],
    weights: dict[str, int],
) -> tuple[float, dict[str, float]]:
    breakdown = {
        key: round(weighted_score(raw_scores.get(key, 50), weight), 2)
        for key, weight in weights.items()
    }
    return normalize_score(sum(breakdown.values())), breakdown


def score_country_destination(
    country: dict[str, Any],
    monthly_factor: dict[str, Any] | None,
    places: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    if monthly_factor is None:
        return {
            "status": "incomplete",
            "score": 0,
            "breakdown": {
                key: 0 for key in COUNTRY_WEIGHTS
            },
            "reason_factors": ["missing_monthly_factors"],
            "reason": "Monthly factors are required before this country can be scored.",
        }

    raw_scores = {
        "weather": score_weather(monthly_factor),
        "seasonal": score_seasonal(monthly_factor),
        "accessibility": score_accessibility(monthly_factor),
        "safety": score_safety(monthly_factor, places),
        "affordability": score_affordability(monthly_factor),
        "events": score_events(monthly_factor),
        "source_quality": source_quality_score(country, monthly_factor, places or []),
    }
    score, breakdown = combine_weighted_scores(raw_scores, COUNTRY_WEIGHTS)
    reason_factors = top_reason_factors(breakdown)

    return {
        "status": "complete",
        "score": score,
        "breakdown": breakdown,
        "reason_factors": reason_factors,
        "reason": build_reason(
            country.get("name") or country.get("slug") or "This destination",
            reason_factors,
            "weather, access, and local safety guidance",
        ),
    }


def score_monthly_activity_fit(
    place: dict[str, Any],
    monthly_factor: dict[str, Any],
) -> float:
    place_tokens = tokenize(
        {
            "tags": place.get("tags"),
            "activities": place.get("activities"),
            "highlights": place.get("highlights"),
        }
    )
    monthly_tokens = tokenize(
        {
            "seasonal_activities": monthly_factor.get("seasonal_activities"),
            "seasonal_highlights": monthly_factor.get("seasonal_highlights"),
        }
    )

    if not place_tokens or not monthly_tokens:
        return 50

    overlap = len(place_tokens & monthly_tokens)
    return normalize_score(50 + min(overlap, 5) * 10)


def score_access_practicality(place: dict[str, Any], monthly_factor: dict[str, Any]) -> float:
    text = {
        "place_access": place.get("access_notes"),
        "monthly_access": monthly_factor.get("accessibility_information"),
        "travel_conditions": monthly_factor.get("travel_conditions"),
    }

    if not has_meaningful_text(text):
        return 45

    return keyword_score(text, neutral=58)


def score_experience_strength(place: dict[str, Any]) -> float:
    signals = [
        place.get("why_visit"),
        place.get("local_experience"),
        place.get("story"),
        place.get("description"),
    ]
    populated = sum(1 for signal in signals if has_meaningful_text(signal))
    list_signal_count = (
        note_count(place.get("highlights"))
        + note_count(place.get("activities"))
        + note_count(place.get("local_vibe_notes"))
    )

    if populated == 0 and list_signal_count == 0:
        return 50

    return normalize_score(48 + populated * 8 + min(list_signal_count, 8) * 3)


def score_place_safety(place: dict[str, Any], monthly_factor: dict[str, Any]) -> float:
    warnings = [
        *as_list(place.get("safety_warnings")),
        *as_list(place.get("seasonal_warnings")),
        *as_list(monthly_factor.get("seasonal_warnings")),
    ]

    if not warnings:
        return 55

    return warning_penalty(warnings, base_score=78)


def score_tag_traveler_appeal(place: dict[str, Any]) -> float:
    tags = as_list(place.get("tags"))
    activities = as_list(place.get("activities"))
    highlights = as_list(place.get("highlights"))
    signal_count = len(tags) + len(activities) + len(highlights)

    if signal_count == 0:
        return 50

    return normalize_score(50 + min(signal_count, 10) * 5)


def score_place_destination(
    place: dict[str, Any],
    monthly_factor: dict[str, Any] | None,
) -> dict[str, Any]:
    if monthly_factor is None:
        return {
            "status": "incomplete",
            "score": 0,
            "breakdown": {
                key: 0 for key in PLACE_WEIGHTS
            },
            "reason_factors": ["missing_monthly_factors"],
            "reason": "Monthly factors are required before this place can be scored.",
        }

    raw_scores = {
        "monthly_activity_fit": score_monthly_activity_fit(place, monthly_factor),
        "access_practicality": score_access_practicality(place, monthly_factor),
        "experience_strength": score_experience_strength(place),
        "safety": score_place_safety(place, monthly_factor),
        "tag_traveler_appeal": score_tag_traveler_appeal(place),
        "source_completeness": source_quality_score(place, monthly_factor),
    }
    score, breakdown = combine_weighted_scores(raw_scores, PLACE_WEIGHTS)
    reason_factors = top_reason_factors(breakdown)

    return {
        "status": "complete",
        "score": score,
        "breakdown": breakdown,
        "reason_factors": reason_factors,
        "reason": build_reason(
            place.get("name") or place.get("slug") or "This place",
            reason_factors,
            "access conditions and seasonal warnings",
        ),
    }
