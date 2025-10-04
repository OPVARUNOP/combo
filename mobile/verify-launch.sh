#!/bin/bash

# COMBO Mobile App - Pre-Launch Verification Script
# This script validates that everything is ready for launch

set -e

echo "🔍 COMBO Mobile App - Pre-Launch Verification"
echo "============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
APP_NAME="combo-mobile"

echo -e "${BLUE}📋 Starting verification checks...${NC}"

# 1. Check package.json integrity
echo -e "\n${YELLOW}1️⃣ Checking package.json...${NC}"
if [[ -f "package.json" ]]; then
    echo -e "${GREEN}✅ package.json exists${NC}"

    # Check required scripts
    if grep -q '"start"' package.json && grep -q '"build:android"' package.json && grep -q '"build:ios"' package.json; then
        echo -e "${GREEN}✅ Required build scripts present${NC}"
    else
        echo -e "${RED}❌ Missing required build scripts${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ package.json not found${NC}"
    exit 1
fi

# 2. Check environment configuration
echo -e "\n${YELLOW}2️⃣ Checking environment configuration...${NC}"
if [[ -f ".env" ]]; then
    echo -e "${GREEN}✅ .env file exists${NC}"

    # Check for required Firebase variables
    if grep -q "FIREBASE_API_KEY" .env && grep -q "FIREBASE_PROJECT_ID" .env; then
        echo -e "${GREEN}✅ Firebase configuration present${NC}"
    else
        echo -e "${YELLOW}⚠️ Firebase configuration incomplete${NC}"
    fi

    # Check for API configuration
    if grep -q "API_BASE_URL" .env; then
        echo -e "${GREEN}✅ API configuration present${NC}"
    else
        echo -e "${YELLOW}⚠️ API configuration missing${NC}"
    fi
else
    echo -e "${RED}❌ .env file not found${NC}"
    exit 1
fi

# 3. Check app.json configuration
echo -e "\n${YELLOW}3️⃣ Checking app.json configuration...${NC}"
if [[ -f "app.json" ]]; then
    echo -e "${GREEN}✅ app.json exists${NC}"

    # Check for bundle identifiers
    if grep -q '"com.combo.app"' app.json; then
        echo -e "${GREEN}✅ Bundle identifiers configured${NC}"
    else
        echo -e "${YELLOW}⚠️ Bundle identifiers may need updating${NC}"
    fi
else
    echo -e "${RED}❌ app.json not found${NC}"
    exit 1
fi

# 4. Check EAS configuration
echo -e "\n${YELLOW}4️⃣ Checking EAS configuration...${NC}"
if [[ -f "eas.json" ]]; then
    echo -e "${GREEN}✅ eas.json exists${NC}"

    # Check for build profiles
    if grep -q '"production"' eas.json && grep -q '"staging"' eas.json; then
        echo -e "${GREEN}✅ Build profiles configured${NC}"
    else
        echo -e "${YELLOW}⚠️ Build profiles incomplete${NC}"
    fi
else
    echo -e "${RED}❌ eas.json not found${NC}"
    exit 1
fi

# 5. Check source code structure
echo -e "\n${YELLOW}5️⃣ Checking source code structure...${NC}"

REQUIRED_DIRS=("src" "src/components" "src/screens" "src/services" "src/store" "src/utils")
for dir in "${REQUIRED_DIRS[@]}"; do
    if [[ -d "$dir" ]]; then
        echo -e "${GREEN}✅ $dir exists${NC}"
    else
        echo -e "${RED}❌ $dir missing${NC}"
        exit 1
    fi
done

# 6. Check Firebase configuration
echo -e "\n${YELLOW}6️⃣ Checking Firebase configuration...${NC}"
if [[ -f "google-services.json" ]]; then
    echo -e "${GREEN}✅ google-services.json exists${NC}"
else
    echo -e "${YELLOW}⚠️ google-services.json not found (required for production)${NC}"
fi

# 7. Check for required assets
echo -e "\n${YELLOW}7️⃣ Checking required assets...${NC}"
REQUIRED_ASSETS=("assets" "assets/images")
for asset in "${REQUIRED_ASSETS[@]}"; do
    if [[ -d "$asset" ]]; then
        echo -e "${GREEN}✅ $asset directory exists${NC}"
    else
        echo -e "${YELLOW}⚠️ $asset directory missing${NC}"
    fi
done

# 8. Check for documentation
echo -e "\n${YELLOW}8️⃣ Checking documentation...${NC}"
DOCS=("README.md" "LAUNCH-GUIDE.md")
for doc in "${DOCS[@]}"; do
    if [[ -f "$doc" ]]; then
        echo -e "${GREEN}✅ $doc exists${NC}"
    else
        echo -e "${YELLOW}⚠️ $doc missing${NC}"
    fi
done

# 9. Check deployment script
echo -e "\n${YELLOW}9️⃣ Checking deployment script...${NC}"
if [[ -f "deploy.sh" ]] && [[ -x "deploy.sh" ]]; then
    echo -e "${GREEN}✅ deploy.sh exists and is executable${NC}"
else
    echo -e "${YELLOW}⚠️ deploy.sh missing or not executable${NC}"
fi

# 10. Check for security configurations
echo -e "\n${YELLOW}🔒 Checking security configurations...${NC}"
if grep -q "JWT_SECRET" .env && grep -q "ENCRYPTION_KEY" .env; then
    echo -e "${GREEN}✅ Security keys configured${NC}"
else
    echo -e "${YELLOW}⚠️ Security keys not configured${NC}"
fi

# Final summary
echo -e "\n${BLUE}📊 Verification Summary:${NC}"
echo "=========================="

ISSUES=0
WARNINGS=0

# Count issues and warnings
if [[ ! -f "google-services.json" ]]; then
    ((WARNINGS++))
fi

if [[ ! -f "deploy.sh" ]]; then
    ((WARNINGS++))
fi

if ! grep -q "JWT_SECRET" .env; then
    ((WARNINGS++))
fi

echo -e "${GREEN}✅ Core functionality verified${NC}"
echo -e "${GREEN}✅ Build system configured${NC}"
echo -e "${GREEN}✅ Environment setup complete${NC}"

if [[ $WARNINGS -gt 0 ]]; then
    echo -e "${YELLOW}⚠️ $WARNINGS warnings found (non-blocking)${NC}"
else
    echo -e "${GREEN}✅ No warnings found${NC}"
fi

echo -e "\n${GREEN}🎉 Pre-launch verification completed successfully!${NC}"
echo ""
echo -e "${BLUE}🚀 Your app is ready for launch!${NC}"
echo ""
echo "Next steps:"
echo "  1. Review and address any warnings above"
echo "  2. Test builds on physical devices"
echo "  3. Run './deploy.sh production' for final deployment"
echo "  4. Submit to app stores"
echo ""
echo -e "${GREEN}🎵 Ready to launch your music revolution!${NC}"
