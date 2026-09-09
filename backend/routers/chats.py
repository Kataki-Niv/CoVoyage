from datetime import date, datetime
from typing import Any

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.errors import DuplicateKeyError

from database import (
    get_chats_collection,
    get_connection_requests_collection,
    get_group_voyages_collection,
    get_messages_collection,
    get_profiles_collection,
    get_tribe_blocks_collection,
    get_users_collection,
)
from dependencies import get_current_user
from models import (
    ChatConversation,
    ChatConversationCreate,
    ChatMessage,
    ChatMessageCreate,
)
from services.connections import (
    build_pair_key,
    get_accepted_connection,
    users_have_accepted_connection,
)
from services.blocks import users_are_blocked
from services.profile_privacy import serialize_tribe_profile


router = APIRouter(prefix="/chats", tags=["chats"])


def get_chat_collections_or_503():
    try:
        return {
            "chats": get_chats_collection(),
            "connection_requests": get_connection_requests_collection(),
            "group_voyages": get_group_voyages_collection(),
            "messages": get_messages_collection(),
            "profiles": get_profiles_collection(),
            "tribe_blocks": get_tribe_blocks_collection(),
            "users": get_users_collection(),
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


def get_profile_summary(profiles, user_id: str) -> dict[str, Any] | None:
    profile = profiles.find_one({"user_id": user_id})

    if profile is None:
        return None

    return serialize_tribe_profile(profile)


def get_chat_profile_summary(profiles, user_id: str) -> dict[str, Any] | None:
    profile = profiles.find_one({"user_id": user_id})

    if profile is None:
        return None

    return {
        key: serialize_mongo_value(value)
        for key, value in {
            "user_id": profile.get("user_id"),
            "name": profile.get("name"),
            "username": profile.get("username"),
            "profile_picture_url": profile.get("profile_picture_url"),
        }.items()
        if value is not None and value != ""
    }


def get_conversation_type(conversation: dict[str, Any]) -> str:
    return conversation.get("type") or "direct"


def is_group_voyage_member(voyage: dict[str, Any], user_id: str) -> bool:
    return voyage.get("creator_id") == user_id or user_id in voyage.get(
        "participant_ids",
        [],
    )


def get_group_voyage_or_404(group_voyages, voyage_id: str) -> dict[str, Any]:
    voyage = group_voyages.find_one(
        {"_id": parse_object_id(voyage_id, "group voyage id")}
    )

    if voyage is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group voyage not found",
        )

    return voyage


def ensure_group_voyage_chat_access(
    group_voyages,
    conversation: dict[str, Any],
    current_user_id: str,
) -> dict[str, Any]:
    voyage_id = conversation.get("voyage_id")

    if not voyage_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found",
        )

    voyage = get_group_voyage_or_404(group_voyages, voyage_id)

    if not is_group_voyage_member(voyage, current_user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this group voyage chat",
        )

    return voyage


def serialize_group_conversation(
    conversation: dict[str, Any],
    voyage: dict[str, Any],
    current_user_id: str | None = None,
) -> dict[str, Any]:
    serialized_conversation = serialize_document(conversation)
    serialized_conversation["type"] = "group_voyage"
    serialized_conversation.setdefault("participant_ids", [])
    serialized_conversation.setdefault("connection_request_id", None)
    serialized_conversation.setdefault("last_message_at", None)
    serialized_conversation.setdefault("last_message_preview", None)
    serialized_conversation["voyage_id"] = str(voyage["_id"])
    serialized_conversation["voyage_title"] = voyage.get("title")
    serialized_conversation["voyage_destination"] = voyage.get("destination")
    serialized_conversation["voyage_status"] = voyage.get("status")
    serialized_conversation["current_user_id"] = current_user_id
    return serialized_conversation


def get_other_participant_id(
    conversation: dict[str, Any],
    current_user_id: str,
) -> str:
    participant_ids = conversation.get("participant_ids", [])

    for participant_id in participant_ids:
        if participant_id != current_user_id:
            return participant_id

    raise HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail="Conversation participants are invalid",
    )


