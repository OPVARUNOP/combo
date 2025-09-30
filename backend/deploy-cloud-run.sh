#!/bin/bash

# Exit on error
set -e

# Configuration
PROJECT_ID="combo-624e1"  # Replace with your GCP project ID
SERVICE_NAME="combo-backend"
REGION="us-central1"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

# Check if service account key exists
if [ ! -f "./service-account-key.json" ]; then
    echo "Error: service-account-key.json not found. Please ensure it exists in the current directory."
    exit 1
fi

# Build the Docker image
echo "Building Docker image..."
docker build -t ${IMAGE_NAME} .

# Authenticate Docker to gcloud
echo "Authenticating Docker to gcloud..."
gcloud auth configure-docker --quiet

# Push the Docker image to Google Container Registry
echo "Pushing Docker image to Google Container Registry..."
docker push ${IMAGE_NAME}

# Deploy to Cloud Run
echo "Deploying to Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
  --image ${IMAGE_NAME} \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --timeout 300 \
  --set-env-vars="NODE_ENV=production,TRUST_PROXY=1" \
  --update-env-vars="SERVICE_ACCOUNT_KEY=$(cat service-account-key.json | base64 -w 0)"

echo "Deployment complete!"
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region ${REGION} --format 'value(status.url)')
echo "Service URL: ${SERVICE_URL}"
