/**
 * Vault Storage Service
 * 
 * Manages PIN storage and session state in localStorage
 * PIN hash is stored (never plain PIN)
 */

const VAULT_PIN_KEY = 'vault_pin_hash';
const VAULT_SESSION_KEY = 'vault_session';
const VAULT_SESSION_DURATION = 15 * 60 * 1000; // 15 minutes

/**
 * Store PIN hash (never store plain PIN)
 */
export function storePINHash(pinHash: string): void {
    localStorage.setItem(VAULT_PIN_KEY, pinHash);
}

/**
 * Get stored PIN hash
 */
export function getPINHash(): string | null {
    return localStorage.getItem(VAULT_PIN_KEY);
}

/**
 * Check if PIN is set up
 */
export function hasPIN(): boolean {
    return getPINHash() !== null;
}

/**
 * Clear PIN hash (for logout/reset)
 */
export function clearPINHash(): void {
    localStorage.removeItem(VAULT_PIN_KEY);
    clearVaultSession();
}

/**
 * Create vault session (user has authenticated)
 */
export function createVaultSession(): void {
    const expiresAt = Date.now() + VAULT_SESSION_DURATION;
    localStorage.setItem(VAULT_SESSION_KEY, expiresAt.toString());
}

/**
 * Check if vault session is valid
 */
export function isVaultSessionValid(): boolean {
    const expiresAt = localStorage.getItem(VAULT_SESSION_KEY);
    if (!expiresAt) return false;
    
    const expires = parseInt(expiresAt, 10);
    if (Date.now() > expires) {
        clearVaultSession();
        return false;
    }
    
    return true;
}

/**
 * Clear vault session
 */
export function clearVaultSession(): void {
    localStorage.removeItem(VAULT_SESSION_KEY);
}

/**
 * Extend vault session
 */
export function extendVaultSession(): void {
    if (isVaultSessionValid()) {
        createVaultSession();
    }
}

