/**
 * GeofenceManager Component
 * 
 * UI for managing geofences (Life360 style)
 * - List of existing geofences
 * - Create new geofence button
 * - Edit/delete geofences
 */

import { useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiMapPin, FiHome, FiBriefcase, FiBookOpen } from 'react-icons/fi';
import { useGeofences } from '../hooks/useGeofences';
import type { GeofenceZone, GeofenceType } from '../types';

interface GeofenceManagerProps {
    onEditGeofence?: (geofence: GeofenceZone) => void;
    onDeleteGeofence?: (geofenceId: string) => void;
    onCreateGeofence?: () => void;
}

export const GeofenceManager = ({
    onEditGeofence,
    onDeleteGeofence,
    onCreateGeofence,
}: GeofenceManagerProps) => {
    const { geofences, isLoading, deleteGeofence } = useGeofences();
    const [expandedGeofence, setExpandedGeofence] = useState<string | null>(null);

    const getGeofenceIcon = (type: GeofenceType) => {
        switch (type) {
            case 'home':
                return <FiHome className="text-blue-500" size={20} />;
            case 'school':
                return <FiBookOpen className="text-green-500" size={20} />;
            case 'work':
                return <FiBriefcase className="text-purple-500" size={20} />;
            default:
                return <FiMapPin className="text-gray-500" size={20} />;
        }
    };

    const getGeofenceColor = (type: GeofenceType) => {
        switch (type) {
            case 'home':
                return 'bg-blue-50 border-blue-200';
            case 'school':
                return 'bg-green-50 border-green-200';
            case 'work':
                return 'bg-purple-50 border-purple-200';
            default:
                return 'bg-gray-50 border-gray-200';
        }
    };

    const formatRadius = (radius: number) => {
        if (radius < 1000) {
            return `${Math.round(radius)}m`;
        }
        return `${(radius / 1000).toFixed(1)}km`;
    };

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Geofences</h2>
                    <p className="text-gray-600 mt-1">
                        Set up location alerts for your family
                    </p>
                </div>
                <button
                    onClick={onCreateGeofence}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                    <FiPlus size={20} />
                    Add Geofence
                </button>
            </div>

            {/* Geofences List */}
            {geofences.length === 0 ? (
                <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiMapPin size={36} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No geofences yet
                    </h3>
                    <p className="text-gray-600 mb-6">
                        Create your first geofence to start receiving location alerts
                    </p>
                    <button
                        onClick={onCreateGeofence}
                        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        Create Geofence
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {geofences.map((geofence) => (
                        <div
                            key={geofence.id}
                            className={`p-4 rounded-lg border-2 transition-all ${
                                expandedGeofence === geofence.id
                                    ? 'shadow-md'
                                    : 'hover:shadow-sm'
                            } ${getGeofenceColor(geofence.type)}`}
                        >
                            {/* Geofence Header */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {getGeofenceIcon(geofence.type)}
                                    <div>
                                        <h3 className="font-semibold text-gray-900">
                                            {geofence.name}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {geofence.type.charAt(0).toUpperCase() + geofence.type.slice(1)} • {formatRadius(geofence.radius)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => onEditGeofence?.(geofence)}
                                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                        title="Edit geofence"
                                    >
                                        <FiEdit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => onDeleteGeofence?.(geofence.id)}
                                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete geofence"
                                    >
                                        <FiTrash2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => setExpandedGeofence(
                                            expandedGeofence === geofence.id ? null : geofence.id
                                        )}
                                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                        title={expandedGeofence === geofence.id ? 'Collapse' : 'Expand'}
                                    >
                                        <div className={`transform transition-transform ${
                                            expandedGeofence === geofence.id ? 'rotate-180' : ''
                                        }`}>
                                            ▼
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {expandedGeofence === geofence.id && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-600">Location:</span>
                                            <p className="font-medium">
                                                {geofence.center.latitude.toFixed(6)}, {geofence.center.longitude.toFixed(6)}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Radius:</span>
                                            <p className="font-medium">{formatRadius(geofence.radius)}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Entry Alerts:</span>
                                            <p className="font-medium">
                                                {geofence.alertOnEntry ? 'Enabled' : 'Disabled'}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Exit Alerts:</span>
                                            <p className="font-medium">
                                                {geofence.alertOnExit ? 'Enabled' : 'Disabled'}
                                            </p>
                                        </div>
                                    </div>
                                    {geofence.description && (
                                        <div className="mt-3">
                                            <span className="text-gray-600 text-sm">Description:</span>
                                            <p className="text-sm mt-1">{geofence.description}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
