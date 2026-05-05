from typing import Annotated, AsyncIterator

import asyncpg
from fastapi import Depends, Header, HTTPException, Request, status

from app.db.client import get_pool
from app.security import verify_backend_jwt
from app.services.face_engine import FaceEngine


def get_current_user_id(authorization: Annotated[str | None, Header()] = None) -> str:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "missing bearer token")
    token = authorization.split(" ", 1)[1].strip()
    return verify_backend_jwt(token)


async def get_db_conn() -> AsyncIterator[asyncpg.Connection]:
    pool = get_pool()
    async with pool.acquire() as conn:
        yield conn


def get_face_engine(request: Request) -> FaceEngine:
    engine: FaceEngine | None = getattr(request.app.state, "face_engine", None)
    if engine is None:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "face engine not ready")
    return engine


CurrentUserId = Annotated[str, Depends(get_current_user_id)]
DbConn = Annotated[asyncpg.Connection, Depends(get_db_conn)]
FaceEngineDep = Annotated[FaceEngine, Depends(get_face_engine)]
