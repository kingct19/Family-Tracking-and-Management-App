/**
 * Geofence API
 * 
 * Firestore operations for geofence management
 */

import {
    collection,
    doc,
    addDoc,
    updateDoc,
    getDocs,
    getDoc,
    query,
    orderBy,
    serverTimestamp,
    Timestamp,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { ApiResponse } from '@/types';
import type {
    GeofenceZone,
    GeofenceEvent,
    GeofenceAlert,
    CreateGeofenceRequest,
    UpdateGeofenceRequest,
} from '../types';

// Export types for use in hooks
export type { CreateGeofenceRequest, UpdateGeofenceRequest } from '../types';

// Collection references
const getGeofencesRef = (hubId: string) =>
    collection(db, 'hubs', hubId, 'geofences');

const getGeofenceEventsRef = (hubId: string) =>
    collection(db, 'hubs', hubId, 'geofenceEvents');

const getGeofenceAlertsRef = (hubId: string) =>
    collection(db, 'hubs', hubId, 'geofenceAlerts');

// Convert Firestore data to GeofenceZone
const convertGeofenceZone = (doc: any): GeofenceZone => {
    // Default isActive to true if not present (for backwards compatibility)
    const isActive = doc.isActive !== undefined ? doc.isActive : true;
    
    return {
        id: doc.id,
        hubId: doc.hubId,
        name: doc.name,
        description: doc.description,
        type: doc.type,
        center: doc.center,
        radius: doc.radius,
        isActive,
        createdBy: doc.createdBy,
        createdAt: doc.createdAt?.toDate() || new Date(),
        updatedAt: doc.updatedAt?.toDate() || new Date(),
        alertOnEntry: doc.alertOnEntry,
        alertOnExit: doc.alertOnExit,
        alertRecipients: doc.alertRecipients || [],
    };
};

// Convert Firestore data to GeofenceEvent
const convertGeofenceEvent = (doc: any): GeofenceEvent => ({
    id: doc.id,
    hubId: doc.hubId,
    userId: doc.userId,
    geofenceId: doc.geofenceId,
    eventType: doc.eventType,
    timestamp: doc.timestamp?.toDate() || new Date(),
    location: doc.location,
    accuracy: doc.accuracy,
    alertSent: doc.alertSent || false,
    alertSentAt: doc.alertSentAt?.toDate(),
});

// Convert Firestore data to GeofenceAlert
const convertGeofenceAlert = (doc: any): GeofenceAlert => ({
    id: doc.id,
    hubId: doc.hubId,
    userId: doc.userId,
    geofenceId: doc.geofenceId,
    eventType: doc.eventType,
    message: doc.message,
    timestamp: doc.timestamp?.toDate() || new Date(),
    isRead: doc.isRead || false,
    readAt: doc.readAt?.toDate(),
    geofenceName: doc.geofenceName,
    userName: doc.userName,
});

/**
 * Create a new geofence
 */
export const createGeofence = async (
    hubId: string,
    userId: string,
    data: CreateGeofenceRequest
): Promise<ApiResponse<GeofenceZone>> => {
    try {
        console.log('[geofence-api] Creating geofence:', { hubId, userId, data });
        const geofenceData = {
            ...data,
            hubId,
            createdBy: userId,
            isActive: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        console.log('[geofence-api] Geofence data to save:', geofenceData);
        const docRef = await addDoc(getGeofencesRef(hubId), geofenceData);
        console.log('[geofence-api] Geofence created with ID:', docRef.id);
        
        const geofence = convertGeofenceZone({
            id: docRef.id,
            ...geofenceData,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        });

        console.log('[geofence-api] Geofence created successfully:', geofence);
        return { success: true, data: geofence };
    } catch (error) {
        console.error('[geofence-api] Error creating geofence:', error);
        
        // Check if it's a permission error
        const isPermissionError = error instanceof Error && 
            (error.message.includes('permission') || 
             error.message.includes('Permission') ||
             error.message.includes('Missing or insufficient permissions'));
        
        if (isPermissionError) {
            console.error('[geofence-api] Permission denied - user may not be admin or member with create permission');
        }
        
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create geofence',
        };
    }
};

/**
 * Get all geofences for a hub
 */
export const getGeofences = async (
    hubId: string
): Promise<ApiResponse<GeofenceZone[]>> => {
    try {
        console.log('[geofence-api] Getting geofences for hub:', hubId);
        // Simplified query - filter and sort in memory to avoid index requirement
        const q = query(getGeofencesRef(hubId));

        const snapshot = await getDocs(q);
        console.log('[geofence-api] Snapshot size:', snapshot.docs.length);
        
        // Log raw documents
        snapshot.docs.forEach((doc) => {
            const data = doc.data();
            console.log('[geofence-api] Raw document:', {
                id: doc.id,
                name: data.name,
                isActive: data.isActive,
                hubId: data.hubId,
                createdBy: data.createdBy,
            });
        });
        
        const geofences = snapshot.docs
            .map((doc) => {
                const converted = convertGeofenceZone({ id: doc.id, ...doc.data() });
                console.log('[geofence-api] Converted geofence:', {
                    id: converted.id,
                    name: converted.name,
                    isActive: converted.isActive,
                });
                return converted;
            })
            .filter((geofence) => {
                const isActive = geofence.isActive;
                console.log('[geofence-api] Filtering geofence:', {
                    id: geofence.id,
                    name: geofence.name,
                    isActive,
                    willInclude: isActive,
                });
                return isActive; // Filter active geofences
            })
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Sort by createdAt desc

        console.log('[geofence-api] Final geofences count:', geofences.length);
        return { success: true, data: geofences };
    } catch (error) {
        console.error('[geofence-api] Error getting geofences:', error);
        // Silently handle permission errors
        const isPermissionError = error instanceof Error && 
            (error.message.includes('permission') || error.message.includes('Permission'));
        
        if (!isPermissionError && process.env.NODE_ENV === 'development') {
            console.warn('[geofence-api] Error getting geofences:', error);
        }
        
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get geofences',
            data: [],
        };
    }
};

