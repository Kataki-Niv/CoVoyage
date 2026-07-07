from dataclasses import dataclass
from datetime import date, datetime
from typing import Any


MATCH_THRESHOLD = 40
TOP_MATCH_LIMIT = 6

SCORING_WEIGHTS = {
    "preferred_destinations": 25,
    "interests": 25,
    "travel_style": 15,
    "budget_range": 15,
    "travel_dates": 10,
    "preferred_trip_duration": 5,
    "languages_spoken": 5,
}


@dataclass(frozen=True)
class MatchingFactor:
    name: str
    score: int
    weight: int
    matches: list[str]


@dataclass(frozen=True)
class ScoredMatch:
    profile: dict[str, Any]
    compatibility_score: int
    reason: str
    factors: list[MatchingFactor]


def find_rule_based_matches(
    source_profile: Any,
    candidate_profiles: list[Any],
    minimum_score: int = MATCH_THRESHOLD,
    limit: int | None = TOP_MATCH_LIMIT,
) -> list[ScoredMatch]:
    source = profile_to_dict(source_profile)
    scored_matches = []

    for candidate_profile in candidate_profiles:
        candidate = profile_to_dict(candidate_profile)

        if not has_overlapping_travel_dates(source, candidate):
            continue

        if not travel_gender_preferences_are_compatible(source, candidate):
            continue

        scored_match = compare_profiles(source, candidate)

        if scored_match.compatibility_score >= minimum_score:
            scored_matches.append(scored_match)

    sorted_matches = sorted(
        scored_matches,
        key=lambda match: match.compatibility_score,
        reverse=True,
    )

    if limit is None:
        return sorted_matches

    return sorted_matches[:limit]


def compare_profiles(source_profile: Any, candidate_profile: Any) -> ScoredMatch:
    source = profile_to_dict(source_profile)
    candidate = profile_to_dict(candidate_profile)

    factors = [
        score_preferred_destinations(source, candidate),
        score_interests(source, candidate),
        score_travel_style(source, candidate),
        score_budget_range(source, candidate),
        score_travel_dates(source, candidate),
        score_preferred_trip_duration(source, candidate),
        score_languages_spoken(source, candidate),
    ]
    compatibility_score = sum(factor.score for factor in factors)

    return ScoredMatch(
        profile=candidate,
        compatibility_score=compatibility_score,
        reason=generate_match_reason(factors),
        factors=factors,
    )


def score_preferred_destinations(
    source_profile: dict[str, Any],
    candidate_profile: dict[str, Any],
) -> MatchingFactor:
    matches = find_shared_values(
        source_profile.get("preferred_destinations"),
        candidate_profile.get("preferred_destinations"),
    )
    weight = SCORING_WEIGHTS["preferred_destinations"]

    return MatchingFactor(
        name="preferred_destinations",
        score=weight if matches else 0,
        weight=weight,
        matches=matches,
    )


def score_interests(
    source_profile: dict[str, Any],
    candidate_profile: dict[str, Any],
) -> MatchingFactor:
    source_interests = normalize_list(source_profile.get("interests"))
    candidate_interests = normalize_list(candidate_profile.get("interests"))
    matches = find_shared_values(source_interests, candidate_interests)
    weight = SCORING_WEIGHTS["interests"]

    if not source_interests or not candidate_interests or not matches:
        score = 0
    else:
        total_unique_interests = len(
            {normalize_text(value) for value in source_interests + candidate_interests}
        )
        score = round(weight * (len(matches) / total_unique_interests))

    return MatchingFactor(
        name="interests",
        score=score,
        weight=weight,
        matches=matches,
    )


def score_travel_style(
    source_profile: dict[str, Any],
    candidate_profile: dict[str, Any],
) -> MatchingFactor:
    return score_exact_text_match(source_profile, candidate_profile, "travel_style")


def score_budget_range(
    source_profile: dict[str, Any],
    candidate_profile: dict[str, Any],
) -> MatchingFactor:
    return score_exact_text_match(source_profile, candidate_profile, "budget_range")


def score_travel_dates(
    source_profile: dict[str, Any],
    candidate_profile: dict[str, Any],
) -> MatchingFactor:
    weight = SCORING_WEIGHTS["travel_dates"]
    overlap = get_travel_date_overlap(source_profile, candidate_profile)
    matches = [format_date_range(*overlap)] if overlap else []

    return MatchingFactor(
        name="travel_dates",
        score=weight if matches else 0,
        weight=weight,
        matches=matches,
    )


def score_preferred_trip_duration(
    source_profile: dict[str, Any],
    candidate_profile: dict[str, Any],
) -> MatchingFactor:
    return score_exact_text_match(
        source_profile,
        candidate_profile,
        "preferred_trip_duration",
    )


def score_languages_spoken(
    source_profile: dict[str, Any],
    candidate_profile: dict[str, Any],
) -> MatchingFactor:
    matches = find_shared_values(
        source_profile.get("languages_spoken"),
        candidate_profile.get("languages_spoken"),
    )
    weight = SCORING_WEIGHTS["languages_spoken"]

    return MatchingFactor(
        name="languages_spoken",
        score=weight if matches else 0,
        weight=weight,
        matches=matches,
    )


def score_exact_text_match(
    source_profile: dict[str, Any],
    candidate_profile: dict[str, Any],
    field_name: str,
) -> MatchingFactor:
    source_value = normalize_text(source_profile.get(field_name))
    candidate_value = normalize_text(candidate_profile.get(field_name))
    weight = SCORING_WEIGHTS[field_name]
    matches = []

    if source_value and source_value == candidate_value:
        matches = [str(source_profile.get(field_name)).strip()]

    return MatchingFactor(
        name=field_name,
        score=weight if matches else 0,
        weight=weight,
        matches=matches,
    )


