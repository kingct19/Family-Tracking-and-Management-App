import { useState, useCallback } from 'react';
import { z } from 'zod';
import { validateInput } from '@/lib/validation';
import { sanitizeInput } from '@/lib/sanitization';
import { rateLimit } from '@/lib/security-middleware';

interface FormState<T> {
    data: T;
    errors: Record<keyof T, string>;
    isSubmitting: boolean;
    isValid: boolean;
}

interface UseSecureFormOptions<T> {
    schema: z.ZodSchema<T>;
    initialData: T;
    rateLimitKey?: string;
    onSubmit: (data: T) => Promise<void>;
}

export const useSecureForm = <T extends Record<string, any>>({
    schema,
    initialData,
    rateLimitKey,
    onSubmit
}: UseSecureFormOptions<T>) => {
    const [formState, setFormState] = useState<FormState<T>>({
        data: initialData,
        errors: {} as Record<keyof T, string>,
        isSubmitting: false,
        isValid: false,
    });

    // Validate form data
    const validateForm = useCallback((data: T): boolean => {
        const result = validateInput(schema, data);

        if (!result.success) {
            const errors: Record<keyof T, string> = {} as Record<keyof T, string>;
            result.errors?.forEach(error => {
                // Parse field name from error message
                const fieldMatch = error.match(/^([^:]+):/);
                if (fieldMatch) {
                    const field = fieldMatch[1] as keyof T;
                    errors[field] = error.replace(/^[^:]+:\s*/, '');
                }
            });

            setFormState(prev => ({ ...prev, errors, isValid: false }));
            return false;
        }

        setFormState(prev => ({ ...prev, errors: {} as Record<keyof T, string>, isValid: true }));
        return true;
    }, [schema]);

    // Update field value with sanitization
    const updateField = useCallback((field: keyof T, value: any) => {
        const sanitizedValue = typeof value === 'string' ? sanitizeInput(value) : value;

        setFormState(prev => {
            const newData = { ...prev.data, [field]: sanitizedValue };
            const isValid = validateForm(newData);

            return {
                ...prev,
                data: newData,
                isValid,
            };
        });
    }, [validateForm]);

    // Handle form submission
    const handleSubmit = useCallback(async (e?: React.FormEvent) => {
        e?.preventDefault();

        if (!validateForm(formState.data)) {
            return;
        }

        // Rate limiting check
        if (rateLimitKey) {
            const rateLimitResult = rateLimit({ max: 5, window: 60000 }); // 5 requests per minute
            if (!rateLimitResult(rateLimitKey).allowed) {
                setFormState(prev => ({
                    ...prev,
                    errors: { ...prev.errors, [Object.keys(initialData)[0] as keyof T]: 'Too many requests. Please try again later.' }
                }));
                return;
            }
        }

        setFormState(prev => ({ ...prev, isSubmitting: true }));

        try {
            await onSubmit(formState.data);
            setFormState(prev => ({ ...prev, isSubmitting: false }));
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
            setFormState(prev => ({
                ...prev,
                isSubmitting: false,
                errors: { ...prev.errors, [Object.keys(initialData)[0] as keyof T]: errorMessage }
            }));
        }
    }, [formState.data, validateForm, rateLimitKey, onSubmit, initialData]);

    // Reset form
    const resetForm = useCallback(() => {
        setFormState({
            data: initialData,
            errors: {} as Record<keyof T, string>,
            isSubmitting: false,
            isValid: false,
        });
    }, [initialData]);

    // Set multiple fields at once
    const setFields = useCallback((fields: Partial<T>) => {
        const sanitizedFields: Partial<T> = {};

        Object.entries(fields).forEach(([key, value]) => {
            sanitizedFields[key as keyof T] = typeof value === 'string'
                ? sanitizeInput(value)
                : value;
        });

        setFormState(prev => {
            const newData = { ...prev.data, ...sanitizedFields };
            const isValid = validateForm(newData);

            return {
                ...prev,
                data: newData,
                isValid,
            };
        });
    }, [validateForm]);

    return {
        data: formState.data,
        errors: formState.errors,
        isSubmitting: formState.isSubmitting,
        isValid: formState.isValid,
        updateField,
        setFields,
        handleSubmit,
        resetForm,
        validateForm: () => validateForm(formState.data),
    };
};

// Hook for secure file upload
export const useSecureFileUpload = () => {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const uploadFile = useCallback(async (
        file: File,
        onSuccess: (url: string) => void,
        onError?: (error: string) => void
    ) => {
        setIsUploading(true);
        setError(null);

        try {
            // File validation
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                throw new Error('File size must be less than 10MB');
            }

            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                throw new Error('Only image files are allowed');
            }

            // Create FormData
            const formData = new FormData();
            formData.append('file', file);

            // Upload file (this would be replaced with actual upload logic)
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const result = await response.json();
            onSuccess(result.url);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Upload failed';
            setError(errorMessage);
            onError?.(errorMessage);
        } finally {
            setIsUploading(false);
        }
    }, []);

    return {
        uploadFile,
        isUploading,
        error,
    };
};

// Hook for secure API calls
export const useSecureApi = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const callApi = useCallback(async <T>(
        apiCall: () => Promise<T>,
        options: {
            onSuccess?: (data: T) => void;
            onError?: (error: string) => void;
            showLoading?: boolean;
        } = {}
    ) => {
        const { onSuccess, onError, showLoading = true } = options;

        if (showLoading) {
            setIsLoading(true);
        }
        setError(null);

        try {
            const result = await apiCall();
            onSuccess?.(result);
            return result;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'API call failed';
            setError(errorMessage);
            onError?.(errorMessage);
            throw error;
        } finally {
            if (showLoading) {
                setIsLoading(false);
            }
        }
    }, []);

    return {
        callApi,
        isLoading,
        error,
    };
};
