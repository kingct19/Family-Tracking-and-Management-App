# 🚨 Quick Fix: Profile Pictures Not Showing (CORS Error)

## The Problem
Your profile picture shows as initials ("CK") instead of your actual photo because Firebase Storage is blocking the image due to CORS (Cross-Origin Resource Sharing) restrictions.

## ⚡ Quick Fix (2 minutes)

### Step 1: Open Google Cloud Console
Go to: https://console.cloud.google.com/storage/browser?project=group-safety-app

### Step 2: Configure CORS
1. Click on your bucket: **`group-safety-app.appspot.com`**
2. Click the **"Configuration"** tab at the top
3. Scroll down to **"CORS configuration"** section
4. Click **"Edit CORS configuration"** button
5. **Delete** any existing content
6. **Paste** this JSON:

```json
[
  {
    "origin": [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:5173",
      "http://localhost:5174",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:3001"
    ],
    "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "responseHeader": ["Content-Type", "Authorization", "Content-Length"],
    "maxAgeSeconds": 3600
  }
]
```

7. Click **"Save"**

### Step 3: Refresh Your App
1. **Hard refresh** your browser: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
2. **Clear browser cache** if needed
3. Your profile picture should now appear on the map!

## ✅ What This Fixes
- ✅ Profile pictures on map markers
- ✅ Profile pictures in member cards
- ✅ All Firebase Storage images

## 🐛 Still Not Working?

### Check 1: Verify CORS is Saved
- Go back to Configuration tab
- Check that CORS config shows your localhost URLs

### Check 2: Wait a Minute
- CORS changes can take 30-60 seconds to propagate
- Try refreshing again after waiting

### Check 3: Check Browser Console
- Open DevTools (F12)
- Look for any remaining CORS errors
- If you see errors, the CORS config might not have saved correctly

### Check 4: Verify Image URL
- Open your profile page
- Right-click your profile picture
- Copy image URL
- Paste in new tab - does it load?
- If it loads in a new tab but not in the app, it's definitely CORS

## 📝 Alternative: Use gcloud CLI

If you have `gcloud` CLI installed:

```bash
# Create CORS config file
cat > cors.json << 'EOF'
[
  {
    "origin": ["http://localhost:3000", "http://localhost:3001", "http://localhost:5173"],
    "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "responseHeader": ["Content-Type", "Authorization", "Content-Length"],
    "maxAgeSeconds": 3600
  }
]
EOF

# Apply CORS
gsutil cors set cors.json gs://group-safety-app.appspot.com

# Clean up
rm cors.json
```

## 🎯 After Fixing CORS

Once CORS is configured:
1. Your profile picture will appear on the map marker (green circle with your photo)
2. Profile pictures will show in member cards
3. All Firebase Storage images will load properly

The app will automatically retry loading images once CORS is fixed!

