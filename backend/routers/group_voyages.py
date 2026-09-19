from datetime import date, datetime
from typing import Any

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import ValidationError
from pymongo.errors import DuplicateKeyError

from database import (
    get_group_voyage_join_requests_collection,
    get_group_voyages_collection,
    get_profiles_collection,
)
from dependencies import get_current_user
from models import GroupVoyageCreate, GroupVoyageUpdate
from services.profile_completeness import evaluate_profile_completeness
from services.rule_based_matching import get_travel_date_overlap, normalize_text


router = APIRouter(prefix="/group-voyages", tags=["group-voyages"])


def get_group_collections_or_503():
    try:
        return {
            "group_voyages": get_group_voyages_collection(),
            "join_requests": get_group_voyage_join_requests_collection(),
            "profiles": get_profiles_collection(),
        }
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection is unavailable",
        ) from error


def serialize_mongo_value(value: Any) -> Any:
    if isinstance(value, ObjectId):
        return str(value)

    if isinstance(value, (date, datetime)):
        return value.isoformat()

    if isinstance(value, list):
        return [serialize_mongo_value(item) for item in value]

    if isinstance(value, dict):
        return {key: serialize_mongo_value(item) for key, item in value.items()}

    return value


def serialize_document(document: dict[str, Any]) -> dict[str, Any]:
    serialized_document = serialize_mongo_value(document)

    if "_id" in serialized_document:
        serialized_document["id"] = serialized_document.pop("_id")

    return serialized_document


def parse_object_id(value: str, field_name: str = "id") -> ObjectId:
    if not ObjectId.is_valid(value):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid {field_name}",
        )

    return ObjectId(value)


def build_join_request_key(voyage_id: str, user_id: str) -> str:
    return f"{voyage_id}:{user_id}"


def raise_incomplete_profile_conflict(completeness):
    raise HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail={
            "code": "profile_incomplete",
            "message": (
                "Your profile is incomplete. Complete your travel profile before "
                "creating or joining a Group Voyage."
            ),
            "profile_completeness": completeness.to_dict(),
        },
    )


def get_complete_profile_or_409(profiles, user_id: str) -> dict[str, Any]:
    profile = profiles.find_one({"user_id": user_id})
    completeness = evaluate_profile_completeness(profile)

    if not completeness.complete:
        raise_incomplete_profile_conflict(completeness)

    return profile


def get_group_date_overlap(
    profile: dict[str, Any],
    voyage: dict[str, Any],
) -> tuple[date, date] | None:
    voyage_window = {
        "available_from": voyage.get("start_date"),
        "available_to": voyage.get("end_date") or voyage.get("start_date"),
    }

    return get_travel_date_overlap(profile, voyage_window)


def get_relevant_destinations(
    profile: dict[str, Any],
    voyage: dict[str, Any] | None,
) -> list[str]:
    if voyage is None:
        return []

    destination = voyage.get("destination")

    if not destination:
        return []

    profile_destinations = profile.get("preferred_destinations")

    if not isinstance(profile_destinations, list):
        return []

    normalized_destination = normalize_text(destination)

    return [
        str(destination)
        for profile_destination in profile_destinations
        if normalize_text(profile_destination) == normalized_destination
    ][:1]


def serialize_group_profile(
    profile: dict[str, Any],
    voyage: dict[str, Any] | None = None,
) -> dict[str, Any]:
    serialized_profile = {
        "user_id": profile.get("user_id"),
        "name": profile.get("name"),
        "username": profile.get("username"),
        "bio": profile.get("bio"),
        "profile_picture_url": profile.get("profile_picture_url"),
        "travel_style": profile.get("travel_style"),
    }

    relevant_destinations = get_relevant_destinations(profile, voyage)

    if relevant_destinations:
        serialized_profile["relevant_destinations"] = relevant_destinations

    if voyage is not None:
        date_overlap = get_group_date_overlap(profile, voyage)

        if date_overlap:
            overlap_start, overlap_end = date_overlap
            serialized_profile["relevant_date_overlap"] = {
                "start": overlap_start.isoformat(),
                "end": overlap_end.isoformat(),
            }

    return {
        key: serialize_mongo_value(value)
        for key, value in serialized_profile.items()
        if value is not None and value != ""
    }


