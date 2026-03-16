from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.forum import Character
from app.schemas.schemas import CharacterCreate, CharacterOut, UserMe
from typing import List

router = APIRouter()

@router.get("/me", response_model=UserMe)
def get_me(user: User = Depends(get_current_user)):
    return user

@router.get("/me/characters", response_model=List[CharacterOut])
def get_my_characters(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Character).filter(Character.user_id == user.id).all()

@router.post("/me/characters", response_model=CharacterOut, status_code=201)
def create_character(body: CharacterCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    count = db.query(Character).filter(Character.user_id == user.id).count()
    if count >= 5:
        raise HTTPException(400, "Max 5 characters per account")
    char = Character(user_id=user.id, name=body.name)
    db.add(char)
    db.commit()
    db.refresh(char)
    return char

@router.get("/{username}", response_model=UserMe)
def get_user(username: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(404, "User not found")
    return user
