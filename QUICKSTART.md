# 🚀 Quick Start Guide - Family Safety App

## Prerequisites
- Node.js 18+ installed
- Firebase project created
- Google Cloud account

## Setup Steps (5 minutes)

### 1️⃣ Clone & Install Dependencies
```bash
cd /Users/chandlerking/Family-Tracking-and-Management-App
npm install
```

### 2️⃣ Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** (gear icon) → **General**
4. Scroll to "Your apps" → Find your web app
5. Copy the config values

### 3️⃣ Setup Google Maps API

Follow the detailed guide: **[GOOGLE_MAPS_SETUP.md](./GOOGLE_MAPS_SETUP.md)**

**Quick version:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable **Maps JavaScript API**
3. Create an **API Key**
4. Add **localhost restrictions**
5. Copy the API key

### 4️⃣ Create .env File

```bash
# Copy the example file
cp env.example .env

# Edit .env with your favorite editor
nano .env
# or
code .env
```

Add your actual keys:
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIza...your_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123:web:abc

# Google Maps API Key
VITE_GOOGLE_MAPS_API_KEY=AIza...your_maps_key

# App Configuration (optional)
VITE_APP_NAME=FamilyTracker
VITE_VERSION=1.0.0
VITE_USE_EMULATORS=false
```

### 5️⃣ Verify Setup

```bash
node scripts/verify-setup.js
```

You should see:
```
✅ All environment variables are configured!
```

### 6️⃣ Start Development Server

```bash
npm run dev
```

The app will open at: **http://localhost:5173**

## First Time Use

### 1. Register an Account
- Click "Get Started Free"
- Enter your details
- Create your account

### 2. Enable Location Tracking
- After login, you'll see the map
- Click the **purple navigation button** (floating on right)
- Allow location permissions when prompted
- Click the **green pin button** to start sharing

### 3. Test the Map
- Your location should appear on the map
- The member panel at the bottom shows you
- Tap your card to see details

### 4. Invite Family Members
- Go to Settings (bottom nav)
- Generate invite code
- Share with family
- They register with the code
- They appear on your map!

## Features Available Now ✅

### Phase 1.1: Location Tracking ✅
- ✅ Real-time location tracking
- ✅ Google Maps integration
- ✅ Location sharing on/off
- ✅ Member location cards
- ✅ 30-day history retention
- ✅ Life360-style interface

### Coming Soon 🚧
- 🚧 Geofencing & alerts (Phase 1.2)
- 🚧 Device monitoring (Phase 1.3)
- 🚧 Real-time chat (Phase 2)
- 🚧 Photo-proof tasks (Phase 3)
- 🚧 XP & gamification (Phase 4)
- 🚧 Multi-hub support (Phase 5)
- 🚧 Digital vault (Phase 6)

## Troubleshooting

### Map doesn't load
**Check:**
1. Google Maps API key is correct in `.env`
2. Maps JavaScript API is enabled in Google Cloud
3. Browser console for errors (F12)
4. Run: `node scripts/verify-setup.js`

### Location permission denied
**Fix:**
1. Chrome: Click padlock → Site settings → Location → Allow
2. Or use HTTPS instead of HTTP
3. Clear browser cache

### Firebase errors
**Fix:**
1. Verify Firebase config in `.env`
2. Check Firebase Console for enabled services:
   - Authentication (Email/Password enabled)
   - Firestore Database (created)
   - Storage (created)

### "Module not found" errors
**Fix:**
```bash
rm -rf node_modules
npm install
```

## Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Run E2E tests
npm run test:e2e

# Lint code
npm run lint

# Type check
npm run type-check
```

## Project Structure

```
src/
├── features/
│   ├── auth/          # Authentication & registration
│   ├── location/      # 📍 Maps, tracking, geofencing
│   ├── tasks/         # Task management
│   ├── messages/      # Chat & alerts
│   ├── vault/         # Secure storage
│   └── settings/      # App settings
├── components/        # Shared UI components
├── lib/              # Services & utilities
└── config/           # Firebase & app config
```

## Key Files

- **LocationPage.tsx** - Main map interface (Life360 style)
- **MapView.tsx** - Google Maps component
- **location-service.ts** - Geolocation API wrapper
- **location-api.ts** - Firebase location operations
- **useLocation.ts** - React hooks for location

## Next Steps

1. ✅ Setup complete? Start coding!
2. 📖 Read the implementation plan: [group-safety-app-implementation.plan.md](./group-safety-app-implementation.plan.md)
3. 🔍 Explore the codebase
4. 🐛 Report issues on GitHub
5. 🚀 Start implementing Phase 1.2 (Geofencing)

## Support

- **Setup Issues:** See [GOOGLE_MAPS_SETUP.md](./GOOGLE_MAPS_SETUP.md)
- **Architecture:** See [LIFE360_ARCHITECTURE_COMPLETE.md](./LIFE360_ARCHITECTURE_COMPLETE.md)
- **Location Features:** See [PHASE1_LOCATION_COMPLETE.md](./PHASE1_LOCATION_COMPLETE.md)

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_FIREBASE_API_KEY` | ✅ | Firebase Web API Key |
| `VITE_FIREBASE_AUTH_DOMAIN` | ✅ | Firebase Auth Domain |
| `VITE_FIREBASE_PROJECT_ID` | ✅ | Firebase Project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | ✅ | Firebase Storage Bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | ✅ | Firebase Messaging Sender ID |
| `VITE_FIREBASE_APP_ID` | ✅ | Firebase App ID |
| `VITE_GOOGLE_MAPS_API_KEY` | ✅ | Google Maps JavaScript API Key |
| `VITE_APP_NAME` | ❌ | App name (default: FamilyTracker) |
| `VITE_VERSION` | ❌ | App version (default: 1.0.0) |
| `VITE_USE_EMULATORS` | ❌ | Use Firebase emulators (default: false) |

---

**Ready to build?** 🎉

```bash
npm run dev
```

Then open http://localhost:5173 and start tracking!

