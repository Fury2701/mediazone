from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user, hash_password, verify_password
from app.models.user import User
from app.models.forum import Character
from app.schemas.schemas import (
    CharacterCreate, CharacterOut, UserMe, UserPublic,
    ChangePasswordRequest, UserAdmin, SetRoleRequest,
)
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

@router.put("/me/password", status_code=204)
def change_password(body: ChangePasswordRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not verify_password(body.old_password, user.password):
        raise HTTPException(400, "Incorrect current password")
    user.password = hash_password(body.new_password)
    db.commit()

@router.get("/admin/list", response_model=List[UserAdmin])
def admin_list_users(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role != "admin":
        raise HTTPException(403, "Forbidden")
    return db.query(User).order_by(User.id).all()

@router.put("/admin/{user_id}/role", status_code=204)
def admin_set_role(user_id: int, body: SetRoleRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role != "admin":
        raise HTTPException(403, "Forbidden")
    if body.role not in ("player", "moderator", "admin"):
        raise HTTPException(400, "Invalid role")
    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(404, "User not found")
    target.role = body.role
    db.commit()

@router.put("/admin/{user_id}/ban", status_code=204)
def admin_toggle_ban(user_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role != "admin":
        raise HTTPException(403, "Forbidden")
    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(404, "User not found")
    target.is_active = not target.is_active
    db.commit()

@router.get("/{username}", response_model=UserPublic)
def get_user(username: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(404, "User not found")
    return user
