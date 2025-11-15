/**
 * TaskModal Component
 * 
 * Modal for creating and editing tasks
 */

import { useState, useEffect } from 'react';
import { FiX, FiCalendar, FiAward, FiFileText, FiUser } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useHubMembers } from '../hooks/useHubMembers';
import type { Task, TaskStatus } from '@/types';
import { cn } from '@/lib/utils/cn';

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (task: CreateTaskData) => Promise<void>;
    task?: Task | null;
    isLoading?: boolean;
}

export interface CreateTaskData {
    title: string;
    description: string;
    deadline: string;
    weight: number;
    assignedTo?: string;
    status: TaskStatus;
    requiresProof?: boolean;
}

const initialFormData: CreateTaskData = {
    title: '',
    description: '',
    deadline: '',
    weight: 10,
    status: 'pending',
};

export const TaskModal = ({ isOpen, onClose, onSave, task, isLoading = false }: TaskModalProps) => {
    const [formData, setFormData] = useState<CreateTaskData>(initialFormData);
    const [errors, setErrors] = useState<Partial<Record<keyof CreateTaskData, string>>>({});
    const { data: hubMembers = [], isLoading: isLoadingMembers } = useHubMembers();

    // Reset form when modal opens/closes or task changes
    useEffect(() => {
        if (isOpen) {
            if (task) {
                // Edit mode - populate form with task data
                setFormData({
                    title: task.title,
                    description: task.description || '',
                    deadline: task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '',
                    weight: task.weight,
                    assignedTo: task.assignedTo || '',
                    status: task.status,
                });
            } else {
                // Create mode - reset to initial
                setFormData(initialFormData);
            }
            setErrors({});
        }
    }, [isOpen, task]);

    const handleChange = (field: keyof CreateTaskData, value: string | number) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Clear error for this field
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof CreateTaskData, string>> = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }

        if (formData.weight < 1 || formData.weight > 10) {
            newErrors.weight = 'Weight must be between 1 and 10';
        }

        if (formData.deadline && new Date(formData.deadline) < new Date()) {
            newErrors.deadline = 'Deadline cannot be in the past';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            // Error handling is done in parent component
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-slide-up"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {task ? 'Edit Task' : 'Create New Task'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                        aria-label="Close"
                    >
                        <FiX size={24} className="text-gray-600" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-6">
                        {/* Title */}
                        <TextField
                            label="Task Title"
                            value={formData.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                            placeholder="Enter task title"
                            required
                            error={errors.title}
                            startAdornment={<FiFileText size={20} className="text-gray-400" />}
                        />

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                placeholder="Enter task description (optional)"
                                rows={4}
                                className={cn(
                                    'w-full px-4 py-3 rounded-xl border-2 transition-colors',
                                    'focus:outline-none focus:ring-2 focus:ring-purple-500',
                                    errors.description
                                        ? 'border-red-300 focus:border-red-500'
                                        : 'border-gray-200 focus:border-purple-500'
                                )}
                            />
                            {errors.description && (
                                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                            )}
                        </div>

                        {/* Assign To */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                <FiUser size={16} className="inline mr-1" />
                                Assign To (Optional)
                            </label>
                            {isLoadingMembers ? (
                                <div className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-gray-200">
                                    <LoadingSpinner size="small" />
                                    <span className="text-sm text-gray-500">Loading members...</span>
                                </div>
                            ) : (
                                <select
                                    value={formData.assignedTo || ''}
                                    onChange={(e) => handleChange('assignedTo', e.target.value)}
                                    className={cn(
                                        'w-full px-4 py-3 rounded-xl border-2 transition-colors',
                                        'focus:outline-none focus:ring-2 focus:ring-purple-500',
                                        errors.assignedTo
                                            ? 'border-red-300 focus:border-red-500'
                                            : 'border-gray-200 focus:border-purple-500'
                                    )}
                                >
                                    <option value="">Unassigned</option>
                                    {hubMembers.map((member) => (
                                        <option key={member.userId} value={member.userId}>
                                            {member.displayName} {member.role === 'admin' ? '(Admin)' : ''}
                                        </option>
                                    ))}
                                </select>
                            )}
                            {errors.assignedTo && (
                                <p className="mt-1 text-sm text-red-600">{errors.assignedTo}</p>
                            )}
                            <p className="mt-1 text-xs text-gray-500">
                                Leave unassigned to create a general task, or assign to a specific member
                            </p>
                        </div>

                        {/* Deadline and Weight */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Deadline */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    <FiCalendar size={16} className="inline mr-1" />
                                    Deadline
                                </label>
                                <input
                                    type="date"
                                    value={formData.deadline}
                                    onChange={(e) => handleChange('deadline', e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    className={cn(
                                        'w-full px-4 py-3 rounded-xl border-2 transition-colors',
                                        'focus:outline-none focus:ring-2 focus:ring-purple-500',
                                        errors.deadline
                                            ? 'border-red-300 focus:border-red-500'
                                            : 'border-gray-200 focus:border-purple-500'
                                    )}
                                />
                                {errors.deadline && (
                                    <p className="mt-1 text-sm text-red-600">{errors.deadline}</p>
                                )}
                            </div>

                            {/* Weight/XP */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    <FiAward size={16} className="inline mr-1" />
                                    XP Value
                                </label>
                                <input
                                    type="number"
                                    value={formData.weight}
                                    onChange={(e) => handleChange('weight', parseInt(e.target.value) || 0)}
                                    min={1}
                                    max={10}
                                    className={cn(
                                        'w-full px-4 py-3 rounded-xl border-2 transition-colors',
                                        'focus:outline-none focus:ring-2 focus:ring-purple-500',
                                        errors.weight
                                            ? 'border-red-300 focus:border-red-500'
                                            : 'border-gray-200 focus:border-purple-500'
                                    )}
                                />
                                {errors.weight && (
                                    <p className="mt-1 text-sm text-red-600">{errors.weight}</p>
                                )}
                                <p className="mt-1 text-xs text-gray-500">Points awarded when completed (1-10)</p>
                            </div>
                        </div>

                        {/* Status (only when editing) */}
                        {task && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Status
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => handleChange('status', e.target.value as TaskStatus)}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="assigned">Assigned</option>
                                    <option value="submitted">Submitted</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                    <option value="done">Done</option>
                                </select>
                            </div>
                        )}
                    </div>
                </form>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                    <Button variant="outlined" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button
                        variant="filled"
                        onClick={handleSubmit}
                        disabled={isLoading}
                        startIcon={isLoading ? undefined : undefined}
                    >
                        {isLoading ? 'Saving...' : task ? 'Save Changes' : 'Create Task'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

