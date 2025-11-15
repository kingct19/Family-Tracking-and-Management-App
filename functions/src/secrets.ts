/**
 * Cloud Function to serve secrets securely
 * 
 * This function fetches secrets from Google Cloud Secret Manager
 * and serves them to the frontend via a secure API endpoint
 */

import { onRequest } from 'firebase-functions/v2/https';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import * as logger from 'firebase-functions/logger';

const client = new SecretManagerServiceClient();
const PROJECT_ID = process.env.GCLOUD_PROJECT || 'group-safety-app';

/**
 * Get secret from Secret Manager
 */
async function getSecret(secretName: string): Promise<string | null> {
    try {
        const name = `projects/${PROJECT_ID}/secrets/${secretName}/versions/latest`;
        const [version] = await client.accessSecretVersion({ name });
        
        if (version.payload?.data) {
            return version.payload.data.toString();
        }
        return null;
    } catch (error: any) {
        logger.error(`Error accessing secret ${secretName}:`, error);
        return null;
    }
}

/**
 * API endpoint to serve Google Maps API key
 * GET /api/secrets/GOOGLE_API_KEY
 */
export const getSecretValue = onRequest(
    {
        cors: true,
        maxInstances: 10,
    },
    async (req, res) => {
        // Only allow GET requests
        if (req.method !== 'GET') {
            res.status(405).json({ error: 'Method not allowed' });
            return;
        }

        // Extract secret name from path
        const secretName = req.path.split('/').pop();
        
        if (!secretName) {
            res.status(400).json({ error: 'Secret name is required' });
            return;
        }

        // Validate secret name (security: only allow specific secrets)
        const allowedSecrets = ['GOOGLE_API_KEY'];
        if (!allowedSecrets.includes(secretName)) {
            res.status(403).json({ error: 'Access denied' });
            return;
        }

        try {
            const secretValue = await getSecret(secretName);
            
            if (!secretValue) {
                res.status(404).json({ error: 'Secret not found' });
                return;
            }

            res.json({ value: secretValue });
        } catch (error: any) {
            logger.error('Error serving secret:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
);

