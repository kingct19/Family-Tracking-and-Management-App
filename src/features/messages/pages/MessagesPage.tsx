import { Helmet } from 'react-helmet-async';
import { Card, CardContent } from '@/components/ui/Card';

const MessagesPage = () => {
    return (
        <>
            <Helmet>
                <title>Messages - Family Safety App</title>
                <meta name="description" content="Chat with your family" />
            </Helmet>

            <div className="space-y-6">
                <div>
                    <h1 className="text-headline-md text-on-background">Messages</h1>
                    <p className="text-body-md text-on-variant mt-1">
                        Stay connected with real-time messaging
                    </p>
                </div>

                <Card elevation={1}>
                    <CardContent className="p-8 text-center">
                        <p className="text-body-lg text-on-variant">
                            Messaging feature coming soon
                        </p>
                        <p className="text-body-sm text-on-variant mt-2">
                            Real-time chat and broadcast alerts will be available here
                        </p>
                    </CardContent>
                </Card>
            </div>
        </>
    );
};

export default MessagesPage;
