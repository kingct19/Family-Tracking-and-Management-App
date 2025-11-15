/**
 * User Preferences API
 * 
 * Store and retrieve user preferences in Firestore
 */

import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { ApiResponse } from '@/types';

export interface UserPreferences {
    locationPermissionGranted: boolean;
    locationSharingEnabled: boolean;
    notificationsEnabled: boolean;
    lastUpdated: Date;
}

/**
 * Get user preferences from Firestore
 */
export const getUserPreferences = async (
    userId: string
): Promise<ApiResponse<UserPreferences | null>> => {
    try {
        const prefsRef = doc(db, 'users', userId, 'settings', 'preferences');
        const prefsSnap = await getDoc(prefsRef);

        if (!prefsSnap.exists()) {
            return { success: true, data: null };
        }

        const data = prefsSnap.data();
        return {
            success: true,
            data: {
                locationPermissionGranted: data.locationPermissionGranted || false,
                locationSharingEnabled: data.locationSharingEnabled || false,
                notificationsEnabled: data.notificationsEnabled || false,
                lastUpdated: data.lastUpdated?.toDate() || new Date(),
            },
        };
    } catch (error) {
        console.error('Error getting user preferences:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get preferences',
        };
    }
};

/**
 * Update user preferences in Firestore
 */
export const updateUserPreferences = async (
    userId: string,
    preferences: Partial<UserPreferences>
): Promise<ApiResponse<void>> => {
    try {
        const prefsRef = doc(db, 'users', userId, 'settings', 'preferences');
        
        await setDoc(
            prefsRef,
            {
                ...preferences,
                lastUpdated: new Date(),
            },
            { merge: true }
        );

        return { success: true };
    } catch (error) {
        console.error('Error updating user preferences:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to update preferences',
        };
    }
};

/**
 * Update location permission status
 */
export const updateLocationPermission = async (
    userId: string,
    granted: boolean
): Promise<ApiResponse<void>> => {
    return updateUserPreferences(userId, {
        locationPermissionGranted: granted,
    });
};

/**
 * Update location sharing preference
 */
export const updateLocationSharingPreference = async (
    userId: string,
    enabled: boolean
): Promise<ApiResponse<void>> => {
    return updateUserPreferences(userId, {
        locationSharingEnabled: enabled,
    });
};

