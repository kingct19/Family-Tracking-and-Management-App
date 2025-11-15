/**
 * HubSelector Component
 * 
 * Dropdown to switch between user's hubs
 */

import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FiUsers, FiChevronDown, FiCheck, FiPlus, FiKey } from 'react-icons/fi';
import { useHubStore } from '@/lib/store/hub-store';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { getUserHubs, getUserMembership } from '@/lib/api/hub-api';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { CreateHubModal } from '@/features/hubs/components/CreateHubModal';
import { JoinHubModal } from '@/features/hubs/components/JoinHubModal';
import toast from 'react-hot-toast';

export const HubSelector = () => {
    const { user } = useAuth();
    const { currentHub, setCurrentHub } = useHubStore();
    const [isOpen, setIsOpen] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
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
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
                aria-label="Select hub"
                aria-expanded={isOpen}
            >
                <FiUsers size={18} className="text-purple-600" />
                <span className="font-semibold text-gray-900 text-sm hidden sm:inline">
                    {currentHub?.name || 'Select Hub'}
                </span>
                <span className="font-semibold text-gray-900 text-sm sm:hidden">
                    Hub
                </span>
                <FiChevronDown 
                    size={16} 
                    className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
                />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-96 overflow-hidden">
                    <div className="p-2">
                        {/* Action Buttons */}
                        <div className="space-y-1 mb-2 pb-2 border-b border-gray-200">
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    setShowCreateModal(true);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-purple-50 transition-colors"
                            >
                                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                                    <FiPlus size={18} className="text-purple-600" />
                                </div>
                                <span className="font-medium">Create Hub</span>
                            </button>
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    setShowJoinModal(true);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-indigo-50 transition-colors"
                            >
                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                    <FiKey size={18} className="text-indigo-600" />
                                </div>
                                <span className="font-medium">Join Hub</span>
                            </button>
                        </div>

                        {/* Hub List */}
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <LoadingSpinner />
                            </div>
                        ) : hubs && hubs.length > 0 ? (
                            <div className="space-y-1">
                                {hubs.map((hub) => (
                                    <button
                                        key={hub.id}
                                        onClick={() => handleHubSelect(hub.id)}
                                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                                            hub.id === currentHub?.id
                                                ? 'bg-purple-100 text-purple-700 font-semibold'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-sm font-semibold">
                                                {hub.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="text-left">
                                                <div className="font-medium">{hub.name}</div>
                                                {hub.description && (
                                                    <div className="text-xs text-gray-500 truncate">
                                                        {hub.description}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {hub.id === currentHub?.id && (
                                            <FiCheck size={18} className="text-purple-600" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <p className="text-sm">No hubs found</p>
                                <p className="text-xs mt-1">Create or join a hub to get started</p>
                            </div>
                        )}
                    </div>
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
        </div>
    );
};
