@echo off
echo 🚀 Starting Frontend Only (Mock Mode)
echo =====================================

cd frontend

echo 📦 Checking dependencies...
if not exist "node_modules" (
    echo Installing frontend dependencies...
    npm install
)

echo 🎭 Starting in Mock Mode (no backend needed)
echo Frontend: http://localhost:5173
echo.

set VITE_USE_MOCK=true
npm run dev