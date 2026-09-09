from __future__ import annotations

from typing import Any

from services.rule_based_matching import (
    find_shared_values,
    get_travel_date_overlap,
    normalize_text,
)


def build_match_evidence(
    source_profile: dict[str, Any],
    candidate_profile: dict[str, Any],
) -> list[dict[str, Any]]:
    factors: list[dict[str, Any]] = []

    shared_destinations = find_shared_values(
        source_profile.get("preferred_destinations"),
        candidate_profile.get("preferred_destinations"),
    )
    if shared_destinations:
        factors.append(
            {
                "type": "destination",
                "label": "Shared destination",
                "value": shared_destinations,
            }
        )

    date_overlap = get_travel_date_overlap(source_profile, candidate_profile)
    if date_overlap:
        start_date, end_date = date_overlap
        overlap_days = (end_date - start_date).days + 1
        factors.append(
            {
                "type": "dates",
                "label": "Date overlap",
                "value": format_day_count(overlap_days),
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "days": overlap_days,
            }
        )

    shared_interests = find_shared_values(
        source_profile.get("interests"),
        candidate_profile.get("interests"),
    )
    if shared_interests:
        factors.append(
            {
                "type": "interests",
                "label": "Shared interests",
                "value": shared_interests,
            }
        )

    travel_style = matching_text_value(
        source_profile.get("travel_style"),
        candidate_profile.get("travel_style"),
    )
    if travel_style:
        factors.append(
            {
                "type": "travel_style",
                "label": "Similar travel style",
                "value": travel_style,
            }
        )

    budget_range = matching_text_value(
        source_profile.get("budget_range"),
        candidate_profile.get("budget_range"),
    )
    if budget_range:
        factors.append(
            {
                "type": "budget",
                "label": "Similar budget",
                "value": budget_range,
            }
        )

    trip_duration = matching_text_value(
        source_profile.get("preferred_trip_duration"),
        candidate_profile.get("preferred_trip_duration"),
    )
    if trip_duration:
        factors.append(
            {
                "type": "trip_duration",
                "label": "Similar trip length",
                "value": trip_duration,
            }
        )

    shared_languages = find_shared_values(
        source_profile.get("languages_spoken"),
        candidate_profile.get("languages_spoken"),
    )
    if shared_languages:
        factors.append(
            {
                "type": "languages",
                "label": "Shared languages",
                "value": shared_languages,
            }
        )

    return factors


def build_match_explanation(factors: list[dict[str, Any]]) -> str:
    shared_destinations = get_list_factor(factors, "destination")
    shared_interests = get_list_factor(factors, "interests")
    date_factor = get_factor(factors, "dates")
    travel_style = get_scalar_factor(factors, "travel_style")
    budget = get_scalar_factor(factors, "budget")

    sentences: list[str] = []

    if shared_destinations and shared_interests:
        sentences.append(
            "You both want to visit "
            f"{join_values(shared_destinations)} and share interests like "
            f"{join_values(shared_interests[:3])}."
        )
    elif shared_destinations:
        sentences.append(
            f"You both want to visit {join_values(shared_destinations)}."
        )
    elif shared_interests:
        sentences.append(
            f"You both share interests like {join_values(shared_interests[:3])}."
        )

    if date_factor:
        date_value = str(date_factor.get("value", "")).strip()
        if date_value:
            sentences.append(f"Your travel windows overlap for {date_value}.")

    preference_parts = []
    if travel_style:
        preference_parts.append(f"{travel_style} as a travel style")
    if budget:
        preference_parts.append(f"{budget} budgets")

    if preference_parts:
        sentences.append(f"You also align on {join_values(preference_parts)}.")

    if sentences:
        return " ".join(sentences)

    return "This traveler aligns with your saved travel profile signals."


def matching_text_value(left: Any, right: Any) -> str | None:
    if normalize_text(left) and normalize_text(left) == normalize_text(right):
        return str(left).strip()

    return None


def get_factor(
    factors: list[dict[str, Any]],
    factor_type: str,
) -> dict[str, Any] | None:
    return next(
        (factor for factor in factors if factor.get("type") == factor_type),
        None,
    )


def get_list_factor(factors: list[dict[str, Any]], factor_type: str) -> list[str]:
    factor = get_factor(factors, factor_type)
    value = factor.get("value") if factor else None

    if isinstance(value, list):
        return [str(item) for item in value if str(item).strip()]

    if isinstance(value, str) and value.strip():
        return [value.strip()]

    return []


def get_scalar_factor(factors: list[dict[str, Any]], factor_type: str) -> str:
    factor = get_factor(factors, factor_type)
    value = factor.get("value") if factor else None

    if isinstance(value, list):
        return ", ".join(str(item) for item in value if str(item).strip())

    return str(value).strip() if value is not None else ""


def format_day_count(days: int) -> str:
    return "1 day" if days == 1 else f"{days} days"


def join_values(values: list[str]) -> str:
    cleaned_values = [value for value in values if value]

    if len(cleaned_values) <= 2:
        return " and ".join(cleaned_values)

    return f"{', '.join(cleaned_values[:-1])}, and {cleaned_values[-1]}"
