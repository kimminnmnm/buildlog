from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.auth.security import create_access_token, hash_password, verify_password
from app.core.config import get_settings
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import (
    LoginRequest,
    MessageResponse,
    NicknameUpdateRequest,
    RegisterRequest,
    UserResponse,
)


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> MessageResponse:
    if db.scalar(select(User).where(User.email == str(payload.email))):
        raise HTTPException(status_code=409, detail="이미 사용 중인 이메일입니다.")
    if db.scalar(select(User).where(User.nickname == payload.nickname)):
        raise HTTPException(status_code=409, detail="이미 사용 중인 닉네임입니다.")

    user = User(
        email=str(payload.email),
        password_hash=hash_password(payload.password),
        nickname=payload.nickname,
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="이미 사용 중인 이메일 또는 닉네임입니다.")
    return MessageResponse(message="회원가입이 완료되었습니다.")


@router.post("/login", response_model=UserResponse)
def login(
    payload: LoginRequest,
    response: Response,
    db: Session = Depends(get_db),
) -> UserResponse:
    user = db.scalar(select(User).where(User.email == str(payload.email)))
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="이메일 또는 비밀번호가 올바르지 않습니다.",
        )

    token = create_access_token(user.id)
    settings = get_settings()
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=settings.app_env == "production",
        samesite="lax",
        max_age=settings.access_token_expire_minutes * 60,
    )
    return UserResponse.model_validate(user)


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)) -> UserResponse:
    return UserResponse.model_validate(current_user)


@router.patch("/me", response_model=UserResponse)
def update_nickname(
    payload: NicknameUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    duplicate = db.scalar(
        select(User).where(User.nickname == payload.nickname, User.id != current_user.id)
    )
    if duplicate:
        raise HTTPException(status_code=409, detail="이미 사용 중인 닉네임입니다.")

    current_user.nickname = payload.nickname
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="이미 사용 중인 닉네임입니다.")
    db.refresh(current_user)
    return UserResponse.model_validate(current_user)
