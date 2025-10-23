import { Outlet } from 'react-router-dom';
import { Sidebar } from './layout/Sidebar';
import { TopBar } from './layout/TopBar';
import { BottomNav } from './layout/BottomNav';
import { useUIStore } from '@/lib/store/ui-store';
import { cn } from '@/lib/utils/cn';

const AppLayout = () => {
    const { isSidebarOpen } = useUIStore();

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Top Bar - Desktop */}
            <TopBar />

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar - Desktop */}
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

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
                    <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* Bottom Navigation - Mobile */}
            <BottomNav />
        </div>
    );
};

export default AppLayout;
