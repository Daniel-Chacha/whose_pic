from fastapi import APIRouter, Request

from app.deps import CurrentUserId
from app.models.user import CurrentUser

router = APIRouter()


@router.get("/health")
def health(request: Request) -> dict:
    return {
        "status": "ok",
        "face_engine_ready": getattr(request.app.state, "face_engine", None) is not None,
    }


@router.get("/me", response_model=CurrentUser)
def me(user_id: CurrentUserId) -> CurrentUser:
    return CurrentUser(user_id=user_id)
