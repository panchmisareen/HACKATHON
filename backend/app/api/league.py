from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Optional
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.mission import MissionCompletion
from app.models.badge import Team, TeamMembership, UserBadge
from app.schemas.leaderboard import LeaderboardEntry, TeamLeaderboardEntry, PassportResponse

router = APIRouter(tags=["league"])


@router.get("/leaderboard", response_model=List[LeaderboardEntry])
def get_leaderboard(
    limit: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    users = (
        db.query(User)
        .filter(User.is_active == True)
        .order_by(desc(User.total_points))
        .limit(limit)
        .all()
    )

    result = []
    for rank, user in enumerate(users, 1):
        missions_completed = db.query(func.count(MissionCompletion.id)).filter(
            MissionCompletion.user_id == user.id
        ).scalar() or 0

        badges_count = db.query(func.count(UserBadge.id)).filter(
            UserBadge.user_id == user.id
        ).scalar() or 0

        result.append(LeaderboardEntry(
            rank=rank,
            user_id=user.id,
            username=user.username,
            full_name=user.full_name,
            avatar_color=user.avatar_color,
            total_points=user.total_points,
            missions_completed=missions_completed,
            current_streak=user.current_streak,
            badges_count=badges_count,
            is_demo=user.is_demo,
            is_current_user=(user.id == current_user.id),
        ))

    return result


@router.get("/leaderboard/teams", response_model=List[TeamLeaderboardEntry])
def get_team_leaderboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    teams = db.query(Team).filter(Team.members.any()).all()

    result = []
    for team in teams:
        member_ids = [m.user_id for m in team.members]
        total_points = db.query(func.sum(User.total_points)).filter(
            User.id.in_(member_ids)
        ).scalar() or 0

        total_missions = db.query(func.count(MissionCompletion.id)).filter(
            MissionCompletion.user_id.in_(member_ids)
        ).scalar() or 0

        result.append(TeamLeaderboardEntry(
            rank=0,  # Will be set after sorting
            team_id=team.id,
            team_name=team.name,
            team_type=team.team_type,
            avatar_color=team.avatar_color,
            total_points=total_points,
            missions_completed=total_missions,
            member_count=len(member_ids),
            is_demo=team.is_demo,
        ))

    result.sort(key=lambda x: x.total_points, reverse=True)
    for i, entry in enumerate(result):
        entry.rank = i + 1

    return result


@router.get("/passport", response_model=PassportResponse)
def get_passport(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.models.badge import UserBadge, Badge
    from app.models.activity import ActivityLog
    from app.calculations.impact import (
        calculate_travel_co2_avoided, calculate_bottles_avoided,
        calculate_bottles_co2_avoided, calculate_meal_swap_co2_avoided,
    )
    from datetime import date, timedelta

    # Badges
    user_badges = (
        db.query(UserBadge)
        .filter(UserBadge.user_id == current_user.id)
        .order_by(UserBadge.earned_at.desc())
        .all()
    )

    # Recent activity
    completions = (
        db.query(MissionCompletion)
        .filter(MissionCompletion.user_id == current_user.id)
        .order_by(MissionCompletion.completed_at.desc())
        .limit(10)
        .all()
    )
    recent_activity = [
        {
            "type": "mission_completion",
            "title": c.mission.title,
            "points": c.points_awarded,
            "category": c.mission.category,
            "completed_at": c.completed_at.isoformat(),
        }
        for c in completions
    ]

    # Weekly progress (current week)
    today = date.today()
    week_start = today - timedelta(days=today.weekday())
    week_completions = [
        c for c in completions
        if c.completed_at.date() >= week_start
    ]

    # Cumulative metrics from activity logs
    logs = db.query(ActivityLog).filter(ActivityLog.user_id == current_user.id).all()
    travel_km = sum(l.distance_km or 0 for l in logs if l.activity_type == "travel")
    movement_minutes = sum(l.duration_minutes or 0 for l in logs if l.activity_type == "movement")
    meal_swaps = len([l for l in logs if l.activity_type == "meal_swap"])
    water_ml = sum(l.water_ml or 0 for l in logs if l.activity_type == "hydration")
    bottle_uses = sum(1 for l in logs if l.activity_type == "hydration" and l.reusable_bottle)

    total_missions = db.query(func.count(MissionCompletion.id)).filter(
        MissionCompletion.user_id == current_user.id
    ).scalar() or 0

    # Milestones
    milestones = []
    milestone_defs = [
        ("First Mission", 1, "missions"),
        ("5 Missions", 5, "missions"),
        ("10 Missions", 10, "missions"),
        ("25 Missions", 25, "missions"),
        ("50 Missions", 50, "missions"),
        ("100 Points", 100, "points"),
        ("500 Points", 500, "points"),
        ("1000 Points", 1000, "points"),
        ("3-Day Streak", 3, "streak"),
        ("7-Day Streak", 7, "streak"),
    ]

    for name, value, m_type in milestone_defs:
        achieved = False
        if m_type == "missions":
            achieved = total_missions >= value
        elif m_type == "points":
            achieved = current_user.total_points >= value
        elif m_type == "streak":
            achieved = current_user.longest_streak >= value

        milestones.append({"name": name, "value": value, "type": m_type, "achieved": achieved})

    from app.schemas.leaderboard import UserBadgeResponse, BadgeResponse
    badge_responses = [
        {
            "id": ub.id,
            "badge": {
                "id": ub.badge.id,
                "name": ub.badge.name,
                "description": ub.badge.description,
                "icon": ub.badge.icon,
                "color": ub.badge.color,
                "category": ub.badge.category,
                "criteria_type": ub.badge.criteria_type,
                "criteria_value": ub.badge.criteria_value,
            },
            "earned_at": ub.earned_at.isoformat(),
        }
        for ub in user_badges
    ]

    return {
        "user": {
            "id": current_user.id,
            "username": current_user.username,
            "full_name": current_user.full_name,
            "avatar_color": current_user.avatar_color,
            "email": current_user.email,
            "is_demo": current_user.is_demo,
        },
        "total_missions": total_missions,
        "current_streak": current_user.current_streak,
        "longest_streak": current_user.longest_streak,
        "total_points": current_user.total_points,
        "badges": badge_responses,
        "recent_activity": recent_activity,
        "weekly_progress": {
            "missions_this_week": len(week_completions),
            "points_this_week": sum(c.points_awarded for c in week_completions),
        },
        "cumulative_metrics": {
            "travel_km": round(travel_km, 2),
            "movement_minutes": round(movement_minutes, 1),
            "meal_swaps": meal_swaps,
            "water_ml": water_ml,
            "reusable_bottle_uses": bottle_uses,
        },
        "milestones": milestones,
    }


# ==========================================
# INTER-HOSTEL & INTER-DEPARTMENT TOURNAMENT GRID
# ==========================================
HOSTEL_TOURNAMENT_STANDINGS = [
    {
        "rank": 1,
        "name": "Silver Springs Hostel Alpha (Block A)",
        "type": "hostel",
        "members_active": 142,
        "weekly_points": 4820,
        "co2_mitigated_kg": 184.2,
        "streak_shield_rate": "92%",
        "trophy": "🏆 Current Leader",
        "perk_reward": "50% Off Campus Cafe for All Residents This Friday",
    },
    {
        "rank": 2,
        "name": "Homi Bhabha Hall of Residence",
        "type": "hostel",
        "members_active": 128,
        "weekly_points": 4410,
        "co2_mitigated_kg": 162.8,
        "streak_shield_rate": "88%",
        "trophy": "🥈 Contender",
        "perk_reward": "Priority Study Room Booking for Next Term",
    },
    {
        "rank": 3,
        "name": "Aryabhatta Tower (Block B)",
        "type": "hostel",
        "members_active": 115,
        "weekly_points": 3980,
        "co2_mitigated_kg": 145.0,
        "streak_shield_rate": "84%",
        "trophy": "🥉 Podium",
        "perk_reward": "Free Campus Cycle Fleet Weekend Pass",
    },
    {
        "rank": 4,
        "name": "Department of Computer Science & AI",
        "type": "department",
        "members_active": 210,
        "weekly_points": 3840,
        "co2_mitigated_kg": 140.4,
        "streak_shield_rate": "79%",
        "trophy": "Top Academic Dept",
        "perk_reward": "Institutional Green Computing Badge",
    },
    {
        "rank": 5,
        "name": "Sarojini Naidu Hall",
        "type": "hostel",
        "members_active": 98,
        "weekly_points": 3420,
        "co2_mitigated_kg": 125.6,
        "streak_shield_rate": "81%",
        "trophy": "Rising Challenger",
        "perk_reward": "Free Organic Smoothie Coupon",
    },
    {
        "rank": 6,
        "name": "Biotech & Sustainable Engineering",
        "type": "department",
        "members_active": 84,
        "weekly_points": 2960,
        "co2_mitigated_kg": 110.2,
        "streak_shield_rate": "76%",
        "trophy": "Eco Innovator",
        "perk_reward": "Research Lab Sustainability Grant Match",
    },
]


@router.get("/tournaments/hostels")
def get_hostel_tournaments():
    """
    Campus Grid Live: 12 Hostels & Departments actively competing.
    """
    return {
        "tournament_name": "Autumn Campus Cup 2024",
        "days_remaining": 4,
        "active_units": 12,
        "total_campus_co2_avoided_kg": 1284.6,
        "standings": HOSTEL_TOURNAMENT_STANDINGS,
        "prize_pool": "Winning hostel earns free campus cafe artisan beverages and grand trophy ceremony.",
    }


@router.get("/tournaments/digital-signage")
def get_digital_signage_feed():
    """
    Public digital signage JSON API feed streaming directly to campus dining hall TV screens.
    """
    return {
        "ticker": "🌿 ECOPULSE LIVE CAMPUS TOURNAMENT — PW IOI NOIDA ✦ TOP HOSTEL: SILVER SPRINGS BLOCK A (4,820 PTS) ✦ 184.2 KG CO2 MITIGATED THIS WEEK",
        "current_leader": HOSTEL_TOURNAMENT_STANDINGS[0],
        "top_three": HOSTEL_TOURNAMENT_STANDINGS[:3],
        "refresh_interval_seconds": 30,
        "timestamp_utc": "2024-10-25T06:00:00Z",
    }
