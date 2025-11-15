/**
 * Google Cloud Secret Manager Service
 * 
 * Fetches secrets from Google Cloud Secret Manager
 * Falls back to environment variables for local development
 */

const SECRET_MANAGER_API_BASE = import.meta.env.VITE_SECRET_MANAGER_API_BASE || '/api/secrets';

/**
 * Fetch a secret from Google Cloud Secret Manager via API endpoint
 * Falls back to environment variable if API is not available
 */
export async function getSecret(secretName: string, fallbackEnvVar?: string): Promise<string | null> {
    // In development, prefer environment variable
    if (import.meta.env.DEV && fallbackEnvVar) {
        const envValue = import.meta.env[fallbackEnvVar];
        if (envValue && envValue !== `your-${secretName.toLowerCase().replace(/_/g, '-')}`) {
            return envValue;
        }
    }

    try {
        // Try to fetch from API endpoint (Cloud Function or backend)
        const response = await fetch(`${SECRET_MANAGER_API_BASE}/${secretName}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const data = await response.json();
            return data.value || null;
        }
    } catch (error) {
        console.warn(`Failed to fetch secret ${secretName} from API:`, error);
    }

    // Fallback to environment variable
    if (fallbackEnvVar) {
        const envValue = import.meta.env[fallbackEnvVar];
        if (envValue && envValue !== `your-${secretName.toLowerCase().replace(/_/g, '-')}`) {
            return envValue;
        }
    }

    return null;
}

/**
 * Get Google Maps API Key
 * Tries Secret Manager first, then falls back to VITE_GOOGLE_MAPS_API_KEY
 */
export async function getGoogleMapsApiKey(): Promise<string | null> {
    return getSecret('GOOGLE_API_KEY', 'VITE_GOOGLE_MAPS_API_KEY');
}

