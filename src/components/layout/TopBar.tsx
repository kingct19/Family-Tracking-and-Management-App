import { useNavigate } from 'react-router-dom';
import { useUIStore } from '@/lib/store/ui-store';
import { HubSelector } from '@/features/location/components/HubSelector';
import { FiMenu, FiSettings } from 'react-icons/fi';

export const TopBar = () => {
    const navigate = useNavigate();
    const { toggleSidebar } = useUIStore();

    return (
        <header className="bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200 relative">
            <div className="flex items-center justify-between p-4 safe-top">
                {/* Left: Menu & Hub Selector */}
                <div className="flex items-center gap-3">
                    {/* Hamburger Menu Button */}
                    <button
                        onClick={toggleSidebar}
                        className="w-10 h-10 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center"
                        aria-label="Open menu"
                    >
                        <FiMenu size={20} className="text-gray-700" />
                    </button>

                    {/* Hub Selector */}
                    <HubSelector />
                </div>

                {/* Right: Action Buttons */}
                <div className="flex items-center gap-2">
                    {/* Settings Button */}
                    <button
                        onClick={() => navigate('/settings')}
                        className="w-10 h-10 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center"
                        aria-label="Settings"
                    >
                        <FiSettings size={20} className="text-gray-700" />
                    </button>
                </div>
            </div>
        </header>
    );
};