def get_profile_summary(
    profiles,
    user_id: str,
    voyage: dict[str, Any] | None = None,
) -> dict[str, Any] | None:
    profile = profiles.find_one({"user_id": user_id})

    if profile is None:
        return None

    return serialize_group_profile(profile, voyage)


def get_voyage_or_404(group_voyages, voyage_id: str) -> dict[str, Any]:
    voyage = group_voyages.find_one(
        {"_id": parse_object_id(voyage_id, "group voyage id")}
    )

    if voyage is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group voyage not found",
        )

    return voyage


def get_viewer_status(voyage: dict[str, Any], join_requests, current_user_id: str) -> str:
    voyage_id = str(voyage["_id"])
    participant_ids = voyage.get("participant_ids", [])

    if voyage.get("creator_id") == current_user_id:
        return "creator"

    if current_user_id in participant_ids:
        return "participant"

    if voyage.get("status") != "open":
        return "closed"

    active_request = join_requests.find_one(
        {"active_request_key": build_join_request_key(voyage_id, current_user_id)}
    )

    if active_request and active_request.get("status") == "pending":
        return "pending_sent"

    if active_request and active_request.get("status") == "accepted":
        return "participant"

    latest_request = join_requests.find_one(
        {
            "voyage_id": voyage_id,
            "requester_id": current_user_id,
        },
        sort=[("updated_at", -1)],
    )

    if latest_request and latest_request.get("status") == "declined":
        return "declined"

    if latest_request and latest_request.get("status") == "cancelled":
        return "cancelled"

    if is_voyage_full(voyage):
        return "full"

    return "none"


def is_voyage_full(voyage: dict[str, Any]) -> bool:
    return len(voyage.get("participant_ids", [])) >= voyage.get("max_participants", 0)


def require_voyage_creator(voyage: dict[str, Any], current_user_id: str) -> None:
    if voyage.get("creator_id") != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the group voyage creator can manage this voyage",
        )


def validate_edit_payload(
    voyage: dict[str, Any],
    update_payload: GroupVoyageUpdate,
) -> dict[str, Any]:
    update_data = update_payload.model_dump(mode="json", exclude_unset=True)

    if not update_data:
        return {}

    for required_field in (
        "title",
        "destination",
        "start_date",
        "description",
        "max_participants",
        "visibility",
    ):
        if required_field in update_data and update_data[required_field] is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"{required_field} is required",
            )

    if update_data.get("tags") is None and "tags" in update_data:
        update_data["tags"] = []

    participant_count = len(voyage.get("participant_ids", []))
    next_max_participants = update_data.get(
        "max_participants",
        voyage.get("max_participants", 0),
    )

    if next_max_participants < participant_count:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Maximum travellers cannot be lower than current participants",
        )

    validation_data = {
        "title": voyage.get("title"),
        "destination": voyage.get("destination"),
        "start_date": voyage.get("start_date"),
        "end_date": voyage.get("end_date"),
        "description": voyage.get("description"),
        "tags": voyage.get("tags", []),
        "budget_range": voyage.get("budget_range"),
        "max_participants": voyage.get("max_participants"),
        "status": voyage.get("status", "open"),
        "visibility": voyage.get("visibility", "public"),
    }
    validation_data.update(update_data)
    try:
        validated_voyage = GroupVoyageCreate(**validation_data)
    except ValidationError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid group voyage update",
        ) from error
    return validated_voyage.model_dump(
        mode="json",
        exclude={"status"},
    )


def serialize_join_request(
    join_request: dict[str, Any],
    profiles,
    voyage: dict[str, Any] | None = None,
) -> dict[str, Any]:
    return {
        **serialize_document(join_request),
        "requester_profile": get_profile_summary(
            profiles,
            join_request["requester_id"],
            voyage,
        ),
    }


def get_viewer_join_request(
    voyage: dict[str, Any],
    join_requests,
    current_user_id: str,
) -> dict[str, Any] | None:
    return join_requests.find_one(
        {
            "voyage_id": str(voyage["_id"]),
            "requester_id": current_user_id,
        },
        sort=[("updated_at", -1)],
    )


