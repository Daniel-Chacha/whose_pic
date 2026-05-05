"""Upload-detect-persist orchestrator and image read paths."""

import json
import uuid as _uuid
from typing import Any

import asyncpg
import cv2
import numpy as np
from fastapi import HTTPException, status
from fastapi.concurrency import run_in_threadpool

from app.config import get_settings
from app.services import storage
from app.services.face_engine import FaceEngine

ALLOWED_MIMES = {"image/jpeg", "image/png", "image/webp"}
MIME_TO_EXT = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp"}


def _decode_bgr(data: bytes) -> np.ndarray:
    arr = np.frombuffer(data, dtype=np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "could not decode image")
    return img


def _row_to_image(r: asyncpg.Record) -> dict[str, Any]:
    return {
        "id": str(r["id"]),
        "blob_path": r["blob_path"],
        "width": r["width"],
        "height": r["height"],
        "mime_type": r["mime_type"],
        "created_at": r["created_at"],
    }


def _row_to_face(r: asyncpg.Record, label_name: str | None = None) -> dict[str, Any]:
    bbox = r["bbox"]
    if isinstance(bbox, str):
        bbox = json.loads(bbox)
    return {
        "id": str(r["id"]),
        "image_id": str(r["image_id"]),
        "label_id": str(r["label_id"]) if r["label_id"] else None,
        "label_name": label_name,
        "bbox": bbox,
        "det_score": float(r["det_score"]) if r["det_score"] is not None else None,
        "created_at": r["created_at"],
    }


async def ingest_upload(
    user_id: str,
    content_type: str,
    data: bytes,
    engine: FaceEngine,
    conn: asyncpg.Connection,
) -> dict[str, Any]:
    settings = get_settings()
    if content_type not in ALLOWED_MIMES:
        raise HTTPException(status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, f"unsupported mime: {content_type}")
    if len(data) > settings.MAX_UPLOAD_MB * 1024 * 1024:
        raise HTTPException(status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, "file too large")

    img = _decode_bgr(data)
    h, w = img.shape[:2]

    image_uuid = str(_uuid.uuid4())
    ext = MIME_TO_EXT[content_type]
    blob_path = await run_in_threadpool(
        storage.upload_image_bytes, user_id, image_uuid, ext, data, content_type
    )

    image_row = await conn.fetchrow(
        """
        insert into images (id, owner_id, blob_path, width, height, mime_type)
        values ($1, $2, $3, $4, $5, $6)
        returning id, blob_path, width, height, mime_type, created_at
        """,
        _uuid.UUID(image_uuid),
        _uuid.UUID(user_id),
        blob_path,
        w,
        h,
        content_type,
    )

    detected = await run_in_threadpool(engine.detect, img)
    face_dicts: list[dict[str, Any]] = []
    if detected:
        rows = []
        for d in detected:
            rows.append(
                (
                    _uuid.UUID(user_id),
                    _uuid.UUID(image_uuid),
                    json.dumps(d.bbox),
                    d.det_score,
                    np.asarray(d.embedding, dtype=np.float32),
                )
            )
        inserted = await conn.fetch(
            """
            insert into faces (owner_id, image_id, bbox, det_score, embedding)
            select * from unnest($1::uuid[], $2::uuid[], $3::jsonb[], $4::real[], $5::vector(512)[])
            returning id, image_id, label_id, bbox, det_score, created_at
            """,
            [r[0] for r in rows],
            [r[1] for r in rows],
            [r[2] for r in rows],
            [r[3] for r in rows],
            [r[4] for r in rows],
        )
        face_dicts = [_row_to_face(r) for r in inserted]

    return {
        "image": _row_to_image(image_row),
        "faces": face_dicts,
        "signed_url": storage.signed_url(blob_path),
    }


async def list_user_images(user_id: str, conn: asyncpg.Connection, limit: int = 50) -> list[dict[str, Any]]:
    rows = await conn.fetch(
        """
        select id, blob_path, width, height, mime_type, created_at
          from images
         where owner_id = $1
         order by created_at desc
         limit $2
        """,
        _uuid.UUID(user_id),
        limit,
    )
    out = []
    for r in rows:
        d = _row_to_image(r)
        d["signed_url"] = storage.signed_url(r["blob_path"])
        out.append(d)
    return out


async def get_image_with_faces(user_id: str, image_id: str, conn: asyncpg.Connection) -> dict[str, Any]:
    image = await conn.fetchrow(
        "select id, blob_path, width, height, mime_type, created_at "
        "from images where owner_id = $1 and id = $2",
        _uuid.UUID(user_id),
        _uuid.UUID(image_id),
    )
    if not image:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "image not found")

    face_rows = await conn.fetch(
        """
        select f.id, f.image_id, f.label_id, f.bbox, f.det_score, f.created_at, l.name as label_name
          from faces f
          left join labels l on l.id = f.label_id
         where f.owner_id = $1 and f.image_id = $2
         order by f.created_at asc
        """,
        _uuid.UUID(user_id),
        _uuid.UUID(image_id),
    )

    out = _row_to_image(image)
    out["signed_url"] = storage.signed_url(image["blob_path"])
    out["faces"] = [_row_to_face(r, r["label_name"]) for r in face_rows]
    return out


async def delete_image(user_id: str, image_id: str, conn: asyncpg.Connection) -> None:
    row = await conn.fetchrow(
        "select blob_path from images where owner_id = $1 and id = $2",
        _uuid.UUID(user_id),
        _uuid.UUID(image_id),
    )
    if not row:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "image not found")
    await conn.execute(
        "delete from images where owner_id = $1 and id = $2",
        _uuid.UUID(user_id),
        _uuid.UUID(image_id),
    )
    await run_in_threadpool(storage.delete_object, row["blob_path"])
