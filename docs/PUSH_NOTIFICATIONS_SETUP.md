# Push Notifications Setup Guide

This guide explains how to set up push notifications using Firebase Cloud Messaging (FCM).

## Prerequisites

1. Firebase project with Cloud Messaging enabled
2. VAPID key from Firebase Console
3. Service worker support in browser

## Setup Steps

### 1. Get VAPID Key from Firebase Console

1. Go to Firebase Console > Project Settings > Cloud Messaging
2. Under "Web configuration", generate a new key pair (if not already done)
3. Copy the "Key pair" value - this is your VAPID key

### 2. Add Environment Variables

Add to your `.env` file:

```env
VITE_FCM_VAPID_KEY=your-vapid-key-here
```

### 3. Update Firebase Messaging Service Worker

Edit `public/firebase-messaging-sw.js` and replace the placeholder Firebase config with your actual values:

```javascript
const firebaseConfig = {
    apiKey: 'your-api-key',
    authDomain: 'your-auth-domain',
    projectId: 'your-project-id',
    storageBucket: 'your-storage-bucket',
    messagingSenderId: 'your-messaging-sender-id',
    appId: 'your-app-id',
};
```

### 4. Cloud Function for Sending Notifications

Create a Cloud Function to send notifications. Example:

```typescript
// functions/src/index.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const sendNotification = functions.https.onCall(async (data, context) => {
    // Verify authentication
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { userId, title, body, type, data: notificationData } = data;

    // Get user's FCM token
    const tokenDoc = await admin.firestore()
        .collection('users')
        .doc(userId)
        .collection('tokens')
        .doc('fcm')
        .get();

    if (!tokenDoc.exists || !tokenDoc.data()?.token) {
        throw new functions.https.HttpsError('not-found', 'FCM token not found');
    }

    const token = tokenDoc.data()!.token;

    // Send notification
    const message = {
        notification: {
            title,
            body,
        },
        data: {
            type,
            ...notificationData,
        },
        token,
    };

    try {
        await admin.messaging().send(message);
        return { success: true };
    } catch (error) {
        console.error('Error sending notification:', error);
        throw new functions.https.HttpsError('internal', 'Failed to send notification');
    }
});
```

### 5. Enable Notifications in App

Users can enable notifications from Settings > Notification Settings. The app will:
- Request browser permission
- Get FCM token
- Store token in Firestore
- Set up foreground message listener

## Notification Types

The app supports these notification types:

- **task**: Task assignments and updates
- **message**: New messages in hub
- **geofence**: Geofence entry/exit alerts
- **approval**: Task proof pending approval
- **xp**: XP earned or level up
- **general**: General notifications

## Testing

1. Enable notifications in Settings
2. Use Firebase Console > Cloud Messaging > Send test message
3. Or trigger notifications from your app (task assignment, etc.)

## Troubleshooting

### Notifications not working?

1. Check browser console for errors
2. Verify VAPID key is set correctly
3. Check Firebase Messaging service worker is registered
4. Verify notification permission is granted
5. Check Firestore for FCM token storage

### Service Worker not registering?

- Ensure `firebase-messaging-sw.js` is in the `public` directory
- Check that the file is accessible at `/firebase-messaging-sw.js`
- Verify Firebase config matches your project

### Token not being saved?

- Check Firestore security rules allow token writes
- Verify user is authenticated
- Check browser console for errors

## Security Rules

Add to `firestore.rules`:

```javascript
match /users/{userId}/tokens/{tokenId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

