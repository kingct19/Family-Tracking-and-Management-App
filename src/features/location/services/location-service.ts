/**
 * Location Service
 * 
 * Handles real-time location tracking using W3C Geolocation API
 * - Watches user position continuously
 * - Provides location updates
 * - Handles permissions and errors
 */

export interface LocationCoordinates {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude?: number | null;
    altitudeAccuracy?: number | null;
    heading?: number | null;
    speed?: number | null;
    timestamp: number;
}

export interface LocationError {
    code: number;
    message: string;
}

export type LocationCallback = (location: LocationCoordinates) => void;
export type LocationErrorCallback = (error: LocationError) => void;

class LocationService {
    private watchId: number | null = null;
    private isWatching: boolean = false;
    private lastKnownPosition: LocationCoordinates | null = null;

    /**
     * Check if geolocation is supported by the browser
     */
    isSupported(): boolean {
        return 'geolocation' in navigator;
    }

    /**
     * Request location permission from user
     */
    async requestPermission(): Promise<boolean> {
        if (!this.isSupported()) {
            throw new Error('Geolocation is not supported by this browser');
        }

        try {
            // Try to get current position to trigger permission prompt
            await this.getCurrentPosition();
            return true;
        } catch (error) {
            console.error('Location permission denied:', error);
            return false;
        }
    }

    /**
     * Get current position once
     */
    getCurrentPosition(): Promise<LocationCoordinates> {
        return new Promise((resolve, reject) => {
            if (!this.isSupported()) {
                reject(new Error('Geolocation is not supported'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve(this.mapPosition(position));
                },
                (error) => {
                    reject(this.mapError(error));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 15000, // Increased to 15 seconds
                    maximumAge: 60000, // Accept cached position up to 1 minute old
                }
            );
        });
    }

    /**
     * Start watching user position with continuous updates
     */
    startWatching(
        onLocation: LocationCallback,
        onError?: LocationErrorCallback
    ): void {
        if (!this.isSupported()) {
            onError?.({
                code: 0,
                message: 'Geolocation is not supported',
            });
            return;
        }

        if (this.isWatching) {
            console.warn('Already watching location');
            return;
        }

        this.watchId = navigator.geolocation.watchPosition(
            (position) => {
                const mappedPosition = this.mapPosition(position);
                this.lastKnownPosition = mappedPosition; // Store last known position
                onLocation(mappedPosition);
            },
            (error) => {
                onError?.(this.mapError(error));
            },
            {
                enableHighAccuracy: false, // Use false for faster results, true for accuracy
                timeout: 15000, // 15 seconds timeout
                maximumAge: 30000, // Accept cached positions up to 30 seconds old
            }
        );

        this.isWatching = true;
    }

    /**
     * Stop watching user position
     */
    stopWatching(): void {
        if (this.watchId !== null) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
            this.isWatching = false;
        }
    }

    /**
     * Check if currently watching position
     */
    getWatchingStatus(): boolean {
        return this.isWatching;
    }

    /**
     * Get the last known position (if available)
     */
    getLastKnownPosition(): LocationCoordinates | null {
        return this.lastKnownPosition;
    }

    /**
     * Calculate distance between two coordinates using Haversine formula
     * Returns distance in meters
     */
    calculateDistance(
        coord1: { latitude: number; longitude: number },
        coord2: { latitude: number; longitude: number }
    ): number {
        const R = 6371e3; // Earth's radius in meters
        const φ1 = (coord1.latitude * Math.PI) / 180;
        const φ2 = (coord2.latitude * Math.PI) / 180;
        const Δφ = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
        const Δλ = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

        const a =
            Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }

    /**
     * Map native Position to our LocationCoordinates interface
     */
    private mapPosition(position: GeolocationPosition): LocationCoordinates {
        return {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            altitudeAccuracy: position.coords.altitudeAccuracy,
            heading: position.coords.heading,
            speed: position.coords.speed,
            timestamp: position.timestamp,
        };
    }

    /**
     * Map native GeolocationPositionError to our LocationError
     */
    private mapError(error: GeolocationPositionError): LocationError {
        const messages: Record<number, string> = {
            1: 'Location permission denied',
            2: 'Location position unavailable',
            3: 'Location request timeout',
        };

        return {
            code: error.code,
            message: messages[error.code] || 'Unknown location error',
        };
    }
}

// Export singleton instance
export const locationService = new LocationService();

