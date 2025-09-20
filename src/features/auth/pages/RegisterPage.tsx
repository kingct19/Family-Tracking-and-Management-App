import React from 'react';
import { Helmet } from 'react-helmet-async';

export const RegisterPage: React.FC = () => {
    return (
        <>
            <Helmet>
                <title>Create Account - FamilyTracker</title>
            </Helmet>

            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Register Page</h1>
                    <p className="text-gray-600">Coming soon...</p>
                </div>
            </div>
        </>
    );
};

export default RegisterPage;
