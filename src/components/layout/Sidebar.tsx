import { NavLink } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useHubStore } from '@/lib/store/hub-store';
import {
    FiHome,
    FiMapPin,
    FiCheckSquare,
    FiMessageCircle,
    FiLock,
    FiSettings,
} from 'react-icons/fi';
import { cn } from '@/lib/utils/cn';

interface NavItem {
    to: string;
    icon: ReactNode;
    label: string;
    feature?: keyof import('@/types').FeatureToggles;
}

export const Sidebar = () => {
    const { isFeatureEnabled } = useHubStore();

    const navItems: NavItem[] = [
        {
            to: '/dashboard',
            icon: <FiHome size={20} />,
            label: 'Dashboard',
        },
        {
            to: '/location',
            icon: <FiMapPin size={20} />,
            label: 'Location',
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
        </nav>
    );
};

