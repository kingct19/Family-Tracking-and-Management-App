/**
 * Geofence Detection Service
 * 
 * Handles real-time geofence entry/exit detection
 */

import type { LocationCoordinates } from '../../location/services/location-service';
import type {
    GeofenceZone,
    GeofenceDetectionResult,
    GeofenceEvent,
} from '../types';

export interface GeofenceState {
    geofenceId: string;
    isInside: boolean;
    lastEvent?: GeofenceEvent;
}

class GeofenceDetectionService {
    private userStates = new Map<string, Map<string, GeofenceState>>(); // userId -> geofenceId -> state
    private detectionCallbacks: ((result: GeofenceDetectionResult) => void)[] = [];

    /**
     * Check if a location is inside a geofence
     */
    private isLocationInsideGeofence(
        location: LocationCoordinates,
        geofence: GeofenceZone
    ): boolean {
        const distance = this.calculateDistance(
            location.latitude,
            location.longitude,
            geofence.center.latitude,
            geofence.center.longitude
        );

        return distance <= geofence.radius;
    }

    /**
     * Calculate distance between two points using Haversine formula
     */
    private calculateDistance(
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number
    ): number {
        const R = 6371e3; // Earth's radius in meters
        const φ1 = (lat1 * Math.PI) / 180;
        const φ2 = (lat2 * Math.PI) / 180;
        const Δφ = ((lat2 - lat1) * Math.PI) / 180;
        const Δλ = ((lon2 - lon1) * Math.PI) / 180;

        const a =
            Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Distance in meters
    }

    /**
     * Check geofence state for a user's location
     */
    checkGeofenceState(
        userId: string,
        location: LocationCoordinates,
        geofences: GeofenceZone[]
    ): GeofenceDetectionResult[] {
        const results: GeofenceDetectionResult[] = [];
        const userStates = this.userStates.get(userId) || new Map();
        this.userStates.set(userId, userStates);

        for (const geofence of geofences) {
            if (!geofence.isActive) continue;

            const isInside = this.isLocationInsideGeofence(location, geofence);
            const currentState = userStates.get(geofence.id);
            const wasInside = currentState?.isInside || false;

            // Update state
            userStates.set(geofence.id, {
                geofenceId: geofence.id,
                isInside,
                lastEvent: currentState?.lastEvent,
            });

            // Detect entry
            if (!wasInside && isInside) {
                const result: GeofenceDetectionResult = {
                    geofenceId: geofence.id,
                    geofenceName: geofence.name,
                    eventType: 'entry',
                    distance: this.calculateDistance(
                        location.latitude,
                        location.longitude,
                        geofence.center.latitude,
                        geofence.center.longitude
                    ),
                    accuracy: location.accuracy,
                };

                results.push(result);
                this.notifyCallbacks(result);
            }

            // Detect exit
            if (wasInside && !isInside) {
                const result: GeofenceDetectionResult = {
                    geofenceId: geofence.id,
                    geofenceName: geofence.name,
                    eventType: 'exit',
                    distance: this.calculateDistance(
                        location.latitude,
                        location.longitude,
                        geofence.center.latitude,
                        geofence.center.longitude
                    ),
                    accuracy: location.accuracy,
                };

                results.push(result);
                this.notifyCallbacks(result);
            }
        }

        return results;
    }

    /**
     * Add callback for geofence detection events
     */
    onDetection(callback: (result: GeofenceDetectionResult) => void): () => void {
        this.detectionCallbacks.push(callback);
        
        // Return unsubscribe function
        return () => {
            const index = this.detectionCallbacks.indexOf(callback);
            if (index > -1) {
                this.detectionCallbacks.splice(index, 1);
            }
        };
    }

    /**
     * Notify all callbacks of a detection event
     */
    private notifyCallbacks(result: GeofenceDetectionResult): void {
        this.detectionCallbacks.forEach(callback => {
            try {
                callback(result);
            } catch (error) {
                console.error('Error in geofence detection callback:', error);
            }
        });
    }

    /**
     * Get current state for a user
     */
    getUserState(userId: string): Map<string, GeofenceState> {
        return this.userStates.get(userId) || new Map();
    }

    /**
     * Clear state for a user (when they log out)
     */
    clearUserState(userId: string): void {
        this.userStates.delete(userId);
    }

    /**
     * Clear all states
     */
    clearAllStates(): void {
        this.userStates.clear();
    }
}

// Export singleton instance
export const geofenceDetectionService = new GeofenceDetectionService();
