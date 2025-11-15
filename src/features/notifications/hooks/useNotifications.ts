/**
 * useNotifications Hook
 * 
 * React hook for managing push notifications
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { notificationService } from '@/lib/services/notification-service';

export const useNotifications = () => {
    const { user, isAuthenticated } = useAuth();
    const [isSupported, setIsSupported] = useState(false);
    const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
    const [isEnabled, setIsEnabled] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsSupported(notificationService.isSupported());
        setPermissionStatus(notificationService.getPermissionStatus());
        setIsEnabled(permissionStatus === 'granted');
    }, [permissionStatus]);

    useEffect(() => {
        if (isAuthenticated && isSupported && permissionStatus === 'granted') {
            // Set up foreground listener
            notificationService.setupForegroundListener();

            // Get token if not already set
            notificationService.getToken().catch(console.error);
        }
    }, [isAuthenticated, isSupported, permissionStatus]);

    const requestPermission = async (): Promise<boolean> => {
        setIsLoading(true);
        try {
            const granted = await notificationService.requestPermission();
            if (granted) {
                setPermissionStatus('granted');
                setIsEnabled(true);
            } else {
                setPermissionStatus(notificationService.getPermissionStatus());
                setIsEnabled(false);
            }
            return granted;
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            setPermissionStatus(notificationService.getPermissionStatus());
            setIsEnabled(false);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const disableNotifications = async (): Promise<void> => {
        setIsLoading(true);
        try {
            await notificationService.deleteToken();
            setPermissionStatus(notificationService.getPermissionStatus());
            setIsEnabled(false);
        } catch (error) {
            console.error('Error disabling notifications:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isSupported,
        permissionStatus,
        isEnabled,
        isLoading,
        requestPermission,
        disableNotifications,
    };
};

