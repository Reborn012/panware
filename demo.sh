#!/bin/bash

echo "🚀 Starting Pancreatic Cancer Clinical Copilot Demo..."

# Start backend server in background
echo "Starting backend server..."
cd backend
npm run dev &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Start frontend server in background
echo "Starting frontend server..."
cd ../frontend
npm start &
FRONTEND_PID=$!

echo "🎉 Demo servers are starting up!"
echo ""
echo "📋 Demo Instructions:"
echo "1. Backend API: http://localhost:5000"
echo "2. Frontend App: http://localhost:3000"
echo ""
echo "🧪 Test Features:"
echo "   • Upload a medical report (PDF/image/text)"
echo "   • View AI-generated analysis and summaries"
echo "   • Explore interactive data visualizations"
echo "   • Book appointments with specialists"
echo "   • Send report summaries via email"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for user to stop
trap 'echo "Stopping servers..."; kill $BACKEND_PID $FRONTEND_PID; exit' INT
wait