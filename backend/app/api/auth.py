from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.config import settings
from app.models.user import User
from app.schemas.user import UserCreate, LoginRequest, TokenResponse, UserResponse, UserUpdate
from datetime import timedelta

router = APIRouter(prefix="/auth", tags=["auth"])


class SwitchAccountRequest(BaseModel):
    user_id: Optional[int] = None
    email_or_username: Optional[str] = None


@router.post("/register", response_model=TokenResponse, status_code=201)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    clean_email = payload.email.strip().lower()
    
    # Auto-generate or sanitize username
    username = (payload.username or "").strip()
    if not username:
        username = clean_email.split("@")[0].replace(".", "_")
    
    # Auto-generate or sanitize full_name
    full_name = (payload.full_name or "").strip()
    if not full_name:
        full_name = username.replace("_", " ").title()

    # Check for existing email or username
    existing_by_email = db.query(User).filter(User.email == clean_email).first()
    if existing_by_email:
        # If password matches, automatically authenticate and sign in
        if verify_password(payload.password, existing_by_email.hashed_password):
            token = create_access_token({"sub": str(existing_by_email.id)})
            return TokenResponse(access_token=token, user=UserResponse.model_validate(existing_by_email))
        raise HTTPException(
            status_code=400,
            detail=f"An account with email '{clean_email}' already exists. Please switch to Sign In."
        )

    # Ensure username uniqueness
    existing_by_user = db.query(User).filter(User.username == username).first()
    if existing_by_user:
        base_username = username
        counter = 1
        while db.query(User).filter(User.username == username).first():
            username = f"{base_username}_{counter}"
            counter += 1

    user = User(
        email=clean_email,
        username=username,
        full_name=full_name,
        hashed_password=get_password_hash(payload.password),
        avatar_color="#15803D",
        total_points=0,
        current_streak=1,
        longest_streak=1,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        (User.email == payload.email) | (User.username == payload.email)
    ).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))


@router.post("/demo-login", response_model=TokenResponse)
def demo_login(db: Session = Depends(get_db)):
    """Login as the demo user without a password (for hackathon judges)."""
    user = db.query(User).filter(User.is_demo == True, User.id == settings.DEMO_USER_ID).first()
    if not user:
        raise HTTPException(status_code=404, detail="Demo user not found. Run seed script first.")
    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))


@router.post("/switch-account", response_model=TokenResponse)
def switch_account(payload: SwitchAccountRequest, db: Session = Depends(get_db)):
    """
    Switch active account on a shared device.
    Supports switching by user_id or email/username for verified campus profiles.
    """
    query = db.query(User)
    if payload.user_id:
        user = query.filter(User.id == payload.user_id).first()
    elif payload.email_or_username:
        user = query.filter(
            (User.email == payload.email_or_username) | (User.username == payload.email_or_username)
        ).first()
    else:
        raise HTTPException(status_code=400, detail="user_id or email_or_username required")

    if not user:
        raise HTTPException(status_code=404, detail="Account not found on campus directory")

    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))


@router.get("/demo-accounts")
def get_demo_accounts(db: Session = Depends(get_db)):
    """Return available campus student profiles for instant device account switching."""
    users = db.query(User).filter(User.is_demo == True).order_by(User.id).limit(6).all()
    roles = {
        1: "CS Sophomore (Hostel 4)",
        2: "Electronics Junior (Oak Hall)",
        3: "Mechanical Senior (Tech Block)",
        4: "Biotech Freshman (Silver Springs)",
        5: "Chemical Eng (Aryabhatta)",
        6: "Design Sophomore (Bhabha)",
    }
    return [
        {
            "id": u.id,
            "email": u.email,
            "username": u.username,
            "full_name": u.full_name,
            "avatar_color": u.avatar_color or "#15803D",
            "total_points": u.total_points or 0,
            "role": roles.get(u.id, "Student Peer"),
        }
        for u in users
    ]
