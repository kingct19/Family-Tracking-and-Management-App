import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm';
import { MdLocationOn, MdLock, MdSecurity, MdTaskAlt, MdMessage, MdPeople, MdStar } from 'react-icons/md';
import Lottie from 'lottie-react';
import { useState, useEffect } from 'react';

// Validate if data is a valid Lottie animation
const isValidLottieData = (data: any): boolean => {
    return data && 
           typeof data === 'object' && 
           Array.isArray(data.layers) && 
           typeof data.v === 'string' &&
           typeof data.fr === 'number';
};

// Feature carousel data
const features = [
    {
        icon: MdLocationOn,
        title: 'Real-time Location Tracking',
        description: 'Know where your loved ones are with live location sharing and geofencing alerts.',
    },
    {
        icon: MdTaskAlt,
        title: 'Task Management',
        description: 'Assign and verify tasks with photo proof. Gamify chores with XP points and leaderboards.',
    },
    {
        icon: MdMessage,
        title: 'Secure Messaging',
        description: 'Stay connected with real-time chat and broadcast alerts to your entire hub.',
    },
    {
        icon: MdPeople,
        title: 'Multi-Hub Support',
        description: 'Manage multiple groups—family, school, sports teams, and more—all in one place.',
    },
    {
        icon: MdStar,
        title: 'Rewards & Gamification',
        description: 'Earn XP, track streaks, and compete on leaderboards. Make family tasks fun!',
    },
];

const LoginPage = () => {
    const [animationData, setAnimationData] = useState<any>(null);
    const [hasError, setHasError] = useState(false);
    const [currentFeature, setCurrentFeature] = useState(0);

    // Load Lottie animation from local file to avoid CORS issues
    useEffect(() => {
        // Load from local public folder
        fetch('/lottie-login.json')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch');
                return res.json();
            })
            .then(data => {
                if (isValidLottieData(data)) {
                    setAnimationData(data);
                } else {
                    setHasError(true);
                }
            })
            .catch(() => {
                setHasError(true);
            });
    }, []);

    // Auto-rotate carousel
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentFeature((prev) => (prev + 1) % features.length);
        }, 4000); // Change every 4 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <Helmet>
                <title>Sign In · HaloHub</title>
                <meta name="description" content="Sign in to your HaloHub account" />
            </Helmet>

            <div className="min-h-screen bg-gray-50 flex flex-col safe-top safe-bottom">
                {/* Top Header with Logo/Brand */}
                <div className="w-full px-4 sm:px-6 md:px-8 pt-4 sm:pt-6 md:pt-8 pb-4 sm:pb-6">
                    <div className="max-w-7xl mx-auto">
                        <Link to="/" className="inline-flex items-center gap-2 group">
                            <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                                <img 
                                    src="/halohub.png" 
                                    alt="HaloHub" 
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <span className="text-title-md font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">HaloHub</span>
                        </Link>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex items-center justify-center px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 md:pb-8">
                    <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-0 items-stretch">
                    {/* Left side - Login Form */}
                    <div className="w-full max-w-md mx-auto lg:max-w-none order-2 lg:order-1">
                        <div className="bg-white rounded-2xl lg:rounded-r-none lg:rounded-l-2xl p-8 sm:p-10 md:p-12 shadow-lg h-full flex flex-col">

                            <div className="mb-8">
                                <h1 className="text-headline-lg font-bold text-gray-900 mb-2">
                                    Welcome back
                                </h1>
                                <p className="text-body-md text-gray-600">
                                    Welcome back! Please enter your details.
                                </p>
                            </div>

                            <LoginForm />

                            <div className="mt-auto pt-8 border-t border-gray-100">
                                <p className="text-center text-body-xs text-gray-500">
                                    © HaloHub {new Date().getFullYear()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right side - Lottie Animation with Feature Carousel */}
                    <div className="hidden lg:flex items-stretch order-1 lg:order-2">
                        <div className="relative w-full flex flex-col">
                            {/* Lottie Animation Container with warm gradient background */}
                            <div className="relative bg-gradient-to-br from-amber-50 via-purple-50/80 to-pink-50 rounded-2xl lg:rounded-l-none lg:rounded-r-2xl p-8 sm:p-10 md:p-12 shadow-lg flex-1 flex flex-col">
                                {/* Lottie Animation */}
                                <div className="flex-1 flex items-center justify-center overflow-hidden mb-6">
                                    {animationData && !hasError ? (
                                        <Lottie 
                                            animationData={animationData}
                                            loop={true}
                                            autoplay={true}
                                            className="w-full h-full max-h-[400px]"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <div className="w-48 h-48 bg-gradient-to-br from-purple-200 to-amber-200 rounded-full flex items-center justify-center animate-pulse">
                                                <MdSecurity size={64} className="text-purple-600" />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Feature Carousel */}
                                <div className="relative mt-auto">
                                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-purple-100/50 shadow-sm">
                                        {/* Feature Content */}
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                                {(() => {
                                                    const IconComponent = features[currentFeature].icon;
                                                    return <IconComponent size={24} className="text-purple-600" />;
                                                })()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-title-md font-semibold text-gray-900 mb-1">
                                                    {features[currentFeature].title}
                                                </h3>
                                                <p className="text-body-sm text-gray-600 leading-relaxed">
                                                    {features[currentFeature].description}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Carousel Indicators */}
                                        <div className="flex items-center justify-center gap-2">
                                            {features.map((_, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => setCurrentFeature(index)}
                                                    className={`h-2 rounded-full transition-all duration-300 ${
                                                        index === currentFeature
                                                            ? 'w-8 bg-purple-600'
                                                            : 'w-2 bg-gray-300 hover:bg-gray-400'
                                                    }`}
                                                    aria-label={`Go to feature ${index + 1}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
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

export default LoginPage;
