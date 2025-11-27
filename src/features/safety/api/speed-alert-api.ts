/**
 * Speed Alert API
 * 
 * Firebase operations for speed alerts
 */

import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { ApiResponse } from '@/types';
import type { SpeedAlert } from '../services/speed-monitor';

export interface SpeedAlertRecord extends SpeedAlert {
    id: string;
    hubId: string;
    resolved?: boolean;
    resolvedAt?: Date;
}

/**
 * Create a speed alert
 */
export const createSpeedAlert = async (
    hubId: string,
    alert: SpeedAlert
): Promise<ApiResponse<SpeedAlertRecord>> => {
    try {
        const alertRef = await addDoc(collection(db, 'hubs', hubId, 'speedAlerts'), {
            userId: alert.userId,
            hubId,
            speed: alert.speed,
            speedLimit: alert.speedLimit,
            location: alert.location,
            overLimit: alert.overLimit,
            timestamp: serverTimestamp(),
            resolved: false,
        });

        // Note: Push notifications should be handled by Cloud Function

        return {
            success: true,
            data: {
                id: alertRef.id,
                hubId,
                ...alert,
                resolved: false,
            },
        };
    } catch (error: any) {
        console.error('Create speed alert error:', error);
        return {
            success: false,
            error: error.message || 'Failed to create speed alert',
        };
    }
};

/**
 * Get recent speed alerts for a hub
 */
export const getSpeedAlerts = async (
    hubId: string,
    limitCount: number = 20
): Promise<ApiResponse<SpeedAlertRecord[]>> => {
    try {
        const alertsQuery = query(
            collection(db, 'hubs', hubId, 'speedAlerts'),
            orderBy('timestamp', 'desc'),
            limit(limitCount)
        );

        const snapshot = await getDocs(alertsQuery);
        const alerts: SpeedAlertRecord[] = [];

        snapshot.forEach((doc) => {
            const data = doc.data();
            alerts.push({
                id: doc.id,
                hubId: data.hubId,
                userId: data.userId,
                speed: data.speed,
                speedLimit: data.speedLimit,
                location: data.location,
                timestamp: data.timestamp?.toDate() || new Date(),
                overLimit: data.overLimit,
                resolved: data.resolved || false,
                resolvedAt: data.resolvedAt?.toDate(),
            });
        });

        return { success: true, data: alerts };
    } catch (error: any) {
        console.error('Get speed alerts error:', error);
        return {
            success: false,
            error: error.message || 'Failed to get speed alerts',
        };
    }
};


