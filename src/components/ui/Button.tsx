import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export type ButtonVariant = 'filled' | 'tonal' | 'outlined' | 'text';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'filled',
      size = 'medium',
      fullWidth = false,
      startIcon,
      endIcon,
      loading = false,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = cn(
      // Base styles - Material Design 3
      'inline-flex items-center justify-center gap-2 rounded-full font-semibold',
      'transition-all duration-fast',
      'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
      
      // Touch target (44px minimum)
      'min-h-[44px]',
      
      // Size variants - using Material Design typography
      {
        'px-6 py-3 text-label-lg': size === 'large',
        'px-6 py-2.5 text-label-md': size === 'medium',
        'px-4 py-2 text-label-sm': size === 'small',
      },
      
      // Width
      {
        'w-full': fullWidth,
      },
      
      // Variant styles
      {
        // Filled button (primary action)
        'bg-primary text-on-primary hover:shadow-elevation-1 active:shadow-none':
          variant === 'filled',
        
        // Tonal button (secondary action)
        'bg-secondary-container text-on-secondary-container hover:shadow-elevation-1 active:shadow-none':
          variant === 'tonal',
        
        // Outlined button (tertiary action)
        'border-2 border-outline bg-transparent text-primary hover:bg-surface-variant active:bg-surface-variant':
          variant === 'outlined',
        
        // Text button (low emphasis)
        'bg-transparent text-primary hover:bg-surface-variant active:bg-surface-variant':
          variant === 'text',
      },
      
      className
    );

    return (
      <button
        ref={ref}
        className={baseStyles}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-label="Loading"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!loading && startIcon && startIcon}
        {children}
        {!loading && endIcon && endIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';



