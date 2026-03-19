from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, BigInteger
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Category(Base):
    __tablename__ = "categories"

    id          = Column(Integer, primary_key=True)
    slug        = Column(String(64), unique=True, nullable=False)
    name        = Column(String(128), nullable=False)
    description = Column(String(256))
    icon        = Column(String(8), default="💬")
    order       = Column(Integer, default=0)
    posts       = relationship("Post", back_populates="category")

class Post(Base):
    __tablename__ = "posts"

    id          = Column(Integer, primary_key=True, index=True)
    title       = Column(String(256), nullable=False)
    body        = Column(Text, nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    author_id   = Column(Integer, ForeignKey("users.id"), nullable=False)
    is_pinned   = Column(Boolean, default=False)
    views       = Column(Integer, default=0)
    video_url   = Column(String(512), nullable=True)
    created_at  = Column(DateTime, default=datetime.utcnow)
    updated_at  = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    category    = relationship("Category", back_populates="posts")
    author      = relationship("User", back_populates="posts")
    replies     = relationship("Reply", back_populates="post")

class Reply(Base):
    __tablename__ = "replies"

    id         = Column(Integer, primary_key=True)
    body       = Column(Text, nullable=False)
    post_id    = Column(Integer, ForeignKey("posts.id"), nullable=False)
    author_id  = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    post       = relationship("Post", back_populates="replies")
    author     = relationship("User")

class Character(Base):
    __tablename__ = "characters"

    id         = Column(Integer, primary_key=True)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=False)
    name       = Column(String(64), nullable=False)
    job        = Column(String(64), default="Безробітний")
    level      = Column(Integer, default=1)
    xp         = Column(Integer, default=0)
    cash       = Column(BigInteger, default=5000)
    bank       = Column(BigInteger, default=0)
    hours      = Column(Integer, default=0)
    is_online  = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user       = relationship("User", back_populates="characters")
