#!/bin/bash
set -e

# Navigate to project root
cd "$(dirname "$0")"

echo "🌿 Starting EcoPulse..."

# 1. Setup Backend
if [ ! -d "backend/venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv backend/venv
    ./backend/venv/bin/pip install "fastapi>=0.115.0" "uvicorn[standard]>=0.32.0" "sqlalchemy>=2.0.36" "alembic>=1.13.3" "pydantic>=2.9.2" "pydantic-settings>=2.6.0" "python-dotenv>=1.0.1" "passlib[bcrypt]>=1.7.4" "python-jose[cryptography]>=3.3.0" "httpx>=0.27.2" "aiosqlite>=0.20.0"
fi

# 2. Seed database if not present
if [ ! -f "backend/ecopulse.db" ]; then
    echo "Seeding database..."
    (cd backend && ./venv/bin/python3 seed.py)
fi

# 3. Setup Frontend
if [ ! -d "frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    (cd frontend && npm install)
fi

# 4. Start Backend
echo "Starting backend server on port 8000..."
(cd backend && ./venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000) &
BACKEND_PID=$!

# 5. Start Frontend
echo "Starting frontend dev server on port 5173..."
(cd frontend && npm run dev -- --host 127.0.0.1 --port 5173) &
FRONTEND_PID=$!

# Trap Ctrl+C to kill both servers cleanly
cleanup() {
    echo ""
    echo "Shutting down servers..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# 6. Wait 2 seconds and open browser
sleep 2
echo "Opening app in browser..."
open http://127.0.0.1:5173 2>/dev/null || true

echo "EcoPulse is running at http://127.0.0.1:5173 (Press CTRL+C to stop)"
wait
