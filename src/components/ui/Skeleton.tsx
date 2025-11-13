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
                'animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]',
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
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton variant="rectangular" className="h-6 w-20" />
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6 mb-4" />
            <div className="flex items-center gap-2">
                <Skeleton variant="circular" className="h-8 w-8" />
                <Skeleton className="h-8 w-24" />
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
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
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
        <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-6">
                <Skeleton className="h-7 w-40 bg-white/20" />
            </div>
            <div className="p-6 space-y-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-8 w-8" />
                        <Skeleton variant="circular" className="h-12 w-12" />
                        <div className="flex-1">
                            <Skeleton className="h-5 w-32 mb-1" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                        <Skeleton className="h-8 w-16" />
                    </div>
                ))}
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

