from __future__ import annotations

from collections.abc import Mapping, Sequence
from dataclasses import dataclass
from typing import Any

from services.similarity_search import SimilarTraveler


SCORE_MIN = 0.0
SCORE_MAX = 100.0

COMPATIBILITY_WEIGHTS = {
    "semantic_similarity": 0.80,
    "budget_range": 0.06666666666666667,
    "travel_style": 0.06666666666666667,
    "languages_spoken": 0.06666666666666667,
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
        + score_budget_compatibility(source_profile, candidate_profile)
        * COMPATIBILITY_WEIGHTS["budget_range"]
        + score_travel_style_compatibility(source_profile, candidate_profile)
        * COMPATIBILITY_WEIGHTS["travel_style"]
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


def score_language_compatibility(
    source_profile: Mapping[str, Any],
    candidate_profile: Mapping[str, Any],
) -> float:
    return score_list_overlap(
        source_profile.get("languages_spoken"),
        candidate_profile.get("languages_spoken"),
    )


def score_list_overlap(source_values: Any, candidate_values: Any) -> float:
    source_items = normalize_list(source_values)
    candidate_items = normalize_list(candidate_values)

    if not source_items or not candidate_items:
        return SCORE_MIN

    source_lookup = set(source_items)
    candidate_lookup = set(candidate_items)
    union = source_lookup | candidate_lookup

    if not union:
        return SCORE_MIN

    overlap = source_lookup & candidate_lookup
    return round((len(overlap) / len(union)) * SCORE_MAX, 2)


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


def get_field(value: Any, field_name: str) -> Any:
    if isinstance(value, Mapping):
        return value.get(field_name)

    return getattr(value, field_name, None)


def clamp_score(score: float) -> float:
    return max(SCORE_MIN, min(SCORE_MAX, score))
