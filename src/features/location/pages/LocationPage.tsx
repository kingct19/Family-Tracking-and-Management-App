import { Helmet } from 'react-helmet-async';
import { Card, CardContent } from '@/components/ui/Card';

const LocationPage = () => {
    return (
        <>
            <Helmet>
                <title>Location - Family Safety App</title>
                <meta name="description" content="Track family member locations" />
            </Helmet>

            <div className="space-y-6">
                <div>
                    <h1 className="text-headline-md text-on-background">Location Tracking</h1>
                    <p className="text-body-md text-on-variant mt-1">
                        Real-time location tracking for your family members
                    </p>
                </div>

                <Card elevation={1}>
                    <CardContent className="p-8 text-center">
                        <p className="text-body-lg text-on-variant">
                            Location tracking feature coming soon
                        </p>
                        <p className="text-body-sm text-on-variant mt-2">
                            This will display an interactive map with family member locations
                        </p>
                    </CardContent>
                </Card>
            </div>
        </>
    );
};

export default LocationPage;
