import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm';
import { FiMapPin, FiLock, FiShield } from 'react-icons/fi';

const LoginPage = () => {
    return (
        <>
            <Helmet>
                <title>Sign In · HaloHub</title>
                <meta name="description" content="Sign in to your HaloHub account" />
            </Helmet>

            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center p-4">
                <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    {/* Left side - Branding */}
                    <div className="hidden lg:block">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-16 h-16 rounded-[20%] overflow-hidden bg-transparent shadow-xl">
                                    <img 
                                        src="/halohub.png" 
                                        alt="HaloHub" 
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <h2 className="text-4xl font-bold text-gray-900">HaloHub</h2>
                            </div>

                            <h3 className="text-3xl font-bold text-gray-900 leading-tight">
                                Keep your loved ones safe and connected
                            </h3>

                            <p className="text-xl text-gray-600">
                                Sign in to access real-time location tracking, task management,
                                and secure communication for your group.
                            </p>

                            <div className="space-y-4 pt-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <FiShield size={24} className="text-purple-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-1">Secure & Private</h4>
                                        <p className="text-gray-600">End-to-end encryption keeps your data safe</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <FiLock size={24} className="text-indigo-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-1">Always Protected</h4>
                                        <p className="text-gray-600">24/7 monitoring and instant alerts</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right side - Login Form */}
                    <div className="w-full">
                        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
                            {/* Mobile Logo */}
                            <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                                    <FiMapPin size={24} className="text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Family Safety</h2>
                            </div>

                            <div className="text-center mb-8">
                                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                                    Welcome back
                                </h1>
                                <p className="text-lg text-gray-600">
                                    Sign in to continue to your dashboard
                                </p>
                            </div>

                            <LoginForm />

                            <div className="mt-8 pt-8 border-t border-gray-200">
                                <p className="text-center text-sm text-gray-500">
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
