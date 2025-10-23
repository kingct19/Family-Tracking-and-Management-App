# 🗺️ Google Maps API - Setup Summary

## What You Need to Do

### 1. Create Google Maps API Key (5 minutes)

**Go to:** https://console.cloud.google.com/

**Steps:**
1. Create/select a project
2. Enable "Maps JavaScript API"
3. Create an API Key
4. Add restrictions:
   - HTTP referrer: `http://localhost:5173/*`
   - API restriction: Maps JavaScript API only
5. Copy your API key

### 2. Add API Key to Your Project

**Edit your `.env` file:**
```bash
# If .env doesn't exist, create it:
cp env.example .env

# Then edit it:
nano .env
```

**Add this line:**
```env
VITE_GOOGLE_MAPS_API_KEY=AIzaSy...your_actual_key_here
```

### 3. Verify & Run

```bash
# Check if everything is configured
node scripts/verify-setup.js

# Start the app
npm run dev
```

**Open:** http://localhost:5173

## That's It! 🎉

The map should now work on your main screen.

## Need Help?

See detailed guides:
- **[GOOGLE_MAPS_SETUP.md](./GOOGLE_MAPS_SETUP.md)** - Step-by-step with screenshots
- **[SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md)** - Interactive checklist
- **[QUICKSTART.md](./QUICKSTART.md)** - Complete app setup

## Test Your Setup

After starting the app:
1. ✅ Map loads on main screen
2. ✅ Click "Start Tracking" (purple button)
3. ✅ Allow location permissions
4. ✅ Click "Share Location" (green button)
5. ✅ Your marker appears on map

## Cost

**Free Tier:** $200/month credit
- Covers ~28,000 map loads
- Perfect for development

No credit card needed for development!

---

**Questions?** Check the browser console (F12) for error messages.

