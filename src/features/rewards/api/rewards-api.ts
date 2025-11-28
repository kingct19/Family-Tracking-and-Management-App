/**
 * Rewards API - CRUD operations for hub rewards
 * Only admins can create/update/delete rewards
 * All members can view and claim rewards
 */

import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
    Timestamp,
    deleteField,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { Reward, UserReward, ApiResponse, RewardType } from '@/types';

// ============================================
// REWARD CRUD OPERATIONS (Admin only)
// ============================================

/**
 * Create a new reward for a hub
 */
export const createReward = async (
    hubId: string,
    data: {
        title: string;
        description: string;
        icon: string;
        imageURL?: string;
        type: RewardType;
        threshold: number;
        createdBy: string;
    }
): Promise<ApiResponse<Reward>> => {
    try {
        const rewardData: any = {
            hubId,
            title: data.title,
            description: data.description,
            icon: data.icon,
            type: data.type,
            threshold: data.threshold,
            createdBy: data.createdBy,
            isActive: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };
        
        // Only include imageURL if provided
        if (data.imageURL) {
            rewardData.imageURL = data.imageURL;
        }

        const docRef = await addDoc(collection(db, 'rewards'), rewardData);
        
        return {
            success: true,
            data: {
                id: docRef.id,
                ...data,
                hubId,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        };
    } catch (error: any) {
        console.error('Create reward error:', error);
        return {
            success: false,
            error: error.message || 'Failed to create reward',
        };
    }
};

/**
 * Get all rewards for a hub
 */
export const getHubRewards = async (hubId: string): Promise<ApiResponse<Reward[]>> => {
    try {
        const q = query(
            collection(db, 'rewards'),
            where('hubId', '==', hubId),
            orderBy('threshold', 'asc')
        );

        const snapshot = await getDocs(q);
        const rewards: Reward[] = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                hubId: data.hubId,
                title: data.title,
                description: data.description,
                icon: data.icon,
                imageURL: data.imageURL,
                type: data.type,
                threshold: data.threshold,
                createdBy: data.createdBy,
                isActive: data.isActive ?? true,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
            };
        });

        return { success: true, data: rewards };
    } catch (error: any) {
        console.error('Get hub rewards error:', error);
        return {
            success: false,
            error: error.message || 'Failed to fetch rewards',
        };
    }
};

/**
 * Get a single reward by ID
 */
export const getReward = async (rewardId: string): Promise<ApiResponse<Reward>> => {
    try {
        const docRef = doc(db, 'rewards', rewardId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return { success: false, error: 'Reward not found' };
        }

        const data = docSnap.data();
        return {
            success: true,
            data: {
                id: docSnap.id,
                hubId: data.hubId,
                title: data.title,
                description: data.description,
                icon: data.icon,
                type: data.type,
                threshold: data.threshold,
                createdBy: data.createdBy,
                isActive: data.isActive ?? true,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
            },
        };
    } catch (error: any) {
        console.error('Get reward error:', error);
        return {
            success: false,
            error: error.message || 'Failed to fetch reward',
        };
    }
};

/**
 * Update a reward
 */
export const updateReward = async (
    rewardId: string,
    updates: Partial<Pick<Reward, 'title' | 'description' | 'icon' | 'imageURL' | 'type' | 'threshold' | 'isActive'>>
): Promise<ApiResponse<void>> => {
    try {
        const docRef = doc(db, 'rewards', rewardId);
        
        // Prepare update data - handle null imageURL by using deleteField
        const updateData: any = {
            ...updates,
            updatedAt: serverTimestamp(),
        };
        
        // If imageURL is explicitly null, use deleteField to remove it
        if ('imageURL' in updates && updates.imageURL === null) {
            updateData.imageURL = deleteField();
        } else if (updates.imageURL === undefined) {
            // Don't include imageURL if undefined (no change)
            delete updateData.imageURL;
        }
        
        await updateDoc(docRef, updateData);

        return { success: true };
    } catch (error: any) {
        console.error('Update reward error:', error);
        return {
            success: false,
            error: error.message || 'Failed to update reward',
        };
    }
};

/**
 * Delete a reward
 */
export const deleteReward = async (rewardId: string): Promise<ApiResponse<void>> => {
    try {
        await deleteDoc(doc(db, 'rewards', rewardId));
        return { success: true };
    } catch (error: any) {
        console.error('Delete reward error:', error);
        return {
            success: false,
            error: error.message || 'Failed to delete reward',
        };
    }
};

// ============================================
// USER REWARD OPERATIONS
// ============================================

/**
 * Get all claimed/unlocked rewards for a user in a hub
 */
