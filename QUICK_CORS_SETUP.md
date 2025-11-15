# ⚡ Quick CORS Setup (2 Steps)

## Step 1: Authenticate with Google Cloud

Open your terminal and run:

```bash
cd /Users/chandlerking/Family-Tracking-and-Management-App
export PATH=/opt/homebrew/share/google-cloud-sdk/bin:"$PATH"
gcloud auth login
```

This will:
1. Open your browser
2. Ask you to sign in with your Google account
3. Grant permissions to Google Cloud SDK

## Step 2: Run the CORS Configuration Script

After authentication, run:

```bash
./configure-cors.sh
```

That's it! Your profile pictures should now load.

---

## Alternative: Manual Configuration

If the script doesn't work, you can run these commands manually:

```bash
# 1. Set your project
export PATH=/opt/homebrew/share/google-cloud-sdk/bin:"$PATH"
gcloud config set project group-safety-app

# 2. Configure CORS
gsutil cors set cors-config.json gs://group-safety-app.firebasestorage.app

# 3. Verify it worked
gsutil cors get gs://group-safety-app.firebasestorage.app
```

## After Configuration

1. Wait 30-60 seconds for changes to propagate
2. Hard refresh your browser: `Cmd+Shift+R`
3. Your profile pictures should now appear on the map! 🎉

