/**
 * Service Worker Registration
 * 
 * Registers the service worker for PWA and push notifications
 */

export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
    if ('serviceWorker' in navigator) {
        try {
            // Register the main service worker (handled by VitePWA)
            // The firebase-messaging-sw.js will be registered separately by Firebase
            
            // Check if service worker is already registered
            const registration = await navigator.serviceWorker.ready;
            console.log('Service Worker already registered');
            return registration;
        } catch (error) {
            console.warn('Service Worker registration failed:', error);
            return null;
        }
    } else {
        console.warn('Service Workers are not supported');
        return null;
    }
};

/**
 * Register Firebase Messaging Service Worker
 */
export const registerFirebaseMessagingSW = async (): Promise<ServiceWorkerRegistration | null> => {
    if ('serviceWorker' in navigator) {
        try {
            // Register Firebase Messaging service worker
            const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
                scope: '/',
            });
            
            console.log('Firebase Messaging Service Worker registered:', registration);
            return registration;
        } catch (error) {
            console.warn('Firebase Messaging Service Worker registration failed:', error);
            return null;
        }
    }
    return null;
};

