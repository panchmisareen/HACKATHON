from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import init_db
from app.api import auth, missions, coach, activity, league, campus, dashboard, calculator, marketplace

app = FastAPI(
    title="EcoPulse API",
    description="Better habits. Lighter footprint. — Student Wellness & Sustainability Platform",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:5173", "http://localhost:3000"],
    allow_origin_regex=".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event():
    init_db()


@app.get("/api/health")
def health():
    return {"status": "ok", "version": "1.0.0", "app": "EcoPulse"}


# Mount routers
app.include_router(auth.router, prefix="/api")
app.include_router(missions.router, prefix="/api")
app.include_router(coach.router, prefix="/api")
app.include_router(activity.router, prefix="/api")
app.include_router(league.router, prefix="/api")
app.include_router(campus.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(calculator.router, prefix="/api")
app.include_router(marketplace.router, prefix="/api")
