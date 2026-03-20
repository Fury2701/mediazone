from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime
from typing import Optional, List
import re

# --- Auth ---
class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str

    @field_validator("username")
    @classmethod
    def username_valid(cls, v):
        if len(v) < 3 or len(v) > 32:
            raise ValueError("Username must be 3-32 chars")
        return v

    @field_validator("password")
    @classmethod
    def password_valid(cls, v):
        if len(v) < 8:
            raise ValueError("Password min 8 chars")
        return v

class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

# --- User ---
class UserPublic(BaseModel):
    id: int
    username: str
    role: str
    forum_banned_until: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

class UserMe(UserPublic):
    email: str
    last_seen: datetime
    forum_banned_until: Optional[datetime] = None

class UserAdmin(BaseModel):
    id: int
    username: str
    email: str
    role: str
    is_active: bool
    forum_banned_until: Optional[datetime] = None
    created_at: datetime
    class Config:
        from_attributes = True

class ForumBanRequest(BaseModel):
    hours: Optional[int] = None  # None = permanent, 0 = unban

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def new_password_valid(cls, v):
        if len(v) < 8:
            raise ValueError("Password min 8 chars")
        return v

class SetRoleRequest(BaseModel):
    role: str

# --- Forum ---
class PostCreate(BaseModel):
    title: str
    body: str
    category_id: int
    video_url: Optional[str] = None

class ReplyCreate(BaseModel):
    body: str

class ReplyOut(BaseModel):
    id: int
    body: str
    author: UserPublic
    created_at: datetime
    class Config:
        from_attributes = True

class PostOut(BaseModel):
    id: int
    title: str
    body: str
    views: int
    is_pinned: bool
    video_url: Optional[str] = None
    author: UserPublic
    category_id: int
    created_at: datetime
    reply_count: int = 0
    class Config:
        from_attributes = True

class PostsPage(BaseModel):
    items: List[PostOut]
    total: int

class CategoryOut(BaseModel):
    id: int
    slug: str
    name: str
    description: Optional[str]
    icon: str
    post_count: int = 0
    class Config:
        from_attributes = True

# --- Character ---
class CharacterCreate(BaseModel):
    name: str

    @field_validator("name")
    @classmethod
    def name_valid(cls, v):
        if not re.match(r'^[A-Z][a-zA-Zа-яА-ЯёЁіІїЇєЄ]+_[A-Z][a-zA-Zа-яА-ЯёЁіІїЇєЄ]+$', v):
            raise ValueError("Ім'я має бути у форматі Name_Surname (наприклад: John_Doe)")
        if len(v) < 5 or len(v) > 32:
            raise ValueError("Ім'я має бути від 5 до 32 символів")
        return v

# --- News ---
class NewsCreate(BaseModel):
    title: str
    body: str
    image_url: Optional[str] = None
    video_url: Optional[str] = None

class NewsOut(BaseModel):
    id: int
    title: str
    body: str
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    author: UserPublic
    created_at: datetime
    class Config:
        from_attributes = True

class CharacterOut(BaseModel):
    id: int
    name: str
    job: str
    level: int
    xp: int
    cash: int
    bank: int
    hours: int
    is_online: bool
    class Config:
        from_attributes = True
