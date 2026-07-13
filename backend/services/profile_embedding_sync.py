from __future__ import annotations

import logging
from typing import Any, Protocol

from services.embedding_service import EmbeddingService
from services.profile_builder import build_profile_text, profile_to_dict
from services.vector_storage import (
    PineconeVectorStorage,
    build_profile_vector_metadata,
)


logger = logging.getLogger(__name__)


class ProfileEmbeddingSyncError(RuntimeError):
    """Raised when a profile embedding cannot be synchronized."""


class ProfileTextEmbeddingService(Protocol):
    def embed_profile_text(self, profile_text: str) -> list[float]:
        ...


class UserVectorStorage(Protocol):
    def upsert_user_embedding(
        self,
        user_id: str,
        embedding: list[float],
        metadata: dict[str, Any] | None = None,
    ) -> Any:
        ...


class ProfileEmbeddingSynchronizer:
    """Synchronize travel profile embeddings after profile writes."""

    def __init__(
        self,
        *,
        embedding_service: ProfileTextEmbeddingService | None = None,
        vector_storage: UserVectorStorage | None = None,
    ) -> None:
        self.embedding_service = embedding_service or EmbeddingService()
        self.vector_storage = vector_storage or PineconeVectorStorage()

    def synchronize_profile(self, profile: Any) -> None:
        profile_data = profile_to_dict(profile)
        user_id = str(profile_data.get("user_id", "")).strip()

        if not user_id:
            raise ProfileEmbeddingSyncError(
                "Profile embedding sync requires a user_id"
            )

        profile_text = build_profile_text(profile_data)
        embedding = self.embedding_service.embed_profile_text(profile_text)
        metadata = build_profile_vector_metadata(profile_data)

        self.vector_storage.upsert_user_embedding(
            user_id,
            embedding,
            metadata,
        )


def synchronize_profile_embedding(
    profile: Any,
    *,
    synchronizer: ProfileEmbeddingSynchronizer | None = None,
) -> bool:
    profile_data = safely_get_profile_data(profile)
    user_id = str(profile_data.get("user_id", "")).strip()

    try:
        active_synchronizer = synchronizer or ProfileEmbeddingSynchronizer()
        active_synchronizer.synchronize_profile(profile)
    except Exception:
        logger.exception(
            "Failed to synchronize profile embedding for user_id=%s",
            user_id or "<missing>",
        )
        return False

    logger.info(
        "Synchronized profile embedding for user_id=%s",
        user_id,
    )
    return True


def safely_get_profile_data(profile: Any) -> dict[str, Any]:
    try:
        return profile_to_dict(profile)
    except Exception:
        return {}
