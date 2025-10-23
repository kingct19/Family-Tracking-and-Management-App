#!/bin/bash
echo "Deploying Firestore rules..."
firebase deploy --only firestore:rules
