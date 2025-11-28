import { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
    createBroadcast, 
    getHubBroadcasts, 
    subscribeToHubBroadcasts,
    acknowledgeBroadcast,
    getUnreadBroadcastsCount,
    type BroadcastPriority,
    type BroadcastType,
    type BroadcastAlert
} from '../api/broadcast-api';
import { useHubStore } from '@/lib/store/hub-store';
import { useAuthStore } from '@/lib/store/auth-store';
import { messageNotificationService } from '../services/message-notification-service';
import toast from 'react-hot-toast';

/**
 * Hook to fetch broadcasts for current hub (real-time)
 */
export const useHubBroadcasts = () => {
    const { currentHub } = useHubStore();
    const { user } = useAuthStore();
    const [broadcasts, setBroadcasts] = useState<BroadcastAlert[]>([]);
    const previousBroadcastsRef = useRef<Set<string>>(new Set());

    // Query for initial load
    const { isLoading, error } = useQuery({
        queryKey: ['broadcasts', currentHub?.id],
        queryFn: async () => {
            if (!currentHub) {
                return [];
            }
            const response = await getHubBroadcasts(currentHub.id);
            return response.success ? response.data || [] : [];
        },
        enabled: !!currentHub,
        staleTime: 0, // Always refetch, we use real-time subscription
    });

    // Subscribe to real-time updates
    useEffect(() => {
        if (!currentHub) return;

        const unsubscribe = subscribeToHubBroadcasts(
            currentHub.id,
            (updatedBroadcasts) => {
                // Detect new broadcasts (not in previous set)
                const previousIds = previousBroadcastsRef.current;
                const newBroadcasts = updatedBroadcasts.filter(
                    b => !previousIds.has(b.id)
                );

                // Show notifications for new broadcasts (not sent by current user)
                newBroadcasts.forEach(broadcast => {
                    if (broadcast.senderId !== user?.id) {
                        messageNotificationService.showBroadcastNotification(
                            currentHub.id,
                            broadcast.senderName,
                            broadcast.title,
                            broadcast.message,
                            broadcast.priority
                        );
                    }
                });

                // Update previous set
                previousBroadcastsRef.current = new Set(updatedBroadcasts.map(b => b.id));
                setBroadcasts(updatedBroadcasts);
            },
            (error) => {
                console.error('Broadcast subscription error:', error);
            }
        );

        return unsubscribe;
    }, [currentHub?.id, user?.id]);

    return {
        data: broadcasts,
        isLoading,
        error,
    };
};

/**
 * Hook to get unread broadcasts count
 */
export const useUnreadBroadcastsCount = () => {
    const { currentHub } = useHubStore();
    const { user } = useAuthStore();

    return useQuery({
        queryKey: ['broadcasts', 'unread', currentHub?.id, user?.id],
        queryFn: async () => {
            if (!currentHub || !user) {
                return 0;
            }
            const response = await getUnreadBroadcastsCount(currentHub.id, user.id);
            return response.success ? response.data || 0 : 0;
        },
        enabled: !!currentHub && !!user,
        staleTime: 1000 * 30, // 30 seconds
        refetchInterval: 1000 * 60, // Refetch every minute
    });
};

/**
 * Hook to create a new broadcast
 */
export const useCreateBroadcast = () => {
    const queryClient = useQueryClient();
    const { currentHub } = useHubStore();
    const { user } = useAuthStore();

    return useMutation({
        mutationFn: async (data: {
            title: string;
            message: string;
            priority: BroadcastPriority;
            type: BroadcastType;
            expiresAt?: Date;
        }) => {
            if (!currentHub || !user) {
                throw new Error('Hub or user not found');
            }

            const response = await createBroadcast({
                hubId: currentHub.id,
                senderId: user.id,
                senderName: user.displayName || user.email,
                ...data,
            });

            if (!response.success) {
                throw new Error(response.error);
            }

            return response.data;
        },
        onSuccess: (data) => {
            // Invalidate broadcasts query
            queryClient.invalidateQueries({ queryKey: ['broadcasts', currentHub?.id] });
            queryClient.invalidateQueries({ queryKey: ['broadcasts', 'unread'] });

            // Show success toast based on priority
            if (data?.priority === 'urgent') {
                toast.success('🚨 Emergency alert sent!', {
                    duration: 5000,
                });
            } else {
                toast.success('Broadcast sent successfully');
            }
        },
        onError: (error: Error) => {
            console.error('Create broadcast error:', error);
            toast.error(error.message || 'Failed to send broadcast');
        },
    });
};

/**
 * Hook to acknowledge a broadcast
 */
export const useAcknowledgeBroadcast = () => {
    const queryClient = useQueryClient();
    const { currentHub } = useHubStore();
    const { user } = useAuthStore();

    return useMutation({
        mutationFn: async (broadcastId: string) => {
            if (!user || !currentHub) {
                throw new Error('User or hub not found');
            }

            const response = await acknowledgeBroadcast(currentHub.id, broadcastId, user.id);

            if (!response.success) {
                throw new Error(response.error);
            }

            return broadcastId;
        },
        onSuccess: () => {
            // Invalidate queries to update UI
            queryClient.invalidateQueries({ queryKey: ['broadcasts', currentHub?.id] });
            queryClient.invalidateQueries({ queryKey: ['broadcasts', 'unread'] });
        },
        onError: (error: Error) => {
            console.error('Acknowledge broadcast error:', error);
            toast.error('Failed to acknowledge broadcast');
        },
    });
};
