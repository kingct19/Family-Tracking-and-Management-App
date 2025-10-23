/**
 * Geofencing Types
 * 
 * Data structures for geofence management and detection
 */

export interface GeofenceZone {
    id: string;
    hubId: string;
    name: string;
    description?: string;
    type: GeofenceType;
    center: {
        latitude: number;
        longitude: number;
    };
    radius: number; // in meters
    isActive: boolean;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    // Alert settings
    alertOnEntry: boolean;
    alertOnExit: boolean;
    alertRecipients: string[]; // User IDs who should receive alerts
}

export type GeofenceType = 
    | 'home'
    | 'school'
    | 'work'
    | 'custom';

export interface GeofenceEvent {
    id: string;
    hubId: string;
    userId: string;
    geofenceId: string;
    eventType: 'entry' | 'exit';
    timestamp: Date;
    location: {
        latitude: number;
        longitude: number;
    };
    accuracy: number;
    // Alert status
    alertSent: boolean;
    alertSentAt?: Date;
}

export interface GeofenceAlert {
    id: string;
    hubId: string;
    userId: string;
    geofenceId: string;
    eventType: 'entry' | 'exit';
    message: string;
    timestamp: Date;
    isRead: boolean;
    readAt?: Date;
    // Geofence details for display
    geofenceName: string;
    userName: string;
}

export interface CreateGeofenceRequest {
    name: string;
    description?: string;
    type: GeofenceType;
    center: {
        latitude: number;
        longitude: number;
    };
    radius: number;
    alertOnEntry: boolean;
    alertOnExit: boolean;
    alertRecipients: string[];
}

export interface UpdateGeofenceRequest extends Partial<CreateGeofenceRequest> {
    id: string;
    isActive?: boolean;
}

// Map display helpers
export interface GeofenceMapData {
    zone: GeofenceZone;
    circle?: google.maps.Circle;
    marker?: google.maps.Marker;
}

// Detection helpers
export interface GeofenceDetectionResult {
    geofenceId: string;
    geofenceName: string;
    eventType: 'entry' | 'exit';
    distance: number; // meters from center
    accuracy: number;
}
