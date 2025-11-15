import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { FiLoader } from 'react-icons/fi';
import { cn } from '@/lib/utils/cn';

/**
 * PageLoader Component
 * 
 * Shows a full-screen loader during page navigation transitions.
 * Works with BrowserRouter by tracking location changes.
 */
export const PageLoader = () => {
    const location = useLocation();
    const [isNavigating, setIsNavigating] = useState(false);
    const [progress, setProgress] = useState(0);
    const prevPathnameRef = useRef(location.pathname);

    // Show loader when pathname changes
    useEffect(() => {
        // Only show loader if pathname actually changed
        if (prevPathnameRef.current !== location.pathname) {
            setIsNavigating(true);
            setProgress(0);
            
            // Simulate progress bar
            const interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 90) {
                        clearInterval(interval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 100);

            // Complete progress after a short delay (simulating page load)
            const completeTimer = setTimeout(() => {
                setProgress(100);
                setTimeout(() => {
                    setIsNavigating(false);
                    setProgress(0);
                }, 200);
            }, 300);

            prevPathnameRef.current = location.pathname;

            return () => {
                clearInterval(interval);
                clearTimeout(completeTimer);
            };
        }
    }, [location.pathname]);

    if (!isNavigating) {
        return null;
    }

    return (
        <div
            className={cn(
                'fixed inset-0 z-[9999] flex flex-col items-center justify-center',
                'bg-background/95 backdrop-blur-sm',
                'transition-opacity duration-fast',
                isNavigating ? 'opacity-100' : 'opacity-0 pointer-events-none'
            )}
            aria-live="polite"
            aria-busy={isNavigating}
        >
            {/* Animated Spinner */}
            <div className="relative mb-8">
                {/* Outer ring */}
                <div className="w-16 h-16 rounded-full border-4 border-primary-container animate-spin border-t-primary"></div>
                
                {/* Inner icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <FiLoader className="w-6 h-6 text-primary animate-spin" />
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-64 max-w-[80vw]">
                <div className="h-1 bg-surface-variant rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-primary via-purple-600 to-indigo-600 rounded-full transition-all duration-fast ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Loading Text */}
            <p className="mt-6 text-body-md text-on-variant animate-pulse">
                Loading page...
            </p>
        </div>
    );
};

/**
 * PageLoaderBar Component
 * 
 * A minimal top progress bar for page navigation.
 * Less intrusive than full-screen loader.
 * Works with BrowserRouter by tracking location changes.
 */
export const PageLoaderBar = () => {
    const location = useLocation();
    const [progress, setProgress] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const prevPathnameRef = useRef(location.pathname);

    useEffect(() => {
        // Only show loader if pathname actually changed
        if (prevPathnameRef.current !== location.pathname) {
            setIsVisible(true);
            setProgress(0);
            
            // Simulate progress
            const interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 90) {
                        clearInterval(interval);
                        return 90;
                    }
                    return prev + Math.random() * 15;
                });
            }, 100);

            // Complete progress after a short delay (wait for page to load)
            const completeTimer = setTimeout(() => {
                setProgress(100);
                setTimeout(() => {
                    setIsVisible(false);
                    setProgress(0);
                }, 300);
            }, 500); // Increased delay to account for lazy loading

            prevPathnameRef.current = location.pathname;

            return () => {
                clearInterval(interval);
                clearTimeout(completeTimer);
            };
        }
    }, [location.pathname]);

    if (!isVisible) {
        return null;
    }

    return (
        <div
            className={cn(
                'fixed top-0 left-0 right-0 z-[9999] h-1',
                'transition-opacity duration-fast',
                isVisible ? 'opacity-100' : 'opacity-0'
            )}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Page loading"
        >
            <div
                className="h-full bg-gradient-to-r from-primary via-purple-600 to-indigo-600 transition-all duration-fast ease-out shadow-lg"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
};

export default PageLoader;

