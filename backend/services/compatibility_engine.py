from __future__ import annotations

import os
from collections.abc import Mapping, Sequence
from dataclasses import dataclass
from datetime import date, datetime
from typing import Any

from services.similarity_search import SimilarTraveler


SCORE_MIN = 0.0
SCORE_MAX = 100.0
DEFAULT_MIN_COMPATIBILITY_SCORE = 40.0


def parse_min_compatibility_score(raw_value: str | None) -> float:
    if raw_value is None or not raw_value.strip():
        return DEFAULT_MIN_COMPATIBILITY_SCORE

    try:
        score = float(raw_value)
    except ValueError:
        return DEFAULT_MIN_COMPATIBILITY_SCORE

    return max(SCORE_MIN, min(SCORE_MAX, score))


MIN_COMPATIBILITY_SCORE = parse_min_compatibility_score(
    os.getenv("COVOYAGE_MIN_TRIBE_COMPATIBILITY_SCORE"),
)

COMPATIBILITY_WEIGHTS = {
    "semantic_similarity": 0.35,
    "preferred_destinations": 0.15,
    "travel_dates": 0.15,
    "interests": 0.15,
    "travel_style": 0.075,
    "budget_range": 0.05,
    "preferred_trip_duration": 0.05,
    "languages_spoken": 0.025,
}


@dataclass(frozen=True)
class CompatibilityMatch:
    user_id: str
    semantic_score: float
    compatibility_score: float


def build_compatibility_matches(
    current_profile: Any,
    similar_travelers: Sequence[SimilarTraveler],
    candidate_profiles_by_user_id: Mapping[str, Any] | None = None,
) -> list[CompatibilityMatch]:
    source_profile = safe_profile_to_dict(current_profile)
    candidate_profiles = candidate_profiles_by_user_id or {}
    matches: list[CompatibilityMatch] = []

    for similar_traveler in similar_travelers or []:
        user_id = get_similar_traveler_user_id(similar_traveler)

        if not user_id:
            continue

        candidate_profile = get_candidate_profile(
            similar_traveler,
            candidate_profiles.get(user_id),
        )
        semantic_score = score_semantic_similarity(similar_traveler)
        compatibility_score = compute_compatibility_score(
            source_profile,
            candidate_profile,
            semantic_score,
        )

        if compatibility_score < MIN_COMPATIBILITY_SCORE:
            continue

        matches.append(
            CompatibilityMatch(
                user_id=user_id,
                semantic_score=semantic_score,
                compatibility_score=compatibility_score,
            )
        )

    return sorted(
        matches,
        key=lambda match: match.compatibility_score,
        reverse=True,
    )


def compute_compatibility_score(
    source_profile: Mapping[str, Any],
    candidate_profile: Mapping[str, Any],
    semantic_score: float,
) -> float:
    weighted_score = (
        semantic_score * COMPATIBILITY_WEIGHTS["semantic_similarity"]
        + score_destination_compatibility(source_profile, candidate_profile)
        * COMPATIBILITY_WEIGHTS["preferred_destinations"]
        + score_travel_date_compatibility(source_profile, candidate_profile)
        * COMPATIBILITY_WEIGHTS["travel_dates"]
        + score_interest_compatibility(source_profile, candidate_profile)
        * COMPATIBILITY_WEIGHTS["interests"]
        + score_travel_style_compatibility(source_profile, candidate_profile)
        * COMPATIBILITY_WEIGHTS["travel_style"]
        + score_budget_compatibility(source_profile, candidate_profile)
        * COMPATIBILITY_WEIGHTS["budget_range"]
        + score_trip_duration_compatibility(source_profile, candidate_profile)
        * COMPATIBILITY_WEIGHTS["preferred_trip_duration"]
        + score_language_compatibility(source_profile, candidate_profile)
        * COMPATIBILITY_WEIGHTS["languages_spoken"]
    )

    return round(clamp_score(weighted_score), 2)


def score_semantic_similarity(similar_traveler: Any) -> float:
    raw_score = get_field(similar_traveler, "score")

    try:
        score = float(raw_score)
    except (TypeError, ValueError):
        return SCORE_MIN

    if score <= 1:
        return round(clamp_score(score * SCORE_MAX), 2)

    return round(clamp_score(score), 2)


def score_destination_compatibility(
    source_profile: Mapping[str, Any],
    candidate_profile: Mapping[str, Any],
) -> float:
    return score_list_overlap_ratio(
        source_profile.get("preferred_destinations"),
        candidate_profile.get("preferred_destinations"),
    )


def score_travel_date_compatibility(
    source_profile: Mapping[str, Any],
    candidate_profile: Mapping[str, Any],
) -> float:
    source_start = parse_profile_date(source_profile.get("available_from"))
    source_end = parse_profile_date(source_profile.get("available_to"))
    candidate_start = parse_profile_date(candidate_profile.get("available_from"))
    candidate_end = parse_profile_date(candidate_profile.get("available_to"))

    if not source_start or not source_end or not candidate_start or not candidate_end:
        return SCORE_MIN

    if source_end < source_start or candidate_end < candidate_start:
        return SCORE_MIN

    overlap_start = max(source_start, candidate_start)
    overlap_end = min(source_end, candidate_end)

    if overlap_end < overlap_start:
        return SCORE_MIN

    overlap_days = (overlap_end - overlap_start).days + 1
    source_days = (source_end - source_start).days + 1
    candidate_days = (candidate_end - candidate_start).days + 1
    shorter_window_days = max(1, min(source_days, candidate_days))

    return round(clamp_score((overlap_days / shorter_window_days) * SCORE_MAX), 2)


