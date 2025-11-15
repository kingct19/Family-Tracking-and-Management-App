/**
 * GeofenceDetailsModal Component
 * 
 * Modal for viewing geofence details
 * - Shows geofence information
 * - Edit and delete actions
 */

import { FiX, FiEdit2, FiTrash2, FiHome, FiBriefcase, FiBookOpen, FiMapPin, FiAlertCircle } from 'react-icons/fi';
import type { GeofenceZone, GeofenceType } from '../types';

interface GeofenceDetailsModalProps {
    geofence: GeofenceZone | null;
    isOpen: boolean;
    onClose: () => void;
    onEdit: (geofence: GeofenceZone) => void;
    onDelete: (geofenceId: string) => void;
}

export const GeofenceDetailsModal = ({
    geofence,
    isOpen,
    onClose,
    onEdit,
    onDelete,
}: GeofenceDetailsModalProps) => {
    if (!isOpen || !geofence) return null;

    const getGeofenceIcon = (type: GeofenceType) => {
        switch (type) {
            case 'home':
                return <FiHome className="text-blue-500" size={24} />;
            case 'school':
                return <FiBookOpen className="text-green-500" size={24} />;
            case 'work':
                return <FiBriefcase className="text-purple-500" size={24} />;
            default:
                return <FiMapPin className="text-gray-500" size={24} />;
        }
    };

    const formatRadius = (radius: number) => {
        if (radius < 1000) {
            return `${Math.round(radius)}m`;
        }
        return `${(radius / 1000).toFixed(1)}km`;
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        {getGeofenceIcon(geofence.type)}
                        <h2 className="text-2xl font-bold text-gray-900">{geofence.name}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label="Close"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Description */}
                    {geofence.description && (
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
                            <p className="text-gray-600">{geofence.description}</p>
                        </div>
                    )}

                    {/* Location Info */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Location</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Latitude:</span>
                                <span className="font-mono text-gray-900">{geofence.center.latitude.toFixed(6)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Longitude:</span>
                                <span className="font-mono text-gray-900">{geofence.center.longitude.toFixed(6)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Radius:</span>
                                <span className="font-medium text-gray-900">{formatRadius(geofence.radius)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Alert Settings */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <FiAlertCircle size={16} />
                            Alert Settings
                        </h3>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm text-gray-700">Entry Alerts</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    geofence.alertOnEntry
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-gray-100 text-gray-600'
                                }`}>
                                    {geofence.alertOnEntry ? 'Enabled' : 'Disabled'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm text-gray-700">Exit Alerts</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    geofence.alertOnExit
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-gray-100 text-gray-600'
                                }`}>
                                    {geofence.alertOnExit ? 'Enabled' : 'Disabled'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Metadata */}
                    <div className="pt-4 border-t border-gray-200">
                        <div className="space-y-2 text-xs text-gray-500">
                            <div className="flex justify-between">
                                <span>Created:</span>
                                <span>{formatDate(geofence.createdAt)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Updated:</span>
                                <span>{formatDate(geofence.updatedAt)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Status:</span>
                                <span className={`font-medium ${
                                    geofence.isActive ? 'text-green-600' : 'text-gray-500'
                                }`}>
                                    {geofence.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 p-6 border-t border-gray-200">
                    <button
                        onClick={() => {
                            onEdit(geofence);
                            onClose();
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                    >
                        <FiEdit2 size={18} />
                        Edit
                    </button>
                    <button
                        onClick={() => {
                            if (window.confirm(`Are you sure you want to delete "${geofence.name}"?`)) {
                                onDelete(geofence.id);
                                onClose();
                            }
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                    >
                        <FiTrash2 size={18} />
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

