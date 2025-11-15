#!/bin/bash

# Quick CORS Configuration Script for Firebase Storage
# Run this script after authenticating with gcloud

export PATH=/opt/homebrew/share/google-cloud-sdk/bin:"$PATH"

echo "🔧 Configuring CORS for Firebase Storage..."
echo ""

# Check if authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "❌ Not authenticated. Please run:"
    echo "   gcloud auth login"
    echo ""
    echo "This will open a browser for you to sign in."
    exit 1
fi

# Set project
gcloud config set project group-safety-app

# Configure CORS
echo "Applying CORS configuration..."
gsutil cors set cors-config.json gs://group-safety-app.firebasestorage.app

echo ""
echo "✅ CORS configured successfully!"
echo ""
echo "🔄 Please refresh your browser (Cmd+Shift+R) to see your profile pictures!"
echo ""

