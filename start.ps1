# Pancreatic Cancer Clinical Copilot - PowerShell Startup Script
# Author: AI Assistant
# Date: September 28, 2025

param(
    [switch]$SkipDependencies,
    [switch]$OpenBrowser = $true
)

# Set up console
$Host.UI.RawUI.WindowTitle = "Pancreatic Cancer Clinical Copilot - Startup"
Clear-Host

Write-Host @"
================================================
   PANCREATIC CANCER Clinical COPILOT
             Starting Up...
================================================
"@ -ForegroundColor Green

# Check if we're in the right directory
if (!(Test-Path "backend") -or !(Test-Path "frontend")) {
    Write-Host "ERROR: backend or frontend folder not found!" -ForegroundColor Red
    Write-Host "Please make sure you're in the project root directory" -ForegroundColor Red
    Write-Host "Expected structure: panware/backend and panware/frontend" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Function to check if port is in use
function Test-Port {
    param([int]$Port)
    try {
        $connection = Test-NetConnection -ComputerName localhost -Port $Port -InformationLevel Quiet -WarningAction SilentlyContinue
        return $connection
    }
    catch {
        return $false
    }
}

# Check for dependencies
if (!$SkipDependencies) {
    Write-Host "[1/5] Checking dependencies..." -ForegroundColor Yellow
    
    # Check backend dependencies
    Set-Location backend
    if (!(Test-Path "node_modules")) {
        Write-Host "Installing backend dependencies..." -ForegroundColor Cyan
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Failed to install backend dependencies" -ForegroundColor Red
            Read-Host "Press Enter to exit"
            exit 1
        }
    }
    
    # Check frontend dependencies
    Set-Location ..\frontend
    if (!(Test-Path "node_modules")) {
        Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
        npm install --legacy-peer-deps
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Failed to install frontend dependencies" -ForegroundColor Red
            Read-Host "Press Enter to exit"
            exit 1
        }
    }
    
    Set-Location ..
} else {
    Write-Host "[1/5] Skipping dependency check..." -ForegroundColor Yellow
}

# Check if ports are available
Write-Host "[2/5] Checking port availability..." -ForegroundColor Yellow

if (Test-Port -Port 5000) {
    Write-Host "⚠️  Port 5000 is already in use. Attempting to free it..." -ForegroundColor Yellow
    Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep 2
}

if (Test-Port -Port 3001) {
    Write-Host "⚠️  Port 3001 is already in use. Attempting to free it..." -ForegroundColor Yellow
    Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep 2
}

# Start Backend Server
Write-Host "[3/5] Starting Backend Server (Port 5000)..." -ForegroundColor Yellow
Set-Location backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'Backend Server Starting...' -ForegroundColor Green; npm run dev" -WindowStyle Normal
Set-Location ..

# Wait for backend to start
Write-Host "[4/5] Waiting for backend to initialize..." -ForegroundColor Yellow
Start-Sleep 8

# Start Frontend Server
Write-Host "[5/5] Starting Frontend Server (Port 3001)..." -ForegroundColor Yellow
Set-Location frontend
$env:PORT = "3001"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'Frontend Server Starting...' -ForegroundColor Blue; `$env:PORT='3001'; npm start" -WindowStyle Normal
Set-Location ..

Write-Host @"
================================================
          🎉 STARTUP COMPLETE! 🎉
================================================

📋 Your application is starting up:

  🔧 Backend API:    http://localhost:5000
  🌐 Frontend App:   http://localhost:3001

📖 Features Available:
  • Clinical Dashboard with AI Assistant
  • Medical Report Upload & Analysis  
  • Interactive Data Visualization
  • Appointment Booking System

🔍 To test the Medical Reports feature:
  1. Go to http://localhost:3001
  2. Click "Medical Reports" tab
  3. Upload a medical report or view sample data
  4. Check out the scatter chart visualization!

⚠️  Note: Keep both PowerShell windows open for the app to work
   Close them when you're done testing

"@ -ForegroundColor Green

if ($OpenBrowser) {
    Write-Host "Opening application in browser..." -ForegroundColor Cyan
    Start-Sleep 5
    Start-Process "http://localhost:3001"
}

Write-Host @"
Application is ready! 🚀
Keep the server windows open and enjoy testing!

Press Enter to close this setup window...
"@ -ForegroundColor Magenta

Read-Host