/**
 * Google Maps Loader Service
 * 
 * Singleton service to prevent multiple Loader initializations
 * with different options
 * Supports Google Cloud Secret Manager for API key storage
 */

import { Loader } from '@googlemaps/js-api-loader';
import { getGoogleMapsApiKey } from './secret-manager';

class GoogleMapsLoaderService {
    private static instance: GoogleMapsLoaderService;
    private loader: Loader | null = null;
    private isLoaded = false;
    private loadPromise: Promise<typeof google> | null = null;
    private apiKey: string | null = null;

    private constructor() {}

    static getInstance(): GoogleMapsLoaderService {
        if (!GoogleMapsLoaderService.instance) {
            GoogleMapsLoaderService.instance = new GoogleMapsLoaderService();
        }
        return GoogleMapsLoaderService.instance;
    }

    /**
     * Get API key from Secret Manager or environment variable
     */
    private async getApiKey(): Promise<string> {
        if (this.apiKey) {
            return this.apiKey;
        }

        // Try to get from Secret Manager (or env fallback)
        const secretKey = await getGoogleMapsApiKey();
        
        if (secretKey) {
            this.apiKey = secretKey;
            return secretKey;
        }

        // Fallback to direct env variable
        const envKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
        if (envKey && envKey !== 'your-google-maps-api-key') {
            this.apiKey = envKey;
            return envKey;
        }

        throw new Error('Google Maps API key is not configured. Please set GOOGLE_API_KEY in Secret Manager or VITE_GOOGLE_MAPS_API_KEY in .env');
    }

    async load(_libraries: string[] = ['places', 'geometry', 'marker']): Promise<typeof google> {
        // If already loaded, return the existing promise
        if (this.isLoaded && this.loadPromise) {
            return this.loadPromise;
        }

        // If loader exists but with different libraries, we need to handle this
        if (this.loader && !this.isLoaded) {
            // Wait for existing load to complete
            if (this.loadPromise) {
                return this.loadPromise;
            }
        }

        // Get API key (from Secret Manager or env)
        const apiKey = await this.getApiKey();

        // Create new loader with all required libraries
        this.loader = new Loader({
            apiKey,
            version: 'weekly',
            libraries: ['places', 'geometry', 'marker'], // Always include all libraries
        });

        this.loadPromise = this.loader.load();
        
        try {
            const google = await this.loadPromise;
            this.isLoaded = true;
            return google;
        } catch (error) {
            console.error('Failed to load Google Maps:', error);
            throw error;
        }
    }

    isGoogleMapsLoaded(): boolean {
        return this.isLoaded;
    }

    getLoader(): Loader | null {
        return this.loader;
    }
}

// Export singleton instance
export const googleMapsLoader = GoogleMapsLoaderService.getInstance();
