from datetime import date, datetime

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, HTTPException, status

from database import (
    get_community_replies_collection,
    get_community_tips_collection,
)
from models import CommunityReplyCreate, CommunityTipCreate


router = APIRouter(prefix="/community", tags=["community"])


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
def create_community_reply(tip_id: str, reply: CommunityReplyCreate):
    collections = get_community_collections_or_503()
    tip_object_id = parse_object_id(tip_id, "tip id")

    if collections["tips"].find_one({"_id": tip_object_id}) is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Community tip not found",
        )

    now = datetime.utcnow()
    reply_document = reply.model_dump(mode="json")
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
            **serialize_document(tip),
            "reply_count": reply_counts.get(str(tip["_id"]), 0),
        }
        for tip in tips
    ]


@router.post("/tips", status_code=status.HTTP_201_CREATED)
def create_community_tip(tip: CommunityTipCreate):
    collections = get_community_collections_or_503()
    now = datetime.utcnow()
    tip_document = tip.model_dump(mode="json")
    tip_document.update(
        {
            "created_at": now,
            "updated_at": now,
            "moderation_status": "approved",
            "helpful_count": 0,
        }
    )

    result = collections["tips"].insert_one(tip_document)
    created_tip = collections["tips"].find_one({"_id": result.inserted_id})

    return {
        **serialize_document(created_tip),
        "reply_count": 0,
    }
