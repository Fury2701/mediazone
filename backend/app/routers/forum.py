from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import List, Optional
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.forum import Category, Post, Reply
from app.schemas.schemas import CategoryOut, PostCreate, PostOut, ReplyCreate, ReplyOut

router = APIRouter()

@router.get("/categories", response_model=List[CategoryOut])
def get_categories(db: Session = Depends(get_db)):
    cats = db.query(Category).order_by(Category.order).all()
    result = []
    for c in cats:
        count = db.query(func.count(Post.id)).filter(Post.category_id == c.id).scalar()
        out = CategoryOut.model_validate(c)
        out.post_count = count
        result.append(out)
    return result

@router.get("/posts", response_model=List[PostOut])
def get_posts(
    category_id: Optional[int] = None,
    author_username: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
):
    q = db.query(Post).options(joinedload(Post.author))
    if category_id:
        q = q.filter(Post.category_id == category_id)
    if author_username:
        q = q.join(User).filter(User.username == author_username)
    posts = q.order_by(Post.is_pinned.desc(), Post.created_at.desc()).offset(skip).limit(limit).all()
    result = []
    for p in posts:
        out = PostOut.model_validate(p)
        out.reply_count = db.query(func.count(Reply.id)).filter(Reply.post_id == p.id).scalar()
        result.append(out)
    return result

@router.post("/posts", response_model=PostOut, status_code=201)
def create_post(body: PostCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cat = db.query(Category).filter(Category.id == body.category_id).first()
    if not cat:
        raise HTTPException(404, "Category not found")
    post = Post(title=body.title, body=body.body, category_id=body.category_id, author_id=user.id, video_url=body.video_url)
    db.add(post)
    db.commit()
    db.refresh(post)
    return PostOut.model_validate(post)

@router.get("/posts/{post_id}", response_model=PostOut)
def get_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(Post).options(joinedload(Post.author)).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(404, "Post not found")
    post.views += 1
    db.commit()
    out = PostOut.model_validate(post)
    out.reply_count = db.query(func.count(Reply.id)).filter(Reply.post_id == post_id).scalar()
    return out

@router.get("/posts/{post_id}/replies", response_model=List[ReplyOut])
def get_replies(post_id: int, db: Session = Depends(get_db)):
    return db.query(Reply).options(joinedload(Reply.author)).filter(Reply.post_id == post_id).order_by(Reply.created_at).all()

@router.post("/posts/{post_id}/replies", response_model=ReplyOut, status_code=201)
def create_reply(post_id: int, body: ReplyCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not db.query(Post).filter(Post.id == post_id).first():
        raise HTTPException(404, "Post not found")
    reply = Reply(body=body.body, post_id=post_id, author_id=user.id)
    db.add(reply)
    db.commit()
    db.refresh(reply)
    return reply
