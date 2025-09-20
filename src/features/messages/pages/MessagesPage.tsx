import React from 'react';
import { Helmet } from 'react-helmet-async';

export const MessagesPage: React.FC = () => {
    return (
        <>
            <Helmet>
                <title>Messages - FamilyTracker</title>
            </Helmet>

            <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Messages</h1>
                <p className="text-gray-600">Family messaging coming soon...</p>
            </div>
        </>
    );
};

export default MessagesPage;
