import { collection, addDoc, query, where, getDocs, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { ApiResponse } from '@/types';

export interface XPRecord {
    id: string;
    userId: string;
    userName: string;
    amount: number;
    source: 'task_completion' | 'photo_approval' | 'streak_bonus' | 'achievement' | 'manual';
    sourceId?: string;
    description: string;
    timestamp: Date;
    hubId?: string;
}

interface AwardXPData {
    userId: string;
    userName: string;
    amount: number;
    source: XPRecord['source'];
    sourceId?: string;
    description: string;
    hubId?: string;
}

/**
 * Award XP to a user
 */
export const awardXP = async (data: AwardXPData): Promise<ApiResponse<XPRecord>> => {
    try {
        const xpData = {
            userId: data.userId,
            userName: data.userName,
            amount: data.amount,
            source: data.source,
            sourceId: data.sourceId || null,
            description: data.description,
            timestamp: Timestamp.now(),
            hubId: data.hubId || null,
        };

        const docRef = await addDoc(collection(db, 'xpRecords'), xpData);

        const record: XPRecord = {
            id: docRef.id,
            ...data,
            timestamp: new Date(),
        };

        return {
            success: true,
            data: record,
        };
    } catch (error) {
        console.error('Award XP error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to award XP',
        };
    }
};

/**
 * Get XP records for a user
 */
export const getUserXPRecords = async (
    userId: string,
    limitCount: number = 50
): Promise<ApiResponse<XPRecord[]>> => {
    try {
        const q = query(
            collection(db, 'xpRecords'),
            where('userId', '==', userId),
            orderBy('timestamp', 'desc'),
            limit(limitCount)
        );

        const snapshot = await getDocs(q);
        const records: XPRecord[] = [];

        snapshot.forEach((doc) => {
            const data = doc.data();
            records.push({
                id: doc.id,
                userId: data.userId,
                userName: data.userName,
                amount: data.amount,
                source: data.source,
                sourceId: data.sourceId,
                description: data.description,
                timestamp: data.timestamp?.toDate() || new Date(),
                hubId: data.hubId,
            });
        });

        return {
            success: true,
            data: records,
        };
    } catch (error) {
        console.error('Get user XP records error:', error);
        return {
            success: true,
            data: [],
        };
    }
};

/**
 * Calculate user's current streak
 */
export const calculateStreak = async (userId: string): Promise<ApiResponse<number>> => {
    try {
        const records = await getUserXPRecords(userId, 100);
        
        if (!records.success || !records.data || records.data.length === 0) {
            return { success: true, data: 0 };
        }

        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if user earned XP today
        const todayRecords = records.data.filter((record: XPRecord) => {
            const recordDate = new Date(record.timestamp);
            recordDate.setHours(0, 0, 0, 0);
            return recordDate.getTime() === today.getTime();
        });

        if (todayRecords.length === 0) {
            return { success: true, data: 0 };
        }

        // Count consecutive days
        streak = 1;
        let currentDate = new Date(today);
        currentDate.setDate(currentDate.getDate() - 1);

        for (let i = 0; i < 365; i++) {
            const dayRecords = records.data.filter((record: XPRecord) => {
                const recordDate = new Date(record.timestamp);
                recordDate.setHours(0, 0, 0, 0);
                return recordDate.getTime() === currentDate.getTime();
            });

            if (dayRecords.length > 0) {
                streak++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else {
                break;
            }
        }

        return {
            success: true,
            data: streak,
        };
    } catch (error) {
        console.error('Calculate streak error:', error);
        return {
            success: true,
            data: 0,
        };
    }
};

/**
 * Get leaderboard for a hub
 */
export const getLeaderboard = async (
    hubId?: string,
    limitCount: number = 10
): Promise<ApiResponse<Array<{ userId: string; userName: string; totalXP: number; rank: number }>>> => {
    try {
        const q = hubId
            ? query(
                  collection(db, 'xpRecords'),
                  where('hubId', '==', hubId),
                  orderBy('timestamp', 'desc')
              )
            : query(collection(db, 'xpRecords'), orderBy('timestamp', 'desc'));

        const snapshot = await getDocs(q);
        const userXP: Record<string, { userName: string; totalXP: number }> = {};

        snapshot.forEach((doc) => {
            const data = doc.data();
            if (!userXP[data.userId]) {
                userXP[data.userId] = {
                    userName: data.userName,
                    totalXP: 0,
                };
            }
            userXP[data.userId].totalXP += data.amount;
        });

        const leaderboard = Object.entries(userXP)
            .map(([userId, data]) => ({
                userId,
                userName: data.userName,
                totalXP: data.totalXP,
                photoURL: (data as any).photoURL,
                rank: 0,
            }))
            .sort((a, b) => b.totalXP - a.totalXP)
            .slice(0, limitCount)
            .map((entry, index) => ({
                ...entry,
                rank: index + 1,
            }));

        return {
            success: true,
            data: leaderboard,
        };
    } catch (error) {
        console.error('Get leaderboard error:', error);
        return {
            success: true,
            data: [],
        };
    }
};

/**
 * Get user's rank in the leaderboard
 */
export const getUserRank = async (userId: string, hubId?: string): Promise<ApiResponse<number>> => {
    try {
        const leaderboardResponse = await getLeaderboard(hubId, 1000);
        
        if (!leaderboardResponse.success || !leaderboardResponse.data) {
            return { success: true, data: 0 };
        }

        const userEntry = leaderboardResponse.data.find((entry) => entry.userId === userId);
        
        return {
            success: true,
            data: userEntry?.rank || 0,
        };
    } catch (error) {
        console.error('Get user rank error:', error);
        return {
            success: true,
            data: 0,
        };
    }
};

/**
 * Get user's total XP for a specific hub
 */
export const getUserTotalXP = async (userId: string, hubId: string): Promise<ApiResponse<number>> => {
    try {
        const q = query(
            collection(db, 'xpRecords'),
            where('userId', '==', userId),
            where('hubId', '==', hubId)
        );

        const snapshot = await getDocs(q);
        let totalXP = 0;

        snapshot.forEach((doc) => {
            const data = doc.data();
            totalXP += data.amount || 0;
        });

        return {
            success: true,
            data: totalXP,
        };
    } catch (error) {
        console.error('Get user total XP error:', error);
        return {
            success: true,
            data: 0,
        };
    }
};

