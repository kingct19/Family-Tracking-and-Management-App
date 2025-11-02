/**
 * useDeviceStatus Hook
 * 
 * React hook for monitoring and updating device status
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { deviceMonitor, type DeviceStatus } from '../services/device-monitor';
import { updateDeviceStatus } from '../api/device-status-api';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useHubStore } from '@/lib/store/hub-store';

export const useDeviceStatus = () => {
    const { user } = useAuth();
    const { currentHub } = useHubStore();
    const [deviceStatus, setDeviceStatus] = useState<DeviceStatus | null>(null);
    const [isMonitoring, setIsMonitoring] = useState(false);
    const lastUpdateTimeRef = useRef<number>(0);
    const userIdRef = useRef<string | null>(null);
    const hubIdRef = useRef<string | null>(null);

    // Update refs when user/hub changes
    useEffect(() => {
        userIdRef.current = user?.id || null;
        hubIdRef.current = currentHub?.id || null;
    }, [user?.id, currentHub?.id]);

    // Mutation for updating device status in Firestore
    const updateMutation = useMutation({
        mutationFn: (status: DeviceStatus) => {
            const userId = userIdRef.current;
            const hubId = hubIdRef.current;
            
            if (!userId || !hubId) {
                throw new Error('User or hub not available');
            }
            return updateDeviceStatus(userId, hubId, status);
        },
        onError: (error) => {
            // Silently fail - don't spam console with permission errors
            // Device status monitoring will work locally even if Firestore write fails
            if (process.env.NODE_ENV === 'development') {
                // Only log in development if it's not a permission error
                const isPermissionError = error instanceof Error && error.message.includes('permission');
                if (!isPermissionError) {
                    console.warn('Device status update failed:', error);
                }
            }
        },
    });

    // Subscribe to device status updates
    useEffect(() => {
        if (!user || !currentHub) {
            return;
        }

        setIsMonitoring(true);

        // Subscribe to device monitor updates
        const unsubscribe = deviceMonitor.subscribe((status) => {
            setDeviceStatus(status);

            // Throttle Firestore updates (max once every 30 seconds)
            const now = Date.now();
            if (now - lastUpdateTimeRef.current > 30000) {
                lastUpdateTimeRef.current = now;
                // Only update if user and hub are still available
                if (userIdRef.current && hubIdRef.current) {
                    updateMutation.mutate(status);
                }
            }
        });

        return () => {
            unsubscribe();
            setIsMonitoring(false);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id, currentHub?.id]); // Only depend on IDs, not full objects

    // Get current status synchronously
    const getCurrentStatus = useCallback(() => {
        return deviceMonitor.getCurrentStatus();
    }, []);

    // Check if battery monitoring is supported
    const isBatterySupported = deviceMonitor.isBatteryMonitoringSupported();

    return {
        deviceStatus,
        isMonitoring,
        isBatterySupported,
        getCurrentStatus,
        isLoading: updateMutation.isPending,
        error: updateMutation.error,
    };
};
