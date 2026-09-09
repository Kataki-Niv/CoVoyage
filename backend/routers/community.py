import os
from datetime import date, datetime
from typing import Literal

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, Depends, Header, HTTPException, status
from pymongo import ReturnDocument
from pydantic import BaseModel

from database import (
    get_community_replies_collection,
    get_community_tips_collection,
)
from dependencies import get_current_user
from models import (
    COMMUNITY_TIP_CATEGORY_VALUES,
    DEFAULT_COMMUNITY_TIP_CATEGORY,
    CommunityReplyCreate,
    CommunityTipCreate,
)


router = APIRouter(prefix="/community", tags=["community"])
MODERATION_TOKEN = os.getenv("COMMUNITY_MODERATION_TOKEN", "").strip()


class CommunityTipModerationUpdate(BaseModel):
    moderation_status: Literal["pending", "approved", "rejected"]


def get_community_collections_or_503():
    try:
        return {
            "tips": get_community_tips_collection(),
            "replies": get_community_replies_collection(),
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


def safe_author_from_user(user):
    if not user:
        return None

    display_name = (
        user.get("name")
        or user.get("username")
        or user.get("email", "").split("@")[0]
        or "CoVoyage Traveler"
    )

    return {
        "name": display_name,
        "role": "Community traveler",
    }


def apply_user_attribution(document, current_user):
    user_author = safe_author_from_user(current_user)

    if not user_author:
        return document

    document["author_id"] = str(current_user["_id"])
    document["author"] = user_author
    return document


def user_has_community_moderation_privileges(current_user):
    if current_user.get("is_admin") or current_user.get("is_moderator"):
        return True

    roles = current_user.get("roles") or []

    if isinstance(roles, str):
        roles = [roles]

    role_values = [
        current_user.get("role"),
        current_user.get("account_role"),
        *roles,
    ]

    return any(
        str(role).strip().lower() in {"admin", "moderator"}
        for role in role_values
        if role
    )


def ensure_can_delete_community_document(document, current_user):
    current_user_id = str(current_user["_id"])

    if (
        document.get("author_id") == current_user_id
        or user_has_community_moderation_privileges(current_user)
    ):
        return

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="You can only delete your own community content",
    )


def normalize_tip_document(document):
    serialized_document = serialize_document(document)
    category = serialized_document.get("category")

    if category not in COMMUNITY_TIP_CATEGORY_VALUES:
        serialized_document["category"] = DEFAULT_COMMUNITY_TIP_CATEGORY

    serialized_document["moderation_status"] = serialized_document.get(
        "moderation_status",
        "approved",
    )
    serialized_document["helpful_count"] = serialized_document.get("helpful_count", 0)

    return serialized_document


def require_moderation_token(token):
    if not MODERATION_TOKEN:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Community moderation token is not configured",
        )

    if token != MODERATION_TOKEN:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid moderation token",
        )


def parse_object_id(value: str, field_name: str = "id"):
    try:
        return ObjectId(value)
    except InvalidId as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid {field_name}",
        ) from error


@router.get("/tips/{tip_id}/replies")
def get_community_replies(tip_id: str):
    collections = get_community_collections_or_503()
    tip_object_id = parse_object_id(tip_id, "tip id")

    if collections["tips"].find_one({"_id": tip_object_id}) is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Community tip not found",
        )

    replies = list(
        collections["replies"]
        .find({"tip_id": tip_id})
        .sort("created_at", 1)
    )

    return [serialize_document(reply) for reply in replies]


@router.post("/tips/{tip_id}/reply", status_code=status.HTTP_201_CREATED)
def create_community_reply(
    tip_id: str,
    reply: CommunityReplyCreate,
    current_user=Depends(get_current_user),
):
    collections = get_community_collections_or_503()
    tip_object_id = parse_object_id(tip_id, "tip id")

    if collections["tips"].find_one({"_id": tip_object_id}) is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Community tip not found",
        )

    now = datetime.utcnow()
    reply_document = reply.model_dump(mode="json")
    reply_document = apply_user_attribution(reply_document, current_user)
    reply_document.update(
        {
            "tip_id": tip_id,
            "created_at": now,
            "updated_at": now,
        }
    )

    result = collections["replies"].insert_one(reply_document)
    created_reply = collections["replies"].find_one({"_id": result.inserted_id})
    return serialize_document(created_reply)


