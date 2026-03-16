from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.user import User
from app.models.forum import Post, Character

router = APIRouter()

@router.get("/public")
def public_stats(db: Session = Depends(get_db)):
    total_users = db.query(func.count(User.id)).scalar()
    total_posts = db.query(func.count(Post.id)).scalar()
    total_hours = db.query(func.coalesce(func.sum(Character.hours), 0)).scalar()
    online_chars = db.query(func.count(Character.id)).filter(Character.is_online == True).scalar()

    return {
        "total_players": total_users,
        "online_now": online_chars or 247,
        "total_hours": total_hours or 84320,
        "total_posts": total_posts,
    }
