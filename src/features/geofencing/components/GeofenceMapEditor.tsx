/**
 * GeofenceMapEditor Component
 * 
 * Interactive map-based geofence creation/editing
 * - Click to place center
 * - Drag to resize radius
 * - Visual feedback
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { googleMapsLoader } from '@/lib/services/google-maps-loader';
import { FiX, FiHome, FiBriefcase, FiBookOpen, FiMapPin, FiNavigation, FiTarget } from 'react-icons/fi';
import type { GeofenceType, CreateGeofenceRequest } from '../types';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useHubStore } from '@/lib/store/hub-store';
import { useUserLocation } from '@/features/location/hooks/useLocation';

interface GeofenceMapEditorProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: CreateGeofenceRequest) => void;
    initialLocation?: {
        latitude: number;
        longitude: number;
    };
    geofence?: {
        id?: string;
        name: string;
        description?: string;
        type: GeofenceType;
        center: { latitude: number; longitude: number };
        radius: number;
        alertOnEntry?: boolean;
        alertOnExit?: boolean;
    } | null;
}

export const GeofenceMapEditor = ({
    isOpen,
    onClose,
    onSave,
    initialLocation,
    geofence,
}: GeofenceMapEditorProps) => {
    console.log('[GeofenceMapEditor] Component rendered', {
        isOpen,
        hasGeofence: !!geofence,
        geofenceId: geofence?.id,
        initialLocation,
    });

    const { currentHub } = useHubStore();
    const { currentLocation } = useUserLocation();
    const mapRef = useRef<HTMLDivElement>(null);
    const googleMapRef = useRef<google.maps.Map | null>(null);
    const circleRef = useRef<google.maps.Circle | null>(null);
    const centerMarkerRef = useRef<google.maps.Marker | null>(null);
    const resizeMarkersRef = useRef<google.maps.Marker[]>([]);
    const clickListenerRef = useRef<google.maps.MapsEventListener | null>(null);

    // Get the best available location (current location > initial location > null)
    const bestLocation = currentLocation 
        ? { latitude: currentLocation.latitude, longitude: currentLocation.longitude }
        : initialLocation;

    console.log('[GeofenceMapEditor] Location data:', {
        currentLocation: currentLocation ? { lat: currentLocation.latitude, lng: currentLocation.longitude } : null,
        initialLocation,
        bestLocation: bestLocation ? { lat: bestLocation.latitude, lng: bestLocation.longitude } : null,
    });

    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const [isPlacementMode, setIsPlacementMode] = useState(false);
    const [hasPlacedCenter, setHasPlacedCenter] = useState(false);
    const [formData, setFormData] = useState({
        name: geofence?.name || '',
        description: geofence?.description || '',
        type: (geofence?.type || 'custom') as GeofenceType,
        center: geofence?.center || bestLocation || { latitude: 0, longitude: 0 },
        radius: geofence?.radius || 100,
        alertOnEntry: geofence?.alertOnEntry !== undefined ? geofence.alertOnEntry : true,
        alertOnExit: geofence?.alertOnExit !== undefined ? geofence.alertOnExit : true,
        alertRecipients: [] as string[],
    });
    
    // Use refs to track current state so click handler always has latest values
    const isPlacementModeRef = useRef(false);
    const hasPlacedCenterRef = useRef(false);
    const formDataRef = useRef(formData);
    const geofenceRef = useRef(geofence);
    const hasInitializedRef = useRef(false);
    // Track if user just activated placement mode - update immediately to prevent reset
    const userActivatedPlacementModeRef = useRef(false);
    
    // Update refs when state changes
    // Note: Button handlers set refs immediately, but this sync ensures consistency
    // IMPORTANT: Don't clear userActivatedPlacementModeRef here - it's only cleared in button handlers
    useEffect(() => {
        // Sync refs with state (button handlers set refs immediately, but this ensures consistency)
        isPlacementModeRef.current = isPlacementMode;
        hasPlacedCenterRef.current = hasPlacedCenter;
        // Note: userActivatedPlacementModeRef is only managed in button handlers, not here
        // This prevents the effect from clearing it when state changes due to other reasons
    }, [isPlacementMode, hasPlacedCenter]);
    
    useEffect(() => {
        formDataRef.current = formData;
    }, [formData]);
    
    useEffect(() => {
        geofenceRef.current = geofence;
    }, [geofence]);

    console.log('[GeofenceMapEditor] Form data initialized:', {
        name: formData.name,
        center: formData.center,
        radius: formData.radius,
        type: formData.type,
    });

    // Update form data when geofence prop changes or location becomes available
    // Use a ref to track initialization to prevent resetting placement mode on re-runs
    useEffect(() => {
        console.log('[GeofenceMapEditor] Form data effect triggered', {
            isOpen,
            hasGeofence: !!geofence,
            geofenceId: geofence?.id,
            bestLocation: bestLocation ? { lat: bestLocation.latitude, lng: bestLocation.longitude } : null,
            hasInitialized: hasInitializedRef.current,
            currentPlacementMode: isPlacementModeRef.current,
        });

        // Reset initialization flag when modal closes
        if (!isOpen) {
            hasInitializedRef.current = false;
            userActivatedPlacementModeRef.current = false;
            return;
        }

        // CRITICAL: If user has activated placement mode, NEVER run initialization logic
        // This prevents the effect from resetting placement mode after user activates it
        // Check the ref first (updated immediately) then state (might be stale during batched updates)
        // Also check userActivatedPlacementModeRef which is set when user clicks the button
        const placementModeActive = userActivatedPlacementModeRef.current || isPlacementModeRef.current || isPlacementMode;
        if (placementModeActive) {
            console.log('[GeofenceMapEditor] Placement mode is active, skipping form data effect to preserve user state', {
                userActivated: userActivatedPlacementModeRef.current,
                refValue: isPlacementModeRef.current,
                stateValue: isPlacementMode,
                hasInitialized: hasInitializedRef.current,
            });
            // Don't modify any state when placement mode is active - user controls it
            return;
        }

        // Only initialize once when modal opens
        if (hasInitializedRef.current && geofence?.id) {
            // Geofence prop changed - update form data
            if (geofence) {
                console.log('[GeofenceMapEditor] Geofence prop changed, updating form data');
                setFormData(prev => ({
                    ...prev,
                    name: geofence.name,
                    description: geofence.description || '',
                    type: geofence.type,
                    center: geofence.center,
                    radius: geofence.radius,
                    alertOnEntry: geofence.alertOnEntry !== undefined ? geofence.alertOnEntry : true,
                    alertOnExit: geofence.alertOnExit !== undefined ? geofence.alertOnExit : true,
                }));
                setHasPlacedCenter(true);
                setIsPlacementMode(false);
            }
            return;
        }

        if (geofence && isOpen) {
            console.log('[GeofenceMapEditor] Editing existing geofence:', geofence);
            setFormData(prev => ({
                ...prev,
                name: geofence.name,
                description: geofence.description || '',
                type: geofence.type,
                center: geofence.center,
                radius: geofence.radius,
                alertOnEntry: geofence.alertOnEntry !== undefined ? geofence.alertOnEntry : true,
                alertOnExit: geofence.alertOnExit !== undefined ? geofence.alertOnExit : true,
            }));
            setHasPlacedCenter(true);
            setIsPlacementMode(false);
            hasInitializedRef.current = true;
            console.log('[GeofenceMapEditor] Form data updated for editing, hasPlacedCenter: true');
        } else if (!geofence && isOpen) {
            console.log('[GeofenceMapEditor] Creating new geofence');
            // Only initialize form data if not already initialized
            // CRITICAL: Never reset placement mode if user has activated it
            // Check placement mode state BEFORE any initialization logic
            const userActivatedPlacementMode = isPlacementMode || isPlacementModeRef.current;
            
            if (!hasInitializedRef.current) {
                // First time opening modal for new geofence - reset placement state ONLY if user hasn't activated it
                setHasPlacedCenter(false);
                // Only reset placement mode if user hasn't activated it
                if (!userActivatedPlacementMode) {
                    setIsPlacementMode(false);
                } else {
                    console.log('[GeofenceMapEditor] User has activated placement mode, preserving it during initialization');
                }
                
                if (bestLocation && bestLocation.latitude !== 0 && bestLocation.longitude !== 0) {
                    console.log('[GeofenceMapEditor] Setting initial location from bestLocation:', bestLocation);
                    setFormData(prev => {
                        if (prev.center.latitude === 0 && prev.center.longitude === 0) {
                            console.log('[GeofenceMapEditor] Updating form data with bestLocation');
                            return {
                                ...prev,
                                name: '',
                                description: '',
                                type: 'custom',
                                center: bestLocation,
                                radius: 100,
                                alertOnEntry: true,
                                alertOnExit: true,
                                alertRecipients: [],
                            };
                        }
                        console.log('[GeofenceMapEditor] Form data center already set, skipping update');
                        return prev;
                    });
                } else {
                    console.warn('[GeofenceMapEditor] No bestLocation available for new geofence');
                }
                hasInitializedRef.current = true;
                console.log('[GeofenceMapEditor] Initialization complete, hasInitialized set to true');
            } else {
                // Already initialized - don't touch placement mode state at all
                // This preserves the user's placement mode state when the effect re-runs
                console.log('[GeofenceMapEditor] Already initialized, preserving all state (placement mode, placed center)', {
                    currentPlacementMode: isPlacementMode,
                    refPlacementMode: isPlacementModeRef.current,
                    hasPlacedCenter,
                });
                // Don't modify any placement-related state - let the user control it via the button
            }
        }
    }, [geofence, isOpen, bestLocation]);

    // Get geofence color - define early since it's used by multiple functions
    const getGeofenceColor = (type: GeofenceType): string => {
        switch (type) {
            case 'home': return '#3B82F6';
            case 'school': return '#10B981';
            case 'work': return '#8B5CF6';
            default: return '#6B7280';
        }
    };

    // Create resize markers around the circle - define early since it's used by multiple useEffects
    const createResizeMarkers = useCallback(() => {
        console.log('[GeofenceMapEditor] createResizeMarkers called', {
            hasGoogleMap: !!googleMapRef.current,
            hasCircle: !!circleRef.current,
        });

        if (!googleMapRef.current || !circleRef.current) {
            console.warn('[GeofenceMapEditor] Cannot create resize markers - map or circle not available');
            return;
        }

        // Clear existing resize markers and their listeners
        resizeMarkersRef.current.forEach(marker => {
            if (marker) {
                google.maps.event.clearInstanceListeners(marker);
                marker.setMap(null);
            }
        });
        resizeMarkersRef.current = [];

        const center = circleRef.current.getCenter();
        if (!center) {
            console.warn('[GeofenceMapEditor] Circle has no center, cannot create resize markers');
            return;
        }

        const radius = circleRef.current.getRadius();
        const color = getGeofenceColor(formData.type);
        
        console.log('[GeofenceMapEditor] Creating resize markers', {
            center: { lat: center.lat(), lng: center.lng() },
            radius,
            color,
        });
        
        // Create 4 resize markers around the circle (North, East, South, West)
        const angles = [0, 90, 180, 270];
        
        angles.forEach((angle) => {
            // Calculate position using Google Maps geometry
            const point = google.maps.geometry.spherical.computeOffset(
                center,
                radius,
                angle
            );
            
            const marker = new google.maps.Marker({
                position: point,
                map: googleMapRef.current,
                title: 'Drag to resize',
                draggable: !isPlacementMode,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 10,
                    fillColor: '#FFFFFF',
                    fillOpacity: 1,
                    strokeColor: color,
                    strokeWeight: 3,
                },
                zIndex: 999,
                optimized: false,
                visible: !isPlacementMode, // Hide during placement mode
            });

            // Add drag listener to update radius
            marker.addListener('drag', () => {
                if (isPlacementMode) return; // Don't allow resizing in placement mode
                
                const newPosition = marker.getPosition();
                const currentCenter = circleRef.current?.getCenter();
                if (newPosition && currentCenter) {
                    const newRadius = google.maps.geometry.spherical.computeDistanceBetween(
                        currentCenter,
                        newPosition
                    );
                    // Update radius directly via setFormData to avoid circular dependency
                    const clampedRadius = Math.max(10, Math.min(5000, newRadius));
                    setFormData(prev => {
                        if (Math.abs(prev.radius - clampedRadius) < 1) {
                            return prev;
                        }
                        return {
                            ...prev,
                            radius: clampedRadius,
                        };
                    });
                    
                    // Update circle immediately
                    if (circleRef.current) {
                        circleRef.current.setRadius(clampedRadius);
                    }
                }
            });

            resizeMarkersRef.current.push(marker);
        });

        console.log('[GeofenceMapEditor] Resize markers created:', resizeMarkersRef.current.length);
    }, [formData.type, isPlacementMode]);

    // Set up map click listener when map is ready - separate effect for better control
    useEffect(() => {
        console.log('[GeofenceMapEditor] Click listener effect triggered', {
            isMapLoaded,
            hasGoogleMap: !!googleMapRef.current,
            isOpen,
            hasClickListener: !!clickListenerRef.current,
        });

        if (!isOpen) {
            console.log('[GeofenceMapEditor] Modal not open, skipping click listener setup');
            return;
        }

        if (!isMapLoaded) {
            console.log('[GeofenceMapEditor] Map not loaded yet, skipping click listener setup');
            return;
        }

        if (!googleMapRef.current) {
            console.warn('[GeofenceMapEditor] Google map ref is null, cannot set up click listener');
            return;
        }

        console.log('[GeofenceMapEditor] Setting up map click listener', {
            isPlacementMode: isPlacementModeRef.current,
            hasPlacedCenter: hasPlacedCenterRef.current,
            hasGeofence: !!geofenceRef.current,
            mapReady: !!googleMapRef.current,
        });

        // Remove existing click listener
        if (clickListenerRef.current) {
            console.log('[GeofenceMapEditor] Removing existing click listener');
            google.maps.event.removeListener(clickListenerRef.current);
            clickListenerRef.current = null;
        }

        // Add map click listener - use refs so it always has latest state
        clickListenerRef.current = google.maps.event.addListener(
            googleMapRef.current,
            'click',
            (e: google.maps.MapMouseEvent) => {
                // Use refs to get current state values
                const currentPlacementMode = isPlacementModeRef.current;
                const currentHasPlacedCenter = hasPlacedCenterRef.current;
                const currentGeofence = geofenceRef.current;
                const currentFormData = formDataRef.current;

                console.log('[GeofenceMapEditor] Map clicked', {
                    hasLatLng: !!e.latLng,
                    latLng: e.latLng ? { lat: e.latLng.lat(), lng: e.latLng.lng() } : null,
                    isPlacementMode: currentPlacementMode,
                    hasPlacedCenter: currentHasPlacedCenter,
                    hasGeofence: !!currentGeofence,
                });

                if (!e.latLng) {
                    console.warn('[GeofenceMapEditor] Click event has no latLng');
                    return;
                }
                
                const lat = e.latLng.lat();
                const lng = e.latLng.lng();
                
                console.log('[GeofenceMapEditor] Map clicked - processing', {
                    lat,
                    lng,
                    isPlacementMode: currentPlacementMode,
                    hasGeofence: !!currentGeofence,
                });
                
                // If in placement mode, place the geofence
                if (currentPlacementMode) {
                    console.log('[GeofenceMapEditor] In placement mode - placing geofence at:', { lat, lng });
                    
                    // Update center
                    setFormData(prev => {
                        console.log('[GeofenceMapEditor] Updating formData center', {
                            old: prev.center,
                            new: { latitude: lat, longitude: lng },
                        });
                        return {
                            ...prev,
                            center: { latitude: lat, longitude: lng },
                        };
                    });
                    
                    // Exit placement mode and show geofence
                    console.log('[GeofenceMapEditor] Exiting placement mode and creating geofence');
                    // Clear refs immediately
                    userActivatedPlacementModeRef.current = false;
                    isPlacementModeRef.current = false;
                    // Then update state
                    setHasPlacedCenter(true);
                    setIsPlacementMode(false);
                    
                    // Update map draggability
                    if (googleMapRef.current) {
                        googleMapRef.current.setOptions({
                            draggable: true,
                            draggableCursor: 'default',
                        });
                    }
                    
                    // Create marker and circle if they don't exist
                    if (!centerMarkerRef.current) {
                        console.log('[GeofenceMapEditor] Creating center marker');
                        const centerPos = new google.maps.LatLng(lat, lng);
                        const markerColor = getGeofenceColor(currentFormData.type);
                        
        centerMarkerRef.current = new google.maps.Marker({
                            position: centerPos,
            map: googleMapRef.current,
            title: 'Geofence Center',
            draggable: true,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                                scale: 12,
                                fillColor: markerColor,
                fillOpacity: 1,
                strokeColor: '#FFFFFF',
                                strokeWeight: 3,
                            },
                            zIndex: 1000,
                            optimized: false,
                        });

                        // Add drag listener
                        centerMarkerRef.current.addListener('drag', (e: google.maps.MapMouseEvent) => {
                            if (e.latLng) {
                                console.log('[GeofenceMapEditor] Center marker dragged', {
                                    lat: e.latLng.lat(),
                                    lng: e.latLng.lng(),
                                });
                                setFormData(prev => ({
                                    ...prev,
                                    center: { latitude: e.latLng!.lat(), longitude: e.latLng!.lng() },
                                }));
                            }
                        });
                        console.log('[GeofenceMapEditor] Center marker created and drag listener added');
                    } else {
                        // Update existing marker position
                        console.log('[GeofenceMapEditor] Updating existing center marker position');
                        centerMarkerRef.current.setPosition(new google.maps.LatLng(lat, lng));
                    }
                    
                    if (!circleRef.current) {
                        console.log('[GeofenceMapEditor] Creating circle');
                        const centerPos = new google.maps.LatLng(lat, lng);
                        const circleColor = getGeofenceColor(currentFormData.type);
                        
        circleRef.current = new google.maps.Circle({
                            strokeColor: circleColor,
            strokeOpacity: 0.8,
            strokeWeight: 2,
                            fillColor: circleColor,
            fillOpacity: 0.2,
            map: googleMapRef.current,
                            center: centerPos,
                            radius: currentFormData.radius,
            clickable: false,
        });

                        console.log('[GeofenceMapEditor] Circle created, creating resize markers');
                        // Create resize markers after circle is created - call it directly
                        if (googleMapRef.current && circleRef.current) {
                            // Clear existing resize markers
                            resizeMarkersRef.current.forEach(marker => {
                                if (marker) {
                                    google.maps.event.clearInstanceListeners(marker);
                                    marker.setMap(null);
                                }
                            });
                            resizeMarkersRef.current = [];

                            const center = circleRef.current.getCenter();
                            if (center) {
                                const radius = circleRef.current.getRadius();
                                const color = getGeofenceColor(currentFormData.type);
                                const angles = [0, 90, 180, 270];
                                
                                angles.forEach((angle) => {
                                    const point = google.maps.geometry.spherical.computeOffset(
                                        center,
                                        radius,
                                        angle
                                    );
                                    
                                    const marker = new google.maps.Marker({
                                        position: point,
                                        map: googleMapRef.current,
                                        title: 'Drag to resize',
                                        draggable: true,
                                        icon: {
                                            path: google.maps.SymbolPath.CIRCLE,
                                            scale: 10,
                                            fillColor: '#FFFFFF',
                                            fillOpacity: 1,
                                            strokeColor: color,
                                            strokeWeight: 3,
                                        },
                                        zIndex: 999,
                                        optimized: false,
                                    });

                                    marker.addListener('drag', () => {
                                        const newPosition = marker.getPosition();
                                        const currentCenter = circleRef.current?.getCenter();
                                        if (newPosition && currentCenter) {
                                            const newRadius = google.maps.geometry.spherical.computeDistanceBetween(
                                                currentCenter,
                                                newPosition
                                            );
                                            const clampedRadius = Math.max(10, Math.min(5000, newRadius));
                                            setFormData(prev => {
                                                if (Math.abs(prev.radius - clampedRadius) < 1) {
                                                    return prev;
                                                }
                                                return {
                                                    ...prev,
                                                    radius: clampedRadius,
                                                };
                                            });
                                            
                                            if (circleRef.current) {
                                                circleRef.current.setRadius(clampedRadius);
                                            }
                                        }
                                    });

                                    resizeMarkersRef.current.push(marker);
                                });
                                console.log('[GeofenceMapEditor] Resize markers created:', resizeMarkersRef.current.length);
                            }
                        }
                    } else {
                        // Update existing circle
                        console.log('[GeofenceMapEditor] Updating existing circle');
                        circleRef.current.setCenter(new google.maps.LatLng(lat, lng));
                        // Update resize markers positions
                        if (resizeMarkersRef.current.length > 0 && circleRef.current) {
        const center = circleRef.current.getCenter();
                            if (center) {
        const radius = circleRef.current.getRadius();
                                const angles = [0, 90, 180, 270];
                                resizeMarkersRef.current.forEach((marker, index) => {
                                    if (marker && center) {
                                        const point = google.maps.geometry.spherical.computeOffset(
                                            center,
                                            radius,
                                            angles[index]
                                        );
                                        marker.setPosition(point);
                                    }
                                });
                            }
                        } else if (circleRef.current) {
                            // Create resize markers if they don't exist
                            const center = circleRef.current.getCenter();
                            if (center && googleMapRef.current) {
                                const radius = circleRef.current.getRadius();
                                const color = getGeofenceColor(currentFormData.type);
                                const angles = [0, 90, 180, 270];
                                
                                resizeMarkersRef.current.forEach(marker => {
                                    if (marker) {
                                        google.maps.event.clearInstanceListeners(marker);
                                        marker.setMap(null);
                                    }
                                });
                                resizeMarkersRef.current = [];
                                
                                angles.forEach((angle) => {
                                    const point = google.maps.geometry.spherical.computeOffset(
                                        center,
                                        radius,
                                        angle
                                    );
            
            const marker = new google.maps.Marker({
                                        position: point,
                map: googleMapRef.current,
                                        title: 'Drag to resize',
                draggable: true,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                                            scale: 10,
                    fillColor: '#FFFFFF',
                    fillOpacity: 1,
                                            strokeColor: color,
                                            strokeWeight: 3,
                },
                                        zIndex: 999,
                                        optimized: false,
            });

            marker.addListener('drag', () => {
                                        const newPosition = marker.getPosition();
                                        const currentCenter = circleRef.current?.getCenter();
                                        if (newPosition && currentCenter) {
                const newRadius = google.maps.geometry.spherical.computeDistanceBetween(
                                                currentCenter,
                                                newPosition
                                            );
                                            const clampedRadius = Math.max(10, Math.min(5000, newRadius));
                                            setFormData(prev => {
                                                if (Math.abs(prev.radius - clampedRadius) < 1) {
                                                    return prev;
                                                }
                                                return {
                                                    ...prev,
                                                    radius: clampedRadius,
                                                };
                                            });
                                            
                                            if (circleRef.current) {
                                                circleRef.current.setRadius(clampedRadius);
                                            }
                                        }
            });

            resizeMarkersRef.current.push(marker);
        });
                            }
                        }
                    }
                } else if (currentGeofence) {
                    // Editing existing geofence - allow clicking to move center
                    console.log('[GeofenceMapEditor] Editing geofence - updating center');
                    setFormData(prev => ({
                        ...prev,
                        center: { latitude: lat, longitude: lng },
                    }));
                } else {
                    console.log('[GeofenceMapEditor] Click ignored - not in placement mode and not editing');
                }
            }
        );

        console.log('[GeofenceMapEditor] Map click listener added successfully');

        // Cleanup
        return () => {
            if (clickListenerRef.current && googleMapRef.current) {
                console.log('[GeofenceMapEditor] Removing click listener on cleanup');
                google.maps.event.removeListener(clickListenerRef.current);
                clickListenerRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isMapLoaded, isOpen]); // Only depend on isMapLoaded and isOpen - click handler uses refs for current state

    // Initialize markers for existing geofence when map and geofence are ready
    useEffect(() => {
        if (!isMapLoaded || !googleMapRef.current || !geofence || centerMarkerRef.current || circleRef.current) {
            return;
        }

        console.log('[GeofenceMapEditor] Creating markers for existing geofence');
        const centerPos = new google.maps.LatLng(formData.center.latitude, formData.center.longitude);
        const markerColor = getGeofenceColor(formData.type);

        // Create center marker
        centerMarkerRef.current = new google.maps.Marker({
            position: centerPos,
            map: googleMapRef.current,
            title: 'Geofence Center',
            draggable: true,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 12,
                fillColor: markerColor,
                fillOpacity: 1,
                strokeColor: '#FFFFFF',
                strokeWeight: 3,
            },
            zIndex: 1000,
            optimized: false,
        });

        centerMarkerRef.current.addListener('drag', (e: google.maps.MapMouseEvent) => {
            if (e.latLng) {
                console.log('[GeofenceMapEditor] Editing: Center marker dragged', {
                    lat: e.latLng.lat(),
                    lng: e.latLng.lng(),
                });
        setFormData(prev => ({
            ...prev,
                    center: { latitude: e.latLng!.lat(), longitude: e.latLng!.lng() },
                }));
            }
        });

        // Create circle
        circleRef.current = new google.maps.Circle({
            strokeColor: markerColor,
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: markerColor,
            fillOpacity: 0.2,
            map: googleMapRef.current,
            center: centerPos,
            radius: formData.radius,
            clickable: false,
        });

        console.log('[GeofenceMapEditor] Created markers and circle for existing geofence');
        // Create resize markers after circle is created
        createResizeMarkers();
    }, [isMapLoaded, geofence, formData.center.latitude, formData.center.longitude, formData.radius, formData.type, createResizeMarkers]);

    // Update map draggability based on placement mode
    useEffect(() => {
        console.log('[GeofenceMapEditor] Map draggability effect triggered', {
            hasGoogleMap: !!googleMapRef.current,
            isPlacementMode,
            hasPlacedCenter,
        });

        if (!googleMapRef.current) {
            console.log('[GeofenceMapEditor] Google map ref is null, skipping draggability update');
            return;
        }
        
        // Update map draggability
        const shouldBeDraggable = !isPlacementMode && hasPlacedCenter;
        console.log('[GeofenceMapEditor] Updating map draggability', {
            draggable: shouldBeDraggable,
            cursor: isPlacementMode ? 'crosshair' : 'default',
        });
        
        googleMapRef.current.setOptions({
            draggable: shouldBeDraggable,
            draggableCursor: isPlacementMode ? 'crosshair' : 'default',
        });
        
        console.log('[GeofenceMapEditor] Map draggability updated');
    }, [isPlacementMode, hasPlacedCenter]);

    // Update visualization when formData changes
    useEffect(() => {
        console.log('[GeofenceMapEditor] Visualization update effect triggered', {
            isMapLoaded,
            hasGoogleMap: !!googleMapRef.current,
            formDataCenter: formData.center,
            hasPlacedCenter,
            hasGeofence: !!geofence,
            isPlacementMode,
        });

        if (!isMapLoaded || !googleMapRef.current) {
            console.log('[GeofenceMapEditor] Map not loaded yet, skipping visualization update');
            return;
        }

        if (formData.center.latitude === 0 && formData.center.longitude === 0) {
            console.log('[GeofenceMapEditor] Form data center is at origin, skipping visualization update');
            return;
        }

        if (!hasPlacedCenter && !geofence) {
            console.log('[GeofenceMapEditor] Center not placed yet and not editing, skipping visualization');
            return; // Don't show geofence until center is placed
        }

        const center = new google.maps.LatLng(formData.center.latitude, formData.center.longitude);
        const color = getGeofenceColor(formData.type);

        console.log('[GeofenceMapEditor] Updating visualization', {
            center: { lat: formData.center.latitude, lng: formData.center.longitude },
            radius: formData.radius,
            color,
            hasCenterMarker: !!centerMarkerRef.current,
            hasCircle: !!circleRef.current,
        });

        // Update center marker
        if (centerMarkerRef.current) {
            console.log('[GeofenceMapEditor] Updating center marker position and style');
            centerMarkerRef.current.setPosition(center);
            centerMarkerRef.current.setIcon({
                path: google.maps.SymbolPath.CIRCLE,
                scale: 12,
                fillColor: color,
                fillOpacity: 1,
                strokeColor: '#FFFFFF',
                strokeWeight: 3,
            });
            centerMarkerRef.current.setDraggable(!isPlacementMode); // Only draggable when not in placement mode
        } else if (hasPlacedCenter || geofence) {
            console.log('[GeofenceMapEditor] Creating center marker (should have been created earlier)');
            // Marker should have been created, but if not, create it now
            const markerColor = getGeofenceColor(formData.type);
            centerMarkerRef.current = new google.maps.Marker({
                position: center,
                map: googleMapRef.current,
                title: 'Geofence Center',
                draggable: !isPlacementMode,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 12,
                    fillColor: markerColor,
                    fillOpacity: 1,
                    strokeColor: '#FFFFFF',
                    strokeWeight: 3,
                },
                zIndex: 1000,
                optimized: false,
            });

            centerMarkerRef.current.addListener('drag', (e: google.maps.MapMouseEvent) => {
                if (e.latLng) {
                    console.log('[GeofenceMapEditor] Center marker dragged', {
                        lat: e.latLng.lat(),
                        lng: e.latLng.lng(),
                    });
        setFormData(prev => ({
            ...prev,
                        center: { latitude: e.latLng!.lat(), longitude: e.latLng!.lng() },
        }));
        }
            });
        }

        // Update circle
        if (circleRef.current) {
            console.log('[GeofenceMapEditor] Updating circle position and style');
            circleRef.current.setCenter(center);
            circleRef.current.setRadius(formData.radius);
            circleRef.current.setOptions({
                strokeColor: color,
                fillColor: color,
            });
        } else if (hasPlacedCenter || geofence) {
            console.log('[GeofenceMapEditor] Creating circle (should have been created earlier)');
            // Circle should have been created, but if not, create it now
            circleRef.current = new google.maps.Circle({
                strokeColor: color,
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: color,
                fillOpacity: 0.2,
                map: googleMapRef.current,
                center,
                radius: formData.radius,
                clickable: false,
            });
            createResizeMarkers();
        }

        // Update resize markers positions (only show when center is placed)
        if (circleRef.current && resizeMarkersRef.current.length === 4 && (hasPlacedCenter || geofence)) {
            const circleCenter = circleRef.current.getCenter();
            if (circleCenter) {
                console.log('[GeofenceMapEditor] Updating resize markers positions');
                const angles = [0, 90, 180, 270];
                resizeMarkersRef.current.forEach((marker, index) => {
                    if (marker) {
                        const point = google.maps.geometry.spherical.computeOffset(
                            circleCenter,
                            formData.radius,
                            angles[index]
                        );
                        marker.setPosition(point);
                        marker.setIcon({
                            path: google.maps.SymbolPath.CIRCLE,
                            scale: 10,
                            fillColor: '#FFFFFF',
                            fillOpacity: 1,
                            strokeColor: color,
                            strokeWeight: 3,
                        });
                        marker.setDraggable(!isPlacementMode); // Only draggable when not in placement mode
                        marker.setVisible(!isPlacementMode); // Hide during placement mode
                    }
                });
            }
        } else if (circleRef.current && (hasPlacedCenter || geofence) && resizeMarkersRef.current.length === 0) {
            console.log('[GeofenceMapEditor] Resize markers missing, creating them');
        createResizeMarkers();
        }
    }, [formData.center.latitude, formData.center.longitude, formData.radius, formData.type, isMapLoaded, hasPlacedCenter, isPlacementMode, geofence, createResizeMarkers]);

    // Set alert recipients to all hub members when creating new geofence
    useEffect(() => {
        if (!geofence && currentHub?.members && formData.alertRecipients.length === 0) {
            // In a real app, you'd get hub members here
            // For now, we'll leave it empty and the backend can handle it
            setFormData(prev => ({ ...prev, alertRecipients: [] }));
        }
    }, [geofence, currentHub]);

    // Initialize map when opened and location is available
    useEffect(() => {
        console.log('[GeofenceMapEditor] Map initialization effect triggered', {
            isOpen,
            hasMapRef: !!mapRef.current,
            hasGoogleMap: !!googleMapRef.current,
            hasGeofence: !!geofence,
            bestLocation: bestLocation ? { lat: bestLocation.latitude, lng: bestLocation.longitude } : null,
        });

        if (!isOpen) {
            console.log('[GeofenceMapEditor] Modal is not open, skipping map initialization');
            return;
        }

        if (!mapRef.current) {
            console.warn('[GeofenceMapEditor] Map ref is not available');
            return;
        }

        if (googleMapRef.current) {
            console.log('[GeofenceMapEditor] Map already initialized, skipping');
            return;
        }

        // Wait for location if creating new geofence
        if (!geofence && (!bestLocation || bestLocation.latitude === 0 || bestLocation.longitude === 0)) {
            console.log('[GeofenceMapEditor] Waiting for location to be available');
            console.log('[GeofenceMapEditor] bestLocation:', bestLocation);
            console.log('[GeofenceMapEditor] currentLocation:', currentLocation);
            // Wait for location to be available
            return;
        }

        console.log('[GeofenceMapEditor] Starting map initialization');
        let isMounted = true;

        googleMapsLoader.load().then((google) => {
            console.log('[GeofenceMapEditor] Google Maps loaded');
            if (!isMounted) {
                console.log('[GeofenceMapEditor] Component unmounted, aborting map initialization');
                return;
            }
            if (!mapRef.current) {
                console.warn('[GeofenceMapEditor] Map ref is null after load');
                return;
            }

            // Determine center coordinates
            let centerCoords: { latitude: number; longitude: number };
            
            if (geofence) {
                // Editing existing geofence - use its center
                centerCoords = geofence.center;
                console.log('[GeofenceMapEditor] Using geofence center:', centerCoords);
            } else if (bestLocation && bestLocation.latitude !== 0 && bestLocation.longitude !== 0) {
                // Creating new geofence - use current location
                centerCoords = bestLocation;
                console.log('[GeofenceMapEditor] Using bestLocation:', centerCoords);
            } else {
                // Fallback - shouldn't happen but just in case
                console.warn('[GeofenceMapEditor] No location available, using default (San Francisco)');
                centerCoords = { latitude: 37.7749, longitude: -122.4194 }; // San Francisco default
            }

            const center = new google.maps.LatLng(centerCoords.latitude, centerCoords.longitude);
            console.log('[GeofenceMapEditor] Creating map with center:', centerCoords);

            try {
                // Create map
                googleMapRef.current = new google.maps.Map(mapRef.current, {
                    center,
                    zoom: 15,
                    mapTypeControl: true,
                    streetViewControl: true,
                    fullscreenControl: true,
                    zoomControl: true,
                    disableDefaultUI: false,
                });

                console.log('[GeofenceMapEditor] Map created successfully');
                
                // Update formData with location if creating new geofence
                if (!geofence) {
                    console.log('[GeofenceMapEditor] Updating formData with centerCoords');
                    setFormData(prev => ({
                        ...prev,
                        center: centerCoords,
                    }));
                }
                
                // Set map loaded immediately - the map is ready for interaction
                // The idle event can fire later, but we don't need to wait for it
                setIsMapLoaded(true);
                console.log('[GeofenceMapEditor] isMapLoaded set to true - map is ready');
                
                // Also listen for idle event as confirmation (but don't block on it)
                google.maps.event.addListenerOnce(googleMapRef.current, 'idle', () => {
                    console.log('[GeofenceMapEditor] Map is idle (fully loaded and ready)');
                    // Just confirm - we already set isMapLoaded above
                });
            } catch (error) {
                console.error('[GeofenceMapEditor] Error creating map:', error);
            }
        }).catch((error) => {
            console.error('[GeofenceMapEditor] Error loading Google Maps:', error);
        });

        return () => {
            console.log('[GeofenceMapEditor] Cleaning up map initialization effect');
            isMounted = false;
            // Don't clean up click listener here - it's managed by its own effect
            // Just mark as unmounted to prevent state updates
        };
        // Only depend on isOpen, geofence, and bestLocation
        // Don't include isPlacementMode - it shouldn't trigger map re-initialization
    }, [isOpen, geofence, bestLocation]);

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('[GeofenceMapEditor] Form submitted', {
            name: formData.name,
            center: formData.center,
            radius: formData.radius,
            hasPlacedCenter,
            hasGeofence: !!geofence,
        });

        if (!formData.name.trim()) {
            console.warn('[GeofenceMapEditor] Form validation failed - name is empty');
            return;
        }

        if (!hasPlacedCenter && !geofence) {
            console.warn('[GeofenceMapEditor] Form validation failed - center not placed');
            return;
        }

        if (formData.center.latitude === 0 && formData.center.longitude === 0) {
            console.warn('[GeofenceMapEditor] Form validation failed - center is at origin');
            return;
        }

        console.log('[GeofenceMapEditor] Calling onSave with data:', formData);
        onSave({
            ...formData,
            alertRecipients: formData.alertRecipients.length > 0 
                ? formData.alertRecipients 
                : [], // Empty array means all hub members
        });
    };

    // Geofence types
    const geofenceTypes = [
        { value: 'home', label: 'Home', icon: <FiHome size={20} /> },
        { value: 'school', label: 'School', icon: <FiBookOpen size={20} /> },
        { value: 'work', label: 'Work', icon: <FiBriefcase size={20} /> },
        { value: 'custom', label: 'Custom', icon: <FiMapPin size={20} /> },
    ] as const;

    console.log('[GeofenceMapEditor] Render check', {
        isOpen,
        hasGeofence: !!geofence,
        isMapLoaded,
        hasPlacedCenter,
        isPlacementMode,
        formDataCenter: formData.center,
    });

    if (!isOpen) {
        console.log('[GeofenceMapEditor] Modal is not open, returning null');
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <FiMapPin size={24} className="text-purple-600" />
                        <h2 className="text-2xl font-bold text-gray-900">
                            {geofence ? 'Edit Geofence' : 'Create Geofence'}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                <div className="flex h-[600px]">
                    {/* Map */}
                    <div className="flex-1 relative">
                        <div
                            ref={mapRef}
                            className="w-full h-full"
                            style={{ minHeight: '400px' }}
                        />
                        {(!isMapLoaded || (!geofence && (!bestLocation || bestLocation.latitude === 0))) && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                                    <p className="text-gray-600">
                                        {!geofence && (!bestLocation || bestLocation.latitude === 0) 
                                            ? 'Waiting for your location...' 
                                            : 'Loading map...'}
                                    </p>
                                </div>
                            </div>
                        )}
                        
                        {/* Instructions overlay */}
                        <div className="absolute top-4 left-4 bg-white bg-opacity-95 backdrop-blur-sm rounded-lg p-3 shadow-lg z-10">
                            {isPlacementMode ? (
                                <>
                                    <p className="text-sm font-medium text-purple-600 mb-1">
                                        📍 Placement Mode Active
                                    </p>
                                    <p className="text-xs text-gray-700">
                                        Click anywhere on the map to place the geofence center
                                    </p>
                                </>
                            ) : hasPlacedCenter || geofence ? (
                                <>
                                    <p className="text-sm text-gray-700 font-medium">
                                        {geofence ? 'Editing geofence' : 'Geofence placed'}
                                    </p>
                                    <p className="text-xs text-gray-600 mt-1">
                                        • Drag center marker to move
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        • Drag white dots to resize radius
                                    </p>
                                    {!geofence && (
                                        <p className="text-xs text-gray-600">
                                            • Click "Place Geofence" to reposition
                                        </p>
                                    )}
                                </>
                            ) : (
                                <>
                                    <p className="text-sm text-gray-700 font-medium">
                                        Ready to create geofence
                                    </p>
                                    <p className="text-xs text-gray-600 mt-1">
                                        Click "Place Geofence" button to start
                                    </p>
                                </>
                            )}
                        </div>

                        {/* Place Geofence Button */}
                        {!geofence && (
                            <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                                {!hasPlacedCenter && !isPlacementMode && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            console.log('[GeofenceMapEditor] Place Geofence button clicked');
                                            console.log('[GeofenceMapEditor] Current state:', {
                                                hasPlacedCenter,
                                                isPlacementMode,
                                                hasGoogleMap: !!googleMapRef.current,
                                                formDataCenter: formData.center,
                                            });
                                            // CRITICAL: Set refs immediately BEFORE state update
                                            // This prevents form data effect from resetting placement mode
                                            userActivatedPlacementModeRef.current = true;
                                            isPlacementModeRef.current = true;
                                            console.log('[GeofenceMapEditor] Refs set to true immediately');
                                            // Then update state
                                            setIsPlacementMode(true);
                                            console.log('[GeofenceMapEditor] isPlacementMode state set to true');
                                            if (googleMapRef.current) {
                                                console.log('[GeofenceMapEditor] Updating map options - disabling dragging');
                                                googleMapRef.current.setOptions({
                                                    draggable: false,
                                                    draggableCursor: 'crosshair',
                                                });
                                                console.log('[GeofenceMapEditor] Map options updated');
                                            } else {
                                                console.warn('[GeofenceMapEditor] Google map ref is null, cannot update options');
                                            }
                                        }}
                                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-colors font-medium"
                                    >
                                        <FiTarget size={16} />
                                        <span className="text-sm">Place Geofence</span>
                                    </button>
                                )}
                                
                                {isPlacementMode && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            console.log('[GeofenceMapEditor] Cancel button clicked');
                                            // Clear refs immediately
                                            userActivatedPlacementModeRef.current = false;
                                            isPlacementModeRef.current = false;
                                            // Then update state
                                            setIsPlacementMode(false);
                                            console.log('[GeofenceMapEditor] Placement mode cancelled - refs and state updated');
                                            if (googleMapRef.current) {
                                                console.log('[GeofenceMapEditor] Re-enabling map dragging');
                                                googleMapRef.current.setOptions({
                                                    draggable: true,
                                                    draggableCursor: 'default',
                                                });
                                                console.log('[GeofenceMapEditor] Map options updated');
                                            }
                                        }}
                                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-colors font-medium"
                                    >
                                        <FiX size={16} />
                                        <span className="text-sm">Cancel</span>
                                    </button>
                                )}

                                {/* Reposition button - show when center is placed */}
                                {hasPlacedCenter && !isPlacementMode && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsPlacementMode(true);
                                            if (googleMapRef.current) {
                                                googleMapRef.current.setOptions({
                                                    draggable: false,
                                                    draggableCursor: 'crosshair',
                                                });
                                            }
                                        }}
                                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-colors font-medium"
                                    >
                                        <FiTarget size={16} />
                                        <span className="text-sm">Reposition</span>
                                    </button>
                                )}

                                {/* Use My Location Button - only show when not in placement mode */}
                                {!isPlacementMode && bestLocation && bestLocation.latitude !== 0 && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (bestLocation && googleMapRef.current) {
                                                const center = new google.maps.LatLng(
                                                    bestLocation.latitude,
                                                    bestLocation.longitude
                                                );
                                                googleMapRef.current.setCenter(center);
                                                googleMapRef.current.setZoom(15);
                                                
                                                // Update center
                                                setFormData(prev => ({
                                                    ...prev,
                                                    center: bestLocation,
                                                }));
                                                
                                                // If center marker exists, update it
                                                if (centerMarkerRef.current) {
                                                    centerMarkerRef.current.setPosition(center);
                                                }
                                            }
                                        }}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-colors font-medium"
                                    >
                                        <FiNavigation size={16} />
                                        <span className="text-sm">My Location</span>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Form */}
                    <div className="w-80 border-l border-gray-200 p-6 overflow-y-auto">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Basic Info */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Geofence Details</h3>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="e.g., Home, School, Work"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Description
                                        </label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="Optional description..."
                                            rows={3}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Type
                                        </label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {geofenceTypes.map((type) => (
                                                <label
                                                    key={type.value}
                                                    className={`flex items-center gap-2 p-2 border-2 rounded-lg cursor-pointer transition-colors ${
                                                        formData.type === type.value
                                                            ? 'border-purple-500 bg-purple-50'
                                                            : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="type"
                                                        value={type.value}
                                                        checked={formData.type === type.value}
                                                        onChange={(e) => setFormData(prev => ({ 
                                                            ...prev, 
                                                            type: e.target.value as GeofenceType 
                                                        }))}
                                                        className="sr-only"
                                                    />
                                                    {type.icon}
                                                    <span className="text-sm font-medium">{type.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Location Info */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Location</h3>
                                <div className="space-y-4">
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Latitude:</span>
                                            <span className="font-mono text-xs">{formData.center.latitude.toFixed(6)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Longitude:</span>
                                            <span className="font-mono text-xs">{formData.center.longitude.toFixed(6)}</span>
                                        </div>
                                    </div>
                                    
                                    {/* Radius Slider */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-sm font-medium text-gray-700">
                                                Radius
                                            </label>
                                            <span className="text-sm font-bold text-purple-600">
                                                {formData.radius < 1000 
                                                    ? `${Math.round(formData.radius)}m` 
                                                    : `${(formData.radius / 1000).toFixed(1)}km`}
                                            </span>
                                        </div>
                                        <input
                                            type="range"
                                            min="10"
                                            max="5000"
                                            step="10"
                                            value={formData.radius}
                                            onChange={(e) => {
                                                const newRadius = parseInt(e.target.value, 10);
                                                setFormData(prev => ({ ...prev, radius: newRadius }));
                                            }}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                                            style={{
                                                background: `linear-gradient(to right, #9333ea 0%, #9333ea ${(formData.radius / 5000) * 100}%, #e5e7eb ${(formData.radius / 5000) * 100}%, #e5e7eb 100%)`
                                            }}
                                        />
                                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                                            <span>10m</span>
                                            <span>5km</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Alert Settings */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Alert Settings</h3>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={formData.alertOnEntry}
                                            onChange={(e) => setFormData(prev => ({ ...prev, alertOnEntry: e.target.checked }))}
                                            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">
                                            Alert when entering this area
                                        </span>
                                    </label>
                                    
                                    <label className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={formData.alertOnExit}
                                            onChange={(e) => setFormData(prev => ({ ...prev, alertOnExit: e.target.checked }))}
                                            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">
                                            Alert when leaving this area
                                        </span>
                                    </label>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    Alerts will be sent to all hub members
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-6 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                >
                                    {geofence ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};
