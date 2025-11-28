import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { LeaderboardSkeleton } from '@/components/ui/Skeleton';
import { useHubStore } from '@/lib/store/hub-store';
import { getLeaderboard } from '@/features/xp/api/xp-api';
import { getUserProfile } from '@/features/auth/api/auth-api';
import { FiAward, FiTrendingUp } from 'react-icons/fi';

const LeaderboardPage = () => {
    const { currentHub } = useHubStore();

    // Fetch leaderboard data (with XP totals)
    const { data: leaderboardData, isLoading: isLoadingLeaderboard } = useQuery({
        queryKey: ['leaderboard', currentHub?.id],
        queryFn: async () => {
            if (!currentHub) throw new Error('No hub selected');
            const response = await getLeaderboard(currentHub.id);
            if (!response.success) throw new Error(response.error);
            return response.data || [];
        },
        enabled: !!currentHub,
    });

    // Get unique user IDs from leaderboard
    const userIds = useMemo(() => {
        if (!leaderboardData) return [];
        return Array.from(new Set(leaderboardData.map(entry => entry.userId)));
    }, [leaderboardData]);

    // Fetch user profiles for all leaderboard users
    const { data: userProfilesMap, isLoading: isLoadingProfiles } = useQuery({
        queryKey: ['leaderboard-profiles', userIds],
        queryFn: async () => {
            const profilesMap: Record<string, { displayName: string; photoURL?: string }> = {};
            
            // Fetch all user profiles in parallel
            await Promise.all(
                userIds.map(async (userId) => {
                    try {
                        const response = await getUserProfile(userId);
                        if (response.success && response.data) {
                            profilesMap[userId] = {
                                displayName: response.data.displayName || response.data.email.split('@')[0],
                                photoURL: response.data.photoURL,
                            };
                        } else {
                            // Fallback if profile fetch fails
                            profilesMap[userId] = {
                                displayName: `User ${userId.slice(0, 8)}`,
                            };
                        }
                    } catch (error) {
                        console.error(`Failed to fetch profile for user ${userId}:`, error);
                        profilesMap[userId] = {
                            displayName: `User ${userId.slice(0, 8)}`,
                        };
                    }
                })
            );
            
            return profilesMap;
        },
        enabled: userIds.length > 0,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Combine leaderboard data with user profiles
    const leaderboard = useMemo(() => {
        if (!leaderboardData || !userProfilesMap) return [];
        
        return leaderboardData.map((entry) => {
            const profile = userProfilesMap[entry.userId];
            return {
                userId: entry.userId,
                displayName: profile?.displayName || entry.userName || `User ${entry.userId.slice(0, 8)}`,
                xpTotal: entry.totalXP,
                rank: entry.rank,
                streak: 0, // TODO: Calculate streak
                photoURL: profile?.photoURL,
            };
        });
    }, [leaderboardData, userProfilesMap]);

    const isLoading = isLoadingLeaderboard || isLoadingProfiles;

    return (
        <>
            <Helmet>
                <title>Leaderboard - Family Safety App</title>
                <meta name="description" content="View XP leaderboard for your hub" />
            </Helmet>

            <div className="space-y-8">
                <div>
                    <h1 className="text-headline-lg md:text-display-sm font-normal text-on-surface mb-2">Leaderboard</h1>
                    <p className="text-body-lg text-on-variant">
                        Top performers in {currentHub?.name || 'your hub'}
                    </p>
                </div>

                {isLoading ? (
                    <LeaderboardSkeleton />
                ) : !leaderboard || leaderboard.length === 0 ? (
                    <div className="card p-12 text-center">
                        <div className="w-20 h-20 bg-primary-container rounded-full flex items-center justify-center mx-auto mb-6 shadow-elevation-2">
                            <FiAward size={40} className="text-primary" />
                        </div>
                        <h3 className="text-headline-md font-normal text-on-surface mb-3">
                            No rankings yet
                        </h3>
                        <p className="text-body-lg text-on-variant max-w-md mx-auto">
                            Complete tasks to earn XP and appear on the leaderboard!
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {leaderboard.map((entry, index) => {
                            const getRankIcon = (rank: number) => {
                                if (rank === 1) return <FiAward className="text-yellow-500" size={24} />;
                                if (rank === 2) return <FiAward className="text-gray-400" size={24} />;
                                if (rank === 3) return <FiAward className="text-orange-500" size={24} />;
                                return <span className="text-gray-500 font-bold text-lg">#{rank}</span>;
                            };

                            const getRankBg = (rank: number) => {
                                if (rank === 1) return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200';
                                if (rank === 2) return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200';
                                if (rank === 3) return 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200';
                                return 'bg-white border-gray-200';
                            };

                            return (
                                <div
                                    key={entry.userId}
                                    className={`card p-5 border-2 transition-all duration-normal hover:shadow-elevation-3 ${
                                        index < 3 ? 'shadow-elevation-2' : ''
                                    } ${getRankBg(entry.rank)}`}
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Rank */}
                                        <div className="flex-shrink-0 w-12 flex items-center justify-center">
                                            {getRankIcon(entry.rank)}
                                        </div>

                                        {/* Avatar */}
                                        <div className="flex-shrink-0">
                                            {entry.photoURL ? (
                                                <img
                                                    src={entry.photoURL}
                                                    alt={entry.displayName}
                                                    className="w-12 h-12 rounded-full border-2 border-white shadow-elevation-2"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-on-primary font-semibold text-title-md border-2 border-white shadow-elevation-2">
                                                    {entry.displayName.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>

                                        {/* Name and Stats */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-title-md text-on-surface truncate mb-1">
                                                {entry.displayName}
                                            </h3>
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-1.5 text-primary">
                                                    <FiAward size={16} />
                                                    <span className="text-label-md font-semibold">{entry.xpTotal} XP</span>
                                                </div>
                                                {entry.streak > 0 && (
                                                    <div className="flex items-center gap-1.5 text-orange-600">
                                                        <FiTrendingUp size={16} />
                                                        <span className="text-label-sm">{entry.streak} day streak</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* XP Badge */}
                                        <div className="flex-shrink-0">
                                            <div className="px-4 py-2 bg-primary text-on-primary rounded-full text-label-md font-semibold shadow-elevation-2">
                                                {entry.xpTotal}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
};

export default LeaderboardPage;

