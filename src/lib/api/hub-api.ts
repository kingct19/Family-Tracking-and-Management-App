import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    collection,
    query,
    getDocs,
    serverTimestamp,
    arrayRemove,
    deleteDoc,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import type {
    Hub,
    Membership,
    FeatureToggles,
    UserRole,
    MembershipStatus,
    ApiResponse,
} from '@/types';
import type { CreateHubFormData } from '@/lib/validation/hub-schemas';

/**
 * Create a new hub
 */
export const createHub = async (
    data: CreateHubFormData,
    createdBy: string
): Promise<ApiResponse<Hub>> => {
    try {
        const hubRef = doc(collection(db, 'hubs'));

        const hub: Omit<Hub, 'id' | 'createdAt' | 'updatedAt'> = {
            name: data.name,
            description: data.description,
            createdBy,
            featureToggles: data.featureToggles,
            members: [createdBy],
        };

        await setDoc(hubRef, {
            ...hub,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        // Create creator's membership as admin
        const membership: Omit<Membership, 'joinedAt'> = {
            userId: createdBy,
            hubId: hubRef.id,
            role: 'admin',
            status: 'active',
        };

        await setDoc(doc(db, 'hubs', hubRef.id, 'memberships', createdBy), {
            ...membership,
            joinedAt: serverTimestamp(),
        });

        // Update user's hubs array
        const userRef = doc(db, 'users', createdBy);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            const currentHubs = userDoc.data().hubs || [];
            await updateDoc(userRef, {
                hubs: [...currentHubs, hubRef.id],
            });
        }

        return {
            success: true,
            data: {
                id: hubRef.id,
                ...hub,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        };
    } catch (error: any) {
        console.error('Create hub error:', error);
        return {
            success: false,
            error: 'Failed to create hub',
        };
    }
};

/**
 * Get hub by ID
 */
export const getHubById = async (hubId: string): Promise<ApiResponse<Hub>> => {
    try {
        const hubDoc = await getDoc(doc(db, 'hubs', hubId));

        if (!hubDoc.exists()) {
            return {
                success: false,
                error: 'Hub not found',
            };
        }

        const data = hubDoc.data();
        const hub: Hub = {
            id: hubDoc.id,
            name: data.name,
            description: data.description,
            createdBy: data.createdBy,
            featureToggles: data.featureToggles,
            members: data.members || [],
            inviteCode: data.inviteCode,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
        };

        return {
            success: true,
            data: hub,
        };
    } catch (error: any) {
        console.error('Get hub error:', error);
        return {
            success: false,
            error: 'Failed to fetch hub',
        };
    }
};

/**
 * Get all hubs for a user
 */
export const getUserHubs = async (userId: string): Promise<ApiResponse<Hub[]>> => {
    try {
        // Get user document to find hub IDs
        const userDoc = await getDoc(doc(db, 'users', userId));

        if (!userDoc.exists()) {
            return {
                success: false,
                error: 'User not found',
            };
        }

        const hubIds = userDoc.data().hubs || [];

        if (hubIds.length === 0) {
            return {
                success: true,
                data: [],
            };
        }

        // Fetch all hubs
        const hubs: Hub[] = [];
        for (const hubId of hubIds) {
            const hubResponse = await getHubById(hubId);
            if (hubResponse.success && hubResponse.data) {
                hubs.push(hubResponse.data);
            }
        }

        return {
            success: true,
            data: hubs,
        };
    } catch (error: any) {
        console.error('Get user hubs error:', error);
        return {
            success: false,
            error: 'Failed to fetch user hubs',
        };
    }
};

/**
 * Get user's membership in a hub
 */
export const getUserMembership = async (
    hubId: string,
    userId: string
): Promise<ApiResponse<Membership>> => {
    try {
        const membershipDoc = await getDoc(
            doc(db, 'hubs', hubId, 'memberships', userId)
        );

        if (!membershipDoc.exists()) {
            return {
                success: false,
                error: 'Membership not found',
            };
        }

        const data = membershipDoc.data();
        const membership: Membership = {
            userId: data.userId,
            hubId: data.hubId,
            role: data.role,
            status: data.status,
            joinedAt: data.joinedAt?.toDate() || new Date(),
            invitedBy: data.invitedBy,
        };

        return {
            success: true,
            data: membership,
        };
    } catch (error: any) {
        console.error('Get membership error:', error);
        return {
            success: false,
            error: 'Failed to fetch membership',
        };
    }
};

/**
 * Get all members of a hub
 */
export const getHubMembers = async (hubId: string): Promise<ApiResponse<Membership[]>> => {
    try {
        const membershipsQuery = query(collection(db, 'hubs', hubId, 'memberships'));
        const snapshot = await getDocs(membershipsQuery);

        const memberships: Membership[] = [];
        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            if (data) {
                memberships.push({
                    userId: data.userId as string,
                    hubId: data.hubId as string,
                    role: data.role as UserRole,
                    status: data.status as MembershipStatus,
                    joinedAt: data.joinedAt?.toDate() || new Date(),
                    invitedBy: data.invitedBy as string | undefined,
                });
            }
        });

        return {
            success: true,
            data: memberships,
        };
    } catch (error: any) {
        console.error('Get hub members error:', error);
        return {
            success: false,
            error: 'Failed to fetch hub members',
        };
    }
};

