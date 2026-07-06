import os
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from pinecone import Pinecone


load_dotenv(Path(__file__).with_name(".env"))

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY", "").strip()
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "").strip()

pinecone_client: Pinecone | None = None
pinecone_index: Any | None = None
pinecone_index_dimension: int | None = None


def get_pinecone_index():
    global pinecone_client, pinecone_index

    if pinecone_index is not None:
        return pinecone_index

    if not PINECONE_API_KEY:
        raise ValueError("PINECONE_API_KEY is not set in the environment")

    if not PINECONE_INDEX_NAME:
        raise ValueError("PINECONE_INDEX_NAME is not set in the environment")

    if pinecone_client is None:
        pinecone_client = Pinecone(api_key=PINECONE_API_KEY)

    pinecone_index = pinecone_client.Index(PINECONE_INDEX_NAME)
    return pinecone_index


def get_pinecone_client() -> Pinecone:
    global pinecone_client

    if pinecone_client is not None:
        return pinecone_client

    if not PINECONE_API_KEY:
        raise ValueError("PINECONE_API_KEY is not set in the environment")

    pinecone_client = Pinecone(api_key=PINECONE_API_KEY)
    return pinecone_client


def get_pinecone_index_dimension() -> int:
    global pinecone_index_dimension

    if pinecone_index_dimension is not None:
        return pinecone_index_dimension

    index = get_pinecone_index()
    stats = index.describe_index_stats()
    pinecone_index_dimension = int(stats.dimension)
    return pinecone_index_dimension
