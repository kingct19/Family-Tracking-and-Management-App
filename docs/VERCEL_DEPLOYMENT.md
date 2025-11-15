# Vercel Deployment Guide

## Setting Up Environment Variables in Vercel

To deploy this app to Vercel, you need to configure the following environment variables:

### Required Firebase Environment Variables

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables (for **Production**, **Preview**, and **Development**):

```
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX (optional, for Analytics)
```

### Optional Environment Variables

```
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
VITE_APP_NAME=FamilyTracker
VITE_VERSION=1.0.0
VITE_USE_EMULATORS=false
```

### How to Find Your Firebase Config Values

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the gear icon ⚙️ → **Project settings**
4. Scroll down to **Your apps** section
5. Click on your web app (or create one if you haven't)
6. Copy the values from the `firebaseConfig` object

### Setting Environment Variables in Vercel

#### Via Vercel Dashboard:

1. Go to your project: `https://vercel.com/[your-username]/[your-project]/settings/environment-variables`
2. Click **Add New**
3. Enter the variable name (e.g., `VITE_FIREBASE_API_KEY`)
4. Enter the value
5. Select which environments to apply to (Production, Preview, Development)
6. Click **Save**

#### Via Vercel CLI:

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Add environment variables
vercel env add VITE_FIREBASE_API_KEY production
vercel env add VITE_FIREBASE_AUTH_DOMAIN production
vercel env add VITE_FIREBASE_PROJECT_ID production
vercel env add VITE_FIREBASE_STORAGE_BUCKET production
vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID production
vercel env add VITE_FIREBASE_APP_ID production
```

### After Adding Environment Variables

1. **Redeploy** your application:
   - Go to **Deployments** tab
   - Click the **⋯** menu on the latest deployment
   - Select **Redeploy**
   - Or push a new commit to trigger a new deployment

2. **Verify** the deployment:
   - Check the build logs for any errors
   - Open your deployed app and check the browser console
   - Ensure no "Missing required environment variables" errors appear

### Troubleshooting

#### Error: "Missing required environment variables"

- Ensure all required variables are set in Vercel
- Check that variable names start with `VITE_` (required for Vite)
- Verify the environment (Production/Preview/Development) matches your deployment
- Redeploy after adding variables

#### CSP Error: "Refused to load vercel.live"

- This should be fixed by the updated CSP in `index.html` and `vercel.json`
- If you still see this error, ensure `vercel.json` is committed and deployed

#### Build Fails

- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility (Vercel uses Node 18+ by default)

### Security Notes

- **Never commit** `.env` files with real values
- Use Vercel's environment variables for sensitive data
- Consider using Vercel's **Secret Manager** for highly sensitive keys
- Firebase API keys are safe to expose in client-side code (they're protected by Firebase Security Rules)

### Quick Checklist

- [ ] All Firebase environment variables added to Vercel
- [ ] Variables set for correct environments (Production/Preview/Development)
- [ ] Application redeployed after adding variables
- [ ] No errors in browser console
- [ ] Firebase services (Auth, Firestore, Storage) working correctly

