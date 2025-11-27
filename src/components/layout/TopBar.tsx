import { useNavigate, Link } from 'react-router-dom';
import { useUIStore } from '@/lib/store/ui-store';
import { useHubStore } from '@/lib/store/hub-store';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useUserProfile } from '@/features/auth/hooks/useAuth';
import { HubSelector } from '@/features/location/components/HubSelector';
import { MdMenu, MdSettings, MdShield, MdPerson, MdVisibility } from 'react-icons/md';

export const TopBar = () => {
    const navigate = useNavigate();
    const { toggleSidebar } = useUIStore();
    const { currentRole } = useHubStore();
    const { user } = useAuth();
    const { data: profile } = useUserProfile(user?.id);

    // Helper to get initials from name
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <header className="bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200 relative z-50">
            <div className="flex items-center justify-between px-2 py-2 sm:px-3 sm:py-3 md:px-4 md:py-4 safe-top">
                {/* Left: Menu & Hub Selector */}
                <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 min-w-0 flex-1">
                    {/* Hamburger Menu Button - Mobile optimized */}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleSidebar();
                        }}
                        className="w-9 h-9 sm:w-10 sm:h-10 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center touch-target flex-shrink-0 relative z-10"
                        aria-label="Open menu"
                        type="button"
                    >
                        <MdMenu size={18} className="text-gray-700 sm:w-5 sm:h-5" />
                    </button>

                    {/* Logo */}
                    <Link to="/map" className="flex items-center gap-1 sm:gap-1.5 md:gap-2 hover:opacity-80 transition-opacity flex-shrink-0">
                        <div className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 rounded-[20%] overflow-hidden bg-transparent shadow-sm">
                            <img 
                                src="/halohub.png" 
                                alt="HaloHub" 
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <span className="hidden sm:block text-base sm:text-lg md:text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                            HaloHub
                        </span>
                    </Link>

                    {/* Hub Selector - Mobile optimized */}
                    <div className="min-w-0 flex-1 max-w-[140px] sm:max-w-none">
                        <HubSelector />
                    </div>

                    {/* Role Badge - Hidden on very small screens */}
                    {currentRole && (
                        <div className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 ${
                            currentRole === 'admin' 
                                ? 'bg-purple-100 text-purple-700' 
                                : currentRole === 'member'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-700'
                        }`}>
                            {currentRole === 'admin' && <MdShield size={14} />}
                            {currentRole === 'member' && <MdPerson size={14} />}
                            {currentRole === 'observer' && <MdVisibility size={14} />}
                            <span className="capitalize">{currentRole}</span>
                        </div>
                    )}
                </div>

                {/* Right: Action Buttons - Mobile optimized */}
                <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 flex-shrink-0">
                    {/* Profile Button */}
                    <button
                        onClick={() => navigate('/profile')}
                        className="w-9 h-9 sm:w-10 sm:h-10 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center overflow-hidden touch-target"
                        aria-label="Profile"
                    >
                        {profile?.photoURL ? (
                            <img
                                src={profile.photoURL}
                                alt={profile.displayName || 'Profile'}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-primary flex items-center justify-center">
                                <span className="text-[10px] sm:text-xs font-semibold text-on-primary">
                                    {getInitials(profile?.displayName || user?.email || 'U')}
                                </span>
                            </div>
                        )}
                    </button>

                    {/* Settings Button */}
                    <button
                        onClick={() => navigate('/settings')}
                        className="w-9 h-9 sm:w-10 sm:h-10 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center touch-target"
                        aria-label="Settings"
                    >
                        <MdSettings size={18} className="text-gray-700 sm:w-5 sm:h-5" />
                    </button>
                </div>
            </div>
        </header>
    );
};



