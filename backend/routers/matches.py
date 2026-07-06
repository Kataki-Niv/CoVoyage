from fastapi import APIRouter

from database import get_matches_collection


router = APIRouter(prefix="/matches", tags=["matches"])


@router.get("/status")
def matches_status():
    get_matches_collection()
    return {
        "collection": "matches",
        "ready": True,
        "message": "Matches collection is ready for future matching logic.",
    }
