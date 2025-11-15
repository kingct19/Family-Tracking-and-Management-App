import { useState } from 'react';
import { FiX, FiKey } from 'react-icons/fi';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useHubStore } from '@/lib/store/hub-store';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { joinHubWithInvite } from '@/features/auth/api/invite-api';
import { getUserHubs, getUserMembership } from '@/lib/api/hub-api';
import { TextField } from '@/components/ui/TextField';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

interface JoinHubModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const JoinHubModal = ({ isOpen, onClose }: JoinHubModalProps) => {
    const { user, joinHub } = useAuth();
    const { setCurrentHub } = useHubStore();
    const queryClient = useQueryClient();
    const [inviteCode, setInviteCode] = useState('');
    const [error, setError] = useState('');

    const joinHubMutation = useMutation({
        mutationFn: async (code: string) => {
            if (!user) throw new Error('User not authenticated');
            return joinHub(code);
        },
        onSuccess: async (response) => {
            if (response.success && response.data && user) {
                // Invalidate hubs query
                queryClient.invalidateQueries({ queryKey: ['hubs', user.id] });

                // Switch to the new hub
                const { hubId, role } = response.data;
                const hubsResponse = await getUserHubs(user.id);
                if (hubsResponse.success && hubsResponse.data) {
                    const newHub = hubsResponse.data.find(h => h.id === hubId);
                    if (newHub) {
                        setCurrentHub(newHub, role);
                    }
                }

                toast.success('Successfully joined hub!');
                onClose();
                setInviteCode('');
                setError('');
            } else {
                const errorMsg = response.error || 'Failed to join hub';
                setError(errorMsg);
                toast.error(errorMsg);
            }
        },
        onError: (error: any) => {
            const errorMsg = error.message || 'Failed to join hub';
            setError(errorMsg);
            toast.error(errorMsg);
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!inviteCode.trim()) {
            setError('Please enter an invite code');
            return;
        }

        // Normalize invite code (remove spaces, convert to uppercase)
        const normalizedCode = inviteCode.trim().replace(/\s+/g, '').toUpperCase();
        joinHubMutation.mutate(normalizedCode);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">Join Hub</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label="Close"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <TextField
                            label="Invite Code"
                            value={inviteCode}
                            onChange={(e) => {
                                setInviteCode(e.target.value);
                                setError('');
                            }}
                            error={error}
                            required
                            fullWidth
                            placeholder="XXXX-XXXX"
                            startAdornment={<FiKey size={20} />}
                        />
                        <p className="text-sm text-gray-500 mt-2">
                            Enter the invite code provided by the hub administrator
                        </p>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outlined"
                            onClick={onClose}
                            fullWidth
                            disabled={joinHubMutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="filled"
                            fullWidth
                            loading={joinHubMutation.isPending}
                            disabled={joinHubMutation.isPending || !inviteCode.trim()}
                        >
                            Join Hub
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

