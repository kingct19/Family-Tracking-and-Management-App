/**
 * useDeviceStatus Hook
 * 
 * React hook for monitoring and updating device status
 */

import { useEffect, useState, useCallback } from 'react';
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

    // Mutation for updating device status in Firestore
    const updateMutation = useMutation({
        mutationFn: (status: DeviceStatus) => {
            if (!user || !currentHub) {
                throw new Error('User or hub not available');
            }
            return updateDeviceStatus(user.id, currentHub.id, status);
        },
        onError: (error) => {
            console.error('Failed to update device status:', error);
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

            // Update Firestore with new status (throttled by mutation)
            updateMutation.mutate(status);
        });

        return () => {
            unsubscribe();
            setIsMonitoring(false);
        };
    }, [user, currentHub, updateMutation]);

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
