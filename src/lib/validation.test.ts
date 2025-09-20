import { describe, it, expect } from 'vitest';
import {
    loginSchema,
    registerSchema,
    createHubSchema,
    createTaskSchema,
    validateInput
} from './validation';

describe('Validation Schemas', () => {
    describe('loginSchema', () => {
        it('should validate correct login data', () => {
            const validData = {
                email: 'test@example.com',
                password: 'password123'
            };

            const result = validateInput(loginSchema, validData);
            expect(result.success).toBe(true);
            expect(result.data).toEqual(validData);
        });

        it('should reject invalid email', () => {
            const invalidData = {
                email: 'invalid-email',
                password: 'password123'
            };

            const result = validateInput(loginSchema, invalidData);
            expect(result.success).toBe(false);
            expect(result.errors).toContain('email: Invalid email address');
        });

        it('should reject short password', () => {
            const invalidData = {
                email: 'test@example.com',
                password: '123'
            };

            const result = validateInput(loginSchema, invalidData);
            expect(result.success).toBe(false);
            expect(result.errors).toContain('password: Password must be at least 8 characters');
        });
    });

    describe('registerSchema', () => {
        it('should validate correct registration data', () => {
            const validData = {
                email: 'test@example.com',
                password: 'Password123',
                confirmPassword: 'Password123',
                firstName: 'John',
                lastName: 'Doe'
            };

            const result = validateInput(registerSchema, validData);
            expect(result.success).toBe(true);
            expect(result.data).toEqual(validData);
        });

        it('should reject weak password', () => {
            const invalidData = {
                email: 'test@example.com',
                password: 'password',
                confirmPassword: 'password',
                firstName: 'John',
                lastName: 'Doe'
            };

            const result = validateInput(registerSchema, invalidData);
            expect(result.success).toBe(false);
            expect(result.errors).toContain('password: Password must contain at least one uppercase letter, one lowercase letter, and one number');
        });

        it('should reject mismatched passwords', () => {
            const invalidData = {
                email: 'test@example.com',
                password: 'Password123',
                confirmPassword: 'DifferentPassword123',
                firstName: 'John',
                lastName: 'Doe'
            };

            const result = validateInput(registerSchema, invalidData);
            expect(result.success).toBe(false);
            expect(result.errors).toContain('confirmPassword: Passwords don\'t match');
        });
    });

    describe('createHubSchema', () => {
        it('should validate correct hub data', () => {
            const validData = {
                name: 'Family Hub',
                description: 'Our main family hub',
                type: 'family' as const
            };

            const result = validateInput(createHubSchema, validData);
            expect(result.success).toBe(true);
            expect(result.data).toEqual(validData);
        });

        it('should reject invalid hub type', () => {
            const invalidData = {
                name: 'Family Hub',
                type: 'invalid' as any
            };

            const result = validateInput(createHubSchema, invalidData);
            expect(result.success).toBe(false);
            expect(result.errors).toContain('type: Invalid enum value. Expected \'family\' | \'school\' | \'sports\' | \'work\' | \'other\', received \'invalid\'');
        });

        it('should reject short hub name', () => {
            const invalidData = {
                name: 'A',
                type: 'family' as const
            };

            const result = validateInput(createHubSchema, invalidData);
            expect(result.success).toBe(false);
            expect(result.errors).toContain('name: Hub name must be at least 2 characters');
        });
    });

    describe('createTaskSchema', () => {
        it('should validate correct task data', () => {
            const validData = {
                title: 'Clean the kitchen',
                description: 'Wash dishes and clean counters',
                assignedTo: 'user123',
                points: 15,
                requiresPhoto: true,
                category: 'chore' as const
            };

            const result = validateInput(createTaskSchema, validData);
            expect(result.success).toBe(true);
            expect(result.data).toEqual(validData);
        });

        it('should apply default values', () => {
            const minimalData = {
                title: 'Simple task',
                assignedTo: 'user123'
            };

            const result = validateInput(createTaskSchema, minimalData);
            expect(result.success).toBe(true);
            expect(result.data).toEqual({
                title: 'Simple task',
                assignedTo: 'user123',
                points: 10,
                requiresPhoto: false,
                category: 'chore'
            });
        });

        it('should reject empty assignedTo', () => {
            const invalidData = {
                title: 'Test task',
                assignedTo: ''
            };

            const result = validateInput(createTaskSchema, invalidData);
            expect(result.success).toBe(false);
            expect(result.errors).toContain('assignedTo: Please select a family member');
        });
    });
});
