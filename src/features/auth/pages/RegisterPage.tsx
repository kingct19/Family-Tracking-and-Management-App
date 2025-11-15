import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { RegisterForm } from '../components/RegisterForm';
import { FiMapPin, FiUsers, FiCheckCircle, FiZap } from 'react-icons/fi';

const RegisterPage = () => {
    return (
        <>
            <Helmet>
                <title>Create Account · HaloHub</title>
                <meta name="description" content="Create a new HaloHub account" />
            </Helmet>

            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
                <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    {/* Left side - Registration Form */}
                    <div className="w-full order-2 lg:order-1">
                        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
                            {/* Mobile Logo */}
                            <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                                    <FiMapPin size={24} className="text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">HaloHub</h2>
                            </div>

                            <div className="text-center mb-8">
                                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                                    Get started free
                                </h1>
                                <p className="text-lg text-gray-600">
                                    Create your account to begin coordinating with your group
                                </p>
                            </div>

                            <RegisterForm />

                            <div className="mt-8 pt-8 border-t border-gray-200">
                                <p className="text-center text-sm text-gray-500">
                                    By signing up, you agree to our Terms of Service and Privacy Policy
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right side - Benefits */}
                    <div className="order-1 lg:order-2">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
                                    <FiMapPin size={32} className="text-white" />
                                </div>
                                <h2 className="text-4xl font-bold text-gray-900">HaloHub</h2>
                            </div>

                            <h3 className="text-3xl font-bold text-gray-900 leading-tight">
                                Everything you need to keep your family safe and organized
                            </h3>

                            <p className="text-xl text-gray-600">
                                Join thousands of groups using our platform for real-time coordination
                                and peace of mind.
                            </p>

                            <div className="space-y-4 pt-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <FiCheckCircle size={24} className="text-green-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-1">Free to start</h4>
                                        <p className="text-gray-600">No credit card required. Start coordinating today.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <FiUsers size={24} className="text-purple-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-1">Unlimited members</h4>
                                        <p className="text-gray-600">Add as many group members as you need</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <FiZap size={24} className="text-indigo-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-1">Setup in minutes</h4>
                                        <p className="text-gray-600">Quick and easy onboarding process</p>
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
