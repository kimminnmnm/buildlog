from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


def _clean_text(value: str) -> str:
    return value.strip()


def _validate_nickname(value: str) -> str:
    import re

    value = _clean_text(value)
    if not 2 <= len(value) <= 20:
        raise ValueError("닉네임은 2~20자로 입력해 주세요.")
    if not re.fullmatch(r"[가-힣A-Za-z0-9_]+", value):
        raise ValueError("닉네임에는 한글, 영문, 숫자, 밑줄만 사용할 수 있습니다.")
    return value


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=64)
    nickname: str

    @field_validator("email", mode="before")
    @classmethod
    def clean_email(cls, value: str) -> str:
        return str(value).strip().lower()

    @field_validator("nickname")
    @classmethod
    def validate_nickname(cls, value: str) -> str:
        return _validate_nickname(value)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str

    @field_validator("email", mode="before")
    @classmethod
    def clean_email(cls, value: str) -> str:
        return str(value).strip().lower()


class NicknameUpdateRequest(BaseModel):
    nickname: str

    @field_validator("nickname")
    @classmethod
    def validate_nickname(cls, value: str) -> str:
        return _validate_nickname(value)


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    nickname: str
    created_at: datetime
    updated_at: datetime


class MessageResponse(BaseModel):
    message: str
