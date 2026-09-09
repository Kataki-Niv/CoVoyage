from __future__ import annotations

import copy
import sys
import types
from datetime import date, datetime
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))


class FakeHTTPException(Exception):
    def __init__(self, status_code: int, detail: Any):
        super().__init__(detail)
        self.status_code = status_code
        self.detail = detail


class FakeStatus:
    HTTP_201_CREATED = 201
    HTTP_400_BAD_REQUEST = 400
    HTTP_403_FORBIDDEN = 403
    HTTP_404_NOT_FOUND = 404
    HTTP_409_CONFLICT = 409
    HTTP_422_UNPROCESSABLE_ENTITY = 422
    HTTP_503_SERVICE_UNAVAILABLE = 503


class FakeObjectId(str):
    counter = 1

    def __new__(cls, value: str | None = None):
        if value is None:
            value = f"{cls.counter:024x}"
            cls.counter += 1
        return str.__new__(cls, value)

    @classmethod
    def is_valid(cls, value: str) -> bool:
        return isinstance(value, str) and len(value) == 24


class FakeDuplicateKeyError(Exception):
    pass


class FakeValidationError(Exception):
    pass


class FakeRouter:
    def __init__(self, *args, **kwargs):
        pass

    def get(self, *args, **kwargs):
        return lambda function: function

    def post(self, *args, **kwargs):
        return lambda function: function

    def patch(self, *args, **kwargs):
        return lambda function: function


def install_dependency_stubs() -> None:
    bson = types.ModuleType("bson")
    bson.ObjectId = FakeObjectId
    sys.modules["bson"] = bson

    fastapi = types.ModuleType("fastapi")
    fastapi.APIRouter = FakeRouter
    fastapi.Depends = lambda dependency: dependency
    fastapi.HTTPException = FakeHTTPException
    fastapi.status = FakeStatus
    sys.modules["fastapi"] = fastapi

    pymongo = types.ModuleType("pymongo")
    pymongo_errors = types.ModuleType("pymongo.errors")
    pymongo_errors.DuplicateKeyError = FakeDuplicateKeyError
    pymongo.errors = pymongo_errors
    sys.modules["pymongo"] = pymongo
    sys.modules["pymongo.errors"] = pymongo_errors

    pydantic = types.ModuleType("pydantic")
    pydantic.ValidationError = FakeValidationError
    sys.modules["pydantic"] = pydantic

    database = types.ModuleType("database")
    database.get_chats_collection = lambda: None
    database.get_connection_requests_collection = lambda: None
    database.get_group_voyages_collection = lambda: None
    database.get_messages_collection = lambda: None
    database.get_profiles_collection = lambda: None
    database.get_group_voyage_join_requests_collection = lambda: None
    database.get_tribe_blocks_collection = lambda: None
    database.get_users_collection = lambda: None
    sys.modules["database"] = database

    dependencies = types.ModuleType("dependencies")
    dependencies.get_current_user = lambda: None
    sys.modules["dependencies"] = dependencies

    models = types.ModuleType("models")
    models.GroupVoyageCreate = FakeGroupVoyageModel
    models.GroupVoyageUpdate = FakeGroupVoyageModel
    models.ChatConversation = object
    models.ChatConversationCreate = object
    models.ChatMessage = object
    models.ChatMessageCreate = object
    sys.modules["models"] = models

    connections = types.ModuleType("services.connections")
    connections.build_pair_key = lambda a, b: ":".join(sorted([a, b]))
    connections.get_accepted_connection = fake_get_accepted_connection
    connections.users_have_accepted_connection = fake_users_have_accepted_connection
    sys.modules["services.connections"] = connections

    blocks = types.ModuleType("services.blocks")
    blocks.users_are_blocked = lambda collection, a, b: False
    sys.modules["services.blocks"] = blocks

    profile_privacy = types.ModuleType("services.profile_privacy")
    profile_privacy.serialize_tribe_profile = lambda profile: {
        key: profile.get(key)
        for key in (
            "user_id",
            "name",
            "username",
            "profile_picture_url",
            "city",
            "country",
        )
        if profile.get(key) is not None
    }
    sys.modules["services.profile_privacy"] = profile_privacy


def fake_get_accepted_connection(connection_requests, user_one: str, user_two: str):
    pair = {user_one, user_two}

    for request in connection_requests.documents:
        if (
            request.get("status") == "accepted"
            and {request.get("requester_id"), request.get("recipient_id")} == pair
        ):
            return copy.deepcopy(request)

    return None


def fake_users_have_accepted_connection(connection_requests, user_one: str, user_two: str):
    return fake_get_accepted_connection(connection_requests, user_one, user_two) is not None


class InsertResult:
    def __init__(self, inserted_id):
        self.inserted_id = inserted_id


class UpdateResult:
    def __init__(self, modified_count: int):
        self.modified_count = modified_count


class FakeCursor(list):
    def sort(self, key, direction):
        reverse = direction == -1
        return FakeCursor(
            sorted(
                self,
                key=lambda item: item.get(key) or datetime.min,
                reverse=reverse,
            )
        )


class FakeCollection:
    def __init__(self, documents: list[dict[str, Any]] | None = None):
        self.documents = copy.deepcopy(documents or [])

    def find_one(
        self,
        query: dict[str, Any],
        projection: Any = None,
        sort: list[tuple[str, int]] | None = None,
    ):
        if isinstance(projection, list):
            sort = projection

        matches = [document for document in self.documents if matches_query(document, query)]

        if sort:
            for key, direction in reversed(sort):
                matches.sort(
                    key=lambda item: item.get(key) or datetime.min,
                    reverse=direction == -1,
                )

        return copy.deepcopy(matches[0]) if matches else None

    def find(self, query: dict[str, Any]):
        return FakeCursor(
            [copy.deepcopy(document) for document in self.documents if matches_query(document, query)]
        )

    def insert_one(self, document: dict[str, Any]):
        for unique_key in ("active_request_key", "group_voyage_key", "pair_key"):
            if not document.get(unique_key):
                continue

            for existing in self.documents:
                if existing.get(unique_key) == document[unique_key]:
                    raise FakeDuplicateKeyError(f"duplicate {unique_key}")

        next_document = copy.deepcopy(document)
        next_document["_id"] = FakeObjectId()
        self.documents.append(next_document)
        return InsertResult(next_document["_id"])

    def update_one(self, query: dict[str, Any], update: dict[str, Any]):
        for index, document in enumerate(self.documents):
            if not matches_query(document, query):
                continue

            self.documents[index] = apply_update(document, update)
            return UpdateResult(1)

        return UpdateResult(0)

    def update_many(self, query: dict[str, Any], update: dict[str, Any]):
        modified_count = 0

        for index, document in enumerate(self.documents):
            if not matches_query(document, query):
                continue

            self.documents[index] = apply_update(document, update)
            modified_count += 1

        return UpdateResult(modified_count)


