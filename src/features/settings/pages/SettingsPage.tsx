import React from 'react';
import { Helmet } from 'react-helmet-async';

export const SettingsPage: React.FC = () => {
    return (
        <>
            <Helmet>
                <title>Settings - FamilyTracker</title>
            </Helmet>

            <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Settings</h1>
                <p className="text-gray-600">Settings page coming soon...</p>
            </div>
        </>
    );
};

export default SettingsPage;
