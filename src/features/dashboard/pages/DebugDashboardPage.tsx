import { Helmet } from 'react-helmet-async';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FiMapPin, FiCheckSquare, FiMessageCircle, FiUsers } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const DebugDashboardPage = () => {
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
                <title>Debug Dashboard - Family Safety App</title>
                <meta name="description" content="Debug dashboard without auth" />
            </Helmet>

            <div className="space-y-6">
                {/* Welcome Card */}
                <Card elevation={1}>
                    <CardHeader
                        title="Welcome to Debug Dashboard!"
                        subtitle="This bypasses authentication for testing"
                    />
                    <CardContent>
                        <p className="text-body-md text-on-variant">
                            This is a debug version that doesn't require authentication.
                            Use this to test the dashboard layout and navigation.
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

                {/* Stats Summary */}
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
                            <p className="text-headline-sm text-on-surface">0</p>
                        </CardContent>
                    </Card>

                    <Card elevation={1}>
                        <CardContent className="p-6">
                            <h3 className="text-label-md text-on-variant mb-1">Hub Members</h3>
                            <p className="text-headline-sm text-on-surface">0</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Debug Info */}
                <Card elevation={2} className="bg-primary-container">
                    <CardContent className="p-6">
                        <h3 className="text-title-md text-on-primary-container mb-2">
                            Debug Information
                        </h3>
                        <p className="text-body-md text-on-primary-container mb-4">
                            This dashboard works without authentication. If you can see this,
                            the dashboard layout and components are working correctly.
                        </p>
                        <div className="flex gap-3">
                            <Button
                                variant="filled"
                                size="medium"
                                onClick={() => navigate('/test')}
                            >
                                Go to Test Page
                            </Button>
                            <Button
                                variant="outlined"
                                size="medium"
                                onClick={() => navigate('/login')}
                            >
                                Try Login
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
};

export default DebugDashboardPage;
