from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class News(Base):
    __tablename__ = "news"

    id         = Column(Integer, primary_key=True, index=True)
    title      = Column(String(256), nullable=False)
    body       = Column(Text, nullable=False)
    video_url  = Column(String(512), nullable=True)
    author_id  = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    author     = relationship("User")
