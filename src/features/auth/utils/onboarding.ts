/**
 * Onboarding Utilities
 * 
 * Helps set up new users with a default hub
 */

import { createHub, getUserHubs } from '@/lib/api/hub-api';
import { useHubStore } from '@/lib/store/hub-store';

/**
 * Check if user has hubs, if not create a default one
 */
export const ensureUserHasHub = async (userId: string, userName?: string): Promise<void> => {
    try {
        // Check if user already has hubs
        const hubsResponse = await getUserHubs(userId);

        if (hubsResponse.success && hubsResponse.data && hubsResponse.data.length > 0) {
            // User has hubs - only set first one if no hub is currently selected
            // This prevents overwriting user's hub selection
            const hubStore = useHubStore.getState();
            if (!hubStore.currentHub) {
                const firstHub = hubsResponse.data[0];
                // Don't set hub here - let useAuth hook handle it properly with role fetching
            }
            return;
        }

        // User has no hubs, create a default one
        const displayName = userName || 'My Family';
        const hubName = `${displayName}'s Hub`;

        const createResponse = await createHub({
            name: hubName,
            description: 'My family hub for staying connected',
            featureToggles: {
                location: true,
                tasks: true,
                chat: true,
                vault: true,
                xp: true,
                leaderboard: true,
                geofencing: true,
                deviceMonitoring: true,
            },
        }, userId);

        if (createResponse.success && createResponse.data) {
            // Set as current hub
            const hubStore = useHubStore.getState();
            hubStore.setCurrentHub(createResponse.data, 'admin');
        } else {
            console.error('Failed to create default hub:', createResponse.error);
        }
    } catch (error) {
        console.error('Error in ensureUserHasHub:', error);
        // Don't throw - let the app continue even if hub creation fails
    }
};

