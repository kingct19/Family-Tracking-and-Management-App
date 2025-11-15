import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export type CardElevation = 0 | 1 | 2 | 3 | 4 | 5;

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevation?: CardElevation;
  interactive?: boolean;
  children: ReactNode;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      elevation = 1,
      interactive = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const cardStyles = cn(
      // Base styles - Material Design 3
      'rounded-xl bg-surface border border-outline-variant transition-all duration-normal',
      
      // Elevation shadows
      {
        'shadow-none border-0': elevation === 0,
        'shadow-elevation-1': elevation === 1,
        'shadow-elevation-2': elevation === 2,
        'shadow-elevation-3': elevation === 3,
        'shadow-elevation-4': elevation === 4,
        'shadow-elevation-5': elevation === 5,
      },
      
      // Interactive state
      {
        'cursor-pointer hover:shadow-elevation-2 hover:-translate-y-0.5 active:shadow-elevation-1 active:translate-y-0':
          interactive && elevation === 1,
        'cursor-pointer hover:shadow-elevation-3 hover:-translate-y-0.5 active:shadow-elevation-2 active:translate-y-0':
          interactive && elevation === 2,
        'focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2':
          interactive,
      },
      
      className
    );

    return (
      <div
        ref={ref}
        className={cardStyles}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Card sub-components for better composition
interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ title, subtitle, action, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-start justify-between p-4', className)}
        {...props}
      >
        <div className="flex-1">
          {title && (
            <h3 className="text-title-md text-on-surface">{title}</h3>
          )}
          {subtitle && (
            <p className="text-body-sm text-on-variant mt-1">{subtitle}</p>
          )}
          {children}
        </div>
        {action && <div className="ml-4">{action}</div>}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

export const CardContent = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('p-4 pt-0', className)}
      {...props}
    />
  );
});

CardContent.displayName = 'CardContent';

export const CardActions = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('flex items-center gap-2 p-4 pt-0', className)}
      {...props}
    />
  );
});

CardActions.displayName = 'CardActions';



