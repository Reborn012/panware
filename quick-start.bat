@echo off
REM Quick Start - Pancreatic Cancer Clinical Copilot
title Quick Start - Clinical Copilot

echo 🚀 Quick Starting Clinical Copilot...

REM Start backend
cd backend
start "Backend" cmd /c "npm run dev"

REM Wait and start frontend  
timeout /t 5 > nul
cd ..\frontend
start "Frontend" cmd /c "set PORT=3001 && npm start"

REM Wait and open browser
timeout /t 10 > nul
start http://localhost:3001

echo ✅ Started! Check your browser: http://localhost:3001