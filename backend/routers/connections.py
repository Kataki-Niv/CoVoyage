from datetime import date, datetime
from typing import Any

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.errors import DuplicateKeyError

from database import (
    get_connection_requests_collection,
    get_profiles_collection,
    get_tribe_blocks_collection,
    get_tribe_reports_collection,
)
from dependencies import get_current_user
from models import ConnectionRequestCreate, TribeBlockCreate, TribeReportCreate
from services.ai_matching_pipeline import candidate_is_eligible_for_ai_matching
from services.blocks import create_block, users_are_blocked
from services.connections import (
    build_pair_key,
    get_relationship_document,
    relationship_status_from_document,
)
from services.profile_completeness import (
    INCOMPLETE_PROFILE_MATCHING_MESSAGE,
    evaluate_profile_completeness,
)
from services.profile_privacy import (
    is_tribe_discoverable,
    serialize_tribe_identity,
    serialize_tribe_profile,
)
from services.profile_privacy import serialize_tribe_match_profile
from services.rate_limiter import enforce_rate_limit


router = APIRouter(prefix="/connections", tags=["connections"])
CONNECTION_REQUEST_RATE_LIMIT = 5
REPORT_RATE_LIMIT = 5
RATE_LIMIT_WINDOW_SECONDS = 60


def get_connection_collections_or_503():
    try:
        return {
            "connection_requests": get_connection_requests_collection(),
            "profiles": get_profiles_collection(),
            "tribe_blocks": get_tribe_blocks_collection(),
            "tribe_reports": get_tribe_reports_collection(),
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


def get_profile_or_404(profiles, user_id: str) -> dict[str, Any]:
    profile = profiles.find_one({"user_id": user_id})

    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Traveler profile not found",
        )

    return profile


def get_requester_profile_or_404(profiles, user_id: str) -> dict[str, Any]:
    profile = profiles.find_one({"user_id": user_id})

    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Create a travel profile before sending connection requests",
        )

    return profile


def ensure_requester_can_use_tribe_matching(profile: dict[str, Any]) -> None:
    completeness = evaluate_profile_completeness(profile)

    if not completeness.complete:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "code": "profile_incomplete",
                "message": INCOMPLETE_PROFILE_MATCHING_MESSAGE,
                "profile_completeness": completeness.to_dict(),
            },
        )

    if not is_tribe_discoverable(profile):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "code": "tribe_not_discoverable",
                "message": "Enable Tribe Matching before sending connection requests.",
            },
        )


def ensure_target_is_available_for_tribe_matching(
    requester_profile: dict[str, Any],
    target_profile: dict[str, Any],
) -> None:
    if not is_tribe_discoverable(target_profile):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "code": "target_not_discoverable",
                "message": "This traveler is not available for Tribe matching.",
            },
        )

    if not candidate_is_eligible_for_ai_matching(requester_profile, target_profile):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "code": "tribe_match_ineligible",
                "message": (
                    "You can only send connection requests to eligible Tribe matches."
                ),
            },
        )


def get_profile_summary(profiles, user_id: str) -> dict[str, Any] | None:
    profile = profiles.find_one({"user_id": user_id})

    if profile is None:
        return None

    return serialize_tribe_profile(profile)


def get_profile_match_summary(
    profiles,
    viewer_profile: dict[str, Any] | None,
    user_id: str,
) -> dict[str, Any] | None:
    profile = profiles.find_one({"user_id": user_id})

    if profile is None:
        return None

    if viewer_profile is None:
        return serialize_tribe_identity(profile)

    return serialize_tribe_match_profile(viewer_profile, profile)


