/**
 * Message Notification Service
 * 
 * Handles browser notifications for messages and broadcasts
 * Similar to geofencing alert-service.ts
 */

import { renderMentions } from '../utils/mention-parser';
import type { BroadcastPriority } from '../api/broadcast-api';

class MessageNotificationService {
    private isNotificationPermissionGranted = false;
    private lastMessageTimestamp: Map<string, Date> = new Map(); // hubId -> last message timestamp
    private currentHubId: string | null = null;
    private isOnMessagesPage = false;

    constructor() {
        this.checkNotificationPermission();
    }

    /**
     * Check existing notification permission (no prompt)
     */
    private checkNotificationPermission() {
        if ('Notification' in window) {
            this.isNotificationPermissionGranted = Notification.permission === 'granted';
        }
    }

    /**
     * Request notification permission
     */
    async requestNotificationPermission(): Promise<boolean> {
        if (!('Notification' in window)) {
            return false;
        }

        if (Notification.permission === 'granted') {
            this.isNotificationPermissionGranted = true;
            return true;
        }

        if (Notification.permission === 'denied') {
            return false;
        }

        try {
            const permission = await Notification.requestPermission();
            this.isNotificationPermissionGranted = permission === 'granted';
            return this.isNotificationPermissionGranted;
        } catch (error) {
            console.warn('Failed to request notification permission:', error);
            return false;
        }
    }

    /**
     * Set the current hub context
     */
    setCurrentHub(hubId: string | null) {
        this.currentHubId = hubId;
    }

    /**
     * Set whether user is on messages page
     */
    setIsOnMessagesPage(isOnPage: boolean) {
        this.isOnMessagesPage = isOnPage;
    }

    /**
     * Show notification for new message
     */
    showMessageNotification(
        hubId: string,
        senderName: string,
        messageText: string,
        mentionedUserIds: string[],
        currentUserId: string | undefined
    ): void {
        // Don't notify if user sent the message themselves
        if (currentUserId && mentionedUserIds.length === 0) {
            // Check if this is a regular message from someone else
            // We'll check this in the caller
        }

        // Don't notify if user is on messages page and viewing this hub
        if (this.isOnMessagesPage && hubId === this.currentHubId) {
            return;
        }

        if (!this.isNotificationPermissionGranted) {
            return;
        }

        // Clean up mention format for display
        const cleanText = renderMentions(messageText);
        const preview = cleanText.length > 100 ? cleanText.substring(0, 100) + '...' : cleanText;

        // Check if this is a mention
        const isMention = currentUserId ? mentionedUserIds.includes(currentUserId) : false;

        const title = isMention 
            ? `@${senderName} mentioned you`
            : `New message from ${senderName}`;
        
        const body = isMention ? cleanText : preview;

        const notification = new Notification(title, {
            body,
            icon: '/logo192.png',
            badge: '/favicon.ico',
            tag: `message-${hubId}`,
            requireInteraction: isMention, // Mentions require interaction
            data: {
                type: 'message',
                hubId,
                senderName,
                isMention,
            },
        });

        notification.onclick = () => {
            window.focus();
            notification.close();
            window.location.href = '/messages';
        };

        // Auto-close after 5 seconds for regular messages, 10 for mentions
        setTimeout(() => {
            notification.close();
        }, isMention ? 10000 : 5000);
    }

    /**
     * Show notification for new broadcast
     */
    showBroadcastNotification(
        hubId: string,
        senderName: string,
        title: string,
        message: string,
        priority: BroadcastPriority
    ): void {
        if (!this.isNotificationPermissionGranted) {
            return;
        }

        const preview = message.length > 150 ? message.substring(0, 150) + '...' : message;

        const notification = new Notification(
            priority === 'urgent' ? `🚨 ${title}` : title,
            {
                body: `${senderName}: ${preview}`,
                icon: '/logo192.png',
                badge: '/favicon.ico',
                tag: `broadcast-${hubId}`,
                requireInteraction: priority === 'urgent',
                data: {
                    type: 'broadcast',
                    hubId,
                    senderName,
                    priority,
                },
            }
        );

        notification.onclick = () => {
            window.focus();
            notification.close();
            window.location.href = '/messages';
        };

        // Duration based on priority: urgent > high > normal > low
        const duration = priority === 'urgent' ? 15000 
            : priority === 'high' ? 10000 
            : priority === 'normal' ? 7000 
            : 5000; // low priority
        setTimeout(() => {
            notification.close();
        }, duration);
    }

    /**
     * Check if notifications are supported
     */
    isNotificationSupported(): boolean {
        return 'Notification' in window;
    }

    /**
     * Get notification permission status
     */
    getNotificationPermissionStatus(): NotificationPermission {
        return 'Notification' in window ? Notification.permission : 'denied';
    }
}

// Export singleton instance
export const messageNotificationService = new MessageNotificationService();

