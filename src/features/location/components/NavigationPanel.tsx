/**
 * NavigationPanel Component
 * 
 * Slide-out navigation panel for map page
 * - Easy access to all features
 * - Mobile and desktop friendly
 */

import { NavLink } from 'react-router-dom';
import { useHubStore } from '@/lib/store/hub-store';
import { useAuth } from '@/features/auth/hooks/useAuth';
import {
    FiX,
    FiMapPin,
    FiCheckSquare,
    FiMessageCircle,
    FiUsers,
    FiSettings,
    FiLock,
    FiHome,
    FiLogOut,
} from 'react-icons/fi';
import { signOut } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { useNavigate } from 'react-router-dom';

interface NavigationPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export const NavigationPanel = ({ isOpen, onClose }: NavigationPanelProps) => {
    const { currentHub, isFeatureEnabled } = useHubStore();
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const navItems = [
        {
            to: '/',
            icon: <FiMapPin size={20} />,
            label: 'Map',
            feature: 'location' as const,
        },
        {
            to: '/tasks',
            icon: <FiCheckSquare size={20} />,
            label: 'Tasks',
            feature: 'tasks' as const,
        },
        {
            to: '/messages',
            icon: <FiMessageCircle size={20} />,
            label: 'Messages',
            feature: 'chat' as const,
        },
        {
            to: '/vault',
            icon: <FiLock size={20} />,
            label: 'Vault',
            feature: 'vault' as const,
        },
        {
            to: '/dashboard',
            icon: <FiHome size={20} />,
            label: 'Dashboard',
        },
        {
            to: '/settings',
            icon: <FiSettings size={20} />,
            label: 'Settings',
        },
    ].filter((item) => {
        if (!item.feature) return true;
        return isFeatureEnabled(item.feature);
    });

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Panel */}
            <div
                className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Menu</h2>
                            {currentHub && (
                                <p className="text-sm text-gray-500 mt-1">{currentHub.name}</p>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            aria-label="Close menu"
                        >
                            <FiX size={20} />
                        </button>
                    </div>

                    {/* User Info */}
                    {user && (
                        <div className="p-4 border-b border-gray-200 bg-gray-50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                                    {user.email?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 truncate">
                                        {user.email?.split('@')[0] || 'User'}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Items */}
                    <nav className="flex-1 overflow-y-auto py-4">
                        <div className="space-y-1 px-2">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    onClick={onClose}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                            isActive
                                                ? 'bg-purple-100 text-purple-700 font-semibold'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        }`
                                    }
                                >
                                    {item.icon}
                                    <span>{item.label}</span>
                                </NavLink>
                            ))}
                        </div>

                        {/* Divider */}
                        <div className="my-4 border-t border-gray-200" />

                        {/* Hub Info */}
                        {currentHub && (
                            <div className="px-4 py-3">
                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                    <FiUsers size={16} />
                                    <span className="font-medium">Hub Members</span>
                                </div>
                                <p className="text-xs text-gray-500 pl-6">
                                    {currentHub.members?.length || 0} members
                                </p>
                            </div>
                        )}
                    </nav>

                    {/* Footer */}
                    <div className="border-t border-gray-200 p-4">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <FiLogOut size={20} />
                            <span className="font-medium">Sign Out</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};