def serialize_voyage(
    voyage: dict[str, Any],
    current_user_id: str,
    collections,
    *,
    include_pending_requests: bool = False,
) -> dict[str, Any]:
    participant_ids = voyage.get("participant_ids", [])
    serialized_voyage = serialize_document(voyage)
    serialized_voyage["visibility"] = voyage.get("visibility", "public")
    serialized_voyage["participant_count"] = len(participant_ids)
    serialized_voyage["participants"] = [
        profile
        for profile in (
            get_profile_summary(collections["profiles"], participant_id, voyage)
            for participant_id in participant_ids
        )
        if profile is not None
    ]
    serialized_voyage["creator_profile"] = get_profile_summary(
        collections["profiles"],
        voyage["creator_id"],
        voyage,
    )
    serialized_voyage["viewer_status"] = get_viewer_status(
        voyage,
        collections["join_requests"],
        current_user_id,
    )
    viewer_join_request = get_viewer_join_request(
        voyage,
        collections["join_requests"],
        current_user_id,
    )

    if viewer_join_request:
        serialized_voyage["viewer_join_request"] = serialize_join_request(
            viewer_join_request,
            collections["profiles"],
            voyage,
        )

    if include_pending_requests and voyage.get("creator_id") == current_user_id:
        pending_requests = collections["join_requests"].find(
            {
                "voyage_id": str(voyage["_id"]),
                "status": "pending",
            }
        ).sort("created_at", -1)
        serialized_voyage["pending_requests"] = [
            serialize_join_request(join_request, collections["profiles"], voyage)
            for join_request in pending_requests
        ]

    return serialized_voyage


@router.post("", status_code=status.HTTP_201_CREATED)
def create_group_voyage(
    payload: GroupVoyageCreate,
    current_user=Depends(get_current_user),
):
    collections = get_group_collections_or_503()
    current_user_id = str(current_user["_id"])
    get_complete_profile_or_409(collections["profiles"], current_user_id)
    now = datetime.utcnow()
    voyage_document = payload.model_dump(mode="json")
    voyage_document["visibility"] = voyage_document.get("visibility", "public")
    voyage_document.update(
        {
            "creator_id": current_user_id,
            "participant_ids": [current_user_id],
            "created_at": now,
            "updated_at": now,
        }
    )

    result = collections["group_voyages"].insert_one(voyage_document)
    created_voyage = collections["group_voyages"].find_one(
        {"_id": result.inserted_id}
    )

    return serialize_voyage(
        created_voyage,
        current_user_id,
        collections,
        include_pending_requests=True,
    )


@router.get("")
def get_group_voyages(current_user=Depends(get_current_user)):
    collections = get_group_collections_or_503()
    current_user_id = str(current_user["_id"])
    current_profile = collections["profiles"].find_one({"user_id": current_user_id})
    preferred_destinations = (
        current_profile.get("preferred_destinations", [])
        if current_profile
        else []
    )
    normalized_preferred_destinations = {
        normalize_text(destination)
        for destination in preferred_destinations
        if normalize_text(destination)
    }

    if not normalized_preferred_destinations:
        return []

    voyages = collections["group_voyages"].find(
        {"status": "open", "visibility": {"$ne": "private"}}
    ).sort("created_at", -1)

    return [
        serialize_voyage(voyage, current_user_id, collections)
        for voyage in voyages
        if normalize_text(voyage.get("destination"))
        in normalized_preferred_destinations
    ]


@router.get("/requests/incoming")
def get_creator_join_requests(current_user=Depends(get_current_user)):
    collections = get_group_collections_or_503()
    current_user_id = str(current_user["_id"])
    join_requests = collections["join_requests"].find(
        {
            "creator_id": current_user_id,
            "status": "pending",
        }
    ).sort("created_at", -1)

    serialized_requests = []

    for join_request in join_requests:
        voyage = get_voyage_or_404(
            collections["group_voyages"],
            join_request["voyage_id"],
        )
        serialized_voyage = serialize_document(voyage)
        serialized_voyage["participant_count"] = len(
            voyage.get("participant_ids", [])
        )
        serialized_requests.append(
            {
                **serialize_join_request(
                    join_request,
                    collections["profiles"],
                    voyage,
                ),
                "voyage": serialized_voyage,
            }
        )

    return serialized_requests


@router.get("/{voyage_id}")
def get_group_voyage(
    voyage_id: str,
    current_user=Depends(get_current_user),
):
    collections = get_group_collections_or_503()
    voyage = get_voyage_or_404(collections["group_voyages"], voyage_id)

    return serialize_voyage(
        voyage,
        str(current_user["_id"]),
        collections,
        include_pending_requests=True,
    )


@router.patch("/{voyage_id}")
def update_group_voyage(
    voyage_id: str,
    payload: GroupVoyageUpdate,
    current_user=Depends(get_current_user),
):
    collections = get_group_collections_or_503()
    group_voyages = collections["group_voyages"]
    current_user_id = str(current_user["_id"])
    voyage = get_voyage_or_404(group_voyages, voyage_id)
    require_voyage_creator(voyage, current_user_id)
    get_complete_profile_or_409(collections["profiles"], current_user_id)
    update_data = validate_edit_payload(voyage, payload)

    if update_data:
        update_data["updated_at"] = datetime.utcnow()
        group_voyages.update_one(
            {"_id": voyage["_id"], "creator_id": current_user_id},
            {"$set": update_data},
        )

    updated_voyage = get_voyage_or_404(group_voyages, voyage_id)
    return serialize_voyage(
        updated_voyage,
        current_user_id,
        collections,
        include_pending_requests=True,
    )


@router.patch("/{voyage_id}/close")
def close_group_voyage(
    voyage_id: str,
    current_user=Depends(get_current_user),
):
    collections = get_group_collections_or_503()
    group_voyages = collections["group_voyages"]
    join_requests = collections["join_requests"]
    current_user_id = str(current_user["_id"])
    voyage = get_voyage_or_404(group_voyages, voyage_id)
    require_voyage_creator(voyage, current_user_id)
    now = datetime.utcnow()
    group_voyages.update_one(
        {"_id": voyage["_id"], "creator_id": current_user_id},
        {
            "$set": {
                "status": "closed",
                "updated_at": now,
                "closed_at": now,
            }
        },
    )
    join_requests.update_many(
        {
            "voyage_id": str(voyage["_id"]),
            "status": "pending",
        },
        {
            "$set": {
                "status": "cancelled",
                "updated_at": now,
                "cancelled_at": now,
                "cancelled_reason": "voyage_closed",
            },
            "$unset": {"active_request_key": ""},
        },
    )
    updated_voyage = get_voyage_or_404(group_voyages, voyage_id)
    return serialize_voyage(
        updated_voyage,
        current_user_id,
        collections,
        include_pending_requests=True,
    )


@router.patch("/{voyage_id}/leave")
def leave_group_voyage(
    voyage_id: str,
    current_user=Depends(get_current_user),
):
    collections = get_group_collections_or_503()
    group_voyages = collections["group_voyages"]
    join_requests = collections["join_requests"]
    current_user_id = str(current_user["_id"])
    voyage = get_voyage_or_404(group_voyages, voyage_id)

    if voyage.get("creator_id") == current_user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The host cannot leave their own group voyage",
        )

    if current_user_id not in voyage.get("participant_ids", []):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You are not a participant in this group voyage",
        )

    now = datetime.utcnow()
    group_voyages.update_one(
        {"_id": voyage["_id"], "participant_ids": current_user_id},
        {
            "$pull": {"participant_ids": current_user_id},
            "$set": {"updated_at": now},
        },
    )
    join_requests.update_many(
        {
            "voyage_id": str(voyage["_id"]),
            "requester_id": current_user_id,
            "status": "accepted",
        },
        {
            "$set": {"updated_at": now},
            "$unset": {"active_request_key": ""},
        },
    )
    updated_voyage = get_voyage_or_404(group_voyages, voyage_id)
    return serialize_voyage(updated_voyage, current_user_id, collections)