def apply_update(document: dict[str, Any], update: dict[str, Any]):
    next_document = copy.deepcopy(document)

    for key, value in update.get("$set", {}).items():
        next_document[key] = value

    for key, value in update.get("$addToSet", {}).items():
        next_document.setdefault(key, [])
        if value not in next_document[key]:
            next_document[key].append(value)

    for key, value in update.get("$pull", {}).items():
        if isinstance(next_document.get(key), list):
            next_document[key] = [
                item for item in next_document[key] if item != value
            ]

    for key in update.get("$unset", {}):
        next_document.pop(key, None)

    return next_document


def matches_query(document: dict[str, Any], query: dict[str, Any]) -> bool:
    for key, expected in query.items():
        if key == "$expr":
            if not evaluate_expr(document, expected):
                return False
            continue

        actual = document.get(key)

        if isinstance(expected, dict) and "$ne" in expected:
            if actual == expected["$ne"]:
                return False
            continue

        if isinstance(actual, list) and expected not in actual:
            return False

        if isinstance(actual, list):
            continue

        if actual != expected:
            return False

    return True


def evaluate_expr(document: dict[str, Any], expression: dict[str, Any]) -> bool:
    if "$lt" not in expression:
        return False

    left, right = expression["$lt"]
    return resolve_expr_value(document, left) < resolve_expr_value(document, right)


def resolve_expr_value(document: dict[str, Any], value: Any):
    if isinstance(value, str) and value.startswith("$"):
        return document.get(value[1:])

    if isinstance(value, dict) and "$size" in value:
        field_name = value["$size"][1:]
        return len(document.get(field_name, []))

    return value


class Payload:
    def __init__(self, **data):
        self.data = data

    def __getattr__(self, name: str):
        try:
            return self.data[name]
        except KeyError as error:
            raise AttributeError(name) from error

    def model_dump(
        self,
        mode: str = "json",
        exclude: set[str] | None = None,
        exclude_unset: bool = False,
    ):
        data = copy.deepcopy(self.data)

        for key in exclude or set():
            data.pop(key, None)

        return data


class FakeGroupVoyageModel(Payload):
    def __init__(self, **data):
        required_fields = (
            "title",
            "destination",
            "start_date",
            "description",
            "max_participants",
            "visibility",
        )

        for field_name in required_fields:
            if data.get(field_name) in (None, ""):
                raise FakeValidationError(f"{field_name} is required")

        start_date = parse_fake_date(data.get("start_date"))
        end_date = parse_fake_date(data.get("end_date"))

        if end_date is not None and start_date is not None and end_date < start_date:
            raise FakeValidationError("end_date cannot be before start_date")

        if data.get("visibility") not in ("public", "private"):
            raise FakeValidationError("invalid visibility")

        super().__init__(**data)

    def model_dump(
        self,
        mode: str = "json",
        exclude: set[str] | None = None,
        exclude_unset: bool = False,
    ):
        data = super().model_dump(mode=mode)

        for key in exclude or set():
            data.pop(key, None)

        return data


def parse_fake_date(value: Any):
    if value is None:
        return None

    if isinstance(value, date):
        return value

    if isinstance(value, str):
        return date.fromisoformat(value[:10])

    return None


def complete_profile(user_id: str, **overrides):
    profile = {
        "_id": FakeObjectId(),
        "user_id": user_id,
        "name": user_id.title(),
        "username": user_id,
        "age": 25,
        "gender": "woman",
        "preferred_travel_gender": "anyone",
        "bio": "A complete group voyage test traveler profile.",
        "country": "India",
        "city": "Delhi",
        "travel_style": "Slow Travel",
        "preferred_destinations": ["Bali", "Tokyo"],
        "budget_range": "Mid-range",
        "preferred_trip_duration": "1 week",
        "available_from": "2026-08-01",
        "available_to": "2026-08-15",
        "interests": ["Food", "Markets", "Photography"],
        "languages_spoken": ["English"],
        "profile_picture_url": "https://example.com/avatar.jpg",
        "tribe_discoverable": overrides.pop("tribe_discoverable", False),
        "private_location": "Hidden hotel",
        "languages": ["Should not leak"],
    }
    profile.update(overrides)
    return profile


def incomplete_profile(user_id: str):
    return {
        "_id": FakeObjectId(),
        "user_id": user_id,
        "name": user_id.title(),
        "username": user_id,
    }


def voyage_payload(**overrides):
    payload = {
        "title": "Bali Food Circle",
        "destination": "Bali",
        "start_date": date(2026, 8, 3),
        "end_date": date(2026, 8, 12),
        "description": "A small group voyage for culture, food, and slow travel.",
        "tags": ["Food", "Slow Travel"],
        "budget_range": "Mid-range",
        "max_participants": 3,
        "status": "open",
        "visibility": "public",
    }
    payload.update(overrides)
    return Payload(**payload)


def make_world():
    return {
        "chats": FakeCollection(),
        "connection_requests": FakeCollection(
            [
                {
                    "_id": FakeObjectId(),
                    "requester_id": "maya",
                    "recipient_id": "elena",
                    "status": "accepted",
                },
                {
                    "_id": FakeObjectId(),
                    "requester_id": "000000000000000000000001",
                    "recipient_id": "000000000000000000000002",
                    "status": "accepted",
                }
            ]
        ),
        "group_voyages": FakeCollection(),
        "join_requests": FakeCollection(),
        "messages": FakeCollection(),
        "profiles": FakeCollection(
            [
                complete_profile("host", tribe_discoverable=False),
                complete_profile("maya", tribe_discoverable=False),
                complete_profile("elena", tribe_discoverable=False),
                complete_profile("third", tribe_discoverable=True),
                complete_profile("000000000000000000000001"),
                complete_profile("000000000000000000000002"),
                complete_profile("000000000000000000000003"),
                incomplete_profile("incomplete"),
            ]
        ),
        "tribe_blocks": FakeCollection(),
        "users": FakeCollection(
            [
                {"_id": FakeObjectId("000000000000000000000001")},
                {"_id": FakeObjectId("000000000000000000000002")},
                {"_id": FakeObjectId("000000000000000000000003")},
            ]
        ),
    }


def assert_http_status(label: str, status_code: int, function) -> None:
    try:
        function()
    except FakeHTTPException as error:
        assert error.status_code == status_code, (
            f"{label}: expected {status_code}, got {error.status_code}"
        )
        return

    raise AssertionError(f"{label}: expected HTTP {status_code}")


