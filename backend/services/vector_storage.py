from __future__ import annotations

import math
from collections.abc import Mapping, Sequence
from datetime import date, datetime
from typing import Any

from pinecone_client import get_pinecone_index
from services.embedding_service import EMBEDDING_DIMENSION


PineconeMetadataValue = str | int | float | bool | list[str]
PineconeMetadata = dict[str, PineconeMetadataValue]

PROFILE_METADATA_FIELDS = (
    "destination",
    "preferred_destinations",
    "travel_style",
    "budget_range",
    "preferred_trip_duration",
    "interests",
    "languages_spoken",
    "country",
    "city",
)


class VectorStorageError(RuntimeError):
    """Base error raised by the vector storage service."""


class VectorStorageValidationError(VectorStorageError, ValueError):
    """Raised when vector storage inputs are invalid."""


class VectorStorageOperationError(VectorStorageError):
    """Raised when Pinecone cannot store a vector."""


class PineconeVectorStorage:
    """Store embeddings in Pinecone using user IDs as vector IDs."""

    def __init__(
        self,
        *,
        index: Any | None = None,
        dimension: int = EMBEDDING_DIMENSION,
        namespace: str | None = None,
    ) -> None:
        if dimension <= 0:
            raise ValueError("Vector dimension must be greater than zero")

        self._index = index
        self.dimension = dimension
        self.namespace = namespace

    def upsert_user_embedding(
        self,
        user_id: str,
        embedding: Sequence[float],
        metadata: Mapping[str, Any] | None = None,
    ) -> Any:
        vector_id = validate_user_id(user_id)
        vector_values = validate_embedding_vector(embedding, self.dimension)
        vector_metadata = sanitize_metadata(metadata or {})
        vector = {
            "id": vector_id,
            "values": vector_values,
            "metadata": vector_metadata,
        }

        try:
            if self.namespace:
                return self.index.upsert(
                    vectors=[vector],
                    namespace=self.namespace,
                )

            return self.index.upsert(vectors=[vector])
        except Exception as error:
            raise VectorStorageOperationError(
                "Failed to upsert user embedding into Pinecone"
            ) from error

    @property
    def index(self) -> Any:
        if self._index is None:
            self._index = get_pinecone_index()

        return self._index


def upsert_user_embedding(
    user_id: str,
    embedding: Sequence[float],
    metadata: Mapping[str, Any] | None = None,
    *,
    storage: PineconeVectorStorage | None = None,
) -> Any:
    vector_storage = storage or PineconeVectorStorage()
    return vector_storage.upsert_user_embedding(user_id, embedding, metadata)


def build_profile_vector_metadata(
    profile_metadata: Mapping[str, Any],
) -> PineconeMetadata:
    lightweight_metadata = {
        field_name: profile_metadata.get(field_name)
        for field_name in PROFILE_METADATA_FIELDS
    }

    return sanitize_metadata(lightweight_metadata)


def validate_user_id(user_id: str) -> str:
    if not isinstance(user_id, str):
        raise VectorStorageValidationError("User ID must be a string")

    vector_id = user_id.strip()

    if not vector_id:
        raise VectorStorageValidationError("User ID cannot be empty")

    return vector_id


def validate_embedding_vector(
    embedding: Sequence[float],
    dimension: int = EMBEDDING_DIMENSION,
) -> list[float]:
    if isinstance(embedding, (str, bytes)) or not isinstance(
        embedding,
        Sequence,
    ):
        raise VectorStorageValidationError(
            "Embedding must be a sequence of numbers"
        )

    if len(embedding) != dimension:
        raise VectorStorageValidationError(
            f"Embedding dimension {len(embedding)} does not match "
            f"expected dimension {dimension}"
        )

    try:
        vector = [float(value) for value in embedding]
    except (TypeError, ValueError) as error:
        raise VectorStorageValidationError(
            "Embedding must contain only numeric values"
        ) from error

    if not all(math.isfinite(value) for value in vector):
        raise VectorStorageValidationError(
            "Embedding must contain only finite values"
        )

    return vector


def sanitize_metadata(metadata: Mapping[str, Any]) -> PineconeMetadata:
    if not isinstance(metadata, Mapping):
        raise VectorStorageValidationError("Metadata must be a mapping")

    sanitized_metadata: PineconeMetadata = {}

    for key, value in metadata.items():
        metadata_key = str(key).strip()

        if not metadata_key:
            continue

        sanitized_value = sanitize_metadata_value(value)

        if sanitized_value is not None:
            sanitized_metadata[metadata_key] = sanitized_value

    return sanitized_metadata


def sanitize_metadata_value(value: Any) -> PineconeMetadataValue | None:
    if value is None or value == "":
        return None

    if isinstance(value, bool):
        return value

    if isinstance(value, (int, float)) and math.isfinite(value):
        return value

    if isinstance(value, datetime):
        return value.isoformat()

    if isinstance(value, date):
        return value.isoformat()

    if isinstance(value, str):
        cleaned_value = normalize_text(value)
        return cleaned_value or None

    if isinstance(value, Sequence) and not isinstance(value, (str, bytes)):
        cleaned_values = []
        seen_values = set()

        for item in value:
            cleaned_item = normalize_text(str(item))
            normalized_item = cleaned_item.casefold()

            if cleaned_item and normalized_item not in seen_values:
                cleaned_values.append(cleaned_item)
                seen_values.add(normalized_item)

        return cleaned_values or None

    cleaned_value = normalize_text(str(value))
    return cleaned_value or None


def normalize_text(value: str) -> str:
    return " ".join(value.strip().split())