@router.post("/{voyage_id}/join-requests", status_code=status.HTTP_201_CREATED)
def create_join_request(
    voyage_id: str,
    current_user=Depends(get_current_user),
):
    collections = get_group_collections_or_503()
    group_voyages = collections["group_voyages"]
    join_requests = collections["join_requests"]
    current_user_id = str(current_user["_id"])
    voyage = get_voyage_or_404(group_voyages, voyage_id)
    serialized_voyage_id = str(voyage["_id"])

    if voyage.get("creator_id") == current_user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Creators are already part of their group voyage",
        )

    if current_user_id in voyage.get("participant_ids", []):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You are already a participant in this group voyage",
        )

    get_complete_profile_or_409(collections["profiles"], current_user_id)

    if voyage.get("status") != "open":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This group voyage is not accepting join requests",
        )

    if is_voyage_full(voyage):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This group voyage is already full",
        )

    active_request_key = build_join_request_key(serialized_voyage_id, current_user_id)

    if join_requests.find_one({"active_request_key": active_request_key}):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You already have an active request for this group voyage",
        )

    now = datetime.utcnow()
    request_document = {
        "voyage_id": serialized_voyage_id,
        "requester_id": current_user_id,
        "creator_id": voyage["creator_id"],
        "active_request_key": active_request_key,
        "status": "pending",
        "created_at": now,
        "updated_at": now,
    }

    try:
        result = join_requests.insert_one(request_document)
    except DuplicateKeyError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You already have an active request for this group voyage",
        ) from error

    created_request = join_requests.find_one({"_id": result.inserted_id})
    return serialize_join_request(created_request, collections["profiles"], voyage)


def update_join_request_status(
    request_id: str,
    next_status: str,
    current_user,
):
    collections = get_group_collections_or_503()
    join_requests = collections["join_requests"]
    group_voyages = collections["group_voyages"]
    current_user_id = str(current_user["_id"])
    join_request = join_requests.find_one(
        {"_id": parse_object_id(request_id, "join request id")}
    )

    if join_request is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Join request not found",
        )

    if join_request.get("creator_id") != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the group voyage creator can manage join requests",
        )

    if join_request.get("status") != "pending":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Join request has already been handled",
        )

    voyage = get_voyage_or_404(group_voyages, join_request["voyage_id"])

    if next_status == "accepted":
        if voyage.get("status") != "open":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This group voyage is not accepting new participants",
            )

        if is_voyage_full(voyage):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This group voyage is already full",
            )

        update_result = group_voyages.update_one(
            {
                "_id": voyage["_id"],
                "status": "open",
                "participant_ids": {"$ne": join_request["requester_id"]},
                "$expr": {
                    "$lt": [
                        {"$size": "$participant_ids"},
                        "$max_participants",
                    ]
                },
            },
            {
                "$addToSet": {"participant_ids": join_request["requester_id"]},
                "$set": {"updated_at": datetime.utcnow()},
            },
        )

        if update_result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This group voyage is already full or already includes this traveler",
            )

    update_document = {
        "$set": {
            "status": next_status,
            "updated_at": datetime.utcnow(),
            "responded_at": datetime.utcnow(),
        }
    }

    if next_status in ("accepted", "declined"):
        update_document["$unset"] = {"active_request_key": ""}

    join_requests.update_one({"_id": join_request["_id"]}, update_document)
    updated_request = join_requests.find_one({"_id": join_request["_id"]})
    return serialize_join_request(updated_request, collections["profiles"], voyage)


@router.patch("/join-requests/{request_id}/accept")
def accept_join_request(
    request_id: str,
    current_user=Depends(get_current_user),
):
    return update_join_request_status(request_id, "accepted", current_user)


@router.patch("/join-requests/{request_id}/decline")
def decline_join_request(
    request_id: str,
    current_user=Depends(get_current_user),
):
    return update_join_request_status(request_id, "declined", current_user)


@router.patch("/join-requests/{request_id}/cancel")
def cancel_join_request(
    request_id: str,
    current_user=Depends(get_current_user),
):
    collections = get_group_collections_or_503()
    join_requests = collections["join_requests"]
    group_voyages = collections["group_voyages"]
    current_user_id = str(current_user["_id"])
    join_request = join_requests.find_one(
        {"_id": parse_object_id(request_id, "join request id")}
    )

    if join_request is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Join request not found",
        )

    if join_request.get("requester_id") != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the requester can cancel this join request",
        )

    if join_request.get("status") != "pending":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Only pending join requests can be cancelled",
        )

    voyage = get_voyage_or_404(group_voyages, join_request["voyage_id"])
    now = datetime.utcnow()
    join_requests.update_one(
        {"_id": join_request["_id"]},
        {
            "$set": {
                "status": "cancelled",
                "updated_at": now,
                "cancelled_at": now,
            },
            "$unset": {"active_request_key": ""},
        },
    )
    updated_request = join_requests.find_one({"_id": join_request["_id"]})
    return serialize_join_request(updated_request, collections["profiles"], voyage)
