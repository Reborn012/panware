#!/bin/bash

# Quick Start - Pancreatic Cancer Clinical Copilot (Mac Version)
# Simple and fast startup

echo "🚀 Quick Starting Clinical Copilot..."

# Start backend in new terminal tab (macOS)
if command -v osascript >/dev/null 2>&1; then
    # macOS
    echo "Starting backend server..."
    osascript -e "
    tell application \"Terminal\"
        do script \"cd '$(pwd)/backend' && npm run dev\"
    end tell
    "
    
    # Wait for backend to start
    sleep 8
    
    echo "Starting frontend server..."
    osascript -e "
    tell application \"Terminal\"  
        do script \"cd '$(pwd)/frontend' && PORT=3001 npm start\"
    end tell
    "
    
    # Wait and open browser
    sleep 10
    open http://localhost:3001
    
else
    # Fallback for other systems
    echo "Starting servers in background..."
    cd backend
    npm run dev &
    cd ../frontend
    PORT=3001 npm start &
    
    sleep 10
    echo "Open http://localhost:3001 in your browser"
fi

echo "✅ Started! Check your browser: http://localhost:3001"