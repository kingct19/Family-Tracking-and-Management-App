/**
 * MemberLocationCard Component
 * 
 * Displays a member's location info in a card overlay (Life360 style)
 * - Shows avatar/photo
 * - Location name/address
 * - Battery level
 * - Last updated time
 * - Quick actions (Check-In, SOS, etc.)
 */

import { useState } from 'react';
import { MdBatteryFull, MdAccessTime, MdLocationOn, MdNavigation } from 'react-icons/md';
import { ETADisplay } from './ETADisplay';
import { useUserLocation } from '../hooks/useLocation';
import type { UserLocation } from '../api/location-api';

interface MemberLocationCardProps {
    location: UserLocation;
    userName?: string;
    userPhoto?: string;
    batteryLevel?: number;
    isOnline?: boolean;
}

export const MemberLocationCard = ({
    location,
    userName = 'User',
    userPhoto,
    batteryLevel,
    isOnline = true
}: MemberLocationCardProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { currentLocation } = useUserLocation();

    // Format timestamp - handles Date objects, timestamps, and Firestore Timestamps
    const formatTime = (date: Date | number | any) => {
        const now = new Date();

        // Convert to timestamp if it's a Date object or Firestore Timestamp
        let timestamp: number;
        if (typeof date === 'number') {
            timestamp = date;
        } else if (date && typeof date.getTime === 'function') {
            timestamp = date.getTime();
        } else if (date && typeof date.toMillis === 'function') {
            // Firestore Timestamp
            timestamp = date.toMillis();
        } else {
            return 'Unknown';
        }

        const diff = Math.floor((now.getTime() - timestamp) / 1000); // seconds

        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return new Date(timestamp).toLocaleDateString();
    };

    // Get battery icon color
    const getBatteryColor = (level?: number | null) => {
        if (level === null || level === undefined) return 'text-gray-400';
        if (level < 20) return 'text-red-500';
        if (level < 50) return 'text-yellow-500';
        return 'text-green-500';
    };

    return (
        <div
            className="bg-white rounded-2xl shadow-2xl p-4 cursor-pointer transition-all duration-200 hover:shadow-3xl border border-gray-100"
            onClick={() => setIsExpanded(!isExpanded)}
        >
            {/* Main Content */}
            <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-lg overflow-hidden">
                        {userPhoto ? (
                            <img src={userPhoto} alt={userName} className="w-full h-full object-cover" />
                        ) : (
                            userName.charAt(0).toUpperCase()
                        )}
                    </div>
                    {/* Online status indicator */}
                    {isOnline && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-base">{userName}</h3>

                    {/* Location & Status */}
                    <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                        <MdLocationOn size={12} className="flex-shrink-0" />
                        <span className="truncate">
                            {location.address || location.addressDetails?.formatted || 'Fetching address...'}
                        </span>
                    </div>

                    {/* Time & Battery */}
                    <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                            <MdAccessTime size={12} />
                            <span>{formatTime(location.timestamp)}</span>
                        </div>

                        <div className={`flex items-center gap-1 text-xs ${getBatteryColor(batteryLevel)}`}>
                            <MdBatteryFull size={12} />
                            <span>{batteryLevel !== null && batteryLevel !== undefined ? `${batteryLevel}%` : 'N/A'}</span>
                        </div>
                    </div>
                </div>

                {/* Accuracy badge */}
                <div className="flex-shrink-0">
                    <div className="px-2 py-1 bg-gray-100 rounded-full">
                        <span className="text-xs text-gray-600">±{Math.round(location.accuracy)}m</span>
                    </div>
                </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                    {/* Address Details */}
                    {location.addressDetails && (
                        <div className="text-sm">
                            <p className="text-xs text-gray-500 mb-1">Address</p>
                            <p className="font-medium text-gray-900">{location.addressDetails.formatted}</p>
                            {location.addressDetails.city && location.addressDetails.state && (
                                <p className="text-xs text-gray-600 mt-1">
                                    {location.addressDetails.city}, {location.addressDetails.state}
                                    {location.addressDetails.zipCode && ` ${location.addressDetails.zipCode}`}
                                </p>
                            )}
                        </div>
                    )}

                    {/* ETA Display */}
                    {currentLocation && (
                        <ETADisplay
                            origin={{
                                lat: currentLocation.latitude,
                                lng: currentLocation.longitude,
                            }}
                            destination={{
                                lat: location.latitude,
                                lng: location.longitude,
                            }}
                            memberName={userName}
                        />
                    )}
                    
                    {/* Additional Info */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        {location.speed !== null && location.speed !== undefined && (
                            <div>
                                <p className="text-xs text-gray-500">Speed</p>
                                <p className="font-semibold text-gray-900">
                                    {Math.round(location.speed * 3.6)} km/h
                                </p>
                            </div>
                        )}

                        {location.heading !== null && location.heading !== undefined && (
                            <div>
                                <p className="text-xs text-gray-500">Heading</p>
                                <p className="font-semibold text-gray-900">{Math.round(location.heading)}°</p>
                            </div>
                        )}
                    </div>

                    {/* Quick Actions - Mobile optimized */}
                    <div className="flex gap-2">
                        <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 sm:py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 active:bg-purple-300 transition-colors text-sm font-medium touch-target">
                            <MdNavigation size={16} className="sm:w-3.5 sm:h-3.5" />
                            <span>Directions</span>
                        </button>
                        <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 sm:py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 active:bg-gray-300 transition-colors text-sm font-medium touch-target">
                            <MdLocationOn size={16} className="sm:w-3.5 sm:h-3.5" />
                            <span>Details</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

