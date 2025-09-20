import React from 'react';
import { Helmet } from 'react-helmet-async';

export const DashboardPage: React.FC = () => {
    return (
        <>
            <Helmet>
                <title>Dashboard - FamilyTracker</title>
            </Helmet>

            <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h1>
                <p className="text-gray-600">Dashboard content coming soon...</p>
            </div>
        </>
    );
};

export default DashboardPage;
