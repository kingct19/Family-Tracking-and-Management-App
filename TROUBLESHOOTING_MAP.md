# 🗺️ Map Troubleshooting Guide

## Issues Fixed ✅

### 1. Content Security Policy (CSP) Error
**Error:** `Refused to load https://maps.gstatic.com/mapfiles/openhand_8_8.cur`

**Fix Applied:**
- Added `https://maps.gstatic.com` to CSP `img-src` and `script-src` directives
- Added `https://*.gstatic.com` wildcard for future-proofing

**File:** `index.html` (lines 19, 30-32)

### 2. Firebase Permission Denied Error
**Error:** `FirebaseError: [code=permission-denied]: Missing or insufficient permissions`

**Root Cause:** New users don't have any hubs yet, but the app tries to fetch user hubs

**Fix Applied:**
- Created automatic hub creation on first login
- Added `ensureUserHasHub()` function that runs after authentication
- Default hub is created with all features enabled

**Files Created:**
- `src/features/auth/utils/onboarding.ts` - Hub creation logic
- Updated `src/components/ProtectedRoute.tsx` - Calls onboarding

## How to Test

### 1. Clear Browser Data
```bash
# In Chrome DevTools:
# 1. Open DevTools (F12)
# 2. Application tab → Storage
# 3. Click "Clear site data"
# 4. Refresh page
```

### 2. Login/Register
- Register a new account OR
- Login with existing account

### 3. Verify Map Loads
You should see:
- ✅ Google Map loads on main screen
- ✅ Hub selector shows "Your Name's Hub"
- ✅ Floating action buttons appear
- ✅ No CSP errors in console
- ✅ No permission errors in console

## Common Issues

### Issue: Map Still Not Loading

**Check 1: Google Maps API Key**
```bash
# Verify .env file exists
cat .env | grep VITE_GOOGLE_MAPS_API_KEY

# Should show:
# VITE_GOOGLE_MAPS_API_KEY=AIza...
```

**Fix:** Add your API key to `.env`

**Check 2: Browser Console Errors**
Open DevTools (F12) → Console tab

Look for:
- ✅ No "RefererNotAllowedMapError" (means CSP is fixed)
- ✅ No "permission-denied" errors (means hub creation is working)
- ✅ "Default hub created successfully" message

**Check 3: Firebase Configuration**
```bash
# Run verification script
node scripts/verify-setup.js
```

Should show all ✅ green checks

### Issue: "Google Maps API key not configured"

**Solution:**
1. Check `.env` file exists:
   ```bash
   ls -la .env
   ```

2. If missing, create it:
   ```bash
   cp env.example .env
   ```

3. Add your Google Maps API key:
   ```env
   VITE_GOOGLE_MAPS_API_KEY=YOUR_KEY_HERE
   ```

4. Restart dev server:
   ```bash
   npm run dev
   ```

### Issue: Map Loads But Shows Gray

**Possible Causes:**
1. Invalid API key
2. API not enabled in Google Cloud
3. Billing not set up (required for production)

**Solution:**
1. Go to Google Cloud Console
2. Check "Maps JavaScript API" is enabled
3. Verify API key restrictions allow your domain
4. For development: Add `http://localhost:5173/*`

### Issue: Still Seeing Permission Errors

**Solution: Clear Firestore and Recreate Hub**

Option 1: Use Firebase Console
1. Go to Firebase Console → Firestore
2. Delete the user's document
3. Logout and login again
4. New hub will be created automatically

Option 2: Manual Hub Creation
```typescript
// In browser console:
// (This is a temporary workaround)
const createTestHub = async () => {
  const { createHub } = await import('./src/lib/api/hub-api');
  const result = await createHub({
    name: 'Test Hub',
    description: 'Testing hub',
    featureToggles: {
      location: true,
      tasks: true,
      chat: true,
      vault: true,
      xp: true,
      leaderboard: true,
      geofencing: true,
      deviceMonitoring: true,
    },
  });
  console.log(result);
};
createTestHub();
```

## Verification Checklist

After fixes are applied:

- [ ] Page reloaded (Ctrl+Shift+R / Cmd+Shift+R)
- [ ] No CSP errors in console
- [ ] No permission-denied errors in console
- [ ] Map tiles load successfully
- [ ] Hub name shows in top bar
- [ ] Floating action buttons visible
- [ ] Can click "Start Tracking"
- [ ] Browser asks for location permission
- [ ] User marker appears on map

## Next Steps

Once map is working:

1. **Test Location Tracking:**
   - Click purple "Start Tracking" button
   - Allow location permissions
   - Your marker should appear

2. **Test Location Sharing:**
   - Click green "Share Location" button
   - Your location saves to Firestore
   - Other users can see your location

3. **Invite Family Members:**
   - Go to Settings
   - Generate invite code
   - Share with family
   - They appear on your map!

## Debug Mode

Enable extra logging:
```typescript
// Add to .env
VITE_DEBUG_MODE=true
```

Check console for detailed logs:
- Hub creation process
- Location updates
- Firestore operations
- Map initialization

## Support

If issues persist:
1. Check browser console for errors
2. Verify Firebase services are enabled
3. Run `node scripts/verify-setup.js`
4. See [GOOGLE_MAPS_SETUP.md](./GOOGLE_MAPS_SETUP.md)

---

**Status after fixes:**
- ✅ CSP configured for Google Maps
- ✅ Automatic hub creation on first login
- ✅ Firebase permissions handled
- ✅ Map should load successfully

**Last Updated:** Now (after fixes)

