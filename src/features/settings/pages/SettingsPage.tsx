import { Helmet } from 'react-helmet-async';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useHubStore } from '@/lib/store/hub-store';

const SettingsPage = () => {
    const { user } = useAuth();
    const { currentHub, currentRole } = useHubStore();

    return (
        <>
            <Helmet>
                <title>Settings - Family Safety App</title>
                <meta name="description" content="Manage your app settings" />
            </Helmet>

            <div className="space-y-6">
                <div>
                    <h1 className="text-headline-md text-on-background">Settings</h1>
                    <p className="text-body-md text-on-variant mt-1">
                        Manage your profile and preferences
                    </p>
                </div>

                {/* Profile Settings */}
                <Card elevation={1}>
                    <CardHeader title="Profile" />
                    <CardContent>
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
                    </CardContent>
                </Card>

                {/* Hub Settings */}
                {currentHub && (
                    <Card elevation={1}>
                        <CardHeader title="Current Hub" />
                        <CardContent>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-label-sm text-on-variant">Hub Name</p>
                                    <p className="text-body-md text-on-surface">{currentHub.name}</p>
                                </div>
                                <div>
                                    <p className="text-label-sm text-on-variant">Your Role</p>
                                    <p className="text-body-md text-on-surface capitalize">{currentRole}</p>
                                </div>
                                <div>
                                    <p className="text-label-sm text-on-variant">Members</p>
                                    <p className="text-body-md text-on-surface">{currentHub.members.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* More settings coming soon */}
                <Card elevation={1}>
                    <CardContent className="p-6 text-center">
                        <p className="text-body-md text-on-variant">
                            More settings options coming soon
                        </p>
                    </CardContent>
                </Card>
            </div>
        </>
    );
};

export default SettingsPage;
