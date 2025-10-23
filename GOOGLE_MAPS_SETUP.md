# Google Maps API Setup Guide

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: "Family Safety App" (or your preferred name)
4. Click "Create"
5. Wait for the project to be created and make sure it's selected

## Step 2: Enable Required APIs

1. In the Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for and enable the following APIs:
   - **Maps JavaScript API** ✓ (Required)
   - **Geolocation API** ✓ (Optional, for IP-based location)
   - **Geocoding API** ✓ (Optional, for address lookup)
   - **Places API** ✓ (Optional, for location search)
   - **Directions API** ✓ (Optional, for navigation)

### To Enable Each API:
1. Search for the API name
2. Click on it
3. Click "Enable"
4. Wait for it to be enabled

## Step 3: Create API Key

1. Go to **APIs & Services** → **Credentials**
2. Click **"+ CREATE CREDENTIALS"** → **API Key**
3. Copy the API key immediately (you'll need it soon)
4. Click "Edit API Key" to configure restrictions

## Step 4: Restrict Your API Key (IMPORTANT for Security)

### Application Restrictions:
**For Development:**
- Select: **HTTP referrers (web sites)**
- Add these referrers:
  ```
  http://localhost:5173/*
  http://localhost:5174/*
  http://127.0.0.1:5173/*
  http://127.0.0.1:5174/*
  ```

**For Production (add these later):**
```
https://yourdomain.com/*
https://*.yourdomain.com/*
```

### API Restrictions:
1. Select: **Restrict key**
2. Choose these APIs:
   - Maps JavaScript API
   - Geolocation API (if enabled)
   - Geocoding API (if enabled)
   - Places API (if enabled)
   - Directions API (if enabled)

3. Click **Save**

## Step 5: Add API Key to Your Project

1. Open your project in the terminal
2. Create/edit the `.env` file in the project root:

```bash
cd /Users/chandlerking/Family-Tracking-and-Management-App
```

3. Create or update `.env` file with:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

# Google Maps API Key
VITE_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY_HERE
```

**Replace `YOUR_GOOGLE_MAPS_API_KEY_HERE` with your actual API key**

## Step 6: Verify Environment Variables

Make sure `.env` is in your `.gitignore` file:

```bash
# Check if .env is ignored
cat .gitignore | grep .env
```

If not, add it:
```bash
echo ".env" >> .gitignore
```

## Step 7: Restart Development Server

After adding the API key, restart your dev server:

```bash
npm run dev
```

## Step 8: Test the Map

1. Open your browser to `http://localhost:5173`
2. Login to your account
3. You should see the map load on the main screen
4. Click "Start Tracking" to enable location tracking
5. Click "Share Location" to share with family members

## Troubleshooting

### Error: "Google Maps JavaScript API error: RefererNotAllowedMapError"
**Solution:** Add your localhost URLs to the API key restrictions (Step 4)

### Error: "This API project is not authorized to use this API"
**Solution:** Enable the Maps JavaScript API in the Google Cloud Console (Step 2)

### Error: "Google Maps API key not configured"
**Solution:** Make sure you added `VITE_GOOGLE_MAPS_API_KEY` to your `.env` file

### Map shows but markers don't appear
**Solution:** 
- Check browser console for errors
- Make sure location tracking is started
- Check that location sharing is enabled
- Verify Firebase location data is being written

### Browser doesn't ask for location permission
**Solution:**
- Chrome: Check site settings (padlock icon → Site settings → Location)
- Make sure you're on HTTPS (or localhost)
- Clear browser cache and try again

## Billing Information

### Free Tier:
- Google Maps provides **$200 free credit per month**
- This covers approximately:
  - **28,000 map loads per month**
  - **40,000 geolocation requests per month**

### Cost Per Request (after free tier):
- Map loads: $7 per 1,000 requests
- Geolocation: $5 per 1,000 requests

### Estimated Costs for Small Family App:
- **10 active users** checking map 10 times/day
  - ~3,000 map loads/month
  - **Cost: $0** (well within free tier)

- **100 active users** checking map 10 times/day
  - ~30,000 map loads/month
  - **Cost: ~$1-2/month** (slightly over free tier)

### Set Up Billing Alerts:
1. Go to **Billing** → **Budgets & alerts**
2. Create a budget with alerts at:
   - 50% of budget
   - 90% of budget
   - 100% of budget

## Security Best Practices

### ✓ DO:
- Use API key restrictions (referrer + API restrictions)
- Store API key in `.env` file (never commit)
- Use different keys for dev/staging/production
- Monitor usage regularly
- Set up billing alerts

### ✗ DON'T:
- Commit API key to Git
- Use same key for all environments
- Share API key publicly
- Leave key unrestricted
- Ignore usage spikes

## Next Steps

Once the map is working:
1. ✓ Test location tracking
2. ✓ Test location sharing
3. ✓ Verify real-time updates
4. → Implement geofencing (Phase 1.2)
5. → Add device monitoring (Phase 1.3)
6. → Optimize marker clustering for many users

## Testing Checklist

- [ ] Map loads on main screen
- [ ] Location permission prompt appears
- [ ] User location marker appears on map
- [ ] "Start Tracking" button works
- [ ] "Share Location" button works
- [ ] Other family members' locations appear
- [ ] Member cards show in bottom panel
- [ ] Map auto-centers on user location
- [ ] Markers update in real-time
- [ ] No console errors

## Support Resources

- [Google Maps JavaScript API Docs](https://developers.google.com/maps/documentation/javascript)
- [Maps JavaScript API Reference](https://developers.google.com/maps/documentation/javascript/reference)
- [API Key Best Practices](https://developers.google.com/maps/api-security-best-practices)
- [Pricing Calculator](https://mapsplatform.google.com/pricing/)

---

**Need Help?** Check the browser console for detailed error messages. Most issues are related to:
1. Missing/incorrect API key
2. API not enabled
3. Referrer restrictions
4. Browser location permissions

