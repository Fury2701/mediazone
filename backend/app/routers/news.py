from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session, joinedload
from typing import List
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.news import News
from app.schemas.schemas import NewsCreate, NewsOut

router = APIRouter()

@router.get("", response_model=List[NewsOut])
def get_news(skip: int = 0, limit: int = 20, response: Response = None, db: Session = Depends(get_db)):
    total = db.query(News).count()
    items = db.query(News).options(joinedload(News.author)).order_by(News.created_at.desc()).offset(skip).limit(limit).all()
    response.headers["X-Total-Count"] = str(total)
    return items

@router.post("", response_model=NewsOut, status_code=201)
def create_news(body: NewsCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role != "admin":
        raise HTTPException(403, "Admin only")
    news = News(title=body.title, body=body.body, image_url=body.image_url, video_url=body.video_url, author_id=user.id)
    db.add(news)
    db.commit()
    db.refresh(news)
    return news

@router.delete("/{news_id}", status_code=204)
def delete_news(news_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role != "admin":
        raise HTTPException(403, "Admin only")
    news = db.query(News).filter(News.id == news_id).first()
    if not news:
        raise HTTPException(404, "Not found")
    db.delete(news)
    db.commit()
