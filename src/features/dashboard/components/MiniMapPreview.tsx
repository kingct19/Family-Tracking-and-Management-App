/**
 * MiniMapPreview - Compact map preview for dashboard
 * Shows member locations with profile photos on markers
 */

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { googleMapsLoader } from '@/lib/services/google-maps-loader';
import { useHubLocations, useUserLocation } from '@/features/location/hooks/useLocation';
import { useHubStore } from '@/lib/store/hub-store';
import { useHubMembers } from '@/features/tasks/hooks/useHubMembers';
import { useAuth, useUserProfile } from '@/features/auth/hooks/useAuth';
import { MdMyLocation, MdOpenInNew } from 'react-icons/md';

interface MiniMapPreviewProps {
    className?: string;
}

// Member avatar component with proper image loading state
interface MemberAvatarProps {
    member: {
        oderId: string;
        displayName: string;
        photoURL?: string;
        hasLocation: boolean;
        isCurrentUser: boolean;
    };
    isSelected: boolean;
    onClick: () => void;
}

const MemberAvatar = ({ member, isSelected, onClick }: MemberAvatarProps) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    const showImage = member.photoURL && !imageError;
    const initial = member.displayName?.[0]?.toUpperCase() || (member.isCurrentUser ? 'Y' : 'M');

    return (
        <button
            onClick={onClick}
            disabled={!member.hasLocation}
            className={`flex-shrink-0 relative group transition-all duration-200 ${
                member.hasLocation 
                    ? 'cursor-pointer hover:scale-110' 
                    : 'opacity-40 cursor-not-allowed'
            }`}
            title={member.displayName || 'Member'}
        >
            {/* Avatar */}
            <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white text-label-md font-semibold overflow-hidden transition-all ${
                isSelected
                    ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-900 scale-110'
                    : member.isCurrentUser 
                        ? 'ring-2 ring-emerald-400' 
                        : 'ring-2 ring-white/40'
            } ${member.isCurrentUser ? 'bg-emerald-500' : 'bg-gradient-to-br from-primary to-secondary'}`}>
                {showImage && (
                    <img 
                        src={member.photoURL} 
                        alt={member.displayName}
                        className={`w-full h-full object-cover transition-opacity ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                        onLoad={() => setImageLoaded(true)}
                        onError={() => setImageError(true)}
                    />
                )}
                {(!showImage || !imageLoaded) && (
                    <span className="flex items-center justify-center w-full h-full absolute inset-0">
                        {initial}
                    </span>
                )}
            </div>
            
            {/* Online indicator */}
            {member.hasLocation && (
                <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                    member.isCurrentUser ? 'bg-emerald-400' : 'bg-primary'
                }`} />
            )}
            
            {/* Name tooltip on hover */}
            <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-slate-800/95 text-white text-label-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-lg">
                {member.isCurrentUser ? 'You' : member.displayName?.split(' ')[0] || 'Member'}
            </div>
        </button>
    );
};

// Custom dark map style
const darkMapStyle: google.maps.MapTypeStyle[] = [
    { elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#1e293b' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#64748b' }] },
    { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#334155' }] },
    { featureType: 'administrative.land_parcel', elementType: 'labels.text.fill', stylers: [{ color: '#64748b' }] },
    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#334155' }] },
    { featureType: 'road', elementType: 'labels', stylers: [{ visibility: 'off' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#475569' }] },
    { featureType: 'transit', stylers: [{ visibility: 'off' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
    { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#475569' }] },
];

export const MiniMapPreview = ({ className = '' }: MiniMapPreviewProps) => {
    const navigate = useNavigate();
    const { currentHub } = useHubStore();
    const { user } = useAuth();
    const { data: currentUserProfile } = useUserProfile(user?.id);
    const { currentLocation, isSharing, startTracking, isWatching } = useUserLocation();
    const { locations } = useHubLocations(currentHub?.id);
    const { data: members = [], isLoading: membersLoading } = useHubMembers();

    const mapRef = useRef<HTMLDivElement>(null);
    const googleMapRef = useRef<google.maps.Map | null>(null);
    const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());
    const currentUserMarkerRef = useRef<google.maps.Marker | null>(null);
    const accuracyCircleRef = useRef<google.maps.Circle | null>(null);
    const initAttempted = useRef(false);
    const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());
    const failedImages = useRef<Set<string>>(new Set());

    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const [loadError, setLoadError] = useState(false);
    const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

    // Auto-start location tracking if not already watching
    useEffect(() => {
        if (!isWatching && user && currentHub) {
            startTracking();
        }
    }, [isWatching, user, currentHub, startTracking]);

    // Combine current user location with other locations
    const allLocations = useMemo(() => {
        const otherLocations = locations.filter(loc => loc.userId !== user?.id);
        if (user && currentLocation && isSharing) {
            return [
                {
                    userId: user.id,
                    latitude: currentLocation.latitude,
                    longitude: currentLocation.longitude,
                    accuracy: currentLocation.accuracy,
                    isSharing: true,
                },
                ...otherLocations,
            ];
        }
        return otherLocations;
    }, [locations, currentLocation, isSharing, user]);

    // Get member info with location status
    // Use the members array from useHubMembers which has all user profile data including photoURL
    const membersWithStatus = useMemo(() => {
        if (!currentHub) return [];
        
        // Start with members from useHubMembers (has photoURL from Firebase)
        const membersList = members.length > 0 ? members : [];
        
        // Also check if current user is in the list
        const currentUserInList = membersList.some(m => m.userId === user?.id);
        
        // Build the final list
        const result = membersList.map(member => {
            const isCurrentUser = member.userId === user?.id;
            const location = allLocations.find(loc => loc.userId === member.userId);
            
            // For current user, prefer the fresh profile data
            const displayName = isCurrentUser
                ? (currentUserProfile?.displayName || user?.displayName || member.displayName)
                : member.displayName;
            
            const photoURL = isCurrentUser
                ? (currentUserProfile?.photoURL || user?.photoURL || member.photoURL)
                : member.photoURL;
            
            return {
                oderId: member.userId,
                displayName: displayName || 'Member',
                photoURL,
                hasLocation: !!location,
                location,
                isCurrentUser,
            };
        });
        
        // If current user is not in the members list yet, add them
        if (!currentUserInList && user) {
            const currentUserLocation = allLocations.find(loc => loc.userId === user.id);
            result.unshift({
                oderId: user.id,
                displayName: currentUserProfile?.displayName || user.displayName || user.email?.split('@')[0] || 'You',
                photoURL: currentUserProfile?.photoURL || user.photoURL,
                hasLocation: !!currentUserLocation,
                location: currentUserLocation,
                isCurrentUser: true,
            });
        }
        
        return result;
    }, [currentHub, allLocations, members, user, currentUserProfile]);

    // Default center
    const defaultCenter = useMemo(() => {
        return currentLocation
            ? { lat: currentLocation.latitude, lng: currentLocation.longitude }
            : { lat: 40.7128, lng: -74.0060 };
    }, [currentLocation?.latitude, currentLocation?.longitude]);

    // Helper to get initials from name
    const getInitials = (name: string | undefined) => {
        if (!name) return '?';
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Helper to draw initials on canvas
    const drawInitials = (ctx: CanvasRenderingContext2D, displayName: string | undefined, size: number, bgColor: string) => {
        ctx.fillStyle = bgColor;
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${size / 3}px -apple-system, BlinkMacSystemFont, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(getInitials(displayName), size / 2, size / 2);
    };

    // Helper to load image and cache it
    const loadImage = (url: string): Promise<HTMLImageElement> => {
        if (imageCache.current.has(url)) {
            return Promise.resolve(imageCache.current.get(url)!);
        }

        if (failedImages.current.has(url)) {
            return Promise.reject(new Error('Image previously failed'));
        }

        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            const timeout = setTimeout(() => {
                failedImages.current.add(url);
                reject(new Error('Image load timeout'));
            }, 5000);

            img.onload = () => {
                clearTimeout(timeout);
                imageCache.current.set(url, img);
                resolve(img);
            };
            
            img.onerror = () => {
                clearTimeout(timeout);
                failedImages.current.add(url);
                reject(new Error('Image load failed'));
            };
            
            img.src = url;
        });
    };

    // Preload member photos
    useEffect(() => {
        membersWithStatus.forEach((member) => {
            if (member.photoURL && !imageCache.current.has(member.photoURL) && !failedImages.current.has(member.photoURL)) {
                loadImage(member.photoURL).catch(() => {});
            }
        });
    }, [membersWithStatus]);

    // Create custom marker icon with avatar
    const createMarkerIcon = useCallback((displayName: string | undefined, photoURL: string | undefined, isCurrentUser: boolean): google.maps.Icon | undefined => {
        const size = isCurrentUser ? 44 : 36;
        const borderWidth = isCurrentUser ? 4 : 3;
        const borderColor = isCurrentUser ? '#10B981' : '#8B5CF6';
        const bgColor = isCurrentUser ? '#10B981' : '#8B5CF6';
        
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return undefined;

        // Draw circle border
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2 - borderWidth / 2, 0, 2 * Math.PI);
        ctx.fillStyle = borderColor;
        ctx.fill();

        // Draw inner circle
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2 - borderWidth, 0, 2 * Math.PI);
        ctx.save();
        ctx.clip();

        // Draw photo or initials
        if (photoURL && imageCache.current.has(photoURL) && !failedImages.current.has(photoURL)) {
            try {
                const img = imageCache.current.get(photoURL)!;
                const imgSize = size - borderWidth * 2;
                ctx.drawImage(img, borderWidth, borderWidth, imgSize, imgSize);
            } catch {
                drawInitials(ctx, displayName, size, bgColor);
            }
        } else {
            drawInitials(ctx, displayName, size, bgColor);
        }

        ctx.restore();

        // Add white stroke for visibility
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2 - 1, 0, 2 * Math.PI);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();

        return {
            url: canvas.toDataURL(),
            scaledSize: new google.maps.Size(size, size),
            anchor: new google.maps.Point(size / 2, size / 2),
        };
    }, []);

    // Initialize map
    useEffect(() => {
        if (initAttempted.current || googleMapRef.current) return;
        if (!mapRef.current) return;

        initAttempted.current = true;

        googleMapsLoader
            .load()
            .then((google) => {
                if (!mapRef.current || googleMapRef.current) return;

                googleMapRef.current = new google.maps.Map(mapRef.current, {
                    center: defaultCenter,
                    zoom: 15,
                    disableDefaultUI: true,
                    gestureHandling: 'none',
                    zoomControl: false,
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: false,
                    clickableIcons: false,
                    styles: darkMapStyle,
                });

                setIsMapLoaded(true);
            })
            .catch((err) => {
                console.warn('MiniMapPreview: Failed to load map', err);
                setLoadError(true);
            });
    }, [defaultCenter]);

    // Center map on a specific location
    const centerOnLocation = useCallback((lat: number, lng: number) => {
        if (googleMapRef.current) {
            googleMapRef.current.panTo({ lat, lng });
            googleMapRef.current.setZoom(16);
        }
    }, []);

    // Handle member click - center map on their location
    const handleMemberClick = useCallback((oderId: string) => {
        const memberLocation = allLocations.find(loc => loc.userId === oderId);
        if (memberLocation) {
            setSelectedMemberId(oderId);
            centerOnLocation(memberLocation.latitude, memberLocation.longitude);
        }
    }, [allLocations, centerOnLocation]);

    // Center on current user
    const handleCenterOnMe = useCallback(() => {
        setSelectedMemberId(user?.id || null);
        if (currentLocation) {
            centerOnLocation(currentLocation.latitude, currentLocation.longitude);
        }
    }, [currentLocation, centerOnLocation, user?.id]);

    // Update current user marker with photo
    useEffect(() => {
        if (!googleMapRef.current || !isMapLoaded || !currentLocation) return;

        const position = new google.maps.LatLng(currentLocation.latitude, currentLocation.longitude);
        const photoURL = currentUserProfile?.photoURL || user?.photoURL;
        const displayName = currentUserProfile?.displayName || user?.displayName;

        // Create icon with photo
        const icon = createMarkerIcon(displayName, photoURL, true);

        if (currentUserMarkerRef.current) {
            currentUserMarkerRef.current.setPosition(position);
            if (icon) {
                currentUserMarkerRef.current.setIcon(icon);
            }
            if (accuracyCircleRef.current) {
                accuracyCircleRef.current.setCenter(position);
                accuracyCircleRef.current.setRadius(currentLocation.accuracy || 50);
            }
        } else {
            // Create marker
            currentUserMarkerRef.current = new google.maps.Marker({
                position,
                map: googleMapRef.current,
                icon: icon || {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 10,
                    fillColor: '#10B981',
                    fillOpacity: 1,
                    strokeColor: '#FFFFFF',
                    strokeWeight: 3,
                },
                zIndex: 1000,
            });

            // Accuracy ring
            accuracyCircleRef.current = new google.maps.Circle({
                strokeColor: '#10B981',
                strokeOpacity: 0.3,
                strokeWeight: 1,
                fillColor: '#10B981',
                fillOpacity: 0.1,
                map: googleMapRef.current,
                center: position,
                radius: currentLocation.accuracy || 50,
            });

            // Center on user location initially
            googleMapRef.current.panTo(position);
        }

        // If photo loads later, update the marker
        if (photoURL && !imageCache.current.has(photoURL) && !failedImages.current.has(photoURL)) {
            loadImage(photoURL).then(() => {
                const newIcon = createMarkerIcon(displayName, photoURL, true);
                if (newIcon && currentUserMarkerRef.current?.getMap()) {
                    currentUserMarkerRef.current.setIcon(newIcon);
                }
            }).catch(() => {});
        }
    }, [currentLocation, isMapLoaded, currentUserProfile, user, createMarkerIcon]);

    // Update member markers with photos
    useEffect(() => {
        if (!googleMapRef.current || !isMapLoaded) return;

        const validLocations = locations.filter(
            (loc) => loc && loc.userId && loc.userId !== user?.id && loc.latitude && loc.longitude && loc.isSharing
        );

        const currentMarkers = markersRef.current;
        const currentLocationIds = new Set(validLocations.map((loc) => loc.userId));

        // Remove old markers
        currentMarkers.forEach((marker, oderId) => {
            if (!currentLocationIds.has(oderId)) {
                marker.setMap(null);
                currentMarkers.delete(oderId);
            }
        });

        // Add/update markers
        validLocations.forEach((location) => {
            const member = members.find(m => m.userId === location.userId);
            const position = new google.maps.LatLng(location.latitude, location.longitude);
            const existingMarker = currentMarkers.get(location.userId);

            // Create icon with photo
            const icon = createMarkerIcon(member?.displayName, member?.photoURL, false);

            if (existingMarker) {
                existingMarker.setPosition(position);
                if (icon) {
                    existingMarker.setIcon(icon);
                }
            } else {
                const marker = new google.maps.Marker({
                    position,
                    map: googleMapRef.current!,
                    icon: icon || {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 8,
                        fillColor: '#8B5CF6',
                        fillOpacity: 1,
                        strokeColor: '#FFFFFF',
                        strokeWeight: 2,
                    },
                });
                currentMarkers.set(location.userId, marker);

                // If photo loads later, update the marker
                if (member?.photoURL && !imageCache.current.has(member.photoURL) && !failedImages.current.has(member.photoURL)) {
                    loadImage(member.photoURL).then(() => {
                        const newIcon = createMarkerIcon(member.displayName, member.photoURL, false);
                        if (newIcon && marker.getMap()) {
                            marker.setIcon(newIcon);
                        }
                    }).catch(() => {});
                }
            }
        });
    }, [locations, members, isMapLoaded, user?.id, createMarkerIcon]);

    // Cleanup
    useEffect(() => {
        return () => {
            markersRef.current.forEach((marker) => marker.setMap(null));
            markersRef.current.clear();
            if (currentUserMarkerRef.current) {
                currentUserMarkerRef.current.setMap(null);
            }
            if (accuracyCircleRef.current) {
                accuracyCircleRef.current.setMap(null);
            }
        };
    }, []);

    // Fallback background
    const FallbackBackground = () => (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800">
            <div 
                className="absolute inset-0 opacity-10"
                style={{
                    backgroundImage: 'radial-gradient(circle, #475569 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                }}
            />
        </div>
    );

    const onlineCount = membersWithStatus.filter(m => m.hasLocation).length;
    const totalMembers = membersWithStatus.length;

    return (
        <div className={`relative overflow-hidden ${className}`} style={{ minHeight: '100%' }}>
            {/* Fallback background */}
            <FallbackBackground />
            
            {/* Map container */}
            {!loadError && (
                <div 
                    ref={mapRef} 
                    className="absolute inset-0 z-10"
                    style={{ 
                        width: '100%', 
                        height: '100%',
                        opacity: isMapLoaded ? 1 : 0,
                        transition: 'opacity 0.3s ease-in-out'
                    }} 
                />
            )}
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-900/80 via-transparent to-slate-900/50 z-20" />

            {/* Header */}
            <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between">
                <div className="flex items-center gap-2 bg-slate-900/60 backdrop-blur-sm px-2.5 py-1.5 rounded-full">
                    <div className={`w-2 h-2 rounded-full ${onlineCount > 0 ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                    <span className="text-white text-label-sm font-medium">
                        {totalMembers} {totalMembers === 1 ? 'member' : 'members'}
                        {onlineCount > 0 && (
                            <span className="ml-1 opacity-75">• {onlineCount} online</span>
                        )}
                    </span>
                </div>
                <div className="flex items-center gap-1.5">
                    <button
                        onClick={handleCenterOnMe}
                        className="w-8 h-8 rounded-full bg-slate-900/60 backdrop-blur-sm flex items-center justify-center hover:bg-slate-800/80 transition-colors"
                        title="Center on me"
                    >
                        <MdMyLocation size={16} className="text-emerald-400" />
                    </button>
                    <button
                        onClick={() => navigate('/map')}
                        className="w-8 h-8 rounded-full bg-slate-900/60 backdrop-blur-sm flex items-center justify-center hover:bg-slate-800/80 transition-colors"
                        title="Open full map"
                    >
                        <MdOpenInNew size={14} className="text-white" />
                    </button>
                </div>
            </div>

            {/* Member scroll bar */}
            <div className="absolute bottom-0 left-0 right-0 z-30 p-3 pt-0">
                <div className="flex items-center gap-2 overflow-x-auto py-2 hide-scrollbar">
                    {membersLoading ? (
                        // Loading skeleton
                        <>
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="flex-shrink-0 w-11 h-11 rounded-full bg-slate-700/50 animate-pulse ring-2 ring-white/20"
                                />
                            ))}
                        </>
                    ) : (
                        membersWithStatus.map((member) => (
                            <MemberAvatar
                                key={member.oderId}
                                member={member}
                                isSelected={selectedMemberId === member.oderId}
                                onClick={() => member.hasLocation && handleMemberClick(member.oderId)}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* Loading indicator */}
            {!isMapLoaded && !loadError && (
                <div className="absolute inset-0 flex items-center justify-center z-30">
                    <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            {/* Custom scrollbar hide */}
            <style>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};
