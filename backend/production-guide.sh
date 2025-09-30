#!/bin/bash

# COMBO Backend - Production Deployment & Management Guide
# This script provides all the commands needed for production management

SERVICE_NAME="combo-backend"
REGION="us-central1"
PROJECT_ID="combo-624e1"

echo "🚀 COMBO Backend - Production Management Guide"
echo "=============================================="
echo ""

# Function to display colored output
print_header() {
    echo -e "\033[1;34m$1\033[0m"
}

print_success() {
    echo -e "\033[1;32m✅ $1\033[0m"
}

print_warning() {
    echo -e "\033[1;33m⚠️  $1\033[0m"
}

print_error() {
    echo -e "\033[1;31m❌ $1\033[0m"
}

# 1. Team Access Setup
print_header "1. 👥 TEAM ACCESS SETUP"
echo ""
echo "📋 Grant team members access to Google Cloud:"
echo "   1. Go to: https://console.cloud.google.com/iam-admin/iam"
echo "   2. Click 'ADD'"
echo "   3. Add team member emails"
echo "   4. Grant these roles:"
echo "      - Cloud Run Admin (for deployments)"
echo "      - Service Account User (for CI/CD)"
echo "      - Project Viewer (for monitoring)"
echo ""
echo "🔑 GitHub Secrets for CI/CD:"
echo "   Go to: Repository Settings > Secrets and variables > Actions"
echo "   Add these secrets:"
echo "   - GCP_SA_KEY: $(cat config/firebase-service-account.json | base64 -w 0)"
echo "   - FIREBASE_DATABASE_SECRET: mqucsRC7MHfDLdYSbNTU1srwlK4l6RsOtKKgqB4m"
echo "   - JWT_SECRET: combo_backend_secret_key_production"
echo ""

# 2. Monitoring Setup
print_header "2. 📊 MONITORING SETUP"
echo ""
echo "🌐 Cloud Console Monitoring:"
echo "   - Metrics: https://console.cloud.google.com/run/detail/$REGION/$SERVICE_NAME/metrics"
echo "   - Logs: https://console.cloud.google.com/run/detail/$REGION/$SERVICE_NAME/logs"
echo "   - Traces: https://console.cloud.google.com/traces/overview"
echo ""

echo "📈 Key Metrics to Monitor:"
echo "   - Request count and latency"
echo "   - CPU and memory utilization"
echo "   - Error rates"
echo "   - Instance count"
echo ""

# 3. Scaling Configuration
print_header "3. 📈 SCALING CONFIGURATION"
echo ""
echo "🔧 Current Configuration:"
gcloud run services describe $SERVICE_NAME --region $REGION --format="table[box](spec.template.spec.containerConcurrency,spec.template.spec.timeoutSeconds,spec.template.metadata.annotations.run.googleapis.com/max-instances,spec.template.metadata.annotations.run.googleapis.com/cpu-throttling)"

echo ""
echo "⚡ Scaling Commands:"
echo "   # Scale up for high traffic"
echo "   gcloud run services update $SERVICE_NAME --region $REGION --max-instances 50 --cpu 2 --memory 2Gi"
echo ""
echo "   # Scale down for cost optimization"
echo "   gcloud run services update $SERVICE_NAME --region $REGION --max-instances 5 --cpu 1 --memory 1Gi"
echo ""

# 4. Security Enhancements
print_header "4. 🔒 SECURITY ENHANCEMENTS"
echo ""
echo "🛡️ Production Security Checklist:"
echo "   ✅ HTTPS enforced"
echo "   ✅ Rate limiting enabled"
echo "   ✅ Input validation active"
echo "   ✅ JWT authentication"
echo "   ✅ CORS configured"
echo "   ✅ Security headers (Helmet)"
echo ""

echo "🔐 Additional Security (Optional):"
echo "   # Enable VPC for private networking"
echo "   gcloud run services update $SERVICE_NAME --region $REGION --vpc-connector projects/$PROJECT_ID/regions/$REGION/connectors/connector-name"
echo ""
echo "   # Add API key authentication"
echo "   # Add request signing validation"
echo ""

# 5. Backup and Recovery
print_header "5. 💾 BACKUP & RECOVERY"
echo ""
echo "📦 Database Backup:"
echo "   # Export Firebase data periodically"
echo "   # Store backups in Cloud Storage"
echo ""

