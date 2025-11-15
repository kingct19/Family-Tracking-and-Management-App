import { validateInput } from './validation';
import { sanitizeInput, sanitizeErrorMessage } from './sanitization';
import { RATE_LIMITS, generateSecureToken, generateCSPHeader } from './security';

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Rate limiting middleware
 */
export const rateLimit = (limit: { max: number; window: number }) => {
    return (identifier: string): { allowed: boolean; remaining: number; resetTime: number } => {
        const now = Date.now();
        const key = `rate_limit_${identifier}`;
        const stored = rateLimitStore.get(key);

        if (!stored || now > stored.resetTime) {
            // Reset or create new entry
            const resetTime = now + limit.window;
            rateLimitStore.set(key, { count: 1, resetTime });
            return { allowed: true, remaining: limit.max - 1, resetTime };
        }

        if (stored.count >= limit.max) {
            return { allowed: false, remaining: 0, resetTime: stored.resetTime };
        }

        // Increment count
        stored.count++;
        rateLimitStore.set(key, stored);

        return {
            allowed: true,
            remaining: limit.max - stored.count,
            resetTime: stored.resetTime
        };
    };
};

/**
 * Input validation middleware
 */
export const validateRequest = <T>(schema: any) => {
    return (data: unknown): { valid: boolean; data?: T; error?: string } => {
        const result = validateInput(schema, data);

        if (!result.success) {
            return {
                valid: false,
                error: sanitizeErrorMessage(result.errors?.join(', ') || 'Invalid input')
            };
        }

        return { valid: true, data: result.data as T };
    };
};

/**
 * Request sanitization middleware
 */
export const sanitizeRequest = (data: Record<string, any>): Record<string, any> => {
    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'string') {
            sanitized[key] = sanitizeInput(value);
        } else if (typeof value === 'object' && value !== null) {
            sanitized[key] = sanitizeRequest(value);
        } else {
            sanitized[key] = value;
        }
    }

    return sanitized;
};

/**
 * Security headers middleware
 */
export const securityHeaders = (isDevelopment = false) => {
    return {
        'Content-Security-Policy': generateCSPHeader(isDevelopment),
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    };
};

/**
 * Authentication middleware
 */
export const requireAuth = (user: any): { authorized: boolean; error?: string } => {
    if (!user) {
        return { authorized: false, error: 'Authentication required' };
    }

    if (!user.emailVerified && user.email) {
        return { authorized: false, error: 'Email verification required' };
    }

    return { authorized: true };
};

/**
 * Role-based access control middleware
 */
export const requireRole = (user: any, requiredRoles: string[]): { authorized: boolean; error?: string } => {
    const authResult = requireAuth(user);
    if (!authResult.authorized) {
        return authResult;
    }

    const userRole = user.role || 'viewer';
    if (!requiredRoles.includes(userRole)) {
        return { authorized: false, error: 'Insufficient permissions' };
    }

    return { authorized: true };
};

/**
 * Hub membership middleware
 */
export const requireHubMembership = (user: any, hubId: string): { authorized: boolean; error?: string } => {
    const authResult = requireAuth(user);
    if (!authResult.authorized) {
        return authResult;
    }

    const userHubs = user.hubs || [];
    if (!userHubs.includes(hubId)) {
        return { authorized: false, error: 'Hub membership required' };
    }

    return { authorized: true };
};

/**
 * CSRF protection middleware
 */
export const csrfProtection = (requestToken: string, sessionToken: string): { valid: boolean; error?: string } => {
    if (!requestToken || !sessionToken) {
        return { valid: false, error: 'CSRF token required' };
    }

    if (requestToken !== sessionToken) {
        return { valid: false, error: 'Invalid CSRF token' };
    }

    return { valid: true };
};

/**
 * Request logging middleware
 */
export const logRequest = (action: string, userId?: string, metadata?: Record<string, any>) => {
    const logEntry = {
        timestamp: new Date().toISOString(),
        action,
        userId: userId || 'anonymous',
        metadata: metadata ? sanitizeRequest(metadata) : {},
        ip: 'unknown', // Would be extracted from request in real implementation
    };

    // In production, send to logging service
    console.log('Security Log:', JSON.stringify(logEntry));
};

/**
 * Error handling middleware
 */
export const secureErrorHandler = (error: unknown): { message: string; code: string } => {
    const sanitizedMessage = sanitizeErrorMessage(error);

    // Don't expose internal error details
    const safeMessage = sanitizedMessage.includes('internal') ||
        sanitizedMessage.includes('database') ||
        sanitizedMessage.includes('firebase')
        ? 'An unexpected error occurred'
        : sanitizedMessage;

    return {
        message: safeMessage,
        code: 'SECURITY_ERROR'
    };
};

/**
 * Session security middleware
 */
export const secureSession = () => {
    return {
        generateSessionId: () => generateSecureToken(32),
        generateCSRFToken: () => generateSecureToken(16),
        validateSession: (sessionId: string): boolean => {
            // In production, validate against session store
            return Boolean(sessionId && sessionId.length >= 16);
        }
    };
};

/**
 * API security wrapper
 */
export const secureApiCall = async <T>(
    operation: () => Promise<T>,
    options: {
        rateLimitKey?: string;
        requireAuth?: boolean;
        user?: any;
        requiredRoles?: string[];
        hubId?: string;
        auditAction?: string;
    } = {}
): Promise<{ success: boolean; data?: T; error?: string }> => {
    try {
        // Rate limiting
        if (options.rateLimitKey) {
            const rateLimiter = rateLimit(RATE_LIMITS.api);
            const rateResult = rateLimiter(options.rateLimitKey);
            if (!rateResult.allowed) {
                return { success: false, error: 'Rate limit exceeded' };
            }
        }

        // Authentication
        if (options.requireAuth) {
            const authResult = requireAuth(options.user);
            if (!authResult.authorized) {
                return { success: false, error: authResult.error };
            }
        }

        // Role-based access
        if (options.requiredRoles && options.user) {
            const roleResult = requireRole(options.user, options.requiredRoles);
            if (!roleResult.authorized) {
                return { success: false, error: roleResult.error };
            }
        }

        // Hub membership
        if (options.hubId && options.user) {
            const hubResult = requireHubMembership(options.user, options.hubId);
            if (!hubResult.authorized) {
                return { success: false, error: hubResult.error };
            }
        }

        // Execute operation
        const result = await operation();

        // Audit logging
        if (options.auditAction) {
            logRequest(options.auditAction, options.user?.uid);
        }

        return { success: true, data: result };
    } catch (error) {
        const secureError = secureErrorHandler(error);
        return { success: false, error: secureError.message };
    }
};
