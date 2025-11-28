/**
 * RewardsWidget - Compact rewards preview for dashboard
 * Shows progress towards next reward and recently unlocked rewards
 */

import { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    MdEmojiEvents, 
    MdArrowOutward,
} from 'react-icons/md';
import { useRewardsWithProgress, useClaimReward } from '../hooks/useRewards';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useHubTasks } from '@/features/tasks/hooks/useTasks';
import { RewardCard } from './RewardCard';
import type { RewardType } from '@/types';
import toast from 'react-hot-toast';

export const RewardsWidget = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { rewards, stats, isLoading } = useRewardsWithProgress();
    const { data: tasks = [] } = useHubTasks();
    const claimRewardMutation = useClaimReward();

    // Calculate user stats for progress
    const userStats = useMemo(() => ({
        xpTotal: user?.xpTotal || 0,
        tasksCompleted: tasks.filter(t => 
            t.assignedTo === user?.id && (t.status === 'done' || t.status === 'approved')
        ).length,
        currentStreak: 0, // TODO: Calculate from XP records
    }), [user, tasks]);

    // Get progress value for a reward type
    const getProgressValue = useCallback((type: RewardType) => {
        switch (type) {
            case 'xp': return userStats.xpTotal;
            case 'tasks': return userStats.tasksCompleted;
            case 'streak': return userStats.currentStreak;
        }
    }, [userStats]);

    // Get unclaimed rewards
    const unclaimedRewards = rewards.filter(r => r.isUnlocked && !r.isClaimed);

    // Get up to 5 rewards to display: unclaimed first, then locked (by progress), then claimed
    const displayedRewards = useMemo(() => {
        const activeRewards = rewards.filter(r => r.isActive);
        
        // Start with unclaimed rewards
        const unclaimed = activeRewards.filter(r => r.isUnlocked && !r.isClaimed);
        
        // Get all locked rewards and sort by progress (closest to unlocking first)
        const locked = activeRewards.filter(r => !r.isUnlocked);
        const sortedLocked = locked.sort((a, b) => {
            const progressA = getProgressValue(a.type) / a.threshold;
            const progressB = getProgressValue(b.type) / b.threshold;
            return progressB - progressA;
        });
        
        // Then add other unlocked rewards (already claimed)
        const claimed = activeRewards.filter(r => r.isUnlocked && r.isClaimed);
        
        // Combine: unclaimed first, then locked rewards (up to 5 total)
        const result: typeof rewards = [];
        
        // Add all unclaimed rewards (they're most important)
        result.push(...unclaimed);
        
        // Add locked rewards sorted by progress (closest to unlocking first)
        const remainingForLocked = 5 - result.length;
        if (remainingForLocked > 0) {
            result.push(...sortedLocked.slice(0, remainingForLocked));
        }
        
        // Only add claimed if we still have space and want to show more
        const remainingForClaimed = 5 - result.length;
        if (remainingForClaimed > 0) {
            result.push(...claimed.slice(0, remainingForClaimed));
        }
        
        return result.slice(0, 5);
    }, [rewards, userStats, getProgressValue]);

    const handleClaim = async (reward: typeof rewards[0]) => {
        if (!reward.userRewardId) return;
        
        try {
            await claimRewardMutation.mutateAsync(reward.userRewardId);
            toast.success(`🎉 Claimed: ${reward.title}!`);
        } catch (error) {
            toast.error('Failed to claim reward');
        }
    };

    if (isLoading) {
        return (
            <div className="rounded-2xl bg-white border border-outline-variant/50 p-4 animate-pulse">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 bg-slate-200 rounded-full" />
                    <div className="h-5 w-24 bg-slate-200 rounded" />
                </div>
                <div className="space-y-3">
                    <div className="h-16 bg-slate-100 rounded-xl" />
                    <div className="h-12 bg-slate-100 rounded-xl" />
                </div>
            </div>
        );
    }

    if (rewards.length === 0) {
        return null; // Don't show widget if no rewards configured
    }

    return (
        <div className="rounded-2xl bg-white border border-outline-variant/50 overflow-hidden">
            {/* Header */}
            <div 
                className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-outline-variant/30 cursor-pointer hover:from-amber-100 hover:to-orange-100 transition-colors"
                onClick={() => navigate('/rewards')}
            >
                <div className="flex items-center gap-2">
                    <MdEmojiEvents size={22} className="text-amber-500" />
                    <h2 className="text-title-md font-bold text-on-surface">Rewards</h2>
                    {unclaimedRewards.length > 0 && (
                        <span className="px-2 py-0.5 bg-amber-500 text-white text-label-sm font-bold rounded-full animate-pulse">
                            {unclaimedRewards.length} new
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-label-sm text-on-variant font-medium">
                        {stats.unlocked}/{stats.total}
                    </span>
                    <MdArrowOutward size={18} className="text-primary" />
                </div>
            </div>

            <div className="p-4 space-y-2">
                {/* Reward Cards - Show up to 5 rewards */}
                {displayedRewards.length === 0 ? (
                    <div className="text-center py-6">
                        <p className="text-body-sm text-on-variant">
                            No rewards available yet
                        </p>
                    </div>
                ) : (
                    displayedRewards.map((reward) => {
                        const progress = getProgressValue(reward.type);
                        return (
                            <RewardCard
                                key={reward.id}
                                reward={reward}
                                currentProgress={progress}
                                onClaim={
                                    reward.isUnlocked && !reward.isClaimed && reward.userRewardId
                                        ? () => handleClaim(reward)
                                        : undefined
                                }
                            />
                        );
                    })
                )}
            </div>
        </div>
    );
};

