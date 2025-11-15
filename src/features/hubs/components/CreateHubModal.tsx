import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FiX, FiUsers } from 'react-icons/fi';
import { createHub } from '@/lib/api/hub-api';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useHubStore } from '@/lib/store/hub-store';
import { getUserMembership } from '@/lib/api/hub-api';
import { getUserHubs } from '@/lib/api/hub-api';
import { createHubSchema, type CreateHubFormData } from '@/lib/validation/hub-schemas';
import { TextField } from '@/components/ui/TextField';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

interface CreateHubModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CreateHubModal = ({ isOpen, onClose }: CreateHubModalProps) => {
    const { user } = useAuth();
    const { setCurrentHub } = useHubStore();
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<CreateHubFormData>({
        name: '',
        description: '',
        featureToggles: {
            location: true,
            tasks: true,
            chat: true,
            vault: false,
            xp: true,
            leaderboard: true,
            geofencing: false,
            deviceMonitoring: true,
        },
    });
    const [errors, setErrors] = useState<Partial<Record<keyof CreateHubFormData, string>>>({});

    const createHubMutation = useMutation({
        mutationFn: async (data: CreateHubFormData) => {
            if (!user) throw new Error('User not authenticated');
            return createHub(data, user.id);
        },
        onSuccess: async (response) => {
            if (response.success && response.data && user) {
                // Invalidate hubs query
                queryClient.invalidateQueries({ queryKey: ['hubs', user.id] });

                // Switch to the new hub
                const membershipResponse = await getUserMembership(response.data.id, user.id);
                if (membershipResponse.success && membershipResponse.data) {
                    setCurrentHub(response.data, membershipResponse.data.role);
                }

                toast.success('Hub created successfully!');
                onClose();
                setFormData({
                    name: '',
                    description: '',
                    featureToggles: {
                        location: true,
                        tasks: true,
                        chat: true,
                        vault: false,
                        xp: true,
                        leaderboard: true,
                        geofencing: false,
                        deviceMonitoring: true,
                    },
                });
            } else {
                toast.error(response.error || 'Failed to create hub');
            }
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to create hub');
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        const result = createHubSchema.safeParse(formData);
        if (!result.success) {
            const fieldErrors: Partial<Record<keyof CreateHubFormData, string>> = {};
            result.error.errors.forEach((err) => {
                if (err.path[0]) {
                    fieldErrors[err.path[0] as keyof CreateHubFormData] = err.message;
                }
            });
            setErrors(fieldErrors);
            return;
        }

        createHubMutation.mutate(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">Create Hub</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label="Close"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <TextField
                        label="Hub Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        error={errors.name}
                        required
                        fullWidth
                        placeholder="e.g., My Family, School Group"
                    />

                    <TextField
                        label="Description (Optional)"
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        error={errors.description}
                        fullWidth
                        placeholder="Brief description of your hub"
                        multiline
                        rows={3}
                    />

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outlined"
                            onClick={onClose}
                            fullWidth
                            disabled={createHubMutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="filled"
                            fullWidth
                            loading={createHubMutation.isPending}
                            disabled={createHubMutation.isPending}
                        >
                            Create Hub
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

