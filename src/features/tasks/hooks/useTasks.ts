import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useHubStore } from '@/lib/store/hub-store';
import { useAuth } from '@/features/auth/hooks/useAuth';
import {
    getHubTasks,
    getUserTasks,
    createTask,
    updateTask,
    deleteTask,
    assignTask,
    completeTask,
} from '../api/task-api';
import { awardXP } from '@/features/xp/api/xp-api';
import type { CreateTaskFormData } from '@/lib/validation/task-schemas';
import type { Task } from '@/types';
import toast from 'react-hot-toast';

/**
 * Hook to fetch all tasks for current hub
 */
export const useHubTasks = () => {
    const { currentHub } = useHubStore();

    return useQuery({
        queryKey: ['tasks', 'hub', currentHub?.id],
        queryFn: async () => {
            if (!currentHub) throw new Error('No hub selected');
            const response = await getHubTasks(currentHub.id);
            if (!response.success) throw new Error(response.error);
            return response.data;
        },
        enabled: !!currentHub,
        staleTime: 30 * 1000, // 30 seconds
    });
};

/**
 * Hook to fetch user's assigned tasks
 */
export const useUserTasks = () => {
    const { currentHub } = useHubStore();
    const { user } = useAuth();

    return useQuery({
        queryKey: ['tasks', 'user', currentHub?.id, user?.id],
        queryFn: async () => {
            if (!currentHub || !user) throw new Error('No hub or user');
            const response = await getUserTasks(currentHub.id, user.id);
            if (!response.success) throw new Error(response.error);
            return response.data;
        },
        enabled: !!currentHub && !!user,
        staleTime: 30 * 1000,
    });
};

/**
 * Hook to create a task
 */
export const useCreateTask = () => {
    const queryClient = useQueryClient();
    const { currentHub } = useHubStore();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async (data: CreateTaskFormData) => {
            if (!currentHub || !user) throw new Error('No hub or user');
            const response = await createTask(currentHub.id, data, user.id);
            if (!response.success) throw new Error(response.error);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks', 'hub', currentHub?.id] });
        },
    });
};

/**
 * Hook to update a task
 */
export const useUpdateTask = () => {
    const queryClient = useQueryClient();
    const { currentHub } = useHubStore();

    return useMutation({
        mutationFn: async ({ taskId, updates }: { taskId: string; updates: Partial<Task> }) => {
            if (!currentHub) throw new Error('No hub selected');
            const response = await updateTask(currentHub.id, taskId, updates);
            if (!response.success) throw new Error(response.error);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks', 'hub', currentHub?.id] });
        },
    });
};

/**
 * Hook to delete a task
 */
export const useDeleteTask = () => {
    const queryClient = useQueryClient();
    const { currentHub } = useHubStore();

    return useMutation({
        mutationFn: async (taskId: string) => {
            if (!currentHub) throw new Error('No hub selected');
            const response = await deleteTask(currentHub.id, taskId);
            if (!response.success) throw new Error(response.error);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks', 'hub', currentHub?.id] });
        },
    });
};

/**
 * Hook to assign a task
 */
export const useAssignTask = () => {
    const queryClient = useQueryClient();
    const { currentHub } = useHubStore();

    return useMutation({
        mutationFn: async ({ taskId, userId }: { taskId: string; userId: string }) => {
            if (!currentHub) throw new Error('No hub selected');
            const response = await assignTask(currentHub.id, taskId, userId);
            if (!response.success) throw new Error(response.error);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks', 'hub', currentHub?.id] });
        },
    });
};

/**
 * Hook to complete a task
 */
export const useCompleteTask = () => {
    const queryClient = useQueryClient();
    const { currentHub } = useHubStore();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async (data: { taskId: string; task: Task }) => {
            if (!currentHub) throw new Error('No hub selected');
            
            // Complete the task
            const response = await completeTask(currentHub.id, data.taskId);
            if (!response.success) throw new Error(response.error);
            
            // Award XP to the user who completed the task
            if (user && data.task.assignedTo === user.id) {
                const xpAmount = data.task.weight || 10; // Default to 10 XP if no weight
                const xpResponse = await awardXP({
                    userId: user.id,
                    userName: user.displayName || user.email,
                    amount: xpAmount,
                    source: 'task_completion',
                    sourceId: data.taskId,
                    description: `Completed task: ${data.task.title}`,
                    hubId: currentHub.id,
                });
                
                if (xpResponse.success) {
                    toast.success(`🎉 +${xpAmount} XP for completing the task!`, {
                        duration: 3000,
                    });
                }
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks', 'hub', currentHub?.id] });
            queryClient.invalidateQueries({ queryKey: ['xpRecords'] });
            queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
        },
    });
};



