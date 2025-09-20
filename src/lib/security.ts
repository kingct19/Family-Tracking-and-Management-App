// Content Security Policy configuration
export const CSP_DIRECTIVES = {
    'default-src': ["'self'"],
    'script-src': [
        "'self'",
        "'unsafe-inline'", // Required for Vite in development
        "'unsafe-eval'", // Required for Vite in development
        'https://www.gstatic.com',
        'https://www.google.com',
        'https://maps.googleapis.com',
        'https://maps.gstatic.com',
    ],
    'style-src': [
        "'self'",
        "'unsafe-inline'", // Required for Tailwind CSS
        'https://fonts.googleapis.com',
    ],
    'font-src': [
        "'self'",
        'https://fonts.gstatic.com',
        'data:',
    ],
    'img-src': [
        "'self'",
        'data:',
        'blob:',
        'https://firebasestorage.googleapis.com',
        'https://maps.googleapis.com',
        'https://maps.gstatic.com',
        'https://*.googleusercontent.com',
    ],
    'connect-src': [
        "'self'",
        'https://identitytoolkit.googleapis.com',
        'https://securetoken.googleapis.com',
        'https://firestore.googleapis.com',
        'https://storage.googleapis.com',
        'https://firebaseapp.com',
        'https://*.firebaseapp.com',
        'https://*.googleapis.com',
        'ws://localhost:*', // For development
        'wss://*.firebaseapp.com',
    ],
    'media-src': [
        "'self'",
        'blob:',
        'data:',
    ],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    'upgrade-insecure-requests': [],
};

// Generate CSP header value
export const generateCSPHeader = (isDevelopment = false): string => {
    const directives = { ...CSP_DIRECTIVES };

    if (isDevelopment) {
        // Allow more permissive settings in development
        directives['script-src'].push('http://localhost:*');
        directives['connect-src'].push('http://localhost:*');
    }

    return Object.entries(directives)
        .map(([directive, sources]) => {
            if (sources.length === 0) {
                return directive;
            }
            return `${directive} ${sources.join(' ')}`;
        })
        .join('; ');
};

// Security headers configuration
export const SECURITY_HEADERS = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',
};

// Rate limiting configuration
export const RATE_LIMITS = {
    login: { max: 5, window: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
    register: { max: 3, window: 60 * 60 * 1000 }, // 3 attempts per hour
    passwordReset: { max: 3, window: 60 * 60 * 1000 }, // 3 attempts per hour
    api: { max: 100, window: 15 * 60 * 1000 }, // 100 requests per 15 minutes
    locationUpdate: { max: 60, window: 60 * 1000 }, // 60 updates per minute
    message: { max: 30, window: 60 * 1000 }, // 30 messages per minute
};

// Input validation limits
export const VALIDATION_LIMITS = {
    email: { max: 254 },
    password: { min: 8, max: 128 },
    name: { min: 2, max: 50 },
    message: { max: 1000 },
    taskTitle: { min: 3, max: 100 },
    taskDescription: { max: 500 },
    hubName: { min: 2, max: 50 },
    hubDescription: { max: 200 },
    vaultTitle: { min: 2, max: 100 },
    vaultContent: { max: 10000 },
    searchQuery: { max: 100 },
    filename: { max: 255 },
};

// File upload restrictions
export const FILE_RESTRICTIONS = {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'text/plain',
    ],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.txt'],
};

// Session security
export const SESSION_CONFIG = {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    secure: true, // HTTPS only
    httpOnly: true,
    sameSite: 'strict' as const,
};

// Encryption configuration
export const ENCRYPTION_CONFIG = {
    algorithm: 'AES-GCM',
    keyLength: 256,
    ivLength: 12,
    tagLength: 16,
};

// Audit logging configuration
export const AUDIT_EVENTS = [
    'user_login',
    'user_logout',
    'user_register',
    'password_change',
    'profile_update',
    'hub_create',
    'hub_delete',
    'member_invite',
    'member_remove',
    'task_create',
    'task_complete',
    'location_share',
    'vault_access',
    'vault_create',
    'vault_update',
    'vault_delete',
    'admin_action',
    'security_event',
] as const;

export type AuditEvent = typeof AUDIT_EVENTS[number];

// Security utility functions
export const isSecureUrl = (url: string): boolean => {
    try {
        const parsed = new URL(url);
        return ['https:', 'http:'].includes(parsed.protocol) &&
            !parsed.hostname.includes('localhost') ||
            process.env.NODE_ENV === 'development';
    } catch {
        return false;
    }
};

export const generateSecureToken = (length = 32): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const randomArray = new Uint8Array(length);

    if (typeof window !== 'undefined' && window.crypto) {
        window.crypto.getRandomValues(randomArray);
    } else {
        // Fallback for server-side
        for (let i = 0; i < length; i++) {
            randomArray[i] = Math.floor(Math.random() * 256);
        }
    }

    for (let i = 0; i < length; i++) {
        result += chars[randomArray[i] % chars.length];
    }

    return result;
};

export const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const validateFileUpload = (file: File): { valid: boolean; error?: string } => {
    // Check file size
    if (file.size > FILE_RESTRICTIONS.maxSize) {
        return {
            valid: false,
            error: `File size must be less than ${FILE_RESTRICTIONS.maxSize / (1024 * 1024)}MB`
        };
    }

    // Check file type
    if (!FILE_RESTRICTIONS.allowedTypes.includes(file.type)) {
        return {
            valid: false,
            error: `File type ${file.type} is not allowed`
        };
    }

    // Check file extension
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!FILE_RESTRICTIONS.allowedExtensions.includes(extension)) {
        return {
            valid: false,
            error: `File extension ${extension} is not allowed`
        };
    }

    return { valid: true };
};
