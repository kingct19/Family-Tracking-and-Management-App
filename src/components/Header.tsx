import React from 'react';
import { useUIStore } from '@/lib/store';
import { FiMenu, FiBell, FiSearch } from 'react-icons/fi';

export const Header: React.FC = () => {
    const { setSidebarOpen } = useUIStore();

    return (
        <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Left side */}
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                        >
                            <FiMenu className="w-6 h-6" />
                        </button>

                        {/* Search */}
                        <div className="hidden md:block">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FiSearch className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right side */}
                    <div className="flex items-center space-x-4">
                        {/* Notifications */}
                        <button className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                            <FiBell className="w-5 h-5" />
                        </button>

                        {/* User profile */}
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-semibold text-xs">U</span>
                            </div>
                            <span className="hidden md:block text-sm font-medium text-gray-700">
                                User
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
