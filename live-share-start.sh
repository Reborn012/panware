#!/bin/bash

# Live Share Setup - Pancreatic Cancer Clinical Copilot
# Optimized for VS Code Live Share sessions

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'  
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
NC='\033[0m'

clear

echo -e "${GREEN}"
echo "================================================"
echo "   LIVE SHARE - CLINICAL COPILOT SETUP"
echo "        For VS Code Live Share Sessions"
echo "================================================"
echo -e "${NC}"

echo -e "${YELLOW}[1/3] Checking Live Share requirements...${NC}"

# Check if running in VS Code
if [ ! -z "$VSCODE_PID" ]; then
    echo -e "${GREEN}✅ Running in VS Code environment${NC}"
else
    echo -e "${YELLOW}⚠️  Not detected in VS Code - Live Share may not work optimally${NC}"
fi

echo ""
echo -e "${YELLOW}[2/3] Starting servers for Live Share...${NC}"

echo "Starting Backend Server (Port 5000)..."
cd backend

# Start backend in new terminal (macOS)
if command -v osascript >/dev/null 2>&1; then
    osascript -e "
    tell application \"Terminal\"
        do script \"cd '$(pwd)' && echo 'Live Share Backend Starting...' && npm run dev\"
        set custom title of front window to \"🔧 Backend - Live Share\"
    end tell
    " >/dev/null 2>&1
else
    # Fallback for Linux
    gnome-terminal --title="🔧 Backend - Live Share" -- bash -c "echo 'Live Share Backend Starting...'; npm run dev; exec bash" 2>/dev/null || (npm run dev &)
fi

echo "Waiting for backend initialization..."
sleep 8

echo "Starting Frontend Server (Port 3001)..."
cd ../frontend

# Start frontend in new terminal (macOS)
if command -v osascript >/dev/null 2>&1; then
    osascript -e "
    tell application \"Terminal\"
        do script \"cd '$(pwd)' && echo 'Live Share Frontend Starting...' && PORT=3001 npm start\"
        set custom title of front window to \"🌐 Frontend - Live Share\"
    end tell
    " >/dev/null 2>&1
else
    # Fallback for Linux  
    gnome-terminal --title="🌐 Frontend - Live Share" -- bash -c "echo 'Live Share Frontend Starting...'; PORT=3001 npm start; exec bash" 2>/dev/null || (PORT=3001 npm start &)
fi

cd ..

echo ""
echo -e "${YELLOW}[3/3] Live Share Setup Complete!${NC}"
echo ""
echo -e "${GREEN}"
echo "================================================"
echo "          🤝 LIVE SHARE READY! 🤝"
echo "================================================"
echo -e "${NC}"

echo -e "${BLUE}📋 FOR LIVE SHARE HOST:${NC}"
echo "  1. Forward these ports in VS Code:"
echo "     • Port 5000 (Backend API)"
echo "     • Port 3001 (Frontend App)"
echo ""
echo "  2. Share terminals with guests:"
echo "     • ⌘+Shift+P → \"Live Share: Share Terminal\""
echo ""

echo -e "${PURPLE}📋 FOR LIVE SHARE GUESTS:${NC}"
echo "  • Backend API: Use forwarded port 5000 link"
echo "  • Frontend App: Use forwarded port 3001 link"
echo "  • Access shared terminals to run commands"
echo ""

echo -e "${BLUE}🔗 Application URLs:${NC}"
echo "  • Local Backend:  http://localhost:5000"
echo "  • Local Frontend: http://localhost:3001"
echo ""

echo -e "${YELLOW}💡 Live Share Tips:${NC}"
echo "  • Host: Enable \"Allow guests terminal access\" in settings"
echo "  • Host: Use port forwarding for easy guest access"
echo "  • Guests: Look for \"Ports\" tab in VS Code for links"
echo ""

echo -e "${YELLOW}⚠️  Keep both server windows open during Live Share session${NC}"
echo ""

# Wait for servers to start
echo "Waiting for servers to fully initialize..."
sleep 12

echo "Opening application..."
if command -v open >/dev/null 2>&1; then
    open http://localhost:3001
elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open http://localhost:3001
fi

echo ""
echo -e "${GREEN}🎉 Live Share session ready!${NC}"
echo -e "${GREEN}Share the VS Code Live Share link with your collaborators.${NC}"
echo ""
read -p "Press Enter to continue..."