# 🚨 DEPLOY FIRESTORE RULES NOW

## Quick Deploy (2 minutes)

Your app needs updated Firestore rules to store user preferences. Follow these steps:

### Step 1: Copy Dev Rules to Main Rules File

```bash
cp firestore.rules.dev firestore.rules
```

### Step 2: Deploy to Firebase

```bash
firebase deploy --only firestore:rules
```

That's it! The rules will be live in ~30 seconds.

---

## What Changed?

Added permission for users to write to their own settings:

```javascript
match /users/{userId} {
  allow read, write: if isUser(userId);
  
  // NEW: Settings subcollection
  match /settings/{document=**} {
    allow read, write: if isUser(userId);
  }
}
```

This allows the app to store:
- Location permission status
- Location sharing preferences
- Notification settings
- Other user preferences

---

## Verify It Worked

After deploying, refresh your browser. You should see:
- ✅ No more "permission-denied" errors
- ✅ Location permission saved successfully
- ✅ Map centered on your location

---

## Troubleshooting

### Error: "Firebase CLI not found"
Install it:
```bash
npm install -g firebase-tools
firebase login
```

### Error: "No project active"
Initialize Firebase:
```bash
firebase use --add
# Select your project: group-safety-app
```

### Still getting permission errors?
1. Check Firebase Console → Firestore → Rules
2. Verify the rules were deployed
3. Hard refresh your browser (Cmd+Shift+R)

---

## Alternative: Deploy via Firebase Console

If CLI doesn't work:

1. Go to https://console.firebase.google.com
2. Select your project
3. Go to **Firestore Database** → **Rules** tab
4. Copy contents from `firestore.rules.dev`
5. Click **Publish**

---

**Status**: ⚠️ Rules updated locally, need to deploy to Firebase

