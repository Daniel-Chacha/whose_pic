"""Face labeling and similarity suggestions."""

from uuid import UUID

from fastapi import APIRouter

from app.config import get_settings
from app.deps import CurrentUserId, DbConn
from app.models.face import FaceOut, LabelAssignRequest, LabelSuggestion
from app.services import labels as labels_service
from app.services import search as search_service

router = APIRouter(prefix="/faces", tags=["faces"])


@router.post("/{face_id}/label", response_model=FaceOut)
async def assign_label(
    user_id: CurrentUserId, conn: DbConn, face_id: UUID, body: LabelAssignRequest
) -> FaceOut:
    row = await labels_service.assign_label_to_face(
        user_id,
        str(face_id),
        label_id=str(body.label_id) if body.label_id else None,
        name=body.name,
        conn=conn,
    )
    return FaceOut.model_validate(row)


@router.delete("/{face_id}/label", response_model=FaceOut)
async def clear_label(user_id: CurrentUserId, conn: DbConn, face_id: UUID) -> FaceOut:
    row = await labels_service.clear_label_on_face(user_id, str(face_id), conn)
    return FaceOut.model_validate(row)


@router.get("/{face_id}/suggestions", response_model=list[LabelSuggestion])
async def suggestions(
    user_id: CurrentUserId, conn: DbConn, face_id: UUID, k: int = 5
) -> list[LabelSuggestion]:
    threshold = get_settings().SIMILARITY_THRESHOLD
    rows = await search_service.suggest_labels_for_face(
        user_id, face_id, k=k, threshold=threshold, conn=conn
    )
    return [LabelSuggestion.model_validate(r) for r in rows]
