#!/bin/bash

# COMBO Backend CI/CD Deployment Script
# This script automates the build and deployment process to Google Cloud Run

set -e  # Exit on any error

# Configuration
PROJECT_ID="combo-624e1"
SERVICE_NAME="combo-backend"
REGION="us-central1"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

echo "🚀 Starting COMBO Backend CI/CD Deployment..."
echo "=============================================="

# Check if required tools are installed
command -v gcloud >/dev/null 2>&1 || { echo "❌ gcloud CLI is required but not installed. Aborting."; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "❌ Docker is required but not installed. Aborting."; exit 1; }

# Authenticate with gcloud (if not already authenticated)
echo "🔐 Checking gcloud authentication..."
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "⚠️  Not authenticated with gcloud. Please run: gcloud auth login"
    exit 1
fi

# Set the project
echo "🏷️  Setting gcloud project to: $PROJECT_ID"
gcloud config set project $PROJECT_ID

# Build the Docker image
echo "🔨 Building Docker image..."
gcloud builds submit --tag $IMAGE_NAME .

if [ $? -ne 0 ]; then
    echo "❌ Docker build failed. Aborting deployment."
    exit 1
fi

echo "✅ Docker image built successfully: $IMAGE_NAME"

# Deploy to Cloud Run
echo "🚢 Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
    --image $IMAGE_NAME \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --port 8080 \
    --memory 1Gi \
    --cpu 1 \
    --max-instances 10 \
    --timeout 300 \
    --set-env-vars FIREBASE_DATABASE_URL=https://combo-624e1-default-rtdb.firebaseio.com,FIREBASE_DATABASE_SECRET=mqucsRC7MHfDLdYSbNTU1srwlK4l6RsOtKKgqB4m,JWT_SECRET=combo_backend_secret_key_production,NODE_ENV=production

if [ $? -ne 0 ]; then
    echo "❌ Cloud Run deployment failed. Check the logs above for details."
    exit 1
fi

echo "✅ Deployment successful!"
echo ""
echo "🎉 Your COMBO Backend is now live at:"
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format="value(status.url)")
echo "   🌐 $SERVICE_URL"
echo ""
echo "📊 You can monitor your service at:"
echo "   🔍 https://console.cloud.google.com/run/detail/$REGION/$SERVICE_NAME/metrics"
echo ""
echo "📝 API Documentation:"
echo "   📚 https://combo-backend-531640636721.us-central1.run.app/api"
echo ""
echo "✅ Deployment completed successfully!"
