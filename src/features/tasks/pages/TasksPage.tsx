import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { TaskList, TaskFilter, TaskSort } from '../components/TaskList';
import { useHubTasks, useCompleteTask, useDeleteTask } from '../hooks/useTasks';
import { useHasRole } from '@/features/auth/hooks/useAuth';
import { FiPlus } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import type { TaskStatus, Task } from '@/types';

const TasksPage = () => {
    const { data: tasks, isLoading, error } = useHubTasks();
    const completeTaskMutation = useCompleteTask();
    const deleteTaskMutation = useDeleteTask();
    const isAdmin = useHasRole('admin');

    const [filter, setFilter] = useState<TaskStatus | 'all'>('all');
    const [sortBy, setSortBy] = useState<'deadline' | 'createdAt' | 'weight'>('deadline');

    // Calculate filter counts
    const filterCounts = useMemo(() => {
        if (!tasks) return {} as Record<TaskStatus | 'all', number>;

        const counts = tasks.reduce((acc, task) => {
            acc[task.status] = (acc[task.status] || 0) + 1;
            acc.all = (acc.all || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return counts as Record<TaskStatus | 'all', number>;
    }, [tasks]);

    const handleComplete = async (taskId: string) => {
        try {
            await completeTaskMutation.mutateAsync(taskId);
            toast.success('Task completed!');
        } catch (error) {
            toast.error('Failed to complete task');
        }
    };

    const handleDelete = async (taskId: string) => {
        try {
            await deleteTaskMutation.mutateAsync(taskId);
            toast.success('Task deleted');
        } catch (error) {
            toast.error('Failed to delete task');
        }
    };

    const handleEdit = (_task: Task) => {
        // TODO: Open edit modal
        toast('Edit functionality coming soon');
    };

    const handleViewDetails = (_task: Task) => {
        // TODO: Open task details modal
        toast('Task details coming soon');
    };

    const handleCreateTask = () => {
        // TODO: Open create task modal
        toast('Create task functionality coming soon');
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16">
                <LoadingSpinner size="large" text="Loading tasks..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-16">
                <p className="text-body-lg text-error">Failed to load tasks</p>
                <p className="text-body-sm text-on-variant mt-2">
                    Please try refreshing the page
                </p>
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>Tasks - Family Safety App</title>
                <meta name="description" content="Manage and track your family tasks" />
            </Helmet>

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-headline-md text-on-background">Tasks</h1>
                        <p className="text-body-md text-on-variant mt-1">
                            Manage and track tasks for your team
                        </p>
                    </div>

                    {isAdmin && (
                        <Button
                            variant="filled"
                            size="medium"
                            startIcon={<FiPlus size={20} />}
                            onClick={handleCreateTask}
                        >
                            Create task
                        </Button>
                    )}
                </div>

                {/* Filters and Sort */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <TaskFilter
                        currentFilter={filter}
                        onChange={setFilter}
                        counts={filterCounts}
                    />
                    <TaskSort currentSort={sortBy} onChange={setSortBy} />
                </div>

                {/* Task List */}
                <TaskList
                    tasks={tasks || []}
                    filter={filter}
                    sortBy={sortBy}
                    onComplete={handleComplete}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onViewDetails={handleViewDetails}
                    isAdmin={isAdmin}
                />
            </div>
        </>
    );
};

export default TasksPage;
