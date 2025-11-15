import { cn } from '@/lib/utils/cn';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular';
    width?: string | number;
    height?: string | number;
}

export const Skeleton = ({
    className,
    variant = 'rectangular',
    width,
    height,
}: SkeletonProps) => {
    const variantStyles = {
        text: 'rounded',
        circular: 'rounded-full',
        rectangular: 'rounded-lg',
    };

    return (
        <div
            className={cn(
                'animate-pulse bg-gradient-to-r from-surface-variant via-surface-variant/80 to-surface-variant bg-[length:200%_100%]',
                variantStyles[variant],
                className
            )}
            style={{
                width: width || undefined,
                height: height || undefined,
                animation: 'shimmer 1.5s ease-in-out infinite',
            }}
        />
    );
};

// Task Card Skeleton
export const TaskCardSkeleton = () => {
    return (
        <div className="card p-6">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton variant="rectangular" className="h-6 w-20 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6 mb-4" />
            <div className="flex items-center gap-2">
                <Skeleton variant="circular" className="h-8 w-8" />
                <Skeleton className="h-8 w-24 rounded-full" />
            </div>
        </div>
    );
};

// Message Bubble Skeleton
export const MessageBubbleSkeleton = ({ isOwn = false }: { isOwn?: boolean }) => {
    return (
        <div className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
            {!isOwn && <Skeleton variant="circular" className="h-10 w-10" />}
            <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[75%]`}>
                <Skeleton className="h-16 w-64 rounded-2xl" />
                <Skeleton className="h-3 w-16 mt-2" />
            </div>
        </div>
    );
};

// User Avatar Skeleton
export const AvatarSkeleton = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
    const sizeMap = {
        sm: 'h-8 w-8',
        md: 'h-10 w-10',
        lg: 'h-12 w-12',
    };

    return <Skeleton variant="circular" className={sizeMap[size]} />;
};

// Card Skeleton
export const CardSkeleton = () => {
    return (
        <div className="card p-6">
            <Skeleton className="h-6 w-3/4 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
        </div>
    );
};

// List Item Skeleton
export const ListItemSkeleton = () => {
    return (
        <div className="flex items-center gap-4 p-4">
            <Skeleton variant="circular" className="h-12 w-12" />
            <div className="flex-1">
                <Skeleton className="h-5 w-1/2 mb-2" />
                <Skeleton className="h-4 w-3/4" />
            </div>
            <Skeleton className="h-8 w-20" />
        </div>
    );
};

// XP Progress Skeleton
export const XPProgressSkeleton = () => {
    return (
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-8 w-20" />
            </div>
            <Skeleton className="h-3 w-full rounded-full mb-4" />
            <div className="grid grid-cols-3 gap-4">
                <div>
                    <Skeleton className="h-4 w-16 mb-2" />
                    <Skeleton className="h-8 w-full" />
                </div>
                <div>
                    <Skeleton className="h-4 w-16 mb-2" />
                    <Skeleton className="h-8 w-full" />
                </div>
                <div>
                    <Skeleton className="h-4 w-16 mb-2" />
                    <Skeleton className="h-8 w-full" />
                </div>
            </div>
        </div>
    );
};

// Leaderboard Skeleton
export const LeaderboardSkeleton = () => {
    return (
        <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="card p-5">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton variant="circular" className="h-12 w-12" />
                        <div className="flex-1">
                            <Skeleton className="h-5 w-32 mb-2" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                        <Skeleton className="h-8 w-16 rounded-full" />
                    </div>
                </div>
            ))}
        </div>
    );
};

// Dashboard Stats Skeleton
export const DashboardStatsSkeleton = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <Skeleton variant="circular" className="h-12 w-12" />
                        <Skeleton className="h-5 w-5 rounded-full" />
                    </div>
                    <Skeleton className="h-9 w-20 mb-1" />
                    <Skeleton className="h-4 w-24" />
                </div>
            ))}
        </div>
    );
};

// Dashboard Quick Actions Skeleton
export const DashboardQuickActionsSkeleton = () => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="card p-6">
                    <Skeleton variant="circular" className="h-14 w-14 mb-4" />
                    <Skeleton className="h-5 w-24 mb-2" />
                    <Skeleton className="h-4 w-32" />
                </div>
            ))}
        </div>
    );
};

// Vault Item Skeleton
export const VaultItemSkeleton = () => {
    return (
        <div className="card p-6">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <Skeleton variant="circular" className="h-10 w-10" />
                    <div className="flex-1">
                        <Skeleton className="h-5 w-32 mb-2" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
        </div>
    );
};

// Pending Approval Card Skeleton
export const PendingApprovalSkeleton = () => {
    return (
        <div className="card p-6">
            <div className="flex flex-col md:flex-row gap-6">
                <Skeleton className="w-full md:w-64 h-48 rounded-xl" />
                <div className="flex-1 space-y-4">
                    <div>
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-full" />
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                    <div className="flex gap-3 pt-4 border-t border-outline-variant">
                        <Skeleton className="h-11 w-24 rounded-full" />
                        <Skeleton className="h-11 w-24 rounded-full" />
                    </div>
                </div>
            </div>
        </div>
    );
};

// Add shimmer animation to global styles
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shimmer {
            0% {
                background-position: -200% 0;
            }
            100% {
                background-position: 200% 0;
            }
        }
    `;
    document.head.appendChild(style);
}

