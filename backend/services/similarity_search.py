from __future__ import annotations

import logging
import math
from collections.abc import Sequence
from dataclasses import dataclass
from typing import Any

from pinecone_client import get_pinecone_index


EXPECTED_SIMILARITY_METRIC = "cosine"
DEFAULT_SIMILARITY_TOP_K = 10
MAX_SIMILARITY_TOP_K = 100

logger = logging.getLogger(__name__)


class SimilaritySearchError(RuntimeError):
    """Base error raised by the similarity search service."""


class SimilaritySearchValidationError(SimilaritySearchError, ValueError):
    """Raised when similarity search inputs are invalid."""


class SimilaritySearchOperationError(SimilaritySearchError):
    """Raised when Pinecone cannot complete a similarity search operation."""


@dataclass(frozen=True)
class SimilarTraveler:
    user_id: str
    score: float


class PineconeSimilaritySearch:
    """Retrieve similar travelers from a cosine-configured Pinecone index."""

    def __init__(
        self,
        *,
        index: Any | None = None,
        namespace: str | None = None,
    ) -> None:
        self._index = index
        self.namespace = namespace

    def find_similar_users(
        self,
        user_id: str,
        *,
        top_k: int = DEFAULT_SIMILARITY_TOP_K,
    ) -> list[SimilarTraveler]:
        vector_id = validate_user_id(user_id)
        result_limit = validate_top_k(top_k)
        source_vector = self.fetch_user_embedding(vector_id)

        if not source_vector:
            logger.info(
                "No Pinecone embedding found for user_id=%s",
                vector_id,
            )
            return []

        query_result = self.query_similar_vectors(
            source_vector,
            top_k=result_limit + 1,
        )

        return normalize_query_matches(
            query_result,
            source_user_id=vector_id,
            limit=result_limit,
        )

    def find_similar_users_by_ids(
        self,
        user_id: str,
        *,
        candidate_user_ids: Sequence[str],
    ) -> list[SimilarTraveler]:
        vector_id = validate_user_id(user_id)
        candidate_ids = normalize_candidate_user_ids(
            candidate_user_ids,
            source_user_id=vector_id,
        )

        if not candidate_ids:
            return []

        source_vector = self.fetch_user_embedding(vector_id)

        if not source_vector:
            logger.info(
                "No Pinecone embedding found for user_id=%s",
                vector_id,
            )
            return []

        candidate_vectors = self.fetch_user_embeddings(candidate_ids)
        similar_users: list[SimilarTraveler] = []

        for candidate_id in candidate_ids:
            candidate_vector = candidate_vectors.get(candidate_id)

            if candidate_vector is None:
                logger.info(
                    "No Pinecone embedding found for candidate user_id=%s",
                    candidate_id,
                )
                continue

            similar_users.append(
                SimilarTraveler(
                    user_id=candidate_id,
                    score=cosine_similarity(source_vector, candidate_vector),
                )
            )

        return sorted(
            similar_users,
            key=lambda similar_traveler: similar_traveler.score,
            reverse=True,
        )

    def fetch_user_embedding(self, user_id: str) -> list[float] | None:
        try:
            if self.namespace:
                result = self.index.fetch(
                    ids=[user_id],
                    namespace=self.namespace,
                )
            else:
                result = self.index.fetch(ids=[user_id])
        except Exception as error:
            raise SimilaritySearchOperationError(
                "Failed to fetch user embedding from Pinecone"
            ) from error

        vectors = get_result_field(result, "vectors") or {}
        vector = get_mapping_value(vectors, user_id)

        if vector is None:
            return None

        values = get_result_field(vector, "values")

        if not values:
            return None

        return coerce_vector_values(values)

    def fetch_user_embeddings(
        self,
        user_ids: Sequence[str],
    ) -> dict[str, list[float]]:
        vector_ids = list(
            dict.fromkeys(validate_user_id(user_id) for user_id in user_ids)
        )

        if not vector_ids:
            return {}

        try:
            if self.namespace:
                result = self.index.fetch(
                    ids=vector_ids,
                    namespace=self.namespace,
                )
            else:
                result = self.index.fetch(ids=vector_ids)
        except Exception as error:
            raise SimilaritySearchOperationError(
                "Failed to fetch candidate embeddings from Pinecone"
            ) from error

        vectors = get_result_field(result, "vectors") or {}
        embeddings_by_user_id: dict[str, list[float]] = {}

        for user_id in vector_ids:
            vector = get_mapping_value(vectors, user_id)

            if vector is None:
                continue

            values = get_result_field(vector, "values")

            if not values:
                continue

            try:
                embeddings_by_user_id[user_id] = coerce_vector_values(values)
            except SimilaritySearchOperationError:
                logger.exception(
                    "Invalid Pinecone embedding skipped for user_id=%s",
                    user_id,
                )

        return embeddings_by_user_id

    def query_similar_vectors(
        self,
        vector: Sequence[float],
        *,
        top_k: int,
    ) -> Any:
        query_kwargs = {
            "vector": list(vector),
            "top_k": top_k,
            "include_values": False,
            "include_metadata": False,
        }

        if self.namespace:
            query_kwargs["namespace"] = self.namespace

        try:
            return self.index.query(**query_kwargs)
        except Exception as error:
            raise SimilaritySearchOperationError(
                "Failed to query similar users from Pinecone"
            ) from error

    @property
    def index(self) -> Any:
        if self._index is None:
            self._index = get_pinecone_index()

        return self._index


