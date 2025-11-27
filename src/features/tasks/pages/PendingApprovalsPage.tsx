import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useHubStore } from '@/lib/store/hub-store';
import { useApproveTaskProof } from '@/features/tasks/hooks/useTasks';
import { getHubTasks } from '@/features/tasks/api/task-api';
import { updateTask } from '@/features/tasks/api/task-api';
import { MdCheck, MdClose, MdImage, MdAccessTime, MdPerson } from 'react-icons/md';
import toast from 'react-hot-toast';
import type { Task } from '@/types';

const PendingApprovalsPage = () => {
    const { currentHub } = useHubStore();
    const approveTaskMutation = useApproveTaskProof();

    // Fetch tasks with submitted status (waiting for approval)
    const { data: tasks, isLoading } = useQuery({
        queryKey: ['tasks', 'hub', currentHub?.id, 'submitted'],
        queryFn: async () => {
            if (!currentHub) throw new Error('No hub selected');
            const response = await getHubTasks(currentHub.id);
            if (!response.success) throw new Error(response.error);
            // Filter tasks with submitted status
            return (response.data || []).filter(
                (task) => task.status === 'submitted' && task.proofURL
            );
        },
        enabled: !!currentHub,
    });

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
            // Error is handled by the mutation
        }
    };

    const handleReject = async (task: Task) => {
        if (!currentHub) {
            toast.error('No hub selected');
            return;
        }
        try {
            await updateTask(currentHub.id, task.id, {
                proofStatus: 'rejected',
                proofReviewedAt: new Date(),
                status: 'pending', // Revert to pending so they can upload again
            });
            toast.success('Task proof rejected');
        } catch (error: any) {
            toast.error(error.message || 'Failed to reject proof');
        }
    };

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
                            <MdCheck size={40} className="text-green-600" />
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
                                                <MdImage size={48} className="text-on-variant" />
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
                                                <MdPerson size={16} />
                                                <span>
                                                    Assigned to: User {task.assignedTo?.slice(0, 8)}
                                                </span>
                                            </div>
                                            {task.proofSubmittedAt && (
                                                <div className="flex items-center gap-2 text-body-sm text-on-variant">
                                                    <MdAccessTime size={16} />
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
                                                onClick={() => handleApprove(task)}
                                                loading={approveTaskMutation.isPending}
                                                disabled={approveTaskMutation.isPending}
                                                startIcon={<MdCheck size={18} />}
                                                className="btn-base bg-green-600 text-white hover:bg-green-700 shadow-elevation-2"
                                            >
                                                Approve
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                onClick={() => handleReject(task)}
                                                disabled={approveTaskMutation.isPending}
                                                startIcon={<MdClose size={18} />}
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

export default PendingApprovalsPage;