def serialize_connection_request(
    connection_request: dict[str, Any],
    current_user_id: str,
    profiles,
    current_profile: dict[str, Any] | None = None,
) -> dict[str, Any]:
    requester_id = connection_request["requester_id"]
    recipient_id = connection_request["recipient_id"]
    other_user_id = recipient_id if requester_id == current_user_id else requester_id

    return {
        **serialize_document(connection_request),
        "relationship_status": relationship_status_from_document(
            connection_request,
            current_user_id,
        ),
        "other_user_id": other_user_id,
        "other_profile": get_profile_match_summary(
            profiles,
            current_profile,
            other_user_id,
        ),
        "requester_profile": get_profile_match_summary(
            profiles,
            current_profile,
            requester_id,
        ),
        "recipient_profile": get_profile_match_summary(
            profiles,
            current_profile,
            recipient_id,
        ),
    }


def blocked_pair_exists(collections, left_user_id: str, right_user_id: str) -> bool:
    return users_are_blocked(
        collections["tribe_blocks"],
        left_user_id,
        right_user_id,
    )


def ensure_pair_is_not_blocked(
    collections,
    left_user_id: str,
    right_user_id: str,
) -> None:
    if blocked_pair_exists(collections, left_user_id, right_user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "code": "tribe_interaction_blocked",
                "message": "This Tribe interaction is not available.",
            },
        )


@router.post("/requests", status_code=status.HTTP_201_CREATED)
def create_connection_request(
    payload: ConnectionRequestCreate,
    current_user=Depends(get_current_user),
):
    collections = get_connection_collections_or_503()
    connection_requests = collections["connection_requests"]
    profiles = collections["profiles"]
    requester_id = str(current_user["_id"])
    recipient_id = payload.target_user_id.strip()

    if requester_id == recipient_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot send a connection request to yourself",
        )

    enforce_rate_limit(
        "connection-request-create",
        requester_id,
        limit=CONNECTION_REQUEST_RATE_LIMIT,
        window_seconds=RATE_LIMIT_WINDOW_SECONDS,
    )
    ensure_pair_is_not_blocked(collections, requester_id, recipient_id)
    requester_profile = get_requester_profile_or_404(profiles, requester_id)
    ensure_requester_can_use_tribe_matching(requester_profile)
    target_profile = get_profile_or_404(profiles, recipient_id)
    ensure_target_is_available_for_tribe_matching(
        requester_profile,
        target_profile,
    )

    pair_key = build_pair_key(requester_id, recipient_id)
    existing_relationship = get_relationship_document(
        connection_requests,
        requester_id,
        recipient_id,
    )

    if existing_relationship and existing_relationship.get("active_pair_key"):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A connection request or connection already exists",
        )

    now = datetime.utcnow()
    request_document = {
        "requester_id": requester_id,
        "recipient_id": recipient_id,
        "pair_key": pair_key,
        "active_pair_key": pair_key,
        "status": "pending",
        "created_at": now,
        "updated_at": now,
    }

    try:
        result = connection_requests.insert_one(request_document)
    except DuplicateKeyError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A connection request or connection already exists",
        ) from error

    created_request = connection_requests.find_one({"_id": result.inserted_id})
    return serialize_connection_request(
        created_request,
        requester_id,
        profiles,
        requester_profile,
    )


@router.get("/requests/incoming")
def get_incoming_connection_requests(current_user=Depends(get_current_user)):
    collections = get_connection_collections_or_503()
    current_user_id = str(current_user["_id"])
    current_profile = collections["profiles"].find_one({"user_id": current_user_id})
    requests = collections["connection_requests"].find(
        {
            "recipient_id": current_user_id,
            "status": "pending",
        }
    ).sort("created_at", -1)

    return [
        serialize_connection_request(
            connection_request,
            current_user_id,
            collections["profiles"],
            current_profile,
        )
        for connection_request in requests
        if not blocked_pair_exists(
            collections,
            current_user_id,
            connection_request["requester_id"],
        )
    ]


