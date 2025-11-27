import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm';
import { MdLocationOn, MdLock, MdSecurity, MdArrowBack } from 'react-icons/md';

const LoginPage = () => {
    return (
        <>
            <Helmet>
                <title>Sign In · HaloHub</title>
                <meta name="description" content="Sign in to your HaloHub account" />
            </Helmet>

            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                    {/* Left side - Branding */}
                    <div className="hidden lg:block">
                        <div className="space-y-8">
                            <Link to="/" className="inline-flex items-center gap-3 group">
                                <MdArrowBack size={20} className="text-on-variant group-hover:text-primary transition-colors" />
                                <span className="text-body-md text-on-variant group-hover:text-primary transition-colors">Back to home</span>
                            </Link>

                            <div className="flex items-center gap-3">
                                <div className="w-16 h-16 rounded-card overflow-hidden bg-transparent shadow-halo-map-card">
                                    <img 
                                        src="/halohub.png" 
                                        alt="HaloHub" 
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <h2 className="text-headline-lg font-semibold text-on-surface">HaloHub</h2>
                            </div>

                            <h3 className="text-headline-md font-semibold text-on-surface leading-tight">
                                Keep your loved ones safe and connected
                            </h3>

                            <p className="text-body-lg text-on-variant">
                                Sign in to access real-time location tracking, task management,
                                and secure communication for your group.
                            </p>

                            <div className="space-y-4 pt-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-primary-container rounded-xl flex items-center justify-center flex-shrink-0">
                                        <MdSecurity size={24} className="text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="text-title-md font-semibold text-on-surface mb-1">Secure & Private</h4>
                                        <p className="text-body-md text-on-variant">End-to-end encryption keeps your data safe</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-primary-container rounded-xl flex items-center justify-center flex-shrink-0">
                                        <MdLock size={24} className="text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="text-title-md font-semibold text-on-surface mb-1">Always Protected</h4>
                                        <p className="text-body-md text-on-variant">24/7 monitoring and instant alerts</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right side - Login Form */}
                    <div className="w-full">
                        <div className="card p-8 md:p-12 shadow-halo-button">
                            {/* Mobile Logo */}
                            <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
                                <div className="w-12 h-12 gradient-iris-glow rounded-card flex items-center justify-center shadow-halo-button">
                                    <MdLocationOn size={24} className="text-white" />
                                </div>
                                <h2 className="text-headline-sm font-semibold text-on-surface">HaloHub</h2>
                            </div>

                            <div className="text-center mb-8">
                                <h1 className="text-headline-md md:text-headline-lg font-semibold text-on-surface mb-3">
                                    Welcome back
                                </h1>
                                <p className="text-body-lg text-on-variant">
                                    Sign in to continue to your dashboard
                                </p>
                            </div>

                            <LoginForm />

                            <div className="mt-8 pt-8 border-t border-outline-variant">
                                <p className="text-center text-body-sm text-on-variant">
                                    Protected by enterprise-grade security
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LoginPage;
