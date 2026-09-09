from __future__ import annotations

from base64 import b64encode
from copy import deepcopy
from pathlib import Path
import sys
from uuid import uuid4

from bson import ObjectId
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import dependencies
import main
from services.account_tokens import (
    EMAIL_VERIFICATION_PURPOSE,
    EMAIL_VERIFICATION_EXPIRY,
    PASSWORD_RESET_PURPOSE,
    PASSWORD_RESET_EXPIRY,
    create_account_token,
)


ONE_BY_ONE_PNG = (
    b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01"
    b"\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89"
    b"\x00\x00\x00\rIDATx\x9cc\xf8\xff\xff?\x00\x05\xfe"
    b"\x02\xfeA\xe2`\x82\x00\x00\x00\x00IEND\xaeB`\x82"
)


class Result:
    def __init__(self, matched_count=0, modified_count=0, upserted_id=None):
        self.matched_count = matched_count
        self.modified_count = modified_count
        self.upserted_id = upserted_id


class MemoryCollection:
    def __init__(self):
        self.documents = []

    def create_index(self, *args, **kwargs):
        return None

    def insert_one(self, document):
        stored_document = deepcopy(document)
        stored_document.setdefault("_id", ObjectId())
        self.documents.append(stored_document)
        return Result(upserted_id=stored_document["_id"])

    def find_one(self, query, projection=None, sort=None, **kwargs):
        matches = [
            document
            for document in self.documents
            if self._matches(document, query)
        ]

        if sort:
            for field_name, direction in reversed(sort):
                matches.sort(
                    key=lambda document: document.get(field_name),
                    reverse=direction < 0,
                )

        if not matches:
            return None

        return self._project(matches[0], projection)

    def update_one(self, query, update, upsert=False):
        for document in self.documents:
            if self._matches(document, query):
                self._apply_update(document, update)
                return Result(matched_count=1, modified_count=1)

        if not upsert:
            return Result()

        new_document = deepcopy(query)
        new_document.pop("$or", None)
        self._apply_update(new_document, update)
        new_document.setdefault("_id", ObjectId())
        self.documents.append(new_document)
        return Result(upserted_id=new_document["_id"])

    def update_many(self, query, update):
        matched_count = 0

        for document in self.documents:
            if self._matches(document, query):
                matched_count += 1
                self._apply_update(document, update)

        return Result(matched_count=matched_count, modified_count=matched_count)

    def delete_one(self, query):
        for index, document in enumerate(self.documents):
            if self._matches(document, query):
                del self.documents[index]
                return Result(matched_count=1, modified_count=1)

        return Result()

    def delete_many(self, query):
        before_count = len(self.documents)
        self.documents = [
            document
            for document in self.documents
            if not self._matches(document, query)
        ]
        deleted_count = before_count - len(self.documents)
        return Result(matched_count=deleted_count, modified_count=deleted_count)

    def _matches(self, document, query):
        return all(
            self._matches_or(document, value)
            if key == "$or"
            else self._matches_field(document, key, value)
            for key, value in query.items()
        )

    def _matches_or(self, document, queries):
        return any(self._matches(document, query) for query in queries)

    def _matches_field(self, document, key, value):
        document_value = document.get(key)

        if isinstance(value, dict):
            if "$gt" in value:
                return document_value is not None and document_value > value["$gt"]

            raise AssertionError(f"Unsupported query operator for {key}: {value}")

        return document_value == value

    def _apply_update(self, document, update):
        if "$set" not in update:
            raise AssertionError(f"Unsupported update: {update}")

        document.update(deepcopy(update["$set"]))

    def _project(self, document, projection):
        projected_document = deepcopy(document)

        if not projection:
            return projected_document

        if all(value in (0, False) for value in projection.values()):
            for field_name, include_field in projection.items():
                if include_field in (0, False):
                    projected_document.pop(field_name, None)
            return projected_document

        return {
            field_name: projected_document[field_name]
            for field_name, include_field in projection.items()
            if include_field and field_name in projected_document
        }


def assert_status(response, expected_status: int, label: str):
    if response.status_code != expected_status:
        raise AssertionError(
            f"{label} expected HTTP {expected_status}, got "
            f"{response.status_code}: {response.text}"
        )


def assert_hashed_token_exists(account_tokens, user_id: str, purpose: str):
    token_document = account_tokens.find_one(
        {
            "user_id": user_id,
            "purpose": purpose,
            "used_at": None,
        },
        sort=[("created_at", -1)],
    )

    if token_document is None:
        raise AssertionError(f"Missing {purpose} token document")

    if token_document.get("token_hash") == token_document.get("token"):
        raise AssertionError(f"{purpose} token was stored unsafely")

    if "token" in token_document:
        raise AssertionError(f"{purpose} raw token was stored")


