/**
 * Message API
 * 
 * Firebase Firestore operations for real-time messaging
 * - Send messages to hub members
 * - Real-time message subscriptions
 * - Mark messages as read
 * - Delete messages
 */

import {
    collection,
    doc,
    addDoc,
    getDoc,
    getDocs,
    query,
    orderBy,
    limit,
    onSnapshot,
    serverTimestamp,
    updateDoc,
    deleteDoc,
    Timestamp,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { ApiResponse } from '@/types';
import type { Message, MessageType } from '@/types';

export interface CreateMessageRequest {
    hubId: string;
    senderId: string;
    senderName: string;
    text: string;
    type?: MessageType;
    mediaURL?: string;
}

export interface MessageDocument extends Omit<Message, 'timestamp'> {
    timestamp: Timestamp | Date;
}

/**
 * Send a message to the hub
 */
export async function sendMessage(
    data: CreateMessageRequest
): Promise<ApiResponse<Message>> {
    try {
        const messagesRef = collection(db, 'hubs', data.hubId, 'messages');
        
        const messageData = {
            senderId: data.senderId,
            senderName: data.senderName,
            text: data.text,
            type: data.type || 'text',
            mediaURL: data.mediaURL || null,
            readBy: [data.senderId], // Sender has read their own message
            timestamp: serverTimestamp(),
        };

        const docRef = await addDoc(messagesRef, messageData);
        
        // Fetch the created message to return it
        const messageSnap = await getDoc(docRef);
        const messageDataReturned = messageSnap.data();
        
        if (!messageDataReturned) {
            throw new Error('Failed to create message');
        }

        return {
            success: true,
            data: {
                id: docRef.id,
                hubId: data.hubId,
                senderId: data.senderId,
                senderName: data.senderName,
                text: data.text,
                type: data.type || 'text',
                mediaURL: data.mediaURL,
                timestamp: messageDataReturned.timestamp?.toDate() || new Date(),
                readBy: messageDataReturned.readBy || [data.senderId],
            },
        };
    } catch (error) {
        console.error('Send message error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to send message',
        };
    }
}

/**
 * Get messages for a hub
 */
export async function getHubMessages(
    hubId: string,
    limitCount: number = 50
): Promise<ApiResponse<Message[]>> {
    try {
        const messagesRef = collection(db, 'hubs', hubId, 'messages');
        const messagesQuery = query(
            messagesRef,
            orderBy('timestamp', 'desc'),
            limit(limitCount)
        );

        const snapshot = await getDocs(messagesQuery);
        const messages: Message[] = [];

        snapshot.forEach((doc) => {
            const data = doc.data();
            messages.push({
                id: doc.id,
                hubId,
                senderId: data.senderId,
                senderName: data.senderName,
                text: data.text,
                type: data.type || 'text',
                mediaURL: data.mediaURL,
                timestamp: data.timestamp?.toDate() || new Date(),
                readBy: data.readBy || [],
            });
        });

        // Reverse to show oldest first
        messages.reverse();

        return {
            success: true,
            data: messages,
        };
    } catch (error) {
        console.error('Get messages error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get messages',
            data: [],
        };
    }
}

/**
 * Subscribe to real-time messages for a hub
 */
export function subscribeToHubMessages(
    hubId: string,
    onUpdate: (messages: Message[]) => void,
    onError?: (error: Error) => void,
    limitCount: number = 50
): () => void {
    try {
        const messagesRef = collection(db, 'hubs', hubId, 'messages');
        const messagesQuery = query(
            messagesRef,
            orderBy('timestamp', 'desc'),
            limit(limitCount)
        );

        const unsubscribe = onSnapshot(
            messagesQuery,
            (snapshot) => {
                const messages: Message[] = [];

                snapshot.forEach((doc) => {
                    const data = doc.data();
                    messages.push({
                        id: doc.id,
                        hubId,
                        senderId: data.senderId,
                        senderName: data.senderName,
                        text: data.text,
                        type: data.type || 'text',
                        mediaURL: data.mediaURL,
                        timestamp: data.timestamp?.toDate() || new Date(),
                        readBy: data.readBy || [],
                    });
                });

                // Reverse to show oldest first (newest at bottom)
                messages.reverse();
                onUpdate(messages);
            },
            (error) => {
                console.error('Message subscription error:', error);
                if (onError) {
                    onError(error);
                }
            }
        );

        return unsubscribe;
    } catch (error) {
        console.error('Failed to subscribe to messages:', error);
        if (onError) {
            onError(error instanceof Error ? error : new Error('Unknown error'));
        }
        return () => {}; // Return no-op unsubscribe
    }
}

/**
 * Mark a message as read
 */
export async function markMessageAsRead(
    hubId: string,
    messageId: string,
    userId: string
): Promise<ApiResponse<void>> {
    try {
        const messageRef = doc(db, 'hubs', hubId, 'messages', messageId);
        const messageSnap = await getDoc(messageRef);
        
        if (!messageSnap.exists()) {
            return {
                success: false,
                error: 'Message not found',
            };
        }

        const currentReadBy = messageSnap.data()?.readBy || [];
        
        // Only update if user hasn't already read it
        if (!currentReadBy.includes(userId)) {
            await updateDoc(messageRef, {
                readBy: [...currentReadBy, userId],
            });
        }

        return { success: true };
    } catch (error) {
        console.error('Mark message as read error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to mark message as read',
        };
    }
}

/**
 * Delete a message (only by sender or admin)
 */
export async function deleteMessage(
    hubId: string,
    messageId: string,
    userId: string
): Promise<ApiResponse<void>> {
    try {
        const messageRef = doc(db, 'hubs', hubId, 'messages', messageId);
        const messageSnap = await getDoc(messageRef);
        
        if (!messageSnap.exists()) {
            return {
                success: false,
                error: 'Message not found',
            };
        }

        const messageData = messageSnap.data();
        
        // Only allow deletion by sender
        if (messageData?.senderId !== userId) {
            return {
                success: false,
                error: 'Unauthorized: Only message sender can delete',
            };
        }

        await deleteDoc(messageRef);

        return { success: true };
    } catch (error) {
        console.error('Delete message error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to delete message',
        };
    }
}
