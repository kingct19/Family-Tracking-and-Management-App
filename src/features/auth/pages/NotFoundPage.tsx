import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiHome, FiArrowLeft } from 'react-icons/fi';

export const NotFoundPage: React.FC = () => {
    return (
        <>
            <Helmet>
                <title>Page Not Found - FamilyTracker</title>
            </Helmet>

            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="text-center">
                        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Page Not Found</h2>
                        <p className="text-gray-600 mb-8">
                            Sorry, we couldn&apos;t find the page you&apos;re looking for.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to="/dashboard"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <FiHome className="w-4 h-4 mr-2" />
                                Go to Dashboard
                            </Link>

                            <button
                                onClick={() => window.history.back()}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <FiArrowLeft className="w-4 h-4 mr-2" />
                                Go Back
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default NotFoundPage;
