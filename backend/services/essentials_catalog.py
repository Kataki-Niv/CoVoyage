import json
from pathlib import Path
from typing import Optional


CATALOG_PATH = Path(__file__).resolve().parents[2] / "data" / "essentials-products.json"


def load_essentials_products() -> list[dict]:
    with CATALOG_PATH.open("r", encoding="utf-8") as catalog_file:
        products = json.load(catalog_file)

    if not isinstance(products, list):
        raise ValueError("Essentials catalog must be a list")

    slugs = set()

    for product in products:
        slug = product.get("slug")

        if not slug or slug in slugs:
            raise ValueError("Essentials catalog contains invalid or duplicate slugs")

        slugs.add(slug)

    return products


def get_essentials_product(slug: str) -> Optional[dict]:
    return next(
        (product for product in load_essentials_products() if product["slug"] == slug),
        None,
    )


def filter_essentials_products(
    category: Optional[str] = None,
    destination: Optional[str] = None,
) -> list[dict]:
    normalized_category = category.strip().lower() if category else None
    normalized_destination = destination.strip().lower() if destination else None

    products = [
        product
        for product in load_essentials_products()
        if product.get("status") == "available"
        and (
            normalized_category is None
            or normalized_category in normalized_product_categories(product)
        )
        and (
            normalized_destination is None
            or normalized_destination
            in [value.lower() for value in product.get("destinations", [])]
        )
    ]

    if normalized_destination is None:
        return products

    return sorted(
        products,
        key=lambda product: destination_sort_key(product, normalized_destination),
    )


def destination_sort_key(product: dict, normalized_destination: str) -> tuple[int, str]:
    priorities = product.get("destination_priority")

    if isinstance(priorities, dict):
        for destination, priority in priorities.items():
            if str(destination).strip().lower() == normalized_destination:
                try:
                    return (int(priority), product["name"])
                except (TypeError, ValueError):
                    return (999, product["name"])

    return (999, product["name"])


def normalized_product_categories(product: dict) -> list[str]:
    categories = product.get("categories")

    if isinstance(categories, list) and categories:
        return [str(category).strip().lower() for category in categories]

    category = product.get("category")
    return [str(category).strip().lower()] if category else []


def essentials_product_slugs() -> set[str]:
    return {product["slug"] for product in load_essentials_products()}


def serialize_essentials_product(product: dict) -> dict:
    return {
        "slug": product["slug"],
        "name": product["name"],
        "category": product["category"],
        "categories": product.get("categories", [product["category"]]),
        "description": product["description"],
        "price": product["price"],
        "price_cents": product["price_cents"],
        "currency": product["currency"],
        "image": product["image"],
        "imageAlt": product["imageAlt"],
        "whyUseful": product["whyUseful"],
        "details": product["details"],
        "general": product.get("general", False),
        "destinations": product["destinations"],
        "destination_priority": product.get("destination_priority", {}),
        "contexts": product["contexts"],
        "status": product["status"],
    }
