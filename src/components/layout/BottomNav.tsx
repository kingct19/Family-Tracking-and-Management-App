import { NavLink } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useHubStore } from '@/lib/store/hub-store';
import {
    FiHome,
    FiMapPin,
    FiCheckSquare,
    FiMessageCircle,
    FiSettings,
} from 'react-icons/fi';
import { cn } from '@/lib/utils/cn';

interface NavItem {
    to: string;
    icon: ReactNode;
    label: string;
    feature?: keyof import('@/types').FeatureToggles;
}

export const BottomNav = () => {
    const { isFeatureEnabled } = useHubStore();

    // Bottom nav shows max 5 items for mobile (Life360 style - Map first)
    const navItems: NavItem[] = [
        {
            to: '/map',
            icon: <FiMapPin size={24} />,
            label: 'Map',
            feature: 'location',
        },
        {
            to: '/tasks',
            icon: <FiCheckSquare size={24} />,
            label: 'Tasks',
            feature: 'tasks',
        },
        {
            to: '/messages',
            icon: <FiMessageCircle size={24} />,
            label: 'Chat',
            feature: 'chat',
        },
        {
            to: '/dashboard',
            icon: <FiHome size={24} />,
            label: 'More',
        },
        {
            to: '/settings',
            icon: <FiSettings size={24} />,
            label: 'Settings',
        },
    ];

    // Filter and limit to 5 items
    const visibleNavItems = navItems
        .filter((item) => {
            if (!item.feature) return true;
            return isFeatureEnabled(item.feature);
        })
        .slice(0, 5);

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-outline-variant">
            <div className="flex justify-around items-center">
                {visibleNavItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            cn(
                                'flex flex-col items-center justify-center min-w-[60px] py-2 px-2',
                                'transition-colors duration-fast',
                                'focus:outline-none focus:ring-2 focus:ring-primary',
                                {
                                    'text-primary': isActive,
                                    'text-on-variant': !isActive,
                                }
                            )
                        }
                    >
                        {item.icon}
                        <span className="text-label-sm mt-1">{item.label}</span>
                    </NavLink>
                ))}
            </div>
        </nav>
    );
};

