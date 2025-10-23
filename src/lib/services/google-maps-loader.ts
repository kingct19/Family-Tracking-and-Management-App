/**
 * Google Maps Loader Service
 * 
 * Singleton service to prevent multiple Loader initializations
 * with different options
 */

import { Loader } from '@googlemaps/js-api-loader';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

class GoogleMapsLoaderService {
    private static instance: GoogleMapsLoaderService;
    private loader: Loader | null = null;
    private isLoaded = false;
    private loadPromise: Promise<typeof google> | null = null;

    private constructor() {}

    static getInstance(): GoogleMapsLoaderService {
        if (!GoogleMapsLoaderService.instance) {
            GoogleMapsLoaderService.instance = new GoogleMapsLoaderService();
        }
        return GoogleMapsLoaderService.instance;
    }

    async load(libraries: string[] = ['places', 'geometry', 'marker']): Promise<typeof google> {
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

        // Create new loader with all required libraries
        this.loader = new Loader({
            apiKey: GOOGLE_MAPS_API_KEY,
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
