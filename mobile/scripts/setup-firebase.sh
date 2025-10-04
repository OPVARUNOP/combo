#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Starting Firebase setup for COMBO Music App${NC}\n"

# Check if firebase-tools is installed
if ! command -v firebase &> /dev/null; then
    echo -e "${YELLOW}Firebase CLI not found. Installing firebase-tools...${NC}"
    npm install -g firebase-tools
    echo -e "${GREEN}✅ Firebase CLI installed successfully!${NC}\n"
fi

# Step 1: Login to Firebase
echo -e "${YELLOW}🔐 Please log in to your Firebase account...${NC}"
firebase login --no-localhost

# Step 2: Initialize Firebase project
echo -e "\n${YELLOW}🚀 Initializing Firebase project...${NC}"
firebase init

# Step 3: Create firebase-config.json from example
if [ ! -f "firebase-config.json" ]; then
    echo -e "\n${YELLOW}📝 Creating firebase-config.json from example...${NC}"
    cp firebase-config-example.json firebase-config.json
    echo -e "${GREEN}✅ Created firebase-config.json. Please update it with your Firebase project details.${NC}"
else
    echo -e "\n${GREEN}✅ firebase-config.json already exists.${NC}"
fi

# Step 4: Set up Android app in Firebase Console
echo -e "\n${YELLOW}📱 Setting up Android app in Firebase Console...${NC}"
echo -e "Please go to the Firebase Console (https://console.firebase.google.com/)\nand add a new Android app with the following details:"
echo -e "\n${GREEN}Android package name: com.combo.app${NC}"
echo -e "${GREEN}App nickname: COMBO Music${NC}"
echo -e "${GREEN}Debug signing certificate SHA-1: [Your debug SHA-1]${NC}"
echo -e "\nAfter adding the app, download the google-services.json file and place it in the android/app/ directory."

# Step 5: Set up Firebase App Distribution
echo -e "\n${YELLOW}📦 Setting up Firebase App Distribution...${NC}"
echo -e "1. Go to Firebase Console > App Distribution"
echo -e "2. Set up testers and release notes"
echo -e "3. Get your Firebase App ID from Project Settings > General > Your Apps"

# Step 6: Add GitHub Secrets instructions
echo -e "\n${YELLOW}🔑 Add the following GitHub Secrets to your repository:${NC}"
echo -e "1. Go to your GitHub repository > Settings > Secrets > Actions"
echo -e "2. Add these secrets:"
echo -e "   - FIREBASE_TOKEN: Get this by running 'firebase login:ci'"
echo -e "   - FIREBASE_APP_ID: Your Firebase App ID from Project Settings"
echo -e "   - KEYSTORE: Contents of your keystore file (base64 encoded)"
echo -e "   - KEY_ALIAS: Your key alias"
echo -e "   - KEY_PASSWORD: Your key password"
echo -e "   - KEYSTORE_PASSWORD: Your keystore password"

echo -e "\n${GREEN}🎉 Firebase setup completed!${NC}"
echo -e "Next steps:"
echo -e "1. Update firebase-config.json with your Firebase project details"
echo -e "2. Place google-services.json in android/app/"
echo -e "3. Update the GitHub workflow file with your Firebase project ID"
echo -e "4. Push your changes to trigger the CI/CD pipeline\n"
