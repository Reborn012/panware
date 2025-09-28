@echo off
title Live Share - Clinical Copilot Setup
color 0E

echo.
echo ================================================
echo    LIVE SHARE - CLINICAL COPILOT SETUP
echo         For VS Code Live Share Sessions
echo ================================================
echo.

echo [1/3] Checking Live Share requirements...

REM Check if we're in VS Code (common Live Share scenario)
if defined VSCODE_PID (
    echo ✅ Running in VS Code environment
) else (
    echo ⚠️  Not detected in VS Code - Live Share may not work optimally
)

echo.
echo [2/3] Starting servers for Live Share...

echo Starting Backend Server (Port 5000)...
cd backend
start "🔧 Backend - Live Share" cmd /c "echo Live Share Backend Starting... && npm run dev && echo Press any key to close && pause"

echo Waiting for backend initialization...
timeout /t 8 > nul

echo Starting Frontend Server (Port 3001)...
cd ..\frontend  
start "🌐 Frontend - Live Share" cmd /c "echo Live Share Frontend Starting... && set PORT=3001 && npm start && echo Press any key to close && pause"

cd ..

echo.
echo [3/3] Live Share Setup Complete!
echo.
echo ================================================
echo           🤝 LIVE SHARE READY! 🤝
echo ================================================
echo.
echo 📋 FOR LIVE SHARE HOST:
echo   1. Forward these ports in VS Code:
echo      • Port 5000 (Backend API)
echo      • Port 3001 (Frontend App)
echo.  
echo   2. Share terminals with guests:
echo      • Ctrl+Shift+P → "Live Share: Share Terminal"
echo.
echo 📋 FOR LIVE SHARE GUESTS:
echo   • Backend API: Use forwarded port 5000 link
echo   • Frontend App: Use forwarded port 3001 link
echo   • Access shared terminals to run commands
echo.
echo 🔗 Application URLs:
echo   • Local Backend:  http://localhost:5000
echo   • Local Frontend: http://localhost:3001
echo.
echo 💡 Live Share Tips:
echo   • Host: Enable "Allow guests terminal access" in settings
echo   • Host: Use port forwarding for easy guest access
echo   • Guests: Look for "Ports" tab in VS Code for links
echo.
echo ⚠️  Keep both server windows open during Live Share session
echo.

REM Wait before opening browser (give servers time to start)
echo Waiting for servers to fully initialize...
timeout /t 12 > nul

echo Opening application...
start http://localhost:3001

echo.
echo 🎉 Live Share session ready!
echo Share the VS Code Live Share link with your collaborators.
echo.
pause