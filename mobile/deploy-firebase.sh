#!/bin/bash

# COMBO Mobile App - Firebase Deployment Script
# This script handles complete Firebase deployment including hosting, functions, and rules

set -e

echo "🔥 COMBO Mobile App - Firebase Deployment"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
APP_NAME="combo-mobile"
ENVIRONMENT=${1:-production}
PROJECT_ID=${2:-combo-624e1}  # Your Firebase project ID

# Validate environment
if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
    echo -e "${RED}❌ Invalid environment: $ENVIRONMENT${NC}"
    echo "Valid options: staging, production"
    exit 1
fi

echo -e "${BLUE}📋 Deployment Configuration:${NC}"
echo "  Environment: $ENVIRONMENT"
echo "  Project ID: $PROJECT_ID"
echo "  App Name: $APP_NAME"
echo ""

# Check prerequisites
echo -e "${YELLOW}🔍 Checking prerequisites...${NC}"

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}❌ Firebase CLI is not installed${NC}"
    echo "Install it with: npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in to Firebase
if ! firebase projects:list &> /dev/null; then
    echo -e "${RED}❌ Not logged in to Firebase${NC}"
    echo "Login with: firebase login"
    exit 1
fi

# Check if project exists
if ! firebase projects:list | grep -q "$PROJECT_ID"; then
    echo -e "${RED}❌ Firebase project '$PROJECT_ID' not found${NC}"
    echo "Create project first or use correct project ID"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"

# Set Firebase project
echo -e "${YELLOW}🎯 Setting Firebase project...${NC}"
firebase use $PROJECT_ID

# Install dependencies for functions
echo -e "${YELLOW}📦 Installing Firebase Functions dependencies...${NC}"
cd functions
npm ci
cd ..

# Build and deploy Firebase Functions
echo -e "${YELLOW}⚡ Building and deploying Firebase Functions...${NC}"

if [[ "$ENVIRONMENT" == "production" ]]; then
    echo -e "${BLUE}🚀 Deploying functions to production...${NC}"
    firebase deploy --only functions --project $PROJECT_ID
else
    echo -e "${BLUE}🔧 Deploying functions to staging...${NC}"
    firebase deploy --only functions --project $PROJECT_ID
fi

echo -e "${GREEN}✅ Firebase Functions deployed${NC}"

# Build the web app for hosting
echo -e "${YELLOW}🌐 Building web app for Firebase Hosting...${NC}"

# Create web build configuration
if [[ "$ENVIRONMENT" == "production" ]]; then
    BUILD_ENV="production"
    SITE_ID="combo-music"  # Your Firebase hosting site ID
else
    BUILD_ENV="staging"
    SITE_ID="combo-music-staging"
fi

# Build the web version
echo -e "${BLUE}🏗️ Building web app...${NC}"
npm run build

# Deploy to Firebase Hosting
echo -e "${YELLOW}📤 Deploying to Firebase Hosting...${NC}"

if [[ "$ENVIRONMENT" == "production" ]]; then
    firebase deploy --only hosting --project $PROJECT_ID
else
    firebase deploy --only hosting --project $PROJECT_ID
fi

echo -e "${GREEN}✅ Firebase Hosting deployed${NC}"

# Deploy Firestore rules and indexes
echo -e "${YELLOW}🔒 Deploying security rules...${NC}"

if [[ "$ENVIRONMENT" == "production" ]]; then
    firebase deploy --only firestore:rules,firestore:indexes,storage --project $PROJECT_ID
else
    firebase deploy --only firestore:rules,firestore:indexes,storage --project $PROJECT_ID
fi

echo -e "${GREEN}✅ Security rules deployed${NC}"

# Run post-deployment tasks
echo -e "${YELLOW}🔄 Running post-deployment tasks...${NC}"

# Update function configuration
firebase functions:config:set \
  app.name="$APP_NAME" \
  app.environment="$ENVIRONMENT" \
  --project $PROJECT_ID

# Test the deployed functions
echo -e "${BLUE}🧪 Testing deployed functions...${NC}"
curl -s "https://us-central1-$PROJECT_ID.cloudfunctions.net/api/health" || echo "Health check endpoint not available"

echo -e "${GREEN}✅ Post-deployment tasks completed${NC}"

# Create deployment summary
echo -e "\n${BLUE}📊 Deployment Summary:${NC}"
echo "=========================="
echo "  Environment: $ENVIRONMENT"
echo "  Project ID: $PROJECT_ID"
echo "  Functions: ✅ Deployed"
echo "  Hosting: ✅ Deployed"
echo "  Security Rules: ✅ Deployed"
echo "  Timestamp: $(date)"
echo "  Status: ✅ SUCCESS"

# Get deployment URLs
echo -e "\n${GREEN}🚀 Deployment URLs:${NC}"
echo "  Hosting: https://$SITE_ID.web.app"
echo "  Functions: https://us-central1-$PROJECT_ID.cloudfunctions.net/api"
echo "  Firestore: https://console.firebase.google.com/project/$PROJECT_ID/firestore"
echo "  Storage: https://console.firebase.google.com/project/$PROJECT_ID/storage"

echo -e "\n${GREEN}🎉 Firebase deployment completed successfully!${NC}"
echo ""
echo "🔥 Your COMBO app is now live with Firebase backend!"
echo ""
echo "📱 Mobile App: Use the mobile app with Firebase backend"
echo "🌐 Web App: Available at the hosting URL above"
echo "⚡ API: Available at the functions URL above"
echo ""
echo "🔗 Next steps:"
echo "  1. Test the deployed backend APIs"
echo "  2. Update mobile app API endpoints to use Firebase Functions"
echo "  3. Monitor Firebase console for usage and errors"
echo "  4. Set up monitoring and alerting"
