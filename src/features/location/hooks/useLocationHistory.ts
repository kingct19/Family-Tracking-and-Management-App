/**
 * useLocationHistory Hook
 * 
 * React hook for fetching location history for visualization
 */

import { useQuery } from '@tanstack/react-query';
import { useHubStore } from '@/lib/store/hub-store';
import { getUserLocationHistory } from '../api/location-api';
import type { LocationCoordinates } from '../services/location-service';

export interface LocationHistoryOptions {
    hours?: number;
    limit?: number;
}

/**
 * Hook to fetch location history for a user
 */
export const useLocationHistory = (
    userId: string,
    options: LocationHistoryOptions = {}
) => {
    const { currentHub } = useHubStore();
    const { hours = 24, limit = 500 } = options;

    return useQuery({
        queryKey: ['location-history', currentHub?.id, userId, hours, limit],
        queryFn: async () => {
            if (!currentHub) throw new Error('No hub selected');
            if (!userId) throw new Error('No user ID provided');

            const response = await getUserLocationHistory(
                currentHub.id,
                userId,
                limit
            );

            if (!response.success) throw new Error(response.error);

            // Filter by hours if specified
            if (hours && response.data) {
                const cutoffTime = Date.now() - hours * 60 * 60 * 1000;
                return response.data.filter(
                    (loc) => loc.timestamp >= cutoffTime
                );
            }

            return response.data || [];
        },
        enabled: !!currentHub && !!userId,
        staleTime: 30 * 1000, // 30 seconds
    });
};


