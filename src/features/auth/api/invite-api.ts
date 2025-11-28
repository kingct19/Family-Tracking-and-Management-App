import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { Invite, Membership, ApiResponse, UserRole } from '@/types';

/**
 * Generate a random invite code
 */
const generateInviteCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude similar looking characters
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
    if (i === 3) code += '-'; // Add hyphen for readability
  }
  return code;
};

/**
 * Create a new invite code for a hub
 */
export const createInviteCode = async (
  hubId: string,
  createdBy: string,
  role: UserRole = 'member',
  expiresInDays: number = 7,
  maxUses?: number
): Promise<ApiResponse<Invite>> => {
  try {
    const code = generateInviteCode();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const invite: Omit<Invite, 'createdAt'> = {
      code,
      hubId,
      createdBy,
      role,
      expiresAt,
      maxUses,
      usedBy: [],
    };

    // Build document data, excluding undefined maxUses
    const inviteData: {
      code: string;
      hubId: string;
      createdBy: string;
      role: UserRole;
      expiresAt: Timestamp;
      usedBy: string[];
      createdAt: ReturnType<typeof serverTimestamp>;
      maxUses?: number;
    } = {
      code,
      hubId,
      createdBy,
      role,
      expiresAt: Timestamp.fromDate(expiresAt),
      usedBy: [],
      createdAt: serverTimestamp(),
    };

    // Only include maxUses if it's defined
    if (maxUses !== undefined) {
      inviteData.maxUses = maxUses;
    }

    await setDoc(doc(db, 'invites', code), inviteData);

    return {
      success: true,
      data: { ...invite, createdAt: new Date() },
    };
  } catch (error: any) {
    console.error('Create invite error:', error);
    return {
      success: false,
      error: 'Failed to create invite code',
    };
  }
};

/**
 * Validate and retrieve an invite code
 */
export const getInviteByCode = async (code: string): Promise<ApiResponse<Invite>> => {
  try {
    const inviteDoc = await getDoc(doc(db, 'invites', code));

    if (!inviteDoc.exists()) {
      return {
        success: false,
        error: 'Invalid invite code',
      };
    }

    const data = inviteDoc.data();
    const invite: Invite = {
      code: inviteDoc.id,
      hubId: data.hubId,
      createdBy: data.createdBy,
      role: data.role,
      expiresAt: data.expiresAt.toDate(),
      maxUses: data.maxUses,
      usedBy: data.usedBy || [],
      createdAt: data.createdAt.toDate(),
    };

    // Check if invite is expired
    if (invite.expiresAt < new Date()) {
      return {
        success: false,
        error: 'This invite code has expired',
      };
    }

    // Check if invite has reached max uses
    if (invite.maxUses && invite.usedBy.length >= invite.maxUses) {
      return {
        success: false,
        error: 'This invite code has reached its usage limit',
      };
    }

    return {
      success: true,
      data: invite,
    };
  } catch (error: any) {
    console.error('Get invite error:', error);
    return {
      success: false,
      error: 'Failed to validate invite code',
    };
  }
};

/**
 * Join an existing hub using an invite code
 * This function uses the hubId from the invite to join the existing hub, NOT create a new one
 */
export const joinHubWithInvite = async (
  userId: string,
  inviteCode: string
): Promise<ApiResponse<{ hubId: string; role: UserRole }>> => {
  try {
    // Get and validate invite - this contains the hubId of the existing hub
    const inviteResponse = await getInviteByCode(inviteCode);
    if (!inviteResponse.success || !inviteResponse.data) {
      return {
        success: false,
        error: inviteResponse.error,
      };
    }

    const invite = inviteResponse.data;
    const hubId = invite.hubId; // Use the hubId from the invite (existing hub)

    // Verify the hub exists before trying to join it
    const hubDoc = await getDoc(doc(db, 'hubs', hubId));
    if (!hubDoc.exists()) {
      return {
        success: false,
        error: 'The hub associated with this invite no longer exists',
      };
    }

    // Check if user is already a member
    const membershipDoc = await getDoc(
      doc(db, 'hubs', hubId, 'memberships', userId)
    );

    if (membershipDoc.exists()) {
      return {
        success: false,
        error: 'You are already a member of this hub',
      };
    }

    // Create membership in the existing hub
    const membership: Omit<Membership, 'joinedAt'> = {
      userId,
      hubId,
      role: invite.role,
      status: 'active', // Auto-approve with invite code
      invitedBy: invite.createdBy,
    };

    await setDoc(doc(db, 'hubs', hubId, 'memberships', userId), {
      ...membership,
      joinedAt: serverTimestamp(),
    });

    // Update existing hub's members array
    await updateDoc(doc(db, 'hubs', hubId), {
      members: arrayUnion(userId),
    });

    // Update user's hubs array (use setDoc with merge to handle case where user doc doesn't exist)
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      // User document exists, update it
      await updateDoc(userRef, {
        hubs: arrayUnion(hubId),
      });
    } else {
      // User document doesn't exist, create it with the hub
      // This can happen if user joined via invite before completing profile setup
      await setDoc(userRef, {
        id: userId,
        email: '', // Will be updated when user completes profile
        displayName: '', // Will be updated when user completes profile
        hubs: [hubId],
        xpTotal: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });
    }

    // Mark invite as used
    await updateDoc(doc(db, 'invites', inviteCode), {
      usedBy: arrayUnion(userId),
    });

    return {
      success: true,
      data: {
        hubId,
        role: invite.role,
      },
    };
  } catch (error: any) {
    console.error('Join hub error:', error);
    return {
      success: false,
      error: error.message || 'Failed to join hub',
    };
  }
};

/**
 * Get all active invites for a hub
 */
export const getHubInvites = async (hubId: string): Promise<ApiResponse<Invite[]>> => {
  try {
    const invitesQuery = query(
      collection(db, 'invites'),
      where('hubId', '==', hubId),
      where('expiresAt', '>', Timestamp.now())
    );

    const snapshot = await getDocs(invitesQuery);
    const invites: Invite[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      invites.push({
        code: doc.id,
        hubId: data.hubId,
        createdBy: data.createdBy,
        role: data.role,
        expiresAt: data.expiresAt.toDate(),
        maxUses: data.maxUses,
        usedBy: data.usedBy || [],
        createdAt: data.createdAt.toDate(),
      });
    });

    // Filter out invites that reached max uses
    const activeInvites = invites.filter(
      (invite) => !invite.maxUses || invite.usedBy.length < invite.maxUses
    );

    return {
      success: true,
      data: activeInvites,
    };
  } catch (error: any) {
    console.error('Get hub invites error:', error);
    return {
      success: false,
      error: 'Failed to fetch invites',
    };
  }
};

/**
 * Delete an invite code
 */
export const deleteInviteCode = async (inviteCode: string): Promise<ApiResponse<void>> => {
  try {
    await updateDoc(doc(db, 'invites', inviteCode), {
      expiresAt: new Date(0), // Set to past date to invalidate
    });

    return { success: true };
  } catch (error: any) {
    console.error('Delete invite error:', error);
    return {
      success: false,
      error: 'Failed to delete invite code',
    };
  }
};



