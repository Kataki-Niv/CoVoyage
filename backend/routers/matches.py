from datetime import date, datetime
from typing import Any

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from database import get_matches_collection
from dependencies import get_current_user, get_profiles_or_503
from services.rule_based_matching import find_rule_based_matches


router = APIRouter(prefix="/matches", tags=["matches"])


def serialize_value(value: Any) -> Any:
    if isinstance(value, ObjectId):
        return str(value)

    if isinstance(value, datetime):
        return value.isoformat()

    if isinstance(value, date):
        return value.isoformat()

    if isinstance(value, list):
        return [serialize_value(item) for item in value]

    if isinstance(value, dict):
        return {
            key: serialize_value(item)
            for key, item in value.items()
        }

    return value


def serialize_match(scored_match) -> dict[str, Any]:
    profile = dict(scored_match.profile)
    profile.pop("_id", None)
    profile.setdefault("preferred_travel_gender", "Anyone")

    return {
        "profile": serialize_value(profile),
        "compatibility_score": scored_match.compatibility_score,
        "reason": scored_match.reason,
        "factors": [
            {
                "name": factor.name,
                "score": factor.score,
                "weight": factor.weight,
                "matches": factor.matches,
            }
            for factor in scored_match.factors
            if factor.score > 0
        ],
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

    candidate_profiles = list(
        profiles.find({"user_id": {"$ne": current_user_id}})
    )
    scored_matches = find_rule_based_matches(
        current_profile,
        candidate_profiles,
    )

    return [serialize_match(match) for match in scored_matches]


@router.get("/status")
def matches_status():
    get_matches_collection()
    return {
        "collection": "matches",
        "ready": True,
        "message": "Matches collection is ready for future matching logic.",
    }
