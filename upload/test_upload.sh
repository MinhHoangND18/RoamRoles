#!/bin/bash

# Script để test upload service locally

UPLOAD_SERVICE_URL="http://127.0.0.1:8089/api/upload/from-url"
TEST_IMAGE_URL="https://hoanghamobile.com/tin-tuc/wp-content/uploads/2024/04/anh-ha-noi-6.jpg"

echo "=== Testing Upload Service ==="
echo ""
echo "Upload Service URL: $UPLOAD_SERVICE_URL"
echo "Test Image URL: $TEST_IMAGE_URL"
echo ""

echo "Sending request..."
curl -X POST "$UPLOAD_SERVICE_URL" \
  -H "Content-Type: application/json" \
  -d "{\"url\": \"$TEST_IMAGE_URL\"}" \
  -v

echo ""
echo ""
echo "=== Test Complete ==="
