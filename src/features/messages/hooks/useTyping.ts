import { useEffect, useRef, useState, useCallback } from 'react';
import { setTypingStatus, clearTypingStatus, subscribeToTypingStatus, type TypingStatus } from '../api/typing-api';
import { useAuthStore } from '@/lib/store/auth-store';

/**
 * Hook to manage typing indicators
 */
export const useTyping = (hubId: string | undefined) => {
    const { user } = useAuthStore();
    const [typingUsers, setTypingUsers] = useState<TypingStatus[]>([]);
    const typingTimeoutRef = useRef<NodeJS.Timeout>();

    // Subscribe to typing status updates
    useEffect(() => {
        if (!hubId) return;

        const unsubscribe = subscribeToTypingStatus(hubId, (users) => {
            // Filter out current user and stale entries (> 5 seconds old)
            const now = Date.now();
            const activeTypingUsers = users.filter((u) => {
                const age = now - u.timestamp.getTime();
                return u.userId !== user?.id && age < 5000;
            });
            setTypingUsers(activeTypingUsers);
        });

        return unsubscribe;
    }, [hubId, user?.id]);

    // Set typing status
    const setTyping = useCallback(async () => {
        if (!hubId || !user) return;

        // Clear any existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set typing status
        await setTypingStatus(hubId, user.id, user.displayName || 'Unknown');

        // Auto-clear after 3 seconds
        typingTimeoutRef.current = setTimeout(async () => {
            await clearTypingStatus(hubId, user.id);
        }, 3000);
    }, [hubId, user]);

    // Clear typing status
    const clearTyping = useCallback(async () => {
        if (!hubId || !user) return;

        // Clear timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Clear typing status
        await clearTypingStatus(hubId, user.id);
    }, [hubId, user]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    return {
        typingUsers,
        setTyping,
        clearTyping,
    };
};

