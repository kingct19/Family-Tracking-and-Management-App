/**
 * DeleteHubModal - Confirmation modal for deleting a hub (admin only)
 */

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { MdClose, MdDelete, MdWarning, MdShield } from 'react-icons/md';
import { deleteHub } from '@/lib/api/hub-api';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useHubStore } from '@/lib/store/hub-store';
import toast from 'react-hot-toast';

interface DeleteHubModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const DeleteHubModal = ({ isOpen, onClose }: DeleteHubModalProps) => {
    const { user } = useAuth();
    const { currentHub, setCurrentHub } = useHubStore();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [confirmText, setConfirmText] = useState('');

    const deleteHubMutation = useMutation({
        mutationFn: async () => {
            if (!user || !currentHub) throw new Error('User or hub not found');
            return deleteHub(currentHub.id, user.id);
        },
        onSuccess: async (response) => {
            if (response.success) {
                // Invalidate hubs query
                queryClient.invalidateQueries({ queryKey: ['hubs', user?.id] });
                
                // Clear current hub
                setCurrentHub(null, null);
                
                toast.success('Hub deleted successfully');
                onClose();
                
                // Navigate to dashboard
                navigate('/dashboard');
            } else {
                toast.error(response.error || 'Failed to delete hub');
            }
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to delete hub');
        },
    });

    const handleDelete = async (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (deleteHubMutation.isPending) return;
        
        if (confirmText.toLowerCase() !== 'delete') {
            toast.error('Please type "delete" to confirm');
            return;
        }

        deleteHubMutation.mutate();
    };

    if (!isOpen || !currentHub) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 py-8 sm:py-4 min-h-screen overflow-y-auto">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[calc(100vh-4rem)] sm:max-h-[90vh] flex flex-col overflow-hidden my-auto">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/50 bg-gradient-to-r from-red-50 to-orange-50 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                            <MdDelete size={24} className="text-red-600" />
                        </div>
                        <h2 className="text-headline-sm font-bold text-on-surface">
                            Delete Hub
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-surface-variant text-on-variant transition-colors"
                    >
                        <MdClose size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4 overflow-y-auto flex-1 min-h-0">
                    <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-200 overflow-hidden">
                        <MdWarning size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                            <p className="text-body-sm font-medium text-red-900">
                                This action cannot be undone!
                            </p>
                            <p className="text-label-sm text-red-700 mt-1">
                                Deleting <strong>{currentHub.name}</strong> will permanently remove:
                            </p>
                            <ul className="text-label-sm text-red-700 mt-2 space-y-1 pl-5 list-disc">
                                <li>All hub data and settings</li>
                                <li>All tasks and messages</li>
                                <li>All location history</li>
                                <li>All member access</li>
                            </ul>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl border border-amber-200">
                        <MdShield size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                        <p className="text-label-sm text-amber-800">
                            Only admins can delete hubs. All members will be removed automatically.
                        </p>
                    </div>

                    <form onSubmit={handleDelete} className="space-y-4">
                        <div>
                            <label className="block text-label-md font-medium text-on-surface mb-2">
                                Type <strong>"delete"</strong> to confirm:
                            </label>
                            <input
                                type="text"
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                                placeholder="delete"
                                className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-white text-on-surface placeholder:text-on-variant/50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                autoFocus
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={deleteHubMutation.isPending}
                                className="flex-1 px-6 py-3 rounded-xl border border-outline-variant text-on-surface font-semibold hover:bg-surface-variant transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={deleteHubMutation.isPending || confirmText.toLowerCase() !== 'delete'}
                                className="flex-1 px-6 py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {deleteHubMutation.isPending ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <MdDelete size={20} />
                                        Delete Hub
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

