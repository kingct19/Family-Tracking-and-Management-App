/**
 * Emergency API
 * 
 * Firebase operations for emergency alerts (SOS, crash, medical)
 */

import { collection, addDoc, doc, updateDoc, serverTimestamp, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { ApiResponse } from '@/types';

export interface EmergencyAlert {
    id: string;
    hubId: string;
    userId: string;
    location: {
        latitude: number;
        longitude: number;
        address?: string;
    };
    timestamp: Date;
    type: 'sos' | 'crash' | 'medical';
    status: 'active' | 'resolved';
    resolvedBy?: string;
    resolvedAt?: Date;
}

export interface CreateEmergencyAlertRequest {
    hubId: string;
    userId: string;
    location: {
        latitude: number;
        longitude: number;
        address?: string;
    };
    type?: 'sos' | 'crash' | 'medical';
}

/**
 * Create an emergency alert
 */
export const createEmergencyAlert = async (
    request: CreateEmergencyAlertRequest
): Promise<ApiResponse<EmergencyAlert>> => {
    try {
        const { hubId, userId, location, type = 'sos' } = request;

        const alertRef = await addDoc(collection(db, 'hubs', hubId, 'emergencyAlerts'), {
            userId,
            hubId,
            location,
            type,
            status: 'active',
            timestamp: serverTimestamp(),
        });

        // Note: Push notifications should be handled by Cloud Function
        // This triggers: functions/src/emergency-notifications.ts

        return {
            success: true,
            data: {
                id: alertRef.id,
                hubId,
                userId,
                location,
                type,
                status: 'active',
                timestamp: new Date(),
            },
        };
    } catch (error: any) {
        console.error('Create emergency alert error:', error);
        return {
            success: false,
            error: error.message || 'Failed to create emergency alert',
        };
    }
};

/**
 * Get active emergency alerts for a hub
 */
export const getActiveEmergencyAlerts = async (
    hubId: string
): Promise<ApiResponse<EmergencyAlert[]>> => {
    try {
        const alertsQuery = query(
            collection(db, 'hubs', hubId, 'emergencyAlerts'),
            where('status', '==', 'active'),
            orderBy('timestamp', 'desc'),
            limit(10)
        );

        const snapshot = await getDocs(alertsQuery);
        const alerts: EmergencyAlert[] = [];

        snapshot.forEach((doc) => {
            const data = doc.data();
            alerts.push({
                id: doc.id,
                hubId: data.hubId,
                userId: data.userId,
                location: data.location,
                type: data.type,
                status: data.status,
                timestamp: data.timestamp?.toDate() || new Date(),
            });
        });

        return { success: true, data: alerts };
    } catch (error: any) {
        console.error('Get emergency alerts error:', error);
        return {
            success: false,
            error: error.message || 'Failed to get emergency alerts',
        };
    }
};

/**
 * Resolve an emergency alert
 */
export const resolveEmergencyAlert = async (
    hubId: string,
    alertId: string,
    resolvedBy: string
): Promise<ApiResponse<void>> => {
    try {
        const alertRef = doc(db, 'hubs', hubId, 'emergencyAlerts', alertId);
        await updateDoc(alertRef, {
            status: 'resolved',
            resolvedBy,
            resolvedAt: serverTimestamp(),
        });

        return { success: true };
    } catch (error: any) {
        console.error('Resolve emergency alert error:', error);
        return {
            success: false,
            error: error.message || 'Failed to resolve emergency alert',
        };
    }
};

