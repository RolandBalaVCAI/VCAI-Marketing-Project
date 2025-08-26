@echo off
echo 🔍 VCAI Project Diagnostics
echo ==========================

echo.
echo 📁 Project Structure:
if exist "frontend" (echo ✅ frontend/ folder exists) else (echo ❌ frontend/ folder missing)
if exist "backend" (echo ✅ backend/ folder exists) else (echo ❌ backend/ folder missing)
if exist "shared" (echo ✅ shared/ folder exists) else (echo ❌ shared/ folder missing)

echo.
echo 📦 Frontend Dependencies:
if exist "frontend\node_modules" (echo ✅ frontend/node_modules exists) else (echo ❌ frontend/node_modules missing)
if exist "frontend\package.json" (echo ✅ frontend/package.json exists) else (echo ❌ frontend/package.json missing)

echo.
echo 🔧 Configuration Files:
if exist "frontend\.env.development" (echo ✅ frontend/.env.development exists) else (echo ❌ frontend/.env.development missing)
if exist "frontend\vite.config.js" (echo ✅ frontend/vite.config.js exists) else (echo ❌ frontend/vite.config.js missing)

echo.
echo 🚀 Testing Frontend Startup:
echo Starting frontend server for 5 seconds...
cd frontend
timeout /t 5 /nobreak & npm run dev
cd ..

echo.
echo 📋 Summary:
echo - If you see "Local: http://localhost:5173/" above, the frontend is working
echo - Try opening http://localhost:5173 in your browser
echo - If the page is blank, there might be a JavaScript error (check browser console)
echo - Run 'start-frontend.bat' to start just the frontend in mock mode
echo.
pause