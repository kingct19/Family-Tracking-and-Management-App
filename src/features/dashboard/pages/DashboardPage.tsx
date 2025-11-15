import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useHubStore } from '@/lib/store/hub-store';
import { useHasRole } from '@/features/auth/hooks/useAuth';
import { useHubTasks } from '@/features/tasks/hooks/useTasks';
import { useHubMessages } from '@/features/messages/hooks/useMessages';
import { useHubBroadcasts } from '@/features/messages/hooks/useBroadcasts';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { DashboardStatsSkeleton, DashboardQuickActionsSkeleton, CardSkeleton, ListItemSkeleton } from '@/components/ui/Skeleton';
import { FiMapPin, FiCheckSquare, FiMessageCircle, FiUsers, FiAward, FiClock, FiTrendingUp, FiCheckCircle, FiAlertCircle, FiUser } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';

const DashboardPage = () => {
    const { user } = useAuth();
    const { currentHub } = useHubStore();
    const isAdmin = useHasRole('admin');
    const navigate = useNavigate();
    
    // Fetch real data
    const { data: tasks = [], isLoading: isLoadingTasks } = useHubTasks();
    const { messages = [], isLoading: isLoadingMessages } = useHubMessages(currentHub?.id);
    const { data: broadcasts = [] } = useHubBroadcasts();
    
    const isLoading = isLoadingTasks || isLoadingMessages;

    // Calculate task statistics
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
        };
    }, [tasks, user?.id]);

    // Create activity feed from tasks, messages, and broadcasts
    const recentActivity = useMemo(() => {
        const activities: Array<{
            id: string;
            type: 'task' | 'message' | 'broadcast';
            title: string;
            description: string;
            timestamp: Date;
            icon: React.ReactNode;
            color: string;
        }> = [];

        // Add recent tasks (created, completed, assigned)
        tasks.slice(0, 5).forEach(task => {
            if (task.status === 'done' || task.status === 'approved') {
                activities.push({
                    id: `task-${task.id}`,
                    type: 'task',
                    title: 'Task completed',
                    description: `${task.title} was completed`,
                    timestamp: task.completedAt || task.updatedAt,
                    icon: <FiCheckCircle size={16} />,
                    color: 'text-green-600',
                });
            } else if (task.assignedTo && task.status === 'assigned') {
                activities.push({
                    id: `task-assigned-${task.id}`,
                    type: 'task',
                    title: 'Task assigned',
                    description: `${task.title} was assigned`,
                    timestamp: task.updatedAt,
                    icon: <FiUser size={16} />,
                    color: 'text-blue-600',
                });
            } else if (task.status === 'pending') {
                activities.push({
                    id: `task-created-${task.id}`,
                    type: 'task',
                    title: 'New task',
                    description: `${task.title} was created`,
                    timestamp: task.createdAt,
                    icon: <FiCheckSquare size={16} />,
                    color: 'text-purple-600',
                });
            }
        });

        // Add recent messages
        messages.slice(-5).forEach(message => {
            activities.push({
                id: `message-${message.id}`,
                type: 'message',
                title: 'New message',
                description: `${message.senderName}: ${message.text.substring(0, 50)}${message.text.length > 50 ? '...' : ''}`,
                timestamp: message.timestamp,
                icon: <FiMessageCircle size={16} />,
                color: 'text-purple-600',
            });
        });

        // Add recent broadcasts
        broadcasts.slice(0, 3).forEach(broadcast => {
            activities.push({
                id: `broadcast-${broadcast.id}`,
                type: 'broadcast',
                title: broadcast.title,
                description: broadcast.message,
                timestamp: broadcast.timestamp,
                icon: <FiAlertCircle size={16} />,
                color: broadcast.priority === 'high' ? 'text-red-600' : 'text-orange-600',
            });
        });

        // Sort by timestamp (newest first) and limit to 10
        return activities
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, 10);
    }, [tasks, messages, broadcasts]);

    const quickActions = [
        {
            icon: <FiCheckSquare size={28} />,
            title: 'Tasks',
            description: 'View and manage tasks',
            action: () => navigate('/tasks'),
            color: 'from-blue-500 to-blue-600',
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-600',
        },
        {
            icon: <FiMapPin size={28} />,
            title: 'Location',
            description: 'Track family members',
            action: () => navigate('/location'),
            color: 'from-green-500 to-green-600',
            bgColor: 'bg-green-50',
            textColor: 'text-green-600',
        },
        {
            icon: <FiMessageCircle size={28} />,
            title: 'Messages',
            description: 'Chat with your team',
            action: () => navigate('/messages'),
            color: 'from-purple-500 to-purple-600',
            bgColor: 'bg-purple-50',
            textColor: 'text-purple-600',
        },
        {
            icon: <FiUsers size={28} />,
            title: 'Members',
            description: 'Manage hub members',
            action: () => navigate('/settings'),
            color: 'from-indigo-500 to-indigo-600',
            bgColor: 'bg-indigo-50',
            textColor: 'text-indigo-600',
        },
    ];

    return (
        <>
            <Helmet>
                <title>Dashboard - Family Safety App</title>
                <meta name="description" content="Your family safety dashboard" />
            </Helmet>

            <div className="space-y-8">
                {/* Welcome Header */}
                <div className="bg-gradient-to-br from-primary via-purple-600 to-indigo-600 rounded-3xl p-8 md:p-12 text-on-primary shadow-elevation-3 overflow-hidden relative">
                    {/* Decorative background pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-3xl"></div>
                    </div>
                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                            <div>
                                <h1 className="text-headline-lg md:text-display-sm font-normal mb-3 text-balance">
                                    Welcome back, {user?.displayName || 'User'}!
                                </h1>
                                <p className="text-body-lg text-on-primary/90">
                                    {currentHub ? `Current hub: ${currentHub.name}` : 'No hub selected'}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="bg-white/15 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/20 shadow-elevation-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                            <FiAward size={24} className="text-white" />
                                        </div>
                                        <div>
                                            <div className="text-label-sm text-on-primary/80 mb-1">Total XP</div>
                                            <div className="text-headline-sm font-semibold text-white">{user?.xpTotal || 0}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div>
                    <h2 className="text-headline-md font-normal text-on-surface mb-6">Quick actions</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {quickActions.map((action, index) => (
                            <button
                                key={index}
                                onClick={action.action}
                                disabled={!currentHub}
                                className={`group card-interactive p-6 text-left ${
                                    !currentHub ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                <div className={`w-14 h-14 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-normal shadow-elevation-2`}>
                                    <div className="text-white">
                                        {action.icon}
                                    </div>
                                </div>
                                <h3 className="text-title-md text-on-surface mb-2">
                                    {action.title}
                                </h3>
                                <p className="text-body-md text-on-variant">
                                    {action.description}
                                </p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stats Summary */}
                <div>
                    <h2 className="text-headline-md font-normal text-on-surface mb-6">Overview</h2>
                    {isLoading ? (
                        <DashboardStatsSkeleton />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="card p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
                                        <FiCheckSquare size={24} className="text-blue-600" />
                                    </div>
                                    {taskStats.active > 0 && <FiTrendingUp className="text-green-600" size={20} />}
                                </div>
                                {isLoadingTasks ? (
                                    <LoadingSpinner size="small" />
                                ) : (
                                    <>
                                        <div className="text-display-sm font-normal text-on-surface mb-1">{taskStats.active}</div>
                                        <div className="text-body-md text-on-variant">Active Tasks</div>
                                        {taskStats.assignedToMe > 0 && (
                                            <div className="text-label-sm text-blue-600 mt-2">
                                                {taskStats.assignedToMe} assigned to you
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            <div className="card p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center border border-purple-100">
                                        <FiUsers size={24} className="text-purple-600" />
                                    </div>
                                    <FiTrendingUp className="text-green-600" size={20} />
                                </div>
                                <div className="text-display-sm font-normal text-on-surface mb-1">
                                    {currentHub?.members.length || 0}
                                </div>
                                <div className="text-body-md text-on-variant">Hub Members</div>
                            </div>

                            <div className="card p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center border border-green-100">
                                        <FiCheckCircle size={24} className="text-green-600" />
                                    </div>
                                    {taskStats.completed > 0 && <FiTrendingUp className="text-green-600" size={20} />}
                                </div>
                                {isLoadingTasks ? (
                                    <LoadingSpinner size="small" />
                                ) : (
                                    <>
                                        <div className="text-display-sm font-normal text-on-surface mb-1">{taskStats.completed}</div>
                                        <div className="text-body-md text-on-variant">Completed Tasks</div>
                                    </>
                                )}
                            </div>

                            <div className="card p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center border border-orange-100">
                                        <FiClock size={24} className="text-orange-600" />
                                    </div>
                                    {recentActivity.length > 0 && <FiTrendingUp className="text-green-600" size={20} />}
                                </div>
                                <div className="text-display-sm font-normal text-on-surface mb-1">{recentActivity.length}</div>
                                <div className="text-body-md text-on-variant">Recent Activity</div>
                                {isAdmin && taskStats.pendingApprovals > 0 && (
                                    <div className="text-label-sm text-orange-600 mt-2">
                                        {taskStats.pendingApprovals} pending approvals
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Admin Quick Actions */}
                {isAdmin && currentHub && (
                    <div>
                        <h2 className="text-headline-md font-normal text-on-surface mb-6">Admin Actions</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <button
                                onClick={() => navigate('/tasks/pending-approvals')}
                                className="group card-interactive p-6 text-left relative"
                            >
                                {taskStats.pendingApprovals > 0 && (
                                    <div className="absolute top-4 right-4 bg-orange-500 text-white text-label-sm font-semibold rounded-full w-7 h-7 flex items-center justify-center shadow-elevation-2">
                                        {taskStats.pendingApprovals}
                                    </div>
                                )}
                                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-normal shadow-elevation-2">
                                    <FiCheckCircle size={28} className="text-white" />
                                </div>
                                <h3 className="text-title-md text-on-surface mb-2">
                                    Pending Approvals
                                </h3>
                                <p className="text-body-md text-on-variant">
                                    Review task completion proof
                                </p>
                                {taskStats.pendingApprovals > 0 && (
                                    <p className="text-label-sm text-orange-600 mt-3">
                                        {taskStats.pendingApprovals} {taskStats.pendingApprovals === 1 ? 'task' : 'tasks'} awaiting review
                                    </p>
                                )}
                            </button>

                            <button
                                onClick={() => navigate('/leaderboard')}
                                className="group card-interactive p-6 text-left"
                            >
                                <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-normal shadow-elevation-2">
                                    <FiAward size={28} className="text-white" />
                                </div>
                                <h3 className="text-title-md text-on-surface mb-2">
                                    Leaderboard
                                </h3>
                                <p className="text-body-md text-on-variant">
                                    View XP rankings
                                </p>
                            </button>
                        </div>
                    </div>
                )}

                {/* Getting Started */}
                {!currentHub && (
                    <div className="bg-gradient-to-br from-primary-container to-purple-50 rounded-3xl p-8 md:p-12 border-2 border-primary/20 shadow-elevation-2">
                        <div className="max-w-2xl">
                            <h2 className="text-headline-md font-normal text-on-container mb-4">
                                Get Started with Your First Hub
                            </h2>
                            <p className="text-body-lg text-on-container/80 mb-8">
                                You're not part of any hub yet. Create a new hub for your group or join an existing one with an invite code.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button className="btn-base bg-primary text-on-primary hover:bg-primary/90 shadow-elevation-2">
                                    Create Hub
                                </button>
                                <button className="btn-base bg-surface border-2 border-primary text-primary hover:bg-primary-container transition-colors">
                                    Join Hub
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Recent Activity */}
                {currentHub && (
                    <div>
                        <h2 className="text-headline-md font-normal text-on-surface mb-6">Recent Activity</h2>
                        <div className="card p-6">
                            {isLoadingTasks || isLoadingMessages ? (
                                <div className="flex items-center justify-center py-12">
                                    <LoadingSpinner size="medium" />
                                </div>
                            ) : recentActivity.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-surface-variant rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FiClock size={32} className="text-on-variant" />
                                    </div>
                                    <h3 className="text-title-lg text-on-surface mb-2">No recent activity</h3>
                                    <p className="text-body-md text-on-variant">Activity from your hub will appear here</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {recentActivity.map((activity) => (
                                        <div
                                            key={activity.id}
                                            className="flex items-start gap-4 p-4 rounded-xl hover:bg-surface-variant/50 transition-colors duration-fast group"
                                        >
                                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-fast ${
                                                activity.color === 'text-green-600' ? 'bg-green-50 border-green-100' :
                                                activity.color === 'text-blue-600' ? 'bg-blue-50 border-blue-100' :
                                                activity.color === 'text-purple-600' ? 'bg-purple-50 border-purple-100' :
                                                activity.color === 'text-red-600' ? 'bg-red-50 border-red-100' :
                                                'bg-surface-variant border-outline-variant'
                                            }`}>
                                                <div className={activity.color}>
                                                    {activity.icon}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-title-sm text-on-surface mb-1">{activity.title}</h4>
                                                <p className="text-body-sm text-on-variant mb-2 line-clamp-2">{activity.description}</p>
                                                <p className="text-label-sm text-on-variant/70">
                                                    {formatTimeAgo(activity.timestamp)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

// Helper function to format time ago
const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
};

export default DashboardPage;
