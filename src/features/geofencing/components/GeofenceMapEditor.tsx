/**
 * GeofenceMapEditor Component
 * 
 * Interactive map-based geofence creation/editing
 * - Click to place center
 * - Drag to resize radius
 * - Visual feedback
 */

import { useEffect, useRef, useState } from 'react';
import { googleMapsLoader } from '@/lib/services/google-maps-loader';
import { FiX, FiHome, FiBriefcase, FiBookOpen, FiMapPin } from 'react-icons/fi';
import type { GeofenceType, CreateGeofenceRequest } from '../types';

interface GeofenceMapEditorProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: CreateGeofenceRequest) => void;
    initialLocation?: {
        latitude: number;
        longitude: number;
    };
    geofence?: {
        name: string;
        type: GeofenceType;
        center: { latitude: number; longitude: number };
        radius: number;
    } | null;
}

export const GeofenceMapEditor = ({
    isOpen,
    onClose,
    onSave,
    initialLocation,
    geofence,
}: GeofenceMapEditorProps) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const googleMapRef = useRef<google.maps.Map | null>(null);
    const circleRef = useRef<google.maps.Circle | null>(null);
    const centerMarkerRef = useRef<google.maps.Marker | null>(null);
    const resizeMarkersRef = useRef<google.maps.Marker[]>([]);

    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const [formData, setFormData] = useState({
        name: geofence?.name || '',
        description: '',
        type: (geofence?.type || 'custom') as GeofenceType,
        center: geofence?.center || initialLocation || { latitude: 0, longitude: 0 },
        radius: geofence?.radius || 100,
    });
    const [isDragging, setIsDragging] = useState(false);

    // Initialize map
    useEffect(() => {
        if (!isOpen || !mapRef.current) return;

        googleMapsLoader.load().then((google) => {
            if (!mapRef.current) return;

            const center = formData.center.latitude !== 0 
                ? new google.maps.LatLng(formData.center.latitude, formData.center.longitude)
                : new google.maps.LatLng(40.7128, -74.0060); // Default to NYC

            googleMapRef.current = new google.maps.Map(mapRef.current, {
                center,
                zoom: 15,
                mapTypeControl: true,
                streetViewControl: true,
                fullscreenControl: true,
                zoomControl: true,
            });

            setIsMapLoaded(true);
            createGeofenceVisualization();
        });
    }, [isOpen]);

    // Create geofence visualization
    const createGeofenceVisualization = () => {
        if (!googleMapRef.current || !isMapLoaded) return;

        const center = new google.maps.LatLng(formData.center.latitude, formData.center.longitude);

        // Create center marker
        if (centerMarkerRef.current) {
            centerMarkerRef.current.setMap(null);
        }
        centerMarkerRef.current = new google.maps.Marker({
            position: center,
            map: googleMapRef.current,
            title: 'Geofence Center',
            draggable: true,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: getGeofenceColor(formData.type),
                fillOpacity: 1,
                strokeColor: '#FFFFFF',
                strokeWeight: 2,
            },
        });

        // Create circle
        if (circleRef.current) {
            circleRef.current.setMap(null);
        }
        circleRef.current = new google.maps.Circle({
            strokeColor: getGeofenceColor(formData.type),
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: getGeofenceColor(formData.type),
            fillOpacity: 0.2,
            map: googleMapRef.current,
            center,
            radius: formData.radius,
            clickable: false,
        });

        // Create resize markers
        createResizeMarkers();

        // Add drag listeners
        centerMarkerRef.current.addListener('drag', (e: any) => {
            const newCenter = e.latLng;
            updateGeofenceCenter(newCenter.lat(), newCenter.lng());
        });

        // Add map click listener
        googleMapRef.current.addListener('click', (e: any) => {
            if (isDragging) return;
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            updateGeofenceCenter(lat, lng);
        });
    };

    // Create resize markers around the circle
    const createResizeMarkers = () => {
        if (!googleMapRef.current || !circleRef.current) return;

        // Clear existing resize markers
        resizeMarkersRef.current.forEach(marker => marker.setMap(null));
        resizeMarkersRef.current = [];

        const center = circleRef.current.getCenter();
        const radius = circleRef.current.getRadius();
        
        // Create 4 resize markers around the circle
        const angles = [0, 90, 180, 270]; // North, East, South, West
        
        angles.forEach((angle, index) => {
            const rad = (angle * Math.PI) / 180;
            const x = radius * Math.cos(rad);
            const y = radius * Math.sin(rad);
            
            const lat = center!.lat() + (y / 111000); // Rough conversion
            const lng = center!.lng() + (x / (111000 * Math.cos(center!.lat() * Math.PI / 180)));
            
            const marker = new google.maps.Marker({
                position: new google.maps.LatLng(lat, lng),
                map: googleMapRef.current,
                title: 'Resize Geofence',
                draggable: true,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 6,
                    fillColor: '#FFFFFF',
                    fillOpacity: 1,
                    strokeColor: getGeofenceColor(formData.type),
                    strokeWeight: 2,
                },
            });

            marker.addListener('drag', () => {
                const newRadius = google.maps.geometry.spherical.computeDistanceBetween(
                    center!,
                    marker.getPosition()!
                );
                updateGeofenceRadius(newRadius);
            });

            resizeMarkersRef.current.push(marker);
        });
    };

    // Update geofence center
    const updateGeofenceCenter = (lat: number, lng: number) => {
        setFormData(prev => ({
            ...prev,
            center: { latitude: lat, longitude: lng },
        }));

        if (centerMarkerRef.current) {
            centerMarkerRef.current.setPosition(new google.maps.LatLng(lat, lng));
        }
        if (circleRef.current) {
            circleRef.current.setCenter(new google.maps.LatLng(lat, lng));
        }
        createResizeMarkers();
    };

    // Update geofence radius
    const updateGeofenceRadius = (radius: number) => {
        const clampedRadius = Math.max(10, Math.min(5000, radius)); // 10m to 5km
        setFormData(prev => ({
            ...prev,
            radius: clampedRadius,
        }));

        if (circleRef.current) {
            circleRef.current.setRadius(clampedRadius);
        }
        createResizeMarkers();
    };

    // Get geofence color
    const getGeofenceColor = (type: GeofenceType): string => {
        switch (type) {
            case 'home': return '#3B82F6';
            case 'school': return '#10B981';
            case 'work': return '#8B5CF6';
            default: return '#6B7280';
        }
    };

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    // Geofence types
    const geofenceTypes = [
        { value: 'home', label: 'Home', icon: <FiHome size={20} /> },
        { value: 'school', label: 'School', icon: <FiBookOpen size={20} /> },
        { value: 'work', label: 'Work', icon: <FiBriefcase size={20} /> },
        { value: 'custom', label: 'Custom', icon: <FiMapPin size={20} /> },
    ] as const;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <FiMapPin size={24} className="text-purple-600" />
                        <h2 className="text-2xl font-bold text-gray-900">
                            {geofence ? 'Edit Geofence' : 'Create Geofence'}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                <div className="flex h-[600px]">
                    {/* Map */}
                    <div className="flex-1 relative">
                        <div
                            ref={mapRef}
                            className="w-full h-full"
                            style={{ minHeight: '400px' }}
                        />
                        {!isMapLoaded && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                                    <p className="text-gray-600">Loading map...</p>
                                </div>
                            </div>
                        )}
                        
                        {/* Instructions overlay */}
                        <div className="absolute top-4 left-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                            <p className="text-sm text-gray-700">
                                <strong>Click on the map</strong> to place the geofence center
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                Drag the white dots to resize the radius
                            </p>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="w-80 border-l border-gray-200 p-6 overflow-y-auto">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Basic Info */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Geofence Details</h3>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
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
                                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="Optional description..."
                                            rows={3}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Type
                                        </label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {geofenceTypes.map((type) => (
                                                <label
                                                    key={type.value}
                                                    className={`flex items-center gap-2 p-2 border-2 rounded-lg cursor-pointer transition-colors ${
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
                                                        onChange={(e) => setFormData(prev => ({ 
                                                            ...prev, 
                                                            type: e.target.value as GeofenceType 
                                                        }))}
                                                        className="sr-only"
                                                    />
                                                    {type.icon}
                                                    <span className="text-sm font-medium">{type.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Location Info */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Location</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Latitude:</span>
                                        <span className="font-mono">{formData.center.latitude.toFixed(6)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Longitude:</span>
                                        <span className="font-mono">{formData.center.longitude.toFixed(6)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Radius:</span>
                                        <span className="font-medium">{Math.round(formData.radius)}m</span>
                                    </div>
                                </div>
                            </div>

                            {/* Alert Settings */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Alert Settings</h3>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            defaultChecked
                                            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">
                                            Alert when entering this area
                                        </span>
                                    </label>
                                    
                                    <label className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            defaultChecked
                                            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">
                                            Alert when leaving this area
                                        </span>
                                    </label>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-6 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                >
                                    {geofence ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};
