/**
 * LeaveHubModal - Confirmation modal for leaving a hub
 */

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { MdClose, MdExitToApp, MdWarning } from 'react-icons/md';
import { leaveHub } from '@/lib/api/hub-api';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useHubStore } from '@/lib/store/hub-store';
import toast from 'react-hot-toast';

interface LeaveHubModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const LeaveHubModal = ({ isOpen, onClose }: LeaveHubModalProps) => {
    const { user } = useAuth();
    const { currentHub, clearCurrentHub } = useHubStore();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [confirmText, setConfirmText] = useState('');

    const leaveHubMutation = useMutation({
        mutationFn: async () => {
            if (!user || !currentHub) throw new Error('User or hub not found');
            return leaveHub(currentHub.id, user.id);
        },
        onSuccess: async (response) => {
            if (response.success) {
                // Invalidate hubs query
                queryClient.invalidateQueries({ queryKey: ['hubs', user?.id] });
                
                // Clear current hub
                clearCurrentHub();
                
                toast.success('Left hub successfully');
                onClose();
                
                // Navigate to dashboard or map
                navigate('/dashboard');
            } else {
                toast.error(response.error || 'Failed to leave hub');
            }
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to leave hub');
        },
    });

    const handleLeave = async (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (leaveHubMutation.isPending) return;
        
        if (confirmText.toLowerCase() !== 'leave') {
            toast.error('Please type "leave" to confirm');
            return;
        }

        leaveHubMutation.mutate();
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
                <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/50 bg-gradient-to-r from-orange-50 to-red-50 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                            <MdExitToApp size={24} className="text-orange-600" />
                        </div>
                        <h2 className="text-headline-sm font-bold text-on-surface">
                            Leave Hub
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
                    <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-xl border border-orange-200 overflow-hidden">
                        <MdWarning size={20} className="text-orange-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                            <p className="text-body-sm font-medium text-orange-900">
                                Are you sure you want to leave <strong>{currentHub.name}</strong>?
                            </p>
                            <p className="text-label-sm text-orange-700 mt-1">
                                You'll lose access to all hub content, tasks, messages, and location data. This action cannot be undone.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleLeave} className="space-y-4">
                        <div>
                            <label className="block text-label-md font-medium text-on-surface mb-2">
                                Type <strong>"leave"</strong> to confirm:
                            </label>
                            <input
                                type="text"
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                                placeholder="leave"
                                className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-white text-on-surface placeholder:text-on-variant/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                autoFocus
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={leaveHubMutation.isPending}
                                className="flex-1 px-6 py-3 rounded-xl border border-outline-variant text-on-surface font-semibold hover:bg-surface-variant transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={leaveHubMutation.isPending || confirmText.toLowerCase() !== 'leave'}
                                className="flex-1 px-6 py-3 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {leaveHubMutation.isPending ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <MdExitToApp size={20} />
                                        Leave Hub
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

