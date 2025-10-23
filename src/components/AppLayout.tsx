import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './layout/Sidebar';
import { TopBar } from './layout/TopBar';
import { BottomNav } from './layout/BottomNav';
import { useUIStore } from '@/lib/store/ui-store';
import { cn } from '@/lib/utils/cn';

const AppLayout = () => {
    const { isSidebarOpen } = useUIStore();
    const location = useLocation();

    // Check if we're on the map page (Life360 style - full screen)
    const isMapPage = location.pathname === '/' || location.pathname === '/map';

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Top Bar - Desktop (hidden on map page) */}
            {!isMapPage && <TopBar />}

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar - Desktop (hidden on map page) */}
                {!isMapPage && (
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
                        isMapPage ? '' : 'pb-16 md:pb-0'
                    )}
                >
                    {isMapPage ? (
                        // Full-screen for map (no padding, no container)
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