@router.delete("/tips/{tip_id}/replies/{reply_id}")
def delete_community_reply(
    tip_id: str,
    reply_id: str,
    current_user=Depends(get_current_user),
):
    collections = get_community_collections_or_503()
    parse_object_id(tip_id, "tip id")
    reply_object_id = parse_object_id(reply_id, "reply id")
    reply = collections["replies"].find_one(
        {
            "_id": reply_object_id,
            "tip_id": tip_id,
        }
    )

    if reply is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Community reply not found",
        )

    ensure_can_delete_community_document(reply, current_user)
    collections["replies"].delete_one({"_id": reply_object_id})

    return {
        "deleted": True,
        "id": reply_id,
        "tip_id": tip_id,
    }


@router.get("/moderation/tips/pending")
def get_pending_community_tips(
    x_covoyage_moderation_token: str | None = Header(default=None),
):
    require_moderation_token(x_covoyage_moderation_token)
    collections = get_community_collections_or_503()
    tips = list(
        collections["tips"]
        .find({"moderation_status": "pending"})
        .sort("created_at", -1)
    )

    return [normalize_tip_document(tip) for tip in tips]


@router.patch("/moderation/tips/{tip_id}")
def update_community_tip_moderation(
    tip_id: str,
    update: CommunityTipModerationUpdate,
    x_covoyage_moderation_token: str | None = Header(default=None),
):
    require_moderation_token(x_covoyage_moderation_token)
    collections = get_community_collections_or_503()
    tip_object_id = parse_object_id(tip_id, "tip id")

    updated_tip = collections["tips"].find_one_and_update(
        {"_id": tip_object_id},
        {
            "$set": {
                "moderation_status": update.moderation_status,
                "updated_at": datetime.utcnow(),
            }
        },
        return_document=ReturnDocument.AFTER,
    )

    if updated_tip is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Community tip not found",
        )

    return normalize_tip_document(updated_tip)


@router.get("/tips/{place_slug}")
def get_community_tips(place_slug: str):
    collections = get_community_collections_or_503()
    tips = list(
        collections["tips"]
        .find(
            {
                "place_slug": place_slug,
                "moderation_status": "approved",
            }
        )
        .sort("created_at", -1)
    )
    tip_ids = [str(tip["_id"]) for tip in tips]

    reply_counts = {
        item["_id"]: item["count"]
        for item in collections["replies"].aggregate(
            [
                {"$match": {"tip_id": {"$in": tip_ids}}},
                {"$group": {"_id": "$tip_id", "count": {"$sum": 1}}},
            ]
        )
    }

    return [
        {
            **normalize_tip_document(tip),
            "reply_count": reply_counts.get(str(tip["_id"]), 0),
        }
        for tip in tips
    ]


@router.post("/tips", status_code=status.HTTP_201_CREATED)
def create_community_tip(
    tip: CommunityTipCreate,
    current_user=Depends(get_current_user),
):
    collections = get_community_collections_or_503()
    now = datetime.utcnow()
    tip_document = tip.model_dump(mode="json")
    tip_document = apply_user_attribution(tip_document, current_user)
    tip_document.update(
        {
            "created_at": now,
            "updated_at": now,
            "moderation_status": "pending",
            "helpful_count": 0,
        }
    )

    result = collections["tips"].insert_one(tip_document)
    created_tip = collections["tips"].find_one({"_id": result.inserted_id})

    return {
        **normalize_tip_document(created_tip),
        "reply_count": 0,
    }


@router.delete("/tips/{tip_id}")
def delete_community_tip(
    tip_id: str,
    current_user=Depends(get_current_user),
):
    collections = get_community_collections_or_503()
    tip_object_id = parse_object_id(tip_id, "tip id")
    tip = collections["tips"].find_one({"_id": tip_object_id})

    if tip is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Community tip not found",
        )

    ensure_can_delete_community_document(tip, current_user)
    collections["tips"].delete_one({"_id": tip_object_id})
    deleted_replies = collections["replies"].delete_many({"tip_id": tip_id})

    return {
        "deleted": True,
        "id": tip_id,
        "deleted_reply_count": deleted_replies.deleted_count,
    }
