/**
 * RewardsPage - User view for all rewards and progress
 */

import { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { 
    MdEmojiEvents, 
    MdArrowBack,
    MdSettings,
    MdStar,
    MdTaskAlt,
    MdLocalFireDepartment,
    MdFilterList,
    MdLockOpen,
    MdLock,
} from 'react-icons/md';
import { useState } from 'react';
import { useHasRole, useAuth } from '@/features/auth/hooks/useAuth';
import { useHubStore } from '@/lib/store/hub-store';
import { useHubTasks } from '@/features/tasks/hooks/useTasks';
import { useRewardsWithProgress, useClaimReward } from '../hooks/useRewards';
import { RewardCard } from '../components/RewardCard';
import type { RewardType } from '@/types';
import toast from 'react-hot-toast';

const RewardsPage = () => {
    const navigate = useNavigate();
    const { currentHub } = useHubStore();
    const { user } = useAuth();
    const isAdmin = useHasRole('admin');

    const { rewards, stats, isLoading } = useRewardsWithProgress();
    const { data: tasks = [] } = useHubTasks();
    const claimRewardMutation = useClaimReward();

    const [filterType, setFilterType] = useState<RewardType | 'all' | 'unlocked' | 'locked'>('all');

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

    // Filter rewards
    const filteredRewards = useMemo(() => {
        return rewards.filter(reward => {
            if (!reward.isActive) return false;
            
            switch (filterType) {
                case 'unlocked':
                    return reward.isUnlocked;
                case 'locked':
                    return !reward.isUnlocked;
                case 'xp':
                case 'tasks':
                case 'streak':
                    return reward.type === filterType;
                default:
                    return true;
            }
        }).sort((a, b) => {
            // Unclaimed first, then by progress percentage
            if (a.isUnlocked && !a.isClaimed && (!b.isUnlocked || b.isClaimed)) return -1;
            if (b.isUnlocked && !b.isClaimed && (!a.isUnlocked || a.isClaimed)) return 1;
            
            // Then by progress (closest to unlocking first)
            const progressA = getProgressValue(a.type) / a.threshold;
            const progressB = getProgressValue(b.type) / b.threshold;
            return progressB - progressA;
        });
    }, [rewards, filterType, userStats]);

    const handleClaim = async (reward: typeof rewards[0]) => {
        if (!reward.userRewardId) return;
        
        try {
            await claimRewardMutation.mutateAsync(reward.userRewardId);
            toast.success(`🎉 Claimed: ${reward.title}!`);
        } catch (error) {
            toast.error('Failed to claim reward');
        }
    };

    return (
        <>
            <Helmet>
                <title>Rewards - HaloHub</title>
            </Helmet>

            <div className="space-y-6">
                {/* Header */}
                <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 rounded-xl hover:bg-surface-variant text-on-variant transition-colors"
                        >
                            <MdArrowBack size={24} />
                        </button>
                        <div>
                            <h1 className="text-headline-md font-bold text-on-surface">
                                Rewards
                            </h1>
                            <p className="text-body-md text-on-variant">
                                Track your progress and unlock rewards
                            </p>
                        </div>
                    </div>
                    {isAdmin && (
                        <button
                            onClick={() => navigate('/rewards/manage')}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-surface-variant text-on-surface font-medium rounded-xl hover:bg-surface-variant/80 transition-colors"
                        >
                            <MdSettings size={18} />
                            Manage
                        </button>
                    )}
                </header>

                {/* Stats cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {/* Your XP */}
                    <div className="rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 p-4 text-white">
                        <div className="flex items-center gap-2 mb-2">
                            <MdStar size={24} />
                            <span className="text-white/80 text-label-md font-medium">Your XP</span>
                        </div>
                        <p className="text-display-sm font-black">{userStats.xpTotal.toLocaleString()}</p>
                    </div>

                    {/* Tasks completed */}
                    <div className="rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 p-4 text-white">
                        <div className="flex items-center gap-2 mb-2">
                            <MdTaskAlt size={24} />
                            <span className="text-white/80 text-label-md font-medium">Tasks Done</span>
                        </div>
                        <p className="text-display-sm font-black">{userStats.tasksCompleted}</p>
                    </div>

                    {/* Rewards unlocked */}
                    <div className="rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 p-4 text-white">
                        <div className="flex items-center gap-2 mb-2">
                            <MdLockOpen size={24} />
                            <span className="text-white/80 text-label-md font-medium">Unlocked</span>
                        </div>
                        <p className="text-display-sm font-black">{stats.unlocked}/{stats.total}</p>
                    </div>

                    {/* Progress */}
                    <div className="rounded-2xl bg-white border border-outline-variant/50 p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <MdEmojiEvents size={24} className="text-primary" />
                            <span className="text-on-variant text-label-md font-medium">Progress</span>
                        </div>
                        <p className="text-display-sm font-black text-on-surface">{stats.progress}%</p>
                    </div>
                </div>

                {/* Filter tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 hide-scrollbar">
                    {[
                        { value: 'all', label: 'All', icon: MdFilterList },
                        { value: 'unlocked', label: 'Unlocked', icon: MdLockOpen },
                        { value: 'locked', label: 'Locked', icon: MdLock },
                        { value: 'xp', label: 'XP', icon: MdStar },
                        { value: 'tasks', label: 'Tasks', icon: MdTaskAlt },
                        { value: 'streak', label: 'Streak', icon: MdLocalFireDepartment },
                    ].map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => setFilterType(tab.value as typeof filterType)}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                                filterType === tab.value
                                    ? 'bg-primary text-on-primary shadow-md'
                                    : 'bg-surface-variant text-on-variant hover:bg-surface-variant/80'
                            }`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Rewards grid */}
                {isLoading ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="rounded-2xl bg-white border border-outline-variant/50 p-4 animate-pulse">
                                <div className="flex gap-3">
                                    <div className="w-14 h-14 rounded-xl bg-slate-200" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-5 bg-slate-200 rounded w-3/4" />
                                        <div className="h-4 bg-slate-200 rounded w-full" />
                                    </div>
                                </div>
                                <div className="mt-4 h-2 bg-slate-200 rounded" />
                            </div>
                        ))}
                    </div>
                ) : filteredRewards.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-20 h-20 rounded-2xl bg-amber-50 flex items-center justify-center mb-6">
                            <MdEmojiEvents size={40} className="text-amber-400" />
                        </div>
                        <h2 className="text-headline-sm font-bold text-on-surface mb-2">
                            {filterType === 'unlocked' 
                                ? 'No rewards unlocked yet'
                                : filterType === 'locked'
                                    ? 'All rewards unlocked!'
                                    : 'No rewards available'
                            }
                        </h2>
                        <p className="text-body-md text-on-variant max-w-sm">
                            {filterType === 'unlocked' 
                                ? 'Keep completing tasks and earning XP to unlock rewards!'
                                : filterType === 'locked'
                                    ? 'Congratulations! You\'ve unlocked all available rewards.'
                                    : 'Check back later for new rewards to earn.'
                            }
                        </p>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredRewards.map((reward) => (
                            <RewardCard
                                key={reward.id}
                                reward={reward}
                                currentProgress={getProgressValue(reward.type)}
                                onClaim={reward.isUnlocked && !reward.isClaimed ? () => handleClaim(reward) : undefined}
                            />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default RewardsPage;

