/**
 * Speed Monitor Service
 * 
 * Monitors user speed and detects when they exceed speed limits
 */

import { speedLimitService } from './speed-limit-api';

export interface SpeedAlert {
    userId: string;
    speed: number; // km/h
    speedLimit: number; // km/h
    location: { lat: number; lng: number };
    timestamp: Date;
    overLimit: number; // km/h over limit
}

class SpeedMonitorService {
    private speedThreshold = 10; // km/h over limit before alerting
    private lastAlerts = new Map<string, number>(); // userId -> lastAlertTime
    private readonly ALERT_COOLDOWN = 5 * 60 * 1000; // 5 minutes between alerts

    /**
     * Check if user is speeding and should trigger an alert
     */
    async checkSpeed(
        userId: string,
        speed: number, // km/h
        location: { lat: number; lng: number }
    ): Promise<SpeedAlert | null> {
        // Get speed limit (or use default)
        let speedLimit = await speedLimitService.getSpeedLimit(location);
        if (speedLimit === null) {
            speedLimit = speedLimitService.getDefaultSpeedLimit(location);
        }

        // Check if over threshold
        const overLimit = speed - speedLimit;
        if (overLimit < this.speedThreshold) {
            return null; // Not speeding enough
        }

        // Throttle alerts (max 1 per cooldown period)
        const lastAlert = this.lastAlerts.get(userId) || 0;
        if (Date.now() - lastAlert < this.ALERT_COOLDOWN) {
            return null; // Too soon since last alert
        }

        // Record alert time
        this.lastAlerts.set(userId, Date.now());

        return {
            userId,
            speed,
            speedLimit,
            location,
            timestamp: new Date(),
            overLimit: Math.round(overLimit),
        };
    }

    /**
     * Set speed threshold (how much over limit before alerting)
     */
    setSpeedThreshold(threshold: number): void {
        this.speedThreshold = threshold;
    }

    /**
     * Clear alert history for a user
     */
    clearUserHistory(userId: string): void {
        this.lastAlerts.delete(userId);
    }

    /**
     * Clear all alert history
     */
    clearAllHistory(): void {
        this.lastAlerts.clear();
    }
}

export const speedMonitorService = new SpeedMonitorService();