@router.get("/requests/outgoing")
def get_outgoing_connection_requests(current_user=Depends(get_current_user)):
    collections = get_connection_collections_or_503()
    current_user_id = str(current_user["_id"])
    current_profile = collections["profiles"].find_one({"user_id": current_user_id})
    requests = collections["connection_requests"].find(
        {
            "requester_id": current_user_id,
            "status": "pending",
        }
    ).sort("created_at", -1)

    return [
        serialize_connection_request(
            connection_request,
            current_user_id,
            collections["profiles"],
            current_profile,
        )
        for connection_request in requests
        if not blocked_pair_exists(
            collections,
            current_user_id,
            connection_request["recipient_id"],
        )
    ]


@router.get("")
def get_connections(current_user=Depends(get_current_user)):
    collections = get_connection_collections_or_503()
    current_user_id = str(current_user["_id"])
    current_profile = collections["profiles"].find_one({"user_id": current_user_id})
    requests = collections["connection_requests"].find(
        {
            "status": "accepted",
            "$or": [
                {"requester_id": current_user_id},
                {"recipient_id": current_user_id},
            ],
        }
    ).sort("updated_at", -1)

    return [
        serialize_connection_request(
            connection_request,
            current_user_id,
            collections["profiles"],
            current_profile,
        )
        for connection_request in requests
        if not blocked_pair_exists(
            collections,
            current_user_id,
            (
                connection_request["recipient_id"]
                if connection_request["requester_id"] == current_user_id
                else connection_request["requester_id"]
            ),
        )
    ]


@router.get("/status/{target_user_id}")
def get_connection_status(
    target_user_id: str,
    current_user=Depends(get_current_user),
):
    collections = get_connection_collections_or_503()
    current_user_id = str(current_user["_id"])

    if current_user_id == target_user_id:
        return {
            "target_user_id": target_user_id,
            "relationship_status": "self",
        }

    if blocked_pair_exists(collections, current_user_id, target_user_id):
        return {
            "target_user_id": target_user_id,
            "relationship_status": "blocked",
            "request": None,
        }

    current_profile = collections["profiles"].find_one({"user_id": current_user_id})
    connection_request = get_relationship_document(
        collections["connection_requests"],
        current_user_id,
        target_user_id,
    )

    return {
        "target_user_id": target_user_id,
        "relationship_status": relationship_status_from_document(
            connection_request,
            current_user_id,
        ),
        "request": serialize_connection_request(
            connection_request,
            current_user_id,
            collections["profiles"],
            current_profile,
        )
        if connection_request
        else None,
    }


@router.patch("/requests/{request_id}/cancel")
def cancel_connection_request(
    request_id: str,
    current_user=Depends(get_current_user),
):
    collections = get_connection_collections_or_503()
    connection_requests = collections["connection_requests"]
    current_user_id = str(current_user["_id"])
    connection_request = connection_requests.find_one(
        {"_id": parse_object_id(request_id, "connection request id")}
    )

    if connection_request is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Connection request not found",
        )

    if connection_request.get("requester_id") != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the requester can cancel this connection request",
        )

    if connection_request.get("status") != "pending":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Connection request has already been handled",
        )

    connection_requests.update_one(
        {"_id": connection_request["_id"]},
        {
            "$set": {
                "status": "cancelled",
                "updated_at": datetime.utcnow(),
                "cancelled_at": datetime.utcnow(),
            },
            "$unset": {"active_pair_key": ""},
        },
    )
    updated_request = connection_requests.find_one({"_id": connection_request["_id"]})
    current_profile = collections["profiles"].find_one({"user_id": current_user_id})
    return serialize_connection_request(
        updated_request,
        current_user_id,
        collections["profiles"],
        current_profile,
    )


