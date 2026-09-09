from typing import Any


def build_pair_key(left_user_id: str, right_user_id: str) -> str:
    return ":".join(sorted([left_user_id.strip(), right_user_id.strip()]))


def get_relationship_document(
    connection_requests,
    current_user_id: str,
    target_user_id: str,
) -> dict[str, Any] | None:
    pair_key = build_pair_key(current_user_id, target_user_id)
    active_request = connection_requests.find_one({"active_pair_key": pair_key})

    if active_request is not None:
        return active_request

    return connection_requests.find_one(
        {"pair_key": pair_key},
        sort=[("updated_at", -1)],
    )


def relationship_status_from_document(
    connection_request: dict[str, Any] | None,
    current_user_id: str,
) -> str:
    if connection_request is None:
        return "none"

    request_status = connection_request.get("status")

    if request_status == "accepted":
        return "connected"

    if request_status == "declined":
        return "declined"

    if request_status == "cancelled":
        return "cancelled"

    if request_status == "pending":
        return (
            "pending_sent"
            if connection_request.get("requester_id") == current_user_id
            else "pending_received"
        )

    return "none"


def get_relationship_status(
    connection_requests,
    current_user_id: str,
    target_user_id: str,
) -> str:
    return relationship_status_from_document(
        get_relationship_document(
            connection_requests,
            current_user_id,
            target_user_id,
        ),
        current_user_id,
    )


def get_accepted_connection(
    connection_requests,
    current_user_id: str,
    target_user_id: str,
) -> dict[str, Any] | None:
    return connection_requests.find_one(
        {
            "active_pair_key": build_pair_key(current_user_id, target_user_id),
            "status": "accepted",
        }
    )


def users_have_accepted_connection(
    connection_requests,
    current_user_id: str,
    target_user_id: str,
) -> bool:
    return (
        get_accepted_connection(connection_requests, current_user_id, target_user_id)
        is not None
    )
