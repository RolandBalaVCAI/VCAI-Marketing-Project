@echo off
REM VCAI Marketing Project Startup Script for Windows
REM Starts both frontend and backend servers

echo 🚀 Starting VCAI Marketing Project...
echo ======================================

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: Please run this script from the project root directory
    exit /b 1
)

REM Check Node.js
where node >nul 2>nul
if errorlevel 1 (
    echo ❌ Error: Node.js is required but not installed
    exit /b 1
)

REM Check Python
where python >nul 2>nul
if errorlevel 1 (
    echo ❌ Error: Python is required but not installed
    exit /b 1
)

echo ✅ Node.js detected
echo ✅ Python detected
echo.

REM Install dependencies if needed
echo 📦 Checking dependencies...

if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend && npm install && cd ..
) else (
    echo ✅ Frontend dependencies already installed
)

if not exist "backend\.deps_installed" (
    echo Installing backend dependencies...
    cd backend && pip install -r requirements.txt && echo. > .deps_installed && cd ..
) else (
    echo ✅ Backend dependencies already installed
)

echo.

REM Check environment files
echo 🔧 Checking configuration...

if not exist "frontend\.env" if not exist "frontend\.env.local" (
    echo 📝 Creating frontend environment file...
    copy "frontend\.env.development" "frontend\.env.local" >nul
)

if not exist "backend\.env" (
    echo 📝 Creating backend environment file...
    copy "backend\.env.example" "backend\.env" >nul
    echo ⚠️  Please edit backend\.env with your Peach AI credentials
)

echo ✅ Configuration files ready
echo.

REM Initialize database if needed
echo 🗄️ Checking database...
if not exist "backend\datawarehouse.db" (
    echo Initializing database...
    cd backend && python -c "from src.database.operations import DatabaseOperations; from src.config.settings import load_config; config = load_config(); db_ops = DatabaseOperations(config); db_ops.create_tables(); print('Database initialized successfully')" && cd ..
) else (
    echo ✅ Database already exists
)

echo.

REM Determine startup mode
set MOCK_MODE=%1
if "%MOCK_MODE%"=="mock" (
    echo 🎭 Starting in MOCK MODE (using sample data)
    set VITE_USE_MOCK=true
) else if "%MOCK_MODE%"=="production" (
    echo 🏭 Starting in PRODUCTION MODE (using backend data)
    set VITE_USE_MOCK=false
) else if "%MOCK_MODE%"=="prod" (
    echo 🏭 Starting in PRODUCTION MODE (using backend data)
    set VITE_USE_MOCK=false
) else (
    echo 🤖 Starting in AUTO MODE (backend with mock fallback)
    set VITE_USE_MOCK=false
)

echo.
echo 🌟 Starting servers...
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo.
echo Press Ctrl+C to stop all servers
echo.

REM Install concurrently if needed
npm list concurrently >nul 2>nul
if errorlevel 1 (
    echo Installing concurrently...
    npm install concurrently --save-dev
)

REM Start servers using npm script
npm run dev