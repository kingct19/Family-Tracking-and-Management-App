import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FiX, FiUser, FiTrash2, FiEdit2 } from 'react-icons/fi';
import { updateMemberRole, removeMemberFromHub } from '@/lib/api/hub-api';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useHubStore } from '@/lib/store/hub-store';
import { useHubMembers, type HubMember } from '@/features/tasks/hooks/useHubMembers';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';
import type { UserRole } from '@/types';

interface MemberManagementProps {
    isOpen: boolean;
    onClose: () => void;
}

export const MemberManagement = ({ isOpen, onClose }: MemberManagementProps) => {
    const { user } = useAuth();
    const { currentHub } = useHubStore();
    const queryClient = useQueryClient();
    const { data: members, isLoading } = useHubMembers();
    const [editingMember, setEditingMember] = useState<string | null>(null);
    const [selectedRole, setSelectedRole] = useState<UserRole>('member');

    const updateRoleMutation = useMutation({
        mutationFn: async ({ userId, newRole }: { userId: string; newRole: UserRole }) => {
            if (!currentHub) throw new Error('No hub selected');
            return updateMemberRole(currentHub.id, userId, newRole);
        },
        onSuccess: (response) => {
            if (response.success) {
                queryClient.invalidateQueries({ queryKey: ['hub-members', currentHub?.id] });
                toast.success('Member role updated successfully!');
                setEditingMember(null);
            } else {
                toast.error(response.error || 'Failed to update member role');
            }
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to update member role');
        },
    });

    const removeMemberMutation = useMutation({
        mutationFn: async (userId: string) => {
            if (!currentHub) throw new Error('No hub selected');
            return removeMemberFromHub(currentHub.id, userId);
        },
        onSuccess: (response) => {
            if (response.success) {
                queryClient.invalidateQueries({ queryKey: ['hub-members', currentHub?.id] });
                queryClient.invalidateQueries({ queryKey: ['hubs'] });
                toast.success('Member removed successfully!');
            } else {
                toast.error(response.error || 'Failed to remove member');
            }
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to remove member');
        },
    });

    const handleUpdateRole = (member: HubMember) => {
        if (member.userId === user?.id) {
            toast.error('You cannot change your own role');
            return;
        }
        
        if (editingMember === member.userId) {
            // Save
            updateRoleMutation.mutate({ userId: member.userId, newRole: selectedRole });
        } else {
            // Start editing
            setEditingMember(member.userId);
            setSelectedRole(member.role);
        }
    };

    const handleRemoveMember = async (member: HubMember) => {
        if (member.userId === user?.id) {
            toast.error('You cannot remove yourself. Use "Leave Hub" instead.');
            return;
        }

        if (!confirm(`Are you sure you want to remove ${member.displayName} from this hub?`)) {
            return;
        }

        removeMemberMutation.mutate(member.userId);
    };

    const getRoleBadgeColor = (role: UserRole) => {
        switch (role) {
            case 'admin':
                return 'bg-primary-container text-primary';
            case 'member':
                return 'bg-secondary-container text-secondary';
            case 'observer':
                return 'bg-surface-variant text-on-variant';
            default:
                return 'bg-surface-variant text-on-variant';
        }
    };

    if (!isOpen || !currentHub) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 py-8 sm:py-4 min-h-screen overflow-y-auto bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-2xl bg-surface rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-outline-variant flex-shrink-0">
                    <div>
                        <h2 className="text-headline-sm font-semibold text-on-surface">Manage Members</h2>
                        <p className="text-body-sm text-on-variant mt-1">
                            {members?.length || 0} {members?.length === 1 ? 'member' : 'members'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-surface-variant rounded-full transition-colors"
                        aria-label="Close"
                    >
                        <FiX size={20} className="text-on-variant" />
                    </button>
                </div>

                {/* Members List */}
                <div className="flex-1 overflow-y-auto p-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <LoadingSpinner size="medium" />
                        </div>
                    ) : !members || members.length === 0 ? (
                        <div className="text-center py-12">
                            <FiUser size={48} className="text-on-variant mx-auto mb-4 opacity-50" />
                            <p className="text-body-md text-on-variant">No members found</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {members.map((member) => (
                                <Card key={member.userId} elevation={1}>
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                {/* Avatar */}
                                                <div className="flex-shrink-0">
                                                    {member.photoURL ? (
                                                        <img
                                                            src={member.photoURL}
                                                            alt={member.displayName}
                                                            className="w-10 h-10 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
                                                            <FiUser size={20} className="text-primary" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Member Info */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-body-md font-semibold text-on-surface truncate">
                                                        {member.displayName}
                                                        {member.userId === user?.id && (
                                                            <span className="text-body-sm text-on-variant ml-2">(You)</span>
                                                        )}
                                                    </p>
                                                    <p className="text-body-sm text-on-variant truncate">{member.email}</p>
                                                </div>

                                                {/* Role Selection */}
                                                {editingMember === member.userId ? (
                                                    <div className="flex items-center gap-2">
                                                        <select
                                                            value={selectedRole}
                                                            onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                                                            className="px-3 py-1.5 border border-outline rounded-lg bg-surface text-on-surface text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                                            disabled={updateRoleMutation.isPending}
                                                        >
                                                            <option value="member">Member</option>
                                                            <option value="admin">Admin</option>
                                                            <option value="observer">Observer</option>
                                                        </select>
                                                        <Button
                                                            variant="filled"
                                                            size="small"
                                                            onClick={() => handleUpdateRole(member)}
                                                            disabled={updateRoleMutation.isPending || selectedRole === member.role}
                                                        >
                                                            Save
                                                        </Button>
                                                        <Button
                                                            variant="outlined"
                                                            size="small"
                                                            onClick={() => setEditingMember(null)}
                                                            disabled={updateRoleMutation.isPending}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className={`px-3 py-1 rounded-full text-label-sm font-semibold capitalize ${getRoleBadgeColor(
                                                                member.role
                                                            )}`}
                                                        >
                                                            {member.role}
                                                        </span>
                                                        {member.userId !== user?.id && (
                                                            <>
                                                                <Button
                                                                    variant="outlined"
                                                                    size="small"
                                                                    onClick={() => handleUpdateRole(member)}
                                                                    startIcon={<FiEdit2 size={16} />}
                                                                >
                                                                    Change Role
                                                                </Button>
                                                                <button
                                                                    onClick={() => handleRemoveMember(member)}
                                                                    disabled={removeMemberMutation.isPending}
                                                                    className="px-4 py-2 text-label-sm font-semibold rounded-full border-2 border-error text-error hover:bg-error-container disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 min-h-[44px]"
                                                                >
                                                                    <FiTrash2 size={16} />
                                                                    Remove
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
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
    );
};

