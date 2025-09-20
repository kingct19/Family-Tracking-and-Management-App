import React from 'react';
import { Helmet } from 'react-helmet-async';

export const VaultPage: React.FC = () => {
    return (
        <>
            <Helmet>
                <title>Digital Vault - FamilyTracker</title>
            </Helmet>

            <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Digital Vault</h1>
                <p className="text-gray-600">Secure vault coming soon...</p>
            </div>
        </>
    );
};

export default VaultPage;
