# Clear Browser Cache

If you're seeing errors about notification permissions or Firestore indexes, you may need to clear your browser cache:

## Quick Fix

1. **Hard Refresh**: 
   - Mac: `Cmd + Shift + R`
   - Windows/Linux: `Ctrl + Shift + R`

2. **Or Restart Dev Server**:
   ```bash
   # Stop the server (Ctrl+C) and restart
   npm run dev
   ```

## Errors That Should Be Fixed

✅ **Notification Permission Error**: Fixed - permission is now only requested from user gestures
✅ **Firestore Index Error**: Fixed - geofence query simplified to avoid index requirement  
✅ **Device Status Permission Errors**: Silently handled - won't spam console

These errors may appear if you have cached JavaScript from before the fixes were applied.

