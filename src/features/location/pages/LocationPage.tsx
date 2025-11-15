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
import { GeofenceDetailsModal } from '../../geofencing/components/GeofenceDetailsModal';
import { GeofenceAlertToast } from '../../geofencing/components/GeofenceAlertToast';
import { NavigationPanel } from '../components/NavigationPanel';
import { HubSelector } from '../components/HubSelector';
import { useUserLocation, useHubLocations, useHubDeviceStatus } from '../hooks/useLocation';
import { useDeviceStatus } from '../hooks/useDeviceStatus';
import { useCreateCheckIn } from '../hooks/useCheckIn';
import { useGeofences } from '../../geofencing/hooks/useGeofences';
import { useHubStore } from '@/lib/store/hub-store';
import { useAuth, useUserProfile } from '@/features/auth/hooks/useAuth';
import { useHubMembers } from '@/features/tasks/hooks/useHubMembers';
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
import type { GeofenceZone, CreateGeofenceRequest, UpdateGeofenceRequest } from '../../geofencing/types';
import toast from 'react-hot-toast';

const LocationPage = () => {
    const navigate = useNavigate();
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
    const [showGeofenceDetails, setShowGeofenceDetails] = useState(false);
    const [editingGeofence, setEditingGeofence] = useState<GeofenceZone | null>(null);
    const [selectedGeofence, setSelectedGeofence] = useState<GeofenceZone | null>(null);
    const { geofences } = useGeofences();

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
                        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-md rounded-xl shadow-lg px-6 py-4 z-20">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center animate-pulse">
                                    <FiMapPin size={16} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">Finding your location...</p>
                                    <p className="text-xs text-gray-600">Please allow location access</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error message overlay */}
                    {error && (
                        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 bg-red-50 border border-red-200 rounded-xl shadow-lg px-6 py-4 z-20 max-w-md">
                            <p className="text-sm text-red-700 font-semibold mb-2">Location Error</p>
                            <p className="text-xs text-red-600 mb-3">{error}</p>
                            <button
                                onClick={startTracking}
                                className="text-xs font-semibold text-red-700 underline hover:no-underline"
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
                                    className={`w-14 h-14 sm:w-14 sm:h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 touch-target ${isSharing
                                        ? 'bg-green-500 hover:bg-green-600 text-white shadow-green-200'
                                        : 'bg-white hover:bg-gray-50 text-gray-700'
                                        }`}
                                    aria-label={isSharing ? 'Stop sharing location' : 'Start sharing location'}
                                >
                                    <FiMapPin size={24} className="sm:w-6 sm:h-6" />
                                </button>
                                {/* Tooltip - hidden on mobile, shown on hover for desktop */}
                                <div className="hidden sm:block absolute right-full mr-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
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
                                    className="w-14 h-14 sm:w-14 sm:h-14 bg-purple-600 hover:bg-purple-700 rounded-full shadow-lg flex items-center justify-center text-white transition-all duration-200 hover:scale-110 active:scale-95 shadow-purple-200 touch-target"
                                    aria-label="Center map on my current location"
                                >
                                    <FiNavigation size={24} className="sm:w-6 sm:h-6" />
                                </button>
                                {/* Tooltip - hidden on mobile */}
                                <div className="hidden sm:block absolute right-full mr-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    Center on Me
                                    <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
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
                                    className="w-14 h-14 sm:w-14 sm:h-14 bg-white hover:bg-gray-50 active:bg-gray-100 rounded-full shadow-lg flex items-center justify-center text-gray-700 transition-all duration-200 hover:scale-110 active:scale-95 touch-target"
                                    aria-label="Open geofence management"
                                >
                                    <FiShield size={24} className="sm:w-6 sm:h-6" />
                                </button>
                                {/* Tooltip - hidden on mobile */}
                                <div className="hidden sm:block absolute right-full mr-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    Geofences
                                    <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
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
                                    className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 ${
                                        !currentLocation || isCheckingIn
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-blue-500 hover:bg-blue-600 text-white shadow-blue-200'
                                    }`}
                                    aria-label="Check in at current location"
                                    title={!currentLocation ? 'Waiting for location...' : 'Check in at current location'}
                                >
                                    {isCheckingIn ? (
                                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <FiCheckCircle size={24} />
                                    )}
                                </button>
                                <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    {isCheckingIn ? 'Checking in...' : 'Check In'}
                                    <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
                                </div>
                            </div>
                        </div>

                </div>

                {/* Bottom Member List Panel - Always show */}
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

                        {/* Member Cards - Horizontal Scroll - Mobile optimized */}
                        <div className="px-4 sm:px-6 pb-safe">
                            {allLocations.length > 0 ? (
                                <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 sm:pb-6 hide-scrollbar -mx-4 sm:-mx-6 px-4 sm:px-6">
                                    {allLocations
                                        .filter((location) => location && location.userId) // Filter out invalid entries
                                        .map((location) => {
                                            // Get device status for this user
                                            const isCurrentUser = location.userId === user?.id;
                                            const deviceStatus = isCurrentUser
                                                ? currentUserDeviceStatus
                                                : getDeviceStatus(location.userId);
                                            
                                            // Get member info and photo
                                            const member = members.find(m => m.userId === location.userId);
                                            const userPhoto = isCurrentUser 
                                                ? (currentUserProfile?.photoURL || user?.photoURL)
                                                : member?.photoURL;
                                            const userName = isCurrentUser
                                                ? (currentUserProfile?.displayName || user?.displayName || `${user?.email?.split('@')[0] || 'You'} (You)`)
                                                : (member?.displayName || `User ${location.userId.slice(0, 8)}`);
                                            
                                            return (
                                                <div key={location.userId} className="flex-shrink-0 w-[280px] sm:w-80">
                                                    <MemberLocationCard
                                                        location={location}
                                                        userName={userName}
                                                        userPhoto={userPhoto}
                                                        batteryLevel={deviceStatus?.batteryLevel ?? undefined}
                                                        isOnline={deviceStatus?.isOnline ?? true}
                                                    />
                                                </div>
                                            );
                                        })}
                                </div>
                            ) : (
                                <div className="text-center py-8 sm:py-12 pb-safe">
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

