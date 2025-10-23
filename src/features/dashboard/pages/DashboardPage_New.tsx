import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useHubStore } from '@/lib/store/hub-store';
import { FiMapPin, FiCheckSquare, FiMessageCircle, FiUsers, FiAward, FiClock, FiTrendingUp } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
    const { user } = useAuth();
    const { currentHub } = useHubStore();
    const navigate = useNavigate();

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
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-8 md:p-12 text-white shadow-xl">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold mb-2">
                                Welcome back, {user?.displayName || 'User'}!
                            </h1>
                            <p className="text-lg text-white/90 mb-4 md:mb-0">
                                {currentHub ? `Current hub: ${currentHub.name}` : 'No hub selected'}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3">
                                <div className="flex items-center gap-2">
                                    <FiAward size={24} />
                                    <div>
                                        <div className="text-sm opacity-90">Total XP</div>
                                        <div className="text-xl font-bold">{user?.xpTotal || 0}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick actions</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {quickActions.map((action, index) => (
                            <button
                                key={index}
                                onClick={action.action}
                                className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 text-left"
                            >
                                <div className={`w-14 h-14 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                                    <div className="text-white">
                                        {action.icon}
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">
                                    {action.title}
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    {action.description}
                                </p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stats Summary */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Overview</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <FiCheckSquare size={24} className="text-blue-600" />
                                </div>
                                <FiTrendingUp className="text-green-500" size={20} />
                            </div>
                            <div className="text-3xl font-bold text-gray-900 mb-1">0</div>
                            <div className="text-gray-600">Active Tasks</div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                    <FiUsers size={24} className="text-purple-600" />
                                </div>
                                <FiTrendingUp className="text-green-500" size={20} />
                            </div>
                            <div className="text-3xl font-bold text-gray-900 mb-1">
                                {currentHub?.members.length || 0}
                            </div>
                            <div className="text-gray-600">Hub Members</div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                    <FiClock size={24} className="text-green-600" />
                                </div>
                                <FiTrendingUp className="text-green-500" size={20} />
                            </div>
                            <div className="text-3xl font-bold text-gray-900 mb-1">0</div>
                            <div className="text-gray-600">Recent Activity</div>
                        </div>
                    </div>
                </div>

                {/* Getting Started */}
                {!currentHub && (
                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl p-8 md:p-12 border border-purple-200">
                        <div className="max-w-2xl">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                Get Started with Your First Hub
                            </h2>
                            <p className="text-lg text-gray-700 mb-6">
                                You're not part of any hub yet. Create a new hub for your family or join an existing one with an invite code.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button className="px-6 py-3 bg-purple-600 text-white rounded-full font-semibold hover:bg-purple-700 transition-colors shadow-lg">
                                    Create Hub
                                </button>
                                <button className="px-6 py-3 bg-white text-purple-600 border-2 border-purple-600 rounded-full font-semibold hover:bg-purple-50 transition-colors">
                                    Join Hub
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Recent Activity */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
                    <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiClock size={32} className="text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No recent activity</h3>
                            <p className="text-gray-600">Activity from your hub will appear here</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DashboardPage;
