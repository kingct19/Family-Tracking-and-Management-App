/**
 * Hook to fetch hub members with their display names
 */

import { useQuery } from '@tanstack/react-query';
import { getHubMembers } from '@/lib/api/hub-api';
import { getUserProfile } from '@/features/auth/api/auth-api';
import { useHubStore } from '@/lib/store/hub-store';

export interface HubMember {
    userId: string;
    displayName: string;
    email: string;
    photoURL?: string;
    role: 'admin' | 'member' | 'observer';
    status: 'active' | 'inactive';
}

export const useHubMembers = () => {
    const { currentHub } = useHubStore();

    return useQuery({
        queryKey: ['hub-members', currentHub?.id],
        queryFn: async () => {
            if (!currentHub) throw new Error('No hub selected');

            // Get memberships
            const membershipsResponse = await getHubMembers(currentHub.id);
            if (!membershipsResponse.success || !membershipsResponse.data) {
                throw new Error(membershipsResponse.error || 'Failed to fetch members');
            }

            // Fetch user profiles for each member
            const members: HubMember[] = [];
            for (const membership of membershipsResponse.data) {
                if (membership.status === 'active') {
                    try {
                        const userResponse = await getUserProfile(membership.userId);
                        if (userResponse.success && userResponse.data) {
                            members.push({
                                userId: membership.userId,
                                displayName: userResponse.data.displayName || userResponse.data.email.split('@')[0],
                                email: userResponse.data.email,
                                photoURL: userResponse.data.photoURL,
                                role: membership.role,
                                status: membership.status,
                            });
                        }
                    } catch (error) {
                        console.error(`Failed to fetch profile for user ${membership.userId}:`, error);
                        // Add member with minimal info if profile fetch fails
                        members.push({
                            userId: membership.userId,
                            displayName: `User ${membership.userId.slice(0, 8)}`,
                            email: '',
                            role: membership.role,
                            status: membership.status,
                        });
                    }
                }
            }

            return members;
        },
        enabled: !!currentHub,
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
};

