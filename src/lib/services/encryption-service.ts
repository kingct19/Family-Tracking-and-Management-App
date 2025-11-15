/**
 * Encryption Service
 * 
 * Client-side encryption for vault items using Web Crypto API
 * AES-GCM encryption with 256-bit keys
 */

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96 bits for GCM
const TAG_LENGTH = 128; // 128 bits for GCM

/**
 * Derive encryption key from PIN/password using PBKDF2
 */
async function deriveKey(
    password: string,
    salt: Uint8Array
): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const passwordKey = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        'PBKDF2',
        false,
        ['deriveBits', 'deriveKey']
    );

    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt.buffer as ArrayBuffer,
            iterations: 100000,
            hash: 'SHA-256',
        },
        passwordKey,
        {
            name: ALGORITHM,
            length: KEY_LENGTH,
        },
        false,
        ['encrypt', 'decrypt']
    );
}

/**
 * Generate a random salt
 */
export function generateSalt(): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(16));
}

/**
 * Encrypt data with a password
 */
export async function encrypt(
    data: string,
    password: string,
    salt?: Uint8Array
): Promise<{ ciphertext: string; salt: string; iv: string }> {
    const dataEncoder = new TextEncoder();
    const dataBuffer = dataEncoder.encode(data);

    // Generate salt if not provided
    const encryptionSalt = salt || generateSalt();

    // Derive key from password
    const key = await deriveKey(password, encryptionSalt);

    // Generate IV
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

    // Encrypt
    const encrypted = await crypto.subtle.encrypt(
        {
            name: ALGORITHM,
            iv,
            tagLength: TAG_LENGTH,
        },
        key,
        dataBuffer
    );

    // Convert to base64 for storage
    const ciphertext = btoa(
        String.fromCharCode(...new Uint8Array(encrypted))
    );
    const saltBase64 = btoa(String.fromCharCode(...encryptionSalt));
    const ivBase64 = btoa(String.fromCharCode(...iv));

    return {
        ciphertext,
        salt: saltBase64,
        iv: ivBase64,
    };
}

/**
 * Decrypt data with a password
 */
export async function decrypt(
    ciphertext: string,
    password: string,
    salt: string,
    iv: string
): Promise<string> {
    // Convert from base64
    const ciphertextBytes = Uint8Array.from(
        atob(ciphertext),
        (c) => c.charCodeAt(0)
    );
    const saltBytes = Uint8Array.from(atob(salt), (c) => c.charCodeAt(0));
    const ivBytes = Uint8Array.from(atob(iv), (c) => c.charCodeAt(0));

    // Derive key from password
    const key = await deriveKey(password, saltBytes);

    // Decrypt
    const decrypted = await crypto.subtle.decrypt(
        {
            name: ALGORITHM,
            iv: ivBytes,
            tagLength: TAG_LENGTH,
        },
        key,
        ciphertextBytes
    );

    // Convert to string
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
}

/**
 * Hash PIN for storage (using SHA-256)
 * Note: This is for PIN verification, not encryption
 */
export async function hashPIN(pin: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(pin);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

