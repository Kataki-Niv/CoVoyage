import re
from datetime import date, datetime

from bson import ObjectId
from fastapi import APIRouter, HTTPException, Query, status

from database import (
    get_countries_collection,
    get_destination_monthly_factors_collection,
    get_monthly_snapshots_collection,
    get_places_collection,
)
from models import MonthlySnapshotGenerateRequest
from services.destination_snapshot_service import (
    SnapshotGenerationError,
    publish_monthly_snapshot,
)
from services.destination_recommendations import (
    get_country_recommendations,
    get_featured_recommendations,
    load_destination_records,
    search_supported_destinations,
)


router = APIRouter(prefix="/destinations", tags=["destinations"])


def get_destination_collections_or_503():
    try:
        return {
            "countries": get_countries_collection(),
            "places": get_places_collection(),
            "monthly_factors": get_destination_monthly_factors_collection(),
        }
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection is unavailable",
        ) from error


def serialize_mongo_value(value):
    if isinstance(value, ObjectId):
        return str(value)

    if isinstance(value, (date, datetime)):
        return value.isoformat()

    if isinstance(value, list):
        return [serialize_mongo_value(item) for item in value]

    if isinstance(value, dict):
        return {
            key: serialize_mongo_value(nested_value)
            for key, nested_value in value.items()
        }

    return value


def serialize_document(document):
    serialized_document = serialize_mongo_value(document)

    if "_id" in serialized_document:
        serialized_document["id"] = serialized_document.pop("_id")

    return serialized_document


def serialize_place_summary(place):
    return {
        "name": place.get("name"),
        "slug": place.get("slug"),
        "region": place.get("region"),
        "description": place.get("description"),
        "highlights": place.get("highlights", []),
        "activities": place.get("activities", []),
        "tags": place.get("tags", []),
        "access_notes": serialize_mongo_value(place.get("access_notes", [])),
    }


def get_country_or_404(countries, country_slug: str):
    country = countries.find_one({"slug": country_slug})

    if country is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Destination country not found",
        )

    return country


def get_static_destination_bundle(country_slug: str):
    countries, places_by_country, factors_by_country_place = load_destination_records()
    country = countries.get(country_slug)

    if country is None:
        return None

    monthly_factors = []
    for (factor_country_slug, _place_slug), factors in factors_by_country_place.items():
        if factor_country_slug == country_slug:
            monthly_factors.extend(factors)

    monthly_factors.sort(
        key=lambda factor: (
            factor.get("year", 0),
            factor.get("month", 0),
            factor.get("place_slug") or "",
        )
    )

    return {
        "country": country,
        "places": sorted(
            places_by_country.get(country_slug, []),
            key=lambda place: place.get("name", ""),
        ),
        "monthly_factors": monthly_factors,
    }


@router.get("/search")
def search_destinations(q: str = Query(..., min_length=1, max_length=80)):
    try:
        return serialize_mongo_value(search_supported_destinations(q))
    except Exception:
        collections = get_destination_collections_or_503()
        search_pattern = re.compile(re.escape(q.strip()), re.IGNORECASE)

        countries = [
            serialize_document(country)
            for country in collections["countries"]
            .find(
                {
                    "$or": [
                        {"name": search_pattern},
                        {"slug": search_pattern},
                        {"region": search_pattern},
                    ]
                }
            )
            .sort("name", 1)
        ]
        places = [
            serialize_document(place)
            for place in collections["places"]
            .find(
                {
                    "$or": [
                        {"name": search_pattern},
                        {"region": search_pattern},
                    ]
                }
            )
            .sort([("country_slug", 1), ("name", 1)])
        ]

        return {
            "query": q,
            "countries": countries,
            "places": places,
        }


