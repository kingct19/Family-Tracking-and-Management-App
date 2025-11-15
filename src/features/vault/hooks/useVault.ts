/**
 * Vault Hooks
 * 
 * React hooks for vault operations
 */

import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/hooks/useAuth';
import {
    createVaultItem,
    getUserVaultItems,
    getVaultItem,
    updateVaultItem,
    deleteVaultItem,
    decryptVaultItem,
} from '../api/vault-api';
import { isVaultSessionValid, clearVaultSession } from '@/lib/services/vault-storage';
import toast from 'react-hot-toast';
import type { VaultItem } from '@/types';

/**
 * Hook to get user's vault items
 */
export const useVaultItems = () => {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['vault-items', user?.id],
        queryFn: async () => {
            if (!user) throw new Error('User not authenticated');
            if (!isVaultSessionValid()) {
                throw new Error('Vault session expired');
            }
            const response = await getUserVaultItems(user.id);
            if (!response.success) throw new Error(response.error);
            return response.data || [];
        },
        enabled: !!user && isVaultSessionValid(),
        staleTime: 30 * 1000, // 30 seconds
    });
};

/**
 * Hook to create vault item
 */
export const useCreateVaultItem = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const [encryptionKey, setEncryptionKey] = useState<string | null>(null);

    const setKey = useCallback((key: string) => {
        setEncryptionKey(key);
    }, []);

    const mutation = useMutation({
        mutationFn: async (data: {
            type: VaultItem['type'];
            title: string;
            content: string;
            metadata?: Partial<VaultItem['metadata']>;
        }) => {
            if (!user || !encryptionKey) {
                throw new Error('User or encryption key not available');
            }
            const response = await createVaultItem(user.id, data, encryptionKey);
            if (!response.success) throw new Error(response.error);
            return response.data!;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vault-items', user?.id] });
            toast.success('Vault item created');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to create vault item');
        },
    });

    return {
        ...mutation,
        setEncryptionKey: setKey,
    };
};

/**
 * Hook to update vault item
 */
export const useUpdateVaultItem = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const [encryptionKey, setEncryptionKey] = useState<string | null>(null);

    const setKey = useCallback((key: string) => {
        setEncryptionKey(key);
    }, []);

    const mutation = useMutation({
        mutationFn: async ({
            itemId,
            updates,
        }: {
            itemId: string;
            updates: {
                title?: string;
                content?: string;
                metadata?: Partial<VaultItem['metadata']>;
            };
        }) => {
            if (!user || !encryptionKey) {
                throw new Error('User or encryption key not available');
            }
            const response = await updateVaultItem(user.id, itemId, updates, encryptionKey);
            if (!response.success) throw new Error(response.error);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vault-items', user?.id] });
            toast.success('Vault item updated');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to update vault item');
        },
    });

    return {
        ...mutation,
        setEncryptionKey: setKey,
    };
};

/**
 * Hook to delete vault item
 */
export const useDeleteVaultItem = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async (itemId: string) => {
            if (!user) throw new Error('User not authenticated');
            const response = await deleteVaultItem(user.id, itemId);
            if (!response.success) throw new Error(response.error);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vault-items', user?.id] });
            toast.success('Vault item deleted');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to delete vault item');
        },
    });
};

/**
 * Hook to decrypt vault item content
 */
export const useDecryptVaultItem = () => {
    const [encryptionKey, setEncryptionKey] = useState<string | null>(null);

    const setKey = useCallback((key: string) => {
        setEncryptionKey(key);
    }, []);

    const decrypt = useCallback(
        async (item: VaultItem): Promise<string> => {
            if (!encryptionKey) {
                throw new Error('Encryption key not set');
            }
            return decryptVaultItem(item, encryptionKey);
        },
        [encryptionKey]
    );

    return {
        decrypt,
        setEncryptionKey: setKey,
    };
};

