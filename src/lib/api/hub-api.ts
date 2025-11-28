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
    onSnapshot,
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
 * Subscribe to real-time hub membership updates
 */
export const subscribeToHubMembers = (
    hubId: string,
    onUpdate: (memberships: Membership[]) => void,
    onError?: (error: Error) => void
): (() => void) => {
    try {
        const membershipsQuery = query(collection(db, 'hubs', hubId, 'memberships'));

        const unsubscribe = onSnapshot(
            membershipsQuery,
            (snapshot) => {
                const memberships: Membership[] = [];
                snapshot.forEach((doc) => {
                    const data = doc.data();
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
                onUpdate(memberships);
            },
            (error) => {
                console.error('Error in hub members subscription:', error);
                onError?.(error);
            }
        );

        return unsubscribe;
    } catch (error) {
        console.error('Failed to subscribe to hub members:', error);
        onError?.(error instanceof Error ? error : new Error('Unknown error'));
        return () => {}; // Return no-op unsubscribe
    }
};

/**
 * Update hub details
 * Only allows updating name and description - other fields are protected
 */
export const updateHub = async (
    hubId: string,
    updates: Partial<Pick<Hub, 'name' | 'description'>>
): Promise<ApiResponse<void>> => {
    try {
        // Only allow updating specific fields (name, description)
        const allowedUpdates: any = {
            updatedAt: serverTimestamp(),
        };

        if (updates.name !== undefined) {
            allowedUpdates.name = updates.name;
        }
        if (updates.description !== undefined) {
            allowedUpdates.description = updates.description;
        }

        await updateDoc(doc(db, 'hubs', hubId), allowedUpdates);

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
                error: 'Cannot leave hub as the only admin. Please assign another admin first or delete the hub.',
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

/**
 * Delete hub (admin only - deletes hub and all memberships)
 */
export const deleteHub = async (
    hubId: string,
    userId: string
): Promise<ApiResponse<void>> => {
    try {
        // First check if user is the hub creator (doesn't require membership check)
        const hubResponse = await getHubById(hubId);
        if (!hubResponse.success || !hubResponse.data) {
            return {
                success: false,
                error: 'Hub not found',
            };
        }

        const isCreator = hubResponse.data.createdBy === userId;
        
        // If not creator, verify user is admin
        if (!isCreator) {
            const membershipResponse = await getUserMembership(hubId, userId);
            if (!membershipResponse.success || !membershipResponse.data || membershipResponse.data.role !== 'admin') {
                return {
                    success: false,
                    error: 'Only admins can delete hubs',
                };
            }
        }

        // Get all memberships to clean up user's hub arrays
        const membersResponse = await getHubMembers(hubId);
        if (!membersResponse.success || !membersResponse.data) {
            throw new Error('Failed to fetch members');
        }

        // Delete all memberships
        const membershipPromises = membersResponse.data.map((membership) =>
            deleteDoc(doc(db, 'hubs', hubId, 'memberships', membership.userId))
        );
        await Promise.all(membershipPromises);

        // Remove hub from all users' hubs arrays
        const userUpdatePromises = membersResponse.data.map((membership) => {
            const userRef = doc(db, 'users', membership.userId);
            return updateDoc(userRef, {
                hubs: arrayRemove(hubId),
            });
        });
        await Promise.all(userUpdatePromises);

        // Delete the hub document
        await deleteDoc(doc(db, 'hubs', hubId));

        return { success: true };
    } catch (error: any) {
        console.error('Delete hub error:', error);
        return {
            success: false,
            error: 'Failed to delete hub',
        };
    }
};

