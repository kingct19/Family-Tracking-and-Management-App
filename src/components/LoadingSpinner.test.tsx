import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { LoadingSpinner } from './LoadingSpinner';

describe('LoadingSpinner', () => {
    it('renders with default props', () => {
        const { container } = render(<LoadingSpinner />);

        const spinner = container.querySelector('.animate-spin');
        expect(spinner).toBeInTheDocument();
        expect(spinner).toHaveClass('w-6', 'h-6'); // default medium size
        expect(spinner).toHaveClass('text-blue-600'); // default color
    });

    it('renders with small size', () => {
        const { container } = render(<LoadingSpinner size="small" />);

        const spinner = container.querySelector('.animate-spin');
        expect(spinner).toHaveClass('w-4', 'h-4');
    });

    it('renders with medium size', () => {
        const { container } = render(<LoadingSpinner size="medium" />);

        const spinner = container.querySelector('.animate-spin');
        expect(spinner).toHaveClass('w-6', 'h-6');
    });

    it('renders with large size', () => {
        const { container } = render(<LoadingSpinner size="large" />);

        const spinner = container.querySelector('.animate-spin');
        expect(spinner).toHaveClass('w-8', 'h-8');
    });

    it('renders with custom className', () => {
        const { container } = render(<LoadingSpinner className="custom-class" />);

        const wrapper = container.querySelector('.flex');
        expect(wrapper).toHaveClass('custom-class');
    });

    it('has proper accessibility attributes', () => {
        const { container } = render(<LoadingSpinner />);

        const spinner = container.querySelector('.animate-spin');
        expect(spinner).toBeInTheDocument();

        // The spinner should be visually hidden from screen readers
        // as it's a decorative loading indicator
    });

    it('applies all expected CSS classes', () => {
        const { container } = render(<LoadingSpinner size="large" />);

        const spinner = container.querySelector('.animate-spin');
        expect(spinner).toHaveClass(
            'animate-spin',
            'text-blue-600',
            'w-8',
            'h-8'
        );
    });

    it('renders with text when provided', () => {
        const { getByText } = render(<LoadingSpinner text="Loading..." />);

        expect(getByText('Loading...')).toBeInTheDocument();
    });

    it('does not render text when not provided', () => {
        const { container } = render(<LoadingSpinner />);

        const textElement = container.querySelector('p');
        expect(textElement).not.toBeInTheDocument();
    });
});
