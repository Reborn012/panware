@echo off
title Pancreatic Cancer Clinical Copilot - Startup
color 0A
echo.
echo ================================================
echo    PANCREATIC CANCER CLINICAL COPILOT
echo              Starting Up...
echo ================================================
echo.

REM Check if we're in the right directory
if not exist "backend" (
    echo ERROR: backend folder not found!
    echo Please make sure you're in the project root directory
    echo Expected structure: panware/backend and panware/frontend
    pause
    exit /b 1
)

if not exist "frontend" (
    echo ERROR: frontend folder not found!
    echo Please make sure you're in the project root directory
    pause
    exit /b 1
)

echo [1/4] Checking dependencies...
cd backend
if not exist "node_modules" (
    echo Installing backend dependencies...
    call npm install
    if errorlevel 1 (
        echo Failed to install backend dependencies
        pause
        exit /b 1
    )
)

cd ..\frontend
if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install --legacy-peer-deps
    if errorlevel 1 (
        echo Failed to install frontend dependencies
        pause
        exit /b 1
    )
)

echo.
echo [2/4] Starting Backend Server (Port 5000)...
cd ..\backend
start "🔧 Backend API Server" cmd /c "echo Starting Backend Server... && npm run dev && pause"

echo [3/4] Waiting for backend to initialize...
timeout /t 8 > nul

echo [4/4] Starting Frontend Server (Port 3001)...
cd ..\frontend
start "🌐 Frontend React App" cmd /c "echo Starting Frontend Server... && set PORT=3001 && npm start && pause"

echo.
echo ================================================
echo           🎉 STARTUP COMPLETE! 🎉
echo ================================================
echo.
echo 📋 Your application is starting up:
echo.
echo   🔧 Backend API:    http://localhost:5000
echo   🌐 Frontend App:   http://localhost:3001
echo.
echo 📖 Features Available:
echo   • Clinical Dashboard with AI Assistant
echo   • Medical Report Upload & Analysis
echo   • Interactive Data Visualization
echo   • Appointment Booking System
echo.
echo 🔍 To test the Medical Reports feature:
echo   1. Go to http://localhost:3001
echo   2. Click "Medical Reports" tab
echo   3. Upload a medical report or view sample data
echo   4. Check out the scatter chart visualization!
echo.
echo ⚠️  Note: Keep both command windows open for the app to work
echo    Close this window when you're done testing
echo.
echo Press any key to open the app in your browser...
pause > nul

REM Open browser to the application
start http://localhost:3001

echo.
echo Application opened in browser!
echo Keep the server windows open and enjoy testing! 🚀
echo.
pause