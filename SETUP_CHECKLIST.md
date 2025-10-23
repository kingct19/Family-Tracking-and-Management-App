# 📋 Google Maps API Setup Checklist

Follow these steps to get your map working!

## ✅ Checklist

### Step 1: Google Cloud Console Setup
- [ ] Go to https://console.cloud.google.com/
- [ ] Create a new project or select existing project
- [ ] Project name: _______________________

### Step 2: Enable APIs
- [ ] Go to **APIs & Services** → **Library**
- [ ] Search and enable: **Maps JavaScript API**
- [ ] (Optional) Enable: **Geolocation API**
- [ ] (Optional) Enable: **Geocoding API**
- [ ] (Optional) Enable: **Places API**

### Step 3: Create API Key
- [ ] Go to **APIs & Services** → **Credentials**
- [ ] Click **+ CREATE CREDENTIALS** → **API Key**
- [ ] Copy the API key: `_______________________________`
- [ ] Click **Edit API Key** to add restrictions

### Step 4: Restrict API Key (Security)
**Application Restrictions:**
- [ ] Select: **HTTP referrers (web sites)**
- [ ] Add referrer: `http://localhost:5173/*`
- [ ] Add referrer: `http://127.0.0.1:5173/*`

**API Restrictions:**
- [ ] Select: **Restrict key**
- [ ] Check: **Maps JavaScript API**
- [ ] Check other APIs you enabled
- [ ] Click **Save**

### Step 5: Add to Project
- [ ] Copy `env.example` to `.env`:
  ```bash
  cp env.example .env
  ```

- [ ] Edit `.env` and add your Google Maps API key:
  ```env
  VITE_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
  ```

- [ ] Also add your Firebase credentials to `.env`

### Step 6: Verify Setup
- [ ] Run verification script:
  ```bash
  node scripts/verify-setup.js
  ```

- [ ] All checks should be ✅ green

### Step 7: Start Dev Server
- [ ] Run:
  ```bash
  npm run dev
  ```

- [ ] Open: http://localhost:5173

### Step 8: Test the App
- [ ] Register a new account
- [ ] See the map on main screen
- [ ] Click purple navigation button (Start Tracking)
- [ ] Allow location permissions
- [ ] Click green pin button (Share Location)
- [ ] Your location marker appears on map
- [ ] Your card appears in bottom panel

## 🚨 Common Issues

### Issue: "RefererNotAllowedMapError"
**Fix:** Add `http://localhost:5173/*` to API key restrictions

### Issue: "This API project is not authorized"
**Fix:** Enable Maps JavaScript API in Google Cloud Console

### Issue: "Google Maps API key not configured"
**Fix:** Check `.env` file has `VITE_GOOGLE_MAPS_API_KEY=...`

### Issue: Map loads but is gray
**Fix:** Check browser console for errors, verify API key is correct

### Issue: No location permission prompt
**Fix:** 
- Check browser site settings (click padlock icon)
- Make sure you're on localhost (not file://)
- Try different browser

## 💰 Billing Info

**Free Tier:** $200/month credit
- Covers ~28,000 map loads/month
- Perfect for development and small family use

**For Production:** Add a credit card for billing alerts

## 📚 Resources

- **Setup Guide:** GOOGLE_MAPS_SETUP.md (detailed instructions)
- **Quick Start:** QUICKSTART.md (5-minute setup)
- **Troubleshooting:** See GOOGLE_MAPS_SETUP.md

## ✅ Success!

When all steps are complete:
- ✅ Map loads on main screen
- ✅ Your location shows on map
- ✅ Member cards display at bottom
- ✅ No console errors

**You're ready to start tracking! 🎉**

---

**Next Steps:**
1. Invite family members
2. Test location sharing
3. Explore other features
4. Continue with Phase 1.2 (Geofencing)

