/**
 * RewardCard - Displays a single reward with progress
 */

import { useState } from 'react';
import { 
    MdEmojiEvents, 
    MdLock, 
    MdLockOpen, 
    MdCheck, 
    MdEdit, 
    MdDelete,
    MdStar,
    MdTaskAlt,
    MdLocalFireDepartment,
} from 'react-icons/md';
import type { Reward, RewardType } from '@/types';

interface RewardCardProps {
    reward: Reward & {
        isUnlocked?: boolean;
        isClaimed?: boolean;
        userRewardId?: string;
    };
    currentProgress?: number;
    isAdmin?: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
    onClaim?: () => void;
}

export const RewardCard = ({
    reward,
    currentProgress = 0,
    isAdmin = false,
    onEdit,
    onDelete,
    onClaim,
}: RewardCardProps) => {
    const [showActions, setShowActions] = useState(false);

    const progressPercent = Math.min(100, Math.round((currentProgress / reward.threshold) * 100));
    const isUnlocked = reward.isUnlocked || currentProgress >= reward.threshold;
    const isClaimed = reward.isClaimed;

    const getTypeIcon = (type: RewardType) => {
        switch (type) {
            case 'xp':
                return <MdStar size={16} className="text-amber-500" />;
            case 'tasks':
                return <MdTaskAlt size={16} className="text-emerald-500" />;
            case 'streak':
                return <MdLocalFireDepartment size={16} className="text-orange-500" />;
        }
    };

    const getTypeLabel = (type: RewardType) => {
        switch (type) {
            case 'xp':
                return 'XP';
            case 'tasks':
                return 'Tasks';
            case 'streak':
                return 'Day Streak';
        }
    };

    const getTypeColor = (type: RewardType) => {
        switch (type) {
            case 'xp':
                return 'from-amber-400 to-orange-500';
            case 'tasks':
                return 'from-emerald-400 to-teal-500';
            case 'streak':
                return 'from-orange-400 to-red-500';
        }
    };

    return (
        <div
            className={`relative rounded-2xl border transition-all duration-300 overflow-hidden ${
                isUnlocked
                    ? 'bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border-amber-200 shadow-lg shadow-amber-100/50'
                    : 'bg-white border-outline-variant/50 hover:border-outline-variant'
            }`}
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
        >
            {/* Unlocked glow effect */}
            {isUnlocked && !isClaimed && (
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400/10 to-orange-400/10 animate-pulse" />
            )}

            <div className="relative p-4">
                {/* Header */}
                <div className="flex items-start gap-3">
                    {/* Icon/Image */}
                    <div className={`relative flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden ${
                        isUnlocked
                            ? `bg-gradient-to-br ${getTypeColor(reward.type)} shadow-lg`
                            : 'bg-slate-100'
                    }`}>
                        {reward.imageURL ? (
                            <img 
                                src={reward.imageURL} 
                                alt={reward.title}
                                className={`w-full h-full object-cover ${isUnlocked ? '' : 'grayscale opacity-60'}`}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-3xl">
                                <span className={isUnlocked ? 'drop-shadow-md' : 'grayscale opacity-60'}>
                                    {reward.icon}
                                </span>
                            </div>
                        )}
                        
                        {/* Lock/Unlock badge */}
                        <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center shadow-md ${
                            isUnlocked 
                                ? isClaimed 
                                    ? 'bg-emerald-500 text-white' 
                                    : 'bg-amber-400 text-white'
                                : 'bg-slate-300 text-slate-600'
                        }`}>
                            {isClaimed ? (
                                <MdCheck size={14} />
                            ) : isUnlocked ? (
                                <MdLockOpen size={12} />
                            ) : (
                                <MdLock size={12} />
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <h3 className={`text-title-md font-bold truncate ${
                            isUnlocked ? 'text-slate-900' : 'text-on-surface'
                        }`}>
                            {reward.title}
                        </h3>
                        <p className="text-body-sm text-on-variant line-clamp-2 mt-0.5">
                            {reward.description}
                        </p>
                    </div>

                    {/* Admin actions */}
                    {isAdmin && (
                        <div className={`flex items-center gap-1 transition-opacity ${
                            showActions ? 'opacity-100' : 'opacity-0'
                        }`}>
                            <button
                                onClick={onEdit}
                                className="p-2 rounded-lg hover:bg-surface-variant text-on-variant hover:text-primary transition-colors"
                            >
                                <MdEdit size={18} />
                            </button>
                            <button
                                onClick={onDelete}
                                className="p-2 rounded-lg hover:bg-error/10 text-on-variant hover:text-error transition-colors"
                            >
                                <MdDelete size={18} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Progress section */}
                <div className="mt-4">
                    {/* Threshold badge */}
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5 text-label-sm text-on-variant">
                            {getTypeIcon(reward.type)}
                            <span className="font-medium">
                                {reward.threshold.toLocaleString()} {getTypeLabel(reward.type)}
                            </span>
                        </div>
                        {!isUnlocked && (
                            <span className="text-label-sm font-semibold text-primary">
                                {progressPercent}%
                            </span>
                        )}
                        {isUnlocked && !isClaimed && (
                            <span className="text-label-sm font-semibold text-amber-600 animate-pulse">
                                Unlocked!
                            </span>
                        )}
                        {isClaimed && (
                            <span className="text-label-sm font-semibold text-emerald-600">
                                Claimed
                            </span>
                        )}
                    </div>

                    {/* Progress bar */}
                    {!isUnlocked && (
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full bg-gradient-to-r ${getTypeColor(reward.type)} transition-all duration-500`}
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    )}

                    {/* Claim button */}
                    {isUnlocked && !isClaimed && onClaim && (
                        <button
                            onClick={onClaim}
                            className="w-full mt-3 py-2.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-200/50 flex items-center justify-center gap-2"
                        >
                            <MdEmojiEvents size={20} />
                            Claim Reward
                        </button>
                    )}
                </div>

                {/* Inactive badge */}
                {!reward.isActive && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 bg-slate-200 text-slate-600 text-label-sm font-medium rounded-full">
                        Inactive
                    </div>
                )}
            </div>
        </div>
    );
};

