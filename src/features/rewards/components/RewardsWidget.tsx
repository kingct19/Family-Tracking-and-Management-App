/**
 * RewardsWidget - Compact rewards preview for dashboard
 * Shows progress towards next reward and recently unlocked rewards
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    MdEmojiEvents, 
    MdArrowOutward, 
    MdLock,
    MdStar,
    MdTaskAlt,
    MdLocalFireDepartment,
    MdCelebration,
} from 'react-icons/md';
import { useRewardsWithProgress, useClaimReward } from '../hooks/useRewards';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useHubTasks } from '@/features/tasks/hooks/useTasks';
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
    const getProgressValue = (type: RewardType) => {
        switch (type) {
            case 'xp': return userStats.xpTotal;
            case 'tasks': return userStats.tasksCompleted;
            case 'streak': return userStats.currentStreak;
        }
    };

    // Find the next reward to unlock (closest to threshold)
    const nextReward = useMemo(() => {
        const lockedRewards = rewards.filter(r => !r.isUnlocked && r.isActive);
        if (lockedRewards.length === 0) return null;

        // Sort by how close user is to unlocking
        return lockedRewards.sort((a, b) => {
            const progressA = getProgressValue(a.type) / a.threshold;
            const progressB = getProgressValue(b.type) / b.threshold;
            return progressB - progressA;
        })[0];
    }, [rewards, userStats]);

    // Get unclaimed rewards
    const unclaimedRewards = rewards.filter(r => r.isUnlocked && !r.isClaimed);

    const handleClaim = async (reward: typeof rewards[0]) => {
        if (!reward.userRewardId) return;
        
        try {
            await claimRewardMutation.mutateAsync(reward.userRewardId);
            toast.success(`🎉 Claimed: ${reward.title}!`);
        } catch (error) {
            toast.error('Failed to claim reward');
        }
    };

    const getTypeIcon = (type: RewardType, size = 16) => {
        switch (type) {
            case 'xp': return <MdStar size={size} className="text-amber-500" />;
            case 'tasks': return <MdTaskAlt size={size} className="text-emerald-500" />;
            case 'streak': return <MdLocalFireDepartment size={size} className="text-orange-500" />;
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

            <div className="p-4 space-y-3">
                {/* Unclaimed rewards notification */}
                {unclaimedRewards.length > 0 && (
                    <div className="p-3 rounded-xl bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center text-white flex-shrink-0 animate-bounce">
                                <MdCelebration size={24} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-body-sm font-semibold text-slate-900">
                                    {unclaimedRewards.length === 1 
                                        ? 'You unlocked a new reward!' 
                                        : `You unlocked ${unclaimedRewards.length} rewards!`
                                    }
                                </p>
                                <p className="text-label-sm text-slate-600 truncate">
                                    {unclaimedRewards[0].icon} {unclaimedRewards[0].title}
                                    {unclaimedRewards.length > 1 && ` +${unclaimedRewards.length - 1} more`}
                                </p>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleClaim(unclaimedRewards[0]);
                                }}
                                disabled={claimRewardMutation.isPending}
                                className="px-3 py-1.5 bg-amber-500 text-white text-label-sm font-semibold rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50"
                            >
                                Claim
                            </button>
                        </div>
                    </div>
                )}

                {/* Next reward progress */}
                {nextReward && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-outline-variant/30">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center text-xl flex-shrink-0 grayscale opacity-60">
                                {nextReward.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-body-sm font-semibold text-on-surface truncate">
                                    {nextReward.title}
                                </p>
                                <div className="flex items-center gap-1.5 text-label-sm text-on-variant">
                                    {getTypeIcon(nextReward.type, 14)}
                                    <span>
                                        {getProgressValue(nextReward.type).toLocaleString()} / {nextReward.threshold.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                            <MdLock size={18} className="text-slate-400 flex-shrink-0" />
                        </div>
                        {/* Progress bar */}
                        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                                style={{ 
                                    width: `${Math.min(100, (getProgressValue(nextReward.type) / nextReward.threshold) * 100)}%` 
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Recently unlocked */}
                {stats.unlocked > 0 && unclaimedRewards.length === 0 && (
                    <div className="flex items-center gap-2 justify-center py-2">
                        <div className="flex -space-x-2">
                            {rewards
                                .filter(r => r.isUnlocked)
                                .slice(0, 4)
                                .map((reward) => (
                                    <div
                                        key={reward.id}
                                        className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 border-2 border-white flex items-center justify-center text-sm shadow-sm"
                                        title={reward.title}
                                    >
                                        {reward.icon}
                                    </div>
                                ))}
                        </div>
                        <span className="text-label-sm text-on-variant ml-1">
                            {stats.unlocked} unlocked
                        </span>
                    </div>
                )}

                {/* All rewards unlocked state */}
                {stats.unlocked === stats.total && stats.total > 0 && (
                    <div className="text-center py-3">
                        <div className="flex items-center justify-center gap-2 text-amber-600">
                            <MdEmojiEvents size={20} />
                            <span className="text-body-sm font-semibold">All rewards unlocked! 🎉</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

