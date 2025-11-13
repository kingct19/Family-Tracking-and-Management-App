import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { TaskCardSkeleton } from '@/components/ui/Skeleton';
import { TaskList, TaskFilter, TaskSort } from '../components/TaskList';
import { TaskModal, type CreateTaskData } from '../components/TaskModal';
import { useHubTasks, useCompleteTask, useDeleteTask, useCreateTask, useUpdateTask } from '../hooks/useTasks';
import { useHasRole } from '@/features/auth/hooks/useAuth';
import { FiPlus, FiCheckSquare } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import type { TaskStatus, Task } from '@/types';

const TasksPage = () => {
    const { data: tasks, isLoading, error } = useHubTasks();
    const completeTaskMutation = useCompleteTask();
    const deleteTaskMutation = useDeleteTask();
    const createTaskMutation = useCreateTask();
    const updateTaskMutation = useUpdateTask();
    const isAdmin = useHasRole('admin');

    const [filter, setFilter] = useState<TaskStatus | 'all'>('all');
    const [sortBy, setSortBy] = useState<'deadline' | 'createdAt' | 'weight'>('deadline');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

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
            const task = tasks?.find(t => t.id === taskId);
            if (!task) throw new Error('Task not found');
            
            await completeTaskMutation.mutateAsync({ taskId, task });
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

    const handleEdit = (task: Task) => {
        setEditingTask(task);
        setIsModalOpen(true);
    };

    const handleViewDetails = (task: Task) => {
        // For now, just edit the task
        handleEdit(task);
    };

    const handleCreateTask = () => {
        setEditingTask(null);
        setIsModalOpen(true);
    };

    const handleSaveTask = async (data: CreateTaskData) => {
        try {
            if (editingTask) {
                // Update existing task
                await updateTaskMutation.mutateAsync({
                    taskId: editingTask.id,
                    updates: {
                        title: data.title,
                        description: data.description,
                        deadline: data.deadline ? new Date(data.deadline) : undefined,
                        weight: data.weight,
                        status: data.status,
                    },
                });
                toast.success('Task updated successfully!');
            } else {
                // Create new task
                await createTaskMutation.mutateAsync({
                    title: data.title,
                    description: data.description,
                    deadline: data.deadline ? new Date(data.deadline) : undefined,
                    weight: data.weight,
                });
                toast.success('Task created successfully!');
            }
            setIsModalOpen(false);
            setEditingTask(null);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to save task');
            throw error;
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTask(null);
    };

    if (isLoading) {
        return (
            <>
                <Helmet>
                    <title>Tasks - Family Safety App</title>
                </Helmet>
                <div className="space-y-6">
                    {/* Header Skeleton */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-200 rounded-2xl animate-pulse" />
                            <div>
                                <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-2" />
                                <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
                            </div>
                        </div>
                        <div className="h-11 w-32 bg-gray-200 rounded-xl animate-pulse" />
                    </div>

                    {/* Filter Tabs Skeleton */}
                    <div className="flex gap-2 overflow-x-auto">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-10 w-24 bg-gray-200 rounded-xl animate-pulse" />
                        ))}
                    </div>

                    {/* Tasks Skeleton */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {[...Array(6)].map((_, i) => (
                            <TaskCardSkeleton key={i} />
                        ))}
                    </div>
                </div>
            </>
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
                {tasks && tasks.length > 0 ? (
                    <TaskList
                        tasks={tasks}
                        filter={filter}
                        sortBy={sortBy}
                        onComplete={handleComplete}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onViewDetails={handleViewDetails}
                        isAdmin={isAdmin}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 px-4">
                        <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mb-6">
                            <FiCheckSquare size={48} className="text-purple-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No tasks yet</h3>
                        <p className="text-gray-600 text-center mb-6 max-w-md">
                            {isAdmin
                                ? 'Create your first task to get started with task management'
                                : 'No tasks have been assigned yet. Check back later!'}
                        </p>
                        {isAdmin && (
                            <Button variant="filled" onClick={handleCreateTask} startIcon={<FiPlus size={20} />}>
                                Create Your First Task
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* Task Modal */}
            <TaskModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveTask}
                task={editingTask}
                isLoading={createTaskMutation.isPending || updateTaskMutation.isPending}
            />
        </>
    );
};

export default TasksPage;
