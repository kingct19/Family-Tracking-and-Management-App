import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook to show a loading state for individual pages
 * Useful for pages that need to fetch data before rendering
 */
export const usePageLoader = (isLoading: boolean = false) => {
    const location = useLocation();
    const [isPageLoading, setIsPageLoading] = useState(true);

    useEffect(() => {
        // Reset loading state when route changes
        setIsPageLoading(true);
        
        // Small delay to show loader (prevents flash)
        const timer = setTimeout(() => {
            if (!isLoading) {
                setIsPageLoading(false);
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [location.pathname, isLoading]);

    useEffect(() => {
        if (!isLoading) {
            setIsPageLoading(false);
        }
    }, [isLoading]);

    return isPageLoading;
};

