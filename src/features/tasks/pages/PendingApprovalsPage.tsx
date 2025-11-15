import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { PendingApprovalSkeleton } from '@/components/ui/Skeleton';
import { useHubStore } from '@/lib/store/hub-store';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { getHubTasks } from '@/features/tasks/api/task-api';
import { updateTask } from '@/features/tasks/api/task-api';
import { awardXP } from '@/features/xp/api/xp-api';
import { FiCheck, FiX, FiImage, FiClock, FiUser } from 'react-icons/fi';
import toast from 'react-hot-toast';
import type { Task } from '@/types';

export const PendingApprovalsPage = () => {
    const { currentHub } = useHubStore();
    const { user } = useAuth();
    const queryClient = useQueryClient();

    // Fetch tasks with pending proof
    const { data: tasks, isLoading } = useQuery({
        queryKey: ['tasks', 'hub', currentHub?.id, 'pending-proof'],
        queryFn: async () => {
            if (!currentHub) throw new Error('No hub selected');
            const response = await getHubTasks(currentHub.id);
            if (!response.success) throw new Error(response.error);
            // Filter tasks with pending proof
            return (response.data || []).filter(
                (task) => task.proofStatus === 'pending' && task.proofURL
            );
        },
        enabled: !!currentHub,
    });

    const approveMutation = useMutation({
        mutationFn: async ({ task, userId }: { task: Task; userId: string }) => {
            if (!currentHub) throw new Error('No hub selected');
            if (!user) throw new Error('User not authenticated');

            // Update task status
            await updateTask(currentHub.id, task.id, {
                status: 'completed',
                proofStatus: 'approved',
                proofReviewedBy: user.id,
                proofReviewedAt: new Date(),
                completedAt: new Date(),
            });

            // Award XP (need to get user name - for now using placeholder)
            await awardXP({
                userId,
                userName: `User ${userId.slice(0, 8)}`, // TODO: Get actual user name
                amount: task.weight * 10, // 10 XP per weight point
                source: 'task_completion',
                sourceId: task.id,
                description: `Completed task: ${task.title}`,
                hubId: currentHub.id,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks', 'hub', currentHub?.id] });
            queryClient.invalidateQueries({ queryKey: ['xp', 'leaderboard'] });
            toast.success('Task approved and XP awarded!');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to approve task');
        },
    });

    const rejectMutation = useMutation({
        mutationFn: async (task: Task) => {
            if (!currentHub) throw new Error('No hub selected');
            if (!user) throw new Error('User not authenticated');

            await updateTask(currentHub.id, task.id, {
                proofStatus: 'rejected',
                proofReviewedBy: user.id,
                proofReviewedAt: new Date(),
                status: 'assigned', // Revert to assigned
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks', 'hub', currentHub?.id] });
            toast.success('Task proof rejected');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to reject proof');
        },
    });

    if (isLoading) {
        return (
            <>
                <Helmet>
                    <title>Pending Approvals - Family Safety App</title>
                </Helmet>
                <div className="flex items-center justify-center py-16">
                    <LoadingSpinner size="large" />
                </div>
            </>
        );
    }

    return (
        <>
            <Helmet>
                <title>Pending Approvals - Family Safety App</title>
                <meta name="description" content="Review and approve task proof submissions" />
            </Helmet>

            <div className="space-y-8">
                <div>
                    <h1 className="text-headline-lg md:text-display-sm font-normal text-on-surface mb-2">Pending Approvals</h1>
                    <p className="text-body-lg text-on-variant">
                        Review and approve task completion proof
                    </p>
                </div>

                {!tasks || tasks.length === 0 ? (
                    <div className="card p-12 text-center">
                        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-elevation-2 border border-green-100">
                            <FiCheck size={40} className="text-green-600" />
                        </div>
                        <h3 className="text-headline-md font-normal text-on-surface mb-3">
                            All caught up!
                        </h3>
                        <p className="text-body-lg text-on-variant max-w-md mx-auto">
                            There are no pending proof submissions to review.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {tasks.map((task) => (
                            <div key={task.id} className="card p-6">
                                <div className="flex flex-col md:flex-row gap-6">
                                    {/* Proof Image */}
                                    <div className="flex-shrink-0">
                                        {task.proofURL ? (
                                            <img
                                                src={task.proofURL}
                                                alt={`Proof for ${task.title}`}
                                                className="w-full md:w-64 h-48 object-cover rounded-xl border-2 border-outline-variant shadow-elevation-1"
                                            />
                                        ) : (
                                            <div className="w-full md:w-64 h-48 bg-surface-variant rounded-xl flex items-center justify-center border-2 border-outline-variant">
                                                <FiImage size={48} className="text-on-variant" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Task Details */}
                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <h3 className="text-title-lg text-on-surface mb-2">
                                                {task.title}
                                            </h3>
                                            {task.description && (
                                                <p className="text-body-md text-on-variant">{task.description}</p>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap gap-4">
                                            <div className="flex items-center gap-2 text-body-sm text-on-variant">
                                                <FiUser size={16} />
                                                <span>
                                                    Assigned to: User {task.assignedTo?.slice(0, 8)}
                                                </span>
                                            </div>
                                            {task.proofSubmittedAt && (
                                                <div className="flex items-center gap-2 text-body-sm text-on-variant">
                                                    <FiClock size={16} />
                                                    <span>
                                                        Submitted:{' '}
                                                        {new Date(task.proofSubmittedAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="px-3 py-1.5 bg-primary-container border border-primary/20 text-primary rounded-full text-label-sm font-semibold">
                                                {task.weight * 10} XP
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-3 pt-4 border-t border-outline-variant">
                                            <Button
                                                variant="filled"
                                                onClick={() =>
                                                    approveMutation.mutate({
                                                        task,
                                                        userId: task.assignedTo || '',
                                                    })
                                                }
                                                loading={approveMutation.isPending}
                                                disabled={
                                                    approveMutation.isPending || rejectMutation.isPending
                                                }
                                                startIcon={<FiCheck size={18} />}
                                                className="btn-base bg-green-600 text-white hover:bg-green-700 shadow-elevation-2"
                                            >
                                                Approve
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                onClick={() => rejectMutation.mutate(task)}
                                                loading={rejectMutation.isPending}
                                                disabled={
                                                    approveMutation.isPending || rejectMutation.isPending
                                                }
                                                startIcon={<FiX size={18} />}
                                                className="btn-base border-2 border-error text-error hover:bg-error-container"
                                            >
                                                Reject
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