def score_interest_compatibility(
    source_profile: Mapping[str, Any],
    candidate_profile: Mapping[str, Any],
) -> float:
    return score_list_overlap_ratio(
        source_profile.get("interests"),
        candidate_profile.get("interests"),
    )


def score_budget_compatibility(
    source_profile: Mapping[str, Any],
    candidate_profile: Mapping[str, Any],
) -> float:
    return score_exact_text_match(
        source_profile.get("budget_range"),
        candidate_profile.get("budget_range"),
    )


def score_travel_style_compatibility(
    source_profile: Mapping[str, Any],
    candidate_profile: Mapping[str, Any],
) -> float:
    return score_exact_text_match(
        source_profile.get("travel_style"),
        candidate_profile.get("travel_style"),
    )


def score_trip_duration_compatibility(
    source_profile: Mapping[str, Any],
    candidate_profile: Mapping[str, Any],
) -> float:
    return score_exact_text_match(
        source_profile.get("preferred_trip_duration"),
        candidate_profile.get("preferred_trip_duration"),
    )


def score_language_compatibility(
    source_profile: Mapping[str, Any],
    candidate_profile: Mapping[str, Any],
) -> float:
    return score_list_overlap_ratio(
        source_profile.get("languages_spoken"),
        candidate_profile.get("languages_spoken"),
    )


def score_list_overlap_ratio(source_values: Any, candidate_values: Any) -> float:
    source_items = normalize_list(source_values)
    candidate_items = normalize_list(candidate_values)

    if not source_items or not candidate_items:
        return SCORE_MIN

    source_lookup = set(source_items)
    candidate_lookup = set(candidate_items)
    overlap_count = len(source_lookup & candidate_lookup)

    if overlap_count == 0:
        return SCORE_MIN

    source_overlap = overlap_count / len(source_lookup)
    candidate_overlap = overlap_count / len(candidate_lookup)
    return round(((source_overlap + candidate_overlap) / 2) * SCORE_MAX, 2)


def score_exact_text_match(source_value: Any, candidate_value: Any) -> float:
    source_text = normalize_text(source_value)
    candidate_text = normalize_text(candidate_value)

    if not source_text or not candidate_text:
        return SCORE_MIN

    return SCORE_MAX if source_text == candidate_text else SCORE_MIN


def get_candidate_profile(
    similar_traveler: Any,
    profile_from_lookup: Any = None,
) -> dict[str, Any]:
    lookup_profile = safe_profile_to_dict(profile_from_lookup)

    if lookup_profile:
        return lookup_profile

    embedded_profile = (
        get_field(similar_traveler, "profile")
        or get_field(similar_traveler, "travel_profile")
        or get_field(similar_traveler, "metadata")
    )

    return safe_profile_to_dict(embedded_profile)


def get_similar_traveler_user_id(similar_traveler: Any) -> str:
    user_id = get_field(similar_traveler, "user_id")
    return str(user_id).strip() if user_id is not None else ""


def safe_profile_to_dict(profile: Any) -> dict[str, Any]:
    if profile is None:
        return {}

    if isinstance(profile, Mapping):
        return dict(profile)

    if hasattr(profile, "model_dump"):
        return profile.model_dump(mode="json")

    if hasattr(profile, "dict"):
        return profile.dict()

    return {}


def normalize_list(value: Any) -> list[str]:
    if value is None:
        return []

    if isinstance(value, str):
        raw_values = value.split(",")
    elif isinstance(value, Sequence) and not isinstance(value, (str, bytes)):
        raw_values = value
    else:
        raw_values = [value]

    normalized_values: list[str] = []
    seen_values: set[str] = set()

    for item in raw_values:
        normalized_value = normalize_text(item)

        if normalized_value and normalized_value not in seen_values:
            normalized_values.append(normalized_value)
            seen_values.add(normalized_value)

    return normalized_values


def normalize_text(value: Any) -> str:
    if value is None:
        return ""

    return " ".join(str(value).strip().casefold().split())


def parse_profile_date(value: Any) -> date | None:
    if isinstance(value, datetime):
        return value.date()

    if isinstance(value, date):
        return value

    if not isinstance(value, str) or not value.strip():
        return None

    try:
        return date.fromisoformat(value.strip()[:10])
    except ValueError:
        return None


def get_field(value: Any, field_name: str) -> Any:
    if isinstance(value, Mapping):
        return value.get(field_name)

    return getattr(value, field_name, None)


def clamp_score(score: float) -> float:
    return max(SCORE_MIN, min(SCORE_MAX, score))
