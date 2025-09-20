import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

// Mock component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
    if (shouldThrow) {
        throw new Error('Test error');
    }
    return <div>No error</div>;
};

describe('ErrorBoundary', () => {
    beforeEach(() => {
        // Suppress console.error for expected error boundary tests
        vi.spyOn(console, 'error').mockImplementation(() => { });
    });

    it('renders children when there is no error', () => {
        render(
            <ErrorBoundary>
                <ThrowError shouldThrow={false} />
            </ErrorBoundary>
        );

        expect(screen.getByText('No error')).toBeInTheDocument();
    });

    it('renders error UI when there is an error', () => {
        render(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        );

        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
        expect(screen.getByText(/We're sorry, but something unexpected happened/)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    it('renders custom fallback when provided', () => {
        const customFallback = <div>Custom error message</div>;

        render(
            <ErrorBoundary fallback={customFallback}>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        );

        expect(screen.getByText('Custom error message')).toBeInTheDocument();
        expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
    });

    it('shows error details in development mode', () => {
        render(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        );

        // In development, error details should be visible
        expect(screen.getByText('Error Details (Development Only)')).toBeInTheDocument();
        expect(screen.getByText('Test error')).toBeInTheDocument();
    });

    it('calls console.error when an error is caught', () => {
        const consoleSpy = vi.spyOn(console, 'error');

        render(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        );

        // Console.error should be called (may be called multiple times by React)
        expect(consoleSpy).toHaveBeenCalled();

        consoleSpy.mockRestore();
    });
});
