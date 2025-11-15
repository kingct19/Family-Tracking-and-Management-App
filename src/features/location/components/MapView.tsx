/**
 * MapView Component
 * 
 * Displays Google Map with user location markers
 * - Shows all hub members who are sharing location
 * - Centers on user's current location
 * - Updates in real-time
 */

import { useEffect, useRef, useState } from 'react';
import { googleMapsLoader } from '@/lib/services/google-maps-loader';
import { useHubLocations, useUserLocation, useHubDeviceStatus } from '../hooks/useLocation';
import { useGeofences } from '../../geofencing/hooks/useGeofences';
import { useHubStore } from '@/lib/store/hub-store';
import { useHubMembers } from '@/features/tasks/hooks/useHubMembers';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { geofenceDetectionService } from '../../geofencing/services/geofence-detection';
import { alertService } from '../../geofencing/services/alert-service';
import type { UserLocation } from '../api/location-api';

// Using shared Google Maps loader service

// Helper function to get geofence colors
const getGeofenceColor = (type: string): string => {
    switch (type) {
        case 'home':
            return '#3B82F6'; // Blue
        case 'school':
            return '#10B981'; // Green
        case 'work':
            return '#8B5CF6'; // Purple
        default:
            return '#6B7280'; // Gray
    }
};

interface MapViewProps {
    height?: string;
    zoom?: number;
    showControls?: boolean;
    onGeofenceClick?: (geofenceId: string) => void;
}

