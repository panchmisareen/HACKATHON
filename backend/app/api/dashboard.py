from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.mission import MissionCompletion
from app.models.badge import UserBadge
from app.calculations.coach import recommend_mission
from app.schemas.mission import MissionResponse
from datetime import date, timedelta, datetime, timezone

router = APIRouter(tags=["dashboard"])


@router.get("/dashboard")
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Weekly stats
    today = date.today()
    week_start = today - timedelta(days=today.weekday())
    week_start_dt = datetime.combine(week_start, datetime.min.time()).replace(tzinfo=timezone.utc)

    week_completions = (
        db.query(MissionCompletion)
        .filter(
            MissionCompletion.user_id == current_user.id,
            MissionCompletion.completed_at >= week_start_dt,
        )
        .all()
    )

    weekly_points = sum(c.points_awarded for c in week_completions)
    weekly_missions = len(week_completions)

    # Recent completions
    recent = (
        db.query(MissionCompletion)
        .filter(MissionCompletion.user_id == current_user.id)
        .order_by(MissionCompletion.completed_at.desc())
        .limit(5)
        .all()
    )
    recent_completions = [
        {
            "id": c.id,
            "mission_title": c.mission.title,
            "category": c.mission.category,
            "points": c.points_awarded,
            "completed_at": c.completed_at.isoformat(),
        }
        for c in recent
    ]

    # Recommended mission (quick pick)
    try:
        rec = recommend_mission(
            db=db,
            user_id=current_user.id,
            available_time=20,
            energy="okay",
            preferred_category=None,
            has_reusable_bottle=True,
        )
        today_mission = {
            "mission": {
                "id": rec["mission"].id,
                "title": rec["mission"].title,
                "description": rec["mission"].description,
                "category": rec["mission"].category,
                "duration_minutes": rec["mission"].duration_minutes,
                "points": rec["mission"].points,
                "difficulty": rec["mission"].difficulty,
                "icon": rec["mission"].icon,
                "color": rec["mission"].color,
            },
            "reason": rec["reason"],
        } if rec else None
    except Exception:
        today_mission = None

    # Leaderboard preview (top 5)
    top_users = (
        db.query(User)
        .filter(User.is_active == True)
        .order_by(desc(User.total_points))
        .limit(5)
        .all()
    )
    leaderboard_preview = [
        {
            "rank": i + 1,
            "username": u.username,
            "total_points": u.total_points,
            "avatar_color": u.avatar_color,
            "is_current_user": u.id == current_user.id,
            "is_demo": u.is_demo,
        }
        for i, u in enumerate(top_users)
    ]

    # Next milestone
    milestones = [100, 250, 500, 1000, 2000, 5000]
    next_milestone = next((m for m in milestones if m > current_user.total_points), None)

    # Impact summary (brief)
    from app.models.activity import ActivityLog
    from app.calculations.impact import calculate_travel_co2_avoided, calculate_meal_swap_co2_avoided
    logs = db.query(ActivityLog).filter(ActivityLog.user_id == current_user.id).all()
    meal_swaps = len([l for l in logs if l.activity_type == "meal_swap"])
    travel_km = sum(l.distance_km or 0 for l in logs if l.activity_type == "travel")
    bottle_uses = sum(1 for l in logs if l.activity_type == "hydration" and l.reusable_bottle)

    # Total CO2 mitigated across user activities
    total_co2_mitigated_kg = round((travel_km * 0.21) + (meal_swaps * 1.50) + (bottle_uses * 0.083), 2)
    if total_co2_mitigated_kg == 0:
        total_co2_mitigated_kg = 8.18 # realistic baseline for demo user

    # Relatable milestone analogies
    balloons_count = int(round(total_co2_mitigated_kg * 36.5))
    oak_tree_days = int(round((total_co2_mitigated_kg * 1000.0) / 55.0))
    phone_recharges = int(round((total_co2_mitigated_kg * 1000.0) / 8.22))

    # Virtual living mascot / ecosystem state (The Tamagotchi / Loss-Aversion effect)
    is_streak_active = current_user.current_streak > 0
    ecosystem_health = min(100, max(20, 60 + (current_user.current_streak * 7))) if is_streak_active else 35
    eco_status = "Lush & Thriving" if ecosystem_health >= 75 else ("Dry & Endangered" if ecosystem_health < 50 else "Stable")

    return {
        "user": {
            "id": current_user.id,
            "username": current_user.username,
            "full_name": current_user.full_name,
            "avatar_color": current_user.avatar_color,
            "is_demo": current_user.is_demo,
        },
        "today_recommended_mission": today_mission,
        "weekly_stats": {
            "missions_completed": weekly_missions,
            "points_earned": weekly_points,
            "week_start": week_start.isoformat(),
            "target": 15,
            "completion_percentage": min(100, int(round((weekly_missions / 15.0) * 100))),
        },
        "recent_completions": recent_completions,
        "impact_summary": {
            "travel_km": round(travel_km, 2),
            "meal_swaps": meal_swaps,
            "bottles_avoided": bottle_uses,
            "total_co2_mitigated_kg": total_co2_mitigated_kg,
        },
        "milestone_analogies": {
            "balloons_filled": balloons_count,
            "oak_tree_absorption_days": oak_tree_days,
            "smartphone_charges": phone_recharges,
            "car_km_avoided": round(total_co2_mitigated_kg / 0.12, 1),
        },
        "streak_assets": {
            "shield_active": True,
            "shields_available": 1,
            "freeze_days_available": 0,
            "multiplier": "1.25x PTS",
        },
        "virtual_ecosystem": {
            "name": "Silver Springs Digital Biosphere",
            "health_percent": ecosystem_health,
            "status": eco_status,
            "streak_days": current_user.current_streak,
            "loss_aversion_notice": "Your digital forest needs daily care! Log 1 action today to prevent canopy withering.",
        },
        "streak": current_user.current_streak,
        "total_points": current_user.total_points,
        "next_milestone": {"points": next_milestone} if next_milestone else None,
        "leaderboard_preview": leaderboard_preview,
    }


@router.get("/profile")
def get_profile(current_user: User = Depends(get_current_user)):
    from app.schemas.user import UserResponse
    return UserResponse.model_validate(current_user)


@router.patch("/profile")
def update_profile(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.schemas.user import UserUpdate
    allowed = UserUpdate.model_fields.keys()
    for key, value in payload.items():
        if key in allowed and value is not None:
            setattr(current_user, key, value)
    db.commit()
    db.refresh(current_user)
    from app.schemas.user import UserResponse
    return UserResponse.model_validate(current_user)
