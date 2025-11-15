/**
 * Notification Service
 * 
 * Handles push notifications using Firebase Cloud Messaging (FCM)
 * - Request notification permission
 * - Get FCM token
 * - Store token in Firestore
 * - Handle foreground notifications
 */

import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { getAuth } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, app, messaging as firebaseMessaging } from '@/config/firebase';
import toast from 'react-hot-toast';

// VAPID key - should be in environment variables
// In production, get this from Firebase Console > Project Settings > Cloud Messaging
const VAPID_KEY = import.meta.env.VITE_FCM_VAPID_KEY || '';

class NotificationService {
    private messaging: Messaging | null = null;
    private token: string | null = null;
    private isInitialized = false;

    constructor() {
        // Use the messaging instance from firebase.ts if available
        if (firebaseMessaging) {
            this.messaging = firebaseMessaging;
            this.isInitialized = true;
        } else if (typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator) {
            // Fallback: try to initialize if not already done
            try {
                this.messaging = getMessaging(app);
                this.isInitialized = true;
            } catch (error) {
                console.warn('Firebase Messaging not available:', error);
            }
        }
    }

    /**
     * Check if notifications are supported
     */
    isSupported(): boolean {
        return (
            typeof window !== 'undefined' &&
            'Notification' in window &&
            'serviceWorker' in navigator &&
            this.isInitialized &&
            !!this.messaging
        );
    }

    /**
     * Check current notification permission status
     */
    getPermissionStatus(): NotificationPermission {
        if (!('Notification' in window)) {
            return 'denied';
        }
        return Notification.permission;
    }

    /**
     * Request notification permission
     */
    async requestPermission(): Promise<boolean> {
        if (!this.isSupported()) {
            console.warn('Notifications not supported');
            return false;
        }

        if (!('Notification' in window)) {
            toast.error('Your browser does not support notifications');
            return false;
        }

        // Check if already granted
        if (Notification.permission === 'granted') {
            return await this.getToken();
        }

        // Check if denied
        if (Notification.permission === 'denied') {
            toast.error('Notification permission was denied. Please enable it in your browser settings.');
            return false;
        }

        // Request permission
        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                toast.success('Notifications enabled!');
                return await this.getToken();
            } else {
                toast.error('Notification permission denied');
                return false;
            }
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            toast.error('Failed to request notification permission');
            return false;
        }
    }

    /**
     * Get FCM token
     */
    async getToken(): Promise<boolean> {
        if (!this.isSupported() || !this.messaging || !VAPID_KEY) {
            console.warn('FCM not configured - missing VAPID key');
            return false;
        }

        try {
            const auth = getAuth();
            if (!auth.currentUser) {
                console.warn('User not authenticated');
                return false;
            }

            // Get token from FCM
            const currentToken = await getToken(this.messaging, {
                vapidKey: VAPID_KEY,
            });

            if (currentToken) {
                this.token = currentToken;
                console.log('FCM Token:', currentToken);

                // Store token in Firestore
                await this.saveTokenToFirestore(currentToken);
                return true;
            } else {
                console.warn('No registration token available');
                return false;
            }
        } catch (error: any) {
            console.error('Error getting FCM token:', error);
            if (error.code === 'messaging/permission-blocked') {
                toast.error('Notification permission is blocked');
            } else if (error.code === 'messaging/registration-token-not-registered') {
                console.warn('Registration token not registered');
            }
            return false;
        }
    }

    /**
     * Save FCM token to Firestore
     */
    private async saveTokenToFirestore(token: string): Promise<void> {
        try {
            const auth = getAuth();
            if (!auth.currentUser) {
                return;
            }

            const userId = auth.currentUser.uid;
            const tokenRef = doc(db, 'users', userId, 'tokens', 'fcm');

            await setDoc(tokenRef, {
                token,
                updatedAt: new Date(),
                platform: this.getPlatform(),
                userAgent: navigator.userAgent,
            }, { merge: true });

            console.log('FCM token saved to Firestore');
        } catch (error) {
            console.error('Error saving FCM token:', error);
        }
    }

    /**
     * Get platform information
     */
    private getPlatform(): string {
        const ua = navigator.userAgent;
        if (/android/i.test(ua)) return 'android';
        if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
        if (/Mac/.test(ua)) return 'macos';
        if (/Win/.test(ua)) return 'windows';
        if (/Linux/.test(ua)) return 'linux';
        return 'unknown';
    }

    /**
     * Set up foreground message listener
     */
    setupForegroundListener(): void {
        if (!this.isSupported() || !this.messaging) {
            return;
        }

        onMessage(this.messaging, (payload) => {
            console.log('Foreground message received:', payload);

            // Show toast notification
            const notification = payload.notification;
            if (notification) {
                toast(notification.title || 'New notification', {
                    description: notification.body,
                    icon: notification.icon || '🔔',
                    duration: 5000,
                });
            }

            // Show browser notification if permission granted
            if (Notification.permission === 'granted') {
                this.showBrowserNotification(
                    notification?.title || 'FamilyTracker',
                    notification?.body || 'You have a new notification',
                    notification?.icon,
                    payload.data
                );
            }
        });
    }

    /**
     * Show browser notification
     */
    private showBrowserNotification(
        title: string,
        body: string,
        icon?: string,
        data?: any
    ): void {
        if (Notification.permission !== 'granted') {
            return;
        }

        const notification = new Notification(title, {
            body,
            icon: icon || '/logo192.png',
            badge: '/favicon.ico',
            tag: data?.type || 'default',
            data,
            requireInteraction: false,
        });

        notification.onclick = () => {
            window.focus();
            notification.close();

            // Navigate based on notification type
            if (data?.type === 'task') {
                window.location.href = '/tasks';
            } else if (data?.type === 'message') {
                window.location.href = '/messages';
            } else if (data?.type === 'geofence') {
                window.location.href = '/map';
            } else if (data?.type === 'approval') {
                window.location.href = '/tasks/pending-approvals';
            }
        };
    }

    /**
     * Delete FCM token from Firestore
     */
    async deleteToken(): Promise<void> {
        try {
            const auth = getAuth();
            if (!auth.currentUser) {
                return;
            }

            const userId = auth.currentUser.uid;
            const tokenRef = doc(db, 'users', userId, 'tokens', 'fcm');
            const tokenDoc = await getDoc(tokenRef);

            if (tokenDoc.exists()) {
                await setDoc(tokenRef, {
                    token: null,
                    deletedAt: new Date(),
                }, { merge: true });
            }

            this.token = null;
            console.log('FCM token deleted');
        } catch (error) {
            console.error('Error deleting FCM token:', error);
        }
    }

    /**
     * Get current token
     */
    getCurrentToken(): string | null {
        return this.token;
    }
}

// Export singleton instance
export const notificationService = new NotificationService();

