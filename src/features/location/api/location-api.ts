/**
 * Location API
 * 
 * Firebase Firestore operations for location tracking
 * - Store user locations with 30-day retention
 * - Fetch real-time locations for hub members
 * - Update location sharing preferences
 */

import {
    collection,
    doc,
    setDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    Timestamp,
    deleteDoc,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { geocodingService } from '@/lib/services/geocoding-service';
import type { LocationCoordinates } from '../services/location-service';
import type { ApiResponse } from '@/types';

export interface UserLocation {
    userId: string;
    hubId: string;
    latitude: number;
    longitude: number;
    accuracy: number;
    speed?: number | null;
    heading?: number | null;
    timestamp: Date;
    isSharing: boolean;
    address?: string;
    addressDetails?: {
        formatted: string;
        street?: string;
        city?: string;
        state?: string;
        zipCode?: string;
        country?: string;
    };
}

export interface LocationUpdate {
    hubId: string;
    userId: string;
    coordinates: LocationCoordinates;
    isSharing: boolean;
}

/**
 * Update user's current location in Firestore
 */
export const updateUserLocation = async (
    update: LocationUpdate
): Promise<ApiResponse<void>> => {
    try {
        const { hubId, userId, coordinates, isSharing } = update;

        // Get address (non-blocking - don't fail if geocoding fails)
        let address: string | undefined;
        let addressDetails: UserLocation['addressDetails'] | undefined;
        
        try {
            const geocodeResult = await geocodingService.reverseGeocode(
                coordinates.latitude,
                coordinates.longitude
            );
            if (geocodeResult) {
                address = geocodeResult.formatted;
                addressDetails = {
                    formatted: geocodeResult.formatted,
                    street: geocodeResult.street,
                    city: geocodeResult.city,
                    state: geocodeResult.state,
                    zipCode: geocodeResult.zipCode,
                    country: geocodeResult.country,
                };
            }
        } catch (geocodeError) {
            // Don't fail location update if geocoding fails
            console.warn('Geocoding failed, continuing without address:', geocodeError);
        }

        // Store in current location collection
        const locationRef = doc(db, 'hubs', hubId, 'locations', userId);
        await setDoc(locationRef, {
            userId,
            hubId,
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
            accuracy: coordinates.accuracy,
            speed: coordinates.speed,
            heading: coordinates.heading,
            timestamp: Timestamp.fromMillis(coordinates.timestamp),
            isSharing,
            address: address || null,
            addressDetails: addressDetails || null,
            updatedAt: Timestamp.now(),
        });

        // Store in location history (for 30-day retention)
        const historyRef = doc(
            collection(db, 'hubs', hubId, 'locations', userId, 'history')
        );
        await setDoc(historyRef, {
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
            accuracy: coordinates.accuracy,
            speed: coordinates.speed,
            heading: coordinates.heading,
            timestamp: Timestamp.fromMillis(coordinates.timestamp),
        });

        return { success: true };
    } catch (error) {
        console.error('Error updating location:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to update location',
        };
    }
};

/**
 * Get all current locations for hub members
 */
export const getHubLocations = async (
    hubId: string
): Promise<ApiResponse<UserLocation[]>> => {
    try {
        const locationsQuery = query(
            collection(db, 'hubs', hubId, 'locations'),
            where('isSharing', '==', true)
        );

        const snapshot = await getDocs(locationsQuery);
        const locations: UserLocation[] = [];

        snapshot.forEach((doc) => {
            const data = doc.data();
            locations.push({
                userId: data.userId,
                hubId: data.hubId,
                latitude: data.latitude,
                longitude: data.longitude,
                accuracy: data.accuracy,
                speed: data.speed,
                heading: data.heading,
                timestamp: data.timestamp?.toDate() || new Date(),
                isSharing: data.isSharing,
                address: data.address,
                addressDetails: data.addressDetails,
            });
        });

        return { success: true, data: locations };
    } catch (error) {
        console.error('Error getting hub locations:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get locations',
        };
    }
};

/**
 * Get location history for a specific user
 */
export const getUserLocationHistory = async (
    hubId: string,
    userId: string,
    limitCount: number = 100
): Promise<ApiResponse<LocationCoordinates[]>> => {
    try {
        const historyQuery = query(
            collection(db, 'hubs', hubId, 'locations', userId, 'history'),
            orderBy('timestamp', 'desc'),
            limit(limitCount)
        );

        const snapshot = await getDocs(historyQuery);
        const history: LocationCoordinates[] = [];

        snapshot.forEach((doc) => {
            const data = doc.data();
            history.push({
                latitude: data.latitude,
                longitude: data.longitude,
                accuracy: data.accuracy,
                speed: data.speed,
                heading: data.heading,
                altitude: null,
                altitudeAccuracy: null,
                timestamp: data.timestamp?.toMillis() || Date.now(),
            });
        });

        return { success: true, data: history };
    } catch (error) {
        console.error('Error getting location history:', error);
        return {
            success: false,
            error:
                error instanceof Error ? error.message : 'Failed to get location history',
        };
    }
};

/**
 * Subscribe to real-time location updates for a hub
 */
export const subscribeToHubLocations = (
    hubId: string,
    onUpdate: (locations: UserLocation[]) => void,
    onError?: (error: Error) => void
): (() => void) => {
    const locationsQuery = query(
        collection(db, 'hubs', hubId, 'locations'),
        where('isSharing', '==', true)
    );

    const unsubscribe = onSnapshot(
        locationsQuery,
        (snapshot) => {
            const locations: UserLocation[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                locations.push({
                    userId: data.userId,
                    hubId: data.hubId,
                    latitude: data.latitude,
                    longitude: data.longitude,
                    accuracy: data.accuracy,
                    speed: data.speed,
                    heading: data.heading,
                    timestamp: data.timestamp?.toDate() || new Date(),
                    isSharing: data.isSharing,
                    address: data.address,
                    addressDetails: data.addressDetails,
                });
            });
            onUpdate(locations);
        },
        (error) => {
            console.error('Error in location subscription:', error);
            onError?.(error);
        }
    );

    return unsubscribe;
};

/**
 * Update location sharing preference
 */
export const updateLocationSharing = async (
    hubId: string,
    userId: string,
    isSharing: boolean
): Promise<ApiResponse<void>> => {
    try {
        const locationRef = doc(db, 'hubs', hubId, 'locations', userId);
        await setDoc(
            locationRef,
            {
                isSharing,
                updatedAt: Timestamp.now(),
            },
            { merge: true }
        );

        return { success: true };
    } catch (error) {
        console.error('Error updating location sharing:', error);
        return {
            success: false,
            error:
                error instanceof Error ? error.message : 'Failed to update sharing preference',
        };
    }
};

/**
 * Delete old location history (cleanup function)
 * Should be called periodically to maintain 30-day retention
 */
export const deleteOldLocationHistory = async (
    hubId: string,
    userId: string,
    daysToKeep: number = 30
): Promise<ApiResponse<number>> => {
    try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

        const historyQuery = query(
            collection(db, 'hubs', hubId, 'locations', userId, 'history'),
            where('timestamp', '<', Timestamp.fromDate(cutoffDate))
        );

        const snapshot = await getDocs(historyQuery);
        let deletedCount = 0;

        // Delete old records
        const deletePromises = snapshot.docs.map((doc) => {
            deletedCount++;
            return deleteDoc(doc.ref);
        });

        await Promise.all(deletePromises);

        return { success: true, data: deletedCount };
    } catch (error) {
        console.error('Error deleting old location history:', error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to delete old location history',
        };
    }
};

