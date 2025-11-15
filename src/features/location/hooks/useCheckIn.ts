/**
 * useCheckIn Hook
 * 
 * React hook for location check-ins
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createCheckIn, getUserCheckIns, getHubCheckIns, type CreateCheckInRequest } from '../api/checkin-api';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useHubStore } from '@/lib/store/hub-store';
import { getAddressFromCoordinates } from '@/lib/services/geocoding-service';
import toast from 'react-hot-toast';

/**
 * Hook for creating check-ins
 */
export const useCreateCheckIn = () => {
    const { user } = useAuth();
    const { currentHub } = useHubStore();
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (data: Omit<CreateCheckInRequest, 'hubId' | 'userId' | 'userName' | 'address'>) => {
            if (!currentHub?.id || !user?.id) {
                throw new Error('No hub or user selected');
            }

            // Try to get address from coordinates (optional, won't fail if it doesn't work)
            let address: string | undefined;
            try {
                address = await getAddressFromCoordinates(
                    data.coordinates.latitude,
                    data.coordinates.longitude
                );
            } catch (error) {
                // Address lookup failed - continue without it
                console.warn('Failed to get address:', error);
            }

            return createCheckIn({
                ...data,
                address,
                hubId: currentHub.id,
                userId: user.id,
                userName: user.email?.split('@')[0] || user.displayName || 'User',
            });
        },
        onSuccess: (result) => {
            if (result.success) {
                // Invalidate check-in queries
                queryClient.invalidateQueries({ queryKey: ['checkIns', currentHub?.id] });
                queryClient.invalidateQueries({ queryKey: ['checkIns', currentHub?.id, user?.id] });
                toast.success('Checked in successfully!');
            } else {
                toast.error(result.error || 'Failed to check in');
            }
        },
        onError: (error) => {
            console.error('Error creating check-in:', error);
            toast.error('Failed to check in');
        },
    });

    return {
        createCheckIn: mutation.mutate,
        createCheckInAsync: mutation.mutateAsync,
        isCheckingIn: mutation.isPending,
        error: mutation.error,
    };
};

/**
 * Hook for getting user check-ins
 */
export const useUserCheckIns = (userId?: string, limitCount: number = 50) => {
    const { currentHub } = useHubStore();
    const { user } = useAuth();

    const targetUserId = userId || user?.id;

    return useQuery({
        queryKey: ['checkIns', currentHub?.id, targetUserId],
        queryFn: async () => {
            if (!currentHub?.id || !targetUserId) {
                return { success: false, data: [], error: 'No hub or user selected' };
            }
            return getUserCheckIns(currentHub.id, targetUserId, limitCount);
        },
        enabled: !!currentHub?.id && !!targetUserId,
        select: (data) => data.success ? data.data : [],
    });
};

/**
 * Hook for getting hub check-ins
 */
export const useHubCheckIns = (limitCount: number = 100) => {
    const { currentHub } = useHubStore();

    return useQuery({
        queryKey: ['checkIns', currentHub?.id],
        queryFn: async () => {
            if (!currentHub?.id) {
                return { success: false, data: [], error: 'No hub selected' };
            }
            return getHubCheckIns(currentHub.id, limitCount);
        },
        enabled: !!currentHub?.id,
        select: (data) => data.success ? data.data : [],
    });
};

