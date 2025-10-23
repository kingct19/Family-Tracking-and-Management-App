import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/Button';
import { MapView } from '../components/MapView';
import { useUserLocation } from '../hooks/useLocation';
import { FiMapPin, FiNavigation } from 'react-icons/fi';

const LocationPage = () => {
    const {
        currentLocation,
        isSharing,
        isWatching,
        error,
        startTracking,
        stopTracking,
        toggleSharing,
    } = useUserLocation();

    return (
        <>
            <Helmet>
                <title>Location - Family Safety App</title>
                <meta name="description" content="Track family member locations" />
            </Helmet>

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Location Tracking</h1>
                        <p className="text-base text-gray-600 mt-1">
                            Real-time location tracking for your family members
                        </p>
                    </div>

                    {/* Controls */}
                    <div className="flex gap-3">
                        {!isWatching ? (
                            <Button
                                variant="filled"
                                onClick={startTracking}
                                className="bg-purple-600 text-white hover:bg-purple-700"
                            >
                                <FiNavigation size={18} className="mr-2" />
                                Start Tracking
                            </Button>
                        ) : (
                            <Button
                                variant="outlined"
                                onClick={stopTracking}
                                className="border-gray-300 text-gray-700"
                            >
                                Stop Tracking
                            </Button>
                        )}

                        <Button
                            variant={isSharing ? 'filled' : 'outlined'}
                            onClick={toggleSharing}
                            className={
                                isSharing
                                    ? 'bg-green-600 text-white hover:bg-green-700'
                                    : 'border-gray-300 text-gray-700'
                            }
                        >
                            <FiMapPin size={18} className="mr-2" />
                            {isSharing ? 'Sharing' : 'Share Location'}
                        </Button>
                    </div>
                </div>

                {/* Error message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-800 font-semibold">Location Error</p>
                        <p className="text-red-600 text-sm mt-1">{error}</p>
                    </div>
                )}

                {/* Current location info */}
                {currentLocation && (
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-3">Your Location</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-xs text-gray-500">Latitude</p>
                                <p className="text-sm font-semibold text-gray-900">
                                    {currentLocation.latitude.toFixed(6)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Longitude</p>
                                <p className="text-sm font-semibold text-gray-900">
                                    {currentLocation.longitude.toFixed(6)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Accuracy</p>
                                <p className="text-sm font-semibold text-gray-900">
                                    {Math.round(currentLocation.accuracy)}m
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Updated</p>
                                <p className="text-sm font-semibold text-gray-900">
                                    {new Date(currentLocation.timestamp).toLocaleTimeString()}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Map */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Family Map</h3>
                    <MapView height="600px" zoom={13} />
                </div>

                {/* Info card */}
                <div className="bg-purple-50 rounded-2xl p-6 border border-purple-200">
                    <h3 className="text-lg font-bold text-purple-900 mb-2">How it works</h3>
                    <ul className="space-y-2 text-sm text-purple-800">
                        <li className="flex items-start gap-2">
                            <span className="text-purple-600">•</span>
                            <span>Click "Start Tracking" to enable location tracking on your device</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-purple-600">•</span>
                            <span>
                                Toggle "Share Location" to allow family members to see your location
                            </span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-purple-600">•</span>
                            <span>
                                Location history is automatically deleted after 30 days for privacy
                            </span>
                        </li>
                    </ul>
                </div>
            </div>
        </>
    );
};

export default LocationPage;
