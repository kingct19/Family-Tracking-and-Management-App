import { FiLoader } from 'react-icons/fi';
import { cn } from '@/lib/utils/cn';

interface LoadingSpinnerProps {
    size?: 'small' | 'medium' | 'large';
    className?: string;
    text?: string;
}

const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8',
};

export const LoadingSpinner = ({
    size = 'medium',
    className = '',
    text,
}: LoadingSpinnerProps) => {
    return (
        <div className={cn('flex flex-col items-center justify-center', className)}>
            <FiLoader className={cn('animate-spin text-primary', sizeClasses[size])} />
            {text && (
                <p className="mt-2 text-body-sm text-on-variant">{text}</p>
            )}
        </div>
    );
};

export default LoadingSpinner;
