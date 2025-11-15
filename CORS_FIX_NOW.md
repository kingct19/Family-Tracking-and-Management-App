# 🚨 URGENT: Fix CORS Errors - Profile Pictures Not Showing

## The Problem
Your profile picture shows as "CK" instead of your actual photo because Firebase Storage is blocking images due to CORS.

## ⚡ FASTEST FIX (Choose One)

### Option 1: Using Script (If you have gcloud CLI)

```bash
cd /Users/chandlerking/Family-Tracking-and-Management-App
./scripts/configure-storage-cors.sh
```

**If you don't have gcloud CLI:**
```bash
# Install gcloud CLI first
brew install google-cloud-sdk

# Then authenticate
gcloud auth login
gcloud config set project group-safety-app

# Run the script
./scripts/configure-storage-cors.sh
```

### Option 2: Manual Configuration (Easiest - No CLI needed)

1. **Open Google Cloud Console:**
   - Go to: https://console.cloud.google.com/storage/browser?project=group-safety-app
   - **OR** search "Google Cloud Storage" in your browser

2. **Select Your Bucket:**
   - Click on: **`group-safety-app.appspot.com`**

3. **Open Configuration:**
   - Click the **"Configuration"** tab at the top
   - Scroll down to find **"CORS configuration"**

4. **Edit CORS:**
   - Click **"Edit CORS configuration"** button
   - **DELETE** everything in the text box
   - **PASTE** this JSON:

```json
[
  {
    "origin": [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:5173",
      "http://localhost:5174"
    ],
    "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "responseHeader": ["Content-Type", "Authorization", "Content-Length"],
    "maxAgeSeconds": 3600
  }
]
```

5. **Save:**
   - Click **"Save"** button
   - Wait 30 seconds

6. **Refresh Your App:**
   - Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
   - Your profile picture should now appear! 🎉

## ✅ What This Fixes

- ✅ Profile pictures on map markers (green circle with your photo)
- ✅ Profile pictures in member cards
- ✅ All Firebase Storage images loading properly

## 🐛 Still Not Working?

### Check 1: Verify CORS Saved
- Go back to Configuration tab
- Check that CORS shows your localhost URLs

### Check 2: Wait & Refresh
- CORS changes take 30-60 seconds
- Hard refresh again after waiting

### Check 3: Check Browser Console
- Open DevTools (F12)
- Look for CORS errors
- If still there, CORS might not have saved correctly

### Check 4: Test Image URL
- Go to your profile page
- Right-click your profile picture
- Copy image URL
- Paste in new browser tab
- If it loads there but not in app = CORS issue

## 📝 About Firestore CORS Errors

The Firestore CORS errors in console are **harmless** - they're related to WebSocket connections and don't affect functionality. You can ignore them.

## 🎯 After Fixing

Once CORS is configured:
1. Your profile picture will appear on the map marker
2. Profile pictures will show in member cards  
3. All images will load automatically

The app will automatically detect when images become available and update the markers!

