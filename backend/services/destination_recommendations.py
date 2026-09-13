from __future__ import annotations

from copy import deepcopy
from datetime import datetime
from importlib import import_module
from typing import Any

from database import (
    get_countries_collection,
    get_destination_monthly_factors_collection,
    get_places_collection,
)
from services.destination_scoring import (
    score_country_destination,
    score_place_destination,
)


SUPPORTED_STATIC_COUNTRIES = (
    "argentina",
    "canada",
    "france",
    "guatemala",
    "iceland",
    "indonesia",
    "italy",
    "japan",
    "kenya",
    "mexico",
    "morocco",
    "new-zealand",
    "norway",
    "peru",
    "portugal",
    "south-africa",
    "spain",
    "thailand",
    "turkey",
    "vietnam",
)

MONTH_PROFILES = {
    1: {
        "label": "January winter and dry-season escapes",
        "activities": ["City walks", "Museums", "Food", "Beaches", "Markets"],
        "highlights": ["Lower crowds", "Winter culture", "Dry-season sun"],
        "weather": "January favors winter culture, dry-season routes, beaches in warmer regions, and city travel with shorter queues.",
        "value": "January can be a strong value month outside holiday hotspots.",
    },
    2: {
        "label": "February festivals and clear-season travel",
        "activities": ["Festivals", "Food walks", "Museums", "Beaches", "Markets"],
        "highlights": ["Festival season", "Food", "Dry-season routes"],
        "weather": "February supports festivals, food-led city travel, and many dry-season warm-weather routes.",
        "value": "February can balance pleasant conditions with better value after peak holidays.",
    },
    3: {
        "label": "March spring and shoulder-season travel",
        "activities": ["Walking", "Museums", "Temples", "Markets", "Photography"],
        "highlights": ["Spring color", "Shoulder-season value", "Outdoor days"],
        "weather": "March is a shoulder-season month where spring color, city walking, and cultural routes become easier.",
        "value": "March often improves value before peak spring and summer demand.",
    },
    4: {
        "label": "April spring culture and outdoor travel",
        "activities": ["Walking", "Gardens", "Temples", "Museums", "Food walks"],
        "highlights": ["Spring weather", "Gardens", "Cultural travel"],
        "weather": "April is well suited to spring culture, gardens, heritage sites, food walks, and outdoor sightseeing.",
        "value": "April is popular in many regions, so early booking protects value.",
    },
    5: {
        "label": "May pre-summer routes",
        "activities": ["Hiking", "Walking", "Food", "Markets", "Coastal walks"],
        "highlights": ["Longer days", "Pre-summer access", "Local markets"],
        "weather": "May brings longer days and strong pre-summer conditions for walking, food, nature, and coastal routes.",
        "value": "May is often a useful balance between good weather and pre-peak pricing.",
    },
    6: {
        "label": "June early-summer access",
        "activities": ["Hiking", "Road trips", "Festivals", "Beaches", "Photography"],
        "highlights": ["Long daylight", "Early summer", "Outdoor activity"],
        "weather": "June supports early-summer access, outdoor activity, festivals, and long daylight in northern destinations.",
        "value": "June demand rises, but it can still be easier than late summer in some regions.",
    },
    7: {
        "label": "July high-summer energy",
        "activities": ["Beaches", "Festivals", "Road trips", "Hiking", "Food"],
        "highlights": ["Peak summer", "Events", "Outdoor travel"],
        "weather": "July favors high-summer energy, beaches, road trips, festivals, and mountain or coastal escapes.",
        "value": "July is peak season in many destinations, so plan logistics early.",
    },
    8: {
        "label": "August late-summer travel",
        "activities": ["Festivals", "Hiking", "Road trips", "Food", "Beaches"],
        "highlights": ["Late summer", "Events", "Open routes"],
        "weather": "August supports late-summer routes, events, long outdoor days, and destinations with strong seasonal access.",
        "value": "August can be high demand, so value improves with early booking and flexible routing.",
    },
    9: {
        "label": "September shoulder-season culture",
        "activities": ["Food", "Markets", "Walking", "Museums", "Road trips"],
        "highlights": ["Shoulder season", "Harvest", "Milder weather"],
        "weather": "September is a strong shoulder-season month for food, markets, milder city walks, road trips, and post-peak travel.",
        "value": "September often improves value after the busiest summer weeks.",
    },
    10: {
        "label": "October autumn and food travel",
        "activities": ["Food", "Museums", "Walking", "Photography", "Markets"],
        "highlights": ["Autumn color", "Food", "Cultural travel"],
        "weather": "October favors autumn color, food routes, museums, city walking, and cultural travel with cooler conditions.",
        "value": "October can be a practical value month outside major holiday periods.",
    },
    11: {
        "label": "November value and quieter cities",
        "activities": ["Museums", "Food", "Markets", "City walks", "Wellness"],
        "highlights": ["Lower crowds", "Value", "Indoor culture"],
        "weather": "November supports quieter cities, indoor culture, food, wellness, and flexible value-focused trips.",
        "value": "November is often one of the better months for budget-conscious travel.",
    },
    12: {
        "label": "December holidays and winter atmosphere",
        "activities": ["Markets", "Food", "Museums", "Festivals", "City walks"],
        "highlights": ["Holiday atmosphere", "Markets", "Winter culture"],
        "weather": "December works well for holiday atmosphere, markets, winter culture, food, and festive city travel.",
        "value": "December value varies sharply around holiday dates, so book important logistics early.",
    },
}

