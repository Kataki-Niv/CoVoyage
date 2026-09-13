from datetime import datetime
from typing import Any

from database import (
    get_countries_collection,
    get_destination_monthly_factors_collection,
    get_monthly_snapshots_collection,
    get_places_collection,
)
from models import MonthlySnapshot
from services.destination_scoring import (
    score_country_destination,
    score_place_destination,
)
from services.destination_recommendations import get_featured_recommendations


ALGORITHM_VERSION = "mvp-rule-based-v1"


class SnapshotGenerationError(ValueError):
    pass


def find_country_monthly_factor(
    monthly_factors,
    country_slug: str,
    year: int,
    month: int,
):
    return monthly_factors.find_one(
        {
            "year": year,
            "month": month,
            "country_slug": country_slug,
            "$or": [
                {"place_slug": None},
                {"place_slug": {"$exists": False}},
            ],
        }
    )


def find_place_monthly_factor(
    monthly_factors,
    country_slug: str,
    place_slug: str,
    year: int,
    month: int,
):
    return monthly_factors.find_one(
        {
            "year": year,
            "month": month,
            "country_slug": country_slug,
            "place_slug": place_slug,
        }
    )


def build_selected_places(
    places: list[dict[str, Any]],
    monthly_factors,
    country_monthly_factor: dict[str, Any],
    year: int,
    month: int,
) -> list[dict[str, Any]]:
    scored_places = []

    for place in places:
        place_monthly_factor = find_place_monthly_factor(
            monthly_factors,
            place["country_slug"],
            place["slug"],
            year,
            month,
        )
        scoring_monthly_factor = place_monthly_factor or country_monthly_factor
        place_score = score_place_destination(place, scoring_monthly_factor)

        if place_score.get("status") != "complete":
            continue

        scored_places.append(
            {
                "place_slug": place["slug"],
                "place_name": place.get("name"),
                "score": place_score["score"],
                "recommendation_reason": place_score["reason"],
                "score_breakdown": place_score["breakdown"],
            }
        )

    scored_places.sort(key=lambda place: place["score"], reverse=True)

    return [
        {
            **place,
            "rank": index + 1,
        }
        for index, place in enumerate(scored_places)
    ]


def build_monthly_snapshot(year: int, month: int) -> dict[str, Any]:
    recommendations = get_featured_recommendations(year=year, month=month, limit=50)
    featured_countries = recommendations["destinations"]

    if not featured_countries:
        raise SnapshotGenerationError(
            f"No destination monthly factors were found for {year}-{month:02d}."
        )

    snapshot = MonthlySnapshot(
        year=year,
        month=month,
        algorithm_version=ALGORITHM_VERSION,
        generated_at=datetime.utcnow(),
        status="active",
        featured_countries=featured_countries,
    )

    return snapshot.model_dump(mode="json", exclude_none=True)


def publish_monthly_snapshot(year: int, month: int) -> dict[str, Any]:
    snapshot_document = build_monthly_snapshot(year, month)
    monthly_snapshots = get_monthly_snapshots_collection()
    now = datetime.utcnow()
    update_document = {
        **snapshot_document,
        "updated_at": now,
    }
    created_at = update_document.pop("created_at", now)

    archive_result = monthly_snapshots.update_many(
        {"status": "active"},
        {
            "$set": {
                "status": "archived",
                "updated_at": now,
            }
        },
    )
    result = monthly_snapshots.update_one(
        {"year": year, "month": month},
        {
            "$set": update_document,
            "$setOnInsert": {
                "created_at": created_at,
            },
        },
        upsert=True,
    )

    return {
        "snapshot": snapshot_document,
        "upserted": result.upserted_id is not None,
        "modified_count": result.modified_count,
        "archived_count": archive_result.modified_count,
    }
