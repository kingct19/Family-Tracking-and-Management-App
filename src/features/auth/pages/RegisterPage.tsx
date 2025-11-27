import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { RegisterForm } from '../components/RegisterForm';
import { MdLocationOn, MdPeople, MdCheckCircle, MdFlashOn, MdArrowBack } from 'react-icons/md';

const RegisterPage = () => {
    return (
        <>
            <Helmet>
                <title>Create Account · HaloHub</title>
                <meta name="description" content="Create a new HaloHub account" />
            </Helmet>

            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                    {/* Left side - Registration Form */}
                    <div className="w-full order-2 lg:order-1">
                        <div className="card p-8 md:p-12 shadow-halo-button">
                            {/* Mobile Logo */}
                            <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
                                <div className="w-12 h-12 rounded-card overflow-hidden bg-transparent shadow-halo-map-card">
                                    <img
                                        src="/halohub.png"
                                        alt="HaloHub"
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <h2 className="text-headline-sm font-semibold text-on-surface">HaloHub</h2>
                            </div>

                            <div className="text-center mb-8">
                                <h1 className="text-headline-md md:text-headline-lg font-semibold text-on-surface mb-3">
                                    Get started free
                                </h1>
                                <p className="text-body-lg text-on-variant">
                                    Create your account to begin coordinating with your group
                                </p>
                            </div>

                            <RegisterForm />

                            <div className="mt-8 pt-8 border-t border-outline-variant">
                                <p className="text-center text-body-sm text-on-variant">
                                    By signing up, you agree to our Terms of Service and Privacy Policy
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right side - Benefits */}
                    <div className="order-1 lg:order-2">
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
                                Everything you need to keep your family safe and organized
                            </h3>

                            <p className="text-body-lg text-on-variant">
                                Join thousands of groups using our platform for real-time coordination
                                and peace of mind.
                            </p>

                            <div className="space-y-4 pt-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-primary-container rounded-xl flex items-center justify-center flex-shrink-0">
                                        <MdCheckCircle size={24} className="text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="text-title-md font-semibold text-on-surface mb-1">Free to start</h4>
                                        <p className="text-body-md text-on-variant">No credit card required. Start coordinating today.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-primary-container rounded-xl flex items-center justify-center flex-shrink-0">
                                        <MdPeople size={24} className="text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="text-title-md font-semibold text-on-surface mb-1">Unlimited members</h4>
                                        <p className="text-body-md text-on-variant">Add as many group members as you need</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-primary-container rounded-xl flex items-center justify-center flex-shrink-0">
                                        <MdFlashOn size={24} className="text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="text-title-md font-semibold text-on-surface mb-1">Setup in minutes</h4>
                                        <p className="text-body-md text-on-variant">Quick and easy onboarding process</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default RegisterPage;
