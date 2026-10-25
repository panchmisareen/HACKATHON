from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional
from app.core.database import get_db
from app.api.deps import get_current_user, get_optional_user
from app.models.user import User
from app.models.activity import ActivityLog
from app.schemas.calculator import (
    GenZFootprintRequest,
    IndiaFootprintRequest,
    SyncHabitsRequest,
)
from app.calculations.footprint_engine import (
    GENZ_CATEGORIES,
    EQUIVALENCIES,
    INDIAN_EMISSION_FACTORS,
    BENCHMARKS,
    TRACKER_CRITERIA,
    REGIONAL_GRID_FACTORS,
    DELIVERY_LOGISTICS_FACTORS,
    SCIENTIFIC_CITATIONS,
    calculate_genz_footprint,
    calculate_india_footprint,
    calculate_unified_footprint,
)

router = APIRouter(prefix="/calculator", tags=["calculator"])


@router.get("/metadata")
def get_calculator_metadata():
    """Returns all factors, benchmarks, and category structures."""
    return {
        "genz_categories": GENZ_CATEGORIES,
        "equivalencies": EQUIVALENCIES,
        "indian_factors": INDIAN_EMISSION_FACTORS,
        "benchmarks": BENCHMARKS,
        "criteria": TRACKER_CRITERIA,
        "regional_grids": REGIONAL_GRID_FACTORS,
        "delivery_logistics": DELIVERY_LOGISTICS_FACTORS,
        "citations": SCIENTIFIC_CITATIONS,
    }


@router.get("/utility/providers")
def get_utility_providers():
    """Supported smart meter & electric utility OAuth API providers."""
    return [
        {
            "id": "tata_power_mumbai",
            "name": "Tata Power (Smart Meter AMI)",
            "region": "India - Mumbai / Delhi",
            "protocol": "OAuth 2.0 / Green Button Data",
            "connected": True,
            "last_meter_kwh": 142.8,
            "peak_kwh": 48.2,
            "off_peak_kwh": 94.6,
            "status": "Live Telemetry Active",
        },
        {
            "id": "bses_delhi",
            "name": "BSES Rajdhani / Yamuna Power",
            "region": "India - Delhi NCR",
            "protocol": "Smart Meter AMI API",
            "connected": False,
            "last_meter_kwh": 165.4,
            "status": "OAuth Available",
        },
        {
            "id": "smartthings_energy",
            "name": "Samsung SmartThings Energy",
            "region": "Global (Smart Plugs & ACs)",
            "protocol": "Smart Home IoT Hook",
            "connected": True,
            "last_meter_kwh": 38.4,
            "status": "IoT Plug Stream Active",
        },
        {
            "id": "tuya_smart_plug",
            "name": "Tuya / Smart Life Zigbee Plug",
            "region": "Global Appliance Monitoring",
            "protocol": "Tuya Cloud Open API",
            "connected": False,
            "last_meter_kwh": 22.1,
            "status": "Link Available",
        },
        {
            "id": "pge_green_button",
            "name": "PG&E Green Button Connect My Data",
            "region": "United States (California)",
            "protocol": "Green Button OAuth 2.0",
            "connected": False,
            "last_meter_kwh": 280.0,
            "status": "OAuth Ready",
        },
    ]


@router.post("/utility/sync")
def sync_utility_meter(payload: Dict[str, Any]):
    """
    Simulates automated OAuth fetch of exact kilowatt-hour (kWh) data
    from electrical utility smart meter or smart plug.
    """
    provider_id = payload.get("provider_id", "tata_power_mumbai")
    grid_region = payload.get("grid_region", "India (CEA Baseline)")
    factor = REGIONAL_GRID_FACTORS.get(grid_region, {}).get("factor_kg_kwh", 0.82)
    
    # Metered kWh telemetry with realistic time-of-day breakdown
    kwh = 142.8 if "tata" in provider_id else (38.4 if "smartthings" in provider_id else 125.0)
    co2_kg = round(kwh * factor, 2)
    standby_waste_kwh = round(kwh * 0.12, 2)
    standby_co2_kg = round(standby_waste_kwh * factor, 2)

    return {
        "status": "synced",
        "provider": provider_id,
        "grid_region": grid_region,
        "metered_kwh": kwh,
        "peak_kwh": round(kwh * 0.35, 1),
        "off_peak_kwh": round(kwh * 0.65, 1),
        "co2_emissions_kg": co2_kg,
        "standby_consumption_kwh": standby_waste_kwh,
        "standby_emissions_kg": standby_co2_kg,
        "data_fidelity": "Level 4 (Direct AMI Smart Meter)",
        "citation": REGIONAL_GRID_FACTORS.get(grid_region, {}).get("source", "Standard Reference"),
    }


@router.get("/criteria")
def get_tracker_criteria():
    """Returns methodology on what to include vs. delete/exclude in modern trackers."""
    return TRACKER_CRITERIA


@router.post("/genz")
def calculate_genz(payload: GenZFootprintRequest):
    """Calculates Gen Z daily footprint based on activity inputs."""
    result = calculate_genz_footprint(payload.inputs)
    return result


@router.post("/india")
def calculate_india(payload: IndiaFootprintRequest):
    """Calculates comprehensive India + Gen Z carbon footprint."""
    result = calculate_india_footprint(payload.model_dump())
    return result


@router.post("/unified")
def calculate_unified(payload: Dict[str, Any]):
    """Calculates all-in-one unified carbon footprint combining Indian utilities + Gen Z habits."""
    result = calculate_unified_footprint(payload)
    return result


@router.post("/sync-habits", status_code=status.HTTP_201_CREATED)
def sync_calculator_habits(
    payload: SyncHabitsRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """
    Awards EcoPulse points and logs activity when user commits
    to daily low-carbon habits tracked in the calculator.
    """
    points_awarded = 25
    new_points = None

    if current_user:
        current_user.total_points += points_awarded
        log = ActivityLog(
            user_id=current_user.id,
            activity_type="movement",
            sub_type="carbon_reduction_habits",
            duration_minutes=15.0,
            notes=f"Calculator Habit Log: {payload.summary} (Saved ~{payload.total_saved_co2_kg:.2f} kg CO2e)",
            extra_data={"habits": payload.habits_logged, "saved_co2_kg": payload.total_saved_co2_kg},
        )
        db.add(log)
        db.commit()
        db.refresh(current_user)
        new_points = current_user.total_points

    return {
        "status": "success",
        "points_awarded": points_awarded,
        "new_total_points": new_points,
        "message": f"Recorded habits! +{points_awarded} points added to your score.",
    }
