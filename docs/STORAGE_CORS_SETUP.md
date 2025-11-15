# Firebase Storage CORS Configuration

## Problem
When loading images from Firebase Storage in development (localhost), you may encounter CORS errors:
```
Origin http://localhost:3001 is not allowed by Access-Control-Allow-Origin
```

## Solution

### Option 1: Using gcloud CLI (Recommended)

1. **Install gcloud CLI** (if not already installed):
   ```bash
   # macOS
   brew install google-cloud-sdk
   
   # Or download from: https://cloud.google.com/sdk/docs/install
   ```

2. **Authenticate**:
   ```bash
   gcloud auth login
   ```

3. **Set your project**:
   ```bash
   gcloud config set project group-safety-app
   ```

4. **Run the CORS setup script**:
   ```bash
   node scripts/setup-storage-cors.js
   ```

### Option 2: Manual Configuration via Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/storage/browser?project=group-safety-app)

2. Click on your bucket: `group-safety-app.appspot.com`

3. Click on the **"Configuration"** tab

4. Scroll down to **"CORS configuration"**

5. Click **"Edit CORS configuration"**

6. Paste the following JSON:
   ```json
   [
     {
       "origin": [
         "http://localhost:3000",
         "http://localhost:3001",
         "http://localhost:5173",
         "http://localhost:5174",
         "http://127.0.0.1:3000",
         "http://127.0.0.1:3001",
         "http://127.0.0.1:5173",
         "http://127.0.0.1:5174"
       ],
       "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
       "responseHeader": ["Content-Type", "Authorization", "Content-Length"],
       "maxAgeSeconds": 3600
     }
   ]
   ```

7. Click **"Save"**

### Option 3: Using Firebase CLI (Alternative)

Create a file `cors.json`:
```json
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "responseHeader": ["*"],
    "maxAgeSeconds": 3600
  }
]
```

Then run:
```bash
gsutil cors set cors.json gs://group-safety-app.appspot.com
```

## Verify Configuration

After setting up CORS, verify it's working:

1. **Check CORS config**:
   ```bash
   gsutil cors get gs://group-safety-app.appspot.com
   ```

2. **Test in browser**:
   - Hard refresh your app (Cmd+Shift+R / Ctrl+Shift+R)
   - Check browser console - CORS errors should be gone
   - Images should load properly

## Production CORS

For production, you'll want to restrict origins to your actual domain:

```json
[
  {
    "origin": [
      "https://your-app-domain.com",
      "https://www.your-app-domain.com"
    ],
    "method": ["GET", "HEAD"],
    "responseHeader": ["Content-Type", "Content-Length"],
    "maxAgeSeconds": 3600
  }
]
```

## Troubleshooting

### Still getting CORS errors?

1. **Clear browser cache** - CORS headers are cached
2. **Check bucket name** - Make sure you're configuring the correct bucket
3. **Wait a few minutes** - CORS changes can take a minute to propagate
4. **Check browser console** - Look for the exact error message

### Images still not loading?

1. **Check Storage Rules** - Make sure `storage.rules` allows read access
2. **Check image URLs** - Verify the download URLs are correct
3. **Check authentication** - Make sure user is authenticated if rules require it

## Additional Notes

- CORS only affects browser requests (not server-side)
- Firebase Storage uses Google Cloud Storage under the hood
- CORS configuration applies to the entire bucket
- Changes take effect immediately but may be cached by browsers

