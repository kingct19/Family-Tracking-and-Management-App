/**
 * Geocoding Service
 * 
 * Reverse geocoding to convert coordinates to addresses
 * Uses Google Maps Geocoding API with caching
 */

export interface Address {
    formatted: string;
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
}

interface GeocodeResult {
    formatted_address: string;
    address_components: Array<{
        long_name: string;
        short_name: string;
        types: string[];
    }>;
}

class GeocodingService {
    private cache = new Map<string, Address>();
    private readonly CACHE_PRECISION = 4; // Decimal places for cache key

    /**
     * Reverse geocode coordinates to address
     */
    async reverseGeocode(lat: number, lng: number): Promise<Address | null> {
        const cacheKey = `${lat.toFixed(this.CACHE_PRECISION)},${lng.toFixed(this.CACHE_PRECISION)}`;
        
        // Check cache first
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey)!;
        }

        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
            console.warn('Google Maps API key not configured');
            return null;
        }

        try {
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey as string}`
            );

            if (!response.ok) {
                throw new Error(`Geocoding API error: ${response.status}`);
            }

            const data = await response.json();

            if (data.status === 'OK' && data.results && data.results.length > 0) {
                const result: GeocodeResult = data.results[0];
                const address = this.parseAddress(result);
                
                // Cache the result
                this.cache.set(cacheKey, address);
                
                // Limit cache size (keep last 100)
                if (this.cache.size > 100) {
                    const firstKey = this.cache.keys().next().value;
                    if (firstKey) {
                        this.cache.delete(firstKey);
                    }
                }
                
                return address;
            } else if (data.status === 'ZERO_RESULTS') {
                return null;
            } else {
                console.error('Geocoding error:', data.status, data.error_message);
                return null;
            }
        } catch (error) {
            console.error('Geocoding service error:', error);
            return null;
        }
    }

    /**
     * Parse Google Geocoding API result into Address object
     */
    private parseAddress(result: GeocodeResult): Address {
        const components = result.address_components || [];
        
        const address: Address = {
            formatted: result.formatted_address,
        };

        components.forEach((component) => {
            const types = component.types;
            
            if (types.includes('street_number')) {
                address.street = (address.street || '') + component.long_name + ' ';
            } else if (types.includes('route')) {
                address.street = (address.street || '') + component.long_name;
            } else if (types.includes('locality')) {
                address.city = component.long_name;
            } else if (types.includes('administrative_area_level_1')) {
                address.state = component.long_name;
            } else if (types.includes('postal_code')) {
                address.zipCode = component.long_name;
            } else if (types.includes('country')) {
                address.country = component.long_name;
            }
        });

        // Clean up street (remove trailing space)
        if (address.street) {
            address.street = address.street.trim();
        }

        return address;
    }

    /**
     * Clear the cache
     */
    clearCache(): void {
        this.cache.clear();
    }

    /**
     * Get cache size
     */
    getCacheSize(): number {
        return this.cache.size;
    }
}

export const geocodingService = new GeocodingService();
