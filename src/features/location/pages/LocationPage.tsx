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
import { Helmet } from 'react-helmet-async';
import { MapView } from '../components/MapView';
import { MemberLocationCard } from '../components/MemberLocationCard';
import { useUserLocation, useHubLocations } from '../hooks/useLocation';
import { useHubStore } from '@/lib/store/hub-store';
import { useAuth } from '@/features/auth/hooks/useAuth';
import {
    FiNavigation,
    FiMapPin,
    FiAlertCircle,
    FiCheckCircle,
    FiSettings,
    FiChevronDown,
    FiUsers,
} from 'react-icons/fi';

const LocationPage = () => {
    const { user } = useAuth();
    const { currentHub } = useHubStore();
    const { locations } = useHubLocations(currentHub?.id);
    const {
        currentLocation,
        isSharing,
        isWatching,
        error,
        startTracking,
        stopTracking,
        toggleSharing,
    } = useUserLocation();

    // Include current user in locations list if they're sharing
    const allLocations = user && currentLocation && isSharing
        ? [
              ...locations,
              {
                  userId: user.id,
                  latitude: currentLocation.latitude,
                  longitude: currentLocation.longitude,
                  accuracy: currentLocation.accuracy,
                  timestamp: currentLocation.timestamp,
                  isSharing: true,
                  lastUpdated: Date.now(), // Use timestamp instead of Date object
              },
          ]
        : locations;

    const [showMemberList, setShowMemberList] = useState(true);
    const [hasRequestedPermission, setHasRequestedPermission] = useState(false);

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
                <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-white via-white/95 to-transparent backdrop-blur-md shadow-sm">
                    <div className="flex items-center justify-between p-4 safe-top">
                        {/* Hub Selector */}
                        <button
                            className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
                            aria-label="Select hub"
                        >
                            <FiUsers size={18} className="text-purple-600" />
                            <span className="font-semibold text-gray-900 text-sm">
                                {currentHub?.name || 'Select Hub'}
                            </span>
                            <FiChevronDown size={16} className="text-gray-500" />
                        </button>

                        {/* Settings Button */}
                        <button
                            className="w-11 h-11 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center"
                            aria-label="Settings"
                        >
                            <FiSettings size={20} className="text-gray-700" />
                        </button>
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
                            <button
                                onClick={toggleSharing}
                                className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 ${isSharing
                                    ? 'bg-green-500 hover:bg-green-600 text-white shadow-green-200'
                                    : 'bg-white hover:bg-gray-50 text-gray-700'
                                    }`}
                                title={isSharing ? 'Sharing Location' : 'Share Location'}
                                aria-label={isSharing ? 'Stop sharing location' : 'Start sharing location'}
                            >
                                <FiMapPin size={24} />
                            </button>

                            {/* Center on My Location */}
                            <button
                                onClick={() => {
                                    // Auto-start tracking if not already started
                                    if (!isWatching) {
                                        startTracking();
                                    }
                                }}
                                className="w-14 h-14 bg-purple-600 hover:bg-purple-700 rounded-full shadow-lg flex items-center justify-center text-white transition-all duration-200 hover:scale-110 active:scale-95 shadow-purple-200"
                                title="Center on My Location"
                                aria-label="Center map on my current location"
                            >
                                <FiNavigation size={24} />
                            </button>

                            {/* Check-In Button */}
                            <button
                                className="w-14 h-14 bg-white hover:bg-gray-50 rounded-full shadow-lg flex items-center justify-center text-gray-700 transition-all duration-200 hover:scale-110 active:scale-95"
                                title="Check In"
                                aria-label="Check in at current location"
                            >
                                <FiCheckCircle size={24} />
                            </button>
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
                        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-white/95 backdrop-blur-sm shadow-2xl rounded-t-3xl transition-all duration-300 z-10 ${showMemberList ? 'translate-y-0' : 'translate-y-full'
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
                                        .map((location) => (
                                            <div key={location.userId} className="flex-shrink-0 w-80">
                                                <MemberLocationCard
                                                    location={location}
                                                    userName={
                                                        location.userId === user?.id
                                                            ? `${user?.email?.split('@')[0] || 'You'} (You)`
                                                            : `User ${location.userId.slice(0, 8)}`
                                                    }
                                                    batteryLevel={85} // TODO: Get from device monitoring
                                                    isOnline={true}
                                                />
                                            </div>
                                        ))}
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
            `}</style>
        </>
    );
};

export default LocationPage;

