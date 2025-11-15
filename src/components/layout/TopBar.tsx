import { useNavigate } from 'react-router-dom';
import { useUIStore } from '@/lib/store/ui-store';
import { useHubStore } from '@/lib/store/hub-store';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useUserProfile } from '@/features/auth/hooks/useAuth';
import { HubSelector } from '@/features/location/components/HubSelector';
import { FiMenu, FiSettings, FiShield, FiUser, FiEye } from 'react-icons/fi';

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

                    {/* Role Badge */}
                    {currentRole && (
                        <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold ${
                            currentRole === 'admin' 
                                ? 'bg-purple-100 text-purple-700' 
                                : currentRole === 'member'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-700'
                        }`}>
                            {currentRole === 'admin' && <FiShield size={12} />}
                            {currentRole === 'member' && <FiUser size={12} />}
                            {currentRole === 'observer' && <FiEye size={12} />}
                            <span className="capitalize">{currentRole}</span>
                        </div>
                    )}
                </div>

                {/* Right: Action Buttons */}
                <div className="flex items-center gap-2">
                    {/* Profile Button */}
                    <button
                        onClick={() => navigate('/profile')}
                        className="w-10 h-10 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center overflow-hidden"
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
                                <span className="text-xs font-semibold text-on-primary">
                                    {getInitials(profile?.displayName || user?.email || 'U')}
                                </span>
                            </div>
                        )}
                    </button>

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



