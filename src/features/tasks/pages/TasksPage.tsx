import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { TaskCardSkeleton } from '@/components/ui/Skeleton';
import { TaskList, TaskFilter, TaskSort } from '../components/TaskList';
import { TaskModal, type CreateTaskData } from '../components/TaskModal';
import { TaskCompletionModal } from '../components/TaskCompletionModal';
import { useHubTasks, useAcceptTask, useApproveTaskProof, useUnassignTask, useDeleteTask, useCreateTask, useUpdateTask } from '../hooks/useTasks';
import { useHasRole, useAuth } from '@/features/auth/hooks/useAuth';
import { useHubStore } from '@/lib/store/hub-store';
import { MdAdd, MdTask } from 'react-icons/md';
import { toast } from 'react-hot-toast';
import type { TaskStatus, Task } from '@/types';

const TasksPage = () => {
    const queryClient = useQueryClient();
    const { currentHub } = useHubStore();
    const { user } = useAuth();
    const { data: tasks, isLoading, error } = useHubTasks();
    const acceptTaskMutation = useAcceptTask();
    const approveTaskMutation = useApproveTaskProof();
    const unassignTaskMutation = useUnassignTask();
    const deleteTaskMutation = useDeleteTask();
    const createTaskMutation = useCreateTask();
    const updateTaskMutation = useUpdateTask();
    const isAdmin = useHasRole('admin');

    const [filter, setFilter] = useState<TaskStatus | 'all'>('all');
    const [sortBy, setSortBy] = useState<'deadline' | 'createdAt' | 'weight'>('deadline');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [uploadingTask, setUploadingTask] = useState<Task | null>(null);
    const [uploadMode, setUploadMode] = useState<'upload' | 'submit'>('upload');

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

    const handleAccept = async (taskId: string) => {
        try {
            await acceptTaskMutation.mutateAsync(taskId);
        } catch (error) {
            toast.error('Failed to accept task');
        }
    };

    const handleUpload = (task: Task) => {
        setUploadingTask(task);
        // If task already has proof, use submit mode, otherwise upload mode
        setUploadMode(task.proofURL ? 'submit' : 'upload');
        setIsCompletionModalOpen(true);
    };

    const handleSubmit = (task: Task) => {
        setUploadingTask(task);
        setUploadMode('submit');
        setIsCompletionModalOpen(true);
    };

    const handleApprove = async (task: Task) => {
        if (!task.assignedTo) {
            toast.error('Task has no assignee');
            return;
        }
            try {
            await approveTaskMutation.mutateAsync({
                taskId: task.id,
                assignedToUserId: task.assignedTo,
            });
            } catch (error) {
            toast.error('Failed to approve task');
            }
    };

    const handleUnassign = async (taskId: string) => {
        try {
            await unassignTaskMutation.mutateAsync(taskId);
        } catch (error) {
            toast.error('Failed to unassign task');
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
                        assignedTo: data.assignedTo,
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
                    assignedTo: data.assignedTo,
                    requiresProof: data.requiresProof || false,
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
                    <title>Tasks - HaloHub</title>
                </Helmet>
                <div className="space-y-4 sm:space-y-6">
                    {/* Header Skeleton */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-surface-variant rounded-lg animate-pulse" />
                            <div>
                                <div className="h-6 w-24 bg-surface-variant rounded animate-pulse mb-2" />
                                <div className="h-4 w-40 bg-surface-variant rounded animate-pulse" />
                            </div>
                        </div>
                        <div className="h-10 w-28 bg-surface-variant rounded-full animate-pulse" />
                    </div>

                    {/* Filter Tabs Skeleton */}
                    <div className="flex gap-2 overflow-x-auto">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-9 w-20 bg-surface-variant rounded-full animate-pulse" />
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
                <title>Tasks - HaloHub</title>
                <meta name="description" content="Manage and track your family tasks" />
            </Helmet>

            <div className="space-y-4 sm:space-y-6">
                {/* Header - Mobile optimized */}
                <div className="flex items-start sm:items-center justify-between flex-wrap gap-3 sm:gap-4">
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-primary-container rounded-lg">
                                <MdTask size={24} className="text-primary" />
                            </div>
                            <div>
                                <h1 className="text-title-lg sm:text-headline-sm font-semibold text-on-surface">Tasks</h1>
                                <p className="text-body-sm text-on-variant mt-0.5">
                                    Manage and track tasks for your team
                                </p>
                            </div>
                        </div>
                    </div>

                    {isAdmin && (
                        <Button
                            variant="filled"
                            size="medium"
                            startIcon={<MdAdd size={20} />}
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
                        currentUserId={user?.id}
                        filter={filter}
                        sortBy={sortBy}
                        onAccept={handleAccept}
                        onUpload={handleUpload}
                        onSubmit={handleSubmit}
                        onApprove={handleApprove}
                        onUnassign={handleUnassign}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onViewDetails={handleViewDetails}
                        isAdmin={isAdmin}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-primary-container to-primary-container/50 rounded-full flex items-center justify-center mb-5 shadow-elevation-2">
                            <MdTask size={40} className="text-primary" />
                        </div>
                        <h3 className="text-title-lg sm:text-headline-sm font-semibold text-on-surface mb-2">No tasks yet</h3>
                        <p className="text-body-md text-on-variant text-center mb-6 max-w-md">
                            {isAdmin
                                ? 'Create your first task to get started with task management'
                                : 'No tasks have been assigned yet. Check back later!'}
                        </p>
                        {isAdmin && (
                            <Button 
                                variant="filled" 
                                onClick={handleCreateTask} 
                                startIcon={<MdAdd size={20} />}
                            >
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

            {/* Task Completion Modal */}
            {uploadingTask && (
                <TaskCompletionModal
                    isOpen={isCompletionModalOpen}
                    onClose={() => {
                        setIsCompletionModalOpen(false);
                        setUploadingTask(null);
                    }}
                    task={uploadingTask}
                    mode={uploadMode}
                    onSuccess={() => {
                        // Refresh tasks
                        queryClient.invalidateQueries({ queryKey: ['tasks', 'hub', currentHub?.id] });
                        setUploadingTask(null);
                    }}
                />
            )}
        </>
    );
};

export default TasksPage;
