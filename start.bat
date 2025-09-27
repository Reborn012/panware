@echo off
echo Starting Pancreatic Cancer Clinical Copilot...
echo.

echo Starting backend server...
start /B cmd /c "cd backend && npm start"

echo Waiting for backend to start...
timeout /t 3 /nobreak > nul

echo Starting frontend development server...
start cmd /c "cd frontend && npm start"

echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to stop all services...
pause > nul

echo Stopping services...
taskkill /f /im node.exe
echo Services stopped.