/**
 * ETA Service
 * 
 * Calculates estimated time of arrival using Google Maps Directions API
 */

export interface ETAResult {
    duration: number; // seconds
    distance: number; // meters
    durationText: string; // "15 mins"
    distanceText: string; // "5.2 km"
    route?: google.maps.DirectionsRoute;
}

interface DirectionsResponse {
    routes: Array<{
        legs: Array<{
            duration: { value: number; text: string };
            distance: { value: number; text: string };
        }>;
    }>;
    status: string;
    error_message?: string;
}

class ETAService {
    private cache = new Map<string, { result: ETAResult; timestamp: number }>();
    private readonly CACHE_DURATION = 60 * 1000; // 1 minute cache

    /**
     * Calculate ETA from origin to destination
     */
    async calculateETA(
        origin: { lat: number; lng: number },
        destination: { lat: number; lng: number },
        mode: 'driving' | 'walking' | 'transit' = 'driving'
    ): Promise<ETAResult | null> {
        const cacheKey = `${origin.lat.toFixed(4)},${origin.lng.toFixed(4)}-${destination.lat.toFixed(4)},${destination.lng.toFixed(4)}-${mode}`;
        
        // Check cache
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
            return cached.result;
        }

        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
            console.warn('Google Maps API key not configured');
            return null;
        }

        try {
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/directions/json?` +
                `origin=${origin.lat},${origin.lng}&` +
                `destination=${destination.lat},${destination.lng}&` +
                `mode=${mode}&` +
                `key=${apiKey as string}`
            );

            if (!response.ok) {
                throw new Error(`Directions API error: ${response.status}`);
            }

            const data: DirectionsResponse = await response.json();

            if (data.status === 'OK' && data.routes && data.routes.length > 0) {
                const route = data.routes[0];
                const leg = route.legs[0];
                
                const result: ETAResult = {
                    duration: leg.duration.value,
                    distance: leg.distance.value,
                    durationText: leg.duration.text,
                    distanceText: leg.distance.text,
                };

                // Cache the result
                this.cache.set(cacheKey, { result, timestamp: Date.now() });
                
                // Limit cache size
                if (this.cache.size > 50) {
                    const firstKey = this.cache.keys().next().value;
                    if (firstKey) {
                        this.cache.delete(firstKey);
                    }
                }

                return result;
            } else if (data.status === 'ZERO_RESULTS') {
                return null;
            } else {
                console.error('Directions API error:', data.status, data.error_message);
                return null;
            }
        } catch (error) {
            console.error('ETA calculation error:', error);
            return null;
        }
    }

    /**
     * Clear the cache
     */
    clearCache(): void {
        this.cache.clear();
    }
}

export const etaService = new ETAService();

