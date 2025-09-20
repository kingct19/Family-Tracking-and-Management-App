import { describe, it, expect } from 'vitest';
import {
    sanitizeHtml,
    sanitizeText,
    sanitizeInput,
    sanitizeFilename,
    sanitizeUrl,
    sanitizeSearchQuery,
    sanitizeErrorMessage
} from './sanitization';

describe('Sanitization Functions', () => {
    describe('sanitizeHtml', () => {
        it('should allow safe HTML tags', () => {
            const html = '<p>Hello <strong>world</strong>!</p>';
            const result = sanitizeHtml(html);
            expect(result).toBe('<p>Hello <strong>world</strong>!</p>');
        });

        it('should remove dangerous HTML tags', () => {
            const html = '<script>alert("xss")</script><p>Safe content</p>';
            const result = sanitizeHtml(html);
            expect(result).toBe('<p>Safe content</p>');
        });

        it('should remove all HTML in strict mode', () => {
            const html = '<p>Hello <strong>world</strong>!</p>';
            const result = sanitizeHtml(html, true);
            expect(result).toBe('Hello world!');
        });
    });

    describe('sanitizeText', () => {
        it('should remove all HTML tags', () => {
            const text = '<p>Hello <strong>world</strong>!</p>';
            const result = sanitizeText(text);
            expect(result).toBe('Hello world!');
        });

        it('should handle empty input', () => {
            expect(sanitizeText('')).toBe('');
            expect(sanitizeText(null as any)).toBe('');
            expect(sanitizeText(undefined as any)).toBe('');
        });
    });

    describe('sanitizeInput', () => {
        it('should sanitize user input', () => {
            const input = '<script>alert("xss")</script>Hello world!';
            const result = sanitizeInput(input);
            expect(result).toBe('Hello world!');
        });

        it('should limit input length', () => {
            const longInput = 'a'.repeat(15000);
            const result = sanitizeInput(longInput);
            expect(result.length).toBe(10000);
        });

        it('should remove angle brackets', () => {
            const input = 'Hello <world> test';
            const result = sanitizeInput(input);
            expect(result).toBe('Hello  test');
        });
    });

    describe('sanitizeFilename', () => {
        it('should sanitize safe filename', () => {
            const filename = 'my-document.pdf';
            const result = sanitizeFilename(filename);
            expect(result).toBe('my-document.pdf');
        });

        it('should replace dangerous characters', () => {
            const filename = 'my<>document.pdf';
            const result = sanitizeFilename(filename);
            expect(result).toBe('my_document.pdf');
        });

        it('should handle empty filename', () => {
            expect(sanitizeFilename('')).toBe('unnamed');
            expect(sanitizeFilename(null as any)).toBe('unnamed');
        });

        it('should limit filename length', () => {
            const longFilename = 'a'.repeat(300);
            const result = sanitizeFilename(longFilename);
            expect(result.length).toBe(255);
        });
    });

    describe('sanitizeUrl', () => {
        it('should allow safe URLs', () => {
            const url = 'https://example.com';
            const result = sanitizeUrl(url);
            expect(result).toBe('https://example.com/');
        });

        it('should reject dangerous URLs', () => {
            const dangerousUrl = 'javascript:alert("xss")';
            const result = sanitizeUrl(dangerousUrl);
            expect(result).toBe('');
        });

        it('should reject invalid URLs', () => {
            const invalidUrl = 'not-a-url';
            const result = sanitizeUrl(invalidUrl);
            expect(result).toBe('');
        });

        it('should handle empty input', () => {
            expect(sanitizeUrl('')).toBe('');
            expect(sanitizeUrl(null as any)).toBe('');
        });
    });

    describe('sanitizeSearchQuery', () => {
        it('should sanitize search query', () => {
            const query = 'hello world';
            const result = sanitizeSearchQuery(query);
            expect(result).toBe('hello world');
        });

        it('should remove special characters', () => {
            const query = 'hello@#$%world';
            const result = sanitizeSearchQuery(query);
            expect(result).toBe('helloworld');
        });

        it('should limit query length', () => {
            const longQuery = 'a'.repeat(150);
            const result = sanitizeSearchQuery(longQuery);
            expect(result.length).toBe(100);
        });
    });

    describe('sanitizeErrorMessage', () => {
        it('should sanitize Error object', () => {
            const error = new Error('<script>alert("xss")</script>');
            const result = sanitizeErrorMessage(error);
            expect(result).toBe('');
        });

        it('should sanitize string error', () => {
            const error = '<script>alert("xss")</script>';
            const result = sanitizeErrorMessage(error);
            expect(result).toBe('');
        });

        it('should handle unknown error types', () => {
            const error = { some: 'object' };
            const result = sanitizeErrorMessage(error);
            expect(result).toBe('An unexpected error occurred');
        });

        it('should handle null/undefined', () => {
            expect(sanitizeErrorMessage(null)).toBe('An unexpected error occurred');
            expect(sanitizeErrorMessage(undefined)).toBe('An unexpected error occurred');
        });
    });
});
