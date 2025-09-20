import React from 'react';
import { Helmet } from 'react-helmet-async';

export const LocationPage: React.FC = () => {
    return (
        <>
            <Helmet>
                <title>Location - FamilyTracker</title>
            </Helmet>

            <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Location</h1>
                <p className="text-gray-600">Location tracking coming soon...</p>
            </div>
        </>
    );
};

export default LocationPage;
