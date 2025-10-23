# Environment Variable Test Instructions

## The Problem
Vite environment variables aren't loading. The `.env` file exists and has the correct values, but `import.meta.env.VITE_GOOGLE_MAPS_API_KEY` is returning an empty string.

## Quick Diagnostic Steps

### Step 1: Verify .env File Location
The `.env` file MUST be in the root directory (same level as `package.json`).

```bash
cd /Users/chandlerking/Family-Tracking-and-Management-App
ls -la .env
```

Expected output: `.env` file exists

### Step 2: Check .env File Contents
```bash
cat .env | grep VITE_GOOGLE_MAPS_API_KEY
```

Expected: `VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here`

### Step 3: Verify Vite Config
Check if `vite.config.ts` is blocking environment variables:

```bash
cat vite.config.ts | grep envPrefix
```

If you see `envPrefix`, make sure it includes `VITE_`.

### Step 4: Hard Restart Dev Server

**CRITICAL**: You must completely stop and restart the dev server:

1. **Find the terminal** running `npm run dev`
2. **Press `Ctrl + C`** (or `Cmd + C` on Mac) - Wait for it to fully stop
3. **Verify it's stopped** - Terminal should return to command prompt
4. **Restart**: 
   ```bash
   npm run dev
   ```
5. **Wait for "ready in Xms"** message
6. **Hard refresh browser**: `Cmd + Shift + R` (Mac) or `Ctrl + Shift + R` (Windows/Linux)

### Step 5: Check Browser Console
After refreshing, open DevTools (F12) and check console for:

```
MapView - API Key Status: {
  exists: true,
  length: 39,
  firstChars: 'AIzaSy...',
  allEnvVars: {...}
}
```

If `length: 0` or `exists: false`, the server didn't restart properly.

## Common Issues

### Issue 1: Server Not Actually Restarted
**Symptom**: Still showing "API key not configured"

**Solution**: 
```bash
# Kill any running node processes
killall node

# Or find and kill the specific process
lsof -ti:5173 | xargs kill -9

# Then restart
npm run dev
```

### Issue 2: .env File in Wrong Location
**Symptom**: `cat .env` fails or shows wrong directory

**Solution**:
```bash
# Move .env to project root if it's elsewhere
cd /Users/chandlerking/Family-Tracking-and-Management-App
# Verify you're in the right place
pwd
# Should show: /Users/chandlerking/Family-Tracking-and-Management-App
```

### Issue 3: Cached Build
**Symptom**: Old code still running

**Solution**:
```bash
# Clear Vite cache and rebuild
rm -rf node_modules/.vite
npm run dev
```

### Issue 4: Environment Variable Name Wrong
**Symptom**: Other env vars work, but not Maps key

**Solution**:
Check the EXACT variable name in `.env`:
- ✅ Correct: `VITE_GOOGLE_MAPS_API_KEY`
- ❌ Wrong: `GOOGLE_MAPS_API_KEY` (missing `VITE_` prefix)
- ❌ Wrong: `VITE_GOOGLEMAPS_API_KEY` (no underscore)

## Manual Override Test

If nothing works, try hardcoding temporarily to test:

**Edit `src/features/location/components/MapView.tsx`:**

```typescript
// TEMPORARY - Remove after testing
const GOOGLE_MAPS_API_KEY = 'your_actual_api_key_here';
// const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
```

If the map loads with this hardcoded key, then the issue is definitely the environment variable loading.

## Success Checklist

After following all steps:

- [ ] Dev server fully stopped (Ctrl+C)
- [ ] Dev server restarted (`npm run dev`)
- [ ] Browser hard refreshed (Cmd+Shift+R)
- [ ] Console shows API key status with `exists: true`
- [ ] Console shows `length: 39` (correct key length)
- [ ] Map loads without "API key not configured" error
- [ ] No CSP errors in console

## Still Not Working?

### Last Resort: Clean Install

```bash
# 1. Stop server (Ctrl+C)
# 2. Clean everything
rm -rf node_modules
rm -rf node_modules/.vite
rm -rf dist

# 3. Reinstall
npm install

# 4. Verify .env is still there
cat .env | grep VITE_GOOGLE_MAPS_API_KEY

# 5. Restart
npm run dev
```

## Expected Final Result

**Browser Console:**
```
MapView - API Key Status: {
  exists: true,
  length: 39,
  firstChars: 'AIzaSy...',
  ...
}
```

**Browser Screen:**
- ✅ Google Map with tiles visible
- ✅ "chandler king's Hub" in header
- ✅ Floating action buttons
- ✅ No error messages

---

**Current Status**: Waiting for dev server restart
**Next Action**: Stop server completely, then run `npm run dev`

