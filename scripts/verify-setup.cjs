#!/usr/bin/env node

/**
 * Setup Verification Script
 * 
 * Checks if all required environment variables are configured
 * Run: node scripts/verify-setup.js
 */

const fs = require('fs');
const path = require('path');

const ENV_FILE = path.join(__dirname, '..', '.env');
const ENV_EXAMPLE = path.join(__dirname, '..', 'env.example');

console.log('🔍 Verifying Family Safety App Setup...\n');

// Check if .env exists
if (!fs.existsSync(ENV_FILE)) {
    console.error('❌ ERROR: .env file not found!');
    console.log('\n📝 To fix this:');
    console.log('   1. Copy env.example to .env:');
    console.log('      cp env.example .env\n');
    console.log('   2. Edit .env and add your API keys\n');
    process.exit(1);
}

console.log('✅ .env file exists\n');

// Read .env file
const envContent = fs.readFileSync(ENV_FILE, 'utf-8');
const envLines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));

const envVars = {};
envLines.forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
    }
});

// Required variables
const requiredVars = {
    'VITE_FIREBASE_API_KEY': 'Firebase API Key',
    'VITE_FIREBASE_AUTH_DOMAIN': 'Firebase Auth Domain',
    'VITE_FIREBASE_PROJECT_ID': 'Firebase Project ID',
    'VITE_FIREBASE_STORAGE_BUCKET': 'Firebase Storage Bucket',
    'VITE_FIREBASE_MESSAGING_SENDER_ID': 'Firebase Messaging Sender ID',
    'VITE_FIREBASE_APP_ID': 'Firebase App ID',
    'VITE_GOOGLE_MAPS_API_KEY': 'Google Maps API Key',
};

let allConfigured = true;
let missingVars = [];
let placeholderVars = [];

console.log('📋 Checking required environment variables:\n');

Object.entries(requiredVars).forEach(([key, description]) => {
    const value = envVars[key];
    
    if (!value) {
        console.log(`❌ ${description} (${key}): MISSING`);
        missingVars.push(key);
        allConfigured = false;
    } else if (value.includes('your-') || value.includes('your_') || value === 'your-api-key' || value === 'your-google-maps-api-key') {
        console.log(`⚠️  ${description} (${key}): PLACEHOLDER (needs real value)`);
        placeholderVars.push(key);
        allConfigured = false;
    } else {
        const maskedValue = value.substring(0, 8) + '...' + value.substring(value.length - 4);
        console.log(`✅ ${description} (${key}): ${maskedValue}`);
    }
});

console.log('\n' + '='.repeat(60) + '\n');

if (allConfigured) {
    console.log('🎉 SUCCESS! All environment variables are configured!\n');
    console.log('Next steps:');
    console.log('   1. Run: npm run dev');
    console.log('   2. Open: http://localhost:5173');
    console.log('   3. Login and test the map\n');
} else {
    console.log('❌ Setup incomplete. Please configure the following:\n');
    
    if (missingVars.length > 0) {
        console.log('Missing variables:');
        missingVars.forEach(v => console.log(`   - ${v}`));
        console.log('');
    }
    
    if (placeholderVars.length > 0) {
        console.log('Variables with placeholder values (need real keys):');
        placeholderVars.forEach(v => console.log(`   - ${v}`));
        console.log('');
    }
    
    console.log('📚 Setup guides:');
    console.log('   - Firebase: See Firebase Console > Project Settings');
    console.log('   - Google Maps: See GOOGLE_MAPS_SETUP.md\n');
    
    process.exit(1);
}

// Check if Firebase is initialized
console.log('🔥 Firebase Configuration Check:\n');
try {
    const firebaseConfig = path.join(__dirname, '..', 'src', 'config', 'firebase.ts');
    if (fs.existsSync(firebaseConfig)) {
        console.log('✅ Firebase config file exists');
        const content = fs.readFileSync(firebaseConfig, 'utf-8');
        if (content.includes('initializeApp')) {
            console.log('✅ Firebase app initialization found');
        }
    }
} catch (error) {
    console.log('⚠️  Could not verify Firebase configuration');
}

console.log('\n' + '='.repeat(60) + '\n');
console.log('✨ Setup verification complete!\n');

