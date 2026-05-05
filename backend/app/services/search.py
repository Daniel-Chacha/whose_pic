"""Search service: exact-label join + pgvector similarity search via SQL functions."""

import uuid as _uuid
from typing import Any
from uuid import UUID

import asyncpg

from app.services import storage


def _row_to_image(r: asyncpg.Record) -> dict[str, Any]:
    return {
        "id": str(r["id"]),
        "blob_path": r["blob_path"],
        "width": r["width"],
        "height": r["height"],
        "mime_type": r["mime_type"],
        "created_at": r["created_at"],
        "signed_url": storage.signed_url(r["blob_path"]),
    }


async def search_labeled(user_id: str, label_id: UUID, conn: asyncpg.Connection) -> list[dict[str, Any]]:
    rows = await conn.fetch(
        """
        select distinct on (i.id) i.id, i.blob_path, i.width, i.height, i.mime_type, i.created_at
          from images i
          join faces f on f.image_id = i.id
         where i.owner_id = $1 and f.label_id = $2
         order by i.id, i.created_at desc
        """,
        _uuid.UUID(user_id),
        label_id,
    )
    out = [_row_to_image(r) for r in rows]
    out.sort(key=lambda d: d["created_at"], reverse=True)
    return out


async def search_suggested(
    user_id: str, label_id: UUID, threshold: float, conn: asyncpg.Connection
) -> list[dict[str, Any]]:
    matches = await conn.fetch(
        "select * from search_label_suggested($1, $2, $3, $4)",
        _uuid.UUID(user_id),
        label_id,
        threshold,
        200,
    )
    if not matches:
        return []
    score_by_id = {str(r["image_id"]): float(r["score"]) for r in matches}
    image_uuids = [_uuid.UUID(k) for k in score_by_id]
    rows = await conn.fetch(
        """
        select id, blob_path, width, height, mime_type, created_at
          from images
         where owner_id = $1 and id = any($2::uuid[])
        """,
        _uuid.UUID(user_id),
        image_uuids,
    )
    out = []
    for r in rows:
        d = _row_to_image(r)
        d["score"] = score_by_id.get(d["id"])
        out.append(d)
    out.sort(key=lambda d: d.get("score") or 0, reverse=True)
    return out


async def suggest_labels_for_face(
    user_id: str, face_id: UUID, k: int, threshold: float, conn: asyncpg.Connection
) -> list[dict[str, Any]]:
    rows = await conn.fetch(
        "select * from suggest_labels_for_face($1, $2, $3, $4)",
        _uuid.UUID(user_id),
        face_id,
        k,
        threshold,
    )
    return [
        {
            "label_id": str(r["label_id"]),
            "name": r["name"],
            "score": float(r["score"]),
            "sample_face_id": str(r["sample_face_id"]) if r["sample_face_id"] else None,
        }
        for r in rows
    ]