MONTH_COUNTRY_BOOSTS = {
    1: ("thailand", "mexico", "kenya", "morocco", "indonesia"),
    2: ("thailand", "mexico", "japan", "morocco", "kenya"),
    3: ("japan", "italy", "france", "portugal", "spain"),
    4: ("japan", "france", "italy", "spain", "portugal"),
    5: ("italy", "france", "portugal", "spain", "canada"),
    6: ("iceland", "canada", "france", "italy", "portugal"),
    7: ("iceland", "canada", "france", "spain", "indonesia"),
    8: ("iceland", "guatemala", "spain", "japan", "indonesia"),
    9: ("italy", "france", "portugal", "japan", "spain"),
    10: ("japan", "italy", "france", "morocco", "spain"),
    11: ("morocco", "mexico", "thailand", "peru", "portugal"),
    12: ("thailand", "mexico", "morocco", "japan", "france"),
}


def get_current_year_month() -> tuple[int, int]:
    today = datetime.utcnow()
    return today.year, today.month


def resolve_year_month(
    year: int | None,
    month: int | None,
) -> tuple[int, int]:
    if year is not None and month is not None:
        return year, month

    return get_current_year_month()


def normalize_slug(value: str) -> str:
    return value.strip().lower()


def seasonal_country_score(country_slug: str, base_score: float, month: int) -> float:
    boosted_slugs = MONTH_COUNTRY_BOOSTS.get(month, ())

    if country_slug in boosted_slugs:
        return min(100, round(base_score + 14 - boosted_slugs.index(country_slug) * 2, 2))

    return round(base_score, 2)


def load_static_destination_datasets() -> dict[str, dict[str, Any]]:
    datasets: dict[str, dict[str, Any]] = {}

    for country_slug in SUPPORTED_STATIC_COUNTRIES:
        module_name = country_slug.replace("-", "_")

        try:
            module = import_module(f"data.{module_name}")
            getter = getattr(module, f"get_{module_name}_seed_dataset")
        except Exception:
            continue

        try:
            dataset = getter()
        except Exception:
            continue

        country = dataset.get("country") or {}
        slug = country.get("slug")

        if slug:
            datasets[slug] = dataset

    return datasets


