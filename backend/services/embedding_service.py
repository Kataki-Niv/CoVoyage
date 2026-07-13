from __future__ import annotations

import math
import os
from collections.abc import Callable, Sequence
from typing import Any, Protocol


EMBEDDING_MODEL_NAME = os.getenv(
    "COVOYAGE_EMBEDDING_MODEL",
    "multilingual-e5-large",
).strip()
LOCAL_SENTENCE_TRANSFORMER_MODEL_NAME = os.getenv(
    "COVOYAGE_SENTENCE_TRANSFORMER_MODEL",
    "intfloat/multilingual-e5-large",
).strip()
EMBEDDING_DIMENSION = 1024
E5_PASSAGE_PREFIX = "passage: "


class EmbeddingServiceError(RuntimeError):
    """Base error raised by the embedding service."""


class EmbeddingConfigurationError(EmbeddingServiceError):
    """Raised when no usable embedding model is configured."""


class EmbeddingGenerationError(EmbeddingServiceError):
    """Raised when the embedding model cannot generate a vector."""


class EmbeddingDimensionError(EmbeddingServiceError):
    """Raised when a generated vector has the wrong dimension."""


class EncodableEmbeddingModel(Protocol):
    def encode(self, sentences: Sequence[str], **kwargs: Any) -> Any:
        ...


EmbeddingModel = EncodableEmbeddingModel | Callable[[Sequence[str]], Any]


class EmbeddingService:
    """Generate 1024-dimensional multilingual-e5-large text embeddings."""

    def __init__(
        self,
        model: EmbeddingModel | None = None,
        *,
        model_name: str = EMBEDDING_MODEL_NAME,
        local_model_name: str = LOCAL_SENTENCE_TRANSFORMER_MODEL_NAME,
        dimension: int = EMBEDDING_DIMENSION,
        normalize_embeddings: bool = True,
        input_prefix: str = E5_PASSAGE_PREFIX,
    ) -> None:
        if dimension <= 0:
            raise ValueError("Embedding dimension must be greater than zero")

        self.model_name = model_name
        self.local_model_name = local_model_name
        self.dimension = dimension
        self.normalize_embeddings = normalize_embeddings
        self.input_prefix = input_prefix
        self._model = model

    def embed_profile_text(self, profile_text: str) -> list[float]:
        embedding_input = self.prepare_profile_text(profile_text)

        try:
            raw_embedding = self._encode(embedding_input)
        except EmbeddingServiceError:
            raise
        except Exception as error:
            raise EmbeddingGenerationError(
                "Failed to generate profile embedding"
            ) from error

        embedding = coerce_embedding(raw_embedding)
        validate_embedding(embedding, self.dimension)
        return embedding

    def prepare_profile_text(self, profile_text: str) -> str:
        if not isinstance(profile_text, str):
            raise TypeError("Profile text must be a string")

        cleaned_text = " ".join(profile_text.strip().split())

        if not cleaned_text:
            raise ValueError("Profile text cannot be empty")

        if not self.input_prefix:
            return cleaned_text

        normalized_text = cleaned_text.casefold()
        normalized_prefix = self.input_prefix.casefold()

        if normalized_text.startswith(normalized_prefix):
            return cleaned_text

        return f"{self.input_prefix}{cleaned_text}"

    def _encode(self, text: str) -> Any:
        model = self._get_model()

        if hasattr(model, "encode"):
            return model.encode(
                [text],
                normalize_embeddings=self.normalize_embeddings,
            )

        if callable(model):
            return model([text])

        raise EmbeddingConfigurationError(
            "Embedding model must be callable or expose an encode method"
        )

    def _get_model(self) -> EmbeddingModel:
        if self._model is not None:
            return self._model

        self._model = load_sentence_transformer_model(self.local_model_name)
        return self._model


def embed_profile_text(
    profile_text: str,
    service: EmbeddingService | None = None,
) -> list[float]:
    embedding_service = service or EmbeddingService()
    return embedding_service.embed_profile_text(profile_text)


def load_sentence_transformer_model(model_name: str) -> EncodableEmbeddingModel:
    try:
        from sentence_transformers import SentenceTransformer
    except ImportError as error:
        raise EmbeddingConfigurationError(
            "sentence-transformers is required for the default embedding "
            "service. Install it or inject a compatible embedding model."
        ) from error

    return SentenceTransformer(model_name)


def coerce_embedding(raw_embedding: Any) -> list[float]:
    if hasattr(raw_embedding, "tolist"):
        raw_embedding = raw_embedding.tolist()

    if (
        isinstance(raw_embedding, Sequence)
        and raw_embedding
        and isinstance(raw_embedding[0], Sequence)
        and not isinstance(raw_embedding[0], (str, bytes))
    ):
        raw_embedding = raw_embedding[0]

    if not isinstance(raw_embedding, Sequence) or isinstance(
        raw_embedding,
        (str, bytes),
    ):
        raise EmbeddingGenerationError(
            "Embedding model returned an unsupported vector format"
        )

    try:
        return [float(value) for value in raw_embedding]
    except (TypeError, ValueError) as error:
        raise EmbeddingGenerationError(
            "Embedding vector contains non-numeric values"
        ) from error


def validate_embedding(embedding: Sequence[float], dimension: int) -> None:
    if len(embedding) != dimension:
        raise EmbeddingDimensionError(
            f"Embedding dimension {len(embedding)} does not match "
            f"expected dimension {dimension}"
        )

    if not all(math.isfinite(value) for value in embedding):
        raise EmbeddingGenerationError(
            "Embedding vector contains non-finite values"
        )
