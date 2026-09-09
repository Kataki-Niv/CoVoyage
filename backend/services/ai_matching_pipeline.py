from __future__ import annotations

import logging
from collections.abc import Mapping, Sequence
from dataclasses import dataclass
from typing import Any, Protocol

from services.compatibility_engine import (
    CompatibilityMatch,
    build_compatibility_matches,
)
from services.rule_based_matching import (
    find_shared_values,
    has_overlapping_travel_dates,
    travel_gender_preferences_are_compatible,
)
from services.profile_completeness import is_profile_complete_for_matching
from services.profile_privacy import is_tribe_discoverable
from services.similarity_search import SimilarTraveler, find_similar_users_by_ids


AI_MATCH_LIMIT = 6

logger = logging.getLogger(__name__)


class SimilaritySearchService(Protocol):
    def find_similar_users_by_ids(
        self,
        user_id: str,
        *,
        candidate_user_ids: Sequence[str],
    ) -> list[SimilarTraveler]:
        ...


class MatchingServiceError(RuntimeError):
    """Raised when the AI matching service cannot safely produce results."""

    def __init__(
        self,
        code: str = "matching_service_unavailable",
        message: str = "Tribe matching is temporarily unavailable. Please try again.",
    ) -> None:
        super().__init__(message)
        self.code = code
        self.message = message


@dataclass(frozen=True)
class AIProfileMatch:
    user_id: str
    semantic_score: float
    compatibility_score: float
    profile: dict[str, Any]


def find_ai_profile_matches(
    current_profile: Mapping[str, Any],
    profiles_collection: Any,
    *,
    top_k: int = AI_MATCH_LIMIT,
    similarity_search_service: SimilaritySearchService | None = None,
) -> list[AIProfileMatch]:
    current_user_id = str(current_profile.get("user_id", "")).strip()

    if not current_user_id:
        logger.warning("AI matching skipped because current profile has no user_id")
        return []

    if top_k <= 0:
        logger.warning("AI matching skipped because top_k must be greater than zero")
        return []

    candidate_profiles_by_user_id = fetch_candidate_profiles(
        profiles_collection,
        current_user_id,
    )

    if not candidate_profiles_by_user_id:
        logger.info(
            "AI matching found no MongoDB candidate profiles for user_id=%s",
            current_user_id,
        )
        return []

    eligible_candidate_profiles_by_user_id = filter_candidate_profiles_by_eligibility(
        current_profile,
        candidate_profiles_by_user_id,
    )

    if not eligible_candidate_profiles_by_user_id:
        logger.info(
            "AI matching found no eligible candidate profiles for user_id=%s",
            current_user_id,
        )
        return []

    eligible_similar_travelers = get_similar_travelers_for_candidates(
        current_user_id,
        eligible_candidate_profiles_by_user_id,
        similarity_search_service=similarity_search_service,
    )

    if not eligible_similar_travelers:
        logger.warning(
            "AI matching could not score eligible semantic candidates for user_id=%s",
            current_user_id,
        )
        raise MatchingServiceError("matching_semantic_service_unavailable")

    try:
        compatibility_matches = build_compatibility_matches(
            current_profile,
            eligible_similar_travelers,
            eligible_candidate_profiles_by_user_id,
        )
    except Exception as error:
        logger.exception(
            "AI compatibility ranking failed for user_id=%s",
            current_user_id,
        )
        raise MatchingServiceError("matching_ranking_failed") from error

    return attach_profiles_to_matches(
        compatibility_matches,
        eligible_candidate_profiles_by_user_id,
    )[:top_k]


def get_similar_travelers_for_candidates(
    user_id: str,
    candidate_profiles_by_user_id: Mapping[str, dict[str, Any]],
    *,
    similarity_search_service: SimilaritySearchService | None = None,
) -> list[SimilarTraveler]:
    candidate_user_ids = list(candidate_profiles_by_user_id)

    try:
        if similarity_search_service is not None:
            find_by_ids = getattr(
                similarity_search_service,
                "find_similar_users_by_ids",
                None,
            )

            if callable(find_by_ids):
                return find_by_ids(
                    user_id,
                    candidate_user_ids=candidate_user_ids,
                )

            find_legacy = getattr(
                similarity_search_service,
                "find_similar_users",
                None,
            )

            if callable(find_legacy):
                candidate_user_id_set = set(candidate_user_ids)
                return [
                    similar_traveler
                    for similar_traveler in find_legacy(
                        user_id,
                        top_k=len(candidate_user_ids),
                    )
                    if similar_traveler.user_id in candidate_user_id_set
                ]

        return find_similar_users_by_ids(
            user_id,
            candidate_user_ids=candidate_user_ids,
        )
    except Exception as error:
        logger.exception(
            "AI semantic scoring failed for eligible candidates for user_id=%s",
            user_id,
        )
        raise MatchingServiceError("matching_semantic_service_unavailable") from error


