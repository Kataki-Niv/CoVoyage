from __future__ import annotations

from datetime import datetime
from typing import Any

from pymongo.errors import DuplicateKeyError

from services.connections import build_pair_key


def build_block_key(blocker_id: str, blocked_user_id: str) -> str:
    return f"{blocker_id.strip()}:{blocked_user_id.strip()}"


def build_blocked_pair_key(left_user_id: str, right_user_id: str) -> str:
    return build_pair_key(left_user_id, right_user_id)


def get_block_between(
    tribe_blocks,
    left_user_id: str,
    right_user_id: str,
) -> dict[str, Any] | None:
    return tribe_blocks.find_one(
        {"blocked_pair_key": build_blocked_pair_key(left_user_id, right_user_id)}
    )


def users_are_blocked(
    tribe_blocks,
    left_user_id: str,
    right_user_id: str,
) -> bool:
    return get_block_between(tribe_blocks, left_user_id, right_user_id) is not None


def create_block(
    tribe_blocks,
    blocker_id: str,
    blocked_user_id: str,
) -> tuple[dict[str, Any], bool]:
    block_key = build_block_key(blocker_id, blocked_user_id)
    existing_block = tribe_blocks.find_one({"block_key": block_key})

    if existing_block is not None:
        return existing_block, False

    now = datetime.utcnow()
    block_document = {
        "blocker_id": blocker_id,
        "blocked_user_id": blocked_user_id,
        "block_key": block_key,
        "blocked_pair_key": build_blocked_pair_key(blocker_id, blocked_user_id),
        "created_at": now,
    }

    try:
        result = tribe_blocks.insert_one(block_document)
    except DuplicateKeyError:
        existing_block = tribe_blocks.find_one({"block_key": block_key})

        if existing_block is not None:
            return existing_block, False

        raise

    created_block = tribe_blocks.find_one({"_id": result.inserted_id})
    return created_block, True
