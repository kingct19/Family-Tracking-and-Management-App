import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FiX } from 'react-icons/fi';
import { updateHub } from '@/lib/api/hub-api';
import { useHubStore } from '@/lib/store/hub-store';
import { TextField } from '@/components/ui/TextField';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';
import { updateHubSchema, type UpdateHubFormData } from '@/lib/validation/hub-schemas';

interface HubSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const HubSettingsModal = ({ isOpen, onClose }: HubSettingsModalProps) => {
    const { currentHub, setCurrentHub } = useHubStore();
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<UpdateHubFormData>({
        name: currentHub?.name || '',
        description: currentHub?.description || '',
    });

    const updateHubMutation = useMutation({
        mutationFn: async (data: UpdateHubFormData) => {
            if (!currentHub) throw new Error('No hub selected');
            return updateHub(currentHub.id, data);
        },
        onSuccess: async (response) => {
            if (response.success) {
                // Update local hub store
                if (currentHub) {
                    const { currentRole } = useHubStore.getState();
                    setCurrentHub(
                        {
                            ...currentHub,
                            name: formData.name || currentHub.name,
                            description: formData.description || currentHub.description,
                        },
                        currentRole || 'member'
                    );
                }
                
                // Invalidate hub queries
                queryClient.invalidateQueries({ queryKey: ['hubs'] });
                
                toast.success('Hub updated successfully!');
                onClose();
            } else {
                toast.error(response.error || 'Failed to update hub');
            }
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to update hub');
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate form
        const validation = updateHubSchema.safeParse(formData);
        if (!validation.success) {
            const firstError = validation.error.errors[0];
            toast.error(firstError.message);
            return;
        }

        updateHubMutation.mutate(formData);
    };

    if (!isOpen || !currentHub) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 py-8 sm:py-4 min-h-screen overflow-y-auto bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md bg-surface rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-outline-variant">
                    <h2 className="text-headline-sm font-semibold text-on-surface">Hub Settings</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-surface-variant rounded-full transition-colors"
                        aria-label="Close"
                    >
                        <FiX size={20} className="text-on-variant" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <TextField
                        label="Hub Name"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter hub name"
                        required
                        disabled={updateHubMutation.isPending}
                        error={
                            formData.name && formData.name.length < 3
                                ? 'Hub name must be at least 3 characters'
                                : undefined
                        }
                    />

                    <div>
                        <label className="block text-label-md font-medium text-on-surface mb-1.5">
                            Description
                        </label>
                        <textarea
                            value={formData.description || ''}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Enter hub description (optional)"
                            rows={3}
                            disabled={updateHubMutation.isPending}
                            maxLength={200}
                            className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50 disabled:bg-surface-variant"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outlined"
                            onClick={onClose}
                            disabled={updateHubMutation.isPending}
                            fullWidth
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="filled"
                            disabled={updateHubMutation.isPending || !formData.name}
                            fullWidth
                        >
                            {updateHubMutation.isPending ? (
                                <LoadingSpinner size="small" />
                            ) : (
                                'Save Changes'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

