# 🔧 Setup CORS for Firebase Storage

## Method 1: Install Google Cloud SDK (Recommended)

### Step 1: Install Google Cloud SDK

**macOS:**
```bash
brew install google-cloud-sdk
```

**Or download from:**
https://cloud.google.com/sdk/docs/install

### Step 2: Authenticate
```bash
gcloud auth login
```

### Step 3: Set Your Project
```bash
gcloud config set project group-safety-app
```

### Step 4: Configure CORS
```bash
cd /Users/chandlerking/Family-Tracking-and-Management-App
gsutil cors set cors-config.json gs://group-safety-app.firebasestorage.app
```

### Step 5: Verify It Worked
```bash
gsutil cors get gs://group-safety-app.firebasestorage.app
```

You should see the CORS configuration with your localhost URLs.

## Method 2: Use Firebase Console (Alternative)

1. Go to: https://console.firebase.google.com/project/group-safety-app/storage
2. Click on your bucket
3. Look for "CORS" in the settings
4. If not available, use Method 1

## Method 3: Use gcloud CLI (If you have it)

```bash
# Create CORS config
cat > cors.json << 'EOF'
[
  {
    "origin": [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:5173",
      "http://localhost:5174"
    ],
    "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "responseHeader": ["Content-Type", "Authorization", "Content-Length"],
    "maxAgeSeconds": 3600
  }
]
EOF

# Apply CORS
gsutil cors set cors.json gs://group-safety-app.firebasestorage.app

# Verify
gsutil cors get gs://group-safety-app.firebasestorage.app
```

## After Configuring

1. Wait 30-60 seconds for changes to propagate
2. Hard refresh your browser: `Cmd+Shift+R`
3. Your profile pictures should now load!

