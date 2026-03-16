from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_token, get_current_user
from app.models.user import User
from app.schemas.schemas import RegisterRequest, LoginRequest, TokenResponse, UserMe

router = APIRouter()

@router.post("/register", response_model=TokenResponse, status_code=201)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == body.username).first():
        raise HTTPException(400, "Username already taken")
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(400, "Email already registered")

    user = User(
        username=body.username,
        email=body.email,
        password=hash_password(body.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_token({"sub": user.id, "username": user.username})
    return TokenResponse(access_token=token)

@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == body.username).first()
    if not user or not verify_password(body.password, user.password):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid credentials")
    token = create_token({"sub": user.id, "username": user.username})
    return TokenResponse(access_token=token)

@router.get("/me", response_model=UserMe)
def me(user: User = Depends(get_current_user)):
    return user