/**
 * Update hub details
 */
export const updateHub = async (
    hubId: string,
    updates: Partial<Hub>
): Promise<ApiResponse<void>> => {
    try {
        await updateDoc(doc(db, 'hubs', hubId), {
            ...updates,
            updatedAt: serverTimestamp(),
        });

        return { success: true };
    } catch (error: any) {
        console.error('Update hub error:', error);
        return {
            success: false,
            error: 'Failed to update hub',
        };
    }
};

/**
 * Update hub feature toggles
 */
export const updateFeatureToggles = async (
    hubId: string,
    toggles: FeatureToggles
): Promise<ApiResponse<void>> => {
    try {
        await updateDoc(doc(db, 'hubs', hubId), {
            featureToggles: toggles,
            updatedAt: serverTimestamp(),
        });

        return { success: true };
    } catch (error: any) {
        console.error('Update feature toggles error:', error);
        return {
            success: false,
            error: 'Failed to update feature toggles',
        };
    }
};

/**
 * Update member role
 */
export const updateMemberRole = async (
    hubId: string,
    userId: string,
    newRole: UserRole
): Promise<ApiResponse<void>> => {
    try {
        await updateDoc(doc(db, 'hubs', hubId, 'memberships', userId), {
            role: newRole,
        });

        return { success: true };
    } catch (error: any) {
        console.error('Update member role error:', error);
        return {
            success: false,
            error: 'Failed to update member role',
        };
    }
};

/**
 * Remove member from hub
 */
export const removeMemberFromHub = async (
    hubId: string,
    userId: string
): Promise<ApiResponse<void>> => {
    try {
        // Delete membership
        await deleteDoc(doc(db, 'hubs', hubId, 'memberships', userId));

        // Remove from hub members array
        await updateDoc(doc(db, 'hubs', hubId), {
            members: arrayRemove(userId),
        });

        // Remove hub from user's hubs array
        await updateDoc(doc(db, 'users', userId), {
            hubs: arrayRemove(hubId),
        });

        return { success: true };
    } catch (error: any) {
        console.error('Remove member error:', error);
        return {
            success: false,
            error: 'Failed to remove member from hub',
        };
    }
};

/**
 * Leave hub (user removing themselves)
 */
export const leaveHub = async (
    hubId: string,
    userId: string
): Promise<ApiResponse<void>> => {
    try {
        // Check if user is the only admin
        const membersResponse = await getHubMembers(hubId);
        if (!membersResponse.success || !membersResponse.data) {
            throw new Error('Failed to check members');
        }

        const admins = membersResponse.data.filter((m) => m.role === 'admin');
        const isOnlyAdmin = admins.length === 1 && admins[0].userId === userId;

        if (isOnlyAdmin) {
            return {
                success: false,
                error: 'Cannot leave hub as the only admin. Please assign another admin first.',
            };
        }

        return await removeMemberFromHub(hubId, userId);
    } catch (error: any) {
        console.error('Leave hub error:', error);
        return {
            success: false,
            error: 'Failed to leave hub',
        };
    }
};