export const getUserRewards = async (
    hubId: string,
    userId: string
): Promise<ApiResponse<UserReward[]>> => {
    try {
        const q = query(
            collection(db, 'userRewards'),
            where('hubId', '==', hubId),
            where('userId', '==', userId)
        );

        const snapshot = await getDocs(q);
        const userRewards: UserReward[] = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                hubId: data.hubId,
                userId: data.userId,
                rewardId: data.rewardId,
                unlockedAt: data.unlockedAt?.toDate() || new Date(),
                claimedAt: data.claimedAt?.toDate(),
            };
        });

        return { success: true, data: userRewards };
    } catch (error: any) {
        console.error('Get user rewards error:', error);
        return {
            success: false,
            error: error.message || 'Failed to fetch user rewards',
        };
    }
};

/**
 * Unlock a reward for a user (called when threshold is met)
 */
export const unlockReward = async (
    hubId: string,
    userId: string,
    rewardId: string
): Promise<ApiResponse<UserReward>> => {
    try {
        // Check if already unlocked
        const existingQuery = query(
            collection(db, 'userRewards'),
            where('hubId', '==', hubId),
            where('userId', '==', userId),
            where('rewardId', '==', rewardId)
        );
        const existingSnap = await getDocs(existingQuery);
        
        if (!existingSnap.empty) {
            // Already unlocked
            const existing = existingSnap.docs[0];
            const data = existing.data();
            return {
                success: true,
                data: {
                    id: existing.id,
                    hubId: data.hubId,
                    userId: data.userId,
                    rewardId: data.rewardId,
                    unlockedAt: data.unlockedAt?.toDate() || new Date(),
                    claimedAt: data.claimedAt?.toDate(),
                },
            };
        }

        // Create new user reward
        const userRewardData = {
            hubId,
            userId,
            rewardId,
            unlockedAt: serverTimestamp(),
            claimedAt: null,
        };

        const docRef = await addDoc(collection(db, 'userRewards'), userRewardData);

        return {
            success: true,
            data: {
                id: docRef.id,
                hubId,
                userId,
                rewardId,
                unlockedAt: new Date(),
            },
        };
    } catch (error: any) {
        console.error('Unlock reward error:', error);
        return {
            success: false,
            error: error.message || 'Failed to unlock reward',
        };
    }
};

/**
 * Claim a reward (mark as seen/acknowledged by user)
 */
export const claimReward = async (userRewardId: string): Promise<ApiResponse<void>> => {
    try {
        const docRef = doc(db, 'userRewards', userRewardId);
        await updateDoc(docRef, {
            claimedAt: serverTimestamp(),
        });

        return { success: true };
    } catch (error: any) {
        console.error('Claim reward error:', error);
        return {
            success: false,
            error: error.message || 'Failed to claim reward',
        };
    }
};

/**
 * Check and unlock rewards for a user based on their current stats
 */
export const checkAndUnlockRewards = async (
    hubId: string,
    userId: string,
    stats: {
        xpTotal: number;
        tasksCompleted: number;
        currentStreak: number;
    }
): Promise<ApiResponse<Reward[]>> => {
    try {
        // Get all active rewards for the hub
        const rewardsResponse = await getHubRewards(hubId);
        if (!rewardsResponse.success || !rewardsResponse.data) {
            return { success: true, data: [] };
        }

        // Get user's already unlocked rewards
        const userRewardsResponse = await getUserRewards(hubId, userId);
        const unlockedRewardIds = new Set(
            (userRewardsResponse.data || []).map(ur => ur.rewardId)
        );

        // Check which rewards should be unlocked
        const newlyUnlocked: Reward[] = [];

        for (const reward of rewardsResponse.data) {
            // Skip if already unlocked or inactive
            if (unlockedRewardIds.has(reward.id) || !reward.isActive) continue;

            let shouldUnlock = false;
            switch (reward.type) {
                case 'xp':
                    shouldUnlock = stats.xpTotal >= reward.threshold;
                    break;
                case 'tasks':
                    shouldUnlock = stats.tasksCompleted >= reward.threshold;
                    break;
                case 'streak':
                    shouldUnlock = stats.currentStreak >= reward.threshold;
                    break;
            }

            if (shouldUnlock) {
                await unlockReward(hubId, userId, reward.id);
                newlyUnlocked.push(reward);
            }
        }

        return { success: true, data: newlyUnlocked };
    } catch (error: any) {
        console.error('Check and unlock rewards error:', error);
        return {
            success: false,
            error: error.message || 'Failed to check rewards',
        };
    }
};

