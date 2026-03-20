from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id                 = Column(Integer, primary_key=True, index=True)
    username           = Column(String(32), unique=True, index=True, nullable=False)
    email              = Column(String(128), unique=True, index=True, nullable=False)
    password           = Column(String(256), nullable=False)
    role               = Column(String(20), default="player")   # player | moderator | admin
    is_active          = Column(Boolean, default=True)
    avatar             = Column(String(256), nullable=True)
    created_at         = Column(DateTime, default=datetime.utcnow)
    last_seen          = Column(DateTime, default=datetime.utcnow)
    forum_banned_until = Column(DateTime, nullable=True)

    posts      = relationship("Post", back_populates="author")
    characters = relationship("Character", back_populates="user")
