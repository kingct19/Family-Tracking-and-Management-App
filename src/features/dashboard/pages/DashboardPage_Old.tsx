import { Helmet } from 'react-helmet-async';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useHubStore } from '@/lib/store/hub-store';
import { FiMapPin, FiCheckSquare, FiMessageCircle, FiUsers } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
    const { user } = useAuth();
    const { currentHub } = useHubStore();
    const navigate = useNavigate();

    const quickActions = [
        {
            icon: <FiCheckSquare size={32} />,
            title: 'Tasks',
            description: 'View and manage tasks',
            action: () => navigate('/tasks'),
            enabled: true,
        },
        {
            icon: <FiMapPin size={32} />,
            title: 'Location',
            description: 'Track family members',
            action: () => navigate('/location'),
            enabled: true,
        },
        {
            icon: <FiMessageCircle size={32} />,
            title: 'Messages',
            description: 'Chat with your team',
            action: () => navigate('/messages'),
            enabled: true,
        },
        {
            icon: <FiUsers size={32} />,
            title: 'Members',
            description: 'Manage hub members',
            action: () => navigate('/settings'),
            enabled: true,
        },
    ];

    return (
        <>
            <Helmet>
                <title>Dashboard - Family Safety App</title>
                <meta name="description" content="Your family safety dashboard" />
            </Helmet>

            <div className="space-y-6">
                {/* Welcome Card */}
                <Card elevation={1}>
                    <CardHeader
                        title={`Welcome back, ${user?.displayName}!`}
                        subtitle={currentHub ? `Current hub: ${currentHub.name}` : 'No hub selected'}
                    />
                    <CardContent>
                        <p className="text-body-md text-on-variant">
                            Stay connected with your family and manage tasks all in one place.
                        </p>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <div>
                    <h2 className="text-title-lg text-on-background mb-4">Quick actions</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {quickActions.map((action, index) => (
                            <Card
                                key={index}
                                elevation={1}
                                interactive
                                onClick={action.enabled ? action.action : undefined}
                                className="cursor-pointer"
                            >
                                <CardContent className="p-6 text-center">
                                    <div className="flex justify-center mb-3 text-primary">
                                        {action.icon}
                                    </div>
                                    <h3 className="text-title-sm text-on-surface mb-1">
                                        {action.title}
                                    </h3>
                                    <p className="text-body-sm text-on-variant">
                                        {action.description}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Stats Summary - Placeholder */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card elevation={1}>
                        <CardContent className="p-6">
                            <h3 className="text-label-md text-on-variant mb-1">Active Tasks</h3>
                            <p className="text-headline-sm text-on-surface">0</p>
                        </CardContent>
                    </Card>

                    <Card elevation={1}>
                        <CardContent className="p-6">
                            <h3 className="text-label-md text-on-variant mb-1">Total XP</h3>
                            <p className="text-headline-sm text-on-surface">{user?.xpTotal || 0}</p>
                        </CardContent>
                    </Card>

                    <Card elevation={1}>
                        <CardContent className="p-6">
                            <h3 className="text-label-md text-on-variant mb-1">Hub Members</h3>
                            <p className="text-headline-sm text-on-surface">
                                {currentHub?.members.length || 0}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Getting Started */}
                {!currentHub && (
                    <Card elevation={2} className="bg-primary-container">
                        <CardContent className="p-6">
                            <h3 className="text-title-md text-on-primary-container mb-2">
                                Get Started
                            </h3>
                            <p className="text-body-md text-on-primary-container mb-4">
                                You&apos;re not part of any hub yet. Create a new hub or join an existing one with an invite code.
                            </p>
                            <div className="flex gap-3">
                                <Button variant="filled" size="medium">
                                    Create Hub
                                </Button>
                                <Button variant="outlined" size="medium">
                                    Join Hub
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
};

export default DashboardPage;