def load_destination_records() -> tuple[
    dict[str, dict[str, Any]],
    dict[str, list[dict[str, Any]]],
    dict[tuple[str, str | None], list[dict[str, Any]]],
]:
    static_datasets = load_static_destination_datasets()
    countries = {
        slug: deepcopy(dataset["country"])
        for slug, dataset in static_datasets.items()
        if dataset.get("country")
    }
    places_by_country = {
        slug: [deepcopy(place) for place in dataset.get("places", [])]
        for slug, dataset in static_datasets.items()
    }
    factors_by_country_place: dict[tuple[str, str | None], list[dict[str, Any]]] = {}

    for slug, dataset in static_datasets.items():
        for factor in dataset.get("monthly_factors", []):
            key = (slug, factor.get("place_slug"))
            factors_by_country_place.setdefault(key, []).append(deepcopy(factor))

    try:
        countries_collection = get_countries_collection()
        places_collection = get_places_collection()
        factors_collection = get_destination_monthly_factors_collection()

        for country in countries_collection.find():
            countries[country["slug"]] = dict(country)

        for place in places_collection.find():
            places_by_country.setdefault(place["country_slug"], [])
            existing = [
                item
                for item in places_by_country[place["country_slug"]]
                if item.get("slug") != place.get("slug")
            ]
            places_by_country[place["country_slug"]] = [*existing, dict(place)]

        for factor in factors_collection.find():
            key = (factor["country_slug"], factor.get("place_slug"))
            existing = [
                item
                for item in factors_by_country_place.get(key, [])
                if not (
                    item.get("year") == factor.get("year")
                    and item.get("month") == factor.get("month")
                )
            ]
            factors_by_country_place[key] = [*existing, dict(factor)]
    except Exception:
        pass

    return countries, places_by_country, factors_by_country_place


def find_factor_for_month(
    factors_by_country_place: dict[tuple[str, str | None], list[dict[str, Any]]],
    country_slug: str,
    place_slug: str | None,
    year: int,
    month: int,
) -> dict[str, Any] | None:
    factors = factors_by_country_place.get((country_slug, place_slug), [])

    for factor in factors:
        if factor.get("year") == year and factor.get("month") == month:
            return deepcopy(factor)

    if factors:
        return derive_monthly_factor(factors[0], year, month, country_slug, place_slug)

    return None


def derive_monthly_factor(
    base_factor: dict[str, Any],
    year: int,
    month: int,
    country_slug: str,
    place_slug: str | None,
) -> dict[str, Any]:
    profile = MONTH_PROFILES[month]
    factor = deepcopy(base_factor)
    factor["year"] = year
    factor["month"] = month
    factor["country_slug"] = country_slug

    if place_slug is None:
        factor.pop("place_slug", None)
    else:
        factor["place_slug"] = place_slug

    weather_climate = factor.get("weather_climate") or {}
    weather_climate["summary"] = profile["weather"]
    weather_climate["daylight_summary"] = (
        f"{profile['label']} shapes the best route choices this month."
    )
    factor["weather_climate"] = weather_climate
    factor["weather_suitability_input"] = profile["weather"]
    factor["daylight_information"] = (
        f"Build the route around {profile['label']} and keep daily plans flexible."
    )
    factor["seasonal_highlights"] = profile["highlights"]
    factor["seasonal_activities"] = profile["activities"]
    factor["event_activity_density_input"] = (
        f"{profile['label']} creates timely local experiences when matched with "
        "events, food, culture, and outdoor access."
    )
    factor["affordability_value_input"] = profile["value"]

    return factor


def build_place_recommendations(
    country_slug: str,
    places: list[dict[str, Any]],
    factors_by_country_place: dict[tuple[str, str | None], list[dict[str, Any]]],
    year: int,
    month: int,
    limit: int,
) -> list[dict[str, Any]]:
    country_factor = find_factor_for_month(
        factors_by_country_place,
        country_slug,
        None,
        year,
        month,
    )
    scored_places = []

    for place in places:
        place_factor = find_factor_for_month(
            factors_by_country_place,
            country_slug,
            place["slug"],
            year,
            month,
        )
        scoring_factor = place_factor or country_factor
        place_score = score_place_destination(place, scoring_factor)

        if place_score.get("status") != "complete":
            continue

        scored_places.append(
            {
                "place_slug": place["slug"],
                "place_name": place.get("name"),
                "score": place_score["score"],
                "recommendation_reason": place_score["reason"],
                "score_breakdown": place_score["breakdown"],
                "seasonal_note": (
                    scoring_factor.get("weather_suitability_input")
                    if scoring_factor
                    else None
                ),
                "experiences": place.get("activities", []),
                "local_vibe_notes": place.get("local_vibe_notes", []),
                "budget_value": (
                    scoring_factor.get("affordability_value_input")
                    if scoring_factor
                    else None
                ),
                "media": (place.get("media") or [None])[0],
                "place": place,
            }
        )

    scored_places.sort(key=lambda place: place["score"], reverse=True)

    return [
        {
            **place,
            "rank": index + 1,
        }
        for index, place in enumerate(scored_places[:limit])
    ]


