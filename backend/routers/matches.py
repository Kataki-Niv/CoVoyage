from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status

from database import get_matches_collection
from dependencies import get_current_user, get_profiles_or_503
from services.ai_matching_pipeline import (
    AIProfileMatch,
    build_ai_match_reason,
    find_ai_profile_matches,
)
from services.profile_completeness import (
    INCOMPLETE_PROFILE_MATCHING_MESSAGE,
    evaluate_profile_completeness,
)
from services.profile_privacy import is_tribe_discoverable, serialize_tribe_profile


router = APIRouter(prefix="/matches", tags=["matches"])


def serialize_match(match: AIProfileMatch) -> dict[str, Any]:
    return {
        "user_id": match.user_id,
        "profile": serialize_tribe_profile(match.profile),
        "semantic_score": match.semantic_score,
        "compatibility_score": match.compatibility_score,
        "reason": build_ai_match_reason(match),
        "factors": [],
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

    ai_matches = find_ai_profile_matches(
        current_profile,
        profiles,
    )

    return [serialize_match(match) for match in ai_matches]


@router.get("/status")
def matches_status():
    get_matches_collection()
    return {
        "collection": "matches",
        "ready": True,
        "message": "Matches collection is ready for future matching logic.",
    }