/**
 * Update a geofence
 */
export const updateGeofence = async (
    hubId: string,
    geofenceId: string,
    data: UpdateGeofenceRequest
): Promise<ApiResponse<GeofenceZone>> => {
    try {
        const geofenceRef = doc(getGeofencesRef(hubId), geofenceId);
        const updateData = {
            ...data,
            updatedAt: serverTimestamp(),
        };

        await updateDoc(geofenceRef, updateData);

        // Get updated geofence
        const geofenceDoc = await getDoc(geofenceRef);
        if (!geofenceDoc.exists()) {
            return { success: false, error: 'Geofence not found' };
        }

        const geofence = convertGeofenceZone(geofenceDoc.data());
        return { success: true, data: geofence };
    } catch (error) {
        console.error('Error updating geofence:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to update geofence',
        };
    }
};

/**
 * Delete a geofence (soft delete)
 */
export const deleteGeofence = async (
    hubId: string,
    geofenceId: string
): Promise<ApiResponse<void>> => {
    try {
        const geofenceRef = doc(getGeofencesRef(hubId), geofenceId);
        await updateDoc(geofenceRef, {
            isActive: false,
            updatedAt: serverTimestamp(),
        });

        return { success: true };
    } catch (error) {
        console.error('Error deleting geofence:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to delete geofence',
        };
    }
};

/**
 * Create a geofence event
 */
export const createGeofenceEvent = async (
    hubId: string,
    eventData: Omit<GeofenceEvent, 'id' | 'hubId' | 'timestamp' | 'alertSent' | 'alertSentAt'>
): Promise<ApiResponse<GeofenceEvent>> => {
    try {
        const event = {
            ...eventData,
            hubId,
            timestamp: serverTimestamp(),
            alertSent: false,
        };

        const docRef = await addDoc(getGeofenceEventsRef(hubId), event);
        const geofenceEvent = convertGeofenceEvent({
            id: docRef.id,
            ...event,
            timestamp: Timestamp.now(),
        });

        return { success: true, data: geofenceEvent };
    } catch (error) {
        console.error('Error creating geofence event:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create geofence event',
        };
    }
};

/**
 * Create a geofence alert
 */
export const createGeofenceAlert = async (
    hubId: string,
    alertData: Omit<GeofenceAlert, 'id' | 'hubId' | 'timestamp' | 'isRead' | 'readAt'>
): Promise<ApiResponse<GeofenceAlert>> => {
    try {
        const alert = {
            ...alertData,
            hubId,
            timestamp: serverTimestamp(),
            isRead: false,
        };

        const docRef = await addDoc(getGeofenceAlertsRef(hubId), alert);
        const geofenceAlert = convertGeofenceAlert({
            id: docRef.id,
            ...alert,
            timestamp: Timestamp.now(),
        });

        return { success: true, data: geofenceAlert };
    } catch (error) {
        console.error('Error creating geofence alert:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create geofence alert',
        };
    }
};

/**
 * Get geofence alerts for a hub
 */
export const getGeofenceAlerts = async (
    hubId: string,
    limit: number = 50
): Promise<ApiResponse<GeofenceAlert[]>> => {
    try {
        const q = query(
            getGeofenceAlertsRef(hubId),
            orderBy('timestamp', 'desc')
        );

        const snapshot = await getDocs(q);
        const alerts = snapshot.docs
            .slice(0, limit)
            .map(convertGeofenceAlert);

        return { success: true, data: alerts };
    } catch (error) {
        console.error('Error getting geofence alerts:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get geofence alerts',
        };
    }
};

/**
 * Mark alert as read
 */
export const markAlertAsRead = async (
    hubId: string,
    alertId: string
): Promise<ApiResponse<void>> => {
    try {
        const alertRef = doc(getGeofenceAlertsRef(hubId), alertId);
        await updateDoc(alertRef, {
            isRead: true,
            readAt: serverTimestamp(),
        });

        return { success: true };
    } catch (error) {
        console.error('Error marking alert as read:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to mark alert as read',
        };
    }
};
