import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { useAuth } from '../hooks/useAuth';
import { loginSchema, type LoginFormData } from '@/lib/validation/auth-schemas';
import { toast } from 'react-hot-toast';
import { MdEmail, MdLock } from 'react-icons/md';

export const LoginForm = () => {
    const navigate = useNavigate();
    const { login, isLoggingIn, isAuthenticated } = useAuth();
    const [formData, setFormData] = useState<LoginFormData>({
        email: '',
        password: '',
        rememberMe: false,
    });
    const [errors, setErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});
    const [loginSuccess, setLoginSuccess] = useState(false);

    // Redirect when auth state updates after successful login
    useEffect(() => {
        if (loginSuccess && isAuthenticated) {
            navigate('/map', { replace: true });
            setLoginSuccess(false);
        }
    }, [loginSuccess, isAuthenticated, navigate]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrors({});

        // Validate form data
        const result = loginSchema.safeParse(formData);
        if (!result.success) {
            const fieldErrors: Partial<Record<keyof LoginFormData, string>> = {};
            result.error.errors.forEach((err) => {
                if (err.path[0]) {
                    fieldErrors[err.path[0] as keyof LoginFormData] = err.message;
                }
            });
            setErrors(fieldErrors);
            return;
        }

        try {
            const response = await login(formData);

            if (response.success) {
                toast.success('Welcome back!');
                // Set flag to trigger redirect when auth state updates
                setLoginSuccess(true);
                // Auth state listener will handle the redirect via useEffect above
            } else {
                toast.error(response.error || 'Login failed');
            }
        } catch (error) {
            toast.error('An unexpected error occurred');
        }
    };

    const handleChange = (field: keyof LoginFormData) => (
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
                type="email"
                label="Email"
                value={formData.email}
                onChange={handleChange('email')}
                error={errors.email}
                startAdornment={<MdEmail size={20} />}
                fullWidth
                required
                autoComplete="email"
                disabled={isLoggingIn}
            />

            <TextField
                type="password"
                label="Password"
                value={formData.password}
                onChange={handleChange('password')}
                error={errors.password}
                startAdornment={<MdLock size={20} />}
                fullWidth
                required
                autoComplete="current-password"
                disabled={isLoggingIn}
            />

            <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={formData.rememberMe}
                        onChange={handleChange('rememberMe')}
                        className="w-5 h-5 rounded border-outline text-primary focus:ring-2 focus:ring-primary"
                        disabled={isLoggingIn}
                    />
                    <span className="text-body-md text-on-surface">Remember me</span>
                </label>

                <button
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                    className="text-body-md text-primary hover:underline"
                    disabled={isLoggingIn}
                >
                    Forgot password?
                </button>
            </div>

            <Button
                type="submit"
                variant="filled"
                size="large"
                fullWidth
                loading={isLoggingIn}
                disabled={isLoggingIn}
            >
                Sign in
            </Button>

            <div className="text-center">
                <span className="text-body-md text-on-variant">Don&apos;t have an account? </span>
                <button
                    type="button"
                    onClick={() => navigate('/register')}
                    className="text-body-md text-primary hover:underline font-semibold"
                    disabled={isLoggingIn}
                >
                    Sign up
                </button>
            </div>
        </form>
    );
};

