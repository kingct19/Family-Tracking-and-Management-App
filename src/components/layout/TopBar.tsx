import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useHubStore } from '@/lib/store/hub-store';
import { useUIStore } from '@/lib/store/ui-store';
import { Button } from '../ui/Button';
import { FiMenu, FiLogOut, FiChevronDown } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

export const TopBar = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { currentHub } = useHubStore();
    const { toggleSidebar } = useUIStore();

    const handleLogout = async () => {
        try {
            await logout();
            toast.success('Logged out successfully');
            navigate('/');
        } catch (error) {
            toast.error('Failed to logout');
        }
    };

    return (
        <header className="bg-surface border-b border-outline-variant">
            <div className="px-4 py-3 flex items-center justify-between">
                {/* Left side - Menu toggle and hub name */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleSidebar}
                        className="p-2 rounded-full hover:bg-surface-variant focus:outline-none focus:ring-2 focus:ring-primary"
                        aria-label="Toggle menu"
                    >
                        <FiMenu size={24} className="text-on-surface" />
                    </button>

                    {currentHub && (
                        <div className="hidden md:flex items-center gap-2">
                            <h1 className="text-title-lg text-on-surface">{currentHub.name}</h1>
                            <button
                                className="p-1 rounded hover:bg-surface-variant"
                                aria-label="Switch hub"
                            >
                                <FiChevronDown size={20} className="text-on-variant" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Right side - User info and logout */}
                <div className="flex items-center gap-3">
                    {user && (
                        <>
                            <span className="hidden sm:inline text-body-md text-on-surface">
                                {user.displayName}
                            </span>
                            {user.photoURL && (
                                <img
                                    src={user.photoURL}
                                    alt={user.displayName}
                                    className="w-8 h-8 rounded-full"
                                />
                            )}
                        </>
                    )}

                    <Button
                        variant="text"
                        size="small"
                        onClick={handleLogout}
                        startIcon={<FiLogOut size={18} />}
                        aria-label="Logout"
                    >
                        <span className="hidden sm:inline">Logout</span>
                    </Button>
                </div>
            </div>
        </header>
    );
};



