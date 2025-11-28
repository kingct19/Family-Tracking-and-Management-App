# Production CORS Configuration for Firebase Storage

## Problem
Firebase Storage images (profile pictures, reward images, etc.) are blocked by CORS policy when accessed from the Vercel production domain.

## Solution
Configure CORS on the Firebase Storage bucket to allow the production domain.

## ⚠️ Important: CORS Configuration Not Visible in UI

CORS configuration is **not always visible** in the Google Cloud Console UI. The easiest way to configure CORS is using the `gsutil` CLI tool.

## ✅ Recommended: Using gcloud CLI (Easiest Method)

### Step 1: Install Google Cloud SDK (if not already installed)

```bash
# macOS
brew install google-cloud-sdk

# Or download from: https://cloud.google.com/sdk/docs/install
```

### Step 2: Authenticate

```bash
gcloud auth login
gcloud config set project group-safety-app
```

### Step 3: Apply CORS Configuration

```bash
# Apply CORS configuration
gsutil cors set cors-config.json gs://group-safety-app.firebasestorage.app

# Verify configuration
gsutil cors get gs://group-safety-app.firebasestorage.app
```

You should see output showing your configured origins.

## Alternative: Manual CORS Configuration

If the UI shows CORS configuration, you can manually paste the JSON from `cors-config.json`:

1. Go to [Google Cloud Console Storage](https://console.cloud.google.com/storage/browser?project=group-safety-app)
2. Click on your bucket: **`group-safety-app.firebasestorage.app`**
3. Look for "CORS configuration" in the Configuration tab (may not be visible)
4. If visible, paste the contents of `cors-config.json`

## Quick Script

Or run the provided script (it will use the correct bucket name):

```bash
./scripts/configure-storage-cors.sh
```

## Bucket Name

**Correct bucket name:** `group-safety-app.firebasestorage.app`

Note: Firebase Storage buckets may use `.firebasestorage.app` or `.appspot.com` suffix. Check your Firebase Console or use:
```bash
gsutil ls
```

## Notes
- CORS changes may take 30-60 seconds to propagate
- The `*.vercel.app` wildcard covers all Vercel preview deployments
- This configuration is already in `cors-config.json` for easy reference
- If CORS isn't visible in the UI, use the CLI method above

