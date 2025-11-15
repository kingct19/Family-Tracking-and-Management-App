import { 
    collection, 
    addDoc, 
    query, 
    where, 
    orderBy, 
    getDocs, 
    Timestamp,
    doc,
    updateDoc
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { ApiResponse } from '@/types';

export type BroadcastPriority = 'low' | 'normal' | 'high' | 'urgent';
export type BroadcastType = 'announcement' | 'emergency' | 'reminder' | 'alert';

export interface BroadcastAlert {
    id: string;
    hubId: string;
    senderId: string;
    senderName: string;
    title: string;
    message: string;
    priority: BroadcastPriority;
    type: BroadcastType;
    timestamp: Date;
    readBy: string[]; // Array of user IDs who have acknowledged the alert
    acknowledgedBy?: string[]; // Alias for readBy (for backwards compatibility)
    expiresAt?: Date; // Optional expiration time
}

interface CreateBroadcastData {
    hubId: string;
    senderId: string;
    senderName: string;
    title: string;
    message: string;
    priority: BroadcastPriority;
    type: BroadcastType;
    expiresAt?: Date;
}

/**
 * Create a new broadcast alert
 */
export const createBroadcast = async (
    data: CreateBroadcastData
): Promise<ApiResponse<BroadcastAlert>> => {
    try {
        const broadcastData = {
            hubId: data.hubId,
            senderId: data.senderId,
            senderName: data.senderName,
            title: data.title,
            message: data.message,
            priority: data.priority,
            type: data.type,
            timestamp: Timestamp.now(),
            readBy: [data.senderId], // Sender has read by default
            expiresAt: data.expiresAt ? Timestamp.fromDate(data.expiresAt) : null,
        };

        const docRef = await addDoc(
            collection(db, 'hubs', data.hubId, 'broadcasts'),
            broadcastData
        );

        const broadcast: BroadcastAlert = {
            id: docRef.id,
            ...data,
            timestamp: new Date(),
            readBy: [data.senderId],
        };

        return {
            success: true,
            data: broadcast,
        };
    } catch (error) {
        console.error('Create broadcast error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create broadcast',
        };
    }
};

/**
 * Get all broadcasts for a hub
 */
export const getHubBroadcasts = async (
    hubId: string,
    limit: number = 50
): Promise<ApiResponse<BroadcastAlert[]>> => {
    try {
        const now = Timestamp.now();
        
        const q = query(
            collection(db, 'hubs', hubId, 'broadcasts'),
            orderBy('timestamp', 'desc')
        );

        const snapshot = await getDocs(q);
        const broadcasts: BroadcastAlert[] = [];

        snapshot.forEach((doc) => {
            const data = doc.data();
            
            // Skip expired broadcasts
            if (data.expiresAt && data.expiresAt.toDate() < now.toDate()) {
                return;
            }

            broadcasts.push({
                id: doc.id,
                hubId: data.hubId,
                senderId: data.senderId,
                senderName: data.senderName,
                title: data.title,
                message: data.message,
                priority: data.priority,
                type: data.type,
                timestamp: data.timestamp.toDate(),
                readBy: data.readBy || [],
                expiresAt: data.expiresAt ? data.expiresAt.toDate() : undefined,
            });
        });

        return {
            success: true,
            data: broadcasts.slice(0, limit),
        };
    } catch (error) {
        console.error('Get hub broadcasts error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch broadcasts',
        };
    }
};

/**
 * Mark a broadcast as read by a user
 */
export const acknowledgeBroadcast = async (
    hubId: string,
    broadcastId: string,
    userId: string
): Promise<ApiResponse<void>> => {
    try {
        const broadcastRef = doc(db, 'hubs', hubId, 'broadcasts', broadcastId);
        
        // Get current broadcast to check if user already acknowledged
        const broadcastSnap = await getDocs(
            query(
                collection(db, 'hubs', hubId, 'broadcasts'),
                where('__name__', '==', broadcastId)
            )
        );

        if (broadcastSnap.empty) {
            return {
                success: false,
                error: 'Broadcast not found',
            };
        }

        const currentReadBy = broadcastSnap.docs[0].data().readBy || [];
        
        if (!currentReadBy.includes(userId)) {
            await updateDoc(broadcastRef, {
                readBy: [...currentReadBy, userId],
            });
        }

        return {
            success: true,
            data: undefined,
        };
    } catch (error) {
        console.error('Acknowledge broadcast error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to acknowledge broadcast',
        };
    }
};

/**
 * Get unread broadcasts count for a user
 */
export const getUnreadBroadcastsCount = async (
    hubId: string,
    userId: string
): Promise<ApiResponse<number>> => {
    try {
        const q = query(
            collection(db, 'hubs', hubId, 'broadcasts'),
            orderBy('timestamp', 'desc')
        );

        const snapshot = await getDocs(q);
        let unreadCount = 0;
        const now = new Date();

        snapshot.forEach((doc) => {
            const data = doc.data();
            const readBy = data.readBy || [];
            const expiresAt = data.expiresAt ? data.expiresAt.toDate() : null;

            // Don't count expired broadcasts
            if (expiresAt && expiresAt < now) {
                return;
            }

            if (!readBy.includes(userId)) {
                unreadCount++;
            }
        });

        return {
            success: true,
            data: unreadCount,
        };
    } catch (error) {
        console.error('Get unread broadcasts count error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get unread count',
        };
    }
};
