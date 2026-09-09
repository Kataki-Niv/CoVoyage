from datetime import datetime, timedelta
import hashlib
import secrets
from typing import Any


EMAIL_VERIFICATION_PURPOSE = "email_verification"
PASSWORD_RESET_PURPOSE = "password_reset"
EMAIL_VERIFICATION_EXPIRY = timedelta(hours=24)
PASSWORD_RESET_EXPIRY = timedelta(hours=1)


def hash_account_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def create_account_token(
    account_tokens,
    user: dict[str, Any],
    purpose: str,
    expires_in: timedelta,
) -> str:
    raw_token = secrets.token_urlsafe(48)
    now = datetime.utcnow()

    account_tokens.update_many(
        {
            "user_id": str(user["_id"]),
            "purpose": purpose,
            "used_at": None,
        },
        {"$set": {"used_at": now, "superseded_at": now}},
    )
    account_tokens.insert_one(
        {
            "user_id": str(user["_id"]),
            "email": user.get("email"),
            "purpose": purpose,
            "token_hash": hash_account_token(raw_token),
            "created_at": now,
            "expires_at": now + expires_in,
            "used_at": None,
        }
    )

    return raw_token


def consume_account_token(account_tokens, token: str, purpose: str) -> dict[str, Any] | None:
    now = datetime.utcnow()
    token_hash = hash_account_token(token)
    token_document = account_tokens.find_one(
        {
            "token_hash": token_hash,
            "purpose": purpose,
            "used_at": None,
            "expires_at": {"$gt": now},
        }
    )

    if token_document is None:
        return None

    result = account_tokens.update_one(
        {
            "_id": token_document["_id"],
            "used_at": None,
            "expires_at": {"$gt": now},
        },
        {"$set": {"used_at": now}},
    )

    if result.modified_count != 1:
        return None

    return token_document


def email_delivery_configured() -> bool:
    return False
