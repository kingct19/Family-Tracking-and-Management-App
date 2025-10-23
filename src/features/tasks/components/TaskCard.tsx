import { format } from 'date-fns';
import { Card, CardHeader, CardContent, CardActions } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
    FiCheckCircle,
    FiUser,
    FiMoreVertical,
    FiTrash2,
    FiEdit2,
} from 'react-icons/fi';
import type { Task } from '@/types';
import { cn } from '@/lib/utils/cn';

interface TaskCardProps {
    task: Task;
    onComplete?: (taskId: string) => void;
    onEdit?: (task: Task) => void;
    onDelete?: (taskId: string) => void;
    onViewDetails?: (task: Task) => void;
    showActions?: boolean;
    isAdmin?: boolean;
}

export const TaskCard = ({
    task,
    onComplete,
    onEdit,
    onDelete,
    onViewDetails,
    showActions = true,
    isAdmin = false,
}: TaskCardProps) => {
    const isPending = task.status === 'pending';
    const isAssigned = task.status === 'assigned';
    const isDone = task.status === 'done';
    const isOverdue = task.deadline && new Date(task.deadline) < new Date() && !isDone;

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
                            <FiMoreVertical size={20} className="text-on-variant" />
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
                            <FiUser size={16} />
                            <span className="text-label-sm">Assigned</span>
                        </div>
                    )}
                </div>
            </CardContent>

            {showActions && (
                <CardActions>
                    {/* Complete button for assigned tasks */}
                    {isAssigned && onComplete && !isAdmin && (
                        <Button
                            variant="filled"
                            size="small"
                            startIcon={<FiCheckCircle size={16} />}
                            onClick={(e) => {
                                e.stopPropagation();
                                onComplete(task.id);
                            }}
                        >
                            Complete
                        </Button>
                    )}

                    {/* Edit button for admins */}
                    {isAdmin && onEdit && (
                        <Button
                            variant="tonal"
                            size="small"
                            startIcon={<FiEdit2 size={16} />}
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(task);
                            }}
                        >
                            Edit
                        </Button>
                    )}

                    {/* Delete button for admins */}
                    {isAdmin && onDelete && (isPending || isAssigned) && (
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<FiTrash2 size={16} />}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (confirm('Are you sure you want to delete this task?')) {
                                    onDelete(task.id);
                                }
                            }}
                            className="ml-auto"
                        >
                            Delete
                        </Button>
                    )}
                </CardActions>
            )}
        </Card>
    );
};

