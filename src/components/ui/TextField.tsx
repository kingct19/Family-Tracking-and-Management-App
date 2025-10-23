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
      // Base styles
      'peer w-full px-4 py-3 text-base text-gray-900 bg-white border-2 rounded-lg',
      'transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500',
      'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100',
      'placeholder:text-gray-400',

      // Error state
      error && 'border-red-500 focus:border-red-500 focus:ring-red-500',

      // Padding adjustments for adornments
      startAdornment && 'pl-12',
      endAdornment && 'pr-12',

      className
    );

    const labelStyles = cn(
      'block text-sm font-medium text-gray-700 mb-2',

      // Error state
      error && 'text-red-600'
    );

    return (
      <div className={cn('flex flex-col', { 'w-full': fullWidth })}>
        {/* Label */}
        {label && (
          <label htmlFor={inputId} className={labelStyles}>
            {label}
            {props.required && <span className="text-red-600 ml-1">*</span>}
          </label>
        )}

        <div className={containerStyles}>
          {/* Start adornment */}
          {startAdornment && (
            <div className="absolute left-4 text-gray-400 pointer-events-none">
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
            <div className="absolute right-4 text-gray-400">
              {endAdornment}
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <p
            id={errorId}
            className="text-sm text-red-600 mt-1"
            role="alert"
          >
            {error}
          </p>
        )}

        {/* Helper text */}
        {!error && helperText && (
          <p
            id={helperTextId}
            className="text-sm text-gray-600 mt-1"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

TextField.displayName = 'TextField';



