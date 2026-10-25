from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    email: str = Field(..., description="User email address")
    username: str = Field(..., min_length=1, max_length=100)
    full_name: str = Field(..., min_length=1, max_length=200)


class UserCreate(BaseModel):
    email: str
    password: str = Field(..., min_length=3)
    username: Optional[str] = None
    full_name: Optional[str] = None


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    weekly_focus: Optional[str] = None
    daily_hydration_goal_ml: Optional[int] = None
    weekly_active_travel_goal_km: Optional[float] = None
    weekly_movement_goal_minutes: Optional[int] = None
    weekly_meal_swap_goal: Optional[int] = None
    avatar_color: Optional[str] = None
    timezone: Optional[str] = None


class UserResponse(UserBase):
    id: int
    bio: Optional[str]
    avatar_color: str
    timezone: str
    total_points: int
    current_streak: int
    longest_streak: int
    is_demo: bool
    daily_hydration_goal_ml: int
    weekly_active_travel_goal_km: float
    weekly_movement_goal_minutes: int
    weekly_meal_swap_goal: int
    weekly_focus: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
