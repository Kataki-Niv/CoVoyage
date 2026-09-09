from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status

from database import (
    get_connection_requests_collection,
    get_matches_collection,
    get_tribe_blocks_collection,
)
from dependencies import get_current_user, get_profiles_or_503
from services.ai_matching_pipeline import (
    AIProfileMatch,
    MatchingServiceError,
    find_ai_profile_matches,
)
from services.connections import get_relationship_status
from services.blocks import users_are_blocked
from services.profile_completeness import (
    INCOMPLETE_PROFILE_MATCHING_MESSAGE,
    evaluate_profile_completeness,
)
from services.profile_privacy import (
    is_tribe_discoverable,
    serialize_tribe_match_profile,
)


router = APIRouter(prefix="/matches", tags=["matches"])


def raise_matching_service_unavailable(error: MatchingServiceError) -> None:
    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail={
            "code": error.code,
            "message": error.message,
        },
    ) from error


def serialize_match(
    match: AIProfileMatch,
    current_profile: dict[str, Any],
    relationship_status: str = "none",
) -> dict[str, Any]:
    profile = serialize_tribe_match_profile(current_profile, match.profile)
    match_context = profile.get("match_context") or {}
    factors = match_context.get("factors") or []
    explanation = match_context.get(
        "explanation",
        "This traveler aligns with your saved Tribe matching signals.",
    )

    return {
        "user_id": match.user_id,
        "profile": profile,
        "semantic_score": match.semantic_score,
        "compatibility_score": match.compatibility_score,
        "reason": explanation,
        "explanation": explanation,
        "factors": factors,
        "relationship_status": relationship_status,
    }


@router.get("")
def get_matches(current_user=Depends(get_current_user)):
    profiles = get_profiles_or_503()
    current_user_id = str(current_user["_id"])
    current_profile = profiles.find_one({"user_id": current_user_id})

    if current_profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Create a travel profile before finding matches",
        )

    if not is_tribe_discoverable(current_profile):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "code": "tribe_not_discoverable",
                "message": "Enable Tribe Matching before finding matches.",
            },
        )

    completeness = evaluate_profile_completeness(current_profile)

    if not completeness.complete:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "code": "profile_incomplete",
                "message": INCOMPLETE_PROFILE_MATCHING_MESSAGE,
                "profile_completeness": completeness.to_dict(),
            },
        )

    try:
        ai_matches = find_ai_profile_matches(
            current_profile,
            profiles,
        )
    except MatchingServiceError as error:
        raise_matching_service_unavailable(error)

    connection_requests = get_connection_requests_collection()
    tribe_blocks = get_tribe_blocks_collection()

    return [
        serialize_match(
            match,
            current_profile,
            get_relationship_status(
                connection_requests,
                current_user_id,
                match.user_id,
            ),
        )
        for match in ai_matches
        if not users_are_blocked(tribe_blocks, current_user_id, match.user_id)
    ]


@router.get("/status")
def matches_status():
    get_matches_collection()
    return {
        "collection": "matches",
        "ready": True,
        "message": "Matches collection is ready for future matching logic.",
    }
