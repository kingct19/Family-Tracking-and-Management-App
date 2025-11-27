/**
 * LeaderboardWidget - Compact leaderboard preview for dashboard
 * Shows top 5 members with their XP and ranking
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useHubStore } from '@/lib/store/hub-store';
import { getLeaderboard } from '@/features/xp/api/xp-api';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { MdEmojiEvents, MdArrowOutward, MdLocalFireDepartment } from 'react-icons/md';

interface LeaderboardEntry {
    userId: string;
    displayName: string;
    xpTotal: number;
    rank: number;
    photoURL?: string;
}

export const LeaderboardWidget = () => {
    const { currentHub } = useHubStore();
    const { user } = useAuth();
    const navigate = useNavigate();

    const { data: leaderboard = [], isLoading } = useQuery({
        queryKey: ['leaderboard', currentHub?.id],
        queryFn: async () => {
            if (!currentHub) throw new Error('No hub selected');
            const response = await getLeaderboard(currentHub.id);
            if (!response.success) throw new Error(response.error);
            return (response.data || []).map((entry) => ({
                userId: entry.userId,
                displayName: entry.userName,
                xpTotal: entry.totalXP,
                rank: entry.rank,
                photoURL: (entry as any).photoURL,
            })) as LeaderboardEntry[];
        },
        enabled: !!currentHub,
        staleTime: 2 * 60 * 1000, // 2 minutes
    });

    // Get medal color based on rank
    const getMedalColor = (rank: number) => {
        if (rank === 1) return 'text-amber-400';
        if (rank === 2) return 'text-slate-400';
        if (rank === 3) return 'text-orange-400';
        return 'text-slate-300';
    };

    // Get background for top 3
    const getRankBg = (rank: number) => {
        if (rank === 1) return 'bg-gradient-to-r from-amber-50 to-amber-100/50';
        if (rank === 2) return 'bg-gradient-to-r from-slate-50 to-slate-100/50';
        if (rank === 3) return 'bg-gradient-to-r from-orange-50 to-orange-100/50';
        return 'bg-white';
    };

    // Take top 5
    const topFive = leaderboard.slice(0, 5);
    
    // Find current user's rank
    const currentUserEntry = leaderboard.find(e => e.userId === user?.id);

    if (isLoading) {
        return (
            <div className="rounded-2xl bg-white border border-outline-variant/50 p-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="h-6 w-32 bg-slate-200 rounded animate-pulse" />
                    <div className="h-5 w-5 bg-slate-200 rounded animate-pulse" />
                </div>
                <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center gap-3 p-2">
                            <div className="w-6 h-6 bg-slate-200 rounded-full animate-pulse" />
                            <div className="w-8 h-8 bg-slate-200 rounded-full animate-pulse" />
                            <div className="flex-1 h-4 bg-slate-200 rounded animate-pulse" />
                            <div className="w-12 h-4 bg-slate-200 rounded animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (topFive.length === 0) {
        return (
            <div className="rounded-2xl bg-white border border-outline-variant/50 p-6 text-center">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <MdEmojiEvents size={28} className="text-primary" />
                </div>
                <h3 className="text-title-sm font-bold text-on-surface mb-1">No rankings yet</h3>
                <p className="text-body-sm text-on-variant">Complete tasks to earn XP!</p>
            </div>
        );
    }

    return (
        <div className="rounded-2xl bg-white border border-outline-variant/50 overflow-hidden">
            {/* Header */}
            <div 
                className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-violet-50 to-purple-50 border-b border-outline-variant/30 cursor-pointer hover:from-violet-100 hover:to-purple-100 transition-colors"
                onClick={() => navigate('/leaderboard')}
            >
                <div className="flex items-center gap-2">
                    <MdEmojiEvents size={22} className="text-amber-500" />
                    <h2 className="text-title-md font-bold text-on-surface">Leaderboard</h2>
                </div>
                <MdArrowOutward size={18} className="text-primary" />
            </div>

            {/* Leaderboard List */}
            <div className="divide-y divide-outline-variant/30">
                {topFive.map((entry, index) => {
                    const isCurrentUser = entry.userId === user?.id;
                    
                    return (
                        <div 
                            key={entry.userId}
                            className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${getRankBg(entry.rank)} ${
                                isCurrentUser ? 'ring-2 ring-inset ring-primary/20' : ''
                            }`}
                        >
                            {/* Rank Medal/Number */}
                            <div className="w-7 flex items-center justify-center flex-shrink-0">
                                {entry.rank <= 3 ? (
                                    <MdEmojiEvents size={22} className={getMedalColor(entry.rank)} />
                                ) : (
                                    <span className="text-label-md font-bold text-slate-400">
                                        #{entry.rank}
                                    </span>
                                )}
                            </div>

                            {/* Avatar */}
                            <div className="flex-shrink-0 relative">
                                {entry.photoURL ? (
                                    <img
                                        src={entry.photoURL}
                                        alt={entry.displayName}
                                        className={`w-9 h-9 rounded-full object-cover ${
                                            entry.rank === 1 
                                                ? 'ring-2 ring-amber-400 ring-offset-1' 
                                                : 'ring-2 ring-white'
                                        }`}
                                    />
                                ) : (
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-label-md font-semibold ${
                                        entry.rank === 1 
                                            ? 'bg-gradient-to-br from-amber-400 to-orange-500 ring-2 ring-amber-400 ring-offset-1' 
                                            : 'bg-gradient-to-br from-primary to-secondary ring-2 ring-white'
                                    }`}>
                                        {entry.displayName?.[0]?.toUpperCase() || '?'}
                                    </div>
                                )}
                                {/* Crown for 1st place */}
                                {entry.rank === 1 && (
                                    <div className="absolute -top-1 -right-1 text-amber-500">
                                        <MdLocalFireDepartment size={14} />
                                    </div>
                                )}
                            </div>

                            {/* Name */}
                            <div className="flex-1 min-w-0">
                                <p className={`text-body-md font-medium truncate ${
                                    isCurrentUser ? 'text-primary' : 'text-on-surface'
                                }`}>
                                    {isCurrentUser ? 'You' : entry.displayName?.split(' ')[0] || 'Member'}
                                </p>
                            </div>

                            {/* XP */}
                            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-label-sm font-semibold ${
                                entry.rank === 1 
                                    ? 'bg-amber-100 text-amber-700' 
                                    : entry.rank === 2
                                        ? 'bg-slate-100 text-slate-600'
                                        : entry.rank === 3
                                            ? 'bg-orange-100 text-orange-700'
                                            : 'bg-violet-50 text-primary'
                            }`}>
                                <MdEmojiEvents size={14} />
                                {entry.xpTotal.toLocaleString()}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Current user rank if not in top 5 */}
            {currentUserEntry && currentUserEntry.rank > 5 && (
                <div className="px-4 py-2.5 bg-primary/5 border-t border-outline-variant/30">
                    <div className="flex items-center gap-3">
                        <div className="w-7 flex items-center justify-center flex-shrink-0">
                            <span className="text-label-md font-bold text-primary">
                                #{currentUserEntry.rank}
                            </span>
                        </div>
                        <div className="flex-shrink-0">
                            {user?.photoURL ? (
                                <img
                                    src={user.photoURL}
                                    alt=""
                                    className="w-9 h-9 rounded-full object-cover ring-2 ring-primary/30"
                                />
                            ) : (
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-label-md font-semibold ring-2 ring-primary/30">
                                    {user?.displayName?.[0]?.toUpperCase() || '?'}
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-body-md font-medium text-primary truncate">You</p>
                        </div>
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-label-sm font-semibold">
                            <MdEmojiEvents size={14} />
                            {currentUserEntry.xpTotal.toLocaleString()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

