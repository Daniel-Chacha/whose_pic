"""Verifies short-lived HS256 JWTs issued by the frontend's `/api/token` bridge.

Auth.js holds the user session (in cookies, in the Neon `sessions` table). When
the browser needs to call FastAPI it asks `/api/token`, which checks the
session server-side and mints a JWT signed with `BACKEND_JWT_SECRET`. We
verify that JWT here. The frontend and backend share only that one secret.
"""

from fastapi import HTTPException, status
from jose import JWTError, jwt

from app.config import get_settings


def verify_backend_jwt(token: str) -> str:
    settings = get_settings()
    try:
        payload = jwt.decode(
            token,
            settings.BACKEND_JWT_SECRET,
            algorithms=["HS256"],
            audience="whosepic-api",
        )
    except JWTError as e:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "invalid token") from e

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "token missing subject")
    return user_id
