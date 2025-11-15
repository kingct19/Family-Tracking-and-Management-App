import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { toast } from 'react-hot-toast';
import { FiMail } from 'react-icons/fi';

export const ForgotPasswordForm = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        if (!email.trim()) {
            setError('Email is required');
            return;
        }

        setIsLoading(true);
        try {
            await sendPasswordResetEmail(auth, email);
            setIsSent(true);
            toast.success('Password reset email sent!');
        } catch (error: any) {
            console.error('Password reset error:', error);
            if (error.code === 'auth/user-not-found') {
                setError('No account found with this email address');
            } else if (error.code === 'auth/invalid-email') {
                setError('Invalid email address');
            } else {
                setError('Failed to send reset email. Please try again.');
            }
            toast.error(error.message || 'Failed to send reset email');
        } finally {
            setIsLoading(false);
        }
    };

    if (isSent) {
        return (
            <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiMail size={32} className="text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Check your email
                    </h3>
                    <p className="text-body-md text-gray-600">
                        We&apos;ve sent a password reset link to <strong>{email}</strong>
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        Didn&apos;t receive the email? Check your spam folder or try again.
                    </p>
                </div>
                <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => {
                        setIsSent(false);
                        setEmail('');
                    }}
                >
                    Send Another Email
                </Button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <TextField
                type="email"
                label="Email"
                value={email}
                onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                }}
                error={error || undefined}
                startAdornment={<FiMail size={20} />}
                fullWidth
                required
                autoComplete="email"
                disabled={isLoading}
                placeholder="Enter your email address"
            />

            <Button
                type="submit"
                variant="filled"
                size="large"
                fullWidth
                loading={isLoading}
                disabled={isLoading || !email.trim()}
            >
                Send Reset Link
            </Button>
        </form>
    );
};

