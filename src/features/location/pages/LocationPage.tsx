/**
 * LocationPage (Life360 Style)
 * 
 * Map-first interface with overlays
 * - Full-screen map
 * - Member cards overlaid on bottom
 * - Floating action buttons
 * - Hub selector in top bar
 * - Quick access to all features
 */

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { MapView } from '../components/MapView';
import { MemberLocationCard } from '../components/MemberLocationCard';
import { GeofenceManager } from '../../geofencing/components/GeofenceManager';
import { GeofenceMapEditor } from '../../geofencing/components/GeofenceMapEditor';
import { GeofenceDetailsModal } from '../../geofencing/components/GeofenceDetailsModal';
import { GeofenceAlertToast } from '../../geofencing/components/GeofenceAlertToast';
import { useUIStore } from '@/lib/store/ui-store';
import { createEmergencyAlert } from '@/features/safety/api/emergency-api';
import { useUserLocation, useHubLocations, useHubDeviceStatus } from '../hooks/useLocation';
import { useDeviceStatus } from '../hooks/useDeviceStatus';
import { useCreateCheckIn } from '../hooks/useCheckIn';
import { useGeofences } from '../../geofencing/hooks/useGeofences';
import { useHubStore } from '@/lib/store/hub-store';
import { useAuth, useUserProfile } from '@/features/auth/hooks/useAuth';
import { useHubMembers } from '@/features/tasks/hooks/useHubMembers';
import { geocodingService } from '@/lib/services/geocoding-service';
import {
    MdNavigation,
    MdLocationOn,
    MdCheckCircle,
    MdSecurity,
    MdClose,
    MdPeople,
    MdWarning,
    MdAccessTime,
    MdBatteryFull,
} from 'react-icons/md';
import type { GeofenceZone, CreateGeofenceRequest, UpdateGeofenceRequest } from '../../geofencing/types';
import toast from 'react-hot-toast';

