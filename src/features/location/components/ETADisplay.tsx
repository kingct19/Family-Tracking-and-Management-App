/**
 * ETADisplay Component
 * 
 * Displays estimated time of arrival to a destination
 */

import { useQuery } from '@tanstack/react-query';
import { MdAccessTime, MdNavigation } from 'react-icons/md';
import { etaService } from '../services/eta-service';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface ETADisplayProps {
    origin: { lat: number; lng: number };
    destination: { lat: number; lng: number };
    memberName: string;
    mode?: 'driving' | 'walking' | 'transit';
    autoRefresh?: boolean;
    refreshInterval?: number;
}

export const ETADisplay = ({
    origin,
    destination,
    memberName,
    mode = 'driving',
    autoRefresh = true,
    refreshInterval = 60000, // 1 minute
}: ETADisplayProps) => {
    const { data: eta, isLoading, error } = useQuery({
        queryKey: ['eta', origin, destination, mode],
        queryFn: () => etaService.calculateETA(origin, destination, mode),
        enabled: !!origin && !!destination && !!origin.lat && !!origin.lng && !!destination.lat && !!destination.lng,
        refetchInterval: autoRefresh ? refreshInterval : false,
        staleTime: 30 * 1000, // 30 seconds
    });

    if (isLoading) {
        return (
            <div className="bg-surface rounded-card p-4 flex items-center gap-3">
                <LoadingSpinner size="small" />
                <span className="text-body-sm text-on-variant">Calculating ETA...</span>
            </div>
        );
    }

    if (error || !eta) {
        return null; // Don't show error, just don't display
    }

    return (
        <div className="bg-surface rounded-card p-4 space-y-2 border border-outline-variant">
            <div className="flex items-center gap-2">
                <MdNavigation size={16} className="text-primary" />
                <span className="text-title-sm text-on-surface font-semibold">
                    ETA to {memberName}
                </span>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <MdAccessTime size={16} className="text-on-variant" />
                    <span className="text-body-md text-on-surface font-semibold">
                        {eta.durationText}
                    </span>
                </div>
                <span className="text-body-sm text-on-variant">
                    {eta.distanceText} away
                </span>
            </div>
            {mode === 'driving' && (
                <p className="text-label-sm text-on-variant">
                    Based on current traffic
                </p>
            )}
        </div>
    );
};


