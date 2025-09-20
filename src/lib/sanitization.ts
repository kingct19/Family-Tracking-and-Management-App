import DOMPurify from 'dompurify';

// Sanitization configuration
const SANITIZE_CONFIG = {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
};

const STRICT_SANITIZE_CONFIG = {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
};

/**
 * Sanitizes HTML content for safe display
 * @param html - HTML string to sanitize
 * @param strict - Whether to use strict sanitization (no HTML tags)
 * @returns Sanitized HTML string
 */
export const sanitizeHtml = (html: string, strict = false): string => {
    if (!html || typeof html !== 'string') return '';

    const config = strict ? STRICT_SANITIZE_CONFIG : SANITIZE_CONFIG;
    return DOMPurify.sanitize(html, config);
};

/**
 * Sanitizes plain text by removing any HTML tags and encoding special characters
 * @param text - Text to sanitize
 * @returns Sanitized plain text
 */
export const sanitizeText = (text: string): string => {
    if (!text || typeof text !== 'string') return '';

    // Remove HTML tags and decode entities
    return DOMPurify.sanitize(text, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
        KEEP_CONTENT: true,
    }).trim();
};

/**
 * Sanitizes user input for database storage
 * @param input - User input to sanitize
 * @returns Sanitized input
 */
export const sanitizeInput = (input: string): string => {
    if (!input || typeof input !== 'string') return '';

    return sanitizeText(input)
        .replace(/[<>]/g, '') // Remove any remaining angle brackets
        .substring(0, 10000); // Limit length to prevent abuse
};

/**
 * Sanitizes file name for safe storage
 * @param filename - Original filename
 * @returns Sanitized filename
 */
export const sanitizeFilename = (filename: string): string => {
    if (!filename || typeof filename !== 'string') return 'unnamed';

    return filename
        .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscore
        .replace(/_{2,}/g, '_') // Replace multiple underscores with single
        .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
        .substring(0, 255); // Limit length
};

/**
 * Sanitizes URL for safe navigation
 * @param url - URL to sanitize
 * @returns Sanitized URL or empty string if invalid
 */
export const sanitizeUrl = (url: string): string => {
    if (!url || typeof url !== 'string') return '';

    try {
        const parsed = new URL(url);

        // Only allow http and https protocols
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            return '';
        }

        // Block common dangerous patterns
        const dangerousPatterns = [
            /javascript:/i,
            /data:/i,
            /vbscript:/i,
            /file:/i,
        ];

        if (dangerousPatterns.some(pattern => pattern.test(url))) {
            return '';
        }

        return parsed.toString();
    } catch {
        return '';
    }
};

/**
 * Sanitizes search query to prevent injection attacks
 * @param query - Search query to sanitize
 * @returns Sanitized query
 */
export const sanitizeSearchQuery = (query: string): string => {
    if (!query || typeof query !== 'string') return '';

    return sanitizeText(query)
        .replace(/[^\w\s-]/g, '') // Remove special characters except word chars, spaces, and hyphens
        .trim()
        .substring(0, 100); // Limit length
};

/**
 * Sanitizes JSON data for safe parsing
 * @param jsonString - JSON string to sanitize
 * @returns Sanitized JSON string
 */
export const sanitizeJson = (jsonString: string): string => {
    if (!jsonString || typeof jsonString !== 'string') return '{}';

    try {
        // Parse and stringify to remove any malicious content
        const parsed = JSON.parse(jsonString);
        return JSON.stringify(parsed);
    } catch {
        return '{}';
    }
};

/**
 * Creates a safe error message for user display
 * @param error - Error object or message
 * @returns Safe error message
 */
export const sanitizeErrorMessage = (error: unknown): string => {
    if (!error) return 'An unexpected error occurred';

    let message = '';

    if (error instanceof Error) {
        message = error.message;
    } else if (typeof error === 'string') {
        message = error;
    } else {
        message = 'An unexpected error occurred';
    }

    return sanitizeText(message);
};

/**
 * Sanitizes user profile data
 * @param profileData - User profile data
 * @returns Sanitized profile data
 */
export const sanitizeProfileData = (profileData: Record<string, any>): Record<string, any> => {
    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(profileData)) {
        if (typeof value === 'string') {
            sanitized[key] = sanitizeInput(value);
        } else if (typeof value === 'object' && value !== null) {
            sanitized[key] = sanitizeProfileData(value);
        } else {
            sanitized[key] = value;
        }
    }

    return sanitized;
};