def run_smoke():
    users = MemoryCollection()
    profiles = MemoryCollection()
    account_tokens = MemoryCollection()

    main.get_users_or_503 = lambda: users
    main.get_profiles_or_503 = lambda: profiles
    main.get_account_tokens_or_503 = lambda: account_tokens
    dependencies.get_users_or_503 = lambda: users

    client = TestClient(main.app)

    suffix = uuid4().hex[:12]
    email = f"codex.account.{suffix}@example.com"
    username = f"codex_{suffix}"
    original_password = "CoVoyageSmoke123!"
    changed_password = "CoVoyageSmoke456!"
    reset_password = "CoVoyageSmoke789!"

    user_id = None
    profile_image_url = None

    try:
        register_response = client.post(
            "/register",
            json={
                "name": "Codex Smoke",
                "username": username,
                "email": email,
                "password": original_password,
            },
        )
        assert_status(register_response, 200, "register")

        login_response = client.post(
            "/login",
            json={"email": email.upper(), "password": original_password},
        )
        assert_status(login_response, 200, "login")
        token = login_response.json()["access_token"]
        auth_headers = {"Authorization": f"Bearer {token}"}

        session_response = client.get("/auth/session", headers=auth_headers)
        assert_status(session_response, 200, "auth session")
        user_id = session_response.json()["user"]["id"]

        account_response = client.get("/account", headers=auth_headers)
        assert_status(account_response, 200, "account")

        image_response = client.post(
            "/profile/image",
            headers=auth_headers,
            json={
                "file_name": "avatar.png",
                "content_type": "image/png",
                "content_base64": b64encode(ONE_BY_ONE_PNG).decode("ascii"),
            },
        )
        assert_status(image_response, 200, "profile image upload")
        profile_image_url = image_response.json()["profile_picture_url"]

        change_response = client.patch(
            "/account/password",
            headers=auth_headers,
            json={
                "current_password": original_password,
                "new_password": changed_password,
                "confirm_password": changed_password,
            },
        )
        assert_status(change_response, 200, "password change")

        old_login_response = client.post(
            "/login",
            json={"email": email, "password": original_password},
        )
        assert_status(old_login_response, 401, "old password rejected")

        new_login_response = client.post(
            "/login",
            json={"email": email, "password": changed_password},
        )
        assert_status(new_login_response, 200, "new password login")

        verify_request_response = client.post(
            "/account/email/verification/request",
            headers=auth_headers,
        )
        assert_status(
            verify_request_response,
            200,
            "email verification request",
        )
        assert_hashed_token_exists(
            account_tokens,
            user_id,
            EMAIL_VERIFICATION_PURPOSE,
        )

        user_document = users.find_one({"email": email})
        if user_document is None:
            raise AssertionError("Smoke user was not found for token creation")

        verification_token = create_account_token(
            account_tokens,
            user_document,
            EMAIL_VERIFICATION_PURPOSE,
            EMAIL_VERIFICATION_EXPIRY,
        )
        verify_confirm_response = client.post(
            "/account/email/verification/confirm",
            json={"token": verification_token},
        )
        assert_status(
            verify_confirm_response,
            200,
            "email verification confirm",
        )
        verified_user = users.find_one({"email": email})
        if verified_user.get("email_verified") is not True:
            raise AssertionError("Email was not marked verified")

        reset_request_response = client.post(
            "/account/password-reset/request",
            json={"email": email},
        )
        assert_status(reset_request_response, 200, "password reset request")
        assert_hashed_token_exists(account_tokens, user_id, PASSWORD_RESET_PURPOSE)

        reset_token = create_account_token(
            account_tokens,
            user_document,
            PASSWORD_RESET_PURPOSE,
            PASSWORD_RESET_EXPIRY,
        )
        reset_confirm_response = client.post(
            "/account/password-reset/confirm",
            json={
                "token": reset_token,
                "new_password": reset_password,
                "confirm_password": reset_password,
            },
        )
        assert_status(reset_confirm_response, 200, "password reset confirm")

        changed_login_response = client.post(
            "/login",
            json={"email": email, "password": changed_password},
        )
        assert_status(changed_login_response, 401, "changed password rejected")

        reset_login_response = client.post(
            "/login",
            json={"email": email, "password": reset_password},
        )
        assert_status(reset_login_response, 200, "reset password login")

        print("account smoke passed")
    finally:
        if user_id:
            users.delete_one({"_id": ObjectId(user_id)})
            users.delete_one({"email": email})
            profiles.delete_one({"user_id": user_id})
            account_tokens.delete_many({"user_id": user_id})

        if profile_image_url:
            relative_image_path = profile_image_url.removeprefix("/media/")
            image_path = (
                Path(main.MEDIA_ROOT)
                / Path(*relative_image_path.split("/"))
            )
            if image_path.exists():
                image_path.unlink()


if __name__ == "__main__":
    run_smoke()
