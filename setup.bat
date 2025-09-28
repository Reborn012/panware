@echo off
echo 🚀 Setting up Pancreatic Cancer Clinical Copilot with Medical Report Processing...

REM Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js v18 or higher.
    exit /b 1
)

echo [INFO] Node.js version check passed: 
node --version

REM Install backend dependencies
echo [INFO] Installing backend dependencies...
cd backend
if not exist "package.json" (
    echo [ERROR] Backend package.json not found!
    exit /b 1
)

call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install backend dependencies
    exit /b 1
)

REM Check if .env file exists, if not copy from example
if not exist ".env" (
    if exist ".env.example" (
        copy ".env.example" ".env"
        echo [WARNING] Created .env file from .env.example. Please update with your API keys.
    ) else (
        echo [ERROR] .env.example file not found
    )
)

REM Create necessary directories
if not exist "uploads" mkdir uploads
if not exist "data" mkdir data

echo [INFO] Backend setup completed!

REM Install frontend dependencies
echo [INFO] Installing frontend dependencies...
cd ..\frontend

if not exist "package.json" (
    echo [ERROR] Frontend package.json not found!
    exit /b 1
)

call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install frontend dependencies
    exit /b 1
)

echo [INFO] Frontend setup completed!

REM Go back to root
cd ..

echo [INFO] Setup completed successfully! 🎉
echo.
echo 📋 Next Steps:
echo 1. Update backend\.env with your API keys:
echo    - GEMINI_API_KEY (required for AI features)
echo    - AWS credentials (optional for advanced OCR)
echo    - Email credentials (optional for notifications)
echo.
echo 2. Start the development servers:
echo    Backend:  cd backend ^&^& npm run dev
echo    Frontend: cd frontend ^&^& npm start
echo.
echo 3. Visit http://localhost:3000 to access the application
echo.
echo 📚 Features available:
echo    ✅ Medical Report Upload ^& OCR Processing
echo    ✅ AI-Powered Report Analysis with Gemini
echo    ✅ Interactive Data Visualization
echo    ✅ Appointment Booking System
echo    ✅ Doctor Communication ^& Email Summaries
echo    ✅ Patient Risk Assessment
echo    ✅ Clinical Decision Support

pause