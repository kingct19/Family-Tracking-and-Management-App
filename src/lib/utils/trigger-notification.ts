/**
 * Trigger Notification Utility
 * 
 * Helper functions to trigger notifications for various events
 * These would typically call Cloud Functions to send notifications
 */

import { sendHubNotification } from '@/lib/api/notification-api';

/**
 * Trigger notification when task is assigned
 */
export const notifyTaskAssigned = async (
    hubId: string,
    taskTitle: string,
    assigneeName: string
): Promise<void> => {
    await sendHubNotification(
        hubId,
        'New Task Assigned',
        `You've been assigned: ${taskTitle}`,
        'task',
        {
            taskTitle,
            assigneeName,
            url: '/tasks',
        }
    );
};

/**
 * Trigger notification when task proof is submitted
 */
export const notifyTaskProofSubmitted = async (
    hubId: string,
    taskTitle: string,
    submitterName: string
): Promise<void> => {
    await sendHubNotification(
        hubId,
        'Task Proof Submitted',
        `${submitterName} submitted proof for: ${taskTitle}`,
        'approval',
        {
            taskTitle,
            submitterName,
            url: '/tasks/pending-approvals',
        }
    );
};

/**
 * Trigger notification when task is approved
 */
export const notifyTaskApproved = async (
    hubId: string,
    taskTitle: string,
    xpEarned: number
): Promise<void> => {
    await sendHubNotification(
        hubId,
        'Task Approved!',
        `Great job! You earned ${xpEarned} XP for: ${taskTitle}`,
        'xp',
        {
            taskTitle,
            xpEarned,
            url: '/tasks',
        }
    );
};

/**
 * Trigger notification for geofence entry/exit
 */
export const notifyGeofenceAlert = async (
    hubId: string,
    geofenceName: string,
    memberName: string,
    type: 'entry' | 'exit'
): Promise<void> => {
    await sendHubNotification(
        hubId,
        type === 'entry' ? 'Entered Geofence' : 'Left Geofence',
        `${memberName} ${type === 'entry' ? 'entered' : 'left'} ${geofenceName}`,
        'geofence',
        {
            geofenceName,
            memberName,
            type,
            url: '/map',
        }
    );
};

/**
 * Trigger notification for new message
 */
export const notifyNewMessage = async (
    hubId: string,
    senderName: string,
    messagePreview: string
): Promise<void> => {
    await sendHubNotification(
        hubId,
        `New message from ${senderName}`,
        messagePreview,
        'message',
        {
            senderName,
            url: '/messages',
        }
    );
};

