#!/bin/bash

# COMBO Backend Monitoring Script
# This script helps monitor the deployed service health and logs

SERVICE_NAME="combo-backend"
REGION="us-central1"
PROJECT_ID="combo-624e1"

echo "📊 COMBO Backend Monitoring Dashboard"
echo "===================================="

# Check service status
echo "🔍 Checking service status..."
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format="value(status.url)" 2>/dev/null)

if [ -z "$SERVICE_URL" ]; then
    echo "❌ Service not found. Make sure it's deployed."
    exit 1
fi

echo "✅ Service is running at: $SERVICE_URL"

# Test health endpoint
echo ""
echo "🏥 Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s $SERVICE_URL/health)

if echo "$HEALTH_RESPONSE" | grep -q '"status":"success"'; then
    echo "✅ Health check passed"
    echo "📈 Uptime: $(echo $HEALTH_RESPONSE | jq -r '.data.uptime // "N/A"')s"
    echo "💾 Memory: $(echo $HEALTH_RESPONSE | jq -r '.data.memory.rss // "N/A"') bytes"
    echo "🎯 Node: $(echo $HEALTH_RESPONSE | jq -r '.data.node // "N/A"')"
else
    echo "❌ Health check failed"
fi

# Test API info endpoint
echo ""
echo "📚 Testing API info endpoint..."
API_RESPONSE=$(curl -s $SERVICE_URL/api)

if echo "$API_RESPONSE" | grep -q '"status":"success"'; then
    echo "✅ API info retrieved successfully"
    API_VERSION=$(echo $API_RESPONSE | jq -r '.data.version // "N/A"')
    echo "🔖 Version: $API_VERSION"
else
    echo "❌ API info failed"
fi

# Show recent logs
echo ""
echo "📋 Recent logs (last 10 entries):"
echo "-----------------------------------"
gcloud run services logs read $SERVICE_NAME --region $REGION --limit 10

# Show service metrics
echo ""
echo "📊 Service Metrics:"
echo "-------------------"
echo "🔗 Service URL: $SERVICE_URL"
echo "🌍 Region: $REGION"
echo "📊 Dashboard: https://console.cloud.google.com/run/detail/$REGION/$SERVICE_NAME/metrics"
echo "📝 Logs: https://console.cloud.google.com/run/detail/$REGION/$SERVICE_NAME/logs"

echo ""
echo "💡 Quick commands:"
echo "   Monitor logs: gcloud run services logs read $SERVICE_NAME --region $REGION --follow"
echo "   View metrics: Open the dashboard URL above"
echo "   Restart service: gcloud run services update $SERVICE_NAME --region $REGION"
echo ""
echo "✅ Monitoring complete!"
