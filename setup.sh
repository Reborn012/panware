#!/bin/bash

echo "🚀 Setting up Pancreatic Cancer Clinical Copilot with Medical Report Processing..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Make startup scripts executable
print_status "Making startup scripts executable..."
chmod +x start.sh 2>/dev/null
chmod +x quick-start.sh 2>/dev/null
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

# Check Node version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18 or higher is required. Current version: $(node --version)"
    exit 1
fi

print_status "Node.js version check passed: $(node --version)"

# Install backend dependencies
print_status "Installing backend dependencies..."
cd backend
if [ ! -f "package.json" ]; then
    print_error "Backend package.json not found!"
    exit 1
fi

npm install
if [ $? -ne 0 ]; then
    print_error "Failed to install backend dependencies"
    exit 1
fi

# Check if .env file exists, if not copy from example
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_warning "Created .env file from .env.example. Please update with your API keys."
    else
        print_error ".env.example file not found"
    fi
fi

# Create necessary directories
mkdir -p uploads data

print_status "Backend setup completed!"

# Install frontend dependencies
print_status "Installing frontend dependencies..."
cd ../frontend

if [ ! -f "package.json" ]; then
    print_error "Frontend package.json not found!"
    exit 1
fi

npm install
if [ $? -ne 0 ]; then
    print_error "Failed to install frontend dependencies"
    exit 1
fi

print_status "Frontend setup completed!"

# Go back to root
cd ..

print_status "Setup completed successfully! 🎉"
echo ""
echo "📋 Next Steps:"
echo "1. Update backend/.env with your API keys:"
echo "   - GEMINI_API_KEY (required for AI features)"
echo "   - AWS credentials (optional for advanced OCR)"
echo "   - Email credentials (optional for notifications)"
echo ""
echo "2. Start the development servers:"
echo "   Backend:  cd backend && npm run dev"
echo "   Frontend: cd frontend && npm start"
echo ""
echo "3. Visit http://localhost:3000 to access the application"
echo ""
echo "📚 Features available:"
echo "   ✅ Medical Report Upload & OCR Processing"
echo "   ✅ AI-Powered Report Analysis with Gemini"
echo "   ✅ Interactive Data Visualization"
echo "   ✅ Appointment Booking System"
echo "   ✅ Doctor Communication & Email Summaries"
echo "   ✅ Patient Risk Assessment"
echo "   ✅ Clinical Decision Support"