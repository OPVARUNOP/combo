# ???? Firebase Deployment Guide

Complete guide for deploying your COMBO music streaming app to Firebase for both Android and web platforms.

## ???? Deployment Overview

Your app will be deployed to:
- **???? Firebase Hosting** - Web application
- **???? Firebase App Distribution** - Android APK for testing
- **??? Firebase Functions** - Backend API
- **??????? Firestore** - Database
- **???? Firebase Storage** - File storage

## ???? Quick Setup

### 1. Run Setup Script
```bash
./.github/workflows/setup-firebase-secrets.sh
```

### 2. Configure GitHub Secrets
Add these secrets to your GitHub repository:

| Secret | Description | Required |
|--------|-------------|----------|
| `FIREBASE_SERVICE_ACCOUNT` | Firebase service account JSON | ??? |
| `FIREBASE_APP_ID` | Firebase Android app ID | ??? |
| `EXPO_ACCESS_TOKEN` | Expo access token | ??? |

### 3. Deploy
```bash
# Deploy everything
npm run deploy:firebase

# Or use individual commands
./mobile/deploy-firebase.sh production
```

## ???? GitHub Actions Workflows

### Automatic Deployment
- **firebase-android-deploy.yml** - Full deployment (Android + Web + Backend)
- **firebase-hosting-deploy.yml** - Web app only deployment

### Triggers
- **Push to main/master** - Full deployment
- **Web changes only** - Hosting deployment
- **Manual trigger** - Available for both workflows

## ???? Firebase Android Deployment

### What Gets Deployed
- ??? APK built with EAS Build
- ??? Uploaded to Firebase App Distribution
- ??? Available for testers
- ??? Release notes with commit info

### Distribution Groups
- **Testers** - Internal testing group
- **QA** - Quality assurance group
- **Beta** - Beta testers

### Access URLs
- **App Distribution**: Firebase Console > App Distribution
- **Download Links**: Shared with testers via email/Firebase

## ???? Firebase Hosting Deployment

### What Gets Deployed
- ??? React Native web build
- ??? Optimized for production
- ??? CDN distribution
- ??? SSL certificate included

### Access URLs
- **Production**: `https://combo-624e1.web.app`
- **Custom Domain**: Configure in Firebase Console

## ??? Firebase Functions Deployment

### Backend Services
- ??? REST API endpoints
- ??? Authentication helpers
- ??? Database operations
- ??? File upload handling

### API Base URL
```
https://us-central1-combo-624e1.cloudfunctions.net/api
```

## ??????? Database & Storage

### Firestore
- ??? Security rules deployed
- ??? Indexes configured
- ??? Real-time data sync

### Firebase Storage
- ??? File upload rules
- ??? Image optimization
- ??? Access control

## ???? Required Secrets Setup

### 1. Firebase Service Account
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: `combo-624e1`
3. Project Settings > Service Accounts
4. Generate new private key
5. Copy entire JSON content

### 2. Firebase App ID
1. In Firebase Console: Project Settings > General
2. Your apps section > Copy App ID

