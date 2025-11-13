import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Sidebar } from './layout/Sidebar';
import { TopBar } from './layout/TopBar';
import { BottomNav } from './layout/BottomNav';
import { useUIStore } from '@/lib/store/ui-store';
import { cn } from '@/lib/utils/cn';
import { FiX } from 'react-icons/fi';

const AppLayout = () => {
    const { isSidebarOpen, setSidebarOpen } = useUIStore();
    const location = useLocation();

    // Check if we're on full-screen pages (Life360 style)
    const isMapPage = location.pathname === '/' || location.pathname === '/map';
    const isMessagesPage = location.pathname === '/messages';
    const isFullScreenPage = isMapPage || isMessagesPage;

    // Close sidebar when navigating to a different page
    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname, setSidebarOpen]);

    return (
        <div className={cn('min-h-screen bg-background flex flex-col', isFullScreenPage && 'relative')}>
            {/* Top Bar - All pages (absolute for full-screen, relative for normal) */}
            <div className={cn(isFullScreenPage && 'absolute top-0 left-0 right-0 z-50')}>
                <TopBar />
            </div>

            {/* Mobile Sidebar Drawer (for full-screen pages) */}
            {isFullScreenPage && isSidebarOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
                        onClick={() => setSidebarOpen(false)}
                    />
                    
                    {/* Drawer */}
                    <aside className="fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl z-[70] transform transition-transform duration-300 animate-in slide-in-from-left">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <h2 className="text-lg font-bold text-gray-900">Menu</h2>
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                                aria-label="Close menu"
                            >
                                <FiX size={20} />
                            </button>
                        </div>
                        
                        {/* Sidebar Content */}
                        <div className="overflow-y-auto h-[calc(100%-64px)]">
                            <Sidebar />
                        </div>
                    </aside>
                </>
            )}

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar - Desktop (only on non-full-screen pages) */}
                {!isFullScreenPage && (
                    <aside
                        className={cn(
                            'hidden md:block w-64 bg-surface border-r border-outline-variant transition-transform duration-normal relative',
                            {
                                '-translate-x-full': !isSidebarOpen,
                                'translate-x-0': isSidebarOpen,
                            }
                        )}
                    >
                        <Sidebar />
                    </aside>
                )}

                {/* Main Content */}
                <main
                    className={cn(
                        'flex-1 overflow-y-auto',
                        isFullScreenPage ? 'relative' : 'pb-16 md:pb-0'
                    )}
                >
                    {isFullScreenPage ? (
                        // Full-screen for map/messages (no padding, no container)
                        <Outlet />
                    ) : (
                        // Normal layout for other pages (with top margin for header)
                        <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
                            <Outlet />
                        </div>
                    )}
                </main>
            </div>

            {/* Bottom Navigation - Mobile */}
            {!isFullScreenPage && <BottomNav />}
        </div>
    );
};

export default AppLayout;
