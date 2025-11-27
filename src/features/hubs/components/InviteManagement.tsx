import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiX, FiKey, FiCopy, FiTrash2, FiPlus, FiUsers, FiClock } from 'react-icons/fi';
import { createInviteCode, getHubInvites, deleteInviteCode } from '@/features/auth/api/invite-api';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useHubStore } from '@/lib/store/hub-store';
import { TextField } from '@/components/ui/TextField';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import type { UserRole } from '@/types';

interface InviteManagementProps {
    isOpen: boolean;
    onClose: () => void;
}

export const InviteManagement = ({ isOpen, onClose }: InviteManagementProps) => {
    const { user } = useAuth();
    const { currentHub } = useHubStore();
    const queryClient = useQueryClient();
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [role, setRole] = useState<UserRole>('member');
    const [expiresInDays, setExpiresInDays] = useState(7);
    const [maxUses, setMaxUses] = useState<number | undefined>(undefined);

    // Fetch hub invites
    const { data: invites, isLoading } = useQuery({
        queryKey: ['invites', 'hub', currentHub?.id],
        queryFn: async () => {
            if (!currentHub) throw new Error('No hub selected');
            const response = await getHubInvites(currentHub.id);
            if (!response.success) throw new Error(response.error);
            return response.data || [];
        },
        enabled: !!currentHub && isOpen,
    });

    // Create invite mutation
    const createInviteMutation = useMutation({
        mutationFn: async () => {
            if (!currentHub || !user) throw new Error('No hub or user');
            return createInviteCode(currentHub.id, user.id, role, expiresInDays, maxUses);
        },
        onSuccess: (response) => {
            if (response.success && response.data) {
                queryClient.invalidateQueries({ queryKey: ['invites', 'hub', currentHub?.id] });
                toast.success('Invite code created!');
                setShowCreateForm(false);
                setRole('member');
                setExpiresInDays(7);
                setMaxUses(undefined);
            } else {
                toast.error(response.error || 'Failed to create invite');
            }
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to create invite');
        },
    });

    // Delete invite mutation
    const deleteInviteMutation = useMutation({
        mutationFn: async (code: string) => {
            return deleteInviteCode(code);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invites', 'hub', currentHub?.id] });
            toast.success('Invite code deleted');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to delete invite');
        },
    });

    const handleCopyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        toast.success('Invite code copied to clipboard!');
    };

    const handleCreateInvite = () => {
        createInviteMutation.mutate();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
                    <h2 className="text-2xl font-bold text-gray-900">Manage Invites</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label="Close"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Create Invite Button */}
                    {!showCreateForm && (
                        <Button
                            variant="filled"
                            startIcon={<FiPlus size={18} />}
                            onClick={() => setShowCreateForm(true)}
                            fullWidth
                        >
                            Create New Invite
                        </Button>
                    )}

                    {/* Create Invite Form */}
                    {showCreateForm && (
                        <Card elevation={1}>
                            <CardContent className="p-6 space-y-4">
                                <h3 className="text-title-lg text-on-surface mb-4">Create Invite Code</h3>

                                <div>
                                    <label className="block text-label-md text-on-surface mb-2">
                                        Role
                                    </label>
                                    <select
                                        value={role}
                                        onChange={(e) => setRole(e.target.value as UserRole)}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    >
                                        <option value="member">Member</option>
                                        <option value="admin">Admin</option>
                                        <option value="observer">Observer</option>
                                    </select>
                                </div>

                                <TextField
                                    label="Expires In (Days)"
                                    type="number"
                                    value={expiresInDays.toString()}
                                    onChange={(e) => setExpiresInDays(parseInt(e.target.value) || 7)}
                                    min={1}
                                    max={30}
                                />

                                <TextField
                                    label="Max Uses (Optional)"
                                    type="number"
                                    value={maxUses?.toString() || ''}
                                    onChange={(e) => setMaxUses(e.target.value ? parseInt(e.target.value) : undefined)}
                                    min={1}
                                    max={100}
                                    placeholder="Leave empty for unlimited"
                                />

                                <div className="flex gap-3 pt-2">
                                    <Button
                                        variant="outlined"
                                        onClick={() => {
                                            setShowCreateForm(false);
                                            setRole('member');
                                            setExpiresInDays(7);
                                            setMaxUses(undefined);
                                        }}
                                        fullWidth
                                        disabled={createInviteMutation.isPending}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="filled"
                                        onClick={handleCreateInvite}
                                        loading={createInviteMutation.isPending}
                                        fullWidth
                                    >
                                        Create Invite
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Invites List */}
                    <div>
                        <h3 className="text-title-md text-on-surface mb-4">Active Invites</h3>
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <LoadingSpinner size="medium" />
                            </div>
                        ) : !invites || invites.length === 0 ? (
                            <div className="text-center py-8 text-on-variant">
                                <FiKey size={48} className="mx-auto mb-4 text-on-variant opacity-50" />
                                <p>No active invites. Create one to invite members!</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {invites.map((invite) => (
                                    <Card key={invite.code} elevation={1}>
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <div className="px-3 py-1 bg-primary-container text-primary rounded-full text-label-sm font-semibold">
                                                            {invite.code}
                                                        </div>
                                                        <div className="px-3 py-1 bg-surface-variant text-on-variant rounded-full text-label-sm capitalize">
                                                            {invite.role}
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-wrap gap-4 text-body-sm text-on-variant">
                                                        <div className="flex items-center gap-1">
                                                            <FiUsers size={14} />
                                                            <span>
                                                                {invite.usedBy?.length || 0}
                                                                {invite.maxUses ? ` / ${invite.maxUses}` : ''} uses
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <FiClock size={14} />
                                                            <span>
                                                                Expires: {format(invite.expiresAt, 'MMM d, yyyy')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="tonal"
                                                        size="small"
                                                        startIcon={<FiCopy size={16} />}
                                                        onClick={() => handleCopyCode(invite.code)}
                                                    >
                                                        Copy
                                                    </Button>
                                                    <Button
                                                        variant="outlined"
                                                        size="small"
                                                        startIcon={<FiTrash2 size={16} />}
                                                        onClick={() => {
                                                            if (confirm('Are you sure you want to delete this invite?')) {
                                                                deleteInviteMutation.mutate(invite.code);
                                                            }
                                                        }}
                                                    >
                                                        Delete
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

