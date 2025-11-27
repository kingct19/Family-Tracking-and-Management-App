/**
 * HubSelector Component
 * 
 * Dropdown to switch between user's hubs
 */

import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MdPeople, MdExpandMore, MdCheck, MdAdd, MdVpnKey, MdExitToApp, MdDelete } from 'react-icons/md';
import { useHubStore } from '@/lib/store/hub-store';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { getUserHubs, getUserMembership } from '@/lib/api/hub-api';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { CreateHubModal } from '@/features/hubs/components/CreateHubModal';
import { JoinHubModal } from '@/features/hubs/components/JoinHubModal';
import { LeaveHubModal } from '@/features/hubs/components/LeaveHubModal';
import { DeleteHubModal } from '@/features/hubs/components/DeleteHubModal';
import toast from 'react-hot-toast';

export const HubSelector = () => {
    const { user } = useAuth();
    const { currentHub, setCurrentHub, currentRole } = useHubStore();
    const [isOpen, setIsOpen] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fetch user's hubs
    const { data: hubs, isLoading } = useQuery({
        queryKey: ['hubs', user?.id],
        queryFn: async () => {
            if (!user) throw new Error('User not authenticated');
            const response = await getUserHubs(user.id);
            if (!response.success) throw new Error(response.error);
            return response.data || [];
        },
        enabled: !!user,
    });

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleHubSelect = async (hubId: string) => {
        if (!user || hubId === currentHub?.id) {
            setIsOpen(false);
            return;
        }

        try {
            const membershipResponse = await getUserMembership(hubId, user.id);
            if (membershipResponse.success && membershipResponse.data) {
                const selectedHub = hubs?.find(h => h.id === hubId);
                if (selectedHub) {
                    setCurrentHub(selectedHub, membershipResponse.data.role);
                    toast.success(`Switched to ${selectedHub.name}`, {
                        icon: '🔄',
                        duration: 2000,
                    });
                    // Invalidate queries to refresh data for new hub
                    // This will be handled by React Query automatically when currentHub changes
                }
            }
        } catch (error) {
            console.error('Failed to switch hub:', error);
            toast.error('Failed to switch hub');
        }

        setIsOpen(false);
    };

    if (!user) return null;

    return (
        <div className="relative z-[60]" ref={dropdownRef}>
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                className="flex items-center gap-1 sm:gap-1.5 md:gap-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-surface rounded-full shadow-elevation-2 hover:shadow-elevation-3 transition-all duration-200 hover:scale-105 active:scale-95 touch-target"
                aria-label="Select hub"
                aria-expanded={isOpen}
                type="button"
            >
                <MdPeople size={16} className="text-primary sm:w-[18px] sm:h-[18px]" />
                <span className="font-semibold text-on-surface text-label-sm sm:text-body-sm hidden sm:inline truncate max-w-[100px] md:max-w-none">
                    {currentHub?.name || 'Select Hub'}
                </span>
                <span className="font-semibold text-on-surface text-label-sm sm:hidden">
                    Hub
                </span>
                <MdExpandMore 
                    size={14} 
                    className={`text-on-variant transition-transform sm:w-4 sm:h-4 ${isOpen ? 'rotate-180' : ''}`} 
                />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 sm:w-72 bg-surface rounded-card shadow-halo-map-card border border-outline-variant z-[100] max-h-[60vh] sm:max-h-96 overflow-hidden flex flex-col">
                    {/* Action Buttons - Fixed header */}
                    <div className="p-2 flex-shrink-0 border-b border-outline-variant/30">
                        <div className="space-y-1">
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setIsOpen(false);
                                    setShowCreateModal(true);
                                }}
                                className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-on-surface hover:bg-primary-container transition-colors touch-target"
                                type="button"
                            >
                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0">
                                    <MdAdd size={16} className="text-primary sm:w-[18px] sm:h-[18px]" />
                                </div>
                                <span className="font-medium text-body-sm sm:text-body-md">Create Hub</span>
                            </button>
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setIsOpen(false);
                                    setShowJoinModal(true);
                                }}
                                className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-on-surface hover:bg-primary-container transition-colors touch-target"
                                type="button"
                            >
                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0">
                                    <MdVpnKey size={16} className="text-primary sm:w-[18px] sm:h-[18px]" />
                                </div>
                                <span className="font-medium text-body-sm sm:text-body-md">Join Hub</span>
                            </button>
                        </div>
                    </div>

                    {/* Hub List - Scrollable */}
                    <div className="overflow-y-auto flex-1 min-h-0">
                        <div className="p-2">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <LoadingSpinner />
                                </div>
                            ) : hubs && hubs.length > 0 ? (
                                <div className="space-y-1">
                                    {hubs.map((hub) => (
                                        <button
                                            key={hub.id}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleHubSelect(hub.id);
                                            }}
                                            className={`w-full flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg transition-colors touch-target ${
                                                hub.id === currentHub?.id
                                                    ? 'bg-primary-container text-primary font-semibold'
                                                    : 'text-on-surface hover:bg-surface-variant'
                                            }`}
                                            type="button"
                                        >
                                            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full gradient-iris-glow flex items-center justify-center text-white text-label-sm sm:text-body-sm font-semibold flex-shrink-0">
                                                    {hub.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="text-left min-w-0 flex-1">
                                                    <div className="font-medium text-body-sm sm:text-body-md truncate">{hub.name}</div>
                                                    {hub.description && (
                                                        <div className="text-label-sm sm:text-xs text-on-variant truncate">
                                                            {hub.description}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {hub.id === currentHub?.id && (
                                                <MdCheck size={16} className="text-primary sm:w-[18px] sm:h-[18px] flex-shrink-0" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-on-variant">
                                    <p className="text-body-sm">No hubs found</p>
                                    <p className="text-label-sm mt-1">Create or join a hub to get started</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Hub Actions - Only show if a hub is selected */}
                    {currentHub && (
                        <div className="p-2 pt-0 border-t border-outline-variant/30 flex-shrink-0">
                            <div className="space-y-1">
                                {/* Leave Hub - All members */}
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setIsOpen(false);
                                        setShowLeaveModal(true);
                                    }}
                                    className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-on-surface hover:bg-orange-50 hover:text-orange-700 transition-colors touch-target"
                                    type="button"
                                >
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                                        <MdExitToApp size={16} className="text-orange-600 sm:w-[18px] sm:h-[18px]" />
                                    </div>
                                    <span className="font-medium text-body-sm sm:text-body-md">Leave Hub</span>
                                </button>

                                {/* Delete Hub - Admin only */}
                                {currentRole === 'admin' && (
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setIsOpen(false);
                                            setShowDeleteModal(true);
                                        }}
                                        className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-on-surface hover:bg-red-50 hover:text-red-700 transition-colors touch-target"
                                        type="button"
                                    >
                                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                            <MdDelete size={16} className="text-red-600 sm:w-[18px] sm:h-[18px]" />
                                        </div>
                                        <span className="font-medium text-body-sm sm:text-body-md">Delete Hub</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Modals */}
            <CreateHubModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
            />
            <JoinHubModal
                isOpen={showJoinModal}
                onClose={() => setShowJoinModal(false)}
            />
            <LeaveHubModal
                isOpen={showLeaveModal}
                onClose={() => setShowLeaveModal(false)}
            />
            <DeleteHubModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
            />
        </div>
    );
};
