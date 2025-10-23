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

import { useState } from 'react';
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
        isSharing,
        isWatching,
        error,
        startTracking,
        stopTracking,
        toggleSharing,
    } = useUserLocation();

    const [showMemberList, setShowMemberList] = useState(true);

    // Auto-start tracking on mount
    useState(() => {
        if (!isWatching && isSharing) {
            startTracking();
        }
    });

    return (
        <>
            <Helmet>
                <title>Map - Family Safety App</title>
                <meta name="description" content="Real-time family location map" />
            </Helmet>

            {/* Full screen container */}
            <div className="fixed inset-0 flex flex-col bg-gray-100">
                {/* Top Header Bar */}
                <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-white/95 via-white/80 to-transparent backdrop-blur-sm">
                    <div className="flex items-center justify-between p-4">
                        {/* Hub Selector */}
                        <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow">
                            <FiUsers size={18} className="text-purple-600" />
                            <span className="font-semibold text-gray-900">
                                {currentHub?.name || 'Select Hub'}
                            </span>
                            <FiChevronDown size={16} className="text-gray-500" />
                        </button>

                        {/* Settings Button */}
                        <button className="w-10 h-10 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center">
                            <FiSettings size={20} className="text-gray-700" />
                        </button>
                    </div>
                </div>

                {/* Map - Full Screen */}
                <div className="flex-1 relative">
                    <MapView height="100%" zoom={13} showControls={false} />

                    {/* Floating Action Buttons */}
                    <div className="absolute top-20 right-4 flex flex-col gap-3">
                        {/* Location Sharing Toggle */}
                        <button
                            onClick={toggleSharing}
                            className={`w-12 h-12 rounded-full shadow-xl flex items-center justify-center transition-all transform hover:scale-110 ${isSharing
                                    ? 'bg-green-500 text-white'
                                    : 'bg-white text-gray-700'
                                }`}
                            title={isSharing ? 'Sharing Location' : 'Share Location'}
                        >
                            <FiMapPin size={22} />
                        </button>

                        {/* Start/Stop Tracking */}
                        {!isWatching ? (
                            <button
                                onClick={startTracking}
                                className="w-12 h-12 bg-purple-600 rounded-full shadow-xl flex items-center justify-center text-white hover:bg-purple-700 transition-all transform hover:scale-110"
                                title="Start Tracking"
                            >
                                <FiNavigation size={22} />
                            </button>
                        ) : (
                            <button
                                onClick={stopTracking}
                                className="w-12 h-12 bg-red-500 rounded-full shadow-xl flex items-center justify-center text-white hover:bg-red-600 transition-all transform hover:scale-110"
                                title="Stop Tracking"
                            >
                                <FiAlertCircle size={22} />
                            </button>
                        )}

                        {/* Check-In Button */}
                        <button
                            className="w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-all transform hover:scale-110"
                            title="Check In"
                        >
                            <FiCheckCircle size={22} />
                        </button>
                    </div>

                    {/* Error Toast */}
                    {error && (
                        <div className="absolute top-20 left-4 right-20 bg-red-500 text-white px-4 py-3 rounded-lg shadow-xl">
                            <p className="font-semibold text-sm">{error}</p>
                        </div>
                    )}
                </div>

                {/* Bottom Member List Panel */}
                <div
                    className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent transition-all duration-300 ${showMemberList ? 'translate-y-0' : 'translate-y-full'
                        }`}
                >
                    {/* Drag Handle */}
                    <button
                        onClick={() => setShowMemberList(!showMemberList)}
                        className="w-full py-3 flex justify-center"
                    >
                        <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
                    </button>

                    {/* Header */}
                    <div className="px-4 pb-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">
                                Family Members
                            </h2>
                            <div className="px-3 py-1 bg-purple-100 rounded-full">
                                <span className="text-sm font-semibold text-purple-700">
                                    {locations.length} online
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Member Cards - Horizontal Scroll */}
                    <div className="px-4 pb-safe">
                        {locations.length > 0 ? (
                            <div className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar">
                                {locations.map((location) => (
                                    <div key={location.userId} className="flex-shrink-0 w-80">
                                        <MemberLocationCard
                                            location={location}
                                            userName={`User ${location.userId.slice(0, 8)}`}
                                            batteryLevel={85} // TODO: Get from device monitoring
                                            isOnline={true}
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 pb-safe">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FiUsers size={32} className="text-gray-400" />
                                </div>
                                <p className="text-gray-600 font-medium">No members sharing location</p>
                                <p className="text-sm text-gray-500 mt-1">
                                    Invite family members to start tracking
                                </p>
                            </div>
                        )}
                    </div>
                </div>
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
                    padding-bottom: env(safe-area-inset-bottom, 1rem);
                }
            `}</style>
        </>
    );
};

export default LocationPage;

