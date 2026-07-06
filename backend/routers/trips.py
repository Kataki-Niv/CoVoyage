from fastapi import APIRouter

from database import get_trips_collection


router = APIRouter(prefix="/trips", tags=["trips"])


@router.get("/status")
def trips_status():
    get_trips_collection()
    return {
        "collection": "trips",
        "ready": True,
        "message": "Trips collection is ready for future trip planning logic.",
    }
