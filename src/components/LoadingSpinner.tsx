import React from 'react';
import { FiLoader } from 'react-icons/fi';

interface LoadingSpinnerProps {
    size?: 'small' | 'medium' | 'large';
    className?: string;
    text?: string;
}

const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8'
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'medium',
    className = '',
    text
}) => {
    return (
        <div className={`flex flex-col items-center justify-center ${className}`}>
            <FiLoader className={`animate-spin ${sizeClasses[size]} text-blue-600`} />
            {text && (
                <p className="mt-2 text-sm text-gray-600">{text}</p>
            )}
        </div>
    );
};

export default LoadingSpinner;
