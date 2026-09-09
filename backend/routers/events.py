from datetime import date, datetime

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.errors import DuplicateKeyError

from database import (
    get_destination_events_collection,
    get_event_participants_collection,
    get_saved_events_collection,
)
from dependencies import get_current_user, get_optional_current_user
from models import DestinationEventCreate


router = APIRouter(prefix="/events", tags=["events"])


def get_events_or_503():
    try:
        return {
            "events": get_destination_events_collection(),
            "participants": get_event_participants_collection(),
            "saved_events": get_saved_events_collection(),
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


def user_display_name(user):
    return (
        user.get("name")
        or user.get("username")
        or user.get("email", "").split("@")[0]
        or "CoVoyage Traveler"
    )


def serialize_event(event, collections, current_user=None):
    serialized_event = serialize_document(event)
    event_id = serialized_event["id"]
    user_id = str(current_user["_id"]) if current_user else None

    serialized_event["participant_count"] = collections["participants"].count_documents(
        {"event_id": event_id}
    )
    serialized_event["viewer_has_joined"] = (
        collections["participants"].find_one(
            {"event_id": event_id, "user_id": user_id}
        )
        is not None
        if user_id
        else False
    )
    serialized_event["viewer_has_saved"] = (
        collections["saved_events"].find_one({"event_id": event_id, "user_id": user_id})
        is not None
        if user_id
        else False
    )

    return serialized_event


def find_event_or_404(collections, event_id: str):
    event_object_id = parse_object_id(event_id, "event id")
    event = collections["events"].find_one({"_id": event_object_id})

    if event is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )

    return event


def insert_unique_user_event(collection, event_id: str, user_id: str):
    now = datetime.utcnow()

    try:
        collection.insert_one(
            {
                "event_id": event_id,
                "user_id": user_id,
                "event_user_key": f"{event_id}:{user_id}",
                "created_at": now,
                "updated_at": now,
            }
        )
    except DuplicateKeyError:
        return


@router.get("/detail/{event_id}")
def get_destination_event_detail(
    event_id: str,
    current_user=Depends(get_optional_current_user),
):
    collections = get_events_or_503()
    event = find_event_or_404(collections, event_id)
    return serialize_event(event, collections, current_user)


@router.get("/{country_slug}")
def get_destination_events(
    country_slug: str,
    current_user=Depends(get_optional_current_user),
):
    collections = get_events_or_503()

    return [
        serialize_event(event, collections, current_user)
        for event in collections["events"].find(
            {
                "country_slug": country_slug,
                "verification_status": "verified",
            }
        ).sort("date_start", 1)
    ]


@router.post("", status_code=status.HTTP_201_CREATED)
def create_destination_event(
    event: DestinationEventCreate,
    current_user=Depends(get_optional_current_user),
):
    collections = get_events_or_503()
    now = datetime.utcnow()
    event_document = event.model_dump(mode="json")

    if current_user:
        event_document["organizer_id"] = str(current_user["_id"])
        event_document["organizer_name"] = user_display_name(current_user)

    event_document.update(
        {
            "created_at": now,
            "updated_at": now,
        }
    )

    result = collections["events"].insert_one(event_document)
    created_event = collections["events"].find_one({"_id": result.inserted_id})
    return serialize_event(created_event, collections, current_user)


@router.post("/{event_id}/participants", status_code=status.HTTP_200_OK)
def join_destination_event(event_id: str, current_user=Depends(get_current_user)):
    collections = get_events_or_503()
    event = find_event_or_404(collections, event_id)
    user_id = str(current_user["_id"])

    insert_unique_user_event(collections["participants"], event_id, user_id)
    return serialize_event(event, collections, current_user)


@router.delete("/{event_id}/participants/me", status_code=status.HTTP_200_OK)
def leave_destination_event(event_id: str, current_user=Depends(get_current_user)):
    collections = get_events_or_503()
    event = find_event_or_404(collections, event_id)
    user_id = str(current_user["_id"])
    collections["participants"].delete_one({"event_id": event_id, "user_id": user_id})
    return serialize_event(event, collections, current_user)


@router.post("/{event_id}/saved", status_code=status.HTTP_200_OK)
def save_destination_event(event_id: str, current_user=Depends(get_current_user)):
    collections = get_events_or_503()
    event = find_event_or_404(collections, event_id)
    user_id = str(current_user["_id"])

    insert_unique_user_event(collections["saved_events"], event_id, user_id)
    return serialize_event(event, collections, current_user)


@router.delete("/{event_id}/saved/me", status_code=status.HTTP_200_OK)
def unsave_destination_event(event_id: str, current_user=Depends(get_current_user)):
    collections = get_events_or_503()
    event = find_event_or_404(collections, event_id)
    user_id = str(current_user["_id"])
    collections["saved_events"].delete_one({"event_id": event_id, "user_id": user_id})
    return serialize_event(event, collections, current_user)
