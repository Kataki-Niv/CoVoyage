from datetime import date, datetime
from typing import Any

from bson import ObjectId


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


def is_tribe_discoverable(profile: dict[str, Any] | None) -> bool:
    return bool(profile and profile.get("tribe_discoverable") is True)
