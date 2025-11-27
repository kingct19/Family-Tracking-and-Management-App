/**
 * LocationHistoryView Component
 * 
 * Renders location history as a path/polyline on Google Maps
 */

import { useEffect, useRef } from 'react';
import { useLocationHistory } from '../hooks/useLocationHistory';
import type { LocationCoordinates } from '../services/location-service';

interface LocationHistoryViewProps {
    userId: string;
    map: google.maps.Map | null;
    hours?: number;
    color?: string;
    opacity?: number;
    strokeWeight?: number;
    onPathCreated?: (path: google.maps.Polyline | null) => void;
}

export const LocationHistoryView = ({
    userId,
    map,
    hours = 24,
    color = '#7A3BFF',
    opacity = 0.6,
    strokeWeight = 4,
    onPathCreated,
}: LocationHistoryViewProps) => {
    const { data: history, isLoading } = useLocationHistory(userId, { hours });
    const polylineRef = useRef<google.maps.Polyline | null>(null);

    useEffect(() => {
        if (!map || !history || history.length < 2) {
            // Clean up existing polyline if no data
            if (polylineRef.current) {
                polylineRef.current.setMap(null);
                polylineRef.current = null;
                onPathCreated?.(null);
            }
            return;
        }

        // Create path from location history
        const path = history
            .sort((a, b) => a.timestamp - b.timestamp) // Ensure chronological order
            .map((loc: LocationCoordinates) => ({
                lat: loc.latitude,
                lng: loc.longitude,
            }));

        // Remove existing polyline
        if (polylineRef.current) {
            polylineRef.current.setMap(null);
        }

        // Create new polyline
        const polyline = new google.maps.Polyline({
            path,
            geodesic: true,
            strokeColor: color,
            strokeOpacity: opacity,
            strokeWeight,
            map,
        });

        polylineRef.current = polyline;
        onPathCreated?.(polyline);

        // Fit bounds to show entire path
        if (path.length > 0) {
            const bounds = new google.maps.LatLngBounds();
            path.forEach((point) => bounds.extend(point));
            map.fitBounds(bounds);
        }

        // Cleanup function
        return () => {
            if (polylineRef.current) {
                polylineRef.current.setMap(null);
                polylineRef.current = null;
            }
        };
    }, [map, history, color, opacity, strokeWeight, onPathCreated]);

    // Don't render anything - this is a side-effect component
    return null;
};


