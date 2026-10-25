from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
import uuid

router = APIRouter(prefix="/marketplace", tags=["marketplace"])

MARKETPLACE_ITEMS = [
    {
        "id": "streak_shield",
        "category": "streak_asset",
        "title": "Streak Shield (24h)",
        "description": "Protects your active streak for 24 hours if you miss a daily habit log.",
        "cost_points": 300,
        "icon": "🛡️",
        "badge": "Popular Asset",
        "in_stock": True,
    },
    {
        "id": "streak_freeze_day",
        "category": "streak_asset",
        "title": "Exam / Travel Freeze Day",
        "description": "Pauses streak decay for 48 hours during busy exams or travel.",
        "cost_points": 200,
        "icon": "❄️",
        "badge": "Study Mode",
        "in_stock": True,
    },
    {
        "id": "campus_cafe_drink",
        "category": "campus_reward",
        "title": "Free Plant-Based Beverage",
        "description": "Redeemable at Campus Cafe for an Oat Milk Latte, Cold Brew, or Matcha.",
        "cost_points": 450,
        "icon": "☕",
        "badge": "Campus Partner",
        "in_stock": True,
    },
    {
        "id": "library_print_credits",
        "category": "campus_reward",
        "title": "Library Eco-Printing Pass",
        "description": "50 double-sided pages of recycled paper printing at Main Campus Library.",
        "cost_points": 150,
        "icon": "🖨️",
        "badge": "Academic Perk",
        "in_stock": True,
    },
    {
        "id": "sustainable_apparel",
        "category": "eco_coupon",
        "title": "20% Off Campus Eco-Apparel",
        "description": "Valid on certified organic cotton hoodies and canvas tote bags.",
        "cost_points": 600,
        "icon": "👕",
        "badge": "Partner Merchant",
        "in_stock": True,
    },
    {
        "id": "smart_bike_fleet_pass",
        "category": "mobility",
        "title": "Smart Bike Unlimited Pass",
        "description": "7 days of unlimited dock unlocks across all campus cycle hubs.",
        "cost_points": 350,
        "icon": "🚲",
        "badge": "Clean Transit",
        "in_stock": True,
    },
]

THRIFT_LISTINGS = [
    {
        "id": "th-1",
        "title": "Introduction to Algorithms (CLRS 4th Ed)",
        "category": "Textbook",
        "seller": "Aarav S. (Hostel 4)",
        "seller_contact": "aarav.s@pw.ioi.edu.in",
        "hostel": "Homi Bhabha Hall, Room 304",
        "price_inr": 450,
        "avoided_manufacturing_co2_kg": 5.4,
        "condition": "Like New",
        "status": "Available",
        "description": "Mint condition with minimal highlighting. Core reading for CS 201.",
        "created_at": "2024-10-24T14:20:00Z",
    },
    {
        "id": "th-2",
        "title": "Sony WH-CH520 Wireless Headphones",
        "category": "Electronics",
        "seller": "Priya K. (Oak Hall)",
        "seller_contact": "@priyak_ioi (Telegram)",
        "hostel": "Silver Springs Alpha, Room 112",
        "price_inr": 1200,
        "avoided_manufacturing_co2_kg": 14.8,
        "condition": "Excellent",
        "status": "Available",
        "description": "Great 50h battery life, perfect for study pods. Comes with original USB-C cable.",
        "created_at": "2024-10-25T08:15:00Z",
    },
    {
        "id": "th-3",
        "title": "Adjustable Ergonomic Desk Lamp (LED 3-Color)",
        "category": "Dorm Gear",
        "seller": "Rohit V. (Tech Block)",
        "seller_contact": "+91 98765 43210 (WhatsApp)",
        "hostel": "Aryabhatta Tower, Room 418",
        "price_inr": 350,
        "avoided_manufacturing_co2_kg": 6.2,
        "condition": "Good",
        "status": "Available",
        "description": "Warm & cool white modes. USB powered, saves bedside plug space.",
        "created_at": "2024-10-25T09:30:00Z",
    },
    {
        "id": "th-4",
        "title": "Organic Cotton Oversized Campus Hoodie (Size L)",
        "category": "Apparel",
        "seller": "Sneha M. (Silver Springs)",
        "seller_contact": "sneha.m@pw.ioi.edu.in",
        "hostel": "Silver Springs Alpha, Room 205",
        "price_inr": 500,
        "avoided_manufacturing_co2_kg": 8.1,
        "condition": "Worn Once",
        "status": "Available",
        "description": "Forest green heavyweight cotton hoodie. Super warm for winter terms.",
        "created_at": "2024-10-25T10:00:00Z",
    },
]

CATEGORY_CO2_BASELINES = {
    "Textbook": 5.4,
    "Electronics": 14.8,
    "Dorm Gear": 6.2,
    "Apparel": 8.1,
    "Lab Equipment": 4.5,
    "Sports & Mobility": 11.2,
    "Other": 4.0,
}


