import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
    FiUsers,
    FiMapPin,
    FiShield,
    FiMessageCircle,
    FiLock,
    FiStar,
    FiArrowRight,
    FiCheckCircle,
    FiSmartphone,
    FiHeart,
    FiTrendingUp
} from 'react-icons/fi';
import { useGSAP } from '@/hooks/useGSAP';
import { gsap } from 'gsap';

export const HomePage: React.FC = () => {
    const { animations, animationPresets } = useGSAP();

    useEffect(() => {
        // Initialize animations on page load
        const tl = gsap.timeline({ delay: 0.2 });

        // Hero section animations
        tl.add(animations.fadeIn('.hero-title', 0.8, 0))
            .add(animations.fadeIn('.hero-description', 0.6, 0.2), '-=0.3')
            .add(animations.staggerIn('.hero-buttons button', 0.5, 0.1), '-=0.2')
            .add(animations.staggerIn('.feature-card', 0.6, 0.15), '-=0.1');
    }, []);

    return (
        <>
            <Helmet>
                <title>FamilyTracker - Family Management App</title>
                <meta name="description" content="Keep your family connected with real-time location tracking, smart task management, and secure digital vault features." />
            </Helmet>

            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
                {/* Header */}
                <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                                    <FiUsers className="w-6 h-6 text-white" />
                                </div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                    FamilyTracker
                                </h1>
                            </div>
                            <div className="flex items-center space-x-4">
                                <Link
                                    to="/login"
                                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                                    aria-label="Sign in to your account"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/register"
                                    className="inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
                                    aria-label="Create a new account"
                                >
                                    Get Started
                                </Link>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="relative overflow-hidden pt-20 pb-32">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h1 className="hero-title text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                                Keep Your Family{' '}
                                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                    Connected
                                </span>
                            </h1>
                            <p className="hero-description text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
                                A comprehensive family management platform that helps you stay connected,
                                organized, and secure with your loved ones.
                            </p>
                            <div className="hero-buttons flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    to="/register"
                                    className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-full shadow-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
                                >
                                    Start Free Trial
                                    <FiArrowRight className="ml-2 w-5 h-5" />
                                </Link>
                                <Link
                                    to="/login"
                                    className="inline-flex items-center px-8 py-4 border-2 border-gray-300 text-lg font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
                                    aria-label="Sign in to your existing account"
                                >
                                    Sign In
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Background decoration */}
                    <div className="absolute inset-0 -z-10">
                        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl"></div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-24 bg-white/50 backdrop-blur-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">
                                Everything Your Family Needs
                            </h2>
                            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                                Powerful features designed to keep your family safe, organized, and connected
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {/* Real-time Location Tracking */}
                            <div className="feature-card bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6">
                                    <FiMapPin className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                                    Real-time Location Tracking
                                </h3>
                                <p className="text-gray-600 mb-6 leading-relaxed">
                                    Track family members' locations in real-time with geofencing alerts and safety features.
                                </p>
                                <div className="flex items-center text-blue-600 font-medium">
                                    <FiCheckCircle className="w-5 h-5 mr-2" />
                                    Live tracking
                                </div>
                            </div>

                            {/* Smart Task Management */}
                            <div className="feature-card bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6">
                                    <FiStar className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                                    Smart Task Management
                                </h3>
                                <p className="text-gray-600 mb-6 leading-relaxed">
                                    Manage family chores with photo verification, automatic ranking, and gamification.
                                </p>
                                <div className="flex items-center text-green-600 font-medium">
                                    <FiCheckCircle className="w-5 h-5 mr-2" />
                                    Photo verification
                                </div>
                            </div>

                            {/* Digital Vault */}
                            <div className="feature-card bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                                    <FiLock className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                                    Digital Vault
                                </h3>
                                <p className="text-gray-600 mb-6 leading-relaxed">
                                    Securely store passwords, important documents, and family information.
                                </p>
                                <div className="flex items-center text-purple-600 font-medium">
                                    <FiCheckCircle className="w-5 h-5 mr-2" />
                                    Bank-level security
                                </div>
                            </div>

                            {/* Family Messaging */}
                            <div className="feature-card bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                                <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6">
                                    <FiMessageCircle className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                                    Family Messaging
                                </h3>
                                <p className="text-gray-600 mb-6 leading-relaxed">
                                    Stay connected with secure communication and emergency alerts.
                                </p>
                                <div className="flex items-center text-pink-600 font-medium">
                                    <FiCheckCircle className="w-5 h-5 mr-2" />
                                    Secure chat
                                </div>
                            </div>

                            {/* Multiple Hubs */}
                            <div className="feature-card bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6">
                                    <FiUsers className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                                    Multiple Hubs
                                </h3>
                                <p className="text-gray-600 mb-6 leading-relaxed">
                                    Switch between family, sports teams, school groups, and work teams.
                                </p>
                                <div className="flex items-center text-orange-600 font-medium">
                                    <FiCheckCircle className="w-5 h-5 mr-2" />
                                    Flexible groups
                                </div>
                            </div>

                            {/* Legacy Planning */}
                            <div className="feature-card bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                                <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6">
                                    <FiHeart className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                                    Legacy Planning
                                </h3>
                                <p className="text-gray-600 mb-6 leading-relaxed">
                                    Preserve family memories and important documents for future generations.
                                </p>
                                <div className="flex items-center text-teal-600 font-medium">
                                    <FiCheckCircle className="w-5 h-5 mr-2" />
                                    Memory preservation
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                            <div className="text-white">
                                <div className="text-4xl font-bold mb-2">10M+</div>
                                <div className="text-blue-100">Families Connected</div>
                            </div>
                            <div className="text-white">
                                <div className="text-4xl font-bold mb-2">99.9%</div>
                                <div className="text-blue-100">Uptime Guarantee</div>
                            </div>
                            <div className="text-white">
                                <div className="text-4xl font-bold mb-2">24/7</div>
                                <div className="text-blue-100">Support Available</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-24 bg-white">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-4xl font-bold text-gray-900 mb-6">
                            Ready to Get Started?
                        </h2>
                        <p className="text-xl text-gray-600 mb-8">
                            Join thousands of families who trust FamilyTracker to keep them connected and safe.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to="/register"
                                className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-full shadow-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
                            >
                                Start Your Free Trial
                                <FiArrowRight className="ml-2 w-5 h-5" />
                            </Link>
                            <Link
                                to="/login"
                                className="inline-flex items-center px-8 py-4 border-2 border-gray-300 text-lg font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
                            >
                                Sign In
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-gray-900 text-white py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            <div className="col-span-1 md:col-span-2">
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                                        <FiUsers className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold">FamilyTracker</h3>
                                </div>
                                <p className="text-gray-400 mb-6 max-w-md">
                                    The most trusted family management platform, keeping families connected and safe.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-4">Product</h4>
                                <ul className="space-y-2 text-gray-400">
                                    <li><Link to="/features" className="hover:text-white transition-colors">Features</Link></li>
                                    <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                                    <li><Link to="/security" className="hover:text-white transition-colors">Security</Link></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-4">Support</h4>
                                <ul className="space-y-2 text-gray-400">
                                    <li><Link to="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                                    <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                                    <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                                </ul>
                            </div>
                        </div>
                        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                            <p>&copy; 2024 FamilyTracker. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
};

export default HomePage;