/**
 * useLocation Hook
 * 
 * React hook for managing location tracking and real-time updates
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { locationService, type LocationCoordinates } from '../services/location-service';
import {
    updateUserLocation,
    getHubLocations,
    subscribeToHubLocations,
    updateLocationSharing,
    type UserLocation,
} from '../api/location-api';
import {
    getUserPreferences,
    updateLocationPermission,
    updateLocationSharingPreference,
} from '@/lib/api/user-preferences-api';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useHubStore } from '@/lib/store/hub-store';
import toast from 'react-hot-toast';

/**
 * Hook for tracking current user's location
 */
export const useUserLocation = () => {
    const { user } = useAuth();
    const { currentHub } = useHubStore();
    const [currentLocation, setCurrentLocation] = useState<LocationCoordinates | null>(null);
    const [isSharing, setIsSharing] = useState(true); // Default to true (Life360 style)
    const [error, setError] = useState<string | null>(null);
    const [isWatching, setIsWatching] = useState(false);

    // On mount, load user preferences and sync with location service
    useEffect(() => {
        const isAlreadyWatching = locationService.getWatchingStatus();
        if (isAlreadyWatching) {
            console.log('🔄 Syncing with existing location service');
            setIsWatching(true);

            // Get last known position from service (instant, no timeout!)
            const lastPosition = locationService.getLastKnownPosition();
            if (lastPosition) {
                console.log('📍 Restored location from service:', lastPosition);
                setCurrentLocation(lastPosition);
            } else {
                console.log('⏳ Waiting for first location update...');
            }
        }

        // Load user's sharing preference from Firestore
        if (user) {
            getUserPreferences(user.id).then((result) => {
                if (result.success && result.data) {
                    setIsSharing(result.data.isSharingLocation ?? true); // Default true if not set
                }
            });
        }
    }, [user]);

    // Mutation for updating location in Firestore
    const updateMutation = useMutation({
        mutationFn: (coordinates: LocationCoordinates) => {
            if (!user || !currentHub) {
                throw new Error('User or hub not available');
            }
            return updateUserLocation({
                hubId: currentHub.id,
                userId: user.id,
                coordinates,
                isSharing,
            });
        },
    });

    // Start tracking location
    const startTracking = useCallback(async () => {
        if (!locationService.isSupported()) {
            setError('Geolocation is not supported by your browser');
            toast.error('Geolocation is not supported');
            return;
        }

        // Check if already watching
        if (locationService.getWatchingStatus()) {
            console.log('Location tracking already active');
            setIsWatching(true);
            return;
        }

        // Request permission
        const hasPermission = await locationService.requestPermission();
        if (!hasPermission) {
            setError('Location permission denied');
            toast.error('Please enable location permissions in your browser');

            // Store permission denial
            if (user) {
                await updateLocationPermission(user.id, false);
            }
            return;
        }

        // Store permission grant
        if (user) {
            await updateLocationPermission(user.id, true);
        }

        // Start watching position
        locationService.startWatching(
            (location) => {
                console.log('📍 Location update received:', location);
                setCurrentLocation(location);
                setError(null);

                // Update Firestore every time location changes (throttled by service)
                if (isSharing && user && currentHub) {
                    updateMutation.mutate(location);
                }
            },
            (error) => {
                console.error('❌ Location error:', error);
                setError(error.message);
                toast.error(error.message);
            }
        );

        setIsWatching(true);
        console.log('✅ Location tracking started');
    }, [isSharing, user, currentHub, updateMutation]);

    // Stop tracking location
    const stopTracking = useCallback(() => {
        locationService.stopWatching();
        setIsWatching(false);
    }, []);

    // Toggle location sharing
    const toggleSharing = useCallback(async () => {
        if (!user || !currentHub) return;

        const newValue = !isSharing;
        setIsSharing(newValue);

        // Update in Firestore location collection
        const result = await updateLocationSharing(currentHub.id, user.id, newValue);

        // Also update in user preferences
        await updateLocationSharingPreference(user.id, newValue);

        if (result.success) {
            toast.success(newValue ? 'Location sharing enabled' : 'Location sharing disabled');
        } else {
            toast.error('Failed to update sharing preference');
            setIsSharing(!newValue); // Revert on error
        }
    }, [isSharing, user, currentHub]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (isWatching) {
                locationService.stopWatching();
            }
        };
    }, [isWatching]);

    return {
        currentLocation,
        isSharing,
        isWatching,
        error,
        startTracking,
        stopTracking,
        toggleSharing,
    };
};

/**
 * Hook for fetching hub member locations
 */
export const useHubLocations = (hubId: string | undefined) => {
    const [locations, setLocations] = useState<UserLocation[]>([]);

    // Query for initial load
    const { data, isLoading, error } = useQuery({
        queryKey: ['locations', hubId],
        queryFn: async () => {
            if (!hubId) throw new Error('Hub ID is required');
            const response = await getHubLocations(hubId);
            if (!response.success) throw new Error(response.error);
            return response.data || [];
        },
        enabled: !!hubId,
        staleTime: 10000, // 10 seconds
    });

    // Subscribe to real-time updates
    useEffect(() => {
        if (!hubId) return;

        const unsubscribe = subscribeToHubLocations(
            hubId,
            (updatedLocations) => {
                setLocations(updatedLocations);
            },
            (error) => {
                console.error('Location subscription error:', error);
            }
        );

        return unsubscribe;
    }, [hubId]);

    // Use real-time locations if available, otherwise fallback to query data
    const finalLocations = locations.length > 0 ? locations : (data || []);

    return {
        locations: finalLocations,
        isLoading,
        error,
    };
};

/**
 * Hook for calculating distance between two points
 */
export const useDistance = (
    coord1: { latitude: number; longitude: number } | null,
    coord2: { latitude: number; longitude: number } | null
) => {
    const [distance, setDistance] = useState<number | null>(null);

    useEffect(() => {
        if (coord1 && coord2) {
            const dist = locationService.calculateDistance(coord1, coord2);
            setDistance(dist);
        } else {
            setDistance(null);
        }
    }, [coord1, coord2]);

    return distance;
};

