from importlib import import_module
from pathlib import Path
import re
import sys


BACKEND_DIR = Path(__file__).resolve().parents[1]

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from database import (
    get_countries_collection,
    get_destination_monthly_factors_collection,
    get_places_collection,
)
from models import (
    DestinationCountryCreate,
    DestinationMonthlyFactorsCreate,
    DestinationPlaceCreate,
)


DESTINATION_SLUG_PATTERN = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


def build_country_document(country_data: dict) -> dict:
    return DestinationCountryCreate(**country_data).model_dump(
        mode="json",
        exclude_none=True,
    )


def build_place_document(place_data: dict) -> dict:
    return DestinationPlaceCreate(**place_data).model_dump(
        mode="json",
        exclude_none=True,
    )


def build_monthly_factor_document(monthly_factor_data: dict) -> dict:
    return DestinationMonthlyFactorsCreate(**monthly_factor_data).model_dump(
        mode="json",
        exclude_none=True,
    )


def validate_country_slug(country_slug: str) -> str:
    normalized_slug = country_slug.strip().lower()

    if not DESTINATION_SLUG_PATTERN.fullmatch(normalized_slug):
        raise ValueError(
            "country_slug must contain lowercase letters, numbers, and hyphens"
        )

    return normalized_slug


def load_destination_dataset(country_slug: str) -> dict:
    normalized_slug = validate_country_slug(country_slug)
    module = import_module(f"data.{normalized_slug.replace('-', '_')}")
    getter_name = f"get_{normalized_slug.replace('-', '_')}_seed_dataset"
    validator_name = f"validate_{normalized_slug.replace('-', '_')}_seed_dataset"

    validator = getattr(module, validator_name, None)

    if callable(validator):
        validator()

    getter = getattr(module, getter_name, None)

    if not callable(getter):
        raise ValueError(f"Destination dataset getter not found: {getter_name}")

    return getter()


def validate_destination_dataset(dataset: dict) -> dict:
    country = DestinationCountryCreate(**dataset["country"])
    places = [DestinationPlaceCreate(**place) for place in dataset.get("places", [])]
    monthly_factors = [
        DestinationMonthlyFactorsCreate(**monthly_factor)
        for monthly_factor in dataset.get("monthly_factors", [])
    ]
    country_slugs = {country.slug}
    invalid_places = [
        place.slug for place in places if place.country_slug not in country_slugs
    ]
    invalid_monthly_factors = [
        {
            "year": monthly_factor.year,
            "month": monthly_factor.month,
            "country_slug": monthly_factor.country_slug,
        }
        for monthly_factor in monthly_factors
        if monthly_factor.country_slug not in country_slugs
    ]

    if invalid_places:
        raise ValueError(f"Places reference unknown country_slug: {invalid_places}")

    if invalid_monthly_factors:
        raise ValueError(
            "Monthly factors reference unknown country_slug: "
            f"{invalid_monthly_factors}"
        )

    return {
        "country": country,
        "places": places,
        "monthly_factors": monthly_factors,
    }


def seed_destination_data(country_slug: str) -> dict:
    dataset = load_destination_dataset(country_slug)
    validate_destination_dataset(dataset)

    countries = get_countries_collection()
    places = get_places_collection()
    destination_monthly_factors = get_destination_monthly_factors_collection()

    country_document = build_country_document(dataset["country"])
    country_result = countries.update_one(
        {"slug": country_document["slug"]},
        {"$set": country_document},
        upsert=True,
    )

    place_results = []
    for place_data in dataset.get("places", []):
        place_document = build_place_document(place_data)
        result = places.update_one(
            {
                "country_slug": place_document["country_slug"],
                "slug": place_document["slug"],
            },
            {"$set": place_document},
            upsert=True,
        )
        place_results.append(
            {
                "slug": place_document["slug"],
                "upserted": result.upserted_id is not None,
                "modified_count": result.modified_count,
            }
        )

    monthly_factor_results = []
    for monthly_factor_data in dataset.get("monthly_factors", []):
        monthly_factor_document = build_monthly_factor_document(monthly_factor_data)
        result = destination_monthly_factors.update_one(
            {
                "year": monthly_factor_document["year"],
                "month": monthly_factor_document["month"],
                "country_slug": monthly_factor_document["country_slug"],
                "place_slug": monthly_factor_document.get("place_slug"),
            },
            {"$set": monthly_factor_document},
            upsert=True,
        )
        monthly_factor_results.append(
            {
                "year": monthly_factor_document["year"],
                "month": monthly_factor_document["month"],
                "country_slug": monthly_factor_document["country_slug"],
                "place_slug": monthly_factor_document.get("place_slug"),
                "upserted": result.upserted_id is not None,
                "modified_count": result.modified_count,
            }
        )

    return {
        "country": {
            "slug": country_document["slug"],
            "upserted": country_result.upserted_id is not None,
            "modified_count": country_result.modified_count,
        },
        "places": place_results,
        "monthly_factors": monthly_factor_results,
    }


def print_seed_result(result: dict) -> None:
    print("Destination seed completed")
    print(
        f"Country: {result['country']['slug']} "
        f"(upserted={result['country']['upserted']}, "
        f"modified={result['country']['modified_count']})"
    )
    print(
        "Places: "
        + ", ".join(
            f"{place['slug']} "
            f"(upserted={place['upserted']}, modified={place['modified_count']})"
            for place in result["places"]
        )
    )
    print(
        "Monthly factors: "
        + ", ".join(
            f"{factor['country_slug']} {factor['year']}-{factor['month']:02d} "
            f"(upserted={factor['upserted']}, modified={factor['modified_count']})"
            for factor in result["monthly_factors"]
        )
    )


def main() -> None:
    if len(sys.argv) != 2:
        raise ValueError("Usage: python scripts/seed_destination_data.py <country_slug>")

    result = seed_destination_data(sys.argv[1])
    print_seed_result(result)


if __name__ == "__main__":
    main()