const LocationPage = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const focusedMemberId = searchParams.get('focus');
    
    const { user } = useAuth();
    const { currentHub } = useHubStore();
    const { locations } = useHubLocations(currentHub?.id);
    const { data: members = [] } = useHubMembers();
    const { data: currentUserProfile } = useUserProfile(user?.id);
    const {
        currentLocation,
        isSharing,
        isWatching,
        error,
        startTracking,
        toggleSharing,
    } = useUserLocation();
    
    // Device status monitoring
    const { deviceStatus: currentUserDeviceStatus } = useDeviceStatus();
    const { getDeviceStatus } = useHubDeviceStatus(currentHub?.id);

    // Check-in functionality
    const { createCheckIn, isCheckingIn } = useCreateCheckIn();

    // Geofence management
    const { createGeofence, updateGeofence, deleteGeofence } = useGeofences();

    // Include current user in locations list if they're sharing
    // Filter out current user from Firestore locations to avoid duplicates
    const otherLocations = locations.filter(loc => loc.userId !== user?.id);
    const allLocations = user && currentLocation && isSharing
        ? [
              ...otherLocations,
              {
                  userId: user.id,
                  hubId: currentHub?.id || '',
                  latitude: currentLocation.latitude,
                  longitude: currentLocation.longitude,
                  accuracy: currentLocation.accuracy,
                  timestamp: (() => {
                      // Ensure we have a valid timestamp
                      if (typeof currentLocation.timestamp === 'number' && currentLocation.timestamp > 0) {
                          // If it's in seconds, convert to milliseconds
                          const ts = currentLocation.timestamp < 10000000000 
                              ? currentLocation.timestamp * 1000 
                              : currentLocation.timestamp;
                          return new Date(ts);
                      }
                      // Default to current time if timestamp is invalid
                      return new Date();
                  })(),
                  isSharing: true,
                  lastUpdated: Date.now(),
              },
          ]
        : otherLocations;

    const [showMemberList, setShowMemberList] = useState(true);
    const [hasRequestedPermission, setHasRequestedPermission] = useState(false);
    
    // Address cache for locations without addresses
    const [addressCache, setAddressCache] = useState<Map<string, string>>(new Map());
    
    // Geofence management state
    const [showGeofenceManager, setShowGeofenceManager] = useState(false);
    const [showGeofenceEditor, setShowGeofenceEditor] = useState(false);
    const [showGeofenceDetails, setShowGeofenceDetails] = useState(false);
    const [editingGeofence, setEditingGeofence] = useState<GeofenceZone | null>(null);
    const [selectedGeofence, setSelectedGeofence] = useState<GeofenceZone | null>(null);
    const { geofences } = useGeofences();

    // Fetch missing addresses
    useEffect(() => {
        const fetchMissingAddresses = async () => {
            const locationsNeedingAddress = allLocations.filter(
                (loc) => loc && !('address' in loc && loc.address) && !addressCache.has(`${loc.latitude},${loc.longitude}`)
            );

            if (locationsNeedingAddress.length === 0) return;

            // Fetch addresses for locations without them
            const addressPromises = locationsNeedingAddress.map(async (location) => {
                try {
                    const addressResult = await geocodingService.reverseGeocode(
                        location.latitude,
                        location.longitude
                    );
                    if (addressResult) {
                        const cacheKey = `${location.latitude},${location.longitude}`;
                        setAddressCache((prev) => {
                            const newCache = new Map(prev);
                            newCache.set(cacheKey, addressResult.formatted);
                            return newCache;
                        });
                    }
                } catch (error) {
                    console.warn('Failed to fetch address for location:', error);
                }
            });

            await Promise.all(addressPromises);
        };

        fetchMissingAddresses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allLocations]);

    // Debug: Log state changes
    useEffect(() => {
        console.log('[Geofence] State changed:', {
            showGeofenceManager,
            showGeofenceEditor,
            showGeofenceDetails,
            editingGeofence: editingGeofence?.id,
            selectedGeofence: selectedGeofence?.id,
            currentLocation: currentLocation ? { lat: currentLocation.latitude, lng: currentLocation.longitude } : null,
            currentHub: currentHub?.id,
        });
    }, [showGeofenceManager, showGeofenceEditor, showGeofenceDetails, editingGeofence, selectedGeofence, currentLocation, currentHub]);

    // Auto-request location permission when app loads (Life360 style)
    // This ensures we get location BEFORE showing the map
    useEffect(() => {
        if (!hasRequestedPermission && user && currentHub && !isWatching) {
            setHasRequestedPermission(true);
            // Request permission and start tracking immediately
            startTracking();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id, currentHub?.id]); // Only depend on IDs to prevent re-runs

    // Handle focus on specific member from dashboard
    useEffect(() => {
        if (focusedMemberId && allLocations.length > 0) {
            const focusedLocation = allLocations.find(loc => loc.userId === focusedMemberId);
            if (focusedLocation) {
                const member = members.find(m => m.userId === focusedMemberId);
                const isCurrentUser = focusedMemberId === user?.id;
                const name = isCurrentUser ? 'your location' : (member?.displayName?.split(' ')[0] || 'member');
                toast.success(`Viewing ${name}`, { icon: '📍', duration: 2000 });
                
                // Expand member list to show the focused member
                setShowMemberList(true);
            }
            // Clear the focus parameter from URL after handling
            setSearchParams({}, { replace: true });
        }
    }, [focusedMemberId, allLocations, members, user?.id, setSearchParams]);

    return (
        <>
            <Helmet>
                <title>Map - Family Safety App</title>
                <meta name="description" content="Real-time family location map" />
            </Helmet>

            {/* Full screen container - TopBar is handled by AppLayout */}
            <div className="fixed inset-0 flex flex-col bg-background pt-14 sm:pt-16 md:pt-20 safe-top">
                {/* Map - Always render, even without location */}
                <div className="flex-1 relative">
                    {/* Always render map - it will show default location if user location not available */}
                    <MapView 
                        height="100%" 
                        zoom={13} 
                        showControls={false}
                        onGeofenceClick={(geofenceId) => {
                            const geofence = geofences.find(g => g.id === geofenceId);
                            if (geofence) {
                                setSelectedGeofence(geofence);
                                setShowGeofenceDetails(true);
                            }
                        }}
                    />

                    {/* Location loading overlay - only show if no location and no error */}
                    {!currentLocation && !error && (
                        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 bg-surface/95 backdrop-blur-md rounded-card shadow-halo-map-card px-6 py-4 z-20">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center animate-pulse">
                                    <MdLocationOn size={16} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-body-sm font-semibold text-on-surface">Finding your location...</p>
                                    <p className="text-body-xs text-on-variant">Please allow location access</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error message overlay */}
                    {error && (
                        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 bg-error-container border border-error rounded-card shadow-halo-map-card px-6 py-4 z-20 max-w-md">
                            <p className="text-body-sm text-on-error-container font-semibold mb-2">Location Error</p>
                            <p className="text-body-xs text-on-error-container mb-3">{error}</p>
                            <button
                                onClick={startTracking}
                                className="text-body-xs font-semibold text-error underline hover:no-underline transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {/* Floating Action Buttons - Mobile optimized */}
                    <div className="absolute top-20 sm:top-24 right-3 sm:right-4 flex flex-col gap-2.5 sm:gap-3 z-10 safe-right">
                            {/* Location Sharing Toggle */}
                            <div className="group relative">
                                <button
                                    onClick={toggleSharing}
                                    className={`w-14 h-14 sm:w-14 sm:h-14 rounded-full shadow-halo-button flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 touch-target ${isSharing
                                        ? 'bg-primary hover:bg-primary/90 text-white'
                                        : 'bg-surface hover:bg-surface-variant text-on-surface'
                                        }`}
                                    aria-label={isSharing ? 'Stop sharing location' : 'Start sharing location'}
                                >
                                    <MdLocationOn size={24} className="sm:w-6 sm:h-6" />
                                </button>
                                {/* Tooltip - visible on mobile and desktop */}
                                <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-primary text-white text-label-sm font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 sm:group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                    {isSharing ? 'Sharing Location' : 'Share Location'}
                                    <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-primary"></div>
                                </div>
                            </div>

                            {/* Center on My Location */}
                            <div className="group relative">
                                <button
                                    onClick={() => {
                                        if (!isWatching) {
                                            startTracking();
                                        }
                                    }}
                                    className="w-14 h-14 sm:w-14 sm:h-14 bg-primary hover:bg-primary/90 rounded-full shadow-halo-button flex items-center justify-center text-white transition-all duration-200 hover:scale-110 active:scale-95 touch-target"
                                    aria-label="Center map on my current location"
                                >
                                    <MdNavigation size={24} className="sm:w-6 sm:h-6" />
                                </button>
                                {/* Tooltip - visible on mobile and desktop */}
                                <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-primary text-white text-label-sm font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 sm:group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                    Center on Me
                                    <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-primary"></div>
                                </div>
                            </div>

                            {/* Geofence Management Button - Mobile optimized */}
                            <div className="group relative">
                                <button
                                    onClick={() => {
                                        console.log('[Geofence] Button clicked - Opening geofence manager');
                                        console.log('[Geofence] Current state:', { showGeofenceManager, showGeofenceEditor, editingGeofence: editingGeofence?.id });
                                        setShowGeofenceManager(true);
                                        console.log('[Geofence] State updated - showGeofenceManager set to true');
                                    }}
                                    className="w-14 h-14 sm:w-14 sm:h-14 bg-primary hover:bg-primary/90 rounded-full shadow-halo-button flex items-center justify-center text-white transition-all duration-200 hover:scale-110 active:scale-95 touch-target"
                                    aria-label="Open geofence management"
                                >
                                    <MdSecurity size={24} className="sm:w-6 sm:h-6" />
                                </button>
                                {/* Tooltip - visible on mobile and desktop */}
                                <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-primary text-white text-label-sm font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 sm:group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                    Geofences
                                    <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-primary"></div>
                                </div>
                            </div>

                            {/* Check-In Button */}
                            <div className="group relative">
                                <button
                                    onClick={() => {
                                        if (!currentLocation || !user || !currentHub) {
                                            toast.error('Location not available');
                                            return;
                                        }

                                        // Create check-in with coordinates
                                        // Address will be automatically fetched via reverse geocoding in the hook
                                        createCheckIn({
                                            coordinates: {
                                                latitude: currentLocation.latitude,
                                                longitude: currentLocation.longitude,
                                                accuracy: currentLocation.accuracy,
                                                timestamp: currentLocation.timestamp,
                                                speed: null,
                                                heading: null,
                                                altitude: null,
                                                altitudeAccuracy: null,
                                            },
                                            note: `Checked in at ${new Date().toLocaleTimeString()}`,
                                        });
                                    }}
                                    disabled={!currentLocation || isCheckingIn}
                                    className={`w-14 h-14 rounded-full shadow-halo-button flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 touch-target ${
                                        !currentLocation || isCheckingIn
                                            ? 'bg-surface-variant text-on-variant cursor-not-allowed'
                                            : 'bg-primary hover:bg-primary/90 text-white'
                                    }`}
                                    aria-label="Check in at current location"
                                    title={!currentLocation ? 'Waiting for location...' : 'Check in at current location'}
                                >
                                    {isCheckingIn ? (
                                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <MdCheckCircle size={24} />
                                    )}
                                </button>
                                {/* Tooltip - visible on mobile and desktop */}
                                <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-primary text-white text-label-sm font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 sm:group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                    {isCheckingIn ? 'Checking in...' : 'Check In'}
                                    <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-primary"></div>
                                </div>
                            </div>

                            {/* SOS Emergency Button */}
                            {currentLocation && currentHub && user && (
                                <div className="group relative">
                                    <button
                                        onClick={async () => {
                                            if (!currentLocation) {
                                                toast.error('Location not available. Please enable location sharing.');
                                                return;
                                            }

                                            if (
                                                confirm(
                                                    'Send emergency SOS alert to your family?\n\nThis will notify all members of your hub with your current location.'
                                                )
                                            ) {
                                                try {
                                                    const response = await createEmergencyAlert({
                                                        hubId: currentHub.id,
                                                        userId: user.id,
                                                        location: {
                                                            latitude: currentLocation.latitude,
                                                            longitude: currentLocation.longitude,
                                                            address: undefined,
                                                        },
                                                        type: 'sos',
                                                    });

                                                    if (response.success) {
                                                        toast.success('Emergency alert sent to your family!', {
                                                            duration: 5000,
                                                            icon: '🚨',
                                                        });
                                                    } else {
                                                        toast.error(`Failed to send emergency alert: ${response.error}`);
                                                    }
                                                } catch (error: any) {
                                                    console.error('Emergency alert error:', error);
                                                    toast.error(`Failed to send emergency alert: ${error.message}`);
                                                }
                                            }
                                        }}
                                        className="w-14 h-14 rounded-full shadow-halo-button flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 touch-target bg-error hover:bg-error/90 text-white"
                                        aria-label="Emergency SOS - Send alert to family"
                                    >
                                        <MdWarning size={24} className="sm:w-6 sm:h-6" />
                                    </button>
                                    {/* Tooltip - visible on mobile and desktop */}
                                    <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-error text-white text-label-sm font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 sm:group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                        Emergency SOS
                                        <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-error"></div>
                                    </div>
                                </div>
                            )}
                        </div>

                </div>

                {/* Bottom Member List Panel - Life360 Style */}
                <div
                    className={`absolute left-0 right-0 bg-surface rounded-t-card shadow-halo-map-card transition-all duration-300 z-10 bottom-0 ${
                        showMemberList ? 'translate-y-0' : 'translate-y-[calc(100%-80px)]'
                    }`}
                    style={{ 
                        maxHeight: showMemberList ? '80vh' : '80px',
                        minHeight: showMemberList ? 'auto' : '80px',
                        height: showMemberList ? 'auto' : '80px',
                        backgroundColor: '#FFFFFF', // Ensure solid white background
                    }}
                >
                    {/* Drag Handle - Always visible */}
                    <div className="w-full h-full flex flex-col">
                        <button
                            onClick={() => setShowMemberList(!showMemberList)}
                            className="w-full flex-1 py-3 flex flex-col items-center justify-center hover:bg-surface-variant/50 transition-colors touch-target rounded-t-card"
                            aria-label={showMemberList ? 'Collapse member list' : 'Expand member list'}
                            style={{ minHeight: '80px' }}
                        >
                            <div className="w-12 h-1.5 bg-outline-variant rounded-full mb-2"></div>
                            {!showMemberList && (
                                <div className="flex items-center gap-2 px-4 pb-safe">
                                    <MdPeople size={16} className="text-on-variant" />
                                    <span className="text-label-md text-on-variant">
                                        {allLocations.length} {allLocations.length === 1 ? 'member' : 'members'}
                                    </span>
                                </div>
                            )}
                        </button>
                    </div>

                    {/* Header - Only visible when expanded */}
                    {showMemberList && (
                        <div className="px-4 sm:px-6 py-3 border-b border-outline-variant">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <h2 className="text-headline-sm font-semibold text-on-surface">
                                        {currentHub?.name || 'Family Members'}
                                </h2>
                                    <p className="text-body-sm text-on-variant mt-0.5">
                                        {members.length} {members.length === 1 ? 'member' : 'members'}
                                        {allLocations.length > 0 && (
                                            <span className="ml-1">
                                                • {allLocations.length} {allLocations.length === 1 ? 'sharing' : 'sharing'} location
                                            </span>
                                        )}
                                    </p>
                                </div>
                                <button
                                    onClick={() => navigate('/settings')}
                                    className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-full font-semibold text-label-md shadow-halo-button transition-all duration-200 hover:scale-105 active:scale-95 touch-target flex items-center gap-2"
                                >
                                    <MdPeople size={18} />
                                    <span>Invite</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Member List - Vertical scrollable (Life360 style) */}
                    {showMemberList && (
                        <div className="overflow-y-auto pb-safe" style={{ maxHeight: 'calc(80vh - 120px)' }}>
                            {members.length > 0 ? (
                                <div className="divide-y divide-outline-variant">
                                    {members.map((member) => {
                                        // Find location for this member
                                        const location = allLocations.find(loc => loc.userId === member.userId);
                                        const hasLocation = !!location;
                                            // Get device status for this user
                                            const isCurrentUser = member.userId === user?.id;
                                            const deviceStatus = isCurrentUser
                                                ? currentUserDeviceStatus
                                                : getDeviceStatus(member.userId);
                                            
                                            // Get member info and photo
                                            const userPhoto = isCurrentUser 
                                                ? (currentUserProfile?.photoURL || user?.photoURL)
                                                : member?.photoURL;
                                            const userName = isCurrentUser
                                                ? (currentUserProfile?.displayName || user?.displayName || `${user?.email?.split('@')[0] || 'You'} (You)`)
                                                : (member?.displayName || `User ${member.userId.slice(0, 8)}`);
                                            
                                            // Format timestamp
                                            const formatTime = (date: Date | number | any) => {
                                                if (!date) return 'Just now';
                                                
                                                const now = new Date();
                                                let timestamp: number;
                                                
                                                try {
                                                    // Handle Firestore Timestamp
                                                    if (date && typeof date.toMillis === 'function') {
                                                        timestamp = date.toMillis();
                                                    }
                                                    // Handle Date object
                                                    else if (date && typeof date.getTime === 'function') {
                                                        timestamp = date.getTime();
                                                    }
                                                    // Handle number (milliseconds)
                                                    else if (typeof date === 'number') {
                                                        // Reject negative numbers immediately
                                                        if (date < 0) {
                                                            return 'Just now';
                                                        }
                                                        // Check if it's seconds (Unix timestamp) or milliseconds
                                                        timestamp = date < 10000000000 ? date * 1000 : date;
                                                    }
                                                    // Handle string
                                                    else if (typeof date === 'string') {
                                                        const parsed = new Date(date).getTime();
                                                        if (isNaN(parsed) || parsed < 0) {
                                                            return 'Just now';
                                                        }
                                                        timestamp = parsed;
                                                    }
                                                    else {
                                                        return 'Just now';
                                                    }
                                                    
                                                    // Validate timestamp is reasonable (not negative, not before 2000, not future beyond 2100)
                                                    if (timestamp < 0 || timestamp < 946684800000 || timestamp > 4102444800000) {
                                                        // Don't log warnings for obviously invalid data, just return a safe default
                                                        return 'Just now';
                                                    }
                                                    
                                                    const diff = Math.floor((now.getTime() - timestamp) / 1000);
                                                    
                                                    // Handle negative diff (future dates) or very large diffs
                                                    if (diff < 0 || diff > 31536000000) { // More than 1 year
                                                        return 'Just now';
                                                    }
                                                    
                                                    if (diff < 60) return 'Just now';
                                                    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
                                                    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
                                                    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
                                                    
                                                    // For older dates, show formatted date
                                                    return new Date(timestamp).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: 'numeric',
                                                        minute: 'numeric'
                                                    });
                                                } catch (error) {
                                                    // If anything goes wrong, return a safe default
                                                    return 'Just now';
                                                }
                                            };

                                            const getBatteryColor = (level?: number | null) => {
                                                if (level === null || level === undefined) return 'text-on-variant';
                                                if (level < 20) return 'text-error';
                                                if (level < 50) return 'text-secondary';
                                                return 'text-primary';
                                            };
                                            
                                            return (
                                                <div
                                                    key={member.userId}
                                                    className="px-4 sm:px-6 py-4 hover:bg-surface-variant/50 transition-colors cursor-pointer active:bg-surface-variant"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {/* Avatar with status */}
                                                        <div className="relative flex-shrink-0">
                                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white font-semibold text-title-md overflow-hidden">
                                                                {userPhoto ? (
                                                                    <img src={userPhoto} alt={userName} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    userName.charAt(0).toUpperCase()
                                                                )}
                                                            </div>
                                                            {/* Online status indicator - show if has location or is online */}
                                                            {(hasLocation && deviceStatus?.isOnline) && (
                                                                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-primary rounded-full border-2 border-surface"></div>
                                                            )}
                                                            {/* Offline indicator if member exists but no location */}
                                                            {!hasLocation && (
                                                                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-on-variant/40 rounded-full border-2 border-surface"></div>
                                                            )}
                                                        </div>

                                                        {/* Member Info */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h3 className="text-title-md font-semibold text-on-surface truncate">
                                                                    {userName}
                                                                </h3>
                                                                {isCurrentUser && (
                                                                    <span className="px-2 py-0.5 bg-primary-container text-primary text-label-sm font-medium rounded-full">
                                                                        You
                                                                    </span>
                                                                )}
                                                                {member.role === 'admin' && (
                                                                    <span className="px-2 py-0.5 bg-secondary-container text-secondary text-label-sm font-medium rounded-full">
                                                                        Admin
                                                                    </span>
                                                                )}
                                                            </div>
                                                            
                                                            {/* Location Address or Status */}
                                                            {hasLocation && location ? (
                                                                <>
                                                                    <div className="flex items-center gap-1.5 mb-1.5">
                                                                        <MdLocationOn size={14} className="text-on-variant flex-shrink-0" />
                                                                        <p className="text-body-sm text-on-variant truncate">
                                                                            {('address' in location && location.address) || 
                                                                             addressCache.get(`${location.latitude},${location.longitude}`) || 
                                                                             'Fetching address...'}
                                                                        </p>
                                                                    </div>

                                                                    {/* Time & Battery Row */}
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="flex items-center gap-1 text-body-sm text-on-variant">
                                                                            <MdAccessTime size={12} />
                                                                            <span>{formatTime(location.timestamp)}</span>
                                                                        </div>
                                                                        <div className={`flex items-center gap-1 text-body-sm ${getBatteryColor(deviceStatus?.batteryLevel)}`}>
                                                                            <MdBatteryFull size={12} />
                                                                            <span>
                                                                                {deviceStatus?.batteryLevel !== null && deviceStatus?.batteryLevel !== undefined
                                                                                    ? `${deviceStatus.batteryLevel}%` 
                                                                                    : 'N/A'}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <p className="text-body-sm text-on-variant">
                                                                    Location not shared
                                                                </p>
                                                            )}
                                                        </div>

                                                        {/* Quick Actions */}
                                                        {hasLocation && (
                                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        // TODO: Center map on member when MapView exposes map instance
                                                                        toast.success(`Viewing ${userName} on map`);
                                                                    }}
                                                                    className="p-2 text-primary hover:bg-primary-container rounded-full transition-colors touch-target"
                                                                    aria-label={`View ${userName} on map`}
                                                                >
                                                                    <MdNavigation size={20} />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-12 sm:py-16 px-4">
                                    <div className="w-20 h-20 bg-gradient-to-br from-primary-container to-primary-container/50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-elevation-2">
                                        <MdPeople size={36} className="text-primary" />
                                    </div>
                                    <h3 className="text-title-lg font-semibold text-on-surface mb-2">
                                        No members sharing location
                                    </h3>
                                    <p className="text-body-md text-on-variant max-w-md mx-auto mb-6">
                                        Invite family members to start tracking their location and stay connected.
                                    </p>
                                    <button
                                        onClick={() => navigate('/settings')}
                                        className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-full font-semibold text-label-lg shadow-halo-button transition-all duration-200 hover:scale-105 active:scale-95 touch-target"
                                    >
                                        Invite Family Members
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                    </div>
            </div>

            {/* Geofence Manager Modal */}
            {showGeofenceManager && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-surface rounded-card shadow-halo-map-card w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-outline-variant">
                            <h2 className="text-headline-md font-semibold text-on-surface">Geofence Management</h2>
                            <button
                                onClick={() => setShowGeofenceManager(false)}
                                className="p-2 text-on-variant hover:text-on-surface hover:bg-surface-variant rounded-lg transition-colors touch-target"
                                aria-label="Close"
                            >
                                <MdClose size={20} />
                            </button>
                        </div>
                <GeofenceManager
                    onCreateGeofence={() => {
                        console.log('[Geofence] onCreateGeofence called - Creating new geofence');
                        console.log('[Geofence] Current state before update:', { 
                            showGeofenceEditor, 
                            editingGeofence: editingGeofence?.id,
                            currentLocation,
                            currentHub: currentHub?.id 
                        });
                        setEditingGeofence(null);
                        setShowGeofenceEditor(true);
                        console.log('[Geofence] State updated - showGeofenceEditor set to true, editingGeofence set to null');
                    }}
                    onEditGeofence={(geofence) => {
                        console.log('[Geofence] onEditGeofence called - Editing geofence:', geofence.id);
                        console.log('[Geofence] Geofence data:', geofence);
                        setEditingGeofence(geofence);
                        setShowGeofenceEditor(true);
                        console.log('[Geofence] State updated - showGeofenceEditor set to true, editingGeofence set');
                    }}
                    onDeleteGeofence={(geofenceId) => {
                        console.log('[Geofence] onDeleteGeofence called - Deleting geofence:', geofenceId);
                        deleteGeofence(geofenceId);
                    }}
                />
                    </div>
                </div>
            )}

            {/* Geofence Map Editor */}
            <GeofenceMapEditor
                isOpen={showGeofenceEditor}
                onClose={() => {
                    console.log('[Geofence] Editor onClose called');
                    setShowGeofenceEditor(false);
                    setEditingGeofence(null);
                    console.log('[Geofence] Editor closed - state reset');
                }}
                onSave={async (data) => {
                    console.log('[Geofence] Editor onSave called');
                    console.log('[Geofence] Save data:', data);
                    console.log('[Geofence] Editing geofence:', editingGeofence?.id);
                    try {
                        if (editingGeofence) {
                            console.log('[Geofence] Updating existing geofence');
                            // Update existing geofence
                            const updateData: UpdateGeofenceRequest = {
                                id: editingGeofence.id,
                                name: data.name,
                                description: data.description,
                                type: data.type,
                                center: data.center,
                                radius: data.radius,
                                alertOnEntry: data.alertOnEntry,
                                alertOnExit: data.alertOnExit,
                                alertRecipients: data.alertRecipients,
                            };
                            console.log('[Geofence] Update data:', updateData);
                            await updateGeofence(updateData);
                            console.log('[Geofence] Geofence updated successfully');
                        } else {
                            console.log('[Geofence] Creating new geofence');
                            // Create new geofence
                            const createData: CreateGeofenceRequest = {
                                name: data.name,
                                description: data.description,
                                type: data.type,
                                center: data.center,
                                radius: data.radius,
                                alertOnEntry: data.alertOnEntry,
                                alertOnExit: data.alertOnExit,
                                alertRecipients: data.alertRecipients,
                            };
                            console.log('[Geofence] Create data:', createData);
                            await createGeofence(createData);
                            console.log('[Geofence] Geofence created successfully');
                        }
                        setShowGeofenceEditor(false);
                        setEditingGeofence(null);
                        console.log('[Geofence] Editor closed after save');
                    } catch (error) {
                        console.error('[Geofence] Error saving geofence:', error);
                        toast.error('Failed to save geofence');
                    }
                }}
                geofence={editingGeofence ? {
                    name: editingGeofence.name,
                    description: editingGeofence.description,
                    type: editingGeofence.type,
                    center: editingGeofence.center,
                    radius: editingGeofence.radius,
                    alertOnEntry: editingGeofence.alertOnEntry,
                    alertOnExit: editingGeofence.alertOnExit,
                } : null}
                initialLocation={currentLocation ? {
                    latitude: currentLocation.latitude,
                    longitude: currentLocation.longitude,
                } : undefined}
            />

            {/* Geofence Details Modal */}
            <GeofenceDetailsModal
                geofence={selectedGeofence}
                isOpen={showGeofenceDetails}
                onClose={() => {
                    setShowGeofenceDetails(false);
                    setSelectedGeofence(null);
                }}
                onEdit={(geofence) => {
                    setEditingGeofence(geofence);
                    setShowGeofenceDetails(false);
                    setShowGeofenceEditor(true);
                }}
                onDelete={(geofenceId) => {
                    deleteGeofence(geofenceId);
                    setShowGeofenceDetails(false);
                    setSelectedGeofence(null);
                }}
            />

            {/* Geofence Alert Toast */}
            <GeofenceAlertToast />


            {/* Custom Styles */}
            <style>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .pb-safe {
                    padding-bottom: max(env(safe-area-inset-bottom), 1.5rem);
                }
                .safe-top {
                    padding-top: max(env(safe-area-inset-top), 1rem);
                }
                @keyframes slide-down {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-slide-down {
                    animation: slide-down 0.3s ease-out;
                }
                @keyframes slide-in-right {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .animate-slide-in-right {
                    animation: slide-in-right 0.3s ease-out;
                }
            `}</style>
        </>
    );
};

export default LocationPage;

