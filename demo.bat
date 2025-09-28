@echo off
echo 🚀 Starting Pancreatic Cancer Clinical Copilot Demo...

echo Starting backend server...
cd backend
start "Backend Server" cmd /c "npm run dev"

timeout /t 5 > nul

echo Starting frontend server...
cd ..\frontend
start "Frontend Server" cmd /c "npm start"

echo 🎉 Demo servers are starting up!
echo.
echo 📋 Demo Instructions:
echo 1. Backend API: http://localhost:5000
echo 2. Frontend App: http://localhost:3000
echo.
echo 🧪 Test Features:
echo    • Upload a medical report (PDF/image/text)
echo    • View AI-generated analysis and summaries
echo    • Explore interactive data visualizations
echo    • Book appointments with specialists
echo    • Send report summaries via email
echo.
echo Press any key to return to command prompt (servers will continue running)
pause > nul