/**
 * Hook to fetch hub members with their display names
 * Uses real-time subscription to automatically update when members join/leave
 */

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getHubMembers, subscribeToHubMembers } from '@/lib/api/hub-api';
import { getUserProfile } from '@/features/auth/api/auth-api';
import { useHubStore } from '@/lib/store/hub-store';
import type { Membership } from '@/types';

export interface HubMember {
    userId: string;
    displayName: string;
    email: string;
    photoURL?: string;
    role: 'admin' | 'member' | 'observer';
    status: 'active' | 'inactive';
}

// Helper to enrich memberships with user profile data
const enrichMemberships = async (memberships: Membership[]): Promise<HubMember[]> => {
    const members: HubMember[] = [];
    
    // Process active memberships in parallel for better performance
    const activeMemberships = memberships.filter(m => m.status === 'active');
    
    await Promise.all(
        activeMemberships.map(async (membership) => {
            try {
                const userResponse = await getUserProfile(membership.userId);
                if (userResponse.success && userResponse.data) {
                        members.push({
                            userId: membership.userId,
                            displayName: userResponse.data.displayName || userResponse.data.email.split('@')[0],
                            email: userResponse.data.email,
                            photoURL: userResponse.data.photoURL,
                            role: membership.role,
                            status: membership.status === 'active' ? 'active' : 'inactive',
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
                            status: membership.status === 'active' ? 'active' : 'inactive',
                        });
            }
        })
    );
    
    return members;
};

export const useHubMembers = () => {
    const { currentHub } = useHubStore();
    const [members, setMembers] = useState<HubMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Initial query for loading memberships
    const { data: initialMemberships, isLoading: isQueryLoading } = useQuery({
        queryKey: ['hub-members', currentHub?.id],
        queryFn: async () => {
            if (!currentHub) throw new Error('No hub selected');
            const membershipsResponse = await getHubMembers(currentHub.id);
            if (!membershipsResponse.success || !membershipsResponse.data) {
                throw new Error(membershipsResponse.error || 'Failed to fetch members');
            }
            return membershipsResponse.data;
        },
        enabled: !!currentHub,
        staleTime: 30 * 1000, // 30 seconds - shorter for faster initial updates
    });

    // Real-time subscription for membership changes
    useEffect(() => {
        if (!currentHub) {
            setMembers([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        // Subscribe to real-time membership updates
        const unsubscribe = subscribeToHubMembers(
            currentHub.id,
            async (updatedMemberships) => {
                // Enrich with user profiles whenever memberships change
                const enriched = await enrichMemberships(updatedMemberships);
                setMembers(enriched);
                setIsLoading(false);
            },
            (error) => {
                console.error('Hub members subscription error:', error);
                setIsLoading(false);
            }
        );

        return unsubscribe;
    }, [currentHub?.id]);

    return {
        data: members,
        isLoading: isLoading || isQueryLoading,
    };
};

