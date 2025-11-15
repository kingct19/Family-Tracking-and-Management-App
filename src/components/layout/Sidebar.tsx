import { NavLink, useNavigate, Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useHubStore } from '@/lib/store/hub-store';
import { useAuth } from '@/features/auth/hooks/useAuth';
import {
    FiHome,
    FiMapPin,
    FiCheckSquare,
    FiMessageCircle,
    FiLock,
    FiSettings,
    FiLogOut,
} from 'react-icons/fi';
import { cn } from '@/lib/utils/cn';
import toast from 'react-hot-toast';

interface NavItem {
    to: string;
    icon: ReactNode;
    label: string;
    feature?: keyof import('@/types').FeatureToggles;
}

export const Sidebar = () => {
    const { isFeatureEnabled } = useHubStore();
    const { logout, isLoggingOut } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            toast.success('Logged out successfully');
            navigate('/login');
        } catch (error) {
            toast.error('Failed to logout');
        }
    };

    // Nav items - Map first (Life360 style)
    const navItems: NavItem[] = [
        {
            to: '/map',
            icon: <FiMapPin size={20} />,
            label: 'Map',
            feature: 'location',
        },
        {
            to: '/tasks',
            icon: <FiCheckSquare size={20} />,
            label: 'Tasks',
            feature: 'tasks',
        },
        {
            to: '/messages',
            icon: <FiMessageCircle size={20} />,
            label: 'Messages',
            feature: 'chat',
        },
        {
            to: '/vault',
            icon: <FiLock size={20} />,
            label: 'Vault',
            feature: 'vault',
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
    ];

    // Filter nav items based on feature toggles
    const visibleNavItems = navItems.filter((item) => {
        if (!item.feature) return true;
        return isFeatureEnabled(item.feature);
    });

    return (
        <nav className="h-full flex flex-col py-4">
            {/* Logo Header */}
            <div className="px-4 mb-6 pb-4 border-b border-outline-variant">
                <Link to="/map" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <div className="h-10 w-10 rounded-[20%] overflow-hidden bg-transparent shadow-sm">
                        <img 
                            src="/halohub.png" 
                            alt="HaloHub" 
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                        HaloHub
                    </span>
                </Link>
            </div>

            <div className="flex-1 space-y-1 px-2">
                {visibleNavItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            cn(
                                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-fast',
                                'text-body-md font-medium',
                                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                                {
                                    'bg-secondary-container text-on-secondary-container': isActive,
                                    'text-on-surface hover:bg-surface-variant': !isActive,
                                }
                            )
                        }
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </div>

            {/* Logout Button */}
            <div className="px-2 pt-4 border-t border-outline-variant">
                <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className={cn(
                        'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-fast',
                        'text-body-md font-medium',
                        'text-error hover:bg-error-container focus:outline-none focus:ring-2 focus:ring-error focus:ring-offset-2',
                        {
                            'opacity-50 cursor-not-allowed': isLoggingOut,
                        }
                    )}
                >
                    <FiLogOut size={20} />
                    <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                </button>
            </div>
        </nav>
    );
};

