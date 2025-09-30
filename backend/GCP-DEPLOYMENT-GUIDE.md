# Google Cloud Deployment Guide

## Prerequisites

1. **Google Cloud Account**: Create an account at https://cloud.google.com
2. **Google Cloud CLI**: Install gcloud CLI
   ```bash
   curl https://sdk.cloud.google.com | bash
   exec -l $SHELL
   gcloud init
   ```
3. **Enable Required APIs**:
   ```bash
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable run.googleapis.com
   gcloud services enable containerregistry.googleapis.com
   gcloud services enable secretmanager.googleapis.com
   ```

## Deployment Steps

### 1. Set up Google Cloud Project
```bash
# Create new project
gcloud projects create combo-music-app --name="COMBO Music App"

# Set as default project
gcloud config set project combo-music-app

# Enable billing (required for Cloud Run)
# Go to: https://console.cloud.google.com/billing
```

### 2. Set up Redis Memorystore (Optional but recommended)
```bash
# Create Redis instance
gcloud redis instances create combo-redis \
    --size=1 \
    --region=us-central1 \
    --redis-version=redis_6_x

# Get Redis connection details
gcloud redis instances describe combo-redis --region=us-central1
```

### 3. Deploy Backend
```bash
cd /home/vrn/combo/backend

# Update environment variables in deploy-gcp.sh
# Set your Redis host and password

# Deploy
./deploy-gcp.sh
```

### 4. Set up Custom Domain (Optional)
```bash
# Add custom domain to Cloud Run service
gcloud run domain-mappings create --service=combo-backend \
    --domain=your-api.yourdomain.com \
    --region=us-central1
```

### 5. Update Mobile App
Update `/mobile/src/services/api.js`:
```javascript
const api = axios.create({
  baseURL: 'https://your-deployed-backend-url/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

## Environment Variables for Production

Update these in your Cloud Run service:

```bash
# Required
NODE_ENV=production
JAMENDO_CLIENT_ID=c1eea382
JAMENDO_CLIENT_SECRET=245483b397b6bd04e7e3937d4458e5f2

# Redis (from Memorystore)
REDIS_HOST=10.x.x.x
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# Security (generate secure random strings)
JWT_SECRET=your-super-secure-jwt-secret-here
ENCRYPTION_KEY=your-super-secure-encryption-key-here

# CORS (update with your frontend domains)
ALLOWED_ORIGINS=https://your-frontend.com,https://your-mobile-app.com
```

## Monitoring and Logging

1. **Cloud Monitoring**: Automatically enabled for Cloud Run
2. **Cloud Logging**: View logs at https://console.cloud.google.com/logs
3. **Error Reporting**: Automatic error tracking

## Scaling Configuration

Current settings in deploy script:
- Memory: 1GB
- CPU: 1 core
- Max instances: 10
- Concurrency: 80 requests per instance
- Timeout: 300 seconds

Adjust based on your needs in the deploy script.

## Security Best Practices

1. **Use Secret Manager** for sensitive environment variables:
   ```bash
   # Create secrets
   echo -n "your-secret-value" | gcloud secrets create jwt-secret --data-file=-

   # Use in Cloud Run
   gcloud run deploy combo-backend \
       --set-env-vars="JWT_SECRET=$(gcloud secrets versions access latest --secret=jwt-secret)"
   ```

2. **Enable VPC** for better security
3. **Set up IAM roles** with minimal permissions
4. **Enable Cloud Armor** for DDoS protection

## Troubleshooting

### Common Issues:

1. **Build Failures**: Check Cloud Build logs
2. **Runtime Errors**: Check Cloud Run logs
3. **Memory Issues**: Increase memory allocation
4. **Timeout Errors**: Increase timeout or optimize code

### Useful Commands:

```bash
# View logs
gcloud logs tail combo-backend --limit 50

# View service details
gcloud run services describe combo-backend --region=us-central1

# Update service configuration
gcloud run services update combo-backend --region=us-central1 --memory=2Gi

# Redeploy
gcloud run deploy combo-backend --image=gcr.io/combo-music-app/combo-backend --region=us-central1
```

## Cost Optimization

1. **Serverless Pricing**: Pay only for requests
2. **Memory Optimization**: Use appropriate memory allocation
3. **Concurrency**: Increase concurrency to reduce instances
4. **Cold Starts**: Keep minimum instances > 0 for faster response

## Next Steps

1. ✅ Deploy backend to Google Cloud Run
2. 🔄 Configure production Firebase project
3. 📱 Deploy mobile app to stores
4. 🌐 Set up frontend (if applicable)
5. 📊 Add monitoring and analytics