def fetch_candidate_profiles(
    profiles_collection: Any,
    current_user_id: str,
) -> dict[str, dict[str, Any]]:
    try:
        candidate_profiles = profiles_collection.find(
            {
                "user_id": {"$ne": current_user_id},
                "tribe_discoverable": True,
            }
        )
    except Exception as error:
        logger.exception("Failed to load AI match candidate profiles from MongoDB")
        raise MatchingServiceError("matching_candidate_lookup_failed") from error

    profiles_by_user_id: dict[str, dict[str, Any]] = {}

    for profile in candidate_profiles:
        user_id = str(profile.get("user_id", "")).strip()

        if user_id and user_id != current_user_id:
            profiles_by_user_id[user_id] = dict(profile)

    return profiles_by_user_id


def fetch_candidate_profiles_by_user_id(
    profiles_collection: Any,
    candidate_user_ids: Sequence[str],
) -> dict[str, dict[str, Any]]:
    user_ids = list(dict.fromkeys(user_id for user_id in candidate_user_ids if user_id))

    if not user_ids:
        return {}

    try:
        candidate_profiles = profiles_collection.find(
            {"user_id": {"$in": user_ids}}
        )
    except Exception as error:
        logger.exception(
            "Failed to load AI match candidate profiles from MongoDB"
        )
        raise MatchingServiceError("matching_candidate_lookup_failed") from error

    profiles_by_user_id: dict[str, dict[str, Any]] = {}

    for profile in candidate_profiles:
        user_id = str(profile.get("user_id", "")).strip()

        if user_id:
            profiles_by_user_id[user_id] = dict(profile)

    missing_user_ids = sorted(set(user_ids) - set(profiles_by_user_id))

    if missing_user_ids:
        logger.info(
            "AI matching skipped missing candidate profiles: %s",
            ", ".join(missing_user_ids),
        )

    return profiles_by_user_id


def filter_candidate_profiles_by_eligibility(
    current_profile: Mapping[str, Any],
    candidate_profiles_by_user_id: Mapping[str, dict[str, Any]],
) -> dict[str, dict[str, Any]]:
    source_profile = dict(current_profile)

    return {
        user_id: profile
        for user_id, profile in candidate_profiles_by_user_id.items()
        if candidate_is_eligible_for_ai_matching(source_profile, profile)
    }


def candidate_is_eligible_for_ai_matching(
    current_profile: dict[str, Any],
    candidate_profile: dict[str, Any],
) -> bool:
    return (
        is_tribe_discoverable(current_profile)
        and is_tribe_discoverable(candidate_profile)
        and is_profile_complete_for_matching(current_profile)
        and is_profile_complete_for_matching(candidate_profile)
        and travel_gender_preferences_are_compatible(
            current_profile,
            candidate_profile,
        )
        and has_shared_preferred_destination(current_profile, candidate_profile)
        and has_overlapping_travel_dates(current_profile, candidate_profile)
    )


def has_shared_preferred_destination(
    current_profile: dict[str, Any],
    candidate_profile: dict[str, Any],
) -> bool:
    return bool(
        find_shared_values(
            current_profile.get("preferred_destinations"),
            candidate_profile.get("preferred_destinations"),
        )
    )


def filter_similar_travelers_by_candidate_profiles(
    similar_travelers: Sequence[SimilarTraveler],
    candidate_profiles_by_user_id: Mapping[str, dict[str, Any]],
) -> list[SimilarTraveler]:
    eligible_user_ids = set(candidate_profiles_by_user_id)

    return [
        similar_traveler
        for similar_traveler in similar_travelers
        if similar_traveler.user_id in eligible_user_ids
    ]


def attach_profiles_to_matches(
    compatibility_matches: Sequence[CompatibilityMatch],
    candidate_profiles_by_user_id: Mapping[str, dict[str, Any]],
) -> list[AIProfileMatch]:
    ai_matches: list[AIProfileMatch] = []

    for compatibility_match in compatibility_matches:
        profile = candidate_profiles_by_user_id.get(compatibility_match.user_id)

        if profile is None:
            continue

        ai_matches.append(
            AIProfileMatch(
                user_id=compatibility_match.user_id,
                semantic_score=compatibility_match.semantic_score,
                compatibility_score=compatibility_match.compatibility_score,
                profile=dict(profile),
            )
        )

    return ai_matches


def build_ai_match_reason(match: AIProfileMatch) -> str:
    if match.semantic_score >= 80 and match.compatibility_score >= 70:
        return (
            "Your profiles are semantically similar and align across travel "
            "preferences."
        )

    if match.semantic_score >= 80:
        return "Your travel profiles are semantically similar."

    return "This traveler ranks well across semantic and travel preference signals."
