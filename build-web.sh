#!/bin/bash

# Web Build Script for Firebase Hosting
echo "???? Building React Native web app for Firebase Hosting..."

# Navigate to mobile directory
cd mobile

# Install dependencies
echo "???? Installing dependencies..."
npm ci

# Build for web
echo "???? Building web app..."
npm run build

# The build output should be in a 'dist' or 'web-build' directory
# Copy to parent directory for Firebase deployment
if [ -d "dist" ]; then
    echo "???? Copying dist directory..."
    cp -r dist ../web-build
elif [ -d "web-build" ]; then
    echo "???? Copying web-build directory..."
    cp -r web-build ../web-build
else
    echo "?????? No build output directory found"
    echo "Checking for common build directories..."
    ls -la | grep -E "(dist|build|web-build|output)"
fi

echo "??? Web build completed!"
echo "???? Build output ready for Firebase Hosting deployment"
