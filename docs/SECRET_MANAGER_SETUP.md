# 🔐 Google Cloud Secret Manager Setup

## Overview

This guide shows you how to use Google Cloud Secret Manager to securely store your Google Maps API key instead of putting it directly in your `.env` file.

## Benefits

- ✅ **Security**: API keys are not exposed in code or environment files
- ✅ **Centralized**: Manage secrets in one place
- ✅ **Audit Trail**: Track who accessed secrets and when
- ✅ **Rotation**: Easy to rotate secrets without code changes

## Setup Steps

### Step 1: Create Secret in Secret Manager

1. **Go to Google Cloud Console:**
   - https://console.cloud.google.com/security/secret-manager?project=group-safety-app

2. **Create Secret:**
   - Click **"Create Secret"**
   - **Name:** `GOOGLE_API_KEY`
   - **Secret value:** Paste your Google Maps API key
   - Click **"Create Secret"**

### Step 2: Grant Access (if needed)

The Cloud Function will automatically have access to Secret Manager. If you need to grant access manually:

1. Go to Secret Manager
2. Click on `GOOGLE_API_KEY`
3. Click **"Permissions"** tab
4. Add the Cloud Function service account:
   - `group-safety-app@appspot.gserviceaccount.com`
   - Role: **Secret Manager Secret Accessor**

### Step 3: Deploy Cloud Function (Optional)

If you want to use the API endpoint approach:

```bash
cd functions
npm install @google-cloud/secret-manager
npm run deploy
```

### Step 4: Update Environment Variables

**Option A: Use Secret Manager API (Recommended for Production)**

Set the API base URL in your `.env`:

```env
# Secret Manager API endpoint (Cloud Function)
VITE_SECRET_MANAGER_API_BASE=https://us-central1-group-safety-app.cloudfunctions.net/api/secrets
```

**Option B: Use Environment Variable (Development)**

Keep using `.env` for local development:

```env
# Google Maps API Key (fallback for local dev)
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

The code will automatically:
1. Try to fetch from Secret Manager API
2. Fall back to `VITE_GOOGLE_MAPS_API_KEY` if API is unavailable

## How It Works

### Development Mode
- Uses `VITE_GOOGLE_MAPS_API_KEY` from `.env` file
- Fast and simple for local development

### Production Mode
- Fetches `GOOGLE_API_KEY` from Secret Manager via API endpoint
- Falls back to env variable if API is unavailable
- More secure for production deployments

## Testing

1. **Test Secret Manager Access:**
   ```bash
   # Using gcloud CLI
   gcloud secrets versions access latest --secret="GOOGLE_API_KEY"
   ```

2. **Test API Endpoint (if deployed):**
   ```bash
   curl https://us-central1-group-safety-app.cloudfunctions.net/api/secrets/GOOGLE_API_KEY
   ```

3. **Test in App:**
   - Start your app: `npm run dev`
   - Check browser console for any errors
   - Map should load with the API key from Secret Manager

## Security Best Practices

1. ✅ **Never commit secrets** to git
2. ✅ **Use Secret Manager** for production
3. ✅ **Restrict API key** in Google Cloud Console:
   - HTTP referrer restrictions
   - API restrictions (Maps JavaScript API only)
4. ✅ **Rotate secrets** regularly
5. ✅ **Monitor access** via Cloud Audit Logs

## Troubleshooting

### Error: "Secret not found"
- Verify secret name is `GOOGLE_API_KEY` (exact match)
- Check secret exists in Secret Manager
- Verify project ID is correct

### Error: "Access denied"
- Check Cloud Function has Secret Manager access
- Verify service account permissions

### Fallback to env variable
- This is normal in development
- Production should use Secret Manager API

## Alternative: Direct Secret Access (Server-Side Only)

If you're using Cloud Functions or a backend, you can access secrets directly:

```typescript
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

const client = new SecretManagerServiceClient();
const name = `projects/${PROJECT_ID}/secrets/GOOGLE_API_KEY/versions/latest`;
const [version] = await client.accessSecretVersion({ name });
const apiKey = version.payload?.data?.toString();
```

## Next Steps

1. ✅ Create secret in Secret Manager
2. ✅ Deploy Cloud Function (optional)
3. ✅ Update `.env` with API endpoint (optional)
4. ✅ Test the integration
5. ✅ Remove API key from `.env` (keep fallback for dev)

---

**Questions?** Check the [Google Cloud Secret Manager docs](https://cloud.google.com/secret-manager/docs)

