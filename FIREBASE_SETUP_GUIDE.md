# 🔥 Firebase Setup Guide

## Current Status
✅ Firebase project: `group-safety-app`  
✅ Credentials: Configured in `.env`  
✅ Security rules: Created  
❌ Services: Need enabling  
❌ Rules: Need deploying  

## Step 1: Enable Firebase Services (5 minutes)

### 1.1 Enable Authentication
1. Go to: https://console.firebase.google.com/project/group-safety-app/authentication
2. Click **"Get started"**
3. Click **"Email/Password"** in the list
4. Toggle **"Email/Password"** to **ENABLED**
5. Click **"Save"**

### 1.2 Create Firestore Database
1. Go to: https://console.firebase.google.com/project/group-safety-app/firestore
2. Click **"Create database"**
3. Select **"Start in production mode"**
4. Choose location (e.g., `us-central1`)
5. Click **"Enable"**

### 1.3 Enable Storage
1. Go to: https://console.firebase.google.com/project/group-safety-app/storage
2. Click **"Get started"**
3. Select **"Start in production mode"**
4. Use default location
5. Click **"Done"**

## Step 2: Deploy Security Rules (2 minutes)

Open your terminal and run:

```bash
cd /Users/chandlerking/Family-Tracking-and-Management-App

# Login to Firebase (opens browser)
npx firebase-tools login

# Deploy security rules
npx firebase-tools deploy --only firestore,storage
```

**Expected output:**
```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/group-safety-app/overview
```

## Step 3: Test the App

1. **Refresh your browser** at http://localhost:3000
2. **Open DevTools Console** (F12)
3. **Check for errors** - should be clean now!
4. **Click "Get started"** to test registration

## Step 4: Create Your First Hub (Manual)

Since hub creation UI isn't built yet, create one manually:

### 4.1 Create Hub Document
1. Go to: https://console.firebase.google.com/project/group-safety-app/firestore
2. Click **"Start collection"**
3. Collection ID: `hubs`
4. Click **"Next"**
5. Document ID: **Auto-ID** (copy this ID!)
6. Add these fields:

```
name: "My Family"                    (string)
createdBy: YOUR_USER_ID              (string)
members: [YOUR_USER_ID]              (array)
createdAt: NOW                       (timestamp)
updatedAt: NOW                       (timestamp)
```

7. Add `featureToggles` (click "Add field" → "Map"):

```
featureToggles:
  location: true                     (boolean)
  tasks: true                        (boolean)
  chat: true                         (boolean)
  vault: false                       (boolean)
  xp: true                           (boolean)
  leaderboard: true                  (boolean)
  geofencing: false                  (boolean)
  deviceMonitoring: true             (boolean)
```

8. Click **"Save"**

### 4.2 Create Membership
1. Inside your hub document, click **"Start subcollection"**
2. Collection ID: `memberships`
3. Document ID: **YOUR_USER_ID** (same as createdBy)
4. Add fields:

```
userId: YOUR_USER_ID                 (string)
hubId: YOUR_HUB_ID                   (string - the auto-generated hub ID)
role: "admin"                        (string)
status: "active"                     (string)
joinedAt: NOW                        (timestamp)
```

5. Click **"Save"**

### 4.3 Update User Document
1. Go to `users` collection
2. Find your user document (ID = your auth UID)
3. Edit the document
4. Add/update field:

```
hubs: [YOUR_HUB_ID]                  (array)
```

5. Click **"Update"**

## Step 5: Test Everything

1. **Refresh the app** - you should see your hub name in the top bar!
2. **Navigate to Tasks** - should work now
3. **Check console** - should be error-free

## 🎉 Success!

Once you complete these steps:
- ✅ Authentication will work
- ✅ Database will be secure
- ✅ App will be fully functional
- ✅ You can register and login
- ✅ Tasks will load properly

## 🐛 Troubleshooting

### Still getting 400 errors?
- Make sure all 3 services are enabled
- Check you deployed the rules
- Hard refresh the browser (Ctrl+Shift+R)

### "Permission denied" errors?
- Rules need to be deployed: `npx firebase-tools deploy --only firestore,storage`
- Check you're a member of the hub

### Can't login after registration?
- Check Authentication is enabled
- Look for errors in browser console
- Verify email/password provider is ON

### "No hub selected"?
- Create the hub manually (Step 4)
- Add yourself as a member
- Update your user's hubs array

---

**After completing these steps, your app will be fully functional! 🚀**

