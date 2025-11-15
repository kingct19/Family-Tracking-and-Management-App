/**
 * Vault API
 * 
 * CRUD operations for vault items
 * All data is encrypted client-side before storage
 */

import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    collection,
    query,
    where,
    orderBy,
    getDocs,
    serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { VaultItem, ApiResponse } from '@/types';
import { encrypt, decrypt } from '@/lib/services/encryption-service';
import { isVaultSessionValid, extendVaultSession } from '@/lib/services/vault-storage';

/**
 * Create a new vault item
 */
export const createVaultItem = async (
    userId: string,
    data: {
        type: VaultItem['type'];
        title: string;
        content: string; // Plain text content to encrypt
        metadata?: Partial<VaultItem['metadata']>;
    },
    encryptionKey: string // User's PIN/password for encryption
): Promise<ApiResponse<VaultItem>> => {
    try {
        // Check session
        if (!isVaultSessionValid()) {
            return {
                success: false,
                error: 'Vault session expired. Please authenticate again.',
            };
        }

        // Encrypt content
        const { ciphertext, salt, iv } = await encrypt(data.content, encryptionKey);

        const vaultRef = doc(collection(db, 'vault', userId, 'items'));

        const vaultItem: Omit<VaultItem, 'id' | 'createdAt' | 'updatedAt'> = {
            userId,
            type: data.type,
            title: data.title,
            ciphertext,
            metadata: {
                icon: data.metadata?.icon,
                category: data.metadata?.category,
                tags: data.metadata?.tags || [],
                favorite: data.metadata?.favorite || false,
            },
        };

        // Store salt and iv separately (needed for decryption)
        await setDoc(vaultRef, {
            ...vaultItem,
            salt, // Store salt separately
            iv, // Store iv separately
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        extendVaultSession();

        // Fetch the created document to return complete data
        const createdDoc = await getDoc(vaultRef);
        const createdData = createdDoc.data();
        
        return {
            success: true,
            data: {
                id: vaultRef.id,
                ...vaultItem,
                createdAt: createdData?.createdAt?.toDate() || new Date(),
                updatedAt: createdData?.updatedAt?.toDate() || new Date(),
            } as VaultItem,
        };
    } catch (error: any) {
        console.error('Create vault item error:', error);
        return {
            success: false,
            error: 'Failed to create vault item',
        };
    }
};

/**
 * Get all vault items for a user
 */
export const getUserVaultItems = async (
    userId: string
): Promise<ApiResponse<VaultItem[]>> => {
    try {
        if (!isVaultSessionValid()) {
            return {
                success: false,
                error: 'Vault session expired. Please authenticate again.',
            };
        }

        const vaultQuery = query(
            collection(db, 'vault', userId, 'items'),
            orderBy('updatedAt', 'desc')
        );
        const snapshot = await getDocs(vaultQuery);

        const items: VaultItem[] = [];
        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            items.push({
                id: docSnap.id,
                userId: data.userId,
                type: data.type,
                title: data.title,
                ciphertext: data.ciphertext,
                metadata: {
                    ...data.metadata,
                    // Store salt/iv in metadata for decryption
                    salt: data.salt,
                    iv: data.iv,
                } as any,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
                accessedAt: data.accessedAt?.toDate(),
            });
        });

        extendVaultSession();

        return {
            success: true,
            data: items,
        };
    } catch (error: any) {
        console.error('Get vault items error:', error);
        return {
            success: false,
            error: 'Failed to fetch vault items',
        };
    }
};

/**
 * Get a single vault item
 */
