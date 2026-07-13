from __future__ import annotations

from collections.abc import Mapping
from dataclasses import dataclass
from datetime import date, datetime
from typing import Any


INCOMPLETE_PROFILE_MATCHING_MESSAGE = (
    "Please complete your travel profile before finding your tribe."
)

REQUIRED_AI_MATCHING_FIELDS = (
    "name",
    "username",
    "age",
    "gender",
    "preferred_travel_gender",
    "bio",
    "country",
    "city",
    "travel_style",
    "preferred_destinations",
    "budget_range",
    "preferred_trip_duration",
    "available_from",
    "available_to",
    "interests",
    "languages_spoken",
)


@dataclass(frozen=True)
class ProfileCompletenessResult:
    complete: bool
    missing_fields: list[str]

    def to_dict(self) -> dict[str, Any]:
        return {
            "complete": self.complete,
            "missing_fields": self.missing_fields,
        }


def evaluate_profile_completeness(
    profile: Mapping[str, Any] | None,
) -> ProfileCompletenessResult:
    missing_fields = get_missing_ai_matching_fields(profile)

    return ProfileCompletenessResult(
        complete=not missing_fields,
        missing_fields=missing_fields,
    )


def is_profile_complete_for_matching(profile: Mapping[str, Any] | None) -> bool:
    return evaluate_profile_completeness(profile).complete


def get_missing_ai_matching_fields(
    profile: Mapping[str, Any] | None,
) -> list[str]:
    if not profile:
        return list(REQUIRED_AI_MATCHING_FIELDS)

    missing_fields: list[str] = []

    for field_name in ("name", "username"):
        if not is_present_text(profile.get(field_name)):
            missing_fields.append(field_name)

    if not is_present_number(profile.get("age")):
        missing_fields.append("age")

    for field_name in (
        "gender",
        "preferred_travel_gender",
        "bio",
        "country",
        "city",
        "travel_style",
        "budget_range",
        "preferred_trip_duration",
    ):
        if not is_present_text(profile.get(field_name)):
            missing_fields.append(field_name)

    if len(normalize_list(profile.get("preferred_destinations"))) < 1:
        missing_fields.append("preferred_destinations")

    if len(normalize_list(profile.get("interests"))) < 3:
        missing_fields.append("interests")

    if len(normalize_list(profile.get("languages_spoken"))) < 1:
        missing_fields.append("languages_spoken")

    available_from = parse_profile_date(profile.get("available_from"))
    available_to = parse_profile_date(profile.get("available_to"))

    if available_from is None:
        missing_fields.append("available_from")

    if available_to is None:
        missing_fields.append("available_to")

    if (
        available_from is not None
        and available_to is not None
        and available_to < available_from
    ):
        missing_fields.append("available_to")

    return missing_fields


def is_present_text(value: Any) -> bool:
    return isinstance(value, str) and bool(value.strip())


def is_present_number(value: Any) -> bool:
    return isinstance(value, int) and not isinstance(value, bool)


def normalize_list(value: Any) -> list[Any]:
    if not isinstance(value, list):
        return []

    return [
        item.strip()
        for item in value
        if isinstance(item, str) and item.strip()
    ]


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
