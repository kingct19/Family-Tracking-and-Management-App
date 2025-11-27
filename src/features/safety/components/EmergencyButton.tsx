/**
 * EmergencyButton Component
 * 
 * SOS/Emergency button for sending emergency alerts to family members
 * - Fixed position floating button
 * - Sends location with alert
 * - Triggers push notifications to all hub members
 */

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { FiAlertCircle } from 'react-icons/fi';
import { createEmergencyAlert } from '../api/emergency-api';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useHubStore } from '@/lib/store/hub-store';
import { useUserLocation } from '@/features/location/hooks/useLocation';
import toast from 'react-hot-toast';

export const EmergencyButton = () => {
    const { user } = useAuth();
    const { currentHub } = useHubStore();
    const { currentLocation } = useUserLocation();
    const [isPressed, setIsPressed] = useState(false);

    const emergencyMutation = useMutation({
        mutationFn: async () => {
            if (!currentHub || !user || !currentLocation) {
                throw new Error('Missing required data for emergency alert');
            }

            const response = await createEmergencyAlert({
                hubId: currentHub.id,
                userId: user.id,
                location: {
                    latitude: currentLocation.latitude,
                    longitude: currentLocation.longitude,
                    address: undefined, // Will be geocoded by Cloud Function if needed
                },
                type: 'sos',
            });

            if (!response.success) {
                throw new Error(response.error || 'Failed to send emergency alert');
            }

            return response.data;
        },
        onSuccess: () => {
            toast.success('Emergency alert sent to your family!', {
                duration: 5000,
                icon: '🚨',
            });
        },
        onError: (error: any) => {
            toast.error(`Failed to send emergency alert: ${error.message}`, {
                duration: 5000,
            });
        },
    });

    const handleEmergency = () => {
        if (!currentLocation) {
            toast.error('Location not available. Please enable location sharing.');
            return;
        }

        if (
            confirm(
                'Send emergency SOS alert to your family?\n\nThis will notify all members of your hub with your current location.'
            )
        ) {
            emergencyMutation.mutate();
        }
    };

    // Don't render if no location or no hub
    if (!currentHub || !currentLocation) {
        return null;
    }

    return (
        <button
            onClick={handleEmergency}
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            onMouseLeave={() => setIsPressed(false)}
            onTouchStart={() => setIsPressed(true)}
            onTouchEnd={() => setIsPressed(false)}
            disabled={emergencyMutation.isPending}
            className={`
                fixed bottom-24 right-6 z-50
                w-16 h-16 rounded-full
                bg-red-600 text-white
                shadow-2xl
                flex items-center justify-center
                transition-all duration-200
                ${isPressed ? 'scale-90' : 'scale-100'}
                ${emergencyMutation.isPending ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700 active:bg-red-800'}
                focus:outline-none focus:ring-4 focus:ring-red-300
                touch-target
            `}
            aria-label="Emergency SOS - Send alert to family"
            title="Emergency SOS"
        >
            {emergencyMutation.isPending ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
                <FiAlertCircle size={28} />
            )}
        </button>
    );
};


