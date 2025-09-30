#!/bin/bash

# COMBO - Frontend Only Script
# Run just the mobile app without backend

echo "📱 Starting COMBO Frontend Only..."
echo "================================"

cd mobile

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install --legacy-peer-deps
fi

echo "🚀 Starting Expo development server..."
npx expo start --web --clear
