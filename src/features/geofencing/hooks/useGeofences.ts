/**
 * useGeofences Hook
 * 
 * React hook for managing geofences
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useHubStore } from '@/lib/store/hub-store';
import { useAuth } from '@/features/auth/hooks/useAuth';
import {
    getGeofences,
    createGeofence,
    updateGeofence,
    deleteGeofence,
    type CreateGeofenceRequest,
    type UpdateGeofenceRequest,
} from '../api/geofence-api';
import type { GeofenceZone } from '../types';
import toast from 'react-hot-toast';

/**
 * Hook for managing geofences
 */
export const useGeofences = () => {
    const { user } = useAuth();
    const { currentHub } = useHubStore();
    const queryClient = useQueryClient();

    // Query for geofences
    const {
        data: geofences = [],
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: ['geofences', currentHub?.id],
        queryFn: async () => {
            if (!currentHub?.id) {
                console.log('[useGeofences] Query skipped - no hub selected');
                throw new Error('No hub selected');
            }
            console.log('[useGeofences] Fetching geofences for hub:', currentHub.id);
            const result = await getGeofences(currentHub.id);
            console.log('[useGeofences] Query result:', result);
            if (result.success) {
                console.log('[useGeofences] Geofences fetched:', result.data.length, 'geofences');
            } else {
                console.error('[useGeofences] Query failed:', result.error);
            }
            return result;
        },
        enabled: !!currentHub?.id,
        select: (data) => {
            const selected = data.success ? data.data : [];
            console.log('[useGeofences] Query select - geofences count:', selected.length);
            return selected;
        },
    });

    // Create geofence mutation
    const createMutation = useMutation({
        mutationFn: async (data: CreateGeofenceRequest) => {
            if (!currentHub?.id || !user?.id) {
                throw new Error('No hub or user selected');
            }
            console.log('[useGeofences] Creating geofence:', { hubId: currentHub.id, userId: user.id, data });
            const result = await createGeofence(currentHub.id, user.id, data);
            console.log('[useGeofences] Create geofence result:', result);
            return result;
        },
        onSuccess: (result) => {
            console.log('[useGeofences] Mutation onSuccess called:', { result, hubId: currentHub?.id });
            if (result.success) {
                const queryKey = ['geofences', currentHub?.id];
                console.log('[useGeofences] Invalidating queries with key:', queryKey);
                // Invalidate and refetch immediately
                queryClient.invalidateQueries({ queryKey });
                // Also explicitly refetch to ensure immediate update
                queryClient.refetchQueries({ queryKey }).then(() => {
                    console.log('[useGeofences] Query refetched successfully');
                }).catch((error) => {
                    console.error('[useGeofences] Error refetching query:', error);
                });
                toast.success('Geofence created successfully');
            } else {
                console.error('[useGeofences] Failed to create geofence:', result.error);
                toast.error(result.error || 'Failed to create geofence');
            }
        },
        onError: (error) => {
            console.error('[useGeofences] Error creating geofence:', error);
            toast.error('Failed to create geofence');
        },
    });

    // Update geofence mutation
    const updateMutation = useMutation({
        mutationFn: async (data: UpdateGeofenceRequest) => {
            if (!currentHub?.id) {
                throw new Error('No hub selected');
            }
            console.log('[useGeofences] Updating geofence:', { hubId: currentHub.id, data });
            const result = await updateGeofence(currentHub.id, data.id, data);
            console.log('[useGeofences] Update geofence result:', result);
            return result;
        },
        onSuccess: (result) => {
            console.log('[useGeofences] Update mutation onSuccess called:', { result, hubId: currentHub?.id });
            if (result.success) {
                const queryKey = ['geofences', currentHub?.id];
                console.log('[useGeofences] Invalidating queries with key:', queryKey);
                queryClient.invalidateQueries({ queryKey });
                queryClient.refetchQueries({ queryKey }).then(() => {
                    console.log('[useGeofences] Query refetched successfully');
                }).catch((error) => {
                    console.error('[useGeofences] Error refetching query:', error);
                });
                toast.success('Geofence updated successfully');
            } else {
                console.error('[useGeofences] Failed to update geofence:', result.error);
                toast.error(result.error || 'Failed to update geofence');
            }
        },
        onError: (error) => {
            console.error('[useGeofences] Error updating geofence:', error);
            toast.error('Failed to update geofence');
        },
    });

    // Delete geofence mutation
    const deleteMutation = useMutation({
        mutationFn: async (geofenceId: string) => {
            if (!currentHub?.id) {
                throw new Error('No hub selected');
            }
            return deleteGeofence(currentHub.id, geofenceId);
        },
        onSuccess: (result) => {
            console.log('[useGeofences] Delete mutation onSuccess called:', { result, hubId: currentHub?.id });
            if (result.success) {
                const queryKey = ['geofences', currentHub?.id];
                console.log('[useGeofences] Invalidating queries with key:', queryKey);
                queryClient.invalidateQueries({ queryKey });
                queryClient.refetchQueries({ queryKey }).then(() => {
                    console.log('[useGeofences] Query refetched successfully');
                }).catch((error) => {
                    console.error('[useGeofences] Error refetching query:', error);
                });
                toast.success('Geofence deleted successfully');
            } else {
                toast.error(result.error || 'Failed to delete geofence');
            }
        },
        onError: (error) => {
            console.error('Error deleting geofence:', error);
            toast.error('Failed to delete geofence');
        },
    });

    // Helper functions
    const createGeofenceHandler = useCallback(
        async (data: CreateGeofenceRequest) => {
            try {
                const result = await createMutation.mutateAsync(data);
                if (!result.success) {
                    throw new Error(result.error || 'Failed to create geofence');
                }
                return result;
            } catch (error) {
                console.error('[useGeofences] Error in createGeofenceHandler:', error);
                throw error;
            }
        },
        [createMutation]
    );

    const updateGeofenceHandler = useCallback(
        async (data: UpdateGeofenceRequest) => {
            try {
                const result = await updateMutation.mutateAsync(data);
                if (!result.success) {
                    throw new Error(result.error || 'Failed to update geofence');
                }
                return result;
            } catch (error) {
                console.error('[useGeofences] Error in updateGeofenceHandler:', error);
                throw error;
            }
        },
        [updateMutation]
    );

    const deleteGeofenceHandler = useCallback(
        (geofenceId: string) => {
            if (window.confirm('Are you sure you want to delete this geofence?')) {
                deleteMutation.mutate(geofenceId);
            }
        },
        [deleteMutation]
    );

    return {
        geofences,
        isLoading,
        error,
        refetch,
        createGeofence: createGeofenceHandler,
        updateGeofence: updateGeofenceHandler,
        deleteGeofence: deleteGeofenceHandler,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
};

/**
 * Hook for geofence detection
 */
export const useGeofenceDetection = () => {
    const [detectionResults, setDetectionResults] = useState<any[]>([]);

    const addDetectionResult = useCallback((result: any) => {
        setDetectionResults(prev => [result, ...prev.slice(0, 49)]); // Keep last 50 results
    }, []);

    const clearDetectionResults = useCallback(() => {
        setDetectionResults([]);
    }, []);

    return {
        detectionResults,
        addDetectionResult,
        clearDetectionResults,
    };
};
