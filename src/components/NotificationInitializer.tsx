/**
 * NotificationInitializer Component
 * 
 * Initializes push notifications when user is authenticated
 */

import { useEffect } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { notificationService } from '@/lib/services/notification-service';

export const NotificationInitializer = () => {
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated && notificationService.isSupported()) {
            // Set up foreground message listener
            notificationService.setupForegroundListener();

            // If permission is already granted, get token
            if (notificationService.getPermissionStatus() === 'granted') {
                notificationService.getToken().catch(console.error);
            }
        }
    }, [isAuthenticated]);

    return null; // This component doesn't render anything
};

