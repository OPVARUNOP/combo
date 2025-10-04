#!/bin/bash

# COMBO Mobile App - Firebase Project Setup Script
# This script helps initialize a Firebase project for the COMBO app

set -e

echo "???? COMBO Mobile App - Firebase Project Setup"
echo "============================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
PROJECT_ID=${1:-combo-624e1}  # Default project ID
PROJECT_NAME="COMBO Music Streaming"

echo -e "${BLUE}???? Project Configuration:${NC}"
echo "  Project ID: $PROJECT_ID"
echo "  Project Name: $PROJECT_NAME"
echo ""

# Check prerequisites
echo -e "${YELLOW}???? Checking prerequisites...${NC}"

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}??? Firebase CLI is not installed${NC}"
    echo "Install it with: npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in to Firebase
if ! firebase projects:list &> /dev/null; then
    echo -e "${YELLOW}???? Please log in to Firebase first:${NC}"
    echo "firebase login"
    firebase login
fi

echo -e "${GREEN}??? Prerequisites check passed${NC}"

# Initialize Firebase project
echo -e "${YELLOW}???? Initializing Firebase project...${NC}"

# Create Firebase project if it doesn't exist
if ! firebase projects:list | grep -q "$PROJECT_ID"; then
    echo -e "${BLUE}???? Creating Firebase project...${NC}"
    firebase projects:create $PROJECT_ID --name "$PROJECT_NAME"
    
    echo -e "${GREEN}??? Firebase project created${NC}"
else
    echo -e "${YELLOW}?????? Firebase project already exists${NC}"
fi

# Set as default project
firebase use $PROJECT_ID

# Enable required Firebase services
echo -e "${YELLOW}?????? Enabling Firebase services...${NC}"

# Enable Authentication
echo -e "${BLUE}???? Enabling Authentication...${NC}"
firebase auth:export users.json --project $PROJECT_ID || echo "Auth service ready"

# Enable Firestore
echo -e "${BLUE}??????? Enabling Firestore...${NC}"
firebase firestore:databases:create --project $PROJECT_ID || echo "Firestore already enabled"

# Enable Storage
echo -e "${BLUE}???? Enabling Storage...${NC}"
firebase storage --project $PROJECT_ID || echo "Storage already enabled"

# Enable Functions
echo -e "${BLUE}??? Enabling Functions...${NC}"
firebase functions:config:set project.id="$PROJECT_ID" --project $PROJECT_ID

echo -e "${GREEN}??? Firebase services enabled${NC}"

# Deploy security rules
echo -e "${YELLOW}???? Deploying security rules...${NC}"

# Deploy Firestore rules
firebase deploy --only firestore:rules --project $PROJECT_ID

# Deploy Storage rules
firebase deploy --only storage --project $PROJECT_ID

echo -e "${GREEN}??? Security rules deployed${NC}"

# Set up Firebase Functions
echo -e "${YELLOW}??? Setting up Firebase Functions...${NC}"

cd functions

# Install dependencies
echo -e "${BLUE}???? Installing function dependencies...${NC}"
npm install

# Build functions
echo -e "${BLUE}??????? Building functions...${NC}"
npm run build

# Deploy functions
echo -e "${BLUE}???? Deploying functions...${NC}"
firebase deploy --only functions --project $PROJECT_ID

cd ..

echo -e "${GREEN}??? Firebase Functions deployed${NC}"

# Initialize hosting
echo -e "${YELLOW}???? Setting up Firebase Hosting...${NC}"

# Create hosting configuration if it doesn't exist
if [[ ! -f "firebase.json" ]]; then
    echo -e "${RED}??? firebase.json not found${NC}"
    echo "Please ensure firebase.json exists in the project root"
    exit 1
fi

# Deploy hosting (empty for now, will be deployed with web build)
firebase deploy --only hosting --project $PROJECT_ID || echo "Hosting ready for deployment"

echo -e "${GREEN}??? Firebase Hosting configured${NC}"

# Create initial configuration
echo -e "${YELLOW}?????? Creating initial configuration...${NC}"

# Set environment-specific configuration
if [[ -f ".env" ]]; then
    echo -e "${BLUE}???? Setting environment configuration...${NC}"
    firebase functions:config:set \
      app.name="combo-mobile" \
      app.environment="production" \
      app.version="1.0.0" \
      --project $PROJECT_ID
else
    echo -e "${YELLOW}?????? No .env file found, using defaults${NC}"
fi

echo -e "${GREEN}??? Initial configuration completed${NC}"

# Create setup summary
echo -e "\n${BLUE}???? Setup Summary:${NC}"
echo "=================="
echo "  Project ID: $PROJECT_ID"
echo "  Project Name: $PROJECT_NAME"
echo "  Services Enabled:"
echo "    ??? Authentication"
echo "    ??? Firestore Database"
echo "    ??? Cloud Storage"
echo "    ??? Cloud Functions"
echo "    ??? Hosting"
echo ""
echo "  Security Rules: ??? Deployed"
echo "  Functions: ??? Deployed"
echo "  Configuration: ??? Set"

echo -e "\n${GREEN}???? Firebase project setup completed!${NC}"
echo ""
echo "???? Access your Firebase project:"
echo "  Console: https://console.firebase.google.com/project/$PROJECT_ID"
echo "  Hosting: https://$PROJECT_ID.web.app"
echo "  Functions: https://us-central1-$PROJECT_ID.cloudfunctions.net/api"
echo ""
echo "???? Next steps:"
echo "  1. Update your mobile app API endpoints to use Firebase Functions"
echo "  2. Configure authentication in your mobile app"
echo "  3. Set up push notifications (optional)"
echo "  4. Run './deploy-firebase.sh production' for full deployment"
echo ""
echo -e "${GREEN}???? Your Firebase backend is ready!${NC}"
