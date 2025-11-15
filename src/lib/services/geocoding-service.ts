/**
 * Geocoding Service
 * 
 * Reverse geocoding using Google Maps Geocoding API
 * - Get address from coordinates
 * - Handle errors gracefully
 */

import { googleMapsLoader } from './google-maps-loader';

export interface GeocodeResult {
    address: string;
    formattedAddress?: string;
    components?: {
        street?: string;
        city?: string;
        state?: string;
        country?: string;
        postalCode?: string;
    };
}

/**
 * Reverse geocode coordinates to get address
 */
export const reverseGeocode = async (
    latitude: number,
    longitude: number
): Promise<GeocodeResult | null> => {
    try {
        // Load Google Maps if not already loaded
        const google = await googleMapsLoader.load();

        // Create geocoder instance
        const geocoder = new google.maps.Geocoder();

        // Perform reverse geocoding
        return new Promise((resolve, reject) => {
            geocoder.geocode(
                {
                    location: { lat: latitude, lng: longitude },
                },
                (results, status) => {
                    if (status === 'OK' && results && results.length > 0) {
                        const result = results[0];
                        const addressComponents = result.address_components || [];
                        
                        // Extract address components
                        const components: GeocodeResult['components'] = {};
                        
                        addressComponents.forEach((component) => {
                            const types = component.types;
                            if (types.includes('street_number') || types.includes('route')) {
                                components.street = component.long_name;
                            } else if (types.includes('locality')) {
                                components.city = component.long_name;
                            } else if (types.includes('administrative_area_level_1')) {
                                components.state = component.short_name;
                            } else if (types.includes('country')) {
                                components.country = component.short_name;
                            } else if (types.includes('postal_code')) {
                                components.postalCode = component.short_name;
                            }
                        });

                        // Build formatted address
                        const formattedAddress = result.formatted_address;

                        // Build simple address string
                        const addressParts: string[] = [];
                        if (components.street) addressParts.push(components.street);
                        if (components.city) addressParts.push(components.city);
                        if (components.state) addressParts.push(components.state);
                        const address = addressParts.length > 0 
                            ? addressParts.join(', ') 
                            : result.formatted_address || `${latitude}, ${longitude}`;

                        resolve({
                            address,
                            formattedAddress,
                            components,
                        });
                    } else {
                        // Geocoding failed - return null (not an error)
                        console.warn('Reverse geocoding failed:', status);
                        resolve(null);
                    }
                }
            );
        });
    } catch (error) {
        // Geocoding service not available - return null (not an error)
        console.warn('Geocoding service not available:', error);
        return null;
    }
};

/**
 * Get a simple address string from coordinates
 * Returns coordinates if geocoding fails
 */
export const getAddressFromCoordinates = async (
    latitude: number,
    longitude: number
): Promise<string> => {
    const result = await reverseGeocode(latitude, longitude);
    return result?.address || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
};

