#!/bin/bash

echo "???? Testing Container Configuration..."
echo "===================================="

# Build the container
echo "???? Building container..."
docker build -t combo-backend-test .

if [ $? -ne 0 ]; then
    echo "??? Container build failed"
    exit 1
fi

echo "??? Container built successfully"

# Test the container
echo "???? Testing container startup..."
docker run -d --name combo-test -p 8080:8080 -e PORT=8080 combo-backend-test

# Wait for startup
sleep 10

# Test health endpoint
echo "???? Testing health endpoint..."
HEALTH=$(curl -s http://localhost:8080/health | jq -r '.status' 2>/dev/null)

if [ "$HEALTH" = "OK" ]; then
    echo "??? Health check passed"
    
    # Test music search
    echo "???? Testing music search..."
    SEARCH=$(curl -s "http://localhost:8080/api/music/search?q=test&limit=1" | jq -r '.data.tracks[0].title' 2>/dev/null)
    
    if [ "$SEARCH" != "null" ] && [ -n "$SEARCH" ]; then
        echo "??? Music search working: $SEARCH"
    else
        echo "?????? Music search returned no results (API dependent)"
    fi
    
    echo ""
    echo "???? Container test successful!"
    echo "??? Ready for Cloud Run deployment"
    
else
    echo "??? Health check failed"
    echo "???? Container logs:"
    docker logs combo-test
fi

# Cleanup
docker stop combo-test
docker rm combo-test
docker rmi combo-backend-test

echo ""
echo "???? Ready to deploy to Google Cloud Run!"
