import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { useAuth } from '../hooks/useAuth';
import { registerSchema, type RegisterFormData } from '@/lib/validation/auth-schemas';
import { toast } from 'react-hot-toast';
import { FiMail, FiLock, FiUser } from 'react-icons/fi';

export const RegisterForm = () => {
    const navigate = useNavigate();
    const { register: registerUser, isRegistering } = useAuth();
    const [formData, setFormData] = useState<RegisterFormData>({
        email: '',
        displayName: '',
        password: '',
        confirmPassword: '',
        acceptTerms: false,
    });
    const [errors, setErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>({});

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrors({});

        // Validate form data
        const result = registerSchema.safeParse(formData);
        if (!result.success) {
            const fieldErrors: Partial<Record<keyof RegisterFormData, string>> = {};
            result.error.errors.forEach((err) => {
                if (err.path[0]) {
                    fieldErrors[err.path[0] as keyof RegisterFormData] = err.message;
                }
            });
            setErrors(fieldErrors);
            return;
        }

        try {
            const response = await registerUser(formData);

            if (response.success) {
                toast.success('Account created successfully!');
                navigate('/dashboard');
            } else {
                toast.error(response.error || 'Registration failed');
            }
        } catch (error) {
            toast.error('An unexpected error occurred');
        }
    };

    const handleChange = (field: keyof RegisterFormData) => (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setFormData((prev) => ({
            ...prev,
            [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
        }));

        // Clear error for this field
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md">
            <TextField
                type="text"
                label="Full name"
                value={formData.displayName}
                onChange={handleChange('displayName')}
                error={errors.displayName}
                startAdornment={<FiUser size={20} />}
                fullWidth
                required
                autoComplete="name"
                disabled={isRegistering}
            />

            <TextField
                type="email"
                label="Email"
                value={formData.email}
                onChange={handleChange('email')}
                error={errors.email}
                startAdornment={<FiMail size={20} />}
                fullWidth
                required
                autoComplete="email"
                disabled={isRegistering}
            />

            <TextField
                type="password"
                label="Password"
                value={formData.password}
                onChange={handleChange('password')}
                error={errors.password}
                startAdornment={<FiLock size={20} />}
                helperText="At least 8 characters with uppercase, lowercase, and number"
                fullWidth
                required
                autoComplete="new-password"
                disabled={isRegistering}
            />

            <TextField
                type="password"
                label="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange('confirmPassword')}
                error={errors.confirmPassword}
                startAdornment={<FiLock size={20} />}
                fullWidth
                required
                autoComplete="new-password"
                disabled={isRegistering}
            />

            <div className="space-y-2">
                <label className="flex items-start gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={formData.acceptTerms}
                        onChange={handleChange('acceptTerms')}
                        className="w-5 h-5 mt-0.5 rounded border-outline text-primary focus:ring-2 focus:ring-primary flex-shrink-0"
                        disabled={isRegistering}
                    />
                    <span className="text-body-sm text-on-surface">
                        I agree to the{' '}
                        <button
                            type="button"
                            className="text-primary hover:underline"
                            onClick={() => window.open('/terms', '_blank')}
                        >
                            Terms of Service
                        </button>{' '}
                        and{' '}
                        <button
                            type="button"
                            className="text-primary hover:underline"
                            onClick={() => window.open('/privacy', '_blank')}
                        >
                            Privacy Policy
                        </button>
                    </span>
                </label>
                {errors.acceptTerms && (
                    <p className="text-label-sm text-error ml-8">{errors.acceptTerms}</p>
                )}
            </div>

            <Button
                type="submit"
                variant="filled"
                size="large"
                fullWidth
                loading={isRegistering}
                disabled={isRegistering}
            >
                Create account
            </Button>

            <div className="text-center">
                <span className="text-body-md text-on-variant">Already have an account? </span>
                <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="text-body-md text-primary hover:underline font-semibold"
                    disabled={isRegistering}
                >
                    Sign in
                </button>
            </div>
        </form>
    );
};

