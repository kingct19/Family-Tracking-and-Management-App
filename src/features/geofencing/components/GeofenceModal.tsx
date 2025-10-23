/**
 * GeofenceModal Component
 * 
 * Modal for creating and editing geofences
 * - Form for geofence details
 * - Map integration for location selection
 * - Alert settings
 */

import { useState, useEffect } from 'react';
import { FiX, FiMapPin, FiHome, FiBriefcase, FiBookOpen, FiSettings } from 'react-icons/fi';
import { useGeofences } from '../hooks/useGeofences';
import type { GeofenceZone, GeofenceType, CreateGeofenceRequest } from '../types';

interface GeofenceModalProps {
    isOpen: boolean;
    onClose: () => void;
    geofence?: GeofenceZone | null;
    initialLocation?: {
        latitude: number;
        longitude: number;
    };
}

export const GeofenceModal = ({
    isOpen,
    onClose,
    geofence,
    initialLocation,
}: GeofenceModalProps) => {
    const { createGeofence, updateGeofence, isCreating, isUpdating } = useGeofences();
    const isEditing = !!geofence;

    // Form state
    const [formData, setFormData] = useState<CreateGeofenceRequest>({
        name: '',
        description: '',
        type: 'custom',
        center: initialLocation || { latitude: 0, longitude: 0 },
        radius: 100,
        alertOnEntry: true,
        alertOnExit: true,
        alertRecipients: [],
    });

    // Initialize form with geofence data when editing
    useEffect(() => {
        if (isEditing && geofence) {
            setFormData({
                name: geofence.name,
                description: geofence.description || '',
                type: geofence.type,
                center: geofence.center,
                radius: geofence.radius,
                alertOnEntry: geofence.alertOnEntry,
                alertOnExit: geofence.alertOnExit,
                alertRecipients: geofence.alertRecipients,
            });
        } else if (initialLocation) {
            setFormData(prev => ({
                ...prev,
                center: initialLocation,
            }));
        }
    }, [isEditing, geofence, initialLocation]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isEditing && geofence) {
            updateGeofence({
                id: geofence.id,
                ...formData,
            });
        } else {
            createGeofence(formData);
        }
        
        onClose();
    };

    const handleInputChange = (field: keyof CreateGeofenceRequest, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const geofenceTypes: { value: GeofenceType; label: string; icon: React.ReactNode }[] = [
        { value: 'home', label: 'Home', icon: <FiHome size={20} /> },
        { value: 'school', label: 'School', icon: <FiBookOpen size={20} /> },
        { value: 'work', label: 'Work', icon: <FiBriefcase size={20} /> },
        { value: 'custom', label: 'Custom', icon: <FiMapPin size={20} /> },
    ];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <FiSettings size={24} className="text-purple-600" />
                        <h2 className="text-2xl font-bold text-gray-900">
                            {isEditing ? 'Edit Geofence' : 'Create Geofence'}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Name *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="e.g., Home, School, Work"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Optional description..."
                                rows={3}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Type
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {geofenceTypes.map((type) => (
                                    <label
                                        key={type.value}
                                        className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                                            formData.type === type.value
                                                ? 'border-purple-500 bg-purple-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="type"
                                            value={type.value}
                                            checked={formData.type === type.value}
                                            onChange={(e) => handleInputChange('type', e.target.value as GeofenceType)}
                                            className="sr-only"
                                        />
                                        {type.icon}
                                        <span className="font-medium">{type.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Location</h3>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Latitude
                                </label>
                                <input
                                    type="number"
                                    step="any"
                                    value={formData.center.latitude}
                                    onChange={(e) => handleInputChange('center', {
                                        ...formData.center,
                                        latitude: parseFloat(e.target.value) || 0,
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="0.000000"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Longitude
                                </label>
                                <input
                                    type="number"
                                    step="any"
                                    value={formData.center.longitude}
                                    onChange={(e) => handleInputChange('center', {
                                        ...formData.center,
                                        longitude: parseFloat(e.target.value) || 0,
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="0.000000"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Radius (meters)
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="range"
                                    min="10"
                                    max="5000"
                                    step="10"
                                    value={formData.radius}
                                    onChange={(e) => handleInputChange('radius', parseInt(e.target.value))}
                                    className="flex-1"
                                />
                                <span className="text-sm font-medium text-gray-700 min-w-[60px]">
                                    {formData.radius}m
                                </span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>10m</span>
                                <span>5km</span>
                            </div>
                        </div>
                    </div>

                    {/* Alert Settings */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Alert Settings</h3>
                        
                        <div className="space-y-3">
                            <label className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={formData.alertOnEntry}
                                    onChange={(e) => handleInputChange('alertOnEntry', e.target.checked)}
                                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                    Alert when entering this area
                                </span>
                            </label>
                            
                            <label className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={formData.alertOnExit}
                                    onChange={(e) => handleInputChange('alertOnExit', e.target.checked)}
                                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                    Alert when leaving this area
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isCreating || isUpdating}
                            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isCreating || isUpdating ? 'Saving...' : (isEditing ? 'Update' : 'Create')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
