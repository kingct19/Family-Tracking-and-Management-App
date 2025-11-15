import { useState } from 'react';
import { FiX } from 'react-icons/fi';
import { PhotoProofUpload } from './PhotoProofUpload';
import { uploadTaskProof } from '@/lib/services/storage-service';
import { submitTaskProof } from '../api/task-api';
import { useHubStore } from '@/lib/store/hub-store';
import toast from 'react-hot-toast';
import type { Task } from '@/types';

interface TaskCompletionModalProps {
    isOpen: boolean;
    onClose: () => void;
    task: Task;
    onSuccess: () => void;
}

export const TaskCompletionModal = ({
    isOpen,
    onClose,
    task,
    onSuccess,
}: TaskCompletionModalProps) => {
    const { currentHub } = useHubStore();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleUpload = async (file: File, notes?: string) => {
        if (!currentHub) {
            toast.error('No hub selected');
            return;
        }

        setIsSubmitting(true);
        try {
            // Upload photo to Firebase Storage
            const proofURL = await uploadTaskProof(file, currentHub.id, task.id);

            // Submit proof to task
            const response = await submitTaskProof(currentHub.id, task.id, proofURL, notes);
            
            if (response.success) {
                toast.success('Proof submitted! Waiting for admin approval.');
                onSuccess();
                onClose();
            } else {
                toast.error(response.error || 'Failed to submit proof');
            }
        } catch (error: any) {
            console.error('Submit proof error:', error);
            toast.error(error.message || 'Failed to upload proof');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
                    <h2 className="text-2xl font-bold text-gray-900">Complete Task</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label="Close"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                <div className="p-6">
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{task.title}</h3>
                        {task.description && (
                            <p className="text-gray-600">{task.description}</p>
                        )}
                        <p className="text-sm text-gray-500 mt-2">
                            Please upload a photo as proof of completion
                        </p>
                    </div>

                    <PhotoProofUpload
                        onUpload={handleUpload}
                        onCancel={onClose}
                        isLoading={isSubmitting}
                        existingProof={task.proofURL}
                    />
                </div>
            </div>
        </div>
    );
};

