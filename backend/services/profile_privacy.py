from datetime import date, datetime
from typing import Any

from bson import ObjectId

from services.rule_based_matching import (
    find_shared_values,
    get_travel_date_overlap,
    normalize_text,
)


TRIBE_PROFILE_FIELDS = {
    "user_id",
    "name",
    "username",
    "bio",
    "profile_picture_url",
    "city",
    "country",
    "preferred_destinations",
    "interests",
    "available_from",
    "available_to",
    "travel_style",
    "budget_range",
    "preferred_trip_duration",
    "languages_spoken",
}

TRIBE_PROFILE_DEFAULTS = {
    "preferred_destinations": [],
    "interests": [],
    "languages_spoken": [],
    "bio": None,
    "profile_picture_url": None,
    "city": None,
    "country": None,
    "available_from": None,
    "available_to": None,
    "travel_style": None,
    "budget_range": None,
    "preferred_trip_duration": None,
}


TRIBE_IDENTITY_FIELDS = {
    "user_id",
    "name",
    "username",
    "bio",
    "profile_picture_url",
}


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
        return {key: serialize_value(item) for key, item in value.items()}

    return value


def serialize_tribe_profile(profile: dict[str, Any]) -> dict[str, Any]:
    serialized_profile = {
        field_name: serialize_value(profile.get(field_name))
        for field_name in TRIBE_PROFILE_FIELDS
        if field_name in profile
    }

    for field_name, default_value in TRIBE_PROFILE_DEFAULTS.items():
        serialized_profile.setdefault(
            field_name,
            default_value.copy() if isinstance(default_value, list) else default_value,
        )

    return serialized_profile


def serialize_tribe_identity(profile: dict[str, Any]) -> dict[str, Any]:
    return {
        field_name: serialize_value(profile.get(field_name))
        for field_name in TRIBE_IDENTITY_FIELDS
        if field_name in profile
    }


def serialize_tribe_match_profile(
    viewer_profile: dict[str, Any],
    target_profile: dict[str, Any],
) -> dict[str, Any]:
    shared_destinations = find_shared_values(
        viewer_profile.get("preferred_destinations"),
        target_profile.get("preferred_destinations"),
    )
    shared_interests = find_shared_values(
        viewer_profile.get("interests"),
        target_profile.get("interests"),
    )
    date_overlap = get_travel_date_overlap(viewer_profile, target_profile)
    overlapping_start = date_overlap[0].isoformat() if date_overlap else None
    overlapping_end = date_overlap[1].isoformat() if date_overlap else None
    travel_style = (
        target_profile.get("travel_style")
        if normalize_text(viewer_profile.get("travel_style"))
        and normalize_text(viewer_profile.get("travel_style"))
        == normalize_text(target_profile.get("travel_style"))
        else None
    )
    factors = build_safe_match_factors(
        shared_destinations,
        shared_interests,
        overlapping_start,
        overlapping_end,
        travel_style,
    )

    return {
        "user_id": serialize_value(target_profile.get("user_id")),
        "name": serialize_value(target_profile.get("name")),
        "username": serialize_value(target_profile.get("username")),
        "bio": serialize_value(target_profile.get("bio")),
        "profile_picture_url": serialize_value(target_profile.get("profile_picture_url")),
        "preferred_destinations": shared_destinations,
        "interests": shared_interests,
        "available_from": overlapping_start,
        "available_to": overlapping_end,
        "travel_style": serialize_value(travel_style),
        "match_context": {
            "shared_destinations": shared_destinations,
            "shared_interests": shared_interests,
            "overlapping_dates": {
                "available_from": overlapping_start,
                "available_to": overlapping_end,
            }
            if date_overlap
            else None,
            "travel_style": serialize_value(travel_style),
            "factors": factors,
            "explanation": build_safe_match_explanation(
                shared_destinations,
                shared_interests,
                date_overlap,
                travel_style,
            ),
        },
    }


def build_safe_match_factors(
    shared_destinations: list[str],
    shared_interests: list[str],
    overlapping_start: str | None,
    overlapping_end: str | None,
    travel_style: Any,
) -> list[dict[str, Any]]:
    factors: list[dict[str, Any]] = []

    if shared_destinations:
        factors.append(
            {
                "type": "destination",
                "label": "Shared destination",
                "value": shared_destinations,
            }
        )

    if overlapping_start and overlapping_end:
        factors.append(
            {
                "type": "dates",
                "label": "Date overlap",
                "value": (
                    overlapping_start
                    if overlapping_start == overlapping_end
                    else f"{overlapping_start} to {overlapping_end}"
                ),
                "start_date": overlapping_start,
                "end_date": overlapping_end,
            }
        )

    if shared_interests:
        factors.append(
            {
                "type": "interests",
                "label": "Shared interests",
                "value": shared_interests,
            }
        )

    if travel_style:
        factors.append(
            {
                "type": "travel_style",
                "label": "Similar travel style",
                "value": str(travel_style).strip(),
            }
        )

    return factors


def build_safe_match_explanation(
    shared_destinations: list[str],
    shared_interests: list[str],
    date_overlap: tuple[date, date] | None,
    travel_style: Any,
) -> str:
    sentences: list[str] = []

    if shared_destinations:
        sentences.append(
            f"You both overlap on {join_values(shared_destinations)}."
        )

    if date_overlap:
        start_date, end_date = date_overlap
        date_text = (
            start_date.isoformat()
            if start_date == end_date
            else f"{start_date.isoformat()} to {end_date.isoformat()}"
        )
        sentences.append(f"Your travel windows overlap from {date_text}.")

    if shared_interests:
        sentences.append(
            f"You share interests like {join_values(shared_interests[:3])}."
        )

    if travel_style:
        sentences.append(f"You also align on {travel_style} as a travel style.")

    if sentences:
        return " ".join(sentences)

    return "This traveler aligns with your saved Tribe matching signals."


def join_values(values: list[str]) -> str:
    cleaned_values = [value for value in values if value]

    if len(cleaned_values) <= 2:
        return " and ".join(cleaned_values)

    return f"{', '.join(cleaned_values[:-1])}, and {cleaned_values[-1]}"


def is_tribe_discoverable(profile: dict[str, Any] | None) -> bool:
    return bool(profile and profile.get("tribe_discoverable") is True)
