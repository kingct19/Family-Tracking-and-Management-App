import { Outlet, useLocation } from 'react-router-dom';
import { useEffect, Suspense } from 'react';
import { Sidebar } from './layout/Sidebar';
import { TopBar } from './layout/TopBar';
import { LoadingSpinner } from './LoadingSpinner';
import { useUIStore } from '@/lib/store/ui-store';
import { cn } from '@/lib/utils/cn';
import { FiX } from 'react-icons/fi';

const AppLayout = () => {
    const { isSidebarOpen, setSidebarOpen } = useUIStore();
    const location = useLocation();

    // Check if we're on full-screen pages (Life360 style)
    const isMapPage = location.pathname === '/map' || location.pathname === '/';
    const isMessagesPage = location.pathname === '/messages';
    const isFullScreenPage = isMapPage || isMessagesPage;

    // Close sidebar when navigating to a different page
    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname, setSidebarOpen]);

    return (
        <div className={cn('min-h-screen bg-background flex flex-col', isFullScreenPage && 'relative')}>
            {/* Top Bar - All pages (absolute for full-screen, relative for normal) */}
            <div className={cn(isFullScreenPage && 'absolute top-0 left-0 right-0 z-50', 'relative z-50')}>
                <TopBar />
            </div>

            {/* Sidebar Drawer - Blurred background overlay for ALL pages */}
            {isSidebarOpen && (
                <>
                    {/* Backdrop with blur - Always shown */}
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
                        onClick={() => setSidebarOpen(false)}
                    />
                    
                    {/* Drawer - Always shown as overlay, never resizes content */}
                    <aside className="fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl z-[70] transform transition-transform duration-300 animate-in slide-in-from-left safe-top safe-bottom">
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3.5 sm:py-4 border-b border-gray-200 safe-top">
                            <h2 className="text-lg font-bold text-gray-900">Menu</h2>
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="w-11 h-11 sm:w-10 sm:h-10 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors touch-target"
                                aria-label="Close menu"
                            >
                                <FiX size={22} className="sm:w-5 sm:h-5" />
                            </button>
                        </div>
                        
                        {/* Sidebar Content */}
                        <div className="overflow-y-auto h-[calc(100%-64px)] safe-bottom">
                            <Sidebar />
                        </div>
                    </aside>
                </>
            )}

            <div className="flex flex-1 overflow-hidden relative">

                {/* Main Content */}
                <main
                    className={cn(
                        'flex-1 overflow-y-auto',
                        isFullScreenPage ? 'relative' : 'pb-16 md:pb-0'
                    )}
                >
                    <Suspense fallback={
                        <div className="min-h-screen flex items-center justify-center bg-background">
                            <LoadingSpinner size="large" text="Loading page..." />
                        </div>
                    }>
                        {isFullScreenPage ? (
                            // Full-screen for map/messages (no padding, no container)
                            <Outlet />
                        ) : (
                            // Normal layout for other pages (centered content with padding)
                            <div className="w-full min-h-full">
                                <div className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8">
                                    <Outlet />
                                </div>
                            </div>
                        )}
                    </Suspense>
                </main>
            </div>

            {/* Bottom Navigation - Removed on mobile since we have hamburger menu */}
            {/* Bottom nav is redundant when hamburger menu is available */}
        </div>
    );
};

export default AppLayout;
