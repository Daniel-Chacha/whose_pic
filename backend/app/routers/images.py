"""Image upload, list, fetch, delete."""

from uuid import UUID

from fastapi import APIRouter, File, UploadFile, status

from app.deps import CurrentUserId, DbConn, FaceEngineDep
from app.models.image import ImageOut, ImageWithFaces
from app.services import images as images_service

router = APIRouter(prefix="/images", tags=["images"])


@router.post("", response_model=ImageWithFaces)
async def upload_image(
    user_id: CurrentUserId,
    engine: FaceEngineDep,
    conn: DbConn,
    file: UploadFile = File(...),
) -> ImageWithFaces:
    data = await file.read()
    result = await images_service.ingest_upload(
        user_id=user_id,
        content_type=file.content_type or "application/octet-stream",
        data=data,
        engine=engine,
        conn=conn,
    )
    image = result["image"]
    return ImageWithFaces.model_validate(
        {**image, "signed_url": result["signed_url"], "faces": result["faces"]}
    )


@router.get("", response_model=list[ImageOut])
async def list_images(user_id: CurrentUserId, conn: DbConn, limit: int = 50) -> list[ImageOut]:
    rows = await images_service.list_user_images(user_id, conn, limit=limit)
    return [ImageOut.model_validate(r) for r in rows]


@router.get("/{image_id}", response_model=ImageWithFaces)
async def get_image(user_id: CurrentUserId, conn: DbConn, image_id: UUID) -> ImageWithFaces:
    row = await images_service.get_image_with_faces(user_id, str(image_id), conn)
    return ImageWithFaces.model_validate(row)


@router.delete("/{image_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_image(user_id: CurrentUserId, conn: DbConn, image_id: UUID) -> None:
    await images_service.delete_image(user_id, str(image_id), conn)
