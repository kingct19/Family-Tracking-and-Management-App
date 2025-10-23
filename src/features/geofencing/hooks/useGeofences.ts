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
        queryFn: () => {
            if (!currentHub?.id) throw new Error('No hub selected');
            return getGeofences(currentHub.id);
        },
        enabled: !!currentHub?.id,
        select: (data) => data.success ? data.data : [],
    });

    // Create geofence mutation
    const createMutation = useMutation({
        mutationFn: async (data: CreateGeofenceRequest) => {
            if (!currentHub?.id || !user?.id) {
                throw new Error('No hub or user selected');
            }
            return createGeofence(currentHub.id, user.id, data);
        },
        onSuccess: (result) => {
            if (result.success) {
                queryClient.invalidateQueries({ queryKey: ['geofences', currentHub?.id] });
                toast.success('Geofence created successfully');
            } else {
                toast.error(result.error || 'Failed to create geofence');
            }
        },
        onError: (error) => {
            console.error('Error creating geofence:', error);
            toast.error('Failed to create geofence');
        },
    });

    // Update geofence mutation
    const updateMutation = useMutation({
        mutationFn: async (data: UpdateGeofenceRequest) => {
            if (!currentHub?.id) {
                throw new Error('No hub selected');
            }
            return updateGeofence(currentHub.id, data.id, data);
        },
        onSuccess: (result) => {
            if (result.success) {
                queryClient.invalidateQueries({ queryKey: ['geofences', currentHub?.id] });
                toast.success('Geofence updated successfully');
            } else {
                toast.error(result.error || 'Failed to update geofence');
            }
        },
        onError: (error) => {
            console.error('Error updating geofence:', error);
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
            if (result.success) {
                queryClient.invalidateQueries({ queryKey: ['geofences', currentHub?.id] });
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
        (data: CreateGeofenceRequest) => {
            createMutation.mutate(data);
        },
        [createMutation]
    );

    const updateGeofenceHandler = useCallback(
        (data: UpdateGeofenceRequest) => {
            updateMutation.mutate(data);
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