def find_similar_users(
    user_id: str,
    *,
    top_k: int = DEFAULT_SIMILARITY_TOP_K,
    search_service: PineconeSimilaritySearch | None = None,
) -> list[SimilarTraveler]:
    service = search_service or PineconeSimilaritySearch()
    return service.find_similar_users(user_id, top_k=top_k)


def find_similar_users_by_ids(
    user_id: str,
    *,
    candidate_user_ids: Sequence[str],
    search_service: PineconeSimilaritySearch | None = None,
) -> list[SimilarTraveler]:
    service = search_service or PineconeSimilaritySearch()
    return service.find_similar_users_by_ids(
        user_id,
        candidate_user_ids=candidate_user_ids,
    )


def normalize_candidate_user_ids(
    candidate_user_ids: Sequence[str],
    *,
    source_user_id: str,
) -> list[str]:
    normalized_user_ids: list[str] = []
    seen_user_ids: set[str] = set()
    source_id = source_user_id.casefold()

    for candidate_user_id in candidate_user_ids or []:
        if candidate_user_id is None:
            continue

        candidate_id = str(candidate_user_id).strip()

        if not candidate_id or candidate_id.casefold() == source_id:
            continue

        seen_id = candidate_id.casefold()

        if seen_id in seen_user_ids:
            continue

        normalized_user_ids.append(candidate_id)
        seen_user_ids.add(seen_id)

    return normalized_user_ids


def cosine_similarity(
    source_vector: Sequence[float],
    candidate_vector: Sequence[float],
) -> float:
    if len(source_vector) != len(candidate_vector):
        logger.warning(
            "Cannot compare embeddings with different dimensions: %s vs %s",
            len(source_vector),
            len(candidate_vector),
        )
        return 0.0

    source_norm = math.sqrt(sum(value * value for value in source_vector))
    candidate_norm = math.sqrt(sum(value * value for value in candidate_vector))

    if source_norm == 0.0 or candidate_norm == 0.0:
        return 0.0

    score = sum(
        source_value * candidate_value
        for source_value, candidate_value in zip(source_vector, candidate_vector)
    ) / (source_norm * candidate_norm)

    return max(-1.0, min(1.0, score))


def normalize_query_matches(
    query_result: Any,
    *,
    source_user_id: str,
    limit: int,
) -> list[SimilarTraveler]:
    matches = get_result_field(query_result, "matches") or []
    similar_users: list[SimilarTraveler] = []
    source_id = source_user_id.casefold()

    for match in matches:
        match_id = str(get_result_field(match, "id") or "").strip()

        if not match_id or match_id.casefold() == source_id:
            continue

        score = get_result_field(match, "score")

        if score is None:
            continue

        try:
            similar_users.append(
                SimilarTraveler(
                    user_id=match_id,
                    score=float(score),
                )
            )
        except (TypeError, ValueError):
            continue

        if len(similar_users) >= limit:
            break

    return similar_users


def validate_user_id(user_id: str) -> str:
    if not isinstance(user_id, str):
        raise SimilaritySearchValidationError("User ID must be a string")

    vector_id = user_id.strip()

    if not vector_id:
        raise SimilaritySearchValidationError("User ID cannot be empty")

    return vector_id


def validate_top_k(top_k: int) -> int:
    if not isinstance(top_k, int):
        raise SimilaritySearchValidationError("top_k must be an integer")

    if top_k <= 0:
        raise SimilaritySearchValidationError("top_k must be greater than zero")

    if top_k > MAX_SIMILARITY_TOP_K:
        raise SimilaritySearchValidationError(
            f"top_k cannot be greater than {MAX_SIMILARITY_TOP_K}"
        )

    return top_k


def coerce_vector_values(values: Any) -> list[float]:
    if hasattr(values, "tolist"):
        values = values.tolist()

    if isinstance(values, (str, bytes)) or not isinstance(values, Sequence):
        raise SimilaritySearchOperationError(
            "Fetched Pinecone vector has unsupported values"
        )

    try:
        vector_values = [float(value) for value in values]
    except (TypeError, ValueError) as error:
        raise SimilaritySearchOperationError(
            "Fetched Pinecone vector contains non-numeric values"
        ) from error

    if not all(math.isfinite(value) for value in vector_values):
        raise SimilaritySearchOperationError(
            "Fetched Pinecone vector contains non-finite values"
        )

    return vector_values


def get_result_field(result: Any, field_name: str) -> Any:
    if isinstance(result, dict):
        return result.get(field_name)

    return getattr(result, field_name, None)


def get_mapping_value(mapping: Any, key: str) -> Any:
    if isinstance(mapping, dict):
        return mapping.get(key)

    if hasattr(mapping, "get"):
        return mapping.get(key)

    return None
