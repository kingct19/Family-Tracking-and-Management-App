import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { LoadingSpinner } from './LoadingSpinner';
import { ensureUserHasHub } from '@/features/auth/utils/onboarding';

interface ProtectedRouteProps {
    children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { isAuthenticated, isLoading, user } = useAuth();
    const location = useLocation();
    const [forceStopLoading, setForceStopLoading] = useState(false);

    // Add timeout to prevent infinite loading
    useEffect(() => {
        const timeout = setTimeout(() => {
            setForceStopLoading(true);
        }, 5000); // 5 second timeout

        return () => clearTimeout(timeout);
    }, []);

    // Ensure user has a hub after authentication (non-blocking)
    // Only run once on initial authentication, not on every navigation
    const [hubCheckDone, setHubCheckDone] = useState(false);
    useEffect(() => {
        if (isAuthenticated && user && !hubCheckDone) {
            // Run hub check in background - don't block rendering
            // This only runs once per auth session
            ensureUserHasHub(user.id, user.displayName || undefined)
                .then(() => {
                    console.log('Hub check completed');
                    setHubCheckDone(true);
                })
                .catch((error) => {
                    console.error('ProtectedRoute: Hub check error:', error);
                    setHubCheckDone(true); // Mark as done even on error to prevent retries
                    // Continue anyway - hub creation is optional
                });
        }
    }, [isAuthenticated, user, hubCheckDone]);

    // Show loading only if auth is loading AND we haven't timed out
    if (isLoading && !forceStopLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <LoadingSpinner size="large" />
            </div>
        );
    }

    // If not authenticated (or loading timed out), redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // User is authenticated, show protected content immediately
    // Don't wait for hub check - it runs in background
    return <>{children}</>;
};

export default ProtectedRoute;
