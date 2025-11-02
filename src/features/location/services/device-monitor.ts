/**
 * Device Monitor Service
 * 
 * Monitors device status:
 * - Battery level and charging state
 * - Online/offline status
 * - Last seen timestamp
 * - Platform information
 */

export interface DeviceStatus {
    batteryLevel: number | null;
    isCharging: boolean | null;
    isOnline: boolean;
    lastSeen: Date;
    platform: string;
    connectionType?: 'wifi' | 'cellular' | 'ethernet' | 'unknown';
}

type DeviceStatusCallback = (status: DeviceStatus) => void;

class DeviceMonitorService {
    private statusCallbacks: Set<DeviceStatusCallback> = new Set();
    private currentStatus: DeviceStatus | null = null;
    private batteryMonitor: any = null; // BatteryManager API
    private onlineListener: (() => void) | null = null;
    private updateInterval: number | null = null;
    private lastUpdateTime: number = Date.now();

    constructor() {
        this.initializeBatteryMonitoring();
        this.initializeOnlineMonitoring();
        this.startPeriodicUpdates();
    }

    /**
     * Initialize battery monitoring using Battery Manager API
     * Falls back gracefully if not supported
     */
    private async initializeBatteryMonitoring() {
        try {
            // Check if Battery Manager API is available
            if ('getBattery' in navigator && (navigator as any).getBattery) {
                const battery = await (navigator as any).getBattery();
                this.batteryMonitor = battery;

                // Listen for battery changes
                battery.addEventListener('chargingchange', () => {
                    this.updateStatus();
                });

                battery.addEventListener('levelchange', () => {
                    this.updateStatus();
                });

                // Initial update
                this.updateStatus();
            } else {
                console.log('🔋 Battery Manager API not supported, battery monitoring disabled');
            }
        } catch (error) {
            console.warn('Failed to initialize battery monitoring:', error);
        }
    }

    /**
     * Initialize online/offline status monitoring
     */
    private initializeOnlineMonitoring() {
        this.onlineListener = () => {
            this.updateStatus();
        };

        window.addEventListener('online', this.onlineListener);
        window.addEventListener('offline', this.onlineListener);

        // Initial update
        this.updateStatus();
    }

    /**
     * Start periodic status updates (every 30 seconds)
     */
    private startPeriodicUpdates() {
        this.updateInterval = window.setInterval(() => {
            this.updateStatus();
        }, 30000); // Update every 30 seconds
    }

    /**
     * Get current device status
     */
    private async updateStatus() {
        const now = Date.now();
        
        // Throttle updates to prevent excessive calls
        if (now - this.lastUpdateTime < 5000) {
            return;
        }
        this.lastUpdateTime = now;

        const status: DeviceStatus = {
            batteryLevel: null,
            isCharging: null,
            isOnline: navigator.onLine,
            lastSeen: new Date(),
            platform: this.getPlatform(),
            connectionType: await this.getConnectionType(),
        };

        // Get battery status if available
        if (this.batteryMonitor) {
            try {
                status.batteryLevel = Math.round(this.batteryMonitor.level * 100);
                status.isCharging = this.batteryMonitor.charging;
            } catch (error) {
                console.warn('Failed to read battery status:', error);
            }
        }

        this.currentStatus = status;
        this.notifyCallbacks(status);
    }

    /**
     * Get platform information
     */
    private getPlatform(): string {
        const ua = navigator.userAgent;
        
        if (/iPad|iPhone|iPod/.test(ua)) {
            return 'iOS';
        }
        if (/Android/.test(ua)) {
            return 'Android';
        }
        if (/Mac/.test(ua)) {
            return 'macOS';
        }
        if (/Win/.test(ua)) {
            return 'Windows';
        }
        if (/Linux/.test(ua)) {
            return 'Linux';
        }
        
        return 'Unknown';
    }

    /**
     * Get connection type (if available)
     */
    private async getConnectionType(): Promise<'wifi' | 'cellular' | 'ethernet' | 'unknown'> {
        try {
            // Check if Network Information API is available
            const connection = (navigator as any).connection || 
                             (navigator as any).mozConnection || 
                             (navigator as any).webkitConnection;

            if (connection) {
                const type = connection.effectiveType || connection.type;
                
                if (type.includes('wifi') || type === 'wifi') {
                    return 'wifi';
                }
                if (type.includes('cellular') || type.includes('4g') || type.includes('3g') || type.includes('2g')) {
                    return 'cellular';
                }
                if (type.includes('ethernet')) {
                    return 'ethernet';
                }
            }
        } catch (error) {
            console.warn('Failed to get connection type:', error);
        }

        return 'unknown';
    }

    /**
     * Subscribe to device status updates
     */
    subscribe(callback: DeviceStatusCallback): () => void {
        this.statusCallbacks.add(callback);

        // Immediately call with current status if available
        if (this.currentStatus) {
            callback(this.currentStatus);
        } else {
            // Otherwise trigger an update
            this.updateStatus();
        }

        // Return unsubscribe function
        return () => {
            this.statusCallbacks.delete(callback);
        };
    }

    /**
     * Notify all subscribers of status changes
     */
    private notifyCallbacks(status: DeviceStatus) {
        this.statusCallbacks.forEach(callback => {
            try {
                callback(status);
            } catch (error) {
                console.error('Error in device status callback:', error);
            }
        });
    }

    /**
     * Get current device status synchronously
     */
    getCurrentStatus(): DeviceStatus | null {
        return this.currentStatus;
    }

    /**
     * Check if battery monitoring is supported
     */
    isBatteryMonitoringSupported(): boolean {
        return this.batteryMonitor !== null;
    }

    /**
     * Cleanup resources
     */
    destroy() {
        if (this.onlineListener) {
            window.removeEventListener('online', this.onlineListener);
            window.removeEventListener('offline', this.onlineListener);
        }

        if (this.updateInterval !== null) {
            clearInterval(this.updateInterval);
        }

        this.statusCallbacks.clear();
    }
}

// Export singleton instance
export const deviceMonitor = new DeviceMonitorService();
