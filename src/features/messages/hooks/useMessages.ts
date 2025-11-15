/**
 * useMessages Hook
 * 
 * React hooks for real-time messaging
 */

import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
    sendMessage,
    getHubMessages,
    subscribeToHubMessages,
    markMessageAsRead,
    deleteMessage,
    type CreateMessageRequest,
} from '../api/message-api';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useHubStore } from '@/lib/store/hub-store';
import type { Message } from '@/types';

/**
 * Hook for managing hub messages
 */
export const useHubMessages = (hubId: string | undefined) => {
    const [messages, setMessages] = useState<Message[]>([]);

    // Query for initial load
    const { isLoading, error } = useQuery({
        queryKey: ['messages', hubId],
        queryFn: async () => {
            if (!hubId) throw new Error('Hub ID is required');
            const response = await getHubMessages(hubId);
            if (!response.success) throw new Error(response.error);
            return response.data || [];
        },
        enabled: !!hubId,
        staleTime: 0, // Always refetch, we use real-time subscription
    });

    // Subscribe to real-time updates
    useEffect(() => {
        if (!hubId) return;

        const unsubscribe = subscribeToHubMessages(
            hubId,
            (updatedMessages) => {
                setMessages(updatedMessages);
            },
            (error) => {
                console.error('Message subscription error:', error);
            }
        );

        return unsubscribe;
    }, [hubId]);

    // Use real-time messages if available, otherwise fallback to query data
    const finalMessages = messages.length > 0 ? messages : [];

    return {
        messages: finalMessages,
        isLoading,
        error,
    };
};

/**
 * Hook for sending messages
 */
export const useSendMessage = () => {
    const { user } = useAuth();
    const { currentHub } = useHubStore();

    const mutation = useMutation({
        mutationFn: async (text: string) => {
            if (!user || !currentHub) {
                throw new Error('User or hub not available');
            }

            const request: CreateMessageRequest = {
                hubId: currentHub.id,
                senderId: user.id,
                senderName: user.email?.split('@')[0] || 'User',
                text: text.trim(),
                type: 'text',
            };

            const response = await sendMessage(request);
            if (!response.success) {
                throw new Error(response.error);
            }
            return response.data!;
        },
    });

    return {
        sendMessage: mutation.mutate,
        sendMessageAsync: mutation.mutateAsync,
        isSending: mutation.isPending,
        error: mutation.error,
    };
};

/**
 * Hook for marking messages as read
 */
export const useMarkMessageAsRead = () => {
    const { user } = useAuth();
    const { currentHub } = useHubStore();

    const mutation = useMutation({
        mutationFn: async (messageId: string) => {
            if (!user || !currentHub) {
                throw new Error('User or hub not available');
            }

            const response = await markMessageAsRead(
                currentHub.id,
                messageId,
                user.id
            );

            if (!response.success) {
                throw new Error(response.error);
            }
        },
    });

    return {
        markAsRead: mutation.mutate,
        markAsReadAsync: mutation.mutateAsync,
        isMarking: mutation.isPending,
        error: mutation.error,
    };
};

/**
 * Hook for deleting messages
 */
export const useDeleteMessage = () => {
    const { user } = useAuth();
    const { currentHub } = useHubStore();

    const mutation = useMutation({
        mutationFn: async (messageId: string) => {
            if (!user || !currentHub) {
                throw new Error('User or hub not available');
            }

            const response = await deleteMessage(
                currentHub.id,
                messageId,
                user.id
            );

            if (!response.success) {
                throw new Error(response.error);
            }
        },
    });

    return {
        deleteMessage: mutation.mutate,
        deleteMessageAsync: mutation.mutateAsync,
        isDeleting: mutation.isPending,
        error: mutation.error,
    };
};
