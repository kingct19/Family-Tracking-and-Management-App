import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Cache for 5 minutes by default
            staleTime: 5 * 60 * 1000,
            // Keep in cache for 10 minutes
            gcTime: 10 * 60 * 1000,
            // Retry failed requests 3 times
            retry: 3,
            // Don't refetch on window focus by default
            refetchOnWindowFocus: false,
            // Don't refetch on reconnect by default
            refetchOnReconnect: false
        },
        mutations: {
            // Retry failed mutations once
            retry: 1
        }
    }
});

// Query keys factory for consistent key management
export const queryKeys = {
    // Auth
    auth: {
        user: ['auth', 'user'] as const,
        profile: (userId: string) => ['auth', 'profile', userId] as const
    },

    // Family/Hubs
    hubs: {
        all: ['hubs'] as const,
        list: ['hubs', 'list'] as const,
        detail: (hubId: string) => ['hubs', 'detail', hubId] as const,
        members: (hubId: string) => ['hubs', 'members', hubId] as const
    },

    // Location
    location: {
        current: (userId: string) => ['location', 'current', userId] as const,
        family: (hubId: string) => ['location', 'family', hubId] as const,
        geofences: (hubId: string) => ['location', 'geofences', hubId] as const
    },

    // Tasks
    tasks: {
        all: ['tasks'] as const,
        list: (hubId: string) => ['tasks', 'list', hubId] as const,
        detail: (taskId: string) => ['tasks', 'detail', taskId] as const,
        assigned: (userId: string) => ['tasks', 'assigned', userId] as const,
        leaderboard: (hubId: string) => ['tasks', 'leaderboard', hubId] as const
    },

    // Messages
    messages: {
        conversations: ['messages', 'conversations'] as const,
        conversation: (conversationId: string) => ['messages', 'conversation', conversationId] as const,
        unread: ['messages', 'unread'] as const
    },

    // Vault
    vault: {
        items: ['vault', 'items'] as const,
        categories: ['vault', 'categories'] as const,
        access: ['vault', 'access'] as const
    },

    // Settings
    settings: {
        user: ['settings', 'user'] as const,
        notifications: ['settings', 'notifications'] as const,
        privacy: ['settings', 'privacy'] as const
    }
} as const;
