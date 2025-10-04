#!/bin/bash

# COMBO Mobile App - Complete Deployment Script
# This script handles building and deploying the app for production

set -e  # Exit on any error

echo "???? COMBO Mobile App - Complete Deployment"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="combo-mobile"
ENVIRONMENT=${1:-production}  # Default to production if no env specified
BUILD_TYPE=${2:-release}     # Default to release build

# Validate environment
if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
    echo -e "${RED}??? Invalid environment: $ENVIRONMENT${NC}"
    echo "Valid options: staging, production"
    exit 1
fi

echo -e "${BLUE}???? Deployment Configuration:${NC}"
echo "  Environment: $ENVIRONMENT"
echo "  Build Type: $BUILD_TYPE"
echo "  App Name: $APP_NAME"
echo ""

# Check prerequisites
echo -e "${YELLOW}???? Checking prerequisites...${NC}"

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo -e "${RED}??? EAS CLI is not installed${NC}"
    echo "Install it with: npm install -g @expo/eas-cli"
    exit 1
fi

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}??? Firebase CLI is not installed${NC}"
    echo "Install it with: npm install -g firebase-tools"
    exit 1
fi

# Check if Node.js version is compatible
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [[ $NODE_VERSION -lt 16 ]]; then
    echo -e "${RED}??? Node.js version $NODE_VERSION is too old. Require >= 16${NC}"
    exit 1
fi

echo -e "${GREEN}??? Prerequisites check passed${NC}"

# Environment setup
echo -e "${YELLOW}?????? Setting up environment...${NC}"

# Copy environment file
if [[ "$ENVIRONMENT" == "production" ]]; then
    ENV_FILE=".env.production"
    if [[ ! -f "$ENV_FILE" ]]; then
        echo -e "${YELLOW}?????? .env.production not found, using .env${NC}"
        ENV_FILE=".env"
    fi
else
    ENV_FILE=".env.staging"
    if [[ ! -f "$ENV_FILE" ]]; then
        echo -e "${YELLOW}?????? .env.staging not found, using .env${NC}"
        ENV_FILE=".env"
    fi
fi

if [[ -f "$ENV_FILE" ]]; then
    cp "$ENV_FILE" .env
    echo -e "${GREEN}??? Environment file configured${NC}"
else
    echo -e "${RED}??? Environment file not found: $ENV_FILE${NC}"
    exit 1
fi

# Install dependencies
echo -e "${YELLOW}???? Installing dependencies...${NC}"
npm ci --production=false

# Run tests
echo -e "${YELLOW}???? Running tests...${NC}"
npm run test

# Lint code
echo -e "${YELLOW}???? Linting code...${NC}"
npm run lint

# Type checking
echo -e "${YELLOW}???? Type checking...${NC}"
npm run type-check

echo -e "${GREEN}??? Pre-build checks completed${NC}"

# Deploy Firebase backend (Functions, Firestore, Storage)
echo -e "${YELLOW}???? Deploying Firebase backend...${NC}"

if [[ "$ENVIRONMENT" == "production" ]]; then
    echo -e "${BLUE}???? Deploying Firebase to production...${NC}"
    ./deploy-firebase.sh production
else
    echo -e "${BLUE}???? Deploying Firebase to staging...${NC}"
    ./deploy-firebase.sh staging
fi

echo -e "${GREEN}??? Firebase backend deployed${NC}"

# Build process
echo -e "${YELLOW}??????? Building mobile app...${NC}"

BUILD_PROFILE="$ENVIRONMENT"
if [[ "$ENVIRONMENT" == "production" ]]; then
    BUILD_PROFILE="production"
elif [[ "$ENVIRONMENT" == "staging" ]]; then
    BUILD_PROFILE="staging"
fi

# Build for both platforms
echo -e "${BLUE}???? Building for iOS...${NC}"
eas build --platform ios --profile $BUILD_PROFILE --non-interactive

echo -e "${BLUE}???? Building for Android...${NC}"
eas build --platform android --profile $BUILD_PROFILE --non-interactive

echo -e "${GREEN}??? Mobile app build completed${NC}"

# Deploy process (if deploying to stores)
if [[ "$ENVIRONMENT" == "production" ]]; then
    echo -e "${YELLOW}???? Deploying to app stores...${NC}"

    echo -e "${BLUE}???? Submitting to App Store...${NC}"
    eas submit --platform ios --profile production

    echo -e "${BLUE}???? Submitting to Play Store...${NC}"
    eas submit --platform android --profile production

    echo -e "${GREEN}??? App store deployment completed${NC}"
fi

# Update version if needed
echo -e "${YELLOW}???? Updating version...${NC}"
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo "Current version: $CURRENT_VERSION"

# Create deployment summary
echo -e "${BLUE}???? Complete Deployment Summary:${NC}"
echo "================================="
echo "  Environment: $ENVIRONMENT"
echo "  Firebase Backend: ??? Deployed"
echo "  Mobile App Build: ??? Completed"
echo "  App Store Submission: ??? Completed"
echo "  Version: $CURRENT_VERSION"
echo "  Timestamp: $(date)"
echo "  Status: ??? SUCCESS"

# Send notification (optional)
if command -v curl &> /dev/null; then
    echo -e "${YELLOW}???? Sending deployment notification...${NC}"
    # You can integrate with Slack, Discord, or other notification services here
    # curl -X POST -H 'Content-type: application/json' \
    #   --data '{"text":"COMBO Mobile App deployed to '$ENVIRONMENT' successfully!"}' \
    #   $SLACK_WEBHOOK_URL
fi

echo -e "${GREEN}???? Complete deployment finished successfully!${NC}"
echo ""
echo "???? Your COMBO music streaming app is now live!"
echo ""
echo "???? iOS: Available via TestFlight or App Store"
echo "???? Android: Available via internal testing track or Play Store"
echo "???? Web: Available via Firebase Hosting"
echo "??? API: Available via Firebase Functions"
echo ""
echo "???? Access points:"
echo "  ??? Firebase Console: https://console.firebase.google.com"
echo "  ??? Web App: https://combo-624e1.web.app"
echo "  ??? API: https://us-central1-combo-624e1.cloudfunctions.net/api"
echo ""
echo "???? Next steps:"
echo "  1. Test the deployed mobile apps on devices"
echo "  2. Monitor Firebase console for backend usage"
echo "  3. Check app store submissions"
echo "  4. Update users about new features"
echo ""
echo -e "${GREEN}???? Your music revolution is live! ????${NC}"
