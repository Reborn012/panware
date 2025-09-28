#!/bin/bash

# Pancreatic Cancer Clinical Copilot - Mac Startup Script
# Author: AI Assistant
# Date: September 28, 2025

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

clear

echo -e "${GREEN}"
echo "================================================"
echo "   PANCREATIC CANCER CLINICAL COPILOT"
echo "              Starting Up..."
echo "================================================"
echo -e "${NC}"

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo -e "${RED}ERROR: backend or frontend folder not found!${NC}"
    echo "Please make sure you're in the project root directory"
    echo "Expected structure: panware/backend and panware/frontend"
    read -p "Press Enter to exit..."
    exit 1
fi

# Function to check if port is in use
check_port() {
    lsof -i :$1 >/dev/null 2>&1
    return $?
}

# Function to kill processes on port
kill_port() {
    echo -e "${YELLOW}⚠️  Port $1 is in use. Freeing it up...${NC}"
    lsof -ti :$1 | xargs kill -9 2>/dev/null
    sleep 2
}

echo -e "${YELLOW}[1/5] Checking dependencies...${NC}"

# Check backend dependencies
cd backend
if [ ! -d "node_modules" ]; then
    echo -e "${CYAN}Installing backend dependencies...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to install backend dependencies${NC}"
        read -p "Press Enter to exit..."
        exit 1
    fi
fi

# Check frontend dependencies
cd ../frontend
if [ ! -d "node_modules" ]; then
    echo -e "${CYAN}Installing frontend dependencies...${NC}"
    npm install --legacy-peer-deps
    if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to install frontend dependencies${NC}"
        read -p "Press Enter to exit..."
        exit 1
    fi
fi

cd ..

echo -e "${YELLOW}[2/5] Checking port availability...${NC}"

# Check and free ports if needed
if check_port 5000; then
    kill_port 5000
fi

if check_port 3001; then
    kill_port 3001
fi

echo -e "${YELLOW}[3/5] Starting Backend Server (Port 5000)...${NC}"
cd backend

# Start backend in new terminal window/tab
if command -v osascript >/dev/null 2>&1; then
    # macOS - use AppleScript to open new terminal
    osascript -e "
    tell application \"Terminal\"
        do script \"cd '$(pwd)' && echo -e '\\033[0;32mBackend Server Starting...\\033[0m' && npm run dev\"
        activate
    end tell
    " >/dev/null 2>&1
elif command -v gnome-terminal >/dev/null 2>&1; then
    # Linux with GNOME
    gnome-terminal -- bash -c "echo -e '${GREEN}Backend Server Starting...${NC}'; npm run dev; exec bash"
else
    # Fallback - run in background
    echo -e "${CYAN}Starting backend in background...${NC}"
    npm run dev &
    BACKEND_PID=$!
fi

cd ..

echo -e "${YELLOW}[4/5] Waiting for backend to initialize...${NC}"
sleep 8

echo -e "${YELLOW}[5/5] Starting Frontend Server (Port 3001)...${NC}"
cd frontend

# Start frontend in new terminal window/tab
if command -v osascript >/dev/null 2>&1; then
    # macOS - use AppleScript to open new terminal
    osascript -e "
    tell application \"Terminal\"
        do script \"cd '$(pwd)' && echo -e '\\033[0;34mFrontend Server Starting...\\033[0m' && PORT=3001 npm start\"
        activate
    end tell
    " >/dev/null 2>&1
elif command -v gnome-terminal >/dev/null 2>&1; then
    # Linux with GNOME
    gnome-terminal -- bash -c "echo -e '${BLUE}Frontend Server Starting...${NC}'; PORT=3001 npm start; exec bash"
else
    # Fallback - run in background
    echo -e "${CYAN}Starting frontend in background...${NC}"
    PORT=3001 npm start &
    FRONTEND_PID=$!
fi

cd ..

echo -e "${GREEN}"
echo "================================================"
echo "          🎉 STARTUP COMPLETE! 🎉"
echo "================================================"
echo -e "${NC}"

echo -e "${CYAN}📋 Your application is starting up:${NC}"
echo ""
echo -e "  🔧 Backend API:    ${BLUE}http://localhost:5000${NC}"
echo -e "  🌐 Frontend App:   ${BLUE}http://localhost:3001${NC}"
echo ""
echo -e "${PURPLE}📖 Features Available:${NC}"
echo "  • Clinical Dashboard with AI Assistant"
echo "  • Medical Report Upload & Analysis"
echo "  • Interactive Data Visualization"
echo "  • Appointment Booking System"
echo ""
echo -e "${YELLOW}🔍 To test the Medical Reports feature:${NC}"
echo "  1. Go to http://localhost:3001"
echo "  2. Click \"Medical Reports\" tab"
echo "  3. Upload a medical report or view sample data"
echo "  4. Check out the scatter chart visualization!"
echo ""
echo -e "${YELLOW}⚠️  Note: Keep both terminal windows open for the app to work${NC}"
echo "   Close them when you're done testing"
echo ""

# Wait a bit for servers to start
sleep 5

# Open browser (works on macOS and most Linux distros)
echo -e "${CYAN}Opening application in browser...${NC}"
if command -v open >/dev/null 2>&1; then
    # macOS
    open http://localhost:3001
elif command -v xdg-open >/dev/null 2>&1; then
    # Linux
    xdg-open http://localhost:3001
else
    echo "Please open http://localhost:3001 in your browser"
fi

echo ""
echo -e "${GREEN}Application is ready! 🚀${NC}"
echo -e "${GREEN}Keep the server windows open and enjoy testing!${NC}"
echo ""
echo -e "${PURPLE}Press Enter to close this setup window...${NC}"
read