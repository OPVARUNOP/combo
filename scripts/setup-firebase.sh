#!/bin/bash

# Exit on error
set -e

echo "🚀 Setting up Firebase for Android..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Login to Firebase
firebase login:ci --no-localhost

# Initialize Firebase project
echo "🔧 Initializing Firebase..."
cd mobile

# Create Firebase project if it doesn't exist
if [ ! -f "firebase.json" ]; then
    firebase init
fi

# Get Firebase App ID
echo "🔑 Getting Firebase App ID..."
FIREBASE_APP_ID=$(firebase apps:sdkconfig android | grep "appId" | head -1 | cut -d'"' -f4)

if [ -z "$FIREBASE_APP_ID" ]; then
    echo "❌ Failed to get Firebase App ID. Please set it up manually in GitHub Secrets."
    exit 1
fi

echo "✅ Firebase setup complete!"
echo ""
echo "🔑 Add these secrets to your GitHub repository:"
echo "1. FIREBASE_APP_ID: $FIREBASE_APP_ID"
echo "2. FIREBASE_TOKEN: (from firebase login:ci)"
echo ""
echo "To add these secrets, go to:"
echo "https://github.com/your-username/combo/settings/secrets/actions"
echo ""
echo "🚀 You're all set! Push your code to trigger the CI/CD pipeline."
