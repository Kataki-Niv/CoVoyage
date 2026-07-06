from fastapi import APIRouter

from database import get_chats_collection


router = APIRouter(prefix="/chats", tags=["chats"])


@router.get("/status")
def chats_status():
    get_chats_collection()
    return {
        "collection": "chats",
        "ready": True,
        "message": "Chats collection is ready for future chat features.",
    }
