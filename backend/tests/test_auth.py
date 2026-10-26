import secrets

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import delete

from app.db.session import SessionLocal
from app.main import app
from app.models.user import User


client = TestClient(app)


@pytest.fixture(autouse=True)
def clean_users():
    with SessionLocal() as db:
        db.execute(delete(User))
        db.commit()
    yield
    with SessionLocal() as db:
        db.execute(delete(User))
        db.commit()


def make_password() -> str:
    return secrets.token_urlsafe(16)


def register_payload(email: str = "person@example.com", nickname: str = "빌드로그") -> dict[str, str]:
    return {"email": email, "password": make_password(), "nickname": nickname}


def test_register_stores_a_hashed_user_and_requires_unique_email_and_nickname():
    payload = register_payload()
    response = client.post("/api/v1/auth/register", json=payload)

    assert response.status_code == 201
    assert response.json()["message"] == "회원가입이 완료되었습니다."

    with SessionLocal() as db:
        user = db.query(User).filter_by(email=payload["email"]).one()
        assert user.password_hash != payload["password"]

    duplicate_email = client.post(
        "/api/v1/auth/register",
        json=register_payload(nickname="다른닉네임"),
    )
    assert duplicate_email.status_code == 409

    duplicate_nickname = client.post(
        "/api/v1/auth/register",
        json=register_payload(email="another@example.com"),
    )
    assert duplicate_nickname.status_code == 409


def test_login_sets_cookie_and_me_returns_current_user():
    payload = register_payload()
    client.post("/api/v1/auth/register", json=payload)

    login_response = client.post(
        "/api/v1/auth/login",
        json={"email": payload["email"], "password": payload["password"]},
    )

    assert login_response.status_code == 200
    assert "access_token" in login_response.cookies
    assert login_response.json()["nickname"] == payload["nickname"]

    me_response = client.get("/api/v1/auth/me")
    assert me_response.status_code == 200
    assert me_response.json()["email"] == payload["email"]


def test_wrong_login_uses_a_generic_error_and_protected_me_requires_login():
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "person@example.com", "password": make_password()},
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "이메일 또는 비밀번호가 올바르지 않습니다."
    assert client.get("/api/v1/auth/me").status_code == 401


def test_nickname_update_applies_validation_and_duplicate_rule():
    first = register_payload()
    second = register_payload(email="second@example.com", nickname="두번째사용자")
    client.post("/api/v1/auth/register", json=first)
    client.post("/api/v1/auth/register", json=second)
    client.post("/api/v1/auth/login", json={"email": first["email"], "password": first["password"]})

    duplicate = client.patch("/api/v1/auth/me", json={"nickname": second["nickname"]})
    assert duplicate.status_code == 409

    updated = client.patch("/api/v1/auth/me", json={"nickname": " 새이름_1 "})
    assert updated.status_code == 200
    assert updated.json()["nickname"] == "새이름_1"

    invalid = client.patch("/api/v1/auth/me", json={"nickname": "!"})
    assert invalid.status_code == 422
