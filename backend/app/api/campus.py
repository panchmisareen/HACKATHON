from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.location import CampusLocation
from app.models.activity import ActivityLog
from app.schemas.leaderboard import CampusLocationResponse
from app.services.badge_service import check_and_award_badges
from pydantic import BaseModel

router = APIRouter(prefix="/campus", tags=["campus"])


class CampusCheckinResponse(BaseModel):
    success: bool
    message: str
    points_earned: int
    new_total_points: int
    location_name: str


@router.get("/locations", response_model=List[CampusLocationResponse])
def get_locations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(CampusLocation).filter(CampusLocation.is_active == True).all()


@router.post("/locations/{location_id}/checkin", response_model=CampusCheckinResponse)
def checkin_at_location(
    location_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    loc = db.query(CampusLocation).filter(CampusLocation.id == location_id, CampusLocation.is_active == True).first()
    if not loc:
        raise HTTPException(status_code=404, detail="Campus location not found")

    points_to_award = 15
    current_user.total_points = (current_user.total_points or 0) + points_to_award

    # Log corresponding activity based on location category
    if loc.category == "water_refill":
        log = ActivityLog(
            user_id=current_user.id,
            activity_type="hydration",
            sub_type="water_station_refill",
            water_ml=500,
            reusable_bottle=True,
            notes=f"Refilled reusable bottle at {loc.name}",
        )
        db.add(log)
    elif loc.category == "bike_parking":
        log = ActivityLog(
            user_id=current_user.id,
            activity_type="travel",
            sub_type="cycle",
            distance_km=2.5,
            duration_minutes=12,
            notes=f"Parked eco-friendly bike at {loc.name}",
        )
        db.add(log)
    elif loc.category == "walking_route":
        log = ActivityLog(
            user_id=current_user.id,
            activity_type="movement",
            sub_type="canopy_walk",
            distance_km=1.4,
            duration_minutes=15,
            notes=f"Walked scenic trail at {loc.name}",
        )
        db.add(log)
    elif loc.category == "food":
        log = ActivityLog(
            user_id=current_user.id,
            activity_type="meals",
            sub_type="plant_bowl",
            notes=f"Ordered low-carbon food at {loc.name}",
        )
        db.add(log)
    else:
        log = ActivityLog(
            user_id=current_user.id,
            activity_type="movement",
            sub_type="eco_hub",
            notes=f"Eco action checked in at {loc.name}",
        )
        db.add(log)

    check_and_award_badges(db, current_user)
    db.commit()
    db.refresh(current_user)

    return CampusCheckinResponse(
        success=True,
        message=f"Awesome! Checked in at {loc.name}. Earned +{points_to_award} pts!",
        points_earned=points_to_award,
        new_total_points=current_user.total_points,
        location_name=loc.name,
    )


# ==========================================
# NFC SMART BINS, CROWDSOURCED AUDITS & CARPOOL
# ==========================================
class NFCTapRequest(BaseModel):
    bin_id: str = "bin_silver_springs_ground_recycle"
    waste_stream: str = "plastic_aluminium" # plastic_aluminium, organic_compost, e_waste


@router.post("/nfc-tap")
def log_nfc_smart_bin_tap(
    payload: NFCTapRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Simulates physical NFC tag tap or Bluetooth beacon proximity
    at campus waste segregation stations. Instantly logs verification and points.
    """
    points = 20
    current_user.total_points = (current_user.total_points or 0) + points

    log = ActivityLog(
        user_id=current_user.id,
        activity_type="movement",
        sub_type="nfc_bin_segregation",
        notes=f"NFC Verified: Segregated waste at {payload.bin_id} ({payload.waste_stream.replace('_', ' ').title()})",
        extra_data={"bin_id": payload.bin_id, "stream": payload.waste_stream, "avoided_methane_kg": 0.45},
    )
    db.add(log)
    db.commit()
    db.refresh(current_user)

    return {
        "success": True,
        "bin_id": payload.bin_id,
        "waste_stream": payload.waste_stream,
        "points_earned": points,
        "new_total_points": current_user.total_points,
        "message": "NFC Tap Verified! Waste properly segregated. +20 pts added to your score.",
    }


class AuditReportRequest(BaseModel):
    category: str = "leaking_water" # leaking_water, lights_left_on, broken_solar, waste_overflow
    location_description: str
    urgency: str = "medium" # low, medium, high
    notes: Optional[str] = None


@router.post("/audit-report")
def submit_crowdsourced_audit(
    payload: AuditReportRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Crowdsourced infrastructure audit report (leaking taps, empty lecture lights left on, solar maintenance).
    Awards +50 community bonus points.
    """
    points = 50
    current_user.total_points = (current_user.total_points or 0) + points

    log = ActivityLog(
        user_id=current_user.id,
        activity_type="movement",
        sub_type="campus_eco_audit",
        notes=f"Crowdsourced Audit: {payload.category} at {payload.location_description}",
        extra_data=payload.model_dump(),
    )
    db.add(log)
    db.commit()
    db.refresh(current_user)

    return {
        "success": True,
        "ticket_id": f"AUDIT-{current_user.id}-{int(db.query(ActivityLog).count())}",
        "points_awarded": points,
        "new_total_points": current_user.total_points,
        "message": f"Report received! Thank you for auditing campus facilities. +{points} community bonus points awarded.",
    }


@router.get("/carpool")
def get_carpool_groups():
    """
    Peer-to-peer clean commute groups: walking convoys, cycling fleets, EV shared rides.
    """
    return [
        {
            "id": "cp-1",
            "type": "walking_convoy",
            "title": "Morning Canopy Walk to Sector 126",
            "host": "Ananya D. (Hostel 3)",
            "meeting_point": "Sector 125 Metro Exit Gate 2",
            "time": "08:45 AM Daily",
            "members_count": 6,
            "transport_mode": "Zero-Emission Walking",
            "co2_avoided_daily_kg": 2.4,
        },
        {
            "id": "cp-2",
            "type": "cycling_group",
            "title": "Silver Springs Cycle Squad",
            "host": "Karan R. (Hostel 1)",
            "meeting_point": "Botanical Garden Cycle Bay",
            "time": "09:00 AM",
            "members_count": 4,
            "transport_mode": "Dedicated Cycle Lane",
            "co2_avoided_daily_kg": 4.1,
        },
        {
            "id": "cp-3",
            "type": "ev_carpool",
            "title": "South Delhi to Noida EV Shuttle",
            "host": "Rohan M. (Staff & Peer)",
            "meeting_point": "Kalkaji Mandir Metro",
            "time": "08:15 AM",
            "seats_left": 2,
            "transport_mode": "Electric Vehicle (Tata Nexon EV)",
            "co2_avoided_daily_kg": 8.6,
        },
    ]


@router.get("/iaq")
def get_indoor_air_quality():
    """
    Indoor Air Quality (IAQ) and localized campus sensor telemetry.
    """
    return {
        "overall_status": "Clean Canopy Air",
        "campus_average_aqi": 58,
        "campus_pm25": 14.2,
        "zones": [
            {"zone": "Main Reception & Living Wall", "aqi": 42, "status": "Optimal", "co2_ppm": 480},
            {"zone": "First Floor Study Pods & AI Lounge", "aqi": 52, "status": "Good", "co2_ppm": 540},
            {"zone": "Outdoor Shaded Botanical Canopy", "aqi": 68, "status": "Moderate", "co2_ppm": 410},
            {"zone": "East Wing Tech Labs", "aqi": 49, "status": "Good", "co2_ppm": 510},
        ],
        "recommended_path": "Use the West Wing Shaded Canopy corridor for minimum ambient exposure.",
    }


@router.get("/esg-export")
def get_esg_export_data():
    """
    Institutional Environmental, Social & Governance (ESG) audit-ready export.
    """
    return {
        "institution": "PW Institute of Innovation (PW IOI) Noida",
        "reporting_period": "Academic Year 2024-2025 (Q3 Telemetry)",
        "framework": "GHG Protocol Corporate Accounting Standard (Scopes 1, 2 & 3)",
        "scope1_direct_emissions_tco2e": 12.4,
        "scope2_grid_purchased_tco2e": 84.6,
        "scope3_student_commute_and_procurement_tco2e": 48.2,
        "total_mitigated_avoided_tco2e": 28.5,
        "active_student_participants": 1420,
        "audited_by": "Campus Sustainability & Facilities Office",
        "certification_status": "Gold Tier Green Campus Candidate",
    }
