import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUIStore } from '@/lib/store';
import {
    FiHome,
    FiMapPin,
    FiCheckSquare,
    FiMessageSquare,
    FiShield,
    FiSettings,
    FiX
} from 'react-icons/fi';

export const Sidebar: React.FC = () => {
    const location = useLocation();
    const { sidebarOpen, setSidebarOpen } = useUIStore();

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: FiHome },
        { name: 'Location', href: '/location', icon: FiMapPin },
        { name: 'Tasks', href: '/tasks', icon: FiCheckSquare },
        { name: 'Messages', href: '/messages', icon: FiMessageSquare },
        { name: 'Vault', href: '/vault', icon: FiShield },
        { name: 'Settings', href: '/settings', icon: FiSettings },
    ];

    return (
        <>
            {/* Mobile backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                >
                    <div className="absolute inset-0 bg-gray-600 opacity-75"></div>
                </div>
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
                        <h1 className="text-xl font-bold text-gray-900">FamilyTracker</h1>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
                        >
                            <FiX className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-4 space-y-1">
                        {navigation.map((item) => {
                            const isActive = location.pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                        }`}
                                >
                                    <item.icon
                                        className={`mr-3 h-5 w-5 flex-shrink-0 ${isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                                            }`}
                                    />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