def serialize_conversation(
    conversation: dict[str, Any],
    current_user_id: str,
    profiles,
    group_voyages=None,
) -> dict[str, Any]:
    if get_conversation_type(conversation) == "group_voyage":
        if group_voyages is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database connection is unavailable",
            )

        voyage = ensure_group_voyage_chat_access(
            group_voyages,
            conversation,
            current_user_id,
        )
        return serialize_group_conversation(conversation, voyage, current_user_id)

    serialized_conversation = serialize_document(conversation)
    other_user_id = get_other_participant_id(conversation, current_user_id)
    serialized_conversation["type"] = "direct"
    serialized_conversation["current_user_id"] = current_user_id
    serialized_conversation.setdefault("connection_request_id", None)
    serialized_conversation.setdefault("last_message_at", None)
    serialized_conversation.setdefault("last_message_preview", None)
    serialized_conversation["other_user_id"] = other_user_id
    serialized_conversation["other_profile"] = get_profile_summary(
        profiles,
        other_user_id,
    )

    return serialized_conversation


def serialize_message(message: dict[str, Any], profiles=None) -> dict[str, Any]:
    serialized_message = serialize_document(message)
    serialized_message.setdefault("recipient_id", None)
    serialized_message.setdefault("read_at", None)

    if profiles is not None:
        serialized_message["sender_profile"] = get_chat_profile_summary(
            profiles,
            serialized_message["sender_id"],
        )

    return serialized_message


def verify_target_user_exists(users, target_user_id: str):
    if not ObjectId.is_valid(target_user_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Traveler not found",
        )

    if users.find_one({"_id": ObjectId(target_user_id)}, {"_id": 1}) is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Traveler not found",
        )


def ensure_chat_pair_is_not_blocked(
    tribe_blocks,
    current_user_id: str,
    target_user_id: str,
) -> None:
    if users_are_blocked(tribe_blocks, current_user_id, target_user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This Tribe chat is not available.",
        )


def get_authorized_conversation(
    chats,
    chat_id: str,
    current_user_id: str,
    group_voyages=None,
) -> dict[str, Any]:
    conversation = chats.find_one({"_id": parse_object_id(chat_id, "chat id")})

    if conversation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found",
        )

    if get_conversation_type(conversation) == "group_voyage":
        if group_voyages is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database connection is unavailable",
            )

        ensure_group_voyage_chat_access(group_voyages, conversation, current_user_id)
        return conversation

    if current_user_id not in conversation.get("participant_ids", []):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this chat",
        )

    return conversation


def get_or_create_group_voyage_conversation(
    chats,
    voyage: dict[str, Any],
) -> dict[str, Any]:
    voyage_id = str(voyage["_id"])
    group_voyage_key = f"group_voyage:{voyage_id}"
    existing_conversation = chats.find_one({"group_voyage_key": group_voyage_key})

    if existing_conversation is not None:
        return existing_conversation

    now = datetime.utcnow()
    conversation_document = {
        "type": "group_voyage",
        "voyage_id": voyage_id,
        "group_voyage_key": group_voyage_key,
        "participant_ids": [voyage["creator_id"]],
        "created_at": now,
        "updated_at": now,
        "last_message_at": None,
        "last_message_preview": None,
    }

    try:
        result = chats.insert_one(conversation_document)
    except DuplicateKeyError:
        existing_conversation = chats.find_one({"group_voyage_key": group_voyage_key})

        if existing_conversation is not None:
            return existing_conversation

        raise

    return chats.find_one({"_id": result.inserted_id})


@router.get("/status")
def chats_status():
    get_chats_collection()
    return {
        "collection": "chats",
        "ready": True,
        "message": "Chats collection is ready for future chat features.",
    }


