/**
 * Alert Service
 * 
 * Handles geofence alert notifications
 * - Browser notifications
 * - Sound alerts
 * - Visual toasts
 */

export interface GeofenceAlert {
    id: string;
    geofenceId: string;
    geofenceName: string;
    userId: string;
    type: 'entry' | 'exit';
    timestamp: Date;
    location: {
        latitude: number;
        longitude: number;
    };
    message: string;
    isRead: boolean;
}

class AlertService {
    private notifications: GeofenceAlert[] = [];
    private audioContext: AudioContext | null = null;
    private isNotificationPermissionGranted = false;

    constructor() {
        this.initializeAudioContext();
        // Check existing permission, but don't request automatically
        // (must be requested from user gesture)
        try {
            this.checkNotificationPermission();
        } catch (error) {
            // Silently fail - permission check shouldn't throw
            if (process.env.NODE_ENV === 'development') {
                console.warn('Failed to check notification permission:', error);
            }
        }
    }

    // Initialize Web Audio API for sound alerts
    private initializeAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch (error) {
            console.warn('Web Audio API not supported:', error);
        }
    }

    // Check existing notification permission (no prompt)
    private checkNotificationPermission() {
        if ('Notification' in window) {
            this.isNotificationPermissionGranted = Notification.permission === 'granted';
        }
    }

    // Request notification permission (must be called from user gesture)
    async requestNotificationPermission(): Promise<boolean> {
        if (!('Notification' in window)) {
            return false;
        }

        // If already granted, return true
        if (Notification.permission === 'granted') {
            this.isNotificationPermissionGranted = true;
            return true;
        }

        // If denied, return false
        if (Notification.permission === 'denied') {
            return false;
        }

        // Request permission (must be called from user gesture)
        try {
            const permission = await Notification.requestPermission();
            this.isNotificationPermissionGranted = permission === 'granted';
            return this.isNotificationPermissionGranted;
        } catch (error) {
            console.warn('Failed to request notification permission:', error);
            return false;
        }
    }

    // Create a new alert
    createAlert(
        geofenceId: string,
        geofenceName: string,
        userId: string,
        type: 'entry' | 'exit',
        location: { latitude: number; longitude: number }
    ): GeofenceAlert {
        const alert: GeofenceAlert = {
            id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            geofenceId,
            geofenceName,
            userId,
            type,
            timestamp: new Date(),
            location,
            message: this.generateAlertMessage(geofenceName, type),
            isRead: false,
        };

        this.notifications.unshift(alert); // Add to beginning
        this.showAlert(alert);
        
        return alert;
    }

    // Generate alert message
    private generateAlertMessage(geofenceName: string, type: 'entry' | 'exit'): string {
        const action = type === 'entry' ? 'entered' : 'left';
        return `Family member ${action} ${geofenceName}`;
    }

    // Show alert (notification + sound + visual)
    private async showAlert(alert: GeofenceAlert) {
        // Browser notification
        if (this.isNotificationPermissionGranted) {
            new Notification('Geofence Alert', {
                body: alert.message,
                icon: '/logo192.png',
                tag: alert.id,
                requireInteraction: true,
            });
        }

        // Sound alert
        this.playAlertSound();

        // Visual toast (will be handled by UI components)
        this.dispatchAlertEvent(alert);
    }

    // Play alert sound
    private playAlertSound() {
        if (!this.audioContext) return;

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            // Create a pleasant alert sound
            oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
            oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime + 0.2);

            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.5);
        } catch (error) {
            console.warn('Failed to play alert sound:', error);
        }
    }

    // Dispatch custom event for UI components
    private dispatchAlertEvent(alert: GeofenceAlert) {
        const event = new CustomEvent('geofenceAlert', {
            detail: alert,
        });
        window.dispatchEvent(event);
    }

    // Get all alerts
    getAlerts(): GeofenceAlert[] {
        return [...this.notifications];
    }

    // Get unread alerts
    getUnreadAlerts(): GeofenceAlert[] {
        return this.notifications.filter(alert => !alert.isRead);
    }

    // Mark alert as read
    markAsRead(alertId: string) {
        const alert = this.notifications.find(a => a.id === alertId);
        if (alert) {
            alert.isRead = true;
        }
    }

    // Mark all alerts as read
    markAllAsRead() {
        this.notifications.forEach(alert => {
            alert.isRead = true;
        });
    }

    // Clear old alerts (older than 24 hours)
    clearOldAlerts() {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        this.notifications = this.notifications.filter(alert => alert.timestamp > oneDayAgo);
    }

    // Get notification permission status
    getNotificationPermissionStatus(): NotificationPermission {
        return 'Notification' in window ? Notification.permission : 'denied';
    }

    // Check if notifications are supported
    isNotificationSupported(): boolean {
        return 'Notification' in window;
    }
}

// Export singleton instance
export const alertService = new AlertService();
