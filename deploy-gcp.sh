#!/bin/bash

# Google Cloud Deployment Script
# Deploy COMBO Backend to Google Cloud Run

set -e

# Configuration
PROJECT_ID="combo-music-app"
SERVICE_NAME="combo-backend"
REGION="us-central1"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

echo "🚀 Deploying COMBO Backend to Google Cloud Run..."

# Build and push Docker image
echo "📦 Building Docker image..."
gcloud builds submit --tag ${IMAGE_NAME} .

# Deploy to Cloud Run
echo "🌟 Deploying to Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
    --image ${IMAGE_NAME} \
    --platform managed \
    --region ${REGION} \
    --allow-unauthenticated \
    --set-env-vars="NODE_ENV=production" \
    --set-env-vars="PORT=3001" \
    --set-env-vars="JAMENDO_CLIENT_ID=c1eea382" \
    --set-env-vars="JAMENDO_CLIENT_SECRET=245483b397b6bd04e7e3937d4458e5f2" \
    --memory=1Gi \
    --cpu=1 \
    --max-instances=10 \
    --timeout=300 \
    --concurrency=80

# Get the service URL
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --platform managed --region ${REGION} --format="value(status.url)")

echo "✅ Deployment successful!"
echo "🔗 Service URL: ${SERVICE_URL}"
echo ""
echo "📝 Next steps:"
echo "1. Set up Redis Memorystore in Google Cloud"
echo "2. Update REDIS_HOST and REDIS_PASSWORD in environment variables"
echo "3. Update mobile app API base URL to: ${SERVICE_URL}/api"
echo "4. Set up custom domain (optional)"
