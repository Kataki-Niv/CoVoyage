import os
from pathlib import Path
from typing import Any

from dotenv import load_dotenv

from pinecone_client import get_pinecone_client


load_dotenv(Path(__file__).with_name(".env"))

EMBEDDING_MODEL_NAME = os.getenv(
    "PINECONE_EMBEDDING_MODEL",
    "multilingual-e5-large",
).strip()


def _extract_embedding_values(embedding_result: Any) -> list[float]:
    first_embedding = embedding_result.data[0]

    if isinstance(first_embedding, dict):
        return list(first_embedding["values"])

    return list(first_embedding.values)


def generate_text_embedding(text: str, dimension: int) -> list[float]:
    if dimension <= 0:
        raise ValueError("Embedding dimension must be greater than zero")

    embedding_input = text.strip() or "empty travel profile"
    pinecone_client = get_pinecone_client()
    embedding_result = pinecone_client.inference.embed(
        model=EMBEDDING_MODEL_NAME,
        inputs=[embedding_input],
        parameters={
            "input_type": "passage",
            "truncate": "END",
        },
    )
    embedding = _extract_embedding_values(embedding_result)

    if len(embedding) != dimension:
        raise ValueError(
            f"Embedding dimension {len(embedding)} does not match "
            f"Pinecone index dimension {dimension}"
        )

    return embedding


def profile_to_embedding_text(profile: dict[str, Any]) -> str:
    fields = [
        profile.get("name"),
        profile.get("username"),
        profile.get("bio"),
        profile.get("travel_style"),
        profile.get("budget_range"),
        profile.get("preferred_trip_duration"),
        profile.get("country"),
        profile.get("city"),
        profile.get("preferred_destinations"),
        profile.get("interests"),
        profile.get("languages_spoken"),
        profile.get("previously_visited_countries"),
    ]

    text_parts: list[str] = []

    for field in fields:
        if isinstance(field, list):
            text_parts.extend(str(item) for item in field if item)
        elif field:
            text_parts.append(str(field))

    return " ".join(text_parts)


def generate_profile_embedding(
    profile: dict[str, Any],
    dimension: int,
) -> list[float]:
    return generate_text_embedding(profile_to_embedding_text(profile), dimension)