@router.get("/featured")
def get_featured_destinations(
    year: int | None = Query(default=None, ge=2000, le=2100),
    month: int | None = Query(default=None, ge=1, le=12),
    limit: int = Query(default=3, ge=1, le=10),
):
    if (year is None) != (month is None):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="year and month must be provided together",
        )

    try:
        return serialize_mongo_value(
            get_featured_recommendations(year=year, month=month, limit=limit)
        )
    except Exception:
        if year is None and month is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Featured destination recommendations are unavailable",
            )

    try:
        monthly_snapshots = get_monthly_snapshots_collection()
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection is unavailable",
        ) from error

    query = {"status": "active"}

    if year is not None and month is not None:
        query.update({"year": year, "month": month})
        snapshot = monthly_snapshots.find_one(query)
    else:
        snapshot = monthly_snapshots.find_one(
            query,
            sort=[("generated_at", -1)],
        )

    if snapshot is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Featured destination snapshot not found",
        )

    return {
        "year": snapshot["year"],
        "month": snapshot["month"],
        "destinations": serialize_mongo_value(
            snapshot.get("featured_countries", [])[:limit],
        ),
    }


@router.get("/{country_slug}/recommendations")
def get_destination_recommendations(
    country_slug: str,
    year: int | None = Query(default=None, ge=2000, le=2100),
    month: int | None = Query(default=None, ge=1, le=12),
    limit: int = Query(default=4, ge=1, le=8),
):
    if (year is None) != (month is None):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="year and month must be provided together",
        )

    recommendations = get_country_recommendations(
        country_slug,
        year=year,
        month=month,
        limit=limit,
    )

    if recommendations is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Destination country not found",
        )

    return serialize_mongo_value(recommendations)


@router.post("/snapshots/generate")
def generate_destination_snapshot(payload: MonthlySnapshotGenerateRequest):
    try:
        result = publish_monthly_snapshot(payload.year, payload.month)
    except SnapshotGenerationError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        ) from error
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Destination snapshot generation is unavailable",
        ) from error

    snapshot = result["snapshot"]

    return {
        "message": "Monthly destination snapshot generated",
        "year": snapshot["year"],
        "month": snapshot["month"],
        "algorithm_version": snapshot["algorithm_version"],
        "status": snapshot["status"],
        "archived_count": result["archived_count"],
        "upserted": result["upserted"],
        "modified_count": result["modified_count"],
        "destinations": serialize_mongo_value(
            snapshot.get("featured_countries", []),
        ),
    }


@router.get("/{country_slug}/places")
def get_destination_places(country_slug: str):
    try:
        collections = get_destination_collections_or_503()
        get_country_or_404(collections["countries"], country_slug)

        return [
            serialize_place_summary(place)
            for place in collections["places"]
            .find({"country_slug": country_slug})
            .sort("name", 1)
        ]
    except HTTPException as error:
        if error.status_code not in (
            status.HTTP_404_NOT_FOUND,
            status.HTTP_503_SERVICE_UNAVAILABLE,
        ):
            raise

    static_bundle = get_static_destination_bundle(country_slug)

    if static_bundle is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Destination country not found",
        )

    return [
        serialize_place_summary(place)
        for place in static_bundle["places"]
    ]


@router.get("/{country_slug}")
def get_destination(country_slug: str):
    try:
        collections = get_destination_collections_or_503()
        country = get_country_or_404(collections["countries"], country_slug)
        places = list(
            collections["places"]
            .find({"country_slug": country_slug})
            .sort("name", 1)
        )
        monthly_factors = list(
            collections["monthly_factors"]
            .find({"country_slug": country_slug})
            .sort([("year", 1), ("month", 1), ("place_slug", 1)])
        )

        return {
            "country": serialize_document(country),
            "places": [serialize_document(place) for place in places],
            "monthly_factors": [
                serialize_document(monthly_factor)
                for monthly_factor in monthly_factors
            ],
        }
    except HTTPException as error:
        if error.status_code not in (
            status.HTTP_404_NOT_FOUND,
            status.HTTP_503_SERVICE_UNAVAILABLE,
        ):
            raise

    static_bundle = get_static_destination_bundle(country_slug)

    if static_bundle is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Destination country not found",
        )

    return {
        "country": serialize_document(static_bundle["country"]),
        "places": [serialize_document(place) for place in static_bundle["places"]],
        "monthly_factors": [
            serialize_document(monthly_factor)
            for monthly_factor in static_bundle["monthly_factors"]
        ],
    }
