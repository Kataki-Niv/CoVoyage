# Deployment Notes

This file records deployment setup that is intentionally not automated by the
repository.

## Frontend API URL

Set `NEXT_PUBLIC_API_BASE_URL` to the deployed FastAPI backend origin. If it is
unset, the frontend falls back to `http://127.0.0.1:8000` for local development.

## Backend CORS

Localhost origins are enabled by default. For production, set
`COVOYAGE_CORS_ORIGINS` to a comma-separated list of deployed frontend origins,
for example:

```text
COVOYAGE_CORS_ORIGINS=https://your-frontend.example
```

`COVOYAGE_CORS_ORIGIN_REGEX` can be set only if a host platform requires a regex
allowlist.

## Pinecone Embeddings

Tribe matching uses `intfloat/multilingual-e5-large` profile embeddings with
1024 dimensions. The Pinecone index configured by `PINECONE_INDEX_NAME` must be
created with a compatible 1024-dimensional vector configuration before matching
is demoed.

After seeding traveler profiles, synchronize profile vectors:

```powershell
cd backend
.\venv\Scripts\python.exe scripts\sync_profile_embeddings.py
```

Do not seed fake vectors; matching should fail visibly if real embeddings or
Pinecone are unavailable.

## Media Storage

Profile images and journal media are stored on the backend filesystem under
`backend/media` by default. For production, use a backend host with persistent
writable storage or set `COVOYAGE_MEDIA_ROOT` to a persistent writable mount.
Object storage is not implemented in this repository.