@router.get("", response_model=list[ChatConversation])
def get_chats(current_user=Depends(get_current_user)):
    collections = get_chat_collections_or_503()
    current_user_id = str(current_user["_id"])
    direct_conversations = list(
        collections["chats"].find(
            {
                "participant_ids": current_user_id,
                "type": {"$ne": "group_voyage"},
            }
        )
    )
    member_voyages = list(
        collections["group_voyages"].find({"participant_ids": current_user_id})
    )
    group_conversations = [
        conversation
        for conversation in (
            collections["chats"].find_one(
                {"group_voyage_key": f"group_voyage:{str(voyage['_id'])}"}
            )
            for voyage in member_voyages
        )
        if conversation is not None
    ]
    conversations = sorted(
        direct_conversations + group_conversations,
        key=lambda conversation: conversation.get("updated_at") or datetime.min,
        reverse=True,
    )
    serialized_conversations = []

    for conversation in conversations:
        if get_conversation_type(conversation) == "group_voyage":
            serialized_conversations.append(
                serialize_conversation(
                    conversation,
                    current_user_id,
                    collections["profiles"],
                    collections["group_voyages"],
                )
            )
            continue

        other_participant_id = get_other_participant_id(conversation, current_user_id)

        if users_are_blocked(
            collections["tribe_blocks"],
            current_user_id,
            other_participant_id,
        ):
            continue

        serialized_conversations.append(
            serialize_conversation(
                conversation,
                current_user_id,
                collections["profiles"],
            )
        )

    return serialized_conversations


@router.post("", response_model=ChatConversation, status_code=status.HTTP_201_CREATED)
def create_chat(
    payload: ChatConversationCreate,
    current_user=Depends(get_current_user),
):
    collections = get_chat_collections_or_503()
    chats = collections["chats"]
    connection_requests = collections["connection_requests"]
    current_user_id = str(current_user["_id"])
    target_user_id = payload.target_user_id.strip()

    if current_user_id == target_user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot create a chat with yourself",
        )

    verify_target_user_exists(collections["users"], target_user_id)
    ensure_chat_pair_is_not_blocked(
        collections["tribe_blocks"],
        current_user_id,
        target_user_id,
    )
    accepted_connection = get_accepted_connection(
        connection_requests,
        current_user_id,
        target_user_id,
    )

    if accepted_connection is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only chat with accepted Tribe connections",
        )

    pair_key = build_pair_key(current_user_id, target_user_id)
    existing_conversation = chats.find_one({"pair_key": pair_key})

    if existing_conversation is not None:
        return serialize_conversation(
            existing_conversation,
            current_user_id,
            collections["profiles"],
        )

    now = datetime.utcnow()
    conversation_document = {
        "type": "direct",
        "participant_ids": sorted([current_user_id, target_user_id]),
        "pair_key": pair_key,
        "connection_request_id": str(accepted_connection["_id"]),
        "created_at": now,
        "updated_at": now,
        "last_message_at": None,
        "last_message_preview": None,
    }

    try:
        result = chats.insert_one(conversation_document)
    except DuplicateKeyError:
        existing_conversation = chats.find_one({"pair_key": pair_key})

        if existing_conversation is not None:
            return serialize_conversation(
                existing_conversation,
                current_user_id,
                collections["profiles"],
            )

        raise

    created_conversation = chats.find_one({"_id": result.inserted_id})
    return serialize_conversation(
        created_conversation,
        current_user_id,
        collections["profiles"],
    )


@router.get("/{chat_id}/messages", response_model=list[ChatMessage])
def get_chat_messages(
    chat_id: str,
    current_user=Depends(get_current_user),
):
    collections = get_chat_collections_or_503()
    current_user_id = str(current_user["_id"])
    conversation = get_authorized_conversation(
        collections["chats"],
        chat_id,
        current_user_id,
        collections["group_voyages"],
    )
    if get_conversation_type(conversation) == "group_voyage":
        messages = collections["messages"].find(
            {"conversation_id": str(conversation["_id"])}
        ).sort("created_at", 1)

        return [
            serialize_message(message, collections["profiles"])
            for message in messages
        ]

    ensure_chat_pair_is_not_blocked(
        collections["tribe_blocks"],
        current_user_id,
        get_other_participant_id(conversation, current_user_id),
    )
    messages = collections["messages"].find(
        {"conversation_id": str(conversation["_id"])}
    ).sort("created_at", 1)

    return [
        serialize_message(message, collections["profiles"])
        for message in messages
    ]


