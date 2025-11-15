import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useHubStore } from '@/lib/store/hub-store';
import { FeatureTogglesSettings } from '../components/FeatureTogglesSettings';
import { NotificationSettings } from '@/features/notifications/components/NotificationSettings';
import { FiShield, FiUser, FiEye, FiEdit2 } from 'react-icons/fi';

const SettingsPage = () => {
    const { user } = useAuth();
    const { currentHub, currentRole } = useHubStore();
    const navigate = useNavigate();

    return (
        <>
            <Helmet>
                <title>Settings - Family Safety App</title>
                <meta name="description" content="Manage your app settings" />
            </Helmet>

            <div className="space-y-8">
                <div>
                    <h1 className="text-headline-lg md:text-display-sm font-normal text-on-surface mb-2">Settings</h1>
                    <p className="text-body-lg text-on-variant">
                        Manage your profile and preferences
                    </p>
                </div>

                {/* Profile Settings */}
                <Card elevation={1}>
                    <CardHeader title="Profile" />
                    <CardContent>
                        <div className="space-y-4">
                            <div className="space-y-3">
                                <div>
                                    <p className="text-label-sm text-on-variant">Name</p>
                                    <p className="text-body-md text-on-surface">{user?.displayName}</p>
                                </div>
                                <div>
                                    <p className="text-label-sm text-on-variant">Email</p>
                                    <p className="text-body-md text-on-surface">{user?.email}</p>
                                </div>
                                <div>
                                    <p className="text-label-sm text-on-variant">Total XP</p>
                                    <p className="text-body-md text-on-surface">{user?.xpTotal || 0}</p>
                                </div>
                            </div>
                            <div className="pt-2 border-t border-outline-variant">
                                <Button
                                    variant="outlined"
                                    onClick={() => navigate('/profile')}
                                    startIcon={<FiEdit2 />}
                                >
                                    Edit Profile
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Hub Settings */}
                {currentHub && (
                    <>
                        <Card elevation={1}>
                            <CardHeader title="Current Hub" />
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-label-sm text-on-variant">Hub Name</p>
                                        <p className="text-body-md text-on-surface font-semibold">{currentHub.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-label-sm text-on-variant mb-2">Your Role</p>
                                        <div className="flex items-center gap-2">
                                            {currentRole === 'admin' && (
                                                <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full">
                                                    <FiShield size={16} />
                                                    <span className="text-sm font-semibold capitalize">Admin</span>
                                                </div>
                                            )}
                                            {currentRole === 'member' && (
                                                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full">
                                                    <FiUser size={16} />
                                                    <span className="text-sm font-semibold capitalize">Member</span>
                                                </div>
                                            )}
                                            {currentRole === 'observer' && (
                                                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full">
                                                    <FiEye size={16} />
                                                    <span className="text-sm font-semibold capitalize">Observer</span>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-xs text-on-variant mt-2">
                                            {currentRole === 'admin' && 'You can manage hub settings and members'}
                                            {currentRole === 'member' && 'You can participate in hub activities'}
                                            {currentRole === 'observer' && 'You have read-only access to hub content'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-label-sm text-on-variant">Members</p>
                                        <p className="text-body-md text-on-surface">{currentHub.members.length}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Feature Toggles - Admin Only */}
                        {currentRole === 'admin' && <FeatureTogglesSettings />}
                    </>
                )}

                {/* Notification Settings */}
                <NotificationSettings />
            </div>
        </>
    );
};

export default SettingsPage;
