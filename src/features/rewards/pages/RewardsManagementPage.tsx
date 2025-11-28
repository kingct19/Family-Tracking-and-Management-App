/**
 * RewardsManagementPage - Admin page for managing hub rewards
 */

import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { 
    MdAdd, 
    MdEmojiEvents, 
    MdArrowBack,
    MdStar,
    MdTaskAlt,
    MdLocalFireDepartment,
    MdFilterList,
} from 'react-icons/md';
import { useHasRole } from '@/features/auth/hooks/useAuth';
import { useHubStore } from '@/lib/store/hub-store';
import { 
    useHubRewards, 
    useCreateReward, 
    useUpdateReward, 
    useDeleteReward 
} from '../hooks/useRewards';
import { RewardCard } from '../components/RewardCard';
import { RewardModal } from '../components/RewardModal';
import { uploadRewardImage } from '@/lib/services/storage-service';
import type { Reward, RewardType } from '@/types';
import toast from 'react-hot-toast';

const RewardsManagementPage = () => {
    const navigate = useNavigate();
    const { currentHub } = useHubStore();
    const isAdmin = useHasRole('admin');

    const { data: rewards = [], isLoading } = useHubRewards();
    const createRewardMutation = useCreateReward();
    const updateRewardMutation = useUpdateReward();
    const deleteRewardMutation = useDeleteReward();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingReward, setEditingReward] = useState<Reward | null>(null);
    const [filterType, setFilterType] = useState<RewardType | 'all'>('all');

    // Redirect non-admins
    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 rounded-2xl bg-error/10 flex items-center justify-center mb-6">
                    <MdEmojiEvents size={40} className="text-error" />
                </div>
                <h2 className="text-headline-sm font-bold text-on-surface mb-2">Access Denied</h2>
                <p className="text-body-md text-on-variant mb-6">
                    Only admins can manage rewards.
                </p>
                <button
                    onClick={() => navigate(-1)}
                    className="px-6 py-2.5 bg-primary text-on-primary font-semibold rounded-xl hover:bg-primary/90 transition-colors"
                >
                    Go Back
                </button>
            </div>
        );
    }

    const handleCreate = () => {
        setEditingReward(null);
        setIsModalOpen(true);
    };

    const handleEdit = (reward: Reward) => {
        setEditingReward(reward);
        setIsModalOpen(true);
    };

    const handleDelete = async (reward: Reward) => {
        if (!confirm(`Are you sure you want to delete "${reward.title}"? This cannot be undone.`)) {
            return;
        }

        try {
            await deleteRewardMutation.mutateAsync(reward.id);
            toast.success('Reward deleted');
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete reward');
        }
    };

    const handleSubmit = async (
        data: {
            title: string;
            description: string;
            icon: string;
            imageURL?: string | null;
            type: RewardType;
            threshold: number;
        },
        imageFile?: File | null
    ) => {
        try {
            if (editingReward) {
                // For editing, update the reward (excluding imageURL, we'll handle that separately)
                const { imageURL: _imageURL, ...updateData } = data;
                await updateRewardMutation.mutateAsync({
                    rewardId: editingReward.id,
                    updates: updateData,
                });
                
                // If new image file was selected, upload it
                if (imageFile && currentHub && editingReward) {
                    try {
                        const uploadedURL = await uploadRewardImage(imageFile, currentHub.id, editingReward.id);
                        await updateRewardMutation.mutateAsync({
                            rewardId: editingReward.id,
                            updates: { imageURL: uploadedURL },
                        });
                    } catch (uploadError: any) {
                        console.error('Image upload error:', uploadError);
                        toast.error('Reward updated but image upload failed');
                    }
                }
                
                // If imageURL is null, it means user removed the image - update to clear it
                if (data.imageURL === null) {
                    await updateRewardMutation.mutateAsync({
                        rewardId: editingReward.id,
                        updates: { imageURL: null },
                    });
                }
                
                toast.success('Reward updated');
            } else {
                // For creating, create reward first, then upload image if provided
                // Exclude imageURL from initial creation since we'll upload it after
                const { imageURL: _imageURL, ...createData } = data;
                const createdReward = await createRewardMutation.mutateAsync(createData);
                
                // Upload image after reward is created (so we have the rewardId)
                if (imageFile && createdReward && currentHub) {
                    try {
                        const uploadedURL = await uploadRewardImage(imageFile, currentHub.id, createdReward.id);
                        // Update the reward with the image URL
                        await updateRewardMutation.mutateAsync({
                            rewardId: createdReward.id,
                            updates: { imageURL: uploadedURL },
                        });
                    } catch (uploadError: any) {
                        console.error('Image upload error:', uploadError);
                        toast.error('Reward created but image upload failed');
                    }
                }
                
                toast.success('Reward created');
            }
            setIsModalOpen(false);
        } catch (error: any) {
            toast.error(error.message || 'Failed to save reward');
        }
    };

    const filteredRewards = rewards.filter(reward => 
        filterType === 'all' || reward.type === filterType
    );

    const rewardsByType = {
        xp: rewards.filter(r => r.type === 'xp'),
        tasks: rewards.filter(r => r.type === 'tasks'),
        streak: rewards.filter(r => r.type === 'streak'),
    };

    return (
        <>
            <Helmet>
                <title>Manage Rewards - HaloHub</title>
            </Helmet>

            <div className="space-y-6">
                {/* Header */}
                <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 rounded-xl hover:bg-surface-variant text-on-variant transition-colors"
                        >
                            <MdArrowBack size={24} />
                        </button>
                        <div>
                            <h1 className="text-headline-md font-bold text-on-surface">
                                Manage Rewards
                            </h1>
                            <p className="text-body-md text-on-variant">
                                Create rewards to motivate members in {currentHub?.name}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleCreate}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                    >
                        <MdAdd size={20} />
                        Create Reward
                    </button>
                </header>

                {/* Stats overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="rounded-2xl bg-white border border-outline-variant/50 p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <MdEmojiEvents size={24} className="text-primary" />
                            </div>
                            <div>
                                <p className="text-headline-sm font-bold text-on-surface">{rewards.length}</p>
                                <p className="text-label-sm text-on-variant">Total</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-2xl bg-white border border-outline-variant/50 p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                                <MdStar size={24} className="text-amber-500" />
                            </div>
                            <div>
                                <p className="text-headline-sm font-bold text-on-surface">{rewardsByType.xp.length}</p>
                                <p className="text-label-sm text-on-variant">XP Based</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-2xl bg-white border border-outline-variant/50 p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                                <MdTaskAlt size={24} className="text-emerald-500" />
                            </div>
                            <div>
                                <p className="text-headline-sm font-bold text-on-surface">{rewardsByType.tasks.length}</p>
                                <p className="text-label-sm text-on-variant">Task Based</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-2xl bg-white border border-outline-variant/50 p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                                <MdLocalFireDepartment size={24} className="text-orange-500" />
                            </div>
                            <div>
                                <p className="text-headline-sm font-bold text-on-surface">{rewardsByType.streak.length}</p>
                                <p className="text-label-sm text-on-variant">Streak Based</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 hide-scrollbar">
                    {[
                        { value: 'all', label: 'All', icon: MdFilterList },
                        { value: 'xp', label: 'XP', icon: MdStar },
                        { value: 'tasks', label: 'Tasks', icon: MdTaskAlt },
                        { value: 'streak', label: 'Streak', icon: MdLocalFireDepartment },
                    ].map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => setFilterType(tab.value as RewardType | 'all')}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                                filterType === tab.value
                                    ? 'bg-primary text-on-primary shadow-md'
                                    : 'bg-surface-variant text-on-variant hover:bg-surface-variant/80'
                            }`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Rewards grid */}
                {isLoading ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="rounded-2xl bg-white border border-outline-variant/50 p-4 animate-pulse">
                                <div className="flex gap-3">
                                    <div className="w-14 h-14 rounded-xl bg-slate-200" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-5 bg-slate-200 rounded w-3/4" />
                                        <div className="h-4 bg-slate-200 rounded w-full" />
                                    </div>
                                </div>
                                <div className="mt-4 h-2 bg-slate-200 rounded" />
                            </div>
                        ))}
                    </div>
                ) : filteredRewards.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-20 h-20 rounded-2xl bg-amber-50 flex items-center justify-center mb-6">
                            <MdEmojiEvents size={40} className="text-amber-400" />
                        </div>
                        <h2 className="text-headline-sm font-bold text-on-surface mb-2">
                            {filterType === 'all' ? 'No rewards yet' : `No ${filterType} rewards`}
                        </h2>
                        <p className="text-body-md text-on-variant max-w-sm mb-6">
                            {filterType === 'all' 
                                ? 'Create rewards to motivate your hub members!'
                                : `Create ${filterType === 'xp' ? 'XP-based' : filterType === 'tasks' ? 'task-based' : 'streak-based'} rewards to unlock.`
                            }
                        </p>
                        <button
                            onClick={handleCreate}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary font-semibold rounded-xl hover:bg-primary/90 transition-colors"
                        >
                            <MdAdd size={20} />
                            Create First Reward
                        </button>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredRewards.map((reward) => (
                            <RewardCard
                                key={reward.id}
                                reward={reward}
                                isAdmin={true}
                                onEdit={() => handleEdit(reward)}
                                onDelete={() => handleDelete(reward)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            <RewardModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                reward={editingReward}
                isLoading={createRewardMutation.isPending || updateRewardMutation.isPending}
            />
        </>
    );
};

export default RewardsManagementPage;

