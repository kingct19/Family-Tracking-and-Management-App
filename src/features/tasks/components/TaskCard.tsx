import { format } from 'date-fns';
import { Card, CardHeader, CardContent, CardActions } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
    MdCheckCircle,
    MdPerson,
    MdMoreVert,
    MdDelete,
    MdEdit,
    MdUpload,
    MdCheck,
    MdClose,
} from 'react-icons/md';
import type { Task } from '@/types';
import { cn } from '@/lib/utils/cn';

interface TaskCardProps {
    task: Task;
    currentUserId?: string;
    onAccept?: (taskId: string) => void;
    onUpload?: (task: Task) => void;
    onSubmit?: (task: Task) => void;
    onApprove?: (task: Task) => void;
    onUnassign?: (taskId: string) => void;
    onEdit?: (task: Task) => void;
    onDelete?: (taskId: string) => void;
    onViewDetails?: (task: Task) => void;
    showActions?: boolean;
    isAdmin?: boolean;
}

export const TaskCard = ({
    task,
    currentUserId,
    onAccept,
    onUpload,
    onSubmit,
    onApprove,
    onUnassign,
    onEdit,
    onDelete,
    onViewDetails,
    showActions = true,
    isAdmin = false,
}: TaskCardProps) => {
    const isPending = task.status === 'pending';
    const isAssigned = task.status === 'assigned';
    const isSubmitted = task.status === 'submitted';
    const isDone = task.status === 'done';
    const isOverdue = task.deadline && new Date(task.deadline) < new Date() && !isDone;
    const isAssignedToMe = currentUserId && task.assignedTo === currentUserId;

    const statusConfig = {
        pending: { label: 'Pending', color: 'text-outline' },
        assigned: { label: 'Assigned', color: 'text-primary' },
        submitted: { label: 'Submitted', color: 'text-secondary' },
        approved: { label: 'Approved', color: 'text-tertiary' },
        rejected: { label: 'Rejected', color: 'text-error' },
        done: { label: 'Done', color: 'text-tertiary' },
    };

    const config = statusConfig[task.status];

    return (
        <Card
            elevation={1}
            interactive={!!onViewDetails}
            onClick={onViewDetails ? () => onViewDetails(task) : undefined}
            className={cn({
                'border-l-4 border-error': isOverdue,
            })}
        >
            <CardHeader
                title={task.title}
                subtitle={
                    config.label + (task.deadline ? ` • ${format(new Date(task.deadline), 'MMM d, yyyy')}` : '')
                }
                action={
                    showActions && (
                        <button
                            className="p-2 rounded-full hover:bg-surface-variant"
                            aria-label="Task options"
                        >
                            <MdMoreVert size={20} className="text-on-variant" />
                        </button>
                    )
                }
            />

            {task.description && (
                <CardContent>
                    <p className="text-body-sm text-on-variant line-clamp-2">
                        {task.description}
                    </p>
                </CardContent>
            )}

            <CardContent className="pt-0">
                <div className="flex items-center gap-4">
                    {/* Weight/XP indicator */}
                    <div className="flex items-center gap-1">
                        <span className="text-label-sm text-on-variant">XP:</span>
                        <span className="text-label-md text-primary">{task.weight}</span>
                    </div>

                    {/* Assignee */}
                    {task.assignedTo && (
                        <div className="flex items-center gap-1 text-on-variant">
                            <MdPerson size={16} />
                            <span className="text-label-sm">Assigned</span>
                        </div>
                    )}
                </div>
            </CardContent>

            {showActions && (
                <CardActions>
                    {/* CHILD (Member) Actions */}
                    {!isAdmin && isAssignedToMe && (
                        <>
                            {/* Accept button - moves ASSIGNED to PENDING */}
                            {isAssigned && onAccept && (
                                <Button
                                    variant="filled"
                                    size="small"
                                    startIcon={<MdCheckCircle size={16} />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAccept(task.id);
                                    }}
                                    className="flex-1 sm:flex-initial min-w-0"
                                >
                                    <span className="truncate">Accept</span>
                                </Button>
                            )}

                            {/* Upload/Submit buttons - for PENDING tasks */}
                            {isPending && isAssignedToMe && (
                                <>
                                    {/* Upload button - when no proof yet */}
                                    {!task.proofURL && onUpload && (
                                        <Button
                                            variant="filled"
                                            size="small"
                                            startIcon={<MdUpload size={16} />}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onUpload(task);
                                            }}
                                            className="flex-1 sm:flex-initial min-w-0"
                                        >
                                            <span className="truncate">Upload</span>
                                        </Button>
                                    )}

                                    {/* Submit button - when proof exists */}
                                    {task.proofURL && onSubmit && (
                                        <Button
                                            variant="filled"
                                            size="small"
                                            startIcon={<MdCheck size={16} />}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onSubmit(task);
                                            }}
                                            className="flex-1 sm:flex-initial min-w-0"
                                        >
                                            <span className="truncate">Submit</span>
                                        </Button>
                                    )}
                                </>
                            )}
                        </>
                    )}

                    {/* PARENT (Admin) Actions */}
                    {isAdmin && (
                        <>
                            {/* Unassign button - for ASSIGNED tasks */}
                            {isAssigned && onUnassign && (
                                <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<MdClose size={16} />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm('Are you sure you want to unassign this task?')) {
                                            onUnassign(task.id);
                                        }
                                    }}
                                    className="flex-1 sm:flex-initial min-w-0"
                                >
                                    <span className="truncate">Unassign</span>
                                </Button>
                            )}

                            {/* Approve button - for SUBMITTED tasks */}
                            {isSubmitted && onApprove && (
                                <Button
                                    variant="filled"
                                    size="small"
                                    startIcon={<MdCheck size={16} />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onApprove(task);
                                    }}
                                    className="bg-green-600 hover:bg-green-700 text-white flex-1 sm:flex-initial min-w-0"
                                >
                                    <span className="truncate">Approve</span>
                                </Button>
                            )}

                            {/* Edit button */}
                            {onEdit && (
                                <Button
                                    variant="tonal"
                                    size="small"
                                    startIcon={<MdEdit size={16} />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit(task);
                                    }}
                                    className="flex-1 sm:flex-initial min-w-0"
                                >
                                    <span className="truncate">Edit</span>
                                </Button>
                            )}

                            {/* Delete button - for ASSIGNED tasks */}
                            {isAssigned && onDelete && (
                                <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<MdDelete size={16} />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm('Are you sure you want to delete this task?')) {
                                            onDelete(task.id);
                                        }
                                    }}
                                    className="flex-1 sm:flex-initial min-w-0"
                                >
                                    <span className="truncate">Delete</span>
                                </Button>
                            )}
                        </>
                    )}
                </CardActions>
            )}
        </Card>
    );
};

