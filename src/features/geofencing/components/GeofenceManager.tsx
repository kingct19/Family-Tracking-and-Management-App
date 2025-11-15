/**
 * GeofenceManager Component
 * 
 * UI for managing geofences (Life360 style)
 * - List of existing geofences
 * - Create new geofence button
 * - Edit/delete geofences
 * - Enable/disable geofences
 */

import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiMapPin, FiHome, FiBriefcase, FiBookOpen, FiToggleLeft, FiToggleRight, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { useGeofences } from '../hooks/useGeofences';
import type { GeofenceZone, GeofenceType } from '../types';
import { LoadingSpinner } from '@/components/LoadingSpinner';

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
    const { geofences, isLoading } = useGeofences();
    const [expandedGeofence, setExpandedGeofence] = useState<string | null>(null);

    // Debug: Log geofences changes
    useEffect(() => {
        console.log('[GeofenceManager] Geofences updated:', {
            count: geofences.length,
            geofences: geofences.map(g => ({ id: g.id, name: g.name, isActive: g.isActive })),
            isLoading,
        });
    }, [geofences, isLoading]);

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
                <div className="flex items-center justify-center py-12">
                    <LoadingSpinner size="medium" />
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Geofences</h2>
                    <p className="text-gray-600 mt-1">
                        Set up location alerts for your family
                    </p>
                </div>
                <button
                    onClick={() => {
                        if (onCreateGeofence) {
                            onCreateGeofence();
                        }
                    }}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                    <FiPlus size={20} />
                    <span className="font-semibold">Add Geofence</span>
                </button>
            </div>

            {/* Geofences List */}
            {geofences.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 shadow-lg border border-gray-100 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiMapPin size={36} className="text-purple-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        No geofences yet
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        Create your first geofence to start receiving location alerts when family members enter or leave specific areas
                    </p>
                    <button
                        onClick={() => {
                            if (onCreateGeofence) {
                                onCreateGeofence();
                            }
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
                    >
                        <span className="flex items-center gap-2">
                            <FiPlus size={18} />
                            Create Your First Geofence
                        </span>
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {geofences.map((geofence) => (
                        <div
                            key={geofence.id}
                            className={`bg-white rounded-xl border-2 transition-all hover:shadow-lg ${
                                expandedGeofence === geofence.id
                                    ? 'shadow-lg border-purple-300'
                                    : 'shadow-sm border-gray-200 hover:border-purple-200'
                            } ${!geofence.isActive ? 'opacity-60' : ''}`}
                        >
                            {/* Geofence Header */}
                            <div className="p-5">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                            geofence.type === 'home' ? 'bg-blue-100' :
                                            geofence.type === 'school' ? 'bg-green-100' :
                                            geofence.type === 'work' ? 'bg-purple-100' :
                                            'bg-gray-100'
                                        }`}>
                                            {getGeofenceIcon(geofence.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-gray-900 text-lg mb-1">
                                                {geofence.name}
                                            </h3>
                                            <p className="text-sm text-gray-600 flex items-center gap-2">
                                                <span className="capitalize">{geofence.type}</span>
                                                <span>•</span>
                                                <span>{formatRadius(geofence.radius)}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {geofence.isActive ? (
                                            <FiCheckCircle className="text-green-500" size={20} />
                                        ) : (
                                            <FiAlertCircle className="text-gray-400" size={20} />
                                        )}
                                    </div>
                                </div>

                                {/* Alert Status Badges */}
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {geofence.alertOnEntry && (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs font-medium">
                                            <FiAlertCircle size={12} />
                                            Entry Alert
                                        </span>
                                    )}
                                    {geofence.alertOnExit && (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-700 rounded-md text-xs font-medium">
                                            <FiAlertCircle size={12} />
                                            Exit Alert
                                        </span>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => {
                                                // Toggle active state
                                                // This would need to be implemented in the hook
                                            }}
                                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                                geofence.isActive
                                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                            title={geofence.isActive ? 'Disable geofence' : 'Enable geofence'}
                                        >
                                            {geofence.isActive ? (
                                                <>
                                                    <FiToggleRight size={16} />
                                                    Active
                                                </>
                                            ) : (
                                                <>
                                                    <FiToggleLeft size={16} />
                                                    Inactive
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => onEditGeofence?.(geofence)}
                                            className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                            title="Edit geofence"
                                        >
                                            <FiEdit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (confirm(`Are you sure you want to delete "${geofence.name}"?`)) {
                                                    onDeleteGeofence?.(geofence.id);
                                                }
                                            }}
                                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete geofence"
                                        >
                                            <FiTrash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {expandedGeofence === geofence.id && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                                            <div>
                                                <span className="text-gray-600 block mb-1">Latitude:</span>
                                                <p className="font-mono text-xs font-medium">
                                                    {geofence.center.latitude.toFixed(6)}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-gray-600 block mb-1">Longitude:</span>
                                                <p className="font-mono text-xs font-medium">
                                                    {geofence.center.longitude.toFixed(6)}
                                                </p>
                                            </div>
                                        </div>
                                        {geofence.description && (
                                            <div className="mt-3 pt-3 border-t border-gray-100">
                                                <span className="text-gray-600 text-xs font-medium block mb-1">Description:</span>
                                                <p className="text-sm text-gray-700">{geofence.description}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
