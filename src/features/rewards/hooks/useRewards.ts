/**
 * Rewards hooks for fetching and managing rewards
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useHubStore } from '@/lib/store/hub-store';
import { useAuth } from '@/features/auth/hooks/useAuth';
import {
    getHubRewards,
    getUserRewards,
    createReward,
    updateReward,
    deleteReward,
    unlockReward,
    claimReward,
    checkAndUnlockRewards,
} from '../api/rewards-api';
import type { Reward, UserReward, RewardType } from '@/types';

/**
 * Hook to fetch all rewards for the current hub
 */
export const useHubRewards = () => {
    const { currentHub } = useHubStore();

    return useQuery({
        queryKey: ['rewards', currentHub?.id],
        queryFn: async () => {
            if (!currentHub) throw new Error('No hub selected');
            const response = await getHubRewards(currentHub.id);
            if (!response.success) throw new Error(response.error);
            return response.data || [];
        },
        enabled: !!currentHub,
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
};

/**
 * Hook to fetch user's unlocked/claimed rewards
 */
export const useUserRewards = () => {
    const { currentHub } = useHubStore();
    const { user } = useAuth();

    return useQuery({
        queryKey: ['userRewards', currentHub?.id, user?.id],
        queryFn: async () => {
            if (!currentHub || !user) throw new Error('No hub or user');
            const response = await getUserRewards(currentHub.id, user.id);
            if (!response.success) throw new Error(response.error);
            return response.data || [];
        },
        enabled: !!currentHub && !!user,
        staleTime: 1 * 60 * 1000, // 1 minute
    });
};

/**
 * Combined hook for rewards with user progress
 */
export const useRewardsWithProgress = () => {
    const { data: rewards = [], isLoading: rewardsLoading } = useHubRewards();
    const { data: userRewards = [], isLoading: userRewardsLoading } = useUserRewards();
    const { user } = useAuth();

    // Create a map of unlocked rewards
    const unlockedMap = new Map(userRewards.map(ur => [ur.rewardId, ur]));

    // Enrich rewards with user progress
    const enrichedRewards = rewards.map(reward => ({
        ...reward,
        isUnlocked: unlockedMap.has(reward.id),
        isClaimed: unlockedMap.get(reward.id)?.claimedAt != null,
        userRewardId: unlockedMap.get(reward.id)?.id,
        unlockedAt: unlockedMap.get(reward.id)?.unlockedAt,
        claimedAt: unlockedMap.get(reward.id)?.claimedAt,
    }));

    // Stats
    const totalRewards = rewards.filter(r => r.isActive).length;
    const unlockedCount = userRewards.length;
    const unclaimedCount = userRewards.filter(ur => !ur.claimedAt).length;

    return {
        rewards: enrichedRewards,
        userRewards,
        isLoading: rewardsLoading || userRewardsLoading,
        stats: {
            total: totalRewards,
            unlocked: unlockedCount,
            unclaimed: unclaimedCount,
            progress: totalRewards > 0 ? Math.round((unlockedCount / totalRewards) * 100) : 0,
        },
    };
};

/**
 * Hook for creating a new reward (admin only)
 */
export const useCreateReward = () => {
    const queryClient = useQueryClient();
    const { currentHub } = useHubStore();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async (data: {
            title: string;
            description: string;
            icon: string;
            imageURL?: string;
            type: RewardType;
            threshold: number;
        }) => {
            if (!currentHub || !user) throw new Error('No hub or user');
            const response = await createReward(currentHub.id, {
                ...data,
                createdBy: user.id,
            });
            if (!response.success) throw new Error(response.error);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rewards', currentHub?.id] });
        },
    });
};

/**
 * Hook for updating a reward (admin only)
 */
export const useUpdateReward = () => {
    const queryClient = useQueryClient();
    const { currentHub } = useHubStore();

    return useMutation({
        mutationFn: async ({
            rewardId,
            updates,
        }: {
            rewardId: string;
            updates: Partial<Pick<Reward, 'title' | 'description' | 'icon' | 'type' | 'threshold' | 'isActive'>> & {
                imageURL?: string | null;
            };
        }) => {
            const response = await updateReward(rewardId, updates);
            if (!response.success) throw new Error(response.error);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rewards', currentHub?.id] });
        },
    });
};

/**
 * Hook for deleting a reward (admin only)
 */
export const useDeleteReward = () => {
    const queryClient = useQueryClient();
    const { currentHub } = useHubStore();

    return useMutation({
        mutationFn: async (rewardId: string) => {
            const response = await deleteReward(rewardId);
            if (!response.success) throw new Error(response.error);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rewards', currentHub?.id] });
        },
    });
};

/**
 * Hook for claiming a reward
 */
export const useClaimReward = () => {
    const queryClient = useQueryClient();
    const { currentHub } = useHubStore();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async (userRewardId: string) => {
            const response = await claimReward(userRewardId);
            if (!response.success) throw new Error(response.error);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userRewards', currentHub?.id, user?.id] });
        },
    });
};

/**
 * Hook to check and unlock any new rewards
 */
export const useCheckRewards = () => {
    const queryClient = useQueryClient();
    const { currentHub } = useHubStore();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async (stats: {
            xpTotal: number;
            tasksCompleted: number;
            currentStreak: number;
        }) => {
            if (!currentHub || !user) throw new Error('No hub or user');
            const response = await checkAndUnlockRewards(currentHub.id, user.id, stats);
            if (!response.success) throw new Error(response.error);
            return response.data || [];
        },
        onSuccess: (newRewards) => {
            if (newRewards.length > 0) {
                queryClient.invalidateQueries({ queryKey: ['userRewards', currentHub?.id, user?.id] });
            }
        },
    });
};