echo "🔄 Service Management:"
echo "   # View service details"
echo "   gcloud run services describe $SERVICE_NAME --region $REGION"
echo ""
echo "   # Update service configuration"
echo "   gcloud run services update $SERVICE_NAME --region $REGION --memory 2Gi"
echo ""
echo "   # Rollback to previous revision"
echo "   gcloud run services update-traffic $SERVICE_NAME --region $REGION --to-revisions $SERVICE_NAME-00001=100"
echo ""

# 6. Cost Optimization
print_header "6. 💰 COST OPTIMIZATION"
echo ""
echo "📊 Cost Monitoring:"
echo "   - Dashboard: https://console.cloud.google.com/billing"
echo "   - Budget Alerts: Set up billing alerts"
echo ""

echo "💡 Optimization Tips:"
echo "   - Use minimum instances: 0 (serverless)"
echo "   - Set concurrency: 80 (requests per instance)"
echo "   - Monitor and scale based on usage"
echo "   - Use preemptible instances for non-critical workloads"
echo ""

# 7. Performance Optimization
print_header "7. ⚡ PERFORMANCE OPTIMIZATION"
echo ""
echo "🚀 Performance Commands:"
echo "   # Enable Cloud CDN"
echo "   gcloud run services update $SERVICE_NAME --region $REGION --add-custom-audiences"
echo ""
echo "   # Add caching headers"
echo "   # Implement Redis for session storage"
echo ""
echo "   # Database query optimization"
echo "   # Add database connection pooling"
echo ""

# 8. Troubleshooting
print_header "8. 🔧 TROUBLESHOOTING"
echo ""
echo "🐛 Common Issues:"
echo "   1. High latency: Check instance scaling and database performance"
echo "   2. High error rate: Check logs and API validation"
echo "   3. High costs: Monitor usage and adjust scaling"
echo "   4. Authentication issues: Verify JWT tokens and database rules"
echo ""

echo "🔍 Debug Commands:"
echo "   # Check service status"
echo "   gcloud run services describe $SERVICE_NAME --region $REGION"
echo ""
echo "   # View recent logs"
echo "   gcloud run services logs read $SERVICE_NAME --region $REGION --limit 20"
echo ""
echo "   # Test service health"
echo "   curl https://combo-backend-531640636721.us-central1.run.app/health"
echo ""

# 9. Emergency Procedures
print_header "9. 🚨 EMERGENCY PROCEDURES"
echo ""
echo "⚠️ Service Issues:"
echo "   1. Check service status: gcloud run services describe $SERVICE_NAME --region $REGION"
echo "   2. Review logs: gcloud run services logs read $SERVICE_NAME --region $REGION --limit 50"
echo "   3. Test endpoints: curl https://combo-backend-531640636721.us-central1.run.app/health"
echo "   4. Scale up if needed: gcloud run services update $SERVICE_NAME --region $REGION --max-instances 20"
echo ""

echo "🔄 Recovery Options:"
echo "   - Restart service: gcloud run services update $SERVICE_NAME --region $REGION"
echo "   - Rollback revision: gcloud run services update-traffic $SERVICE_NAME --region $REGION --to-revisions PREVIOUS_REVISION=100"
echo "   - Emergency contact: Check team access permissions"
echo ""

# 10. Documentation
print_header "10. 📚 DOCUMENTATION"
echo ""
echo "📖 Key Resources:"
echo "   - API Documentation: https://combo-backend-531640636721.us-central1.run.app/api"
echo "   - Project README: /README.md"
echo "   - Mobile App Integration: /mobile/README.md"
echo "   - Deployment Guide: /deploy.sh"
echo ""

echo "🎯 Quick Access URLs:"
echo "   - Service: https://combo-backend-531640636721.us-central1.run.app"
echo "   - Cloud Console: https://console.cloud.google.com/run/detail/$REGION/$SERVICE_NAME"
echo "   - Monitoring: https://console.cloud.google.com/monitoring"
echo "   - Logs: https://console.cloud.google.com/logs"
echo ""

echo ""
print_success "🎉 Your COMBO Backend is production-ready!"
echo ""
echo "💡 Next Steps:"
echo "   1. Set up team access in Google Cloud IAM"
echo "   2. Configure GitHub repository secrets"
echo "   3. Monitor usage and scale as needed"
echo "   4. Set up alerts for key metrics"
echo "   5. Plan for backup and disaster recovery"
echo ""
echo "🚀 Your music streaming platform is ready for users!"
echo ""
echo "For support or questions, refer to the documentation in the README files."
