"""Label CRUD and search-by-person."""

from typing import Literal
from uuid import UUID

from fastapi import APIRouter, status

from app.deps import CurrentUserId, DbConn
from app.models.image import ImageOut
from app.models.label import LabelCreate, LabelOut, LabelUpdate
from app.services import labels as labels_service
from app.services import search as search_service

router = APIRouter(prefix="/labels", tags=["labels"])


@router.get("", response_model=list[LabelOut])
async def list_labels(user_id: CurrentUserId, conn: DbConn) -> list[LabelOut]:
    return [LabelOut.model_validate(r) for r in await labels_service.list_labels(user_id, conn)]


@router.post("", response_model=LabelOut, status_code=status.HTTP_201_CREATED)
async def create_label(user_id: CurrentUserId, conn: DbConn, body: LabelCreate) -> LabelOut:
    row = await labels_service.create_label(user_id, body.name, conn)
    return LabelOut.model_validate(row)


@router.patch("/{label_id}", response_model=LabelOut)
async def update_label(
    user_id: CurrentUserId, conn: DbConn, label_id: UUID, body: LabelUpdate
) -> LabelOut:
    row = await labels_service.update_label(
        user_id,
        str(label_id),
        name=body.name,
        cover_face_id=str(body.cover_face_id) if body.cover_face_id else None,
        conn=conn,
    )
    return LabelOut.model_validate(row)


@router.delete("/{label_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_label(user_id: CurrentUserId, conn: DbConn, label_id: UUID) -> None:
    await labels_service.delete_label(user_id, str(label_id), conn)


@router.get("/{label_id}/images")
async def search_images(
    user_id: CurrentUserId,
    conn: DbConn,
    label_id: UUID,
    mode: Literal["labeled", "suggested", "both"] = "labeled",
    threshold: float = 0.5,
) -> dict:
    if mode == "labeled":
        rows = await search_service.search_labeled(user_id, label_id, conn)
        return {"labeled": [ImageOut.model_validate(r) for r in rows]}
    if mode == "suggested":
        rows = await search_service.search_suggested(user_id, label_id, threshold, conn)
        return {"suggested": [ImageOut.model_validate(r) for r in rows]}
    labeled = await search_service.search_labeled(user_id, label_id, conn)
    suggested = await search_service.search_suggested(user_id, label_id, threshold, conn)
    return {
        "labeled": [ImageOut.model_validate(r) for r in labeled],
        "suggested": [ImageOut.model_validate(r) for r in suggested],
    }
