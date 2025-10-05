# EAS Build GitHub Actions Setup Guide

This guide will help you set up automated builds for your React Native app using EAS Build and GitHub Actions.

## ???? What We've Done

1. **Created EAS Build Workflow** - `.github/workflows/android-eas-build.yml`
2. **Setup Script** - `.github/workflows/setup-eas-secrets.sh`

## ???? Required Setup Steps

### 1. Generate Expo Access Token

1. Go to [Expo Settings > Access Tokens](https://expo.dev/settings/access-tokens)
2. Click "Create access token"
3. Copy the token (you won't see it again!)

### 2. Set GitHub Repository Secrets

Go to your GitHub repository:
1. **Settings** ??? **Secrets and variables** ??? **Actions**
2. Click **"New repository secret"**
3. Add these secrets:

| Secret Name | Description | Required |
|-------------|-------------|----------|
| `EXPO_ACCESS_TOKEN` | Your Expo access token | ??? |
| `EXPO_ACCOUNT` | Your Expo username | ??? |
| `EXPO_PROJECT` | Your Expo project slug (from app.json) | ??? |
| `FIREBASE_APP_ID` | Firebase App ID (optional) | ??? |
| `FIREBASE_TOKEN` | Firebase CI token (optional) | ??? |

### 3. Verify Your EAS Configuration

Check your `eas.json` file:
```json
{
  "cli": {
    "version": ">= 16.20.0",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "autoIncrement": true
    }
  }
}
```

### 4. Test the Setup

1. **Push a commit** to trigger the workflow
2. **Check Actions tab** in your GitHub repository
3. **Monitor build progress** in real-time

## ???? Workflow Features

### Automatic Builds
- **Push to main/master** ??? Preview build
- **Pull requests** ??? Development build  
- **Tags (v*)** ??? Production build

### Notifications
- **Build comments** on pull requests
- **Failure notifications** on build errors

### Artifact Management
- **Build artifacts** stored for 7 days
- **GitHub releases** created for tags

## ?????? Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Check `EXPO_ACCESS_TOKEN` is correct
   - Ensure token has proper permissions

2. **Build Fails**
   - Check EAS build logs in Expo dashboard
   - Verify all dependencies are properly installed

3. **Missing Secrets**
   - All required secrets must be set before workflow runs

### Debug Mode

To enable debug logging, add this to your workflow:
```yaml
- name: Build with EAS (Debug)
  run: |
    npx eas build --platform android --profile preview --non-interactive --verbose
```

## ???? Resources

- [EAS Build Documentation](https://docs.expo.dev/build/)
- [GitHub Actions for Expo](https://docs.expo.dev/workflow/continuous-integration/)
- [EAS CLI Reference](https://docs.expo.dev/workflow/expo-cli/)

## ???? Next Steps

1. Set up the GitHub secrets
2. Push a commit to test the workflow
3. Monitor the build in GitHub Actions
4. Check the build results in Expo dashboard

Your app will now automatically build whenever you push changes! ????
