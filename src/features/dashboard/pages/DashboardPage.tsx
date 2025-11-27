import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useHubStore } from '@/lib/store/hub-store';
import { useHasRole } from '@/features/auth/hooks/useAuth';
import { useHubTasks } from '@/features/tasks/hooks/useTasks';
import { useHubMessages } from '@/features/messages/hooks/useMessages';
import { useHubBroadcasts } from '@/features/messages/hooks/useBroadcasts';
import { MiniMapPreview } from '../components/MiniMapPreview';
import { LeaderboardWidget } from '../components/LeaderboardWidget';
import { RewardsWidget } from '@/features/rewards/components/RewardsWidget';
import {
    MdTaskAlt,
    MdChat,
    MdLock,
    MdEmojiEvents,
    MdCheckCircle,
    MdNotificationsActive,
    MdArrowOutward,
    MdShield,
    MdAdd,
    MdVerified,
    MdLocationOn,
    MdPeople,
} from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';

const DashboardPage = () => {
    const { user } = useAuth();
    const { currentHub } = useHubStore();
    const isAdmin = useHasRole('admin');
    const navigate = useNavigate();

    const { data: tasks = [] } = useHubTasks();
    const { messages = [] } = useHubMessages(currentHub?.id);
    const { data: broadcasts = [] } = useHubBroadcasts();

    const taskStats = useMemo(() => {
        const activeTasks = tasks.filter(t => t.status === 'pending' || t.status === 'assigned').length;
        const completedTasks = tasks.filter(t => t.status === 'done' || t.status === 'approved').length;
        const pendingApprovals = tasks.filter(t => t.proofStatus === 'pending').length;
        const assignedToMe = tasks.filter(t => t.assignedTo === user?.id && (t.status === 'pending' || t.status === 'assigned')).length;

        return {
            active: activeTasks,
            completed: completedTasks,
            pendingApprovals,
            assignedToMe,
            total: tasks.length,
            completionRate: tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0,
        };
    }, [tasks, user?.id]);

    const recentActivity = useMemo(() => {
        const activities: Array<{
            id: string;
            title: string;
            description: string;
            timestamp: Date;
            icon: React.ReactNode;
        }> = [];

        tasks.slice(0, 3).forEach(task => {
            if (task.status === 'done' || task.status === 'approved') {
                activities.push({
                    id: `task-${task.id}`,
                    title: 'Task completed',
                    description: task.title,
                    timestamp: task.completedAt || task.updatedAt,
                    icon: <MdCheckCircle size={16} />,
                });
            }
        });

        messages.slice(-3).forEach(message => {
            activities.push({
                id: `message-${message.id}`,
                title: message.senderName,
                description: message.text.substring(0, 40) + (message.text.length > 40 ? '...' : ''),
                timestamp: message.timestamp,
                icon: <MdChat size={16} />,
            });
        });

        broadcasts.slice(0, 2).forEach(broadcast => {
            activities.push({
                id: `broadcast-${broadcast.id}`,
                title: broadcast.title,
                description: broadcast.message.substring(0, 40),
                timestamp: broadcast.timestamp,
                icon: <MdNotificationsActive size={16} />,
            });
        });

        return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 4);
    }, [tasks, messages, broadcasts]);

    const getTimeGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 6) return '🌙';
        if (hour < 12) return '☀️';
        if (hour < 18) return '🌤️';
        return '🌙';
    };

    // Progress ring component
    const ProgressRing = ({ progress, size = 72, stroke = 6 }: { progress: number; size?: number; stroke?: number }) => {
        const radius = (size - stroke) / 2;
        const circumference = radius * 2 * Math.PI;
        const offset = circumference - (progress / 100) * circumference;

        return (
            <svg width={size} height={size} className="transform -rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={stroke}
                    className="text-outline-variant/30"
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="#7C5CFC"
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className="transition-all duration-700 ease-out"
                />
            </svg>
        );
    };

    return (
        <>
            <Helmet>
                <title>Dashboard - HaloHub</title>
            </Helmet>

            <div className="space-y-6">
                {/* Header */}
                <header className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-body-sm text-on-variant mb-1 flex items-center gap-1.5">
                            {getTimeGreeting()} {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                        </p>
                        <h1 className="text-headline-lg font-bold text-on-surface">
                            Hey, {user?.displayName?.split(' ')[0] || 'there'}
                        </h1>
                    </div>
                    {user?.photoURL ? (
                        <img src={user.photoURL} alt="" className="w-11 h-11 rounded-xl object-cover ring-2 ring-outline-variant" />
                    ) : (
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                            {user?.displayName?.[0] || 'U'}
                        </div>
                    )}
                </header>

                {currentHub ? (
                    <>
                        {/* Main Bento Grid - Clean Layout */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            
                            {/* Hub Status Card with Interactive Mini Map */}
                            <div 
                                className="col-span-2 row-span-2 relative overflow-hidden rounded-2xl"
                                style={{ minHeight: '280px' }}
                            >
                                <MiniMapPreview className="absolute inset-0" />
                            </div>

                            {/* Tasks Card */}
                            <div 
                                onClick={() => navigate('/tasks')}
                                className="col-span-1 relative overflow-hidden rounded-2xl bg-violet-50 p-4 cursor-pointer group hover:bg-violet-100 transition-colors"
                                style={{ minHeight: '130px' }}
                            >
                                <MdTaskAlt size={56} className="absolute -bottom-1 -right-1 text-violet-200" />
                                <div className="relative z-10 h-full flex flex-col">
                                    <span className="text-label-sm text-primary font-semibold">Tasks</span>
                                    <p className="text-display-sm font-black text-slate-900 mt-auto">{taskStats.active}</p>
                                    {taskStats.assignedToMe > 0 && (
                                        <span className="inline-block mt-1 bg-primary text-white text-label-sm font-medium px-2 py-0.5 rounded-full w-fit">
                                            {taskStats.assignedToMe} yours
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Chat Card */}
                            <div 
                                onClick={() => navigate('/messages')}
                                className="col-span-1 relative overflow-hidden rounded-2xl bg-orange-50 p-4 cursor-pointer group hover:bg-orange-100 transition-colors"
                                style={{ minHeight: '130px' }}
                            >
                                <MdChat size={56} className="absolute -bottom-1 -right-1 text-orange-200" />
                                <div className="relative z-10 h-full flex flex-col">
                                    <span className="text-label-sm text-orange-600 font-semibold">Chat</span>
                                    <p className="text-display-sm font-black text-slate-900 mt-auto">{messages.length}</p>
                                </div>
                            </div>

                            {/* Location Card */}
                            <div 
                                onClick={() => navigate('/map')}
                                className="col-span-1 relative overflow-hidden rounded-2xl bg-emerald-50 p-4 cursor-pointer group hover:bg-emerald-100 transition-colors"
                                style={{ minHeight: '130px' }}
                            >
                                <MdLocationOn size={56} className="absolute -bottom-1 -right-1 text-emerald-200" />
                                <div className="relative z-10 h-full flex flex-col">
                                    <span className="text-label-sm text-emerald-600 font-semibold">Location</span>
                                    <p className="text-display-sm font-black text-slate-900 mt-auto">{currentHub.members.length}</p>
                                </div>
                            </div>

                            {/* Vault Card */}
                            <div 
                                onClick={() => navigate('/vault')}
                                className="col-span-1 relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 p-4 cursor-pointer group hover:from-amber-500 hover:to-orange-600 transition-all"
                                style={{ minHeight: '130px' }}
                            >
                                <MdLock size={56} className="absolute -bottom-1 -right-1 text-white/20" />
                                <div className="relative z-10 h-full flex flex-col">
                                    <MdShield size={20} className="text-white/80" />
                                    <div className="mt-auto">
                                        <p className="text-white font-bold text-title-md">Vault</p>
                                        <p className="text-white/70 text-body-sm">Secure</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {/* XP Card */}
                            <div className="col-span-1 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 p-4">
                                <MdEmojiEvents size={24} className="text-amber-300 mb-2" />
                                <p className="text-white/70 text-label-sm">Total XP</p>
                                <p className="text-white font-black text-headline-sm">{user?.xpTotal?.toLocaleString() || 0}</p>
                            </div>

                            {/* Progress Card */}
                            <div className="col-span-1 rounded-2xl bg-white border border-outline-variant/50 p-4 flex items-center gap-3">
                                <div className="relative flex-shrink-0">
                                    <ProgressRing progress={taskStats.completionRate} size={56} stroke={5} />
                                    <span className="absolute inset-0 flex items-center justify-center text-label-md font-bold text-on-surface">
                                        {taskStats.completionRate}%
                                    </span>
                                </div>
                                <div>
                                    <p className="text-label-sm text-on-variant">Completed</p>
                                    <p className="text-title-md font-bold text-on-surface">{taskStats.completed}/{taskStats.total}</p>
                                </div>
                            </div>

                            {/* Admin: Pending Approvals */}
                            {isAdmin && (
                                <div 
                                    onClick={() => navigate('/tasks/pending-approvals')}
                                    className="col-span-2 rounded-2xl bg-emerald-50 p-4 cursor-pointer hover:bg-emerald-100 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0">
                                            <MdVerified size={20} className="text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-title-sm font-bold text-slate-900">Approvals</p>
                                                {taskStats.pendingApprovals > 0 && (
                                                    <span className="bg-orange-500 text-white text-label-sm font-bold px-1.5 py-0.5 rounded-full">
                                                        {taskStats.pendingApprovals}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-body-sm text-slate-500">Review submissions</p>
                                        </div>
                                        <MdArrowOutward size={18} className="text-emerald-400" />
                                    </div>
                                </div>
                            )}

                            {/* If not admin, show placeholder cards */}
                            {!isAdmin && (
                                <div key="non-admin-stats" className="col-span-2 grid grid-cols-2 gap-3">
                                    <div className="rounded-2xl bg-slate-50 p-4">
                                        <p className="text-label-sm text-on-variant">Active</p>
                                        <p className="text-headline-sm font-bold text-on-surface">{taskStats.active}</p>
                                    </div>
                                    <div className="rounded-2xl bg-slate-50 p-4">
                                        <p className="text-label-sm text-on-variant">Done</p>
                                        <p className="text-headline-sm font-bold text-on-surface">{taskStats.completed}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Leaderboard & Rewards */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <LeaderboardWidget />
                            <RewardsWidget />
                        </div>

                        {/* Activity Feed */}
                        {recentActivity.length > 0 && (
                            <div>
                                <h2 className="text-title-md font-bold text-on-surface mb-3">Recent Activity</h2>
                                <div className="rounded-2xl bg-white border border-outline-variant/50 divide-y divide-outline-variant/50">
                                    {recentActivity.map((activity) => (
                                        <div key={activity.id} className="flex items-center gap-3 p-3">
                                            <div className="w-8 h-8 rounded-lg bg-surface-variant flex items-center justify-center text-on-variant flex-shrink-0">
                                                {activity.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-body-sm font-medium text-on-surface truncate">{activity.title}</p>
                                                <p className="text-label-sm text-on-variant truncate">{activity.description}</p>
                                            </div>
                                            <span className="text-label-sm text-on-variant/50 flex-shrink-0">
                                                {formatTimeAgo(activity.timestamp)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    /* No Hub State */
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="relative mb-6">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-32 h-32 border-2 border-primary/20 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
                            </div>
                            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                                <MdShield size={36} className="text-white" />
                            </div>
                        </div>
                        
                        <h2 className="text-headline-sm font-bold text-on-surface mb-2">Create Your Hub</h2>
                        <p className="text-body-md text-on-variant max-w-sm mb-6">
                            Create a hub for your family or join one with an invite code.
                        </p>
                        
                        <div className="flex gap-3">
                            <button
                                onClick={() => navigate('/settings')}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary font-semibold rounded-xl hover:bg-primary/90 transition-colors"
                            >
                                <MdAdd size={20} />
                                Create Hub
                            </button>
                            <button
                                onClick={() => navigate('/settings')}
                                className="px-5 py-2.5 bg-surface-variant text-on-surface font-semibold rounded-xl hover:bg-surface-variant/80 transition-colors"
                            >
                                Join Hub
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}d`;
};

export default DashboardPage;
