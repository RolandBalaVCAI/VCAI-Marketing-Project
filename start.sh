#!/bin/bash

# VCAI Marketing Project Startup Script
# Starts both frontend and backend servers

set -e

echo "🚀 Starting VCAI Marketing Project..."
echo "======================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check Node.js version
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is required but not installed"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Error: Node.js 18+ is required (current: $(node --version))"
    exit 1
fi

# Check Python version
if ! command -v python &> /dev/null && ! command -v python3 &> /dev/null; then
    echo "❌ Error: Python is required but not installed"
    exit 1
fi

# Use python3 if available, otherwise python
PYTHON_CMD="python"
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
fi

PYTHON_VERSION=$($PYTHON_CMD --version | cut -d' ' -f2 | cut -d'.' -f1,2)
if [ "$(echo "$PYTHON_VERSION < 3.8" | bc -l)" = "1" ]; then
    echo "❌ Error: Python 3.8+ is required (current: $($PYTHON_CMD --version))"
    exit 1
fi

echo "✅ Node.js $(node --version) detected"
echo "✅ Python $($PYTHON_CMD --version) detected"
echo ""

# Install dependencies if needed
echo "📦 Checking dependencies..."

# Frontend dependencies
if [ ! -d "frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd frontend && npm install && cd ..
else
    echo "✅ Frontend dependencies already installed"
fi

# Backend dependencies
if [ ! -d "backend/.venv" ] && [ ! -f "backend/.deps_installed" ]; then
    echo "Installing backend dependencies..."
    cd backend && pip install -r requirements.txt && touch .deps_installed && cd ..
else
    echo "✅ Backend dependencies already installed"
fi

echo ""

# Check environment files
echo "🔧 Checking configuration..."

if [ ! -f "frontend/.env" ] && [ ! -f "frontend/.env.local" ]; then
    echo "📝 Creating frontend environment file..."
    cp frontend/.env.development frontend/.env.local
fi

if [ ! -f "backend/.env" ]; then
    echo "📝 Creating backend environment file..."
    cp backend/.env.example backend/.env
    echo "⚠️  Please edit backend/.env with your Peach AI credentials"
fi

echo "✅ Configuration files ready"
echo ""

# Initialize database if needed
echo "🗄️  Checking database..."
if [ ! -f "backend/datawarehouse.db" ]; then
    echo "Initializing database..."
    cd backend && $PYTHON_CMD -c "
from src.database.operations import DatabaseOperations
from src.config.settings import load_config
config = load_config()
db_ops = DatabaseOperations(config)
db_ops.create_tables()
print('Database initialized successfully')
" && cd ..
else
    echo "✅ Database already exists"
fi

echo ""

# Determine startup mode
MOCK_MODE=${1:-"auto"}
case $MOCK_MODE in
    "mock")
        echo "🎭 Starting in MOCK MODE (using sample data)"
        export VITE_USE_MOCK=true
        ;;
    "production"|"prod")
        echo "🏭 Starting in PRODUCTION MODE (using backend data)"
        export VITE_USE_MOCK=false
        ;;
    "auto"|*)
        echo "🤖 Starting in AUTO MODE (backend with mock fallback)"
        export VITE_USE_MOCK=false
        ;;
esac

echo ""
echo "🌟 Starting servers..."
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:8000"
echo "API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Start servers using npm script
npm run dev