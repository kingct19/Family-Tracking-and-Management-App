import { Suspense, ReactNode } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface PageLoaderWrapperProps {
    children: ReactNode;
    fallback?: ReactNode;
}

/**
 * PageLoaderWrapper Component
 * 
 * Wraps page content with Suspense to show loader during lazy loading.
 * Can be used on individual pages for better loading control.
 */
export const PageLoaderWrapper = ({ 
    children, 
    fallback = (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <LoadingSpinner size="large" text="Loading page..." />
        </div>
    )
}: PageLoaderWrapperProps) => {
    return (
        <Suspense fallback={fallback}>
            {children}
        </Suspense>
    );
};

export default PageLoaderWrapper;

