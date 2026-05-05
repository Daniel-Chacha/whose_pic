"""Asyncpg connection pool with pgvector type registration."""

from typing import Optional

import asyncpg
from pgvector.asyncpg import register_vector

from app.config import get_settings

_pool: Optional[asyncpg.Pool] = None


async def _on_connect(conn: asyncpg.Connection) -> None:
    await register_vector(conn)


async def open_pool() -> asyncpg.Pool:
    global _pool
    if _pool is not None:
        return _pool
    settings = get_settings()
    _pool = await asyncpg.create_pool(
        dsn=settings.DATABASE_URL,
        init=_on_connect,
        min_size=1,
        max_size=10,
        command_timeout=30,
    )
    return _pool


async def close_pool() -> None:
    global _pool
    if _pool is not None:
        await _pool.close()
        _pool = None


def get_pool() -> asyncpg.Pool:
    if _pool is None:
        raise RuntimeError("DB pool not initialized")
    return _pool
