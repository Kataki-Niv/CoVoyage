from __future__ import annotations

from collections.abc import Mapping, Sequence
from dataclasses import dataclass
from datetime import date, datetime
from typing import Any


class ProfileBuilderError(ValueError):
    """Raised when a profile cannot be converted into structured text."""


@dataclass(frozen=True)
class ProfileTextField:
    key: str
    label: str


PROFILE_TEXT_FIELDS: tuple[ProfileTextField, ...] = (
    ProfileTextField("name", "Traveler name"),
    ProfileTextField("age", "Age"),
    ProfileTextField("gender", "Gender"),
    ProfileTextField("preferred_travel_gender", "Preferred travel gender"),
    ProfileTextField("bio", "Bio"),
    ProfileTextField("country", "Country"),
    ProfileTextField("city", "City"),
    ProfileTextField("travel_style", "Travel style"),
    ProfileTextField("preferred_destinations", "Preferred destinations"),
    ProfileTextField("budget_range", "Budget range"),
    ProfileTextField("preferred_trip_duration", "Preferred trip duration"),
    ProfileTextField("available_from", "Available from"),
    ProfileTextField("available_to", "Available to"),
    ProfileTextField("interests", "Interests"),
    ProfileTextField("languages_spoken", "Languages spoken"),
    ProfileTextField(
        "previously_visited_countries",
        "Previously visited countries",
    ),
)


def build_profile_text(
    profile: Any,
    fields: Sequence[ProfileTextField] = PROFILE_TEXT_FIELDS,
) -> str:
    """Build deterministic, structured text from a travel profile."""

    profile_data = profile_to_dict(profile)
    text_lines: list[str] = []

    for field in fields:
        value = profile_data.get(field.key)
        formatted_value = format_profile_value(value)

        if formatted_value:
            text_lines.append(f"{field.label}: {formatted_value}")

    if not text_lines:
        raise ProfileBuilderError("Profile has no embeddable fields")

    return "\n".join(text_lines)


def profile_to_dict(profile: Any) -> dict[str, Any]:
    if isinstance(profile, Mapping):
        return dict(profile)

    if hasattr(profile, "model_dump"):
        return profile.model_dump(mode="json")

    if hasattr(profile, "dict"):
        return profile.dict()

    raise ProfileBuilderError(
        "Profile must be a mapping or Pydantic-style model"
    )


def format_profile_value(value: Any) -> str:
    if value is None:
        return ""

    if isinstance(value, str):
        return normalize_text(value)

    if isinstance(value, datetime):
        return value.date().isoformat()

    if isinstance(value, date):
        return value.isoformat()

    if isinstance(value, Mapping):
        return format_mapping(value)

    if isinstance(value, (list, tuple, set)):
        return format_sequence(value)

    return normalize_text(str(value))


def format_sequence(values: list[Any] | tuple[Any, ...] | set[Any]) -> str:
    raw_values = sorted(values, key=str) if isinstance(values, set) else values
    cleaned_values: list[str] = []
    seen_values: set[str] = set()

    for value in raw_values:
        formatted_value = format_profile_value(value)
        normalized_value = formatted_value.casefold()

        if formatted_value and normalized_value not in seen_values:
            cleaned_values.append(formatted_value)
            seen_values.add(normalized_value)

    return ", ".join(cleaned_values)


def format_mapping(value: Mapping[Any, Any]) -> str:
    parts: list[str] = []

    for nested_key in sorted(value, key=str):
        formatted_value = format_profile_value(value[nested_key])

        if formatted_value:
            parts.append(f"{normalize_text(str(nested_key))}: {formatted_value}")

    return "; ".join(parts)


def normalize_text(value: str) -> str:
    return " ".join(value.strip().split())
