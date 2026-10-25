from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from datetime import datetime, timezone
import uuid

router = APIRouter(prefix="/social", tags=["social"])

# Curated High-Definition Sustainability Photos (Unsplash CDN & Cloudinary-ready)
SAMPLE_ECO_PHOTOS = [
    "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1000&q=80", # Cycling commute
    "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1000&q=80", # Plant bowl
    "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=1000&q=80", # Recycling bin
    "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1000&q=80", # Solar study pod
    "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1000&q=80", # Planting tree
    "https://images.unsplash.com/photo-1528740561666-dc2479dc08ab?auto=format&fit=crop&w=1000&q=80", # Reusable cup / thrift
]

# Social Feed Posts Storage
FEED_POSTS = [
    {
        "id": "post-1",
        "author_name": "Priya Sharma",
        "author_username": "priya_s",
        "author_avatar_color": "#FF1493", # Neon Pink
        "author_hostel": "Oak Hall, Block B",
        "title": "Pedaled 12km through campus rain instead of taking the auto!",
        "content": "Swapped morning diesel auto for the campus smart bicycle. Saved ~2.5 kg CO₂e and felt super energized for the 9 AM Data Structures lecture! 🚴🌱",
        "image_url": "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1000&q=80",
        "action_tag": "#ZeroEmissionCommute",
        "avoided_co2_kg": 2.5,
        "likes_count": 34,
        "liked_by_me": False,
        "verified_eco_proof": True,
        "timestamp": "12 minutes ago",
        "comments": [
            {"user": "Alex Green", "avatar_color": "#00F0FF", "text": "Huge effort in the rain! Keep the streak alive 🔥"},
            {"user": "Rahul Kumar", "avatar_color": "#FFE600", "text": "Oak Hall leading the Green Cup this week!"}
        ]
    },
    {
        "id": "post-2",
        "author_name": "Alex Green",
        "author_username": "eco_demo",
        "author_avatar_color": "#00F0FF", # Neon Cyan
        "author_hostel": "Homi Bhabha Hall",
        "title": "100% Plant-Based Dining Hall Challenge Day 5",
        "content": "Replaced dairy & mutton curry with this hearty spiced chickpea & quinoa bowl at Cafeteria 2. Tastes incredible and cuts over 1.8 kg upstream agricultural emissions! 🥗✨",
        "image_url": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1000&q=80",
        "action_tag": "#PlantFuelChampion",
        "avoided_co2_kg": 1.8,
        "likes_count": 52,
        "liked_by_me": True,
        "verified_eco_proof": True,
        "timestamp": "45 minutes ago",
        "comments": [
            {"user": "Meera Verma", "avatar_color": "#39FF14", "text": "That quinoa bowl is elite. Got the cafe coupon today!"}
        ]
    },
    {
        "id": "post-3",
        "author_name": "Meera Verma",
        "author_username": "meera_v",
        "author_avatar_color": "#39FF14", # Neon Lime
        "author_hostel": "Silver Springs Alpha",
        "title": "Thrifted Course Textbook Handoff on 1st Floor Lobby!",
        "content": "Handed over my CLRS Algorithms 4th Edition to a junior. Avoided 5.4 kg of virgin paper pulp harvesting and offset printing footprint! Circular economy in action 📚♻️",
        "image_url": "https://images.unsplash.com/photo-1528740561666-dc2479dc08ab?auto=format&fit=crop&w=1000&q=80",
        "action_tag": "#CircularThriftDrop",
        "avoided_co2_kg": 5.4,
        "likes_count": 41,
        "liked_by_me": False,
        "verified_eco_proof": True,
        "timestamp": "2 hours ago",
        "comments": [
            {"user": "Priya Sharma", "avatar_color": "#FF1493", "text": "Circular Thrift Club is the best thing added to campus!"}
        ]
    },
    {
        "id": "post-4",
        "author_name": "Rahul Kumar",
        "author_username": "rahul_k",
        "author_avatar_color": "#FFE600", # Neon Yellow
        "author_hostel": "Aryabhatta Tech Tower",
        "title": "Hostel 3 Clean Sweep: 40 Reusable Bottles Verified",
        "content": "Installed water filter meter telemetry in our common room. Zero plastic bottles used all day by 40 residents! Avoided 3.2 kg plastic manufacturing emissions. 💧🌿",
        "image_url": "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=1000&q=80",
        "action_tag": "#PlasticFreeCampus",
        "avoided_co2_kg": 3.2,
        "likes_count": 29,
        "liked_by_me": False,
        "verified_eco_proof": True,
        "timestamp": "4 hours ago",
        "comments": []
    }
]

