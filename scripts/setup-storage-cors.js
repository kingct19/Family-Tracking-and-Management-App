/**
 * Setup CORS configuration for Firebase Storage
 * 
 * This script configures CORS on your Firebase Storage bucket to allow
 * image loading from localhost during development.
 * 
 * Run: node scripts/setup-storage-cors.js
 * 
 * Requires: gcloud CLI installed and authenticated
 * Install: https://cloud.google.com/sdk/docs/install
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PROJECT_ID = 'group-safety-app';
const BUCKET_NAME = `${PROJECT_ID}.appspot.com`; // Default Firebase Storage bucket

// CORS configuration for development
const corsConfig = {
    cors: [
        {
            origin: [
                'http://localhost:3000',
                'http://localhost:3001',
                'http://localhost:5173',
                'http://localhost:5174',
                'http://127.0.0.1:3000',
                'http://127.0.0.1:3001',
                'http://127.0.0.1:5173',
                'http://127.0.0.1:5174',
            ],
            method: ['GET', 'HEAD', 'PUT', 'POST', 'DELETE'],
            responseHeader: ['Content-Type', 'Authorization', 'Content-Length'],
            maxAgeSeconds: 3600,
        },
    ],
};

// Write CORS config to temp file
const corsConfigPath = path.join(__dirname, 'cors-config.json');
fs.writeFileSync(corsConfigPath, JSON.stringify(corsConfig, null, 2));

console.log('🔧 Setting up CORS for Firebase Storage...');
console.log(`📦 Bucket: ${BUCKET_NAME}`);
console.log('');

try {
    // Apply CORS configuration
    execSync(
        `gsutil cors set ${corsConfigPath} gs://${BUCKET_NAME}`,
        { stdio: 'inherit' }
    );

    console.log('');
    console.log('✅ CORS configuration applied successfully!');
    console.log('');
    console.log('📝 Configured origins:');
    corsConfig.cors[0].origin.forEach((origin) => {
        console.log(`   - ${origin}`);
    });
    console.log('');
    console.log('🔄 Please refresh your browser to see the changes.');
} catch (error) {
    console.error('');
    console.error('❌ Failed to configure CORS');
    console.error('');
    console.error('Make sure you have:');
    console.error('1. gcloud CLI installed: https://cloud.google.com/sdk/docs/install');
    console.error('2. Authenticated: gcloud auth login');
    console.error('3. Set project: gcloud config set project group-safety-app');
    console.error('');
    console.error('Error:', error.message);
    process.exit(1);
} finally {
    // Clean up temp file
    if (fs.existsSync(corsConfigPath)) {
        fs.unlinkSync(corsConfigPath);
    }
}

