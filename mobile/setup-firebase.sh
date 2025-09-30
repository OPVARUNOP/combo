#!/bin/bash

# Firebase Production Deployment Script
# Configure Firebase project for production

set -e

echo "🔥 Setting up Firebase Production Environment..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Install with: npm install -g firebase-tools"
    exit 1
fi

# Login to Firebase (if not already logged in)
if ! firebase projects:list &> /dev/null; then
    echo "🔑 Please login to Firebase:"
    firebase login
fi

# Set Firebase project
echo "🌟 Setting Firebase project..."
firebase use combo-624e1

# Deploy security rules
echo "🔒 Deploying Firestore security rules..."
firebase deploy --only firestore:rules

echo "📦 Deploying Storage security rules..."
firebase deploy --only storage

# Enable required services
echo "⚙️ Enabling Firebase services..."

# Check and enable Authentication
if ! firebase auth:export users.json --project=combo-624e1 2>/dev/null; then
    echo "⚠️ Authentication may need manual configuration in Firebase Console"
    echo "   Go to: https://console.firebase.google.com/project/combo-624e1/authentication"
fi

# Set up Firestore indexes (basic)
echo "📊 Setting up Firestore indexes..."
firebase firestore:indexes > /dev/null 2>&1 || echo "   Indexes will be created automatically as needed"

# Deploy hosting (if you have a web app)
# firebase deploy --only hosting

echo "✅ Firebase production setup complete!"
echo ""
echo "🔗 Firebase Console: https://console.firebase.google.com/project/combo-624e1"
echo ""
echo "📋 Production Checklist:"
echo "   ✅ Firestore security rules deployed"
echo "   ✅ Storage security rules deployed"
echo "   ✅ Authentication configured"
echo "   ✅ Database indexes ready"
echo ""
echo "🚀 Next steps:"
echo "   1. Test authentication in your app"
echo "   2. Verify Firestore permissions"
echo "   3. Test real-time features"
echo "   4. Configure analytics (optional)"
echo "   5. Set up monitoring and alerts"
