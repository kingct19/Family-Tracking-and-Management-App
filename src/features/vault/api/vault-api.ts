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

        // Build metadata object, only including defined values (Firestore doesn't allow undefined)
        const metadata: any = {
            tags: data.metadata?.tags || [],
            favorite: data.metadata?.favorite || false,
        };
        
        if (data.metadata?.icon) {
            metadata.icon = data.metadata.icon;
        }
        if (data.metadata?.category) {
            metadata.category = data.metadata.category;
        }
        if (data.metadata?.fileURL) {
            metadata.fileURL = data.metadata.fileURL;
        }
        if (data.metadata?.fileName) {
            metadata.fileName = data.metadata.fileName;
        }
        if (data.metadata?.fileType) {
            metadata.fileType = data.metadata.fileType;
        }

        const vaultItem: Omit<VaultItem, 'id' | 'createdAt' | 'updatedAt'> = {
            userId,
            type: data.type,
            title: data.title,
            ciphertext,
            metadata,
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

            // Re-encrypt with new content (reuse salt but generate new IV for security)
            const encryptResult = await encrypt(updates.content, encryptionKey, 
                Uint8Array.from(atob(salt), (c) => c.charCodeAt(0))
            );
            updateData.ciphertext = encryptResult.ciphertext;
            // IMPORTANT: iv is stored at document level, not inside metadata
            updateData.iv = encryptResult.iv;
        }

        if (updates.metadata !== undefined) {
            // Build metadata object, only including defined values (Firestore doesn't allow undefined)
            // NOTE: salt and iv are stored at document level, NOT in metadata
            const newMetadata: any = {
                // Preserve existing optional fields if they exist
                ...(existingItem.metadata.icon && { icon: existingItem.metadata.icon }),
                ...(existingItem.metadata.category && { category: existingItem.metadata.category }),
                ...(existingItem.metadata.fileURL && { fileURL: existingItem.metadata.fileURL }),
                ...(existingItem.metadata.fileName && { fileName: existingItem.metadata.fileName }),
                ...(existingItem.metadata.fileType && { fileType: existingItem.metadata.fileType }),
                // Preserve tags and favorite
                tags: existingItem.metadata.tags || [],
                favorite: existingItem.metadata.favorite || false,
            };
            
            // Only include fields that are actually provided (not undefined)
            if (updates.metadata.icon !== undefined && updates.metadata.icon !== null) {
                newMetadata.icon = updates.metadata.icon;
            } else if (updates.metadata.icon === null) {
                // Explicitly remove icon if set to null
                delete newMetadata.icon;
            }
            
            if (updates.metadata.category !== undefined && updates.metadata.category !== null) {
                newMetadata.category = updates.metadata.category;
            } else if (updates.metadata.category === null) {
                // Explicitly remove category if set to null
                delete newMetadata.category;
            }
            
            // Handle file URL fields
            if (updates.metadata.fileURL !== undefined && updates.metadata.fileURL !== null) {
                newMetadata.fileURL = updates.metadata.fileURL;
            } else if (updates.metadata.fileURL === null) {
                delete newMetadata.fileURL;
            }
            
            if (updates.metadata.fileName !== undefined && updates.metadata.fileName !== null) {
                newMetadata.fileName = updates.metadata.fileName;
            } else if (updates.metadata.fileName === null) {
                delete newMetadata.fileName;
            }
            
            if (updates.metadata.fileType !== undefined && updates.metadata.fileType !== null) {
                newMetadata.fileType = updates.metadata.fileType;
            } else if (updates.metadata.fileType === null) {
                delete newMetadata.fileType;
            }
            
            if (updates.metadata.tags !== undefined) {
                newMetadata.tags = updates.metadata.tags;
            }
            
            if (updates.metadata.favorite !== undefined) {
                newMetadata.favorite = updates.metadata.favorite;
            }
            
            updateData.metadata = newMetadata;
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
    
    if (!item.ciphertext) {
        return ''; // Return empty string for items with no encrypted content
    }
    
    return await decrypt(item.ciphertext, encryptionKey, salt, iv);
};