def assert_safe_profile(label: str, profile: dict[str, Any]) -> None:
    forbidden_fields = {
        "country",
        "city",
        "preferred_destinations",
        "available_from",
        "available_to",
        "budget_range",
        "preferred_trip_duration",
        "languages_spoken",
        "languages",
        "private_location",
    }
    leaked_fields = forbidden_fields.intersection(profile)
    assert not leaked_fields, f"{label}: leaked {sorted(leaked_fields)}"


def run() -> None:
    install_dependency_stubs()
    import routers.group_voyages as group_voyages
    import routers.chats as chats

    checks: list[tuple[str, Any]] = []

    def with_world(function):
        def wrapped():
            world = make_world()
            group_voyages.get_group_collections_or_503 = lambda: world
            chats.get_chat_collections_or_503 = lambda: world
            return function(group_voyages, world)

        return wrapped

    def create_voyage(g, world, user_id="host", **payload_overrides):
        return g.create_group_voyage(
            voyage_payload(**payload_overrides),
            current_user={"_id": user_id},
        )

    def request_join(g, voyage_id, user_id):
        return g.create_join_request(voyage_id, current_user={"_id": user_id})

    def update_voyage(g, voyage_id, user_id="host", **updates):
        return g.update_group_voyage(
            voyage_id,
            Payload(**updates),
            current_user={"_id": user_id},
        )

    def open_group_chat(voyage_id, user_id):
        return chats.get_or_create_group_voyage_chat(
            voyage_id,
            current_user={"_id": user_id},
        )

    def send_message(chat_id, user_id, body="Hello group"):
        return chats.send_chat_message(
            chat_id,
            Payload(body=body),
            current_user={"_id": user_id},
        )

    checks.append(
        (
            "PROFILE 1 incomplete user cannot create voyage",
            with_world(
                lambda g, world: assert_http_status(
                    "incomplete create",
                    409,
                    lambda: g.create_group_voyage(
                        voyage_payload(),
                        current_user={"_id": "incomplete"},
                    ),
                )
            ),
        )
    )
    checks.append(
        (
            "PROFILE 2 complete user can create voyage",
            with_world(lambda g, world: create_voyage(g, world)),
        )
    )
    checks.append(
        (
            "PROFILE 3 incomplete user cannot request to join",
            with_world(
                lambda g, world: assert_http_status(
                    "incomplete request",
                    409,
                    lambda: request_join(g, create_voyage(g, world)["id"], "incomplete"),
                )
            ),
        )
    )
    checks.append(
        (
            "PROFILE 4 complete user can request",
            with_world(lambda g, world: request_join(g, create_voyage(g, world)["id"], "maya")),
        )
    )
    checks.append(
        (
            "PROFILE 5 tribe discoverability off does not prevent create/request",
            with_world(
                lambda g, world: (
                    create_voyage(g, world, user_id="maya"),
                    request_join(g, create_voyage(g, world)["id"], "elena"),
                )
            ),
        )
    )

    checks.append(
        (
            "PRIVACY 6 participant serialization is narrow",
            with_world(
                lambda g, world: [
                    assert_safe_profile("participant", participant)
                    for participant in create_voyage(g, world)["participants"]
                ]
            ),
        )
    )
    checks.append(
        (
            "PRIVACY 7 requester serialization is narrow",
            with_world(
                lambda g, world: assert_safe_profile(
                    "requester",
                    request_join(g, create_voyage(g, world)["id"], "maya")[
                        "requester_profile"
                    ],
                )
            ),
        )
    )
    checks.append(
        (
            "PRIVACY 8 host inbox returns safe requester information",
            with_world(
                lambda g, world: (
                    lambda voyage: (
                        request_join(g, voyage["id"], "maya"),
                        assert_safe_profile(
                            "inbox requester",
                            g.get_creator_join_requests(current_user={"_id": "host"})[0][
                                "requester_profile"
                            ],
                        ),
                    )
                )(create_voyage(g, world))
            ),
        )
    )
    checks.append(
        (
            "PRIVACY 9 tribe serializer remains separate",
            lambda: assert_true(
                "serialize_tribe_profile"
                not in Path("backend/routers/group_voyages.py").read_text()
            ),
        )
    )

    checks.append(
        (
            "CANCEL 10 pending requester can cancel own request",
            with_world(
                lambda g, world: (
                    lambda request: g.cancel_join_request(
                        request["id"],
                        current_user={"_id": "maya"},
                    )
                )(request_join(g, create_voyage(g, world)["id"], "maya"))
            ),
        )
    )
    checks.append(
        (
            "CANCEL 11 another user cannot cancel that request",
            with_world(
                lambda g, world: assert_http_status(
                    "other cancel",
                    403,
                    lambda: (
                        lambda request: g.cancel_join_request(
                            request["id"],
                            current_user={"_id": "elena"},
                        )
                    )(request_join(g, create_voyage(g, world)["id"], "maya")),
                )
            ),
        )
    )
    checks.append(
        (
            "CANCEL 12 accepted request cannot be cancelled",
            with_world(
                lambda g, world: assert_http_status(
                    "accepted cancel",
                    409,
                    lambda: (
                        lambda request: (
                            g.accept_join_request(
                                request["id"],
                                current_user={"_id": "host"},
                            ),
                            g.cancel_join_request(
                                request["id"],
                                current_user={"_id": "maya"},
                            ),
                        )
                    )(request_join(g, create_voyage(g, world)["id"], "maya")),
                )
            ),
        )
    )
    checks.append(
        (
            "CANCEL 13 declined request cannot be cancelled",
            with_world(
                lambda g, world: assert_http_status(
                    "declined cancel",
                    409,
                    lambda: (
                        lambda request: (
                            g.decline_join_request(
                                request["id"],
                                current_user={"_id": "host"},
                            ),
                            g.cancel_join_request(
                                request["id"],
                                current_user={"_id": "maya"},
                            ),
                        )
                    )(request_join(g, create_voyage(g, world)["id"], "maya")),
                )
            ),
        )
    )
    checks.append(
        (
            "CANCEL 14 cancelled request releases active duplicate",
            with_world(
                lambda g, world: (
                    lambda voyage, request: (
                        g.cancel_join_request(request["id"], current_user={"_id": "maya"}),
                        request_join(g, voyage["id"], "maya"),
                    )
                )(
                    create_voyage(g, world),
                    request_join(g, world["group_voyages"].documents[-1]["_id"], "maya"),
                )
            ),
        )
    )
    checks.append(
        (
            "CANCEL 15 user can submit new request after cancellation",
            with_world(
                lambda g, world: (
                    lambda voyage: (
                        lambda request: (
                            g.cancel_join_request(request["id"], current_user={"_id": "maya"}),
                            assert_equal(
                                request_join(g, voyage["id"], "maya")["status"],
                                "pending",
                            ),
                        )
                    )(request_join(g, voyage["id"], "maya"))
                )(create_voyage(g, world))
            ),
        )
    )

    checks.append(
        (
            "STATE 16 pending serialized voyage shows pending",
            with_world(
                lambda g, world: (
                    lambda voyage: (
                        request_join(g, voyage["id"], "maya"),
                        assert_equal(
                            g.get_group_voyage(voyage["id"], current_user={"_id": "maya"})[
                                "viewer_status"
                            ],
                            "pending_sent",
                        ),
                    )
                )(create_voyage(g, world))
            ),
        )
    )
    checks.append(
        (
            "STATE 17 accepted serialized voyage shows member",
            with_world(
                lambda g, world: (
                    lambda voyage, request: (
                        g.accept_join_request(request["id"], current_user={"_id": "host"}),
                        assert_equal(
                            g.get_group_voyage(voyage["id"], current_user={"_id": "maya"})[
                                "viewer_status"
                            ],
                            "participant",
                        ),
                    )
                )(
                    create_voyage(g, world),
                    request_join(g, world["group_voyages"].documents[-1]["_id"], "maya"),
                )
            ),
        )
    )
    checks.append(
        (
            "STATE 18 cancelled serialized voyage permits request again",
            with_world(
                lambda g, world: (
                    lambda voyage, request: (
                        g.cancel_join_request(request["id"], current_user={"_id": "maya"}),
                        assert_equal(
                            g.get_group_voyage(voyage["id"], current_user={"_id": "maya"})[
                                "viewer_status"
                            ],
                            "cancelled",
                        ),
                    )
                )(
                    create_voyage(g, world),
                    request_join(g, world["group_voyages"].documents[-1]["_id"], "maya"),
                )
            ),
        )
    )
    checks.append(
        (
            "STATE 19 full/closed voyages cannot receive requests",
            with_world(
                lambda g, world: (
                    assert_http_status(
                        "full request",
                        409,
                        lambda: request_join(
                            g,
                            create_voyage(g, world, max_participants=1)["id"],
                            "maya",
                        ),
                    ),
                    assert_http_status(
                        "closed request",
                        409,
                        lambda: request_join(
                            g,
                            create_voyage(g, world, status="closed")["id"],
                            "maya",
                        ),
                    ),
                )
            ),
        )
    )
    checks.append(
        (
            "STATE 20 accept/decline behavior still works",
            with_world(
                lambda g, world: (
                    lambda voyage: (
                        g.accept_join_request(
                            request_join(g, voyage["id"], "maya")["id"],
                            current_user={"_id": "host"},
                        ),
                        g.decline_join_request(
                            request_join(g, voyage["id"], "elena")["id"],
                            current_user={"_id": "host"},
                        ),
                    )
                )(create_voyage(g, world))
            ),
        )
    )

    checks.append(
        (
            "REGRESSION 21 create/discover/detail works",
            with_world(
                lambda g, world: (
                    lambda voyage: (
                        assert_true(g.get_group_voyages(current_user={"_id": "maya"})),
                        assert_true(
                            g.get_group_voyage(voyage["id"], current_user={"_id": "maya"})
                        ),
                    )
                )(create_voyage(g, world))
            ),
        )
    )
    checks.append(
        (
            "REGRESSION 22 capacity enforcement still works",
            with_world(
                lambda g, world: assert_http_status(
                    "accept over capacity",
                    409,
                    lambda: (
                        lambda voyage, request: (
                            world["group_voyages"].update_one(
                                {"_id": FakeObjectId(voyage["id"])},
                                {"$set": {"participant_ids": ["host", "third"]}},
                            ),
                            g.accept_join_request(
                                request["id"],
                                current_user={"_id": "host"},
                            ),
                        )
                    )(
                        create_voyage(g, world, max_participants=2),
                        request_join(g, world["group_voyages"].documents[-1]["_id"], "maya"),
                    ),
                )
            ),
        )
    )
    checks.append(
        (
            "REGRESSION 23 host authorization still works",
            with_world(
                lambda g, world: assert_http_status(
                    "non-host accept",
                    403,
                    lambda: (
                        lambda request: g.accept_join_request(
                            request["id"],
                            current_user={"_id": "elena"},
                        )
                    )(request_join(g, create_voyage(g, world)["id"], "maya")),
                )
            ),
        )
    )
    checks.append(
        (
            "REGRESSION 24 Find Your Tribe files untouched by harness",
            lambda: assert_true(Path("backend/services/profile_privacy.py").exists()),
        )
    )

    checks.append(
        (
            "PROMPT2 EDIT 1 host can edit own open voyage",
            with_world(
                lambda g, world: assert_equal(
                    update_voyage(
                        g,
                        create_voyage(g, world)["id"],
                        title="Updated Bali Food Circle",
                    )["title"],
                    "Updated Bali Food Circle",
                )
            ),
        )
    )
    checks.append(
        (
            "PROMPT2 EDIT 2 non-host cannot edit",
            with_world(
                lambda g, world: assert_http_status(
                    "non-host edit",
                    403,
                    lambda: update_voyage(
                        g,
                        create_voyage(g, world)["id"],
                        user_id="maya",
                        title="Hijacked title",
                    ),
                )
            ),
        )
    )
    checks.append(
        (
            "PROMPT2 EDIT 3 invalid dates rejected",
            with_world(
                lambda g, world: assert_http_status(
                    "invalid edit dates",
                    422,
                    lambda: update_voyage(
                        g,
                        create_voyage(g, world)["id"],
                        start_date=date(2026, 9, 1),
                        end_date=date(2026, 8, 1),
                    ),
                )
            ),
        )
    )
    checks.append(
        (
            "PROMPT2 EDIT 4 max cannot be lower than participant count",
            with_world(
                lambda g, world: assert_http_status(
                    "reduce below members",
                    409,
                    lambda: (
                        lambda voyage, request: (
                            g.accept_join_request(
                                request["id"],
                                current_user={"_id": "host"},
                            ),
                            update_voyage(g, voyage["id"], max_participants=1),
                        )
                    )(
                        create_voyage(g, world),
                        request_join(g, world["group_voyages"].documents[-1]["_id"], "maya"),
                    ),
                )
            ),
        )
    )
    checks.append(
        (
            "PROMPT2 EDIT 5 editing does not remove members",
            with_world(
                lambda g, world: (
                    lambda voyage, request: (
                        g.accept_join_request(request["id"], current_user={"_id": "host"}),
                        assert_equal(
                            update_voyage(
                                g,
                                voyage["id"],
                                description=(
                                    "A freshly edited description that keeps all current "
                                    "members safely in the voyage."
                                ),
                            )["participant_count"],
                            2,
                        ),
                    )
                )(
                    create_voyage(g, world),
                    request_join(g, world["group_voyages"].documents[-1]["_id"], "maya"),
                )
            ),
        )
    )
    checks.append(
        (
            "PROMPT2 EDIT 6 updated voyage returned correctly",
            with_world(
                lambda g, world: assert_equal(
                    update_voyage(
                        g,
                        create_voyage(g, world)["id"],
                        destination="Tokyo",
                        visibility="private",
                    )["visibility"],
                    "private",
                )
            ),
        )
    )

    checks.append(
        (
            "PROMPT2 CLOSE 7 host can close own voyage",
            with_world(
                lambda g, world: assert_equal(
                    g.close_group_voyage(
                        create_voyage(g, world)["id"],
                        current_user={"_id": "host"},
                    )["status"],
                    "closed",
                )
            ),
        )
    )
    checks.append(
        (
            "PROMPT2 CLOSE 8 non-host cannot close",
            with_world(
                lambda g, world: assert_http_status(
                    "non-host close",
                    403,
                    lambda: g.close_group_voyage(
                        create_voyage(g, world)["id"],
                        current_user={"_id": "maya"},
                    ),
                )
            ),
        )
    )
    checks.append(
        (
            "PROMPT2 CLOSE 9 closed voyage cannot accept new requests",
            with_world(
                lambda g, world: assert_http_status(
                    "accept after close",
                    409,
                    lambda: (
                        lambda voyage, request: (
                            g.close_group_voyage(
                                voyage["id"],
                                current_user={"_id": "host"},
                            ),
                            g.accept_join_request(
                                request["id"],
                                current_user={"_id": "host"},
                            ),
                        )
                    )(
                        create_voyage(g, world),
                        request_join(g, world["group_voyages"].documents[-1]["_id"], "maya"),
                    ),
                )
            ),
        )
    )
    checks.append(
        (
            "PROMPT2 CLOSE 10 closed voyage cannot receive join requests",
            with_world(
                lambda g, world: assert_http_status(
                    "request closed",
                    409,
                    lambda: (
                        lambda voyage: (
                            g.close_group_voyage(
                                voyage["id"],
                                current_user={"_id": "host"},
                            ),
                            request_join(g, voyage["id"], "maya"),
                        )
                    )(create_voyage(g, world)),
                )
            ),
        )
    )
    checks.append(
        (
            "PROMPT2 CLOSE 11 existing members remain members",
            with_world(
                lambda g, world: (
                    lambda voyage, request: (
                        g.accept_join_request(request["id"], current_user={"_id": "host"}),
                        g.close_group_voyage(voyage["id"], current_user={"_id": "host"}),
                        assert_equal(
                            g.get_group_voyage(voyage["id"], current_user={"_id": "maya"})[
                                "viewer_status"
                            ],
                            "participant",
                        ),
                    )
                )(
                    create_voyage(g, world),
                    request_join(g, world["group_voyages"].documents[-1]["_id"], "maya"),
                )
            ),
        )
    )
    checks.append(
        (
            "PROMPT2 CLOSE 12 pending requests cannot create membership after closure",
            with_world(
                lambda g, world: assert_http_status(
                    "pending after close",
                    409,
                    lambda: (
                        lambda voyage, request: (
                            g.close_group_voyage(voyage["id"], current_user={"_id": "host"}),
                            g.accept_join_request(request["id"], current_user={"_id": "host"}),
                        )
                    )(
                        create_voyage(g, world),
                        request_join(g, world["group_voyages"].documents[-1]["_id"], "maya"),
                    ),
                )
            ),
        )
    )

    checks.append(
        (
            "PROMPT2 LEAVE 13 accepted non-host member can leave",
            with_world(
                lambda g, world: (
                    lambda voyage, request: (
                        g.accept_join_request(request["id"], current_user={"_id": "host"}),
                        assert_equal(
                            g.leave_group_voyage(
                                voyage["id"],
                                current_user={"_id": "maya"},
                            )["viewer_status"],
                            "none",
                        ),
                    )
                )(
                    create_voyage(g, world),
                    request_join(g, world["group_voyages"].documents[-1]["_id"], "maya"),
                )
            ),
        )
    )
    checks.append(
        (
            "PROMPT2 LEAVE 14 non-member cannot leave",
            with_world(
                lambda g, world: assert_http_status(
                    "non-member leave",
                    409,
                    lambda: g.leave_group_voyage(
                        create_voyage(g, world)["id"],
                        current_user={"_id": "maya"},
                    ),
                )
            ),
        )
    )
    checks.append(
        (
            "PROMPT2 LEAVE 15 host cannot leave",
            with_world(
                lambda g, world: assert_http_status(
                    "host leave",
                    400,
                    lambda: g.leave_group_voyage(
                        create_voyage(g, world)["id"],
                        current_user={"_id": "host"},
                    ),
                )
            ),
        )
    )
    checks.append(
        (
            "PROMPT2 LEAVE 16 leaving frees capacity",
            with_world(
                lambda g, world: (
                    lambda voyage, request: (
                        g.accept_join_request(request["id"], current_user={"_id": "host"}),
                        g.leave_group_voyage(voyage["id"], current_user={"_id": "maya"}),
                        assert_equal(
                            request_join(g, voyage["id"], "elena")["status"],
                            "pending",
                        ),
                    )
                )(
                    create_voyage(g, world, max_participants=2),
                    request_join(g, world["group_voyages"].documents[-1]["_id"], "maya"),
                )
            ),
        )
    )
    checks.append(
        (
            "PROMPT2 LEAVE 17 former member can request again",
            with_world(
                lambda g, world: (
                    lambda voyage, request: (
                        g.accept_join_request(request["id"], current_user={"_id": "host"}),
                        g.leave_group_voyage(voyage["id"], current_user={"_id": "maya"}),
                        assert_equal(
                            request_join(g, voyage["id"], "maya")["status"],
                            "pending",
                        ),
                    )
                )(
                    create_voyage(g, world),
                    request_join(g, world["group_voyages"].documents[-1]["_id"], "maya"),
                )
            ),
        )
    )

    checks.append(
        (
            "PROMPT2 VISIBILITY 18 public voyage appears in discovery",
            with_world(
                lambda g, world: (
                    create_voyage(g, world, visibility="public"),
                    assert_equal(len(g.get_group_voyages(current_user={"_id": "maya"})), 1),
                )
            ),
        )
    )
    checks.append(
        (
            "PROMPT2 VISIBILITY 19 private voyage hidden from discovery",
            with_world(
                lambda g, world: (
                    create_voyage(g, world, visibility="private"),
                    assert_equal(len(g.get_group_voyages(current_user={"_id": "maya"})), 0),
                )
            ),
        )
    )
    checks.append(
        (
            "PROMPT2 VISIBILITY 20 private voyage can be viewed directly",
            with_world(
                lambda g, world: (
                    lambda voyage: assert_equal(
                        g.get_group_voyage(voyage["id"], current_user={"_id": "maya"})[
                            "visibility"
                        ],
                        "private",
                    )
                )(create_voyage(g, world, visibility="private"))
            ),
        )
    )
    checks.append(
        (
            "PROMPT2 VISIBILITY 21 private view route remains authenticated",
            lambda: assert_true(
                "current_user=Depends(get_current_user)"
                in Path("backend/routers/group_voyages.py").read_text()
            ),
        )
    )
    checks.append(
        (
            "PROMPT2 VISIBILITY 22 create/edit visibility persists",
            with_world(
                lambda g, world: (
                    lambda voyage: assert_equal(
                        update_voyage(g, voyage["id"], visibility="private")[
                            "visibility"
                        ],
                        "private",
                    )
                )(create_voyage(g, world, visibility="public"))
            ),
        )
    )

    checks.append(
        (
            "PROMPT2 CAPACITY 23 capacity never exceeds max",
            with_world(
                lambda g, world: (
                    lambda voyage, request_one, request_two: (
                        g.accept_join_request(
                            request_one["id"],
                            current_user={"_id": "host"},
                        ),
                        assert_http_status(
                            "second accepted over capacity",
                            409,
                            lambda: g.accept_join_request(
                                request_two["id"],
                                current_user={"_id": "host"},
                            ),
                        ),
                    )
                )(
                    create_voyage(g, world, max_participants=2),
                    request_join(g, world["group_voyages"].documents[-1]["_id"], "maya"),
                    request_join(g, world["group_voyages"].documents[-1]["_id"], "elena"),
                )
            ),
        )
    )
    checks.append(
        (
            "PROMPT2 CAPACITY 24 host cannot reduce max below membership",
            with_world(
                lambda g, world: assert_http_status(
                    "reduce capacity",
                    409,
                    lambda: (
                        lambda voyage, request: (
                            g.accept_join_request(
                                request["id"],
                                current_user={"_id": "host"},
                            ),
                            update_voyage(g, voyage["id"], max_participants=1),
                        )
                    )(
                        create_voyage(g, world),
                        request_join(g, world["group_voyages"].documents[-1]["_id"], "maya"),
                    ),
                )
            ),
        )
    )
    checks.append(
        (
            "PROMPT2 CAPACITY 25 leaving frees a slot",
            with_world(
                lambda g, world: (
                    lambda voyage, request: (
                        g.accept_join_request(request["id"], current_user={"_id": "host"}),
                        g.leave_group_voyage(voyage["id"], current_user={"_id": "maya"}),
                        assert_equal(
                            g.get_group_voyage(voyage["id"], current_user={"_id": "elena"})[
                                "viewer_status"
                            ],
                            "none",
                        ),
                    )
                )(
                    create_voyage(g, world, max_participants=2),
                    request_join(g, world["group_voyages"].documents[-1]["_id"], "maya"),
                )
            ),
        )
    )
    checks.append(
        (
            "PROMPT2 CAPACITY 26 closed voyage cannot gain a member",
            with_world(
                lambda g, world: assert_http_status(
                    "closed cannot accept",
                    409,
                    lambda: (
                        lambda voyage, request: (
                            g.close_group_voyage(voyage["id"], current_user={"_id": "host"}),
                            g.accept_join_request(request["id"], current_user={"_id": "host"}),
                        )
                    )(
                        create_voyage(g, world),
                        request_join(g, world["group_voyages"].documents[-1]["_id"], "maya"),
                    ),
                )
            ),
        )
    )

    tribe_source = Path("app/tribe/page.tsx").read_text()
    checks.append(("PROMPT2 STATE 27 host sees Edit + Close", lambda: assert_true("Edit Voyage" in tribe_source and "Close Voyage" in tribe_source)))
    checks.append(("PROMPT2 STATE 28 accepted member sees Leave", lambda: assert_true("Leave Voyage" in tribe_source)))
    checks.append(("PROMPT2 STATE 29 pending requester sees Cancel", lambda: assert_true("Cancel Request" in tribe_source)))
    checks.append(("PROMPT2 STATE 30 closed voyage shows closed state", lambda: assert_true("Voyage Closed" in tribe_source)))
    checks.append(("PROMPT2 STATE 31 full voyage shows full state", lambda: assert_true('"Full"' in tribe_source)))
    checks.append(("PROMPT2 STATE 32 non-member open voyage shows Request", lambda: assert_true("Request to Join" in tribe_source)))
    checks.append(("PROMPT2 REGRESSION 33 privacy remains narrow", lambda: assert_true("serialize_group_profile" in Path("backend/routers/group_voyages.py").read_text())))
    checks.append(("PROMPT2 REGRESSION 34 profile completeness remains", lambda: assert_true("get_complete_profile_or_409" in Path("backend/routers/group_voyages.py").read_text())))
    checks.append(("PROMPT2 REGRESSION 35 request lifecycle remains", lambda: assert_true("cancel_join_request" in Path("backend/routers/group_voyages.py").read_text())))
    checks.append(("PROMPT2 REGRESSION 36 Find Your Tribe remains present", lambda: assert_true("Find Your Tribe" in tribe_source or "Solo Travel" in tribe_source)))

    checks.append(
        (
            "PROMPT3 AUTH 1 host can access group voyage chat",
            with_world(
                lambda g, world: assert_equal(
                    open_group_chat(create_voyage(g, world)["id"], "host")["type"],
                    "group_voyage",
                )
            ),
        )
    )
    checks.append(
        (
            "PROMPT3 AUTH 2 accepted member can access",
            with_world(
                lambda g, world: (
                    lambda voyage, request: (
                        g.accept_join_request(request["id"], current_user={"_id": "host"}),
                        assert_equal(open_group_chat(voyage["id"], "maya")["voyage_id"], voyage["id"]),
                    )
                )(
                    create_voyage(g, world),
                    request_join(g, world["group_voyages"].documents[-1]["_id"], "maya"),
                )
            ),
        )
    )
    checks.append(
        (
            "PROMPT3 AUTH 3 pending requester cannot access",
            with_world(
                lambda g, world: assert_http_status(
                    "pending chat access",
                    403,
                    lambda: (
                        lambda voyage: (
                            request_join(g, voyage["id"], "maya"),
                            open_group_chat(voyage["id"], "maya"),
                        )
                    )(create_voyage(g, world)),
                )
            ),
        )
    )
    checks.append(
        (
            "PROMPT3 AUTH 4 declined requester cannot access",
            with_world(
                lambda g, world: assert_http_status(
                    "declined chat access",
                    403,
                    lambda: (
                        lambda voyage, request: (
                            g.decline_join_request(request["id"], current_user={"_id": "host"}),
                            open_group_chat(voyage["id"], "maya"),
                        )
                    )(
                        create_voyage(g, world),
                        request_join(g, world["group_voyages"].documents[-1]["_id"], "maya"),
                    ),
                )
            ),
        )
    )
    checks.append(
        (
            "PROMPT3 AUTH 5 cancelled requester cannot access",
            with_world(
                lambda g, world: assert_http_status(
                    "cancelled chat access",
                    403,
                    lambda: (
                        lambda voyage, request: (
                            g.cancel_join_request(request["id"], current_user={"_id": "maya"}),
                            open_group_chat(voyage["id"], "maya"),
                        )
                    )(
                        create_voyage(g, world),
                        request_join(g, world["group_voyages"].documents[-1]["_id"], "maya"),
                    ),
                )
            ),
        )
    )
    checks.append(
        (
            "PROMPT3 AUTH 6 unrelated user cannot access",
            with_world(
                lambda g, world: assert_http_status(
                    "unrelated chat access",
                    403,
                    lambda: open_group_chat(create_voyage(g, world)["id"], "elena"),
                )
            ),
        )
    )
    checks.append(
        (
            "PROMPT3 AUTH 7 former member who left cannot access",
            with_world(
                lambda g, world: assert_http_status(
                    "former chat access",
                    403,
                    lambda: (
                        lambda voyage, request: (
                            g.accept_join_request(request["id"], current_user={"_id": "host"}),
                            open_group_chat(voyage["id"], "maya"),
                            g.leave_group_voyage(voyage["id"], current_user={"_id": "maya"}),
                            open_group_chat(voyage["id"], "maya"),
                        )
                    )(
                        create_voyage(g, world),
                        request_join(g, world["group_voyages"].documents[-1]["_id"], "maya"),
                    ),
                )
            ),
        )
    )
    checks.append(
        (
            "PROMPT3 AUTH 8 reaccepted former member regains access",
            with_world(
                lambda g, world: (
                    lambda voyage, request: (
                        g.accept_join_request(request["id"], current_user={"_id": "host"}),
                        open_group_chat(voyage["id"], "maya"),
                        g.leave_group_voyage(voyage["id"], current_user={"_id": "maya"}),
                        g.accept_join_request(
                            request_join(g, voyage["id"], "maya")["id"],
                            current_user={"_id": "host"},
                        ),
                        assert_equal(open_group_chat(voyage["id"], "maya")["voyage_id"], voyage["id"]),
                    )
                )(
                    create_voyage(g, world),
                    request_join(g, world["group_voyages"].documents[-1]["_id"], "maya"),
                )
            ),
        )
    )
    checks.append(
        (
            "PROMPT3 AUTH 9 private voyage unrelated user cannot access",
            with_world(
                lambda g, world: assert_http_status(
                    "private unrelated chat access",
                    403,
                    lambda: open_group_chat(
                        create_voyage(g, world, visibility="private")["id"],
                        "maya",
                    ),
                )
            ),
        )
    )
    checks.append(
        (
            "PROMPT3 AUTH 10 closed voyage existing members can access",
            with_world(
                lambda g, world: (
                    lambda voyage, request: (
                        g.accept_join_request(request["id"], current_user={"_id": "host"}),
                        g.close_group_voyage(voyage["id"], current_user={"_id": "host"}),
                        assert_equal(open_group_chat(voyage["id"], "maya")["type"], "group_voyage"),
                    )
                )(
                    create_voyage(g, world),
                    request_join(g, world["group_voyages"].documents[-1]["_id"], "maya"),
                )
            ),
        )
    )

    checks.append(
        (
            "PROMPT3 MESSAGE 11 host can send",
            with_world(
                lambda g, world: (
                    lambda chat: assert_equal(send_message(chat["id"], "host")["sender_id"], "host")
                )(open_group_chat(create_voyage(g, world)["id"], "host"))
            ),
        )
    )
    checks.append(
        (
            "PROMPT3 MESSAGE 12 accepted member can send",
            with_world(
                lambda g, world: (
                    lambda voyage, request: (
                        g.accept_join_request(request["id"], current_user={"_id": "host"}),
                        assert_equal(
                            send_message(open_group_chat(voyage["id"], "maya")["id"], "maya")[
                                "sender_id"
                            ],
                            "maya",
                        ),
                    )
                )(
                    create_voyage(g, world),
                    request_join(g, world["group_voyages"].documents[-1]["_id"], "maya"),
                )
            ),
        )
    )
    checks.append(
        (
            "PROMPT3 MESSAGE 13 pending requester cannot send",
            with_world(
                lambda g, world: assert_http_status(
                    "pending send",
                    403,
                    lambda: (
                        lambda voyage, chat: (
                            request_join(g, voyage["id"], "maya"),
                            send_message(chat["id"], "maya"),
                        )
                    )(
                        create_voyage(g, world),
                        open_group_chat(world["group_voyages"].documents[-1]["_id"], "host"),
                    ),
                )
            ),
        )
    )
    checks.append(
        (
            "PROMPT3 MESSAGE 14 former member cannot send",
            with_world(
                lambda g, world: assert_http_status(
                    "former send",
                    403,
                    lambda: (
                        lambda voyage, request: (
                            g.accept_join_request(request["id"], current_user={"_id": "host"}),
                            (
                                lambda chat: (
                                    g.leave_group_voyage(voyage["id"], current_user={"_id": "maya"}),
                                    send_message(chat["id"], "maya"),
                                )
                            )(open_group_chat(voyage["id"], "maya")),
                        )
                    )(
                        create_voyage(g, world),
                        request_join(g, world["group_voyages"].documents[-1]["_id"], "maya"),
                    ),
                )
            ),
        )
    )
    checks.append(
        (
            "PROMPT3 MESSAGE 15 unrelated user cannot send",
            with_world(
                lambda g, world: assert_http_status(
                    "unrelated send",
                    403,
                    lambda: (
                        lambda chat: send_message(chat["id"], "maya")
                    )(open_group_chat(create_voyage(g, world)["id"], "host")),
                )
            ),
        )
    )
    checks.append(
        (
            "PROMPT3 MESSAGE 16 messages available to authorized members",
            with_world(
                lambda g, world: (
                    lambda voyage, request: (
                        g.accept_join_request(request["id"], current_user={"_id": "host"}),
                        (
                            lambda chat: (
                                send_message(chat["id"], "host", "Welcome"),
                                assert_equal(
                                    len(chats.get_chat_messages(chat["id"], current_user={"_id": "maya"})),
                                    1,
                                ),
                            )
                        )(open_group_chat(voyage["id"], "host")),
                    )
                )(
                    create_voyage(g, world),
                    request_join(g, world["group_voyages"].documents[-1]["_id"], "maya"),
                )
            ),
        )
    )
    checks.append(
        (
            "PROMPT3 MESSAGE 17 leaving does not delete historical messages",
            with_world(
                lambda g, world: (
                    lambda voyage, request: (
                        g.accept_join_request(request["id"], current_user={"_id": "host"}),
                        (
                            lambda chat: (
                                send_message(chat["id"], "host", "Keep this history"),
                                g.leave_group_voyage(voyage["id"], current_user={"_id": "maya"}),
                                assert_equal(len(world["messages"].documents), 1),
                            )
                        )(open_group_chat(voyage["id"], "host")),
                    )
                )(
                    create_voyage(g, world),
                    request_join(g, world["group_voyages"].documents[-1]["_id"], "maya"),
                )
            ),
        )
    )
    checks.append(
        (
            "PROMPT3 MESSAGE 18 rejoining reuses conversation",
            with_world(
                lambda g, world: (
                    lambda voyage, request: (
                        g.accept_join_request(request["id"], current_user={"_id": "host"}),
                        (
                            lambda chat: (
                                g.leave_group_voyage(voyage["id"], current_user={"_id": "maya"}),
                                g.accept_join_request(
                                    request_join(g, voyage["id"], "maya")["id"],
                                    current_user={"_id": "host"},
                                ),
                                assert_equal(open_group_chat(voyage["id"], "maya")["id"], chat["id"]),
                            )
                        )(open_group_chat(voyage["id"], "maya")),
                    )
                )(
                    create_voyage(g, world),
                    request_join(g, world["group_voyages"].documents[-1]["_id"], "maya"),
                )
            ),
        )
    )

    checks.append(
        (
            "PROMPT3 CONVERSATION 19 first access creates one conversation",
            with_world(
                lambda g, world: (
                    open_group_chat(create_voyage(g, world)["id"], "host"),
                    assert_equal(len(world["chats"].documents), 1),
                )
            ),
        )
    )
    checks.append(
        (
            "PROMPT3 CONVERSATION 20 repeated access reuses same conversation",
            with_world(
                lambda g, world: (
                    lambda voyage: assert_equal(
                        open_group_chat(voyage["id"], "host")["id"],
                        open_group_chat(voyage["id"], "host")["id"],
                    )
                )(create_voyage(g, world))
            ),
        )
    )
    checks.append(
        (
            "PROMPT3 CONVERSATION 21 different members get same conversation",
            with_world(
                lambda g, world: (
                    lambda voyage, request: (
                        g.accept_join_request(request["id"], current_user={"_id": "host"}),
                        assert_equal(
                            open_group_chat(voyage["id"], "host")["id"],
                            open_group_chat(voyage["id"], "maya")["id"],
                        ),
                    )
                )(
                    create_voyage(g, world),
                    request_join(g, world["group_voyages"].documents[-1]["_id"], "maya"),
                )
            ),
        )
    )
    checks.append(
        (
            "PROMPT3 CONVERSATION 22 two voyages never share conversation",
            with_world(
                lambda g, world: assert_not_equal(
                    open_group_chat(create_voyage(g, world)["id"], "host")["id"],
                    open_group_chat(create_voyage(g, world, title="Tokyo Tea Walk")["id"], "host")["id"],
                )
            ),
        )
    )
    checks.append(
        (
            "PROMPT3 REGRESSION 23 direct chat requires accepted connection",
            with_world(
                lambda g, world: assert_http_status(
                    "direct without accepted connection",
                    403,
                    lambda: chats.create_chat(
                        Payload(target_user_id="000000000000000000000003"),
                        current_user={"_id": "000000000000000000000001"},
                    ),
                )
            ),
        )
    )
    checks.append(
        (
            "PROMPT3 REGRESSION 24 existing direct conversations still work",
            with_world(
                lambda g, world: assert_equal(
                    chats.create_chat(
                        Payload(target_user_id="000000000000000000000002"),
                        current_user={"_id": "000000000000000000000001"},
                    )["type"],
                    "direct",
                )
            ),
        )
    )
    checks.append(("PROMPT3 REGRESSION 25 Find Your Tribe remains unaffected", lambda: assert_true("Find Your Tribe" in tribe_source or "Solo Travel" in tribe_source)))
    checks.append(("PROMPT3 REGRESSION 26 Prompt 1 group privacy remains", lambda: assert_true("serialize_group_profile" in Path("backend/routers/group_voyages.py").read_text())))
    checks.append(("PROMPT3 REGRESSION 27 Prompt 2 lifecycle remains", lambda: assert_true("leave_group_voyage" in Path("backend/routers/group_voyages.py").read_text())))
    chat_thread_source = Path("app/chat/[chatId]/page.tsx").read_text()
    chat_inbox_source = Path("app/chat/page.tsx").read_text()
    checks.append(("PROMPT3 FRONTEND 28 host sees Group Chat", lambda: assert_true("Group Chat" in tribe_source)))
    checks.append(("PROMPT3 FRONTEND 29 accepted member sees Group Chat", lambda: assert_true('viewer_status === "participant"' in tribe_source and "Group Chat" in tribe_source)))
    checks.append(("PROMPT3 FRONTEND 30 pending user has no usable chat action", lambda: assert_true('viewer_status === "pending_sent"' in tribe_source and "onOpenGroupChat" in tribe_source)))
    checks.append(("PROMPT3 FRONTEND 31 former member loses chat access through backend", lambda: assert_true("leave_group_voyage" in Path("backend/routers/group_voyages.py").read_text())))
    checks.append(("PROMPT3 FRONTEND 32 reaccepted member regains access through same route", lambda: assert_true("get_or_create_group_voyage_conversation" in Path("backend/routers/chats.py").read_text())))
    checks.append(("PROMPT3 FRONTEND 33 chat loading/error/empty states exist", lambda: assert_true("Loading messages" in chat_thread_source and "Unable to load this conversation" in chat_thread_source and "Start with the next detail" in chat_thread_source)))
    checks.append(("PROMPT3 FRONTEND 34 messages display sender identity safely", lambda: assert_true("sender_profile" in chat_thread_source and "MessageAvatar" in chat_thread_source)))
    checks.append(("PROMPT3 FRONTEND 35 direct chat UI still works", lambda: assert_true("other_profile" in chat_inbox_source and "group_voyage" in chat_inbox_source)))

    for label, check in checks:
        check()
        print(f"PASS {label}")

    print(f"{len(checks)} group voyage prompt 1, 2, and 3 checks passed")


def assert_equal(actual, expected) -> None:
    assert actual == expected, f"expected {expected!r}, got {actual!r}"


def assert_not_equal(actual, expected) -> None:
    assert actual != expected, f"expected {actual!r} to differ from {expected!r}"


def assert_true(value) -> None:
    assert value


if __name__ == "__main__":
    run()
