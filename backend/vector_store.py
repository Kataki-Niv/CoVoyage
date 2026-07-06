from datetime import datetime
from typing import Any

from embeddings import EMBEDDING_MODEL_NAME, generate_profile_embedding
from pinecone_client import get_pinecone_index, get_pinecone_index_dimension


def build_profile_vector_metadata(profile: dict[str, Any]) -> dict[str, Any]:
    metadata = {
        "record_type": "profile",
        "embedding_model": EMBEDDING_MODEL_NAME,
        "user_id": profile.get("user_id"),
        "name": profile.get("name"),
        "username": profile.get("username"),
        "country": profile.get("country"),
        "city": profile.get("city"),
        "travel_style": profile.get("travel_style"),
        "budget_range": profile.get("budget_range"),
        "preferred_trip_duration": profile.get("preferred_trip_duration"),
        "interests": profile.get("interests") or [],
        "preferred_destinations": profile.get("preferred_destinations") or [],
        "languages_spoken": profile.get("languages_spoken") or [],
        "updated_at": datetime.utcnow().isoformat(timespec="seconds") + "Z",
    }

    return {
        key: value
        for key, value in metadata.items()
        if value is not None and value != "" and value != []
    }


def upsert_profile_vector(profile: dict[str, Any]):
    user_id = profile.get("user_id")

    if not user_id:
        raise ValueError("Profile vector upsert requires a user_id")

    dimension = get_pinecone_index_dimension()
    embedding = generate_profile_embedding(profile, dimension)
    metadata = build_profile_vector_metadata(profile)
    index = get_pinecone_index()

    return index.upsert(
        vectors=[
            {
                "id": str(user_id),
                "values": embedding,
                "metadata": metadata,
            }
        ],
    )


def fetch_profile_vector(user_id: str) -> dict[str, Any]:
    index = get_pinecone_index()
    result = index.fetch(ids=[str(user_id)])
    vectors = getattr(result, "vectors", {}) or {}
    vector = vectors.get(str(user_id))

    if vector is None:
        return {
            "found": False,
            "id": str(user_id),
            "metadata": None,
        }

    metadata = getattr(vector, "metadata", None)
    values = getattr(vector, "values", None) or []

    return {
        "found": True,
        "id": str(user_id),
        "dimension": len(values),
        "metadata": metadata,
    }
