from typing import Optional

from fastapi import APIRouter, HTTPException, Query, status

from services.essentials_catalog import (
    filter_essentials_products,
    get_essentials_product,
    serialize_essentials_product,
)


router = APIRouter(prefix="/essentials", tags=["essentials"])


@router.get("/products")
def get_essentials_products(
    category: Optional[str] = Query(default=None),
    destination: Optional[str] = Query(default=None),
):
    return [
        serialize_essentials_product(product)
        for product in filter_essentials_products(
            category=category,
            destination=destination,
        )
    ]


@router.get("/products/{product_slug}")
def get_essentials_product_detail(product_slug: str):
    product = get_essentials_product(product_slug)

    if product is None or product.get("status") != "available":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Essential product not found",
        )

    return serialize_essentials_product(product)
