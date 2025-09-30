#!/bin/bash

# COMBO Music Streaming App - Modern Startup Script
# This script starts both the backend server and the Expo web app

echo "🎵 COMBO Music Streaming App"
echo "=============================="

# Color codes for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 16+ to continue."
    exit 1
fi

print_success "Node.js found: $(node --version)"

# Check if we're in the right directory
if [ ! -d "mobile" ]; then
    print_error "mobile/ directory not found. Please run this script from the combo directory."
    exit 1
fi

# Setup environment variables
export NODE_ENV=development

# Function to cleanup processes on exit
cleanup() {
    print_status "Shutting down servers..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null && print_success "Backend server stopped"
    fi
    if [ ! -z "$EXPO_PID" ]; then
        kill $EXPO_PID 2>/dev/null && print_success "Expo server stopped"
    fi
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

print_status "Setting up COMBO application..."

# Install backend dependencies if needed
if [ ! -d "node_modules" ]; then
    print_status "Installing backend dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        print_error "Failed to install backend dependencies"
        exit 1
    fi
fi

# Install mobile dependencies if needed
if [ ! -d "mobile/node_modules" ]; then
    print_status "Installing mobile app dependencies..."
    cd mobile
    npm install --legacy-peer-deps
    if [ $? -ne 0 ]; then
        print_error "Failed to install mobile dependencies"
        exit 1
    fi
    cd ..
fi

print_success "Dependencies installed successfully"

# Start backend server in background
print_status "Starting backend server on port 3001..."
cd backend
node src/index.js &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 5

# Check if backend started successfully
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    print_warning "Backend server failed to start (likely missing MongoDB/Redis)"
    print_status "Starting simplified backend server instead..."
    node server.js &
    BACKEND_PID=$!

    # Wait a moment for simplified backend to start
    sleep 3

    if ! kill -0 $BACKEND_PID 2>/dev/null; then
        print_error "Failed to start any backend server"
        print_error "Please ensure MongoDB and Redis are running, or use:"
        print_error "./backend-only.sh (for backend only)"
        exit 1
    fi

    print_success "Simplified backend server started!"
    echo "🔗 API Base URL: http://localhost:3001/api"
    echo "📚 Health Check: http://localhost:3001/health"
else
    print_success "Backend server started successfully!"
    echo "🔗 API Base URL: http://localhost:3001/api"
    echo "📚 Health Check: http://localhost:3001/health"
fi

# Start Expo development server in background
print_status "Starting Expo development server..."
cd mobile
npx expo start --web --clear &
EXPO_PID=$!

# Wait a moment for Expo to start
sleep 5

print_success "Expo server started successfully!"
echo "🌐 Web App: http://localhost:8081"
echo "📱 Mobile App: Scan QR code with Expo Go app"

echo ""
print_success "COMBO is now running!"
echo "======================"
echo ""
echo "📋 Available services:"
echo "• Backend API: http://localhost:3001"
echo "• Web App: http://localhost:8081"
echo "• Health Check: http://localhost:3001/health"
echo ""
echo "🔍 Test the API:"
echo "• Search: http://localhost:3001/api/music/search?q=rock"
echo "• Get Track: http://localhost:3001/api/music/track/123"
echo ""
echo "📱 For mobile app:"
echo "1. Install Expo Go app on your phone"
echo "2. Scan the QR code that appears"
echo "3. Or run 'npx expo start' in mobile directory"
echo ""
echo "🛑 Press Ctrl+C to stop all servers"
echo ""

# Wait for user to stop the script
wait
