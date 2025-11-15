/**
 * Notification API
 * 
 * API functions for sending push notifications
 * These would typically be called from Cloud Functions
 */

import { httpsCallable } from 'firebase/functions';
import { functions } from '@/config/firebase';
import type { ApiResponse } from '@/types';

/**
 * Send a push notification to a user
 * This is typically called from Cloud Functions, not directly from the client
 */
export interface SendNotificationRequest {
    userId: string;
    title: string;
    body: string;
    type: 'task' | 'message' | 'geofence' | 'approval' | 'xp' | 'general';
    data?: Record<string, any>;
    icon?: string;
}

/**
 * Send notification (Cloud Function)
 * Note: In production, this should be called from a Cloud Function, not directly
 */
export const sendNotification = async (
    request: SendNotificationRequest
): Promise<ApiResponse<void>> => {
    try {
        // This would call a Cloud Function
        // For now, we'll just log it
        console.log('Send notification request:', request);
        
        // In production, uncomment this:
        // const sendNotificationFn = httpsCallable(functions, 'sendNotification');
        // await sendNotificationFn(request);
        
        return { success: true };
    } catch (error: any) {
        console.error('Send notification error:', error);
        return {
            success: false,
            error: 'Failed to send notification',
        };
    }
};

/**
 * Send notification to hub members
 */
export const sendHubNotification = async (
    hubId: string,
    title: string,
    body: string,
    type: SendNotificationRequest['type'],
    data?: Record<string, any>
): Promise<ApiResponse<void>> => {
    try {
        console.log('Send hub notification:', { hubId, title, body, type });
        
        // In production, this would call a Cloud Function that:
        // 1. Gets all hub members
        // 2. Gets their FCM tokens
        // 3. Sends notifications to all tokens
        
        // const sendHubNotificationFn = httpsCallable(functions, 'sendHubNotification');
        // await sendHubNotificationFn({ hubId, title, body, type, data });
        
        return { success: true };
    } catch (error: any) {
        console.error('Send hub notification error:', error);
        return {
            success: false,
            error: 'Failed to send hub notification',
        };
    }
};

