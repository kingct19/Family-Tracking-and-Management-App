import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { LoadingSpinner } from './LoadingSpinner';

interface ProtectedRouteProps {
    children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();
    const [forceStopLoading, setForceStopLoading] = useState(false);

    // Add timeout to prevent infinite loading
    useEffect(() => {
        const timeout = setTimeout(() => {
            console.log('ProtectedRoute: Forcing stop loading after timeout');
            setForceStopLoading(true);
        }, 5000); // 5 second timeout

        return () => clearTimeout(timeout);
    }, []);

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
        console.log('ProtectedRoute: Not authenticated, redirecting to login');
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // User is authenticated, show protected content
    console.log('ProtectedRoute: User authenticated, showing protected content');
    return <>{children}</>;
};

export default ProtectedRoute;
