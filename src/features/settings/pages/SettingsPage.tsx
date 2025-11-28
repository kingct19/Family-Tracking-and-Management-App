import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useHubStore } from '@/lib/store/hub-store';
import { FeatureTogglesSettings } from '../components/FeatureTogglesSettings';
import { NotificationSettings } from '@/features/notifications/components/NotificationSettings';
import { InviteManagement } from '@/features/hubs/components/InviteManagement';
import { HubSettingsModal } from '@/features/hubs/components/HubSettingsModal';
import { MemberManagement } from '@/features/hubs/components/MemberManagement';
import {
    MdSecurity,
    MdPerson,
    MdVisibility,
    MdEdit,
    MdKey,
    MdEmail,
    MdStar,
    MdPeople,
    MdSettings,
    MdEmojiEvents,
} from 'react-icons/md';

const SettingsPage = () => {
    const { user } = useAuth();
    const { currentHub, currentRole } = useHubStore();
    const navigate = useNavigate();
    const [showInviteManagement, setShowInviteManagement] = useState(false);
    const [showHubSettings, setShowHubSettings] = useState(false);
    const [showMemberManagement, setShowMemberManagement] = useState(false);

    return (
        <>
            <Helmet>
                <title>Settings - Family Safety App</title>
                <meta name="description" content="Manage your app settings" />
            </Helmet>

            <div className="space-y-4 sm:space-y-6">
                {/* Header */}
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary-container rounded-lg">
                            <MdSettings size={24} className="text-primary" />
                        </div>
                        <div>
                            <h1 className="text-title-lg sm:text-headline-sm font-semibold text-on-surface">Settings</h1>
                            <p className="text-body-sm text-on-variant mt-0.5">
                                Manage your profile and preferences
                            </p>
                        </div>
                    </div>
                </div>

                {/* Profile Settings */}
                <Card elevation={1}>
                    <CardHeader 
                        title="Profile" 
                        action={
                            <MdPerson size={20} className="text-on-variant" />
                        }
                    />
                    <CardContent>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-surface-variant rounded-lg">
                                        <MdPerson size={18} className="text-on-variant" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-label-sm text-on-variant mb-1">Name</p>
                                        <p className="text-body-md text-on-surface font-medium truncate">{user?.displayName || 'Not set'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-surface-variant rounded-lg">
                                        <MdEmail size={18} className="text-on-variant" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-label-sm text-on-variant mb-1">Email</p>
                                        <p className="text-body-md text-on-surface font-medium truncate">{user?.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-primary-container rounded-lg">
                                        <MdStar size={18} className="text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-label-sm text-on-variant mb-1">Total XP</p>
                                        <p className="text-body-md text-primary font-semibold">{user?.xpTotal || 0}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="pt-3 border-t border-outline-variant">
                                <Button
                                    variant="filled"
                                    onClick={() => navigate('/profile')}
                                    startIcon={<MdEdit size={18} />}
                                    fullWidth
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
                            <CardHeader 
                                title="Current Hub" 
                                action={
                                    <MdPeople size={20} className="text-on-variant" />
                                }
                            />
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-label-sm text-on-variant mb-1">Hub Name</p>
                                        <p className="text-body-md text-on-surface font-semibold">{currentHub.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-label-sm text-on-variant mb-2">Your Role</p>
                                        <div className="flex items-center gap-2 mb-2">
                                            {currentRole === 'admin' && (
                                                <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-container rounded-full">
                                                    <MdSecurity size={16} className="text-primary" />
                                                    <span className="text-label-md font-semibold text-primary capitalize">Admin</span>
                                                </div>
                                            )}
                                            {currentRole === 'member' && (
                                                <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary-container rounded-full">
                                                    <MdPerson size={16} className="text-secondary" />
                                                    <span className="text-label-md font-semibold text-secondary capitalize">Member</span>
                                                </div>
                                            )}
                                            {currentRole === 'observer' && (
                                                <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-variant rounded-full">
                                                    <MdVisibility size={16} className="text-on-variant" />
                                                    <span className="text-label-md font-semibold text-on-variant capitalize">Observer</span>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-body-sm text-on-variant">
                                            {currentRole === 'admin' && 'You can manage hub settings and members'}
                                            {currentRole === 'member' && 'You can participate in hub activities'}
                                            {currentRole === 'observer' && 'You have read-only access to hub content'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3 pt-2 border-t border-outline-variant">
                                        <div className="p-2 bg-surface-variant rounded-lg">
                                            <MdPeople size={18} className="text-on-variant" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-label-sm text-on-variant mb-1">Members</p>
                                            <p className="text-body-md text-on-surface font-semibold">{currentHub.members.length}</p>
                                        </div>
                                    </div>
                                    {currentRole === 'admin' && (
                                        <div className="pt-2 border-t border-outline-variant space-y-2">
                                            <Button
                                                variant="filled"
                                                onClick={() => setShowHubSettings(true)}
                                                startIcon={<MdEdit size={18} />}
                                                fullWidth
                                            >
                                                Edit Hub Name
                                            </Button>
                                            <Button
                                                variant="tonal"
                                                onClick={() => setShowMemberManagement(true)}
                                                startIcon={<MdPeople size={18} />}
                                                fullWidth
                                            >
                                                Manage Members
                                            </Button>
                                            <Button
                                                variant="tonal"
                                                onClick={() => setShowInviteManagement(true)}
                                                startIcon={<MdKey size={18} />}
                                                fullWidth
                                            >
                                                Manage Invites
                                            </Button>
                                            <Button
                                                variant="tonal"
                                                onClick={() => navigate('/rewards/manage')}
                                                startIcon={<MdEmojiEvents size={18} />}
                                                fullWidth
                                            >
                                                Manage Rewards
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Feature Toggles - Admin Only */}
                        {currentRole === 'admin' && <FeatureTogglesSettings />}
                    </>
                )}

                {/* Notification Settings */}
                <NotificationSettings />

                {/* Admin Modals */}
                {currentRole === 'admin' && (
                    <>
                        <HubSettingsModal
                            isOpen={showHubSettings}
                            onClose={() => setShowHubSettings(false)}
                        />
                        <MemberManagement
                            isOpen={showMemberManagement}
                            onClose={() => setShowMemberManagement(false)}
                        />
                        <InviteManagement
                            isOpen={showInviteManagement}
                            onClose={() => setShowInviteManagement(false)}
                        />
                    </>
                )}
            </div>
        </>
    );
};

export default SettingsPage;
