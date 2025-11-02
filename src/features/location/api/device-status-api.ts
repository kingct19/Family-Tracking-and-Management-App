/**
 * Device Status API
 * 
 * Firestore operations for device status updates
 */

import { collection, doc, setDoc, serverTimestamp, getDoc, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { DeviceStatus } from '../services/device-monitor';
import type { ApiResponse } from '@/types';

export interface DeviceStatusDocument {
    userId: string;
    hubId: string;
    batteryLevel: number | null;
    isCharging: boolean | null;
    isOnline: boolean;
    lastSeen: Date;
    platform: string;
    connectionType?: 'wifi' | 'cellular' | 'ethernet' | 'unknown';
    updatedAt: Date;
}

/**
 * Update device status in Firestore
 */
export async function updateDeviceStatus(
    userId: string,
    hubId: string,
    status: DeviceStatus
): Promise<ApiResponse<void>> {
    try {
        const statusRef = doc(db, 'hubs', hubId, 'deviceStatus', userId);
        
        const statusData: DeviceStatusDocument = {
            userId,
            hubId,
            batteryLevel: status.batteryLevel,
            isCharging: status.isCharging,
            isOnline: status.isOnline,
            lastSeen: status.lastSeen,
            platform: status.platform,
            connectionType: status.connectionType,
            updatedAt: new Date(),
        };

        await setDoc(statusRef, {
            ...statusData,
            lastSeen: status.lastSeen,
            updatedAt: serverTimestamp(),
        }, { merge: true });

        return { success: true };
    } catch (error) {
        // Silently handle permission errors (rules may not be deployed yet)
        // Device status monitoring works locally even if Firestore write fails
        const isPermissionError = error instanceof Error && 
            (error.message.includes('permission') || error.message.includes('Permission'));
        
        if (!isPermissionError && process.env.NODE_ENV === 'development') {
            console.warn('Update device status error:', error);
        }
        
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to update device status',
        };
    }
}

/**
 * Get device status for a user
 */
export async function getDeviceStatus(
    hubId: string,
    userId: string
): Promise<ApiResponse<DeviceStatusDocument | null>> {
    try {
        const statusRef = doc(db, 'hubs', hubId, 'deviceStatus', userId);
        const statusSnap = await getDoc(statusRef);

        if (!statusSnap.exists()) {
            return { success: true, data: null };
        }

        const data = statusSnap.data();
        return {
            success: true,
            data: {
                ...data,
                lastSeen: data.lastSeen?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
            } as DeviceStatusDocument,
        };
    } catch (error) {
        // Silently handle permission errors
        const isPermissionError = error instanceof Error && 
            (error.message.includes('permission') || error.message.includes('Permission'));
        
        if (!isPermissionError && process.env.NODE_ENV === 'development') {
            console.warn('Get device status error:', error);
        }
        
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get device status',
            data: null,
        };
    }
}

/**
 * Subscribe to device status updates for all hub members
 */
export function subscribeToHubDeviceStatus(
    hubId: string,
    onUpdate: (statuses: Map<string, DeviceStatusDocument>) => void,
    onError?: (error: Error) => void
): () => void {
    try {
        const statusCollection = collection(db, 'hubs', hubId, 'deviceStatus');
        const statusQuery = query(statusCollection);

        const unsubscribe = onSnapshot(
            statusQuery,
            (snapshot) => {
                const statusMap = new Map<string, DeviceStatusDocument>();

                snapshot.forEach((doc) => {
                    const data = doc.data();
                    statusMap.set(doc.id, {
                        ...data,
                        lastSeen: data.lastSeen?.toDate() || new Date(),
                        updatedAt: data.updatedAt?.toDate() || new Date(),
                    } as DeviceStatusDocument);
                });

                onUpdate(statusMap);
            },
            (error) => {
                // Silently handle permission errors
                const isPermissionError = error instanceof Error && 
                    (error.message.includes('permission') || error.message.includes('Permission'));
                
                if (!isPermissionError && process.env.NODE_ENV === 'development') {
                    console.warn('Device status subscription error:', error);
                }
                
                if (onError) {
                    onError(error);
                }
            }
        );

        return unsubscribe;
    } catch (error) {
        // Silently handle permission errors
        const isPermissionError = error instanceof Error && 
            (error.message.includes('permission') || error.message.includes('Permission'));
        
        if (!isPermissionError && process.env.NODE_ENV === 'development') {
            console.warn('Failed to subscribe to device status:', error);
        }
        
        if (onError) {
            onError(error instanceof Error ? error : new Error('Unknown error'));
        }
        return () => {}; // Return no-op unsubscribe
    }
}
