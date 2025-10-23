# Google Maps API RefererNotAllowedMapError Fix

## The Problem
Your Google Maps API key is restricted and doesn't allow requests from `localhost`.

## Quick Fix (5 minutes)

### Step 1: Go to Google Cloud Console
1. Visit: https://console.cloud.google.com/apis/credentials
2. Find your API key (starts with `AIzaSy...`)
3. Click on the key name to edit

### Step 2: Update API Restrictions
1. Scroll to **"API restrictions"** section
2. Select **"Restrict key"**
3. Check **"Maps JavaScript API"**
4. Click "OK"

### Step 3: Update Website Restrictions
1. Scroll to **"Application restrictions"** section
2. Select **"HTTP referrers (web sites)"**
3. Click **"ADD AN ITEM"** and add these referrers:
   ```
   http://localhost:3000/*
   http://localhost:5173/*
   http://127.0.0.1:3000/*
   http://127.0.0.1:5173/*
   ```
4. (Later, add your production domain like `https://yourdomain.com/*`)

### Step 4: Save & Wait
1. Click **"SAVE"** at the bottom
2. **Wait 1-5 minutes** for changes to propagate globally
3. **Refresh your browser** (hard refresh: Cmd+Shift+R or Ctrl+Shift+R)

---

## Alternative: Remove Restrictions (Dev Only) ⚠️

**For development only** - faster but less secure:

1. Go to your API key settings
2. Under **"Application restrictions"**, select **"None"**
3. Click **"SAVE"**
4. No waiting needed - works immediately
5. ⚠️ **IMPORTANT**: Add restrictions back before production deployment!

---

## After the Fix

Once you've updated the restrictions:

1. **Hard refresh** your browser (Cmd+Shift+R)
2. You should see the Google Map appear
3. The console error should be gone
4. The map should be centered on New York (default location)

---

## Troubleshooting

### Error still appears after 5 minutes?
- Try clearing browser cache
- Try in an incognito/private window
- Double-check the referrer URLs match exactly

### Map still blank?
- Open DevTools Console
- Look for "Map container dimensions" log
- Share the output if you need help

### Need to find your API key?
- Check `.env` file: `VITE_GOOGLE_MAPS_API_KEY=your_key_here`
- Or run: `node scripts/verify-setup.cjs`

---

## Security Note

🔒 **Production Best Practices**:
- Always use HTTP referrer restrictions in production
- Never commit API keys to Git (use `.env` files)
- Consider using separate API keys for dev/staging/prod
- Set up billing alerts in Google Cloud
- Enable only the APIs you need

---

## Current Status

✅ Map is initializing successfully
✅ API key is loading correctly
✅ Map container has proper dimensions
❌ Referrer restriction blocking localhost

**Next Step**: Update API key restrictions and refresh!