def generate_match_reason(factors: list[MatchingFactor]) -> str:
    strongest_factors = [
        factor
        for factor in sorted(factors, key=lambda item: item.score, reverse=True)
        if factor.score > 0
    ][:3]

    if not strongest_factors:
        return "You have a few travel preferences in common."

    reason_parts = []

    for factor in strongest_factors:
        reason_part = describe_factor(factor)

        if reason_part:
            reason_parts.append(reason_part)

    if not reason_parts:
        return "You have a few travel preferences in common."

    return f"You {join_reason_parts(reason_parts)}."


def describe_factor(factor: MatchingFactor) -> str:
    match_text = join_values(factor.matches)

    if factor.name == "preferred_destinations":
        return f"both want to visit {match_text}"

    if factor.name == "interests":
        return f"both enjoy {match_text}"

    if factor.name == "travel_style":
        return f"share a {match_text} travel style"

    if factor.name == "budget_range":
        return f"prefer {match_text} travel"

    if factor.name == "travel_dates":
        return f"are available around {match_text}"

    if factor.name == "preferred_trip_duration":
        return f"prefer {match_text} trips"

    if factor.name == "languages_spoken":
        return f"speak {match_text}"

    return ""


def profile_to_dict(profile: Any) -> dict[str, Any]:
    if isinstance(profile, dict):
        return dict(profile)

    if hasattr(profile, "model_dump"):
        return profile.model_dump(mode="json")

    if hasattr(profile, "dict"):
        return profile.dict()

    raise TypeError("Profile must be a dictionary or Pydantic-style model")


def find_shared_values(source_values: Any, candidate_values: Any) -> list[str]:
    source_items = normalize_list(source_values)
    candidate_items = normalize_list(candidate_values)
    candidate_lookup = {normalize_text(value) for value in candidate_items}

    return [
        value
        for value in source_items
        if normalize_text(value) in candidate_lookup
    ]


def normalize_list(value: Any) -> list[str]:
    if value is None:
        return []

    if isinstance(value, str):
        raw_values = value.split(",")
    elif isinstance(value, list):
        raw_values = value
    elif isinstance(value, (tuple, set)):
        raw_values = list(value)
    else:
        raw_values = [value]

    cleaned_values = []
    seen_values = set()

    for item in raw_values:
        text = str(item).strip()
        normalized_text = normalize_text(text)

        if text and normalized_text not in seen_values:
            cleaned_values.append(text)
            seen_values.add(normalized_text)

    return cleaned_values


def normalize_text(value: Any) -> str:
    return str(value).strip().casefold() if value is not None else ""


def parse_date_range(profile: dict[str, Any]) -> tuple[date, date] | None:
    available_from = parse_date(profile.get("available_from"))
    available_to = parse_date(profile.get("available_to"))

    if available_from is None or available_to is None:
        return None

    if available_to < available_from:
        return None

    return available_from, available_to


def has_overlapping_travel_dates(
    source_profile: dict[str, Any],
    candidate_profile: dict[str, Any],
) -> bool:
    return get_travel_date_overlap(source_profile, candidate_profile) is not None


def travel_gender_preferences_are_compatible(
    source_profile: dict[str, Any],
    candidate_profile: dict[str, Any],
) -> bool:
    return (
        traveler_matches_gender_preference(source_profile, candidate_profile)
        and traveler_matches_gender_preference(candidate_profile, source_profile)
    )


def traveler_matches_gender_preference(
    traveler_profile: dict[str, Any],
    candidate_profile: dict[str, Any],
) -> bool:
    preferred_gender = normalize_gender_preference(
        traveler_profile.get("preferred_travel_gender")
    )

    if preferred_gender == "anyone":
        return True

    return preferred_gender == normalize_text(candidate_profile.get("gender"))


def normalize_gender_preference(value: Any) -> str:
    normalized_value = normalize_text(value)
    return normalized_value if normalized_value else "anyone"


def get_travel_date_overlap(
    source_profile: dict[str, Any],
    candidate_profile: dict[str, Any],
) -> tuple[date, date] | None:
    source_range = parse_date_range(source_profile)
    candidate_range = parse_date_range(candidate_profile)

    if source_range is None or candidate_range is None:
        return None

    source_start, source_end = source_range
    candidate_start, candidate_end = candidate_range

    if source_start > candidate_end or candidate_start > source_end:
        return None

    return max(source_start, candidate_start), min(source_end, candidate_end)


def parse_date(value: Any) -> date | None:
    if value is None or value == "":
        return None

    if isinstance(value, datetime):
        return value.date()

    if isinstance(value, date):
        return value

    if isinstance(value, str):
        try:
            return date.fromisoformat(value[:10])
        except ValueError:
            return None

    return None


def format_date_range(start_date: date, end_date: date) -> str:
    if start_date == end_date:
        return start_date.isoformat()

    return f"{start_date.isoformat()} to {end_date.isoformat()}"


def join_values(values: list[str]) -> str:
    if len(values) <= 2:
        return " and ".join(values)

    return f"{', '.join(values[:-1])}, and {values[-1]}"


def join_reason_parts(parts: list[str]) -> str:
    if len(parts) <= 2:
        return " and ".join(parts)

    return f"{', '.join(parts[:-1])}, and {parts[-1]}"