@router.post(
    "/{chat_id}/messages",
    response_model=ChatMessage,
    status_code=status.HTTP_201_CREATED,
)
def send_chat_message(
    chat_id: str,
    payload: ChatMessageCreate,
    current_user=Depends(get_current_user),
):
    collections = get_chat_collections_or_503()
    chats = collections["chats"]
    messages = collections["messages"]
    connection_requests = collections["connection_requests"]
    current_user_id = str(current_user["_id"])
    conversation = get_authorized_conversation(
        chats,
        chat_id,
        current_user_id,
        collections["group_voyages"],
    )
    if get_conversation_type(conversation) == "group_voyage":
        ensure_group_voyage_chat_access(
            collections["group_voyages"],
            conversation,
            current_user_id,
        )
        now = datetime.utcnow()
        message_document = {
            "conversation_id": str(conversation["_id"]),
            "sender_id": current_user_id,
            "recipient_id": None,
            "body": payload.body,
            "created_at": now,
            "read_at": None,
        }
        result = messages.insert_one(message_document)
        chats.update_one(
            {"_id": conversation["_id"]},
            {
                "$set": {
                    "updated_at": now,
                    "last_message_at": now,
                    "last_message_preview": payload.body[:160],
                }
            },
        )
        created_message = messages.find_one({"_id": result.inserted_id})

        return serialize_message(created_message, collections["profiles"])

    recipient_id = get_other_participant_id(conversation, current_user_id)
    ensure_chat_pair_is_not_blocked(
        collections["tribe_blocks"],
        current_user_id,
        recipient_id,
    )

    if not users_have_accepted_connection(
        connection_requests,
        current_user_id,
        recipient_id,
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only message accepted Tribe connections",
        )

    now = datetime.utcnow()
    message_document = {
        "conversation_id": str(conversation["_id"]),
        "sender_id": current_user_id,
        "recipient_id": recipient_id,
        "body": payload.body,
        "created_at": now,
        "read_at": None,
    }
    result = messages.insert_one(message_document)
    chats.update_one(
        {"_id": conversation["_id"]},
        {
            "$set": {
                "updated_at": now,
                "last_message_at": now,
                "last_message_preview": payload.body[:160],
            }
        },
    )
    created_message = messages.find_one({"_id": result.inserted_id})

    return serialize_message(created_message, collections["profiles"])


@router.patch("/{chat_id}/read")
def mark_chat_read(
    chat_id: str,
    current_user=Depends(get_current_user),
):
    collections = get_chat_collections_or_503()
    current_user_id = str(current_user["_id"])
    conversation = get_authorized_conversation(
        collections["chats"],
        chat_id,
        current_user_id,
        collections["group_voyages"],
    )
    if get_conversation_type(conversation) == "group_voyage":
        return {
            "updated_count": 0,
            "read_at": datetime.utcnow().isoformat(),
        }

    ensure_chat_pair_is_not_blocked(
        collections["tribe_blocks"],
        current_user_id,
        get_other_participant_id(conversation, current_user_id),
    )
    read_at = datetime.utcnow()
    result = collections["messages"].update_many(
        {
            "conversation_id": str(conversation["_id"]),
            "recipient_id": current_user_id,
            "read_at": None,
        },
        {"$set": {"read_at": read_at}},
    )

    return {
        "updated_count": result.modified_count,
        "read_at": read_at.isoformat(),
    }


@router.post(
    "/group-voyages/{voyage_id}",
    response_model=ChatConversation,
    status_code=status.HTTP_201_CREATED,
)
def get_or_create_group_voyage_chat(
    voyage_id: str,
    current_user=Depends(get_current_user),
):
    collections = get_chat_collections_or_503()
    current_user_id = str(current_user["_id"])
    voyage = get_group_voyage_or_404(collections["group_voyages"], voyage_id)

    if not is_group_voyage_member(voyage, current_user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only access chat for Group Voyages you have joined",
        )

    conversation = get_or_create_group_voyage_conversation(
        collections["chats"],
        voyage,
    )

    return serialize_group_conversation(conversation, voyage, current_user_id)
