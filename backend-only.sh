#!/bin/bash

# COMBO - Backend Only Script
# Run just the backend server

echo "🎵 Starting COMBO Backend Only..."
echo "================================"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🚀 Starting backend server..."

# Try the proper entry point first
if [ -f "src/index.js" ]; then
    echo "📡 Starting full backend server..."
    node src/index.js
else
    echo "📡 Starting simplified backend server..."
    node server.js
fi