# Lowest Carbon Footprint Laureate Champion Data
LOWEST_FOOTPRINT_CHAMPION = {
    "name": "Sneha Menon",
    "username": "sneha_m",
    "avatar_color": "#BD00FF", # Neon Purple
    "department": "Biotechnology (2nd Year)",
    "hostel": "Silver Springs Alpha, Room 205",
    "weekly_net_footprint_kg": 3.12, # Ultra-low carbon footprint
    "campus_average_footprint_kg": 18.45,
    "total_avoided_co2_kg": 46.8,
    "active_streak_days": 28,
    "verified_clean_commute_km": 64.2,
    "special_laureate_title": "The Golden Leaf Campus Laureate",
    "exclusive_rewards": [
        "🏆 Official Presidential Green Fellowship Medal & Transcript Distinction",
        "🍽️ 1 Month 100% Free Organic Dining Pass at Campus Central Cafe",
        "🚲 VIP Unlimited Smart Electric Bike Dock (Guaranteed Daily Reserve)",
        "🌱 Permanent Tree Planted in Campus Eco-Grove in Her Honor"
    ],
    "quote": "Small shifts in what we eat and how we travel compound into massive carbon mitigation. Anyone can do it!"
}


class CreatePostRequest(BaseModel):
    title: str
    content: str
    image_url: Optional[str] = None
    action_tag: Optional[str] = "#ZeroWaste"
    avoided_co2_kg: float = 2.0


class LikePostRequest(BaseModel):
    post_id: str


class CommentRequest(BaseModel):
    post_id: str
    text: str


@router.get("/feed")
def get_feed_posts():
    """Retrieve community social posts with photo proofs of carbon reduction."""
    total_avoided_sum = sum(p["avoided_co2_kg"] for p in FEED_POSTS)
    return {
        "posts": FEED_POSTS,
        "total_posts": len(FEED_POSTS),
        "total_community_avoided_co2_kg": round(total_avoided_sum, 1),
        "trending_tags": ["#ZeroEmissionCommute", "#PlantFuelChampion", "#CircularThriftDrop", "#PlasticFreeCampus", "#SolarPower"]
    }


@router.post("/feed/post", status_code=201)
def create_feed_post(
    payload: CreatePostRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Share your sustainable milestone/achievement with photo proof.
    Awards +40 Green Points to the student poster!
    """
    new_id = f"post-{len(FEED_POSTS) + 1}-{uuid.uuid4().hex[:4]}"
    
    # Cloudinary or uploaded image fallback
    img_url = payload.image_url
    if not img_url:
        img_url = SAMPLE_ECO_PHOTOS[len(FEED_POSTS) % len(SAMPLE_ECO_PHOTOS)]

    new_post = {
        "id": new_id,
        "author_name": current_user.full_name or "PW Student",
        "author_username": current_user.username,
        "author_avatar_color": current_user.avatar_color or "#00F0FF",
        "author_hostel": "PW IOI Campus",
        "title": payload.title,
        "content": payload.content,
        "image_url": img_url,
        "action_tag": payload.action_tag or "#ZeroCarbon",
        "avoided_co2_kg": round(payload.avoided_co2_kg, 1),
        "likes_count": 1,
        "liked_by_me": True,
        "verified_eco_proof": True,
        "timestamp": "Just now",
        "comments": []
    }

    FEED_POSTS.insert(0, new_post)

    # Award Green Points for public social proof (+40 pts)
    points_awarded = 40
    current_user.total_points = (current_user.total_points or 0) + points_awarded
    db.commit()
    db.refresh(current_user)

    return {
        "success": True,
        "post": new_post,
        "points_awarded": points_awarded,
        "new_total_points": current_user.total_points,
        "message": f"Post published! +{points_awarded} green points awarded for inspiring campus."
    }


@router.post("/feed/like")
def like_feed_post(
    payload: LikePostRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Like/cheer an eco-achievement. Awards +5 points to the cheerer!"""
    post = next((p for p in FEED_POSTS if p["id"] == payload.post_id), None)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    if not post.get("liked_by_me"):
        post["likes_count"] += 1
        post["liked_by_me"] = True
        points = 5
        current_user.total_points = (current_user.total_points or 0) + points
        db.commit()
        db.refresh(current_user)
        return {"success": True, "likes": post["likes_count"], "points_awarded": points}
    else:
        post["likes_count"] = max(0, post["likes_count"] - 1)
        post["liked_by_me"] = False
        return {"success": True, "likes": post["likes_count"], "points_awarded": 0}


@router.post("/feed/comment")
def add_feed_comment(
    payload: CommentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Add a supportive comment to a peer's carbon reduction post."""
    post = next((p for p in FEED_POSTS if p["id"] == payload.post_id), None)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    comment = {
        "user": current_user.full_name or current_user.username,
        "avatar_color": current_user.avatar_color or "#00F0FF",
        "text": payload.text.strip(),
    }
    post["comments"].append(comment)
    return {"success": True, "comment": comment, "total_comments": len(post["comments"])}


@router.get("/champion")
def get_lowest_footprint_champion():
    """Returns the student with the lowest net carbon footprint on campus and their exclusive prize."""
    return LOWEST_FOOTPRINT_CHAMPION
