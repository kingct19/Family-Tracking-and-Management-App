import { NavLink, useNavigate, Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useHubStore } from '@/lib/store/hub-store';
import { useAuth } from '@/features/auth/hooks/useAuth';
import {
    MdHome,
    MdLocationOn,
    MdTaskAlt,
    MdChat,
    MdLock,
    MdSettings,
    MdLogout,
    MdEmojiEvents,
} from 'react-icons/md';
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
            icon: <MdLocationOn size={20} />,
            label: 'Map',
            feature: 'location',
        },
        {
            to: '/dashboard',
            icon: <MdHome size={20} />,
            label: 'Dashboard',
        },
        {
            to: '/tasks',
            icon: <MdTaskAlt size={20} />,
            label: 'Tasks',
            feature: 'tasks',
        },
        {
            to: '/messages',
            icon: <MdChat size={20} />,
            label: 'Messages',
            feature: 'chat',
        },
        {
            to: '/vault',
            icon: <MdLock size={20} />,
            label: 'Vault',
            feature: 'vault',
        },
        {
            to: '/rewards',
            icon: <MdEmojiEvents size={20} />,
            label: 'Rewards',
        },
        {
            to: '/settings',
            icon: <MdSettings size={20} />,
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
            <div className="flex-1 space-y-1 px-2 overflow-y-auto">
                {visibleNavItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            cn(
                                'flex items-center gap-3 px-4 py-3.5 sm:py-3 rounded-lg transition-colors duration-fast',
                                'text-body-md font-medium touch-target',
                                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                                {
                                    'bg-secondary-container text-on-secondary-container': isActive,
                                    'text-on-surface hover:bg-surface-variant active:bg-surface-variant': !isActive,
                                }
                            )
                        }
                    >
                        <span className="flex-shrink-0">{item.icon}</span>
                        <span className="truncate">{item.label}</span>
                    </NavLink>
                ))}
            </div>

            {/* Logout Button */}
            <div className="px-2 pt-4 border-t border-outline-variant safe-bottom">
                <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className={cn(
                        'w-full flex items-center gap-3 px-4 py-3.5 sm:py-3 rounded-lg transition-colors duration-fast',
                        'text-body-md font-medium touch-target',
                        'text-error hover:bg-error-container active:bg-error-container focus:outline-none focus:ring-2 focus:ring-error focus:ring-offset-2',
                        {
                            'opacity-50 cursor-not-allowed': isLoggingOut,
                        }
                    )}
                >
                    <MdLogout size={20} className="flex-shrink-0" />
                    <span className="truncate">{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                </button>
            </div>
        </nav>
    );
};

