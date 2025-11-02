import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './layout/Sidebar';
import { TopBar } from './layout/TopBar';
import { BottomNav } from './layout/BottomNav';
import { useUIStore } from '@/lib/store/ui-store';
import { cn } from '@/lib/utils/cn';

const AppLayout = () => {
    const { isSidebarOpen } = useUIStore();
    const location = useLocation();

    // Check if we're on full-screen pages (Life360 style)
    const isMapPage = location.pathname === '/' || location.pathname === '/map';
    const isMessagesPage = location.pathname === '/messages';
    const isFullScreenPage = isMapPage || isMessagesPage;

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Top Bar - Desktop (hidden on full-screen pages) */}
            {!isFullScreenPage && <TopBar />}

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar - Desktop (hidden on full-screen pages) */}
                {!isFullScreenPage && (
                    <aside
                        className={cn(
                            'hidden md:block w-64 bg-surface border-r border-outline-variant transition-transform duration-normal',
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
                        isFullScreenPage ? '' : 'pb-16 md:pb-0'
                    )}
                >
                    {isFullScreenPage ? (
                        // Full-screen for map/messages (no padding, no container)
                        <Outlet />
                    ) : (
                        // Normal layout for other pages
                        <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
                            <Outlet />
                        </div>
                    )}
                </main>
            </div>

            {/* Bottom Navigation - Mobile */}
            <BottomNav />
        </div>
    );
};

export default AppLayout;