def update_connection_request_status(
    request_id: str,
    next_status: str,
    current_user,
):
    collections = get_connection_collections_or_503()
    connection_requests = collections["connection_requests"]
    current_user_id = str(current_user["_id"])
    connection_request = connection_requests.find_one(
        {"_id": parse_object_id(request_id, "connection request id")}
    )

    if connection_request is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Connection request not found",
        )

    if connection_request.get("recipient_id") != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the recipient can manage this connection request",
        )

    ensure_pair_is_not_blocked(
        collections,
        connection_request["requester_id"],
        connection_request["recipient_id"],
    )

    if connection_request.get("status") != "pending":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Connection request has already been handled",
        )

    update_document = {
        "$set": {
            "status": next_status,
            "updated_at": datetime.utcnow(),
            "responded_at": datetime.utcnow(),
        }
    }

    if next_status == "declined":
        update_document["$unset"] = {"active_pair_key": ""}

    connection_requests.update_one(
        {"_id": connection_request["_id"]},
        update_document,
    )
    updated_request = connection_requests.find_one({"_id": connection_request["_id"]})
    current_profile = collections["profiles"].find_one({"user_id": current_user_id})
    return serialize_connection_request(
        updated_request,
        current_user_id,
        collections["profiles"],
        current_profile,
    )


@router.patch("/requests/{request_id}/accept")
def accept_connection_request(
    request_id: str,
    current_user=Depends(get_current_user),
):
    return update_connection_request_status(request_id, "accepted", current_user)


@router.patch("/requests/{request_id}/decline")
def decline_connection_request(
    request_id: str,
    current_user=Depends(get_current_user),
):
    return update_connection_request_status(request_id, "declined", current_user)


@router.post("/blocks", status_code=status.HTTP_201_CREATED)
def block_tribe_user(
    payload: TribeBlockCreate,
    current_user=Depends(get_current_user),
):
    collections = get_connection_collections_or_503()
    blocker_id = str(current_user["_id"])
    blocked_user_id = payload.target_user_id.strip()

    if blocker_id == blocked_user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot block yourself",
        )

    get_profile_or_404(collections["profiles"], blocked_user_id)
    block_document, created = create_block(
        collections["tribe_blocks"],
        blocker_id,
        blocked_user_id,
    )
    pair_key = build_pair_key(blocker_id, blocked_user_id)
    collections["connection_requests"].update_many(
        {
            "pair_key": pair_key,
            "status": "pending",
        },
        {
            "$set": {
                "status": "cancelled",
                "updated_at": datetime.utcnow(),
                "cancelled_at": datetime.utcnow(),
                "cancelled_reason": "blocked",
            },
            "$unset": {"active_pair_key": ""},
        },
    )

    return {
        "blocked": True,
        "created": created,
        "block": serialize_document(block_document),
    }


@router.post("/reports", status_code=status.HTTP_201_CREATED)
def report_tribe_user(
    payload: TribeReportCreate,
    current_user=Depends(get_current_user),
):
    collections = get_connection_collections_or_503()
    reporter_id = str(current_user["_id"])
    reported_user_id = payload.reported_user_id.strip()

    if reporter_id == reported_user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot report yourself",
        )

    enforce_rate_limit(
        "tribe-report-create",
        reporter_id,
        limit=REPORT_RATE_LIMIT,
        window_seconds=RATE_LIMIT_WINDOW_SECONDS,
    )
    get_profile_or_404(collections["profiles"], reported_user_id)
    active_report_key = f"{reporter_id}:{reported_user_id}:{payload.reason}"

    if collections["tribe_reports"].find_one(
        {"active_report_key": active_report_key}
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You have already reported this traveler for this reason.",
        )

    now = datetime.utcnow()
    report_document = {
        "reporter_id": reporter_id,
        "reported_user_id": reported_user_id,
        "reason": payload.reason,
        "description": payload.description,
        "active_report_key": active_report_key,
        "status": "open",
        "created_at": now,
        "updated_at": now,
    }

    try:
        result = collections["tribe_reports"].insert_one(report_document)
    except DuplicateKeyError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You have already reported this traveler for this reason.",
        ) from error

    created_report = collections["tribe_reports"].find_one({"_id": result.inserted_id})
    return {
        "reported": True,
        "report": serialize_document(created_report),
    }