class CreateThriftListingRequest(BaseModel):
    title: str
    category: str = "Textbook"
    price_inr: float = 0.0
    condition: str = "Like New" # Brand New, Like New, Good, Fair
    hostel: Optional[str] = "Silver Springs Plot 13/14"
    seller_contact: Optional[str] = "Student Chat"
    description: Optional[str] = ""
    avoided_manufacturing_co2_kg: Optional[float] = None


class ClaimThriftListingRequest(BaseModel):
    listing_id: str
    buyer_note: Optional[str] = "I would like to pick this up!"


@router.get("/thrift")
def get_thrift_listings():
    total_saved_co2 = sum(i["avoided_manufacturing_co2_kg"] for i in THRIFT_LISTINGS if i.get("status") != "Archived")
    total_items = len(THRIFT_LISTINGS)
    total_monetary_value = sum(i["price_inr"] for i in THRIFT_LISTINGS)
    
    return {
        "listings": THRIFT_LISTINGS,
        "total_circular_co2_saved_kg": round(total_saved_co2, 1),
        "total_active_listings": total_items,
        "total_community_savings_inr": total_monetary_value,
        "category_baselines": CATEGORY_CO2_BASELINES,
        "impact_metric": "Based on ISO 14044 Life Cycle Assessment (LCA) avoided raw material extraction.",
    }


@router.post("/thrift", status_code=201)
def create_thrift_listing(
    payload: CreateThriftListingRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    List your own pre-loved item in the Circular Thrift Hub.
    Awards +35 green points to the student seller for enabling circular economy.
    """
    # Calculate avoided manufacturing CO2 if not manually specified
    co2_saved = payload.avoided_manufacturing_co2_kg
    if co2_saved is None or co2_saved <= 0:
        co2_saved = CATEGORY_CO2_BASELINES.get(payload.category, 5.0)

    seller_name = current_user.full_name or "PW Student"
    new_id = f"th-{len(THRIFT_LISTINGS) + 1}-{uuid.uuid4().hex[:4]}"

    new_item = {
        "id": new_id,
        "title": payload.title,
        "category": payload.category,
        "seller": f"{seller_name} ({current_user.username})",
        "seller_contact": payload.seller_contact or current_user.email,
        "hostel": payload.hostel or "PW IOI Campus",
        "price_inr": payload.price_inr,
        "avoided_manufacturing_co2_kg": round(co2_saved, 1),
        "condition": payload.condition,
        "status": "Available",
        "description": payload.description or "Listed on EcoPulse Circular Thrift Club.",
        "created_at": "2024-10-25T11:45:00Z",
    }

    THRIFT_LISTINGS.insert(0, new_item)

    # Award Green Points for circular listing (+35 pts)
    points_to_award = 35
    current_user.total_points = (current_user.total_points or 0) + points_to_award
    db.commit()
    db.refresh(current_user)

    # Generate shareable pass / text representation
    share_text = (
        f"🌿 Circular Campus Thrift Listing: {payload.title}\n"
        f"💰 Price: ₹{payload.price_inr} ({payload.condition})\n"
        f"🌱 Avoided CO2e: {co2_saved:.1f} kg (Avoided New Manufacturing)\n"
        f"📍 Location: {payload.hostel}\n"
        f"👤 Seller: {seller_name} ({payload.seller_contact})\n"
        f"✦ Verified on EcoPulse Campus Circular Thrift Club"
    )

    return {
        "success": True,
        "listing": new_item,
        "points_awarded": points_to_award,
        "new_total_points": current_user.total_points,
        "share_text": share_text,
        "message": f"Successfully listed '{payload.title}'! +{points_to_award} green points awarded.",
    }


@router.post("/thrift/claim")
def claim_thrift_item(
    payload: ClaimThriftListingRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Reserve/claim a pre-loved item from a peer. Awards +25 buyer circular points!
    """
    item = next((i for i in THRIFT_LISTINGS if i["id"] == payload.listing_id), None)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    item["status"] = "Reserved"
    buyer_points = 25
    current_user.total_points = (current_user.total_points or 0) + buyer_points
    db.commit()
    db.refresh(current_user)

    claim_token = f"CLAIM-{uuid.uuid4().hex[:6].upper()}"

    return {
        "success": True,
        "item_id": item["id"],
        "item_title": item["title"],
        "seller_contact": item.get("seller_contact"),
        "claim_token": claim_token,
        "points_awarded": buyer_points,
        "new_total_points": current_user.total_points,
        "message": f"Reserved '{item['title']}'! Claim Token: {claim_token}. Contact {item.get('seller_contact')} to arrange handoff. +{buyer_points} points awarded!",
    }
