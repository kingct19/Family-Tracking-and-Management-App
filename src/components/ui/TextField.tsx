import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export type TextFieldVariant = 'filled' | 'outlined';

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: TextFieldVariant;
  label?: string;
  error?: string;
  helperText?: string;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  fullWidth?: boolean;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      variant = 'filled',
      label,
      error,
      helperText,
      startAdornment,
      endAdornment,
      fullWidth = false,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperTextId = helperText ? `${inputId}-helper` : undefined;

    const containerStyles = cn(
      'relative flex items-center',
      {
        'w-full': fullWidth,
      }
    );

    const inputStyles = cn(
      // Base styles - use Material Design 3 tokens
      'peer w-full px-4 py-3 text-body-md text-on-surface bg-surface border-2 rounded-xl',
      'transition-all duration-fast',
      'focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary',
      'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-variant',
      'placeholder:text-on-variant',

      // Error state
      error && 'border-red-500 focus:border-red-500 focus:ring-red-500',

      // Padding adjustments for adornments
      startAdornment && 'pl-12',
      endAdornment && 'pr-12',

      className
    );

    const labelStyles = cn(
      'block text-label-md text-on-surface mb-2',

      // Error state
      error && 'text-error'
    );

    return (
      <div className={cn('flex flex-col', { 'w-full': fullWidth })}>
        {/* Label */}
        {label && (
          <label htmlFor={inputId} className={labelStyles}>
            {label}
            {props.required && <span className="text-error ml-1">*</span>}
          </label>
        )}

        <div className={containerStyles}>
          {/* Start adornment */}
          {startAdornment && (
            <div className="absolute left-4 text-on-variant pointer-events-none">
              {startAdornment}
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            id={inputId}
            className={inputStyles}
            aria-invalid={!!error}
            aria-describedby={cn(errorId, helperTextId)}
            {...props}
          />

          {/* End adornment */}
          {endAdornment && (
            <div className="absolute right-4 text-on-variant">
              {endAdornment}
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <p
            id={errorId}
            className="text-label-sm text-error mt-2"
            role="alert"
          >
            {error}
          </p>
        )}

        {/* Helper text */}
        {!error && helperText && (
          <p
            id={helperTextId}
            className="text-label-sm text-on-variant mt-2"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

TextField.displayName = 'TextField';



