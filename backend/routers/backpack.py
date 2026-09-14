from datetime import datetime

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, Depends, HTTPException, Response, status
from pymongo.errors import DuplicateKeyError

from dependencies import get_backpack_items_or_503, get_current_user
from models import BackpackItem, BackpackItemCreate, BackpackItemUpdate
from services.essentials_catalog import get_essentials_product, serialize_essentials_product


router = APIRouter(prefix="/backpack", tags=["backpack"])


def parse_backpack_item_id(item_id: str) -> ObjectId:
    try:
        return ObjectId(item_id)
    except InvalidId as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid backpack item id",
        ) from error


def serialize_backpack_item(item) -> BackpackItem:
    product = get_essentials_product(item["product_slug"])
    unit_price_cents = product["price_cents"] if product else 0

    return BackpackItem(
        id=str(item["_id"]),
        user_id=item["user_id"],
        product_slug=item["product_slug"],
        quantity=item["quantity"],
        unit_price_cents=unit_price_cents,
        line_total_cents=unit_price_cents * item["quantity"],
        currency=product["currency"] if product else "USD",
        product=serialize_essentials_product(product) if product else None,
        created_at=item["created_at"],
        updated_at=item["updated_at"],
    )


def get_user_item_or_404(backpack_items, item_id: str, user_id: str):
    item = backpack_items.find_one(
        {
            "_id": parse_backpack_item_id(item_id),
            "user_id": user_id,
        }
    )

    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Backpack item not found",
        )

    return item


def ensure_supported_product_slug(product_slug: str):
    product = get_essentials_product(product_slug)

    if product is None or product.get("status") != "available":
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Essential product is not supported",
        )


@router.get("", response_model=list[BackpackItem])
def get_my_backpack(current_user=Depends(get_current_user)):
    backpack_items = get_backpack_items_or_503()
    user_id = str(current_user["_id"])

    return [
        serialize_backpack_item(item)
        for item in backpack_items.find({"user_id": user_id}).sort("updated_at", -1)
    ]


@router.post("", response_model=BackpackItem, status_code=status.HTTP_201_CREATED)
def add_backpack_item(
    item_data: BackpackItemCreate,
    current_user=Depends(get_current_user),
):
    ensure_supported_product_slug(item_data.product_slug)
    backpack_items = get_backpack_items_or_503()
    user_id = str(current_user["_id"])
    now = datetime.utcnow()
    user_product_key = f"{user_id}:{item_data.product_slug}"

    try:
        result = backpack_items.insert_one(
            {
                "user_id": user_id,
                "product_slug": item_data.product_slug,
                "quantity": item_data.quantity,
                "user_product_key": user_product_key,
                "created_at": now,
                "updated_at": now,
            }
        )
        item = backpack_items.find_one({"_id": result.inserted_id})
    except DuplicateKeyError:
        existing_item = backpack_items.find_one({"user_product_key": user_product_key})
        next_quantity = min(
            99,
            (existing_item.get("quantity", 0) if existing_item else 0)
            + item_data.quantity,
        )
        backpack_items.update_one(
            {"user_product_key": user_product_key},
            {
                "$set": {
                    "quantity": next_quantity,
                    "updated_at": now,
                }
            },
        )
        item = backpack_items.find_one({"user_product_key": user_product_key})

    return serialize_backpack_item(item)


@router.patch("/{item_id}", response_model=BackpackItem)
def update_backpack_item(
    item_id: str,
    item_data: BackpackItemUpdate,
    current_user=Depends(get_current_user),
):
    backpack_items = get_backpack_items_or_503()
    user_id = str(current_user["_id"])
    existing_item = get_user_item_or_404(backpack_items, item_id, user_id)

    backpack_items.update_one(
        {"_id": existing_item["_id"]},
        {
            "$set": {
                "quantity": item_data.quantity,
                "updated_at": datetime.utcnow(),
            }
        },
    )
    updated_item = backpack_items.find_one({"_id": existing_item["_id"]})

    return serialize_backpack_item(updated_item)


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_backpack_item(
    item_id: str,
    current_user=Depends(get_current_user),
):
    backpack_items = get_backpack_items_or_503()
    user_id = str(current_user["_id"])
    get_user_item_or_404(backpack_items, item_id, user_id)
    backpack_items.delete_one(
        {"_id": parse_backpack_item_id(item_id), "user_id": user_id}
    )
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
def clear_backpack(current_user=Depends(get_current_user)):
    backpack_items = get_backpack_items_or_503()
    backpack_items.delete_many({"user_id": str(current_user["_id"])})
    return Response(status_code=status.HTTP_204_NO_CONTENT)