def get_country_recommendations(
    country_slug: str,
    *,
    year: int | None = None,
    month: int | None = None,
    limit: int = 4,
) -> dict[str, Any] | None:
    resolved_year, resolved_month = resolve_year_month(year, month)
    countries, places_by_country, factors_by_country_place = load_destination_records()
    normalized_slug = normalize_slug(country_slug)
    country = countries.get(normalized_slug)

    if country is None:
        return None

    places = places_by_country.get(normalized_slug, [])
    recommendations = build_place_recommendations(
        normalized_slug,
        places,
        factors_by_country_place,
        resolved_year,
        resolved_month,
        limit,
    )
    country_factor = find_factor_for_month(
        factors_by_country_place,
        normalized_slug,
        None,
        resolved_year,
        resolved_month,
    )

    return {
        "year": resolved_year,
        "month": resolved_month,
        "country": country,
        "recommendations": recommendations,
        "monthly_factor": country_factor,
    }


def get_featured_recommendations(
    *,
    year: int | None = None,
    month: int | None = None,
    limit: int = 3,
) -> dict[str, Any]:
    resolved_year, resolved_month = resolve_year_month(year, month)
    countries, places_by_country, factors_by_country_place = load_destination_records()
    scored_countries = []

    for country_slug, country in countries.items():
        places = places_by_country.get(country_slug, [])
        country_factor = find_factor_for_month(
            factors_by_country_place,
            country_slug,
            None,
            resolved_year,
            resolved_month,
        )
        country_score = score_country_destination(country, country_factor, places)

        if country_score.get("status") != "complete":
            continue

        final_score = seasonal_country_score(
            country_slug,
            country_score["score"],
            resolved_month,
        )
        recommended_places = build_place_recommendations(
            country_slug,
            places,
            factors_by_country_place,
            resolved_year,
            resolved_month,
            4,
        )
        monthly_reason = (
            f"{country_score['reason']} {MONTH_PROFILES[resolved_month]['label']} "
            "is part of this month's CoVoyage ranking signal."
        )
        scored_countries.append(
            {
                "country_slug": country_slug,
                "slug": country_slug,
                "country_name": country.get("name"),
                "country": country,
                "final_score": final_score,
                "score": final_score,
                "recommendation_reason": monthly_reason,
                "why_now": monthly_reason,
                "score_breakdown": country_score["breakdown"],
                "selected_places": recommended_places,
                "recommended_places": recommended_places,
            }
        )

    scored_countries.sort(key=lambda country: country["final_score"], reverse=True)

    return {
        "year": resolved_year,
        "month": resolved_month,
        "destinations": [
            {
                **country,
                "rank": index + 1,
            }
            for index, country in enumerate(scored_countries[:limit])
        ],
    }


def search_supported_destinations(query: str) -> dict[str, Any]:
    normalized_query = query.strip().lower()
    countries, places_by_country, _factors = load_destination_records()

    matched_countries = [
        country
        for slug, country in countries.items()
        if normalized_query in slug.lower()
        or normalized_query in str(country.get("name", "")).lower()
    ]
    matched_places = []

    for country_slug, places in places_by_country.items():
        for place in places:
            if normalized_query in str(place.get("name", "")).lower():
                matched_places.append(place)

    matched_countries.sort(key=lambda country: country.get("name", ""))
    matched_places.sort(
        key=lambda place: (place.get("country_slug", ""), place.get("name", ""))
    )

    return {
        "query": query,
        "countries": matched_countries,
        "places": matched_places,
    }
