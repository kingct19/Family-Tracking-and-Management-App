import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ForgotPasswordForm } from '../components/ForgotPasswordForm';
import { FiMapPin, FiArrowLeft } from 'react-icons/fi';

const ForgotPasswordPage = () => {
    return (
        <>
            <Helmet>
                <title>Reset Password · HaloHub</title>
                <meta name="description" content="Reset your HaloHub password" />
            </Helmet>

            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
                        {/* Logo */}
                        <div className="flex items-center justify-center gap-3 mb-8">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                                <FiMapPin size={24} className="text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">HaloHub</h2>
                        </div>

                        <div className="text-center mb-8">
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                                Reset Password
                            </h1>
                            <p className="text-lg text-gray-600">
                                Enter your email address and we&apos;ll send you a link to reset your password
                            </p>
                        </div>

                        <ForgotPasswordForm />

                        <div className="mt-6 text-center">
                            <Link
                                to="/login"
                                className="inline-flex items-center gap-2 text-body-md text-primary hover:underline"
                            >
                                <FiArrowLeft size={16} />
                                Back to Sign In
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ForgotPasswordPage;

