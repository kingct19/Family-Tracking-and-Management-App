/**
 * MapView Component
 * 
 * Displays Google Map with user location markers
 * - Shows all hub members who are sharing location
 * - Centers on user's current location
 * - Updates in real-time
 */

import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { useHubLocations, useUserLocation } from '../hooks/useLocation';
import { useHubStore } from '@/lib/store/hub-store';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { locationService } from '../services/location-service';
import type { UserLocation } from '../api/location-api';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

// Create singleton loader to prevent multiple initialization errors
let mapLoader: Loader | null = null;
const getMapLoader = () => {
    if (!mapLoader) {
        mapLoader = new Loader({
            apiKey: GOOGLE_MAPS_API_KEY,
            version: 'weekly',
            libraries: ['places', 'geometry', 'marker'],
        });
    }
    return mapLoader;
};

interface MapViewProps {
    height?: string;
    zoom?: number;
    showControls?: boolean;
}

export const MapView = ({
    height = '600px',
    zoom = 13,
    showControls = true
}: MapViewProps) => {
    const { currentHub } = useHubStore();
    const { currentLocation } = useUserLocation();
    const { locations, isLoading } = useHubLocations(currentHub?.id);

    const mapRef = useRef<HTMLDivElement>(null);
    const googleMapRef = useRef<google.maps.Map | null>(null);
    const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());

    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);

    // Fallback: if map doesn't load in 10 seconds, show error
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (!isMapLoaded && !loadError) {
                console.error('MapView: Map loading timeout');
                setLoadError('Map loading timed out. Please refresh the page.');
            }
        }, 10000);

        return () => clearTimeout(timeout);
    }, [isMapLoaded, loadError]);

    // Validate API key on mount
    useEffect(() => {
        if (!GOOGLE_MAPS_API_KEY) {
            console.error('MapView: Google Maps API key not configured');
            setLoadError('Map configuration error');
        }
    }, []);

    // Initialize Google Map
    useEffect(() => {
        // Check API key first
        if (!GOOGLE_MAPS_API_KEY) {
            const errorMsg = `Google Maps API key not configured (key length: ${GOOGLE_MAPS_API_KEY.length})`;
            console.error('MapView Error:', errorMsg);
            setLoadError('Google Maps API key not configured');
            return;
        }

        // Prevent re-initialization if already loaded
        if (isMapLoaded || googleMapRef.current) {
            return;
        }

        // Check if map container ref is ready
        if (!mapRef.current) {
            return;
        }

        // Use singleton loader to prevent re-initialization errors
        const loader = getMapLoader();

        loader
            .load()
            .then((google) => {
                if (!mapRef.current) return;

                // Use current location if available, otherwise default to New York
                const defaultCenter = currentLocation 
                    ? { lat: currentLocation.latitude, lng: currentLocation.longitude }
                    : { lat: 40.7128, lng: -74.0060 }; // New York fallback

                googleMapRef.current = new google.maps.Map(mapRef.current, {
                    center: defaultCenter,
                    zoom: currentLocation ? 15 : zoom, // Zoom in if we have user location
                    mapTypeControl: showControls,
                    streetViewControl: showControls,
                    fullscreenControl: showControls,
                    zoomControl: showControls,
                    styles: [
                        {
                            featureType: 'poi',
                            elementType: 'labels',
                            stylers: [{ visibility: 'off' }],
                        },
                    ],
                });

                setIsMapLoaded(true);
                console.log('Map initialized at:', defaultCenter);
            })
            .catch((error) => {
                console.error('Error loading Google Maps:', error);
                setLoadError('Failed to load map');
            });
    }, []); // Run once on mount

    // Center map on user's current location when it becomes available
    useEffect(() => {
        if (googleMapRef.current && currentLocation && isMapLoaded) {
            console.log('Centering map on user location:', currentLocation);
            const center = new google.maps.LatLng(
                currentLocation.latitude,
                currentLocation.longitude
            );
            googleMapRef.current.setCenter(center);
            googleMapRef.current.setZoom(15); // Zoom in closer when user location is found
        }
    }, [currentLocation, isMapLoaded]);

    // No need for manual location request - LocationPage auto-starts tracking
    // and the currentLocation effect above will handle centering

    // Update markers when locations change
    useEffect(() => {
        if (!googleMapRef.current || !isMapLoaded) return;

        // Filter out invalid locations
        const validLocations = locations.filter(
            (loc) => loc && loc.userId && loc.latitude && loc.longitude
        );

        const currentMarkers = markersRef.current;
        const currentLocationIds = new Set(validLocations.map((loc) => loc.userId));

        // Remove markers for users no longer in the list
        currentMarkers.forEach((marker, userId) => {
            if (!currentLocationIds.has(userId)) {
                marker.setMap(null);
                currentMarkers.delete(userId);
            }
        });

        // Add or update markers
        validLocations.forEach((location) => {
            updateMarker(location);
        });
    }, [locations, isMapLoaded]);

    // Update or create a marker for a user
    const updateMarker = (location: UserLocation) => {
        if (!googleMapRef.current) return;

        // Safety check - ensure location has required properties
        if (!location || !location.userId || typeof location.latitude !== 'number' || typeof location.longitude !== 'number') {
            console.warn('Invalid location data:', location);
            return;
        }

        const existingMarker = markersRef.current.get(location.userId);
        const position = new google.maps.LatLng(location.latitude, location.longitude);

        if (existingMarker) {
            // Update existing marker position
            existingMarker.setPosition(position);
        } else {
            // Create new marker
            const marker = new google.maps.Marker({
                position,
                map: googleMapRef.current,
                title: `User ${location.userId}`,
                animation: google.maps.Animation.DROP,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: '#6750A4', // Primary purple color
                    fillOpacity: 1,
                    strokeColor: '#FFFFFF',
                    strokeWeight: 2,
                },
            });

            // Add info window
            const infoWindow = new google.maps.InfoWindow({
                content: `
          <div style="padding: 8px;">
            <h3 style="margin: 0 0 4px 0; font-weight: 600;">User ${location.userId.slice(0, 8)}</h3>
            <p style="margin: 0; font-size: 12px; color: #666;">
              Accuracy: ${Math.round(location.accuracy)}m<br/>
              Updated: ${new Date(location.timestamp).toLocaleTimeString()}
            </p>
          </div>
        `,
            });

            marker.addListener('click', () => {
                infoWindow.open(googleMapRef.current!, marker);
            });

            markersRef.current.set(location.userId, marker);
        }
    };

    // Cleanup markers on unmount
    useEffect(() => {
        return () => {
            markersRef.current.forEach((marker) => marker.setMap(null));
            markersRef.current.clear();
        };
    }, []);

    if (loadError) {
        return (
            <div
                className="flex items-center justify-center bg-gray-100 rounded-lg"
                style={{ height }}
            >
                <div className="text-center">
                    <p className="text-red-600 font-semibold mb-2">Map Error</p>
                    <p className="text-gray-600 text-sm">{loadError}</p>
                    <p className="text-gray-500 text-xs mt-2">
                        Please check your Google Maps API configuration
                    </p>
                </div>
            </div>
        );
    }

    // Always render the map div (even during location loading)
    // Just show a loading overlay if needed
    return (
        <div className="relative w-full h-full">
            {/* Map container - always render so ref can attach */}
            <div
                ref={mapRef}
                style={{
                    width: '100%',
                    height: height || '100%',
                    minHeight: '400px', // Ensure minimum height
                }}
                className="bg-gray-100"
            />

            {/* Loading overlay (only while map is initializing) */}
            {!isMapLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-90 z-50">
                    <div className="text-center">
                        <LoadingSpinner size="large" />
                        <p className="mt-4 text-gray-600 text-sm">Loading map...</p>
                    </div>
                </div>
            )}

            {/* Location count badge - only show if there are locations */}
            {locations.length > 0 && (
                <div className="absolute top-6 left-6 bg-white rounded-xl shadow-md px-4 py-2.5 backdrop-blur-sm bg-white/95">
                    <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        {locations.length} {locations.length === 1 ? 'member' : 'members'} online
                    </p>
                </div>
            )}
        </div>
    );
};

