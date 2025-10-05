#!/bin/bash

# React Native Web Build Script for Firebase Hosting
echo "???? Building React Native web app for Firebase Hosting..."

# Navigate to mobile directory
cd mobile

# Install dependencies
echo "???? Installing dependencies..."
npm ci

# Build for web using Expo
echo "???? Building web app..."
npx expo export --platform web

# Check if dist directory was created
if [ -d "dist" ]; then
    echo "??? Build successful!"
    echo "???? Build output: mobile/dist"
    echo "???? Build contents:"
    ls -la dist | head -10
    
    # Copy to root for Firebase deployment
    cp -r dist ../firebase-public
    
    echo "??? Web build ready for Firebase Hosting!"
    echo "???? Copied to: firebase-public directory"
else
    echo "?????? Build may have failed or used different output directory"
    echo "Checking for alternative build outputs..."
    find . -type d -name "*build*" -o -name "*export*" | head -5
    
    # Try alternative build command
    echo "???? Trying alternative build method..."
    npx expo build:web
    
    if [ -d "web-build" ]; then
        echo "??? Alternative build successful!"
        cp -r web-build ../firebase-public
        echo "???? Copied web-build to firebase-public"
    fi
fi

echo ""
echo "???? Next steps:"
echo "1. Deploy to Firebase: firebase deploy --only hosting"
echo "2. Check deployment: https://combo-624e1.web.app"
