/**
 * Check-in API
 * 
 * Firestore operations for location check-ins
 * - Create check-in events at current location
 * - Get check-in history for users
 */

import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    Timestamp,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { ApiResponse } from '@/types';
import type { LocationCoordinates } from '../services/location-service';

export interface CheckIn {
    id: string;
    hubId: string;
    userId: string;
    userName?: string;
    location: {
        latitude: number;
        longitude: number;
    };
    accuracy: number;
    timestamp: Date;
    note?: string;
    address?: string;
}

export interface CreateCheckInRequest {
    hubId: string;
    userId: string;
    userName?: string;
    coordinates: LocationCoordinates;
    note?: string;
    address?: string;
}

// Collection references
const getCheckInsRef = (hubId: string) =>
    collection(db, 'hubs', hubId, 'checkIns');

// Convert Firestore data to CheckIn
const convertCheckIn = (doc: any): CheckIn => ({
    id: doc.id,
    hubId: doc.hubId,
    userId: doc.userId,
    userName: doc.userName,
    location: doc.location,
    accuracy: doc.accuracy,
    timestamp: doc.timestamp?.toDate() || new Date(),
    note: doc.note,
    address: doc.address,
});

/**
 * Create a check-in event
 */
export const createCheckIn = async (
    data: CreateCheckInRequest
): Promise<ApiResponse<CheckIn>> => {
    try {
        const { hubId, userId, userName, coordinates, note, address } = data;

        const checkInData = {
            hubId,
            userId,
            userName: userName || null,
            location: {
                latitude: coordinates.latitude,
                longitude: coordinates.longitude,
            },
            accuracy: coordinates.accuracy || 0,
            timestamp: serverTimestamp(),
            note: note || null,
            address: address || null,
        };

        const docRef = await addDoc(getCheckInsRef(hubId), checkInData);
        const checkIn = convertCheckIn({
            id: docRef.id,
            ...checkInData,
            timestamp: Timestamp.now(),
        });

        return { success: true, data: checkIn };
    } catch (error) {
        console.error('Error creating check-in:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create check-in',
        };
    }
};

/**
 * Get check-in history for a user
 */
export const getUserCheckIns = async (
    hubId: string,
    userId: string,
    limitCount: number = 50
): Promise<ApiResponse<CheckIn[]>> => {
    try {
        const q = query(
            getCheckInsRef(hubId),
            where('userId', '==', userId),
            orderBy('timestamp', 'desc'),
            limit(limitCount)
        );

        const snapshot = await getDocs(q);
        const checkIns = snapshot.docs.map(convertCheckIn);

        return { success: true, data: checkIns };
    } catch (error) {
        console.error('Error getting check-ins:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get check-ins',
            data: [],
        };
    }
};

/**
 * Get all check-ins for a hub
 */
export const getHubCheckIns = async (
    hubId: string,
    limitCount: number = 100
): Promise<ApiResponse<CheckIn[]>> => {
    try {
        const q = query(
            getCheckInsRef(hubId),
            orderBy('timestamp', 'desc'),
            limit(limitCount)
        );

        const snapshot = await getDocs(q);
        const checkIns = snapshot.docs.map(convertCheckIn);

        return { success: true, data: checkIns };
    } catch (error) {
        console.error('Error getting hub check-ins:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get check-ins',
            data: [],
        };
    }
};

