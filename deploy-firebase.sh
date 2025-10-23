#!/bin/bash

echo "🔥 Deploying Firebase Security Rules..."
echo ""
echo "Make sure you've enabled these services in Firebase Console:"
echo "1. Authentication (Email/Password)"
echo "2. Firestore Database"
echo "3. Storage"
echo ""
echo "Press Enter to continue..."
read

echo "Deploying Firestore rules and Storage rules..."
npx firebase-tools deploy --only firestore,storage

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Now refresh your browser and the permission errors should be gone!"