export const MapView = ({
    height = '600px',
    zoom = 13,
    showControls = true,
    onGeofenceClick,
}: MapViewProps) => {
    const { currentHub } = useHubStore();
    const { user } = useAuth();
    const { currentLocation } = useUserLocation();
    const { locations } = useHubLocations(currentHub?.id);
    const { geofences } = useGeofences();
    const { data: members = [] } = useHubMembers();
    const { getDeviceStatus } = useHubDeviceStatus(currentHub?.id);

    const mapRef = useRef<HTMLDivElement>(null);
    const googleMapRef = useRef<google.maps.Map | null>(null);
    const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());
    const infoWindowsRef = useRef<Map<string, google.maps.InfoWindow>>(new Map());
    const currentUserMarkerRef = useRef<google.maps.Marker | null>(null);
    const geofenceCirclesRef = useRef<Map<string, google.maps.Circle>>(new Map());
    const hasCenteredRef = useRef(false); // Use ref to track centering state

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

    // Initialize Google Map (only once)
    useEffect(() => {
        // Prevent re-initialization if already loaded
        if (isMapLoaded || googleMapRef.current) {
            return;
        }

        // Check if map container ref is ready
        if (!mapRef.current) {
            return;
        }

        // Use shared loader service (will fetch from Secret Manager or env)
        googleMapsLoader
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
                
                // If we already have location, center immediately
                if (currentLocation) {
                    const center = new google.maps.LatLng(
                        currentLocation.latitude,
                        currentLocation.longitude
                    );
                    googleMapRef.current.setCenter(center);
                    googleMapRef.current.setZoom(15);
                    hasCenteredRef.current = true;
                    console.log('[MapView] Map initialized with user location:', {
                        lat: currentLocation.latitude,
                        lng: currentLocation.longitude,
                    });
                } else {
                    console.log('[MapView] Map initialized without location, will center when available');
                }
            })
            .catch((error) => {
                console.error('Error loading Google Maps:', error);
                const errorMessage = error.message || 'Failed to load map';
                if (errorMessage.includes('API key') || errorMessage.includes('key')) {
                    setLoadError('Invalid Google Maps API key. Please check your configuration.');
                } else {
                    setLoadError(`Failed to load map: ${errorMessage}`);
                }
            });
    }, []); // Run once on mount

    // Center map on user's current location when it becomes available
    // This handles the case where location is obtained after map initialization
    useEffect(() => {
        if (!googleMapRef.current || !currentLocation || !isMapLoaded) {
            return;
        }

        // Only center once when location first becomes available
        if (!hasCenteredRef.current) {
            const center = new google.maps.LatLng(
                currentLocation.latitude,
                currentLocation.longitude
            );
            
            // Smoothly pan to user location
            googleMapRef.current.panTo(center);
            googleMapRef.current.setZoom(15);
            hasCenteredRef.current = true;
            
            console.log('[MapView] Centered map on user location (first time):', {
                lat: currentLocation.latitude,
                lng: currentLocation.longitude,
            });
        }
    }, [currentLocation, isMapLoaded]);

    // No need for manual location request - LocationPage auto-starts tracking
    // and the currentLocation effect above will handle centering

    // Geofence detection - monitor current user's location against geofences
    useEffect(() => {
        if (!currentLocation || !geofences.length || !currentHub?.id) return;

        const results = geofenceDetectionService.checkGeofenceState(
            'current-user', // Use a fixed ID for current user
            currentLocation,
            geofences
        );

        if (results.length > 0) {
            // Create alerts for each geofence event
            results.forEach(event => {
                const geofence = geofences.find(g => g.id === event.geofenceId);
                if (geofence) {
                    alertService.createAlert(
                        geofence.id,
                        geofence.name,
                        'current-user', // Current user ID
                        event.eventType,
                        {
                            latitude: currentLocation.latitude,
                            longitude: currentLocation.longitude,
                        }
                    );
                }
            });
        }
    }, [currentLocation, geofences, currentHub?.id]);

    // Update current user's marker
    useEffect(() => {
        if (!googleMapRef.current || !isMapLoaded || !currentLocation) return;

        const position = new google.maps.LatLng(
            currentLocation.latitude,
            currentLocation.longitude
        );

        // Get current user's photo
        const currentUserPhoto = user?.photoURL;
        const currentUserMember = members.find(m => m.userId === user?.id);
        const photoURL = currentUserPhoto || currentUserMember?.photoURL;

        // Create icon with photo or initials
        const icon = createMarkerIcon(currentUserMember, photoURL, true);

        if (currentUserMarkerRef.current) {
            // Update existing marker position and icon
            currentUserMarkerRef.current.setPosition(position);
            if (icon) {
                currentUserMarkerRef.current.setIcon(icon);
            }
        } else {
            // Create new marker for current user with distinct styling
            currentUserMarkerRef.current = new google.maps.Marker({
                position,
                map: googleMapRef.current,
                title: 'Your Location',
                icon: icon || {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 10,
                    fillColor: '#10B981', // Green color for current user
                    fillOpacity: 1,
                    strokeColor: '#FFFFFF',
                    strokeWeight: 3,
                },
                zIndex: 1000, // Show current user marker on top
            });

            // If photo loads later, update the marker icon
            if (photoURL && !imageCache.current.has(photoURL) && !failedImages.current.has(photoURL)) {
                loadImage(photoURL).then(() => {
                    const newIcon = createMarkerIcon(currentUserMember, photoURL, true);
                    if (newIcon && currentUserMarkerRef.current && currentUserMarkerRef.current.getMap()) {
                        currentUserMarkerRef.current.setIcon(newIcon);
                    }
                }).catch(() => {
                    // Photo failed to load, keep initials
                });
            }

            // Add pulsing ring around current user
            new google.maps.Circle({
                strokeColor: '#10B981',
                strokeOpacity: 0.3,
                strokeWeight: 2,
                fillColor: '#10B981',
                fillOpacity: 0.1,
                map: googleMapRef.current,
                center: position,
                radius: currentLocation.accuracy || 50, // Use GPS accuracy or 50m default
            });
        }
    }, [currentLocation, isMapLoaded, user?.id, user?.photoURL, members]);

    // Update geofence circles when geofences change
    useEffect(() => {
        if (!googleMapRef.current || !isMapLoaded) return;

        const currentCircles = geofenceCirclesRef.current;

        // Remove circles for geofences that no longer exist
        currentCircles.forEach((circle, geofenceId) => {
            if (!geofences.find(g => g.id === geofenceId)) {
                circle.setMap(null);
                currentCircles.delete(geofenceId);
            }
        });

        // Add or update circles for active geofences
        geofences.forEach((geofence) => {
            if (!geofence.isActive) return;

            const center = new google.maps.LatLng(
                geofence.center.latitude,
                geofence.center.longitude
            );

            const existingCircle = currentCircles.get(geofence.id);
            if (existingCircle) {
                // Update existing circle
                existingCircle.setCenter(center);
                existingCircle.setRadius(geofence.radius);
            } else {
                // Create new circle
                const circle = new google.maps.Circle({
                    strokeColor: getGeofenceColor(geofence.type),
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: getGeofenceColor(geofence.type),
                    fillOpacity: 0.2,
                    map: googleMapRef.current,
                    center,
                    radius: geofence.radius,
                    clickable: true,
                });

                // Add click listener
                circle.addListener('click', () => {
                    if (onGeofenceClick) {
                        onGeofenceClick(geofence.id);
                    }
                });

                currentCircles.set(geofence.id, circle);
            }
        });
    }, [geofences, isMapLoaded, onGeofenceClick]);

    // Helper to get member info
    const getMemberInfo = (userId: string) => {
        return members.find(m => m.userId === userId);
    };

    // Helper to get initials from name
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Helper to draw initials on canvas
    const drawInitials = (ctx: CanvasRenderingContext2D, member: typeof members[0] | undefined, size: number) => {
        ctx.fillStyle = member ? '#E8DEF8' : '#D1D5DB';
        ctx.fill();
        ctx.fillStyle = member ? '#6750A4' : '#6B7280';
        ctx.font = `bold ${size / 3}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const text = member ? getInitials(member.displayName) : '?';
        ctx.fillText(text, size / 2, size / 2);
    };

    // Cache for loaded images to avoid reloading
    const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());
    // Track failed image loads to avoid retrying
    const failedImages = useRef<Set<string>>(new Set());

    // Helper to load image and cache it
    const loadImage = (url: string): Promise<HTMLImageElement> => {
        if (imageCache.current.has(url)) {
            return Promise.resolve(imageCache.current.get(url)!);
        }

        // Don't retry failed images
        if (failedImages.current.has(url)) {
            return Promise.reject(new Error('Image previously failed to load'));
        }

        return new Promise((resolve, reject) => {
            const img = new Image();
            // Try with crossOrigin first (for CORS-enabled buckets)
            img.crossOrigin = 'anonymous';
            
            const timeout = setTimeout(() => {
                img.onload = null;
                img.onerror = null;
                failedImages.current.add(url);
                reject(new Error('Image load timeout'));
            }, 5000); // 5 second timeout

            img.onload = () => {
                clearTimeout(timeout);
                imageCache.current.set(url, img);
                resolve(img);
            };
            
            img.onerror = (error) => {
                clearTimeout(timeout);
                failedImages.current.add(url);
                console.warn('Failed to load image (CORS or network issue):', url);
                // Try without crossOrigin as fallback
                if (img.crossOrigin === 'anonymous') {
                    const img2 = new Image();
                    img2.onload = () => {
                        imageCache.current.set(url, img2);
                        resolve(img2);
                    };
                    img2.onerror = () => {
                        reject(error);
                    };
                    img2.src = url;
                } else {
                    reject(error);
                }
            };
            
            img.src = url;
        });
    };

    // Preload member photos when members data loads
    useEffect(() => {
        if (!members || members.length === 0) return;

        members.forEach((member) => {
            if (member.photoURL && !imageCache.current.has(member.photoURL) && !failedImages.current.has(member.photoURL)) {
                loadImage(member.photoURL).catch(() => {
                    // Silently fail - will use initials
                });
            }
        });
    }, [members]);

    // Helper to create custom marker icon with avatar (photo or initials)
    const createMarkerIcon = (member: typeof members[0] | undefined, photoURL: string | undefined, isCurrentUser: boolean): google.maps.Icon | undefined => {
        const size = isCurrentUser ? 48 : 40;
        const borderWidth = isCurrentUser ? 4 : 3;
        const borderColor = isCurrentUser ? '#10B981' : '#6750A4';
        
        // Create canvas for custom icon
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return undefined;

        // Draw circle background (border)
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2 - borderWidth / 2, 0, 2 * Math.PI);
        ctx.fillStyle = borderColor;
        ctx.fill();

        // Draw inner circle (avatar area)
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2 - borderWidth, 0, 2 * Math.PI);
        ctx.save();
        ctx.clip(); // Clip to circle

        // If photo exists and is cached, draw it
        if (photoURL && imageCache.current.has(photoURL) && !failedImages.current.has(photoURL)) {
            try {
                const img = imageCache.current.get(photoURL)!;
                const imgSize = size - borderWidth * 2;
                ctx.drawImage(img, borderWidth, borderWidth, imgSize, imgSize);
            } catch (error) {
                // If drawing fails, fall back to initials
                console.warn('Failed to draw image on canvas:', error);
                drawInitials(ctx, member, size);
            }
        } else {
            // No photo or not loaded yet, draw initials
            drawInitials(ctx, member, size);
            
            // Try to load photo in background for next time (if not already failed)
            if (photoURL && !failedImages.current.has(photoURL)) {
                loadImage(photoURL)
                    .then(() => {
                        // Image loaded successfully - trigger marker update
                        // This will be handled by the useEffect that watches for image cache changes
                    })
                    .catch(() => {
                        // Silently fail - will use initials
                    });
            }
        }

        ctx.restore();

        return {
            url: canvas.toDataURL(),
            scaledSize: new google.maps.Size(size, size),
            anchor: new google.maps.Point(size / 2, size / 2),
        };
    };

    // Update or create a marker for a user
    const updateMarker = (location: UserLocation) => {
        if (!googleMapRef.current) return;

        // Safety check - ensure location has required properties
        if (!location || !location.userId || typeof location.latitude !== 'number' || typeof location.longitude !== 'number') {
            console.warn('Invalid location data:', location);
            return;
        }

        // Skip current user marker (handled separately)
        if (location.userId === user?.id) return;

        const member = getMemberInfo(location.userId);
        const deviceStatus = getDeviceStatus(location.userId);
        const existingMarker = markersRef.current.get(location.userId);
        const position = new google.maps.LatLng(location.latitude, location.longitude);

        // Create info window content
        const lastSeen = new Date(location.timestamp);
        const timeAgo = Math.floor((Date.now() - lastSeen.getTime()) / 1000 / 60); // minutes ago
        const timeAgoText = timeAgo < 1 ? 'Just now' : timeAgo < 60 ? `${timeAgo}m ago` : `${Math.floor(timeAgo / 60)}h ago`;

        const batteryLevel = deviceStatus?.batteryLevel ?? null;
        const isOnline = deviceStatus?.isOnline ?? true;

        const memberPhotoURL = member?.photoURL;
        const avatarHTML = memberPhotoURL 
            ? `<img src="${memberPhotoURL}" alt="${member?.displayName || 'User'}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />`
            : '';
        const initialsHTML = `<div style="width: 40px; height: 40px; border-radius: 50%; background: ${member ? '#E8DEF8' : '#D1D5DB'}; display: ${memberPhotoURL ? 'none' : 'flex'}; align-items: center; justify-content: center; font-weight: bold; color: ${member ? '#6750A4' : '#6B7280'};">
                        ${member ? getInitials(member.displayName) : '?'}
                    </div>`;

        const infoContent = `
            <div style="padding: 12px; min-width: 200px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                    ${avatarHTML}
                    ${initialsHTML}
                    <div style="flex: 1;">
                        <h3 style="margin: 0; font-size: 14px; font-weight: 600; color: #1F2937;">
                            ${member?.displayName || `User ${location.userId.slice(0, 8)}`}
                        </h3>
                        <p style="margin: 2px 0 0 0; font-size: 12px; color: #6B7280;">
                            ${member?.role ? member.role.charAt(0).toUpperCase() + member.role.slice(1) : 'Member'}
                        </p>
                    </div>
                </div>
                <div style="border-top: 1px solid #E5E7EB; padding-top: 8px; margin-top: 8px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                        <span style="font-size: 12px; color: #6B7280;">Status:</span>
                        <span style="font-size: 12px; font-weight: 500; color: ${isOnline ? '#10B981' : '#6B7280'};">
                            ${isOnline ? '● Online' : '○ Offline'}
                        </span>
                    </div>
                    ${batteryLevel !== null ? `
                        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                            <span style="font-size: 12px; color: #6B7280;">Battery:</span>
                            <span style="font-size: 12px; font-weight: 500; color: ${batteryLevel < 20 ? '#EF4444' : batteryLevel < 50 ? '#F59E0B' : '#10B981'};">
                                ${batteryLevel}%
                            </span>
                        </div>
                    ` : ''}
                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                        <span style="font-size: 12px; color: #6B7280;">Last seen:</span>
                        <span style="font-size: 12px; color: #6B7280;">${timeAgoText}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="font-size: 12px; color: #6B7280;">Accuracy:</span>
                        <span style="font-size: 12px; color: #6B7280;">${Math.round(location.accuracy)}m</span>
                    </div>
                </div>
            </div>
        `;

        if (existingMarker) {
            // Update existing marker position
            existingMarker.setPosition(position);
            
            // Update info window content
            const infoWindow = infoWindowsRef.current.get(location.userId);
            if (infoWindow) {
                infoWindow.setContent(infoContent);
            }
        } else {
            // Get photo URL from member profile
            const memberPhotoURL = member?.photoURL;
            
            // Create custom icon with photo
            const icon = createMarkerIcon(member, memberPhotoURL, false);

            // Create new marker
            const marker = new google.maps.Marker({
                position,
                map: googleMapRef.current,
                title: member?.displayName || `User ${location.userId.slice(0, 8)}`,
                animation: google.maps.Animation.DROP,
                icon: icon || {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: '#6750A4',
                    fillOpacity: 1,
                    strokeColor: '#FFFFFF',
                    strokeWeight: 2,
                },
            });

            // If photo loads later, update the marker icon
            if (memberPhotoURL && !imageCache.current.has(memberPhotoURL) && !failedImages.current.has(memberPhotoURL)) {
                loadImage(memberPhotoURL).then(() => {
                    // Recreate icon with loaded photo
                    const newIcon = createMarkerIcon(member, memberPhotoURL, false);
                    if (newIcon && marker.getMap()) {
                        marker.setIcon(newIcon);
                    }
                }).catch(() => {
                    // Photo failed to load, keep initials
                });
            }

            // Create info window
            const infoWindow = new google.maps.InfoWindow({
                content: infoContent,
            });

            // Add click listener
            marker.addListener('click', () => {
                // Close all other info windows
                infoWindowsRef.current.forEach((iw) => iw.close());
                infoWindow.open(googleMapRef.current!, marker);
            });

            markersRef.current.set(location.userId, marker);
            infoWindowsRef.current.set(location.userId, infoWindow);
        }
    };

    // Update markers when locations or members change
    useEffect(() => {
        if (!googleMapRef.current || !isMapLoaded) return;

        // Filter out invalid locations
        const validLocations = locations.filter(
            (loc) => loc && loc.userId && loc.latitude && loc.longitude && loc.isSharing
        );

        const currentMarkers = markersRef.current;
        const currentLocationIds = new Set(validLocations.map((loc) => loc.userId));

        // Remove markers for users no longer in the list
        currentMarkers.forEach((marker, userId) => {
            if (!currentLocationIds.has(userId)) {
                marker.setMap(null);
                currentMarkers.delete(userId);
                // Also close and remove info window
                const infoWindow = infoWindowsRef.current.get(userId);
                if (infoWindow) {
                    infoWindow.close();
                    infoWindowsRef.current.delete(userId);
                }
            }
        });

        // Add or update markers
        validLocations.forEach((location) => {
            updateMarker(location);
        });
    }, [locations, members, isMapLoaded, user?.id, getDeviceStatus]);

    // Cleanup markers and info windows on unmount
    useEffect(() => {
        return () => {
            markersRef.current.forEach((marker) => marker.setMap(null));
            markersRef.current.clear();
            infoWindowsRef.current.forEach((iw) => iw.close());
            infoWindowsRef.current.clear();
        };
    }, []);

    if (loadError) {
        return (
            <div
                className="flex items-center justify-center bg-gray-100 rounded-lg"
                style={{ height }}
            >
                <div className="text-center max-w-md px-6">
                    <p className="text-red-600 font-semibold mb-2 text-lg">Map Error</p>
                    <p className="text-gray-700 text-sm mb-3">{loadError}</p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                        <p className="text-blue-800 font-semibold text-sm mb-2">Quick Fix:</p>
                        <ol className="text-blue-700 text-xs space-y-1 list-decimal list-inside">
                            <li>Check your <code className="bg-blue-100 px-1 rounded">.env</code> file</li>
                            <li>Add: <code className="bg-blue-100 px-1 rounded">VITE_GOOGLE_MAPS_API_KEY=your_key</code></li>
                            <li>Restart the dev server</li>
                        </ol>
                        <p className="text-blue-600 text-xs mt-3">
                            See <code className="bg-blue-100 px-1 rounded">GOOGLE_MAPS_SETUP.md</code> for details
                        </p>
                    </div>
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

