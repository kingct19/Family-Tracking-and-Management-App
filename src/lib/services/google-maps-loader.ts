/**
 * Google Maps Loader Service
 *
 * Singleton service to prevent multiple Loader initializations
 * with different options.
 * Supports Google Cloud Secret Manager for API key storage.
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
   * Get API key from:
   *  - .env directly in development (Vite DEV mode)
   *  - Google Cloud Secret Manager in production
   *  - .env as a final fallback
   */
  private async getApiKey(): Promise<string> {
    if (this.apiKey) {
      return this.apiKey;
    }

    const FALLBACK_ENV_VAR = 'VITE_GOOGLE_MAPS_API_KEY' as const;

    // 🔹 1) DEV: use Vite .env directly and DO NOT call Secret Manager
    if (import.meta.env.DEV) {
      const devKey =
        // index access for safety in case of custom typing
        (import.meta.env as any)[FALLBACK_ENV_VAR] ??
        import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

      if (devKey && devKey !== 'your-google-maps-api-key') {
        this.apiKey = devKey;
        return devKey;
      }

      console.warn(
        '[GoogleMapsLoader] Running in DEV but VITE_GOOGLE_MAPS_API_KEY is not set; falling back to Secret Manager.'
      );
    }

    // 🔹 2) PROD / fallback: fetch from Secret Manager (via backend helper)
    const secretKey = await getGoogleMapsApiKey();
    if (secretKey) {
      this.apiKey = secretKey;
      return secretKey;
    }

    // 🔹 3) Final fallback: try .env again (e.g., misconfigured Secret Manager)
    const envKey =
      (import.meta.env as any)[FALLBACK_ENV_VAR] ??
      import.meta.env.VITE_GOOGLE_MAPS_API_KEY ??
      '';

    if (envKey && envKey !== 'your-google-maps-api-key') {
      this.apiKey = envKey;
      return envKey;
    }

    throw new Error(
      'Google Maps API key is not configured. Set it in Google Cloud Secret Manager or VITE_GOOGLE_MAPS_API_KEY in .env'
    );
  }

  async load(_libraries: string[] = ['places', 'geometry', 'marker']): Promise<typeof google> {
    // If already loaded, return the existing promise
    if (this.isLoaded && this.loadPromise) {
      return this.loadPromise;
    }

    // If a load is in progress, reuse that promise
    if (this.loader && !this.isLoaded && this.loadPromise) {
      return this.loadPromise;
    }

    // Get API key (DEV: .env, PROD: Secret Manager)
    const apiKey = await this.getApiKey();

    // Create new loader with all required libraries
    this.loader = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['places', 'geometry', 'marker'], // always include all we need
    });

    this.loadPromise = this.loader.load();

    try {
      const googleObj = await this.loadPromise;
      this.isLoaded = true;
      return googleObj;
    } catch (error) {
      console.error('Failed to load Google Maps:', error);
      this.isLoaded = false;
      this.loadPromise = null;
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
