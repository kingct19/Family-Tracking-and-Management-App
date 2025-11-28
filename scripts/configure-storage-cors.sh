#!/bin/bash

# Firebase Storage CORS Configuration Script
# This script configures CORS on your Firebase Storage bucket to allow localhost access

set -e

PROJECT_ID="group-safety-app"
# Try firebasestorage.app first (default for newer Firebase projects)
BUCKET_NAME="${PROJECT_ID}.firebasestorage.app"

# Check if bucket exists, if not try appspot.com
if ! gsutil ls "gs://${BUCKET_NAME}" &>/dev/null; then
  BUCKET_NAME="${PROJECT_ID}.appspot.com"
fi

echo "🔧 Configuring CORS for Firebase Storage..."
echo "📦 Bucket: ${BUCKET_NAME}"
echo ""

# Check if gcloud is installed
if ! command -v gsutil &> /dev/null; then
    echo "❌ Error: gsutil (Google Cloud SDK) is not installed"
    echo ""
    echo "Please install it first:"
    echo "  macOS: brew install google-cloud-sdk"
    echo "  Or download from: https://cloud.google.com/sdk/docs/install"
    echo ""
    echo "Then authenticate:"
    echo "  gcloud auth login"
    echo "  gcloud config set project ${PROJECT_ID}"
    exit 1
fi

# Check if authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "❌ Error: Not authenticated with gcloud"
    echo ""
    echo "Please authenticate:"
    echo "  gcloud auth login"
    exit 1
fi

# Create temporary CORS config file
CORS_CONFIG=$(cat <<'EOF'
[
  {
    "origin": [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:5173",
      "http://localhost:5174",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:3001",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5174",
      "https://halohub-sage.vercel.app",
      "https://*.vercel.app"
    ],
    "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "responseHeader": ["Content-Type", "Authorization", "Content-Length"],
    "maxAgeSeconds": 3600
  }
]
EOF
)

# Write to temp file
TEMP_FILE=$(mktemp)
echo "$CORS_CONFIG" > "$TEMP_FILE"

echo "Applying CORS configuration..."
gsutil cors set "$TEMP_FILE" "gs://${BUCKET_NAME}"

# Clean up
rm "$TEMP_FILE"

echo ""
echo "✅ CORS configuration applied successfully!"
echo ""
echo "📝 Configured origins:"
echo "   - http://localhost:3000"
echo "   - http://localhost:3001"
echo "   - http://localhost:5173"
echo "   - http://localhost:5174"
echo ""
echo "🔄 Please refresh your browser (Cmd+Shift+R) to see the changes."
echo ""
echo "💡 Note: Changes may take 30-60 seconds to propagate."

