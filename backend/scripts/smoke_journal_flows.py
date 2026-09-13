from __future__ import annotations

from copy import deepcopy
from pathlib import Path
import sys

from bson import ObjectId
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import main
from routers import blogs as blogs_router


class WriteResult:
    def __init__(self, inserted_id=None, matched_count=0, modified_count=0):
        self.inserted_id = inserted_id
        self.matched_count = matched_count
        self.modified_count = modified_count


class MemoryCursor:
    def __init__(self, documents):
        self.documents = documents

    def sort(self, field_name, direction):
        self.documents.sort(
            key=lambda document: document.get(field_name),
            reverse=direction < 0,
        )
        return self

    def __iter__(self):
        return iter(deepcopy(self.documents))


class MemoryBlogsCollection:
    def __init__(self):
        self.documents = []

    def find_one(self, query):
        for document in self.documents:
            if self._matches(document, query):
                return deepcopy(document)

        return None

    def find(self, query):
        return MemoryCursor([
            deepcopy(document)
            for document in self.documents
            if self._matches(document, query)
        ])

    def insert_one(self, document):
        stored_document = deepcopy(document)
        stored_document.setdefault("_id", ObjectId())
        self.documents.append(stored_document)
        return WriteResult(inserted_id=stored_document["_id"])

    def update_one(self, query, update):
        for document in self.documents:
            if self._matches(document, query):
                document.update(deepcopy(update["$set"]))
                return WriteResult(matched_count=1, modified_count=1)

        return WriteResult()

    def delete_one(self, query):
        for index, document in enumerate(self.documents):
            if self._matches(document, query):
                del self.documents[index]
                return WriteResult(matched_count=1, modified_count=1)

        return WriteResult()

    def count_documents(self, query):
        return sum(1 for document in self.documents if self._matches(document, query))

    def _matches(self, document, query):
        return all(self._matches_field(document, key, value) for key, value in query.items())

    def _matches_field(self, document, key, value):
        document_value = document.get(key)

        if isinstance(value, dict):
            if "$ne" in value:
                return document_value != value["$ne"]

            raise AssertionError(f"Unsupported query operator for {key}: {value}")

        return document_value == value


def assert_status(response, expected_status: int, label: str):
    if response.status_code != expected_status:
        raise AssertionError(
            f"{label} expected HTTP {expected_status}, got "
            f"{response.status_code}: {response.text}"
        )


def journal_payload(title: str, status: str):
    return {
        "title": title,
        "content": (
            "This is a focused CoVoyage journal test entry with enough "
            "content to satisfy backend validation."
        ),
        "excerpt": f"{title} excerpt",
        "tags": ["test", "journal"],
        "category": "stories",
        "status": status,
    }


def run_smoke():
    blogs = MemoryBlogsCollection()
    owner = {
        "_id": ObjectId(),
        "name": "Journal Owner",
        "email": "journal.owner@example.com",
    }
    other_user = {
        "_id": ObjectId(),
        "name": "Other Traveler",
        "email": "other.traveler@example.com",
    }
    current_user = {"value": owner}

    def get_test_user():
        return current_user["value"]

    previous_get_blogs_or_503 = blogs_router.get_blogs_or_503
    blogs_router.get_blogs_or_503 = lambda: blogs
    main.app.dependency_overrides[blogs_router.get_current_user] = get_test_user

    client = TestClient(main.app)

    try:
        create_published = client.post(
            "/blogs",
            json=journal_payload("Published Journal", "published"),
            headers={"Authorization": "Bearer test-token"},
        )
        assert_status(create_published, 201, "create published journal")
        published_blog = create_published.json()

        public_list = client.get("/blogs")
        assert_status(public_list, 200, "published journal list")
        if published_blog["id"] not in [blog["id"] for blog in public_list.json()]:
            raise AssertionError("Published journal was not publicly visible")

        public_slug = client.get(f"/blogs/slug/{published_blog['slug']}")
        assert_status(public_slug, 200, "published journal slug lookup")

        create_draft = client.post(
            "/blogs",
            json=journal_payload("Draft Journal", "draft"),
            headers={"Authorization": "Bearer test-token"},
        )
        assert_status(create_draft, 201, "create draft")
        draft_blog = create_draft.json()

        public_draft = client.get(f"/blogs/slug/{draft_blog['slug']}")
        assert_status(public_draft, 404, "draft remains private by slug")

        public_ids = [blog["id"] for blog in client.get("/blogs").json()]
        if draft_blog["id"] in public_ids:
            raise AssertionError("Draft journal appeared in public list")

        update_draft = client.put(
            f"/blogs/{draft_blog['id']}",
            json={
                "title": "Updated Draft Journal",
                "content": (
                    "This existing draft was updated instead of creating "
                    "another journal document."
                ),
            },
            headers={"Authorization": "Bearer test-token"},
        )
        assert_status(update_draft, 200, "update existing draft")
        if update_draft.json()["id"] != draft_blog["id"]:
            raise AssertionError("Draft update returned a different journal ID")

        if blogs.count_documents({"author_id": str(owner["_id"])}) != 2:
            raise AssertionError("Updating a draft created an extra journal")

        publish_draft = client.put(
            f"/blogs/{draft_blog['id']}",
            json={"status": "published"},
            headers={"Authorization": "Bearer test-token"},
        )
        assert_status(publish_draft, 200, "publish existing draft")
        if publish_draft.json()["status"] != "published":
            raise AssertionError("Draft was not marked published")

        published_draft = client.get(f"/blogs/slug/{publish_draft.json()['slug']}")
        assert_status(published_draft, 200, "published draft is public")

        edit_journal = client.put(
            f"/blogs/{published_blog['id']}",
            json={
                "title": "Edited Published Journal",
                "content": (
                    "This published journal was edited through the owner-only "
                    "update endpoint."
                ),
            },
            headers={"Authorization": "Bearer test-token"},
        )
        assert_status(edit_journal, 200, "edit journal")
        if edit_journal.json()["title"] != "Edited Published Journal":
            raise AssertionError("Journal edit did not persist")

        current_user["value"] = other_user

        non_owner_edit = client.put(
            f"/blogs/{published_blog['id']}",
            json={"title": "Unauthorized Edit"},
            headers={"Authorization": "Bearer test-token"},
        )
        assert_status(non_owner_edit, 403, "non-owner cannot edit")

        non_owner_delete = client.delete(
            f"/blogs/{published_blog['id']}",
            headers={"Authorization": "Bearer test-token"},
        )
        assert_status(non_owner_delete, 403, "non-owner cannot delete")

        current_user["value"] = owner

        delete_journal = client.delete(
            f"/blogs/{published_blog['id']}",
            headers={"Authorization": "Bearer test-token"},
        )
        assert_status(delete_journal, 204, "delete journal")

        deleted_lookup = client.get(f"/blogs/slug/{published_blog['slug']}")
        assert_status(deleted_lookup, 404, "deleted journal is removed")

        print("journal smoke passed")
    finally:
        blogs_router.get_blogs_or_503 = previous_get_blogs_or_503
        main.app.dependency_overrides.pop(blogs_router.get_current_user, None)


if __name__ == "__main__":
    run_smoke()
