#!/bin/bash

echo "???? Deploying COMBO Backend to Google Cloud Run..."
echo "================================================="

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "??? gcloud CLI is not installed."
    echo "???? Please install gcloud CLI:"
    echo "   curl https://sdk.cloud.google.com | bash"
    echo "   source ~/.bashrc"
    echo "   gcloud init"
    exit 1
fi

# Check if logged in
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -1 > /dev/null; then
    echo "??? Not authenticated with gcloud."
    echo "???? Please run: gcloud auth login"
    exit 1
fi

# Set project
PROJECT_ID="combo-624e1"
echo "???? Setting project to: $PROJECT_ID"
gcloud config set project $PROJECT_ID

# Enable required APIs
echo "???? Enabling required APIs..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable secretmanager.googleapis.com

# Build and deploy
echo "???? Building and deploying to Cloud Run..."
gcloud run deploy combo-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi \
  --cpu 1 \
  --max-instances 10 \
  --timeout 300 \
  --set-env-vars="NODE_ENV=production" \
  --set-env-vars="JAMENDO_CLIENT_ID=c1eea382" \
  --set-env-vars="JAMENDO_CLIENT_SECRET=245483b397b6bd04e7e3937d4458e5f2" \
  --set-env-vars="PORT=8080"

if [ $? -eq 0 ]; then
    echo ""
    echo "???? DEPLOYMENT SUCCESSFUL!"
    echo ""
    echo "???? Your service URL:"
    gcloud run services describe combo-backend --region us-central1 --format="value(status.url)"
    echo ""
    echo "???? Next steps:"
    echo "1. Copy the service URL above"
    echo "2. Update mobile app: /mobile/src/services/api.js"
    echo "3. Replace PRODUCTION_BACKEND_URL with your service URL"
    echo "4. Test: curl 'your-service-url/api/health'"
else
    echo ""
    echo "??? DEPLOYMENT FAILED"
    echo "???? Check the logs:"
    echo "   https://console.cloud.google.com/logs"
    echo "???? Common issues:"
    echo "   - Check Dockerfile port configuration"
    echo "   - Verify environment variables"
    echo "   - Check server.js startup"
fi