### 3. Expo Access Token
1. Go to [Expo Settings](https://expo.dev/settings/access-tokens)
2. Create access token
3. Copy token value

## ???? Troubleshooting

### Common Issues

**Authentication Failed**
```bash
# Check Firebase login
firebase projects:list

# Re-authenticate if needed
firebase login
```

**Build Fails**
```bash
# Check EAS CLI version
npx eas --version

# Clear EAS cache
npx eas build --clear-cache
```

**Deployment Fails**
```bash
# Check Firebase project
firebase use combo-624e1

# Test deployment manually
firebase deploy --only hosting
```

## ?????? Monitoring & Analytics

### Firebase Console
- **Performance**: Real-time performance monitoring
- **Analytics**: User behavior and engagement
- **Crashlytics**: Crash reporting and analysis
- **Test Lab**: Device testing for Android

### Access URLs
- **Console**: https://console.firebase.google.com/project/combo-624e1
- **Hosting**: https://combo-624e1.web.app
- **Functions**: https://console.firebase.google.com/project/combo-624e1/functions

## ???? CI/CD Pipeline

### Automatic Deployment Flow
1. **Code Push** ??? GitHub Actions triggered
2. **Build APK** ??? EAS Build creates APK
3. **Deploy Web** ??? Firebase Hosting updated
4. **Deploy Backend** ??? Functions, rules, storage updated
5. **Distribute** ??? APK sent to Firebase App Distribution

### Manual Deployment
```bash
# Deploy everything
./mobile/deploy-firebase.sh production

# Deploy specific services
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore:rules
```

## ???? Production Checklist

- [ ] Firebase project configured
- [ ] GitHub secrets added
- [ ] EAS Build configured
- [ ] Firebase App Distribution groups created
- [ ] Custom domain configured (optional)
- [ ] SSL certificate verified
- [ ] Analytics enabled
- [ ] Monitoring alerts set up

## ???? Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [EAS Build Guide](https://docs.expo.dev/build/)
- [GitHub Actions Guide](https://docs.github.com/en/actions)
- [Firebase Console](https://console.firebase.google.com)

---

???? **Your COMBO app is ready for Firebase deployment> /home/vrn/combo/.github/workflows/setup-firebase-secrets.sh << 'EOF'
#!/bin/bash

# Firebase Deployment Secrets Setup Script
# This script helps you set up the required secrets for Firebase deployment in GitHub

echo "???? Firebase Deployment - GitHub Secrets Setup"
echo "=============================================="
echo ""
echo "You need to set the following secrets in your GitHub repository:"
echo ""
echo "???? REQUIRED SECRETS:"
echo ""

echo "1. FIREBASE_SERVICE_ACCOUNT - Firebase service account JSON key"
echo "   ???? Get from: Firebase Console > Project Settings > Service Accounts > Generate Private Key"
echo "   ???? Required for: Firebase CLI authentication"
echo ""
echo "2. FIREBASE_APP_ID - Your Firebase Android app ID"
echo "   ???? Get from: Firebase Console > Project Settings > General > Your apps > App ID"
echo "   ???? Required for: Firebase App Distribution"
echo ""
echo "3. EXPO_ACCESS_TOKEN - Your Expo access token (if using EAS Build)"
echo "   ???? Get from: https://expo.dev/settings/access-tokens"
echo "   ???? Required for: EAS CLI authentication"
echo ""

echo "???? OPTIONAL SECRETS:"
echo ""
echo "4. FIREBASE_TOKEN - Firebase CI token (alternative to service account)"
echo "   ???? Generate with: firebase login:ci"
echo "   ???? Alternative to: FIREBASE_SERVICE_ACCOUNT"
echo ""

echo "???? SETUP INSTRUCTIONS:"
echo ""
echo "1. Go to your repository on GitHub"
echo "2. Navigate to: Settings > Secrets and variables > Actions"
echo "3. Click 'New repository secret'"
echo "4. Add each secret with the name and value from above"
echo ""
echo "???? FIREBASE SERVICE ACCOUNT SETUP:"
echo ""
echo "1. Go to Firebase Console: https://console.firebase.google.com"
echo "2. Select your project: combo-624e1"
echo "3. Go to: Project Settings > Service Accounts"
echo "4. Click 'Generate new private key'"
echo "5. Download the JSON file"
echo "6. Copy the entire JSON content"
echo "7. Paste as FIREBASE_SERVICE_ACCOUNT secret value"
echo ""
echo "???? FIREBASE APP ID SETUP:"
echo ""
echo "1. In Firebase Console, go to: Project Settings > General"
echo "2. Scroll to 'Your apps' section"
echo "3. Find your Android app and copy the App ID"
echo "4. Paste as FIREBASE_APP_ID secret value"
echo ""
echo "???? EAS BUILD SETUP:"
echo ""
echo "1. Go to: https://expo.dev/settings/access-tokens"
echo "2. Create new access token"
echo "3. Copy the token"
echo "4. Paste as EXPO_ACCESS_TOKEN secret value"
echo ""
echo "??? After setting up secrets:"
echo ""
echo "??? Firebase Android deployment will work automatically"
echo "??? Web app will deploy to Firebase Hosting"
echo "??? EAS builds will be available for distribution"
echo ""
echo "???? Your Firebase deployment is ready!"
EOF* ????