export const getVaultItem = async (
    userId: string,
    itemId: string
): Promise<ApiResponse<VaultItem>> => {
    try {
        if (!isVaultSessionValid()) {
            return {
                success: false,
                error: 'Vault session expired. Please authenticate again.',
            };
        }

        const itemDoc = await getDoc(doc(db, 'vault', userId, 'items', itemId));

        if (!itemDoc.exists()) {
            return {
                success: false,
                error: 'Vault item not found',
            };
        }

        const data = itemDoc.data();
        const item: VaultItem = {
            id: itemDoc.id,
            userId: data.userId,
            type: data.type,
            title: data.title,
            ciphertext: data.ciphertext,
            metadata: {
                ...data.metadata,
                // Store salt/iv in metadata for decryption
                salt: data.salt,
                iv: data.iv,
            } as any,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            accessedAt: data.accessedAt?.toDate(),
        };

        // Update accessedAt
        await updateDoc(doc(db, 'vault', userId, 'items', itemId), {
            accessedAt: serverTimestamp(),
        });

        extendVaultSession();

        return {
            success: true,
            data: item,
        };
    } catch (error: any) {
        console.error('Get vault item error:', error);
        return {
            success: false,
            error: 'Failed to fetch vault item',
        };
    }
};

/**
 * Update a vault item
 */
export const updateVaultItem = async (
    userId: string,
    itemId: string,
    updates: {
        title?: string;
        content?: string; // Plain text content to encrypt
        metadata?: Partial<VaultItem['metadata']>;
    },
    encryptionKey: string
): Promise<ApiResponse<void>> => {
    try {
        if (!isVaultSessionValid()) {
            return {
                success: false,
                error: 'Vault session expired. Please authenticate again.',
            };
        }

        const updateData: any = {
            updatedAt: serverTimestamp(),
        };

        // Get existing item once for salt/iv and metadata merge
        const itemResponse = await getVaultItem(userId, itemId);
        if (!itemResponse.success || !itemResponse.data) {
            return {
                success: false,
                error: 'Failed to get vault item for update',
            };
        }

        const existingItem = itemResponse.data;
        const existingMetadata = existingItem.metadata as any;

        if (updates.title !== undefined) {
            updateData.title = updates.title;
        }

        if (updates.content !== undefined) {
            const salt = existingMetadata.salt;
            const iv = existingMetadata.iv;

            // Re-encrypt with new content (reuse salt/iv for same item)
            const { ciphertext } = await encrypt(updates.content, encryptionKey, 
                Uint8Array.from(atob(salt), (c) => c.charCodeAt(0))
            );
            updateData.ciphertext = ciphertext;
        }

        if (updates.metadata !== undefined) {
            updateData.metadata = {
                ...existingItem.metadata,
                ...updates.metadata,
                // Preserve salt/iv
                salt: existingMetadata.salt,
                iv: existingMetadata.iv,
            } as any;
        }

        await updateDoc(doc(db, 'vault', userId, 'items', itemId), updateData);

        extendVaultSession();

        return { success: true };
    } catch (error: any) {
        console.error('Update vault item error:', error);
        return {
            success: false,
            error: 'Failed to update vault item',
        };
    }
};

/**
 * Delete a vault item
 */
export const deleteVaultItem = async (
    userId: string,
    itemId: string
): Promise<ApiResponse<void>> => {
    try {
        if (!isVaultSessionValid()) {
            return {
                success: false,
                error: 'Vault session expired. Please authenticate again.',
            };
        }

        await deleteDoc(doc(db, 'vault', userId, 'items', itemId));

        extendVaultSession();

        return { success: true };
    } catch (error: any) {
        console.error('Delete vault item error:', error);
        return {
            success: false,
            error: 'Failed to delete vault item',
        };
    }
};

/**
 * Decrypt vault item content
 */
export const decryptVaultItem = async (
    item: VaultItem,
    encryptionKey: string
): Promise<string> => {
    // Get salt and iv from metadata (stored there for decryption)
    const metadata = item.metadata as any;
    const salt = metadata.salt;
    const iv = metadata.iv;
    
    if (!salt || !iv) {
        throw new Error('Missing encryption parameters');
    }
    
    return decrypt(item.ciphertext, encryptionKey, salt, iv);
};

