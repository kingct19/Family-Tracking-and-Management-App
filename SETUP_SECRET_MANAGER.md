# 🔐 Quick Setup: Google Cloud Secret Manager for API Key

## Step 1: Create Secret in Secret Manager

1. **Go to Secret Manager:**
   - https://console.cloud.google.com/security/secret-manager?project=group-safety-app

2. **Create Secret:**
   - Click **"CREATE SECRET"**
   - **Name:** `GOOGLE_API_KEY` (exact name)
   - **Secret value:** Paste your Google Maps API key
   - Click **"CREATE SECRET"**

## Step 2: Update Your Code

The code is already updated! It will automatically:
1. ✅ Try to fetch from Secret Manager API (if configured)
2. ✅ Fall back to `VITE_GOOGLE_MAPS_API_KEY` from `.env` (for local dev)

## Step 3: For Local Development (Current Setup)

Keep using your `.env` file:

```env
VITE_GOOGLE_MAPS_API_KEY=your-actual-api-key-here
```

The code will use this for local development.

## Step 4: For Production (Optional - Use Secret Manager API)

If you want to use Secret Manager in production:

1. **Deploy Cloud Function** (see `functions/src/secrets.ts`)
2. **Set environment variable:**
   ```env
   VITE_SECRET_MANAGER_API_BASE=https://us-central1-group-safety-app.cloudfunctions.net/api/secrets
   ```

## How It Works

### Current Behavior:
- ✅ **Development:** Uses `VITE_GOOGLE_MAPS_API_KEY` from `.env`
- ✅ **Production:** Can use Secret Manager API (if deployed) or env variable

### The Code:
- `src/lib/services/secret-manager.ts` - Handles secret fetching
- `src/lib/services/google-maps-loader.ts` - Updated to use secret manager
- Automatically falls back to env variable if Secret Manager unavailable

## Test It

1. **Verify secret exists:**
   ```bash
   gcloud secrets versions access latest --secret="GOOGLE_API_KEY"
   ```

2. **Start your app:**
   ```bash
   npm run dev
   ```

3. **Check browser console** - should see map loading

## Security Benefits

- ✅ API key stored securely in Secret Manager
- ✅ Not exposed in code or git
- ✅ Easy to rotate without code changes
- ✅ Audit trail of access

---

**That's it!** Your code is already set up. Just create the secret in Secret Manager and it will work automatically.

