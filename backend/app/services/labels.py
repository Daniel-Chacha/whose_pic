"""Label CRUD + label assignment to faces."""

import uuid as _uuid
from typing import Any

import asyncpg
from fastapi import HTTPException, status

from app.services import storage


async def _require_label(user_id: str, label_id: str, conn: asyncpg.Connection) -> asyncpg.Record:
    row = await conn.fetchrow(
        "select id, owner_id, name, cover_face_id, created_at "
        "from labels where owner_id = $1 and id = $2",
        _uuid.UUID(user_id),
        _uuid.UUID(label_id),
    )
    if not row:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "label not found")
    return row


def _row_to_label(r: asyncpg.Record, *, face_count: int = 0, cover_url: str | None = None) -> dict[str, Any]:
    return {
        "id": str(r["id"]),
        "name": r["name"],
        "cover_face_id": str(r["cover_face_id"]) if r["cover_face_id"] else None,
        "cover_url": cover_url,
        "face_count": face_count,
        "created_at": r["created_at"],
    }


async def create_label(user_id: str, name: str, conn: asyncpg.Connection) -> dict[str, Any]:
    name = name.strip()
    if not name:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "name is required")
    existing = await conn.fetchrow(
        "select id, name, cover_face_id, created_at from labels "
        "where owner_id = $1 and name = $2",
        _uuid.UUID(user_id),
        name,
    )
    if existing:
        return _row_to_label(existing)
    inserted = await conn.fetchrow(
        "insert into labels (owner_id, name) values ($1, $2) "
        "returning id, name, cover_face_id, created_at",
        _uuid.UUID(user_id),
        name,
    )
    return _row_to_label(inserted)


async def list_labels(user_id: str, conn: asyncpg.Connection) -> list[dict[str, Any]]:
    rows = await conn.fetch("select * from list_labels_with_counts($1)", _uuid.UUID(user_id))
    out = []
    for r in rows:
        cover_url = storage.signed_url(r["cover_blob_path"]) if r["cover_blob_path"] else None
        out.append(
            {
                "id": str(r["id"]),
                "name": r["name"],
                "cover_face_id": str(r["cover_face_id"]) if r["cover_face_id"] else None,
                "cover_url": cover_url,
                "face_count": int(r["face_count"]),
                "created_at": r["created_at"],
            }
        )
    return out


async def update_label(
    user_id: str,
    label_id: str,
    *,
    name: str | None,
    cover_face_id: str | None,
    conn: asyncpg.Connection,
) -> dict[str, Any]:
    await _require_label(user_id, label_id, conn)
    sets: list[str] = []
    params: list[Any] = []
    if name is not None:
        sets.append(f"name = ${len(params) + 1}")
        params.append(name.strip())
    if cover_face_id is not None:
        sets.append(f"cover_face_id = ${len(params) + 1}")
        params.append(_uuid.UUID(cover_face_id))
    if not sets:
        return _row_to_label(await _require_label(user_id, label_id, conn))

    params.extend([_uuid.UUID(user_id), _uuid.UUID(label_id)])
    sql = (
        "update labels set " + ", ".join(sets)
        + f" where owner_id = ${len(params) - 1} and id = ${len(params)} "
        + "returning id, name, cover_face_id, created_at"
    )
    row = await conn.fetchrow(sql, *params)
    return _row_to_label(row)


async def delete_label(user_id: str, label_id: str, conn: asyncpg.Connection) -> None:
    await _require_label(user_id, label_id, conn)
    await conn.execute(
        "delete from labels where owner_id = $1 and id = $2",
        _uuid.UUID(user_id),
        _uuid.UUID(label_id),
    )


async def assign_label_to_face(
    user_id: str,
    face_id: str,
    *,
    label_id: str | None,
    name: str | None,
    conn: asyncpg.Connection,
) -> dict[str, Any]:
    if label_id is None and name is None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "label_id or name required")

    face = await conn.fetchrow(
        "select id from faces where owner_id = $1 and id = $2",
        _uuid.UUID(user_id),
        _uuid.UUID(face_id),
    )
    if not face:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "face not found")

    if label_id is None:
        lbl = await create_label(user_id, name or "", conn)
        label_id = lbl["id"]
    else:
        await _require_label(user_id, label_id, conn)

    row = await conn.fetchrow(
        "update faces set label_id = $1 where owner_id = $2 and id = $3 "
        "returning id, image_id, label_id, bbox, det_score, created_at",
        _uuid.UUID(label_id),
        _uuid.UUID(user_id),
        _uuid.UUID(face_id),
    )
    return {
        "id": str(row["id"]),
        "image_id": str(row["image_id"]),
        "label_id": str(row["label_id"]) if row["label_id"] else None,
        "label_name": None,
        "bbox": row["bbox"],
        "det_score": float(row["det_score"]) if row["det_score"] is not None else None,
        "created_at": row["created_at"],
    }


async def clear_label_on_face(user_id: str, face_id: str, conn: asyncpg.Connection) -> dict[str, Any]:
    row = await conn.fetchrow(
        "update faces set label_id = null where owner_id = $1 and id = $2 "
        "returning id, image_id, label_id, bbox, det_score, created_at",
        _uuid.UUID(user_id),
        _uuid.UUID(face_id),
    )
    if not row:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "face not found")
    return {
        "id": str(row["id"]),
        "image_id": str(row["image_id"]),
        "label_id": None,
        "label_name": None,
        "bbox": row["bbox"],
        "det_score": float(row["det_score"]) if row["det_score"] is not None else None,
        "created_at": row["created_at"],
    }
