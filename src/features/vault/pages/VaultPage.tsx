import { Helmet } from 'react-helmet-async';
import { Card, CardContent } from '@/components/ui/Card';
import { FiLock } from 'react-icons/fi';

const VaultPage = () => {
    return (
        <>
            <Helmet>
                <title>Vault - Family Safety App</title>
                <meta name="description" content="Securely store sensitive information" />
            </Helmet>

            <div className="space-y-6">
                <div>
                    <h1 className="text-headline-md text-on-background">Digital Vault</h1>
                    <p className="text-body-md text-on-variant mt-1">
                        Secure storage for passwords and sensitive information
                    </p>
                </div>

                <Card elevation={1}>
                    <CardContent className="p-8 text-center">
                        <div className="flex justify-center mb-4">
                            <FiLock size={48} className="text-primary" />
                        </div>
                        <p className="text-body-lg text-on-variant">
                            Digital vault feature coming soon
                        </p>
                        <p className="text-body-sm text-on-variant mt-2">
                            AES-256 encrypted storage for your sensitive information
                        </p>
                    </CardContent>
                </Card>
            </div>
        </>
    );
};

export default VaultPage;
