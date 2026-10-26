from datetime import datetime, timedelta, timezone
import secrets

import jwt
from pwdlib import PasswordHash

from app.core.config import get_settings


password_hash = PasswordHash.recommended()
runtime_secret = secrets.token_urlsafe(32)


def hash_password(password: str) -> str:
    return password_hash.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    return password_hash.verify(password, hashed_password)


def get_auth_secret() -> str:
    configured_secret = get_settings().auth_secret_key
    return configured_secret or runtime_secret


def create_access_token(user_id: int) -> str:
    settings = get_settings()
    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=settings.access_token_expire_minutes
    )
    payload = {"sub": str(user_id), "exp": expires_at}
    return jwt.encode(payload, get_auth_secret(), algorithm="HS256")


def get_user_id_from_token(token: str) -> int | None:
    try:
        payload = jwt.decode(token, get_auth_secret(), algorithms=["HS256"])
        subject = payload.get("sub")
        return int(subject) if subject is not None else None
    except (jwt.InvalidTokenError, TypeError, ValueError):
        return None
