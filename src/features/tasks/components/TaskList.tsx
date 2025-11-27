import { useMemo } from 'react';
import { TaskCard } from './TaskCard';
import type { Task, TaskStatus } from '@/types';
import { cn } from '@/lib/utils/cn';

interface TaskListProps {
    tasks: Task[];
    currentUserId?: string;
    onAccept?: (taskId: string) => void;
    onUpload?: (task: Task) => void;
    onSubmit?: (task: Task) => void;
    onApprove?: (task: Task) => void;
    onUnassign?: (taskId: string) => void;
    onEdit?: (task: Task) => void;
    onDelete?: (taskId: string) => void;
    onViewDetails?: (task: Task) => void;
    isAdmin?: boolean;
    filter?: TaskStatus | 'all';
    sortBy?: 'deadline' | 'createdAt' | 'weight';
}

export const TaskList = ({
    tasks,
    currentUserId,
    onAccept,
    onUpload,
    onSubmit,
    onApprove,
    onUnassign,
    onEdit,
    onDelete,
    onViewDetails,
    isAdmin = false,
    filter = 'all',
    sortBy = 'deadline',
}: TaskListProps) => {
    // Filter tasks
    const filteredTasks = useMemo(() => {
        if (filter === 'all') return tasks;
        return tasks.filter((task) => task.status === filter);
    }, [tasks, filter]);

    // Sort tasks
    const sortedTasks = useMemo(() => {
        return [...filteredTasks].sort((a, b) => {
            if (sortBy === 'deadline') {
                if (!a.deadline) return 1;
                if (!b.deadline) return -1;
                return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
            }

            if (sortBy === 'weight') {
                return b.weight - a.weight;
            }

            // createdAt
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    }, [filteredTasks, sortBy]);

    if (sortedTasks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-body-lg text-on-variant mb-2">No tasks found</p>
                <p className="text-body-sm text-on-variant">
                    {filter === 'all'
                        ? 'Create a new task to get started'
                        : `No ${filter} tasks at the moment`}
                </p>
            </div>
        );
    }

    return (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full min-w-0">
            {sortedTasks.map((task) => (
                <div key={task.id} className="min-w-0 w-full">
                    <TaskCard
                        task={task}
                        currentUserId={currentUserId}
                        onAccept={onAccept}
                        onUpload={onUpload}
                        onSubmit={onSubmit}
                        onApprove={onApprove}
                        onUnassign={onUnassign}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onViewDetails={onViewDetails}
                        isAdmin={isAdmin}
                    />
                </div>
            ))}
        </div>
    );
};

interface TaskFilterProps {
    currentFilter: TaskStatus | 'all';
    onChange: (filter: TaskStatus | 'all') => void;
    counts?: Record<TaskStatus | 'all', number>;
}

export const TaskFilter = ({ currentFilter, onChange, counts }: TaskFilterProps) => {
    const filters: Array<{ value: TaskStatus | 'all'; label: string }> = [
        { value: 'all', label: 'All' },
        { value: 'pending', label: 'Pending' },
        { value: 'assigned', label: 'Assigned' },
        { value: 'submitted', label: 'Submitted' },
        { value: 'done', label: 'Done' },
    ];

    return (
        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar sm:flex-wrap">
            {filters.map((filter) => (
                <button
                    key={filter.value}
                    onClick={() => onChange(filter.value)}
                    className={cn(
                        'px-4 py-2.5 sm:py-2 rounded-full text-label-md transition-colors duration-fast',
                        'focus:outline-none focus:ring-2 focus:ring-primary touch-target',
                        'active:scale-95',
                        {
                            'bg-secondary-container text-on-secondary-container':
                                currentFilter === filter.value,
                            'bg-surface-variant text-on-variant hover:bg-outline-variant active:bg-outline-variant':
                                currentFilter !== filter.value,
                        }
                    )}
                >
                    {filter.label}
                    {counts && counts[filter.value] > 0 && (
                        <span className="ml-2 text-label-sm opacity-75">
                            ({counts[filter.value]})
                        </span>
                    )}
                </button>
            ))}
        </div>
    );
};

interface TaskSortProps {
    currentSort: 'deadline' | 'createdAt' | 'weight';
    onChange: (sort: 'deadline' | 'createdAt' | 'weight') => void;
}

export const TaskSort = ({ currentSort, onChange }: TaskSortProps) => {
    const sortOptions = [
        { value: 'deadline' as const, label: 'Due date' },
        { value: 'weight' as const, label: 'XP value' },
        { value: 'createdAt' as const, label: 'Created date' },
    ];

    return (
        <div className="flex items-center gap-2">
            <span className="text-label-sm text-on-variant hidden sm:inline">Sort by:</span>
            <select
                value={currentSort}
                onChange={(e) => onChange(e.target.value as typeof currentSort)}
                className={cn(
                    'px-3 py-2.5 sm:py-1.5 rounded-lg bg-surface-variant text-body-md text-on-surface',
                    'border border-outline focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary',
                    'cursor-pointer touch-target text-base sm:text-sm'
                )}
            >
                {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

