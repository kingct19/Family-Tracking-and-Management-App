import React from 'react';
import { Helmet } from 'react-helmet-async';

export const TasksPage: React.FC = () => {
    return (
        <>
            <Helmet>
                <title>Tasks - FamilyTracker</title>
            </Helmet>

            <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Tasks</h1>
                <p className="text-gray-600">Task management coming soon...</p>
            </div>
        </>
    );
};

export default TasksPage;
