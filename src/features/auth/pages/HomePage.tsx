import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import {
    FiMapPin,
    FiCheckSquare,
    FiMessageCircle,
    FiLock,
    FiAward,
    FiUsers
} from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';

const HomePage = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/'); // Redirect to map (main screen)
        }
    }, [isAuthenticated, navigate]);

    // Show loading while redirecting
    if (isAuthenticated) {
        return null;
    }

    const features = [
        {
            icon: <FiMapPin size={32} className="text-primary" />,
            title: 'Real-time Location',
            description: 'Track your family members in real-time with geofencing alerts',
        },
        {
            icon: <FiCheckSquare size={32} className="text-primary" />,
            title: 'Task Management',
            description: 'Assign and verify tasks with photo proof for accountability',
        },
        {
            icon: <FiMessageCircle size={32} className="text-primary" />,
            title: 'Group Messaging',
            description: 'Stay connected with real-time chat and broadcast alerts',
        },
        {
            icon: <FiLock size={32} className="text-primary" />,
            title: 'Digital Vault',
            description: 'Securely store sensitive information with client-side encryption',
        },
        {
            icon: <FiAward size={32} className="text-primary" />,
            title: 'Gamification',
            description: 'Earn XP, track streaks, and compete on leaderboards',
        },
        {
            icon: <FiUsers size={32} className="text-primary" />,
            title: 'Multi-Hub Support',
            description: 'Manage multiple groups - family, school, teams, and more',
        },
    ];

    return (
        <>
            <Helmet>
                <title>Family Safety & Coordination App</title>
                <meta
                    name="description"
                    content="A comprehensive family safety app with location tracking, task management, and secure communication"
                />
            </Helmet>

            <div className="min-h-screen bg-gray-50">
                {/* Hero Section */}
                <header className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-purple-500 to-indigo-600">
                    {/* Background pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="w-full h-full" style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                            backgroundRepeat: 'repeat'
                        }}></div>
                    </div>

                    <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
                        <div className="text-center">
                            {/* Animated Icon */}
                            <div className="mb-8 animate-bounce">
                                <div className="inline-flex items-center justify-center w-24 h-24 bg-white/10 backdrop-blur-sm rounded-full shadow-2xl">
                                    <FiMapPin size={40} className="text-white" />
                                </div>
                            </div>

                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-white">
                                Family Safety & Coordination
                            </h1>
                            <p className="text-xl md:text-2xl mb-12 text-white/90 max-w-3xl mx-auto leading-relaxed">
                                Keep your family safe, organized, and connected with real-time location tracking, task management, and secure communication
                            </p>

                            {/* CTA Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button
                                    variant="filled"
                                    size="large"
                                    onClick={() => navigate('/register')}
                                    className="bg-white text-purple-600 hover:bg-gray-100 shadow-2xl transform hover:scale-105 transition-all duration-200 px-8 py-4 text-lg font-semibold rounded-full"
                                >
                                    Get Started Free
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="large"
                                    onClick={() => navigate('/login')}
                                    className="border-2 border-white text-white hover:bg-white hover:text-purple-600 transition-all duration-200 px-8 py-4 text-lg font-semibold rounded-full"
                                >
                                    Sign In
                                </Button>
                            </div>

                            {/* Trust indicators */}
                            <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8 text-white/80">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                                    <span className="text-base font-medium">24/7 Monitoring</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                                    <span className="text-base font-medium">End-to-End Encryption</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                                    <span className="text-base font-medium">Real-time Alerts</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Wave separator */}
                    <div className="absolute bottom-0 left-0 right-0">
                        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
                            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V120Z" fill="#F9FAFB" />
                        </svg>
                    </div>
                </header>

                {/* Features Section */}
                <section className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                                Everything you need in one app
                            </h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                Our comprehensive platform combines safety, coordination, and motivation
                                to help families and teams work together seamlessly.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {features.map((feature, index) => (
                                <div
                                    key={index}
                                    className="group bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-2xl hover:border-purple-200 transition-all duration-300 transform hover:-translate-y-2"
                                >
                                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                                        <div className="text-white">
                                            {feature.icon}
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors duration-300">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="py-20 bg-gradient-to-br from-purple-600 via-purple-500 to-indigo-600">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                            <div className="transform hover:scale-110 transition-transform duration-300">
                                <div className="text-6xl font-bold text-white mb-3">10K+</div>
                                <div className="text-lg text-white/90">Families Connected</div>
                            </div>
                            <div className="transform hover:scale-110 transition-transform duration-300">
                                <div className="text-6xl font-bold text-white mb-3">99.9%</div>
                                <div className="text-lg text-white/90">Uptime Guarantee</div>
                            </div>
                            <div className="transform hover:scale-110 transition-transform duration-300">
                                <div className="text-6xl font-bold text-white mb-3">24/7</div>
                                <div className="text-lg text-white/90">Safety Monitoring</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-24 bg-gray-50">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-3xl p-12 md:p-16 shadow-2xl text-center">
                            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                                Ready to get started?
                            </h2>
                            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
                                Join thousands of families who trust our platform for their safety and coordination needs.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button
                                    variant="filled"
                                    size="large"
                                    onClick={() => navigate('/register')}
                                    className="bg-white text-purple-600 hover:bg-gray-100 shadow-xl transform hover:scale-105 transition-all duration-200 px-8 py-4 text-lg font-semibold rounded-full"
                                >
                                    Create your free account
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="large"
                                    onClick={() => navigate('/test')}
                                    className="border-2 border-white text-white hover:bg-white hover:text-purple-600 transition-all duration-200 px-8 py-4 text-lg font-semibold rounded-full"
                                >
                                    Try Demo
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-gray-900 py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                            <div className="md:col-span-2">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                        <FiMapPin size={24} className="text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white">Family Safety</h3>
                                </div>
                                <p className="text-gray-400 mb-6 leading-relaxed">
                                    The most comprehensive family safety platform that combines location tracking,
                                    task management, and secure communication in one app.
                                </p>
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-gray-800 hover:bg-purple-600 rounded-lg flex items-center justify-center transition-colors cursor-pointer">
                                        <FiMapPin size={20} className="text-white" />
                                    </div>
                                    <div className="w-12 h-12 bg-gray-800 hover:bg-purple-600 rounded-lg flex items-center justify-center transition-colors cursor-pointer">
                                        <FiCheckSquare size={20} className="text-white" />
                                    </div>
                                    <div className="w-12 h-12 bg-gray-800 hover:bg-purple-600 rounded-lg flex items-center justify-center transition-colors cursor-pointer">
                                        <FiMessageCircle size={20} className="text-white" />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold text-white mb-4">Product</h4>
                                <ul className="space-y-3">
                                    <li><button className="text-gray-400 hover:text-purple-400 transition-colors">Features</button></li>
                                    <li><button className="text-gray-400 hover:text-purple-400 transition-colors">Pricing</button></li>
                                    <li><button className="text-gray-400 hover:text-purple-400 transition-colors">Security</button></li>
                                    <li><button className="text-gray-400 hover:text-purple-400 transition-colors">API</button></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold text-white mb-4">Support</h4>
                                <ul className="space-y-3">
                                    <li><button className="text-gray-400 hover:text-purple-400 transition-colors">Help Center</button></li>
                                    <li><button className="text-gray-400 hover:text-purple-400 transition-colors">Contact Us</button></li>
                                    <li><button className="text-gray-400 hover:text-purple-400 transition-colors">Status</button></li>
                                    <li><button className="text-gray-400 hover:text-purple-400 transition-colors">Community</button></li>
                                </ul>
                            </div>
                        </div>
                        <div className="border-t border-gray-800 pt-8">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                <p className="text-gray-400">
                                    &copy; {new Date().getFullYear()} Family Safety & Coordination. All rights reserved.
                                </p>
                                <div className="flex gap-6">
                                    <button className="text-gray-400 hover:text-purple-400 transition-colors">Privacy Policy</button>
                                    <button className="text-gray-400 hover:text-purple-400 transition-colors">Terms of Service</button>
                                    <button className="text-gray-400 hover:text-purple-400 transition-colors">Cookie Policy</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
};

export default HomePage;
