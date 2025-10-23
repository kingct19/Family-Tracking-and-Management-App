import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';

const TestPage = () => {
    return (
        <>
            <Helmet>
                <title>Test Page - Family Tracker</title>
            </Helmet>

            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <h1 className="text-2xl font-bold text-center">Test Page</h1>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-center text-muted-foreground">
                            This is a test page to verify the app is working.
                        </p>

                        <div className="space-y-2">
                            <Button
                                onClick={() => window.location.href = '/login'}
                                className="w-full"
                            >
                                Go to Login
                            </Button>

                            <Button
                                onClick={() => window.location.href = '/register'}
                                variant="outline"
                                className="w-full"
                            >
                                Go to Register
                            </Button>

                            <Button
                                onClick={() => window.location.href = '/dashboard'}
                                variant="secondary"
                                className="w-full"
                            >
                                Go to Dashboard (Protected)
                            </Button>
                        </div>

                        <div className="text-sm text-muted-foreground">
                            <p>If you can see this page, the app is working!</p>
                            <p>Check the console for any errors.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
};

export default TestPage;

