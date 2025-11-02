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
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { MapView } from '../components/MapView';
import { MemberLocationCard } from '../components/MemberLocationCard';
import { GeofenceManager } from '../../geofencing/components/GeofenceManager';
import { GeofenceMapEditor } from '../../geofencing/components/GeofenceMapEditor';
import { GeofenceAlertToast } from '../../geofencing/components/GeofenceAlertToast';
import { NavigationPanel } from '../components/NavigationPanel';
import { HubSelector } from '../components/HubSelector';
import { useUserLocation, useHubLocations, useHubDeviceStatus } from '../hooks/useLocation';
import { useDeviceStatus } from '../hooks/useDeviceStatus';
import { useHubStore } from '@/lib/store/hub-store';
import { useAuth } from '@/features/auth/hooks/useAuth';
import {
    FiNavigation,
    FiMapPin,
    FiCheckCircle,
    FiSettings,
    FiShield,
    FiX,
    FiMenu,
    FiUsers,
} from 'react-icons/fi';
import type { GeofenceZone } from '../../geofencing/types';

const LocationPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { currentHub } = useHubStore();
    const { locations } = useHubLocations(currentHub?.id);
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
                  timestamp: new Date(currentLocation.timestamp),
                  isSharing: true,
                  lastUpdated: Date.now(), // Use timestamp instead of Date object
              },
          ]
        : otherLocations;

    const [showMemberList, setShowMemberList] = useState(true);
    const [hasRequestedPermission, setHasRequestedPermission] = useState(false);
    const [showNavigationPanel, setShowNavigationPanel] = useState(false);
    
    // Geofence management state
    const [showGeofenceManager, setShowGeofenceManager] = useState(false);
    const [showGeofenceEditor, setShowGeofenceEditor] = useState(false);
    const [editingGeofence, setEditingGeofence] = useState<GeofenceZone | null>(null);

    // Auto-request location permission when app loads (Life360 style)
    // This ensures we get location BEFORE showing the map
    useEffect(() => {
        if (!hasRequestedPermission && user && currentHub) {
            console.log('🚀 Starting location tracking...');
            setHasRequestedPermission(true);
            // Request permission and start tracking immediately
            startTracking();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, currentHub, hasRequestedPermission]); // Start when user and hub are ready

    // Debug: Log when currentLocation changes
    useEffect(() => {
        console.log('🗺️ currentLocation changed:', currentLocation);
    }, [currentLocation]);

    return (
        <>
            <Helmet>
                <title>Map - Family Safety App</title>
                <meta name="description" content="Real-time family location map" />
            </Helmet>

            {/* Full screen container */}
            <div className="fixed inset-0 flex flex-col bg-gray-50">
                {/* Top Header Bar */}
                <div className="absolute top-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200">
                    <div className="flex items-center justify-between p-4 safe-top">
                        {/* Left: Menu & Hub Selector */}
                        <div className="flex items-center gap-3">
                            {/* Hamburger Menu Button */}
                            <button
                                onClick={() => setShowNavigationPanel(true)}
                                className="w-10 h-10 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center"
                                aria-label="Open menu"
                            >
                                <FiMenu size={20} className="text-gray-700" />
                            </button>

                            {/* Hub Selector */}
                            <HubSelector />
                        </div>

                        {/* Right: Action Buttons */}
                        <div className="flex items-center gap-2">
                            {/* Settings Button */}
                            <button
                                onClick={() => navigate('/settings')}
                                className="w-10 h-10 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center"
                                aria-label="Settings"
                            >
                                <FiSettings size={20} className="text-gray-700" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Map - Full Screen or Loading State */}
                <div className="flex-1 relative">
                    {!currentLocation ? (
                        // Show loading while getting initial location
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
                            <div className="text-center space-y-6 px-6">
                                <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
                                    <FiMapPin size={40} className="text-white" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        Finding your location...
                                    </h2>
                                    <p className="text-gray-600">
                                        Please allow location access to see your family on the map
                                    </p>
                                </div>
                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg max-w-md mx-auto">
                                        <p className="text-sm">{error}</p>
                                        <button
                                            onClick={startTracking}
                                            className="mt-2 text-sm font-semibold underline hover:no-underline"
                                        >
                                            Try Again
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <MapView height="100%" zoom={13} showControls={false} />
                    )}

                    {/* Floating Action Buttons - Only show when map is loaded */}
                    {currentLocation && (
                        <div className="absolute top-24 right-4 flex flex-col gap-3 z-10">
                            {/* Location Sharing Toggle */}
                            <div className="group relative">
                                <button
                                    onClick={toggleSharing}
                                    className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 ${isSharing
                                        ? 'bg-green-500 hover:bg-green-600 text-white shadow-green-200'
                                        : 'bg-white hover:bg-gray-50 text-gray-700'
                                        }`}
                                    aria-label={isSharing ? 'Stop sharing location' : 'Start sharing location'}
                                >
                                    <FiMapPin size={24} />
                                </button>
                                <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    {isSharing ? 'Sharing Location' : 'Share Location'}
                                    <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
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
                                    className="w-14 h-14 bg-purple-600 hover:bg-purple-700 rounded-full shadow-lg flex items-center justify-center text-white transition-all duration-200 hover:scale-110 active:scale-95 shadow-purple-200"
                                    aria-label="Center map on my current location"
                                >
                                    <FiNavigation size={24} />
                                </button>
                                <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    Center on Me
                                    <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
                                </div>
                            </div>

                            {/* Geofence Management Button */}
                            <div className="group relative">
                                <button
                                    onClick={() => setShowGeofenceManager(true)}
                                    className="w-14 h-14 bg-white hover:bg-gray-50 rounded-full shadow-lg flex items-center justify-center text-gray-700 transition-all duration-200 hover:scale-110 active:scale-95"
                                    aria-label="Open geofence management"
                                >
                                    <FiShield size={24} />
                                </button>
                                <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    Geofences
                                    <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
                                </div>
                            </div>

                            {/* Check-In Button - TODO: Implement check-in functionality */}
                            <div className="group relative">
                                <button
                                    onClick={() => {
                                        // TODO: Implement check-in functionality
                                        // Should create a location check-in event at current location
                                        console.log('Check-in clicked');
                                    }}
                                    className="w-14 h-14 bg-white hover:bg-gray-50 rounded-full shadow-lg flex items-center justify-center text-gray-700 transition-all duration-200 hover:scale-110 active:scale-95 opacity-50 cursor-not-allowed"
                                    aria-label="Check in at current location"
                                    disabled
                                    title="Check-in coming soon"
                                >
                                    <FiCheckCircle size={24} />
                                </button>
                                <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    Check In (Coming Soon)
                                    <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error Toast */}
                    {error && (
                        <div className="absolute top-24 left-4 right-24 bg-red-500 text-white px-4 py-3 rounded-xl shadow-lg animate-slide-down z-10">
                            <p className="font-medium text-sm">{error}</p>
                        </div>
                    )}
                </div>

                {/* Bottom Member List Panel - Only show when map loaded */}
                {currentLocation && (
                    <div
                        className={`absolute left-0 right-0 bg-gradient-to-t from-white via-white to-white/95 backdrop-blur-sm shadow-2xl rounded-t-3xl transition-all duration-300 z-10 bottom-0 ${
                            showMemberList ? 'translate-y-0' : 'translate-y-full'
                        }`}
                    >
                        {/* Drag Handle */}
                        <button
                            onClick={() => setShowMemberList(!showMemberList)}
                            className="w-full py-4 flex justify-center hover:bg-gray-50/50 transition-colors rounded-t-3xl"
                            aria-label={showMemberList ? 'Hide member list' : 'Show member list'}
                        >
                            <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
                        </button>

                        {/* Header */}
                        <div className="px-6 pb-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Family Members
                                </h2>
                                <div className="px-4 py-1.5 bg-purple-100 rounded-full">
                                    <span className="text-sm font-bold text-purple-700">
                                        {allLocations.length} online
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Member Cards - Horizontal Scroll */}
                        <div className="px-6 pb-safe">
                            {allLocations.length > 0 ? (
                                <div className="flex gap-4 overflow-x-auto pb-6 hide-scrollbar">
                                    {allLocations
                                        .filter((location) => location && location.userId) // Filter out invalid entries
                                        .map((location) => {
                                            // Get device status for this user
                                            const isCurrentUser = location.userId === user?.id;
                                            const deviceStatus = isCurrentUser
                                                ? currentUserDeviceStatus
                                                : getDeviceStatus(location.userId);
                                            
                                            return (
                                                <div key={location.userId} className="flex-shrink-0 w-80">
                                                    <MemberLocationCard
                                                        location={location}
                                                        userName={
                                                            isCurrentUser
                                                                ? `${user?.email?.split('@')[0] || 'You'} (You)`
                                                                : `User ${location.userId.slice(0, 8)}`
                                                        }
                                                        batteryLevel={deviceStatus?.batteryLevel ?? undefined}
                                                        isOnline={deviceStatus?.isOnline ?? true}
                                                    />
                                                </div>
                                            );
                                        })}
                                </div>
                            ) : (
                                <div className="text-center py-12 pb-safe">
                                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FiUsers size={36} className="text-gray-400" />
                                    </div>
                                    <p className="text-gray-700 font-semibold text-lg">No members sharing location</p>
                                    <p className="text-sm text-gray-500 mt-2">
                                        Invite family members to start tracking
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Geofence Manager Modal */}
            {showGeofenceManager && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-900">Geofence Management</h2>
                            <button
                                onClick={() => setShowGeofenceManager(false)}
                                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <FiX size={20} />
                            </button>
                        </div>
                <GeofenceManager
                    onCreateGeofence={() => {
                        setEditingGeofence(null);
                        setShowGeofenceEditor(true);
                    }}
                    onEditGeofence={(geofence) => {
                        setEditingGeofence(geofence);
                        setShowGeofenceEditor(true);
                    }}
                    onDeleteGeofence={(geofenceId) => {
                        // TODO: Implement delete
                        console.log('Delete geofence:', geofenceId);
                    }}
                />
                    </div>
                </div>
            )}

            {/* Geofence Map Editor */}
            <GeofenceMapEditor
                isOpen={showGeofenceEditor}
                onClose={() => {
                    setShowGeofenceEditor(false);
                    setEditingGeofence(null);
                }}
                onSave={(data) => {
                    // TODO: Implement save geofence
                    console.log('Save geofence:', data);
                    setShowGeofenceEditor(false);
                    setEditingGeofence(null);
                }}
                geofence={editingGeofence}
                initialLocation={currentLocation ? {
                    latitude: currentLocation.latitude,
                    longitude: currentLocation.longitude,
                } : undefined}
            />

            {/* Geofence Alert Toast */}
            <GeofenceAlertToast />

            {/* Navigation Panel */}
            <NavigationPanel
                isOpen={showNavigationPanel}
                onClose={() => setShowNavigationPanel(false)}
            />

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

