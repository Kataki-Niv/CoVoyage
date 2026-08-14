from datetime import date, datetime

from bson import ObjectId
from fastapi import APIRouter, HTTPException, status

from database import get_destination_events_collection
from models import DestinationEventCreate


router = APIRouter(prefix="/events", tags=["events"])


def get_events_or_503():
    try:
        return get_destination_events_collection()
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


@router.get("/{country_slug}")
def get_destination_events(country_slug: str):
    events = get_events_or_503()

    return [
        serialize_document(event)
        for event in events.find(
            {
                "country_slug": country_slug,
                "verification_status": "verified",
            }
        ).sort("date_start", 1)
    ]


@router.post("", status_code=status.HTTP_201_CREATED)
def create_destination_event(event: DestinationEventCreate):
    events = get_events_or_503()
    now = datetime.utcnow()
    event_document = event.model_dump(mode="json")
    event_document.update(
        {
            "created_at": now,
            "updated_at": now,
        }
    )

    result = events.insert_one(event_document)
    created_event = events.find_one({"_id": result.inserted_id})
    return serialize_document(created_event)
