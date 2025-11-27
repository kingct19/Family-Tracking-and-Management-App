import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
    MdLocationOn,
    MdKeyboardArrowDown,
    MdMenu,
    MdClose,
    MdCheckCircle,
    MdSecurity,
    MdMessage,
    MdTaskAlt,
    MdPeople,
    MdStar,
    MdEmail,
    MdPhone,
    MdShare,
    MdPublic,
} from 'react-icons/md';
import { useAuth } from '../hooks/useAuth';
import { useState, Suspense, lazy } from 'react';
import { cn } from '@/lib/utils/cn';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Lazy load Spline to handle errors gracefully
const Spline = lazy(() => import('@splinetool/react-spline'));

// Wrapper component to handle Spline errors
const SplineComponent = ({ onError }: { onError: () => void }) => {
    return (
        <div className="absolute inset-0 w-full h-full">
            <Spline
                scene="https://prod.spline.design/ifcw0o9odoIFHkcx/scene.splinecode"
                onError={(error) => {
                    console.error('Spline error:', error);
                    onError();
                }}
                onLoad={() => {
                    console.log('Spline loaded successfully');
                }}
                style={{ 
                    width: '100%', 
                    height: '100%',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0
                }}
            />
        </div>
    );
};

const HomePage = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [splineError, setSplineError] = useState(false);
    const [splineLoading, setSplineLoading] = useState(true);

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/map', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    // Show loading while checking auth or redirecting
    if (isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-on-surface">Redirecting...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>HaloHub: The #1 family locator app & safety membership</title>
                <meta
                    name="description"
                    content="Protect and connect your loved ones with HaloHub's advanced location, task management, and digital safety features."
                />
            </Helmet>

            <div className="min-h-screen bg-white">
                {/* Navigation Bar */}
                <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-14 sm:h-16">
                            {/* Left: Logo */}
                            <button
                                onClick={() => navigate('/')}
                                className="flex items-center gap-2.5 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg p-1"
                                aria-label="HaloHub Home"
                            >
                                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg overflow-hidden bg-transparent flex-shrink-0">
                                        <img 
                                            src="/halohub.png" 
                                            alt="HaloHub" 
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                <span className="text-title-md sm:text-title-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                                    HaloHub
                                </span>
                            </button>

                            {/* Center: Navigation Links (Desktop) */}
                            <div className="hidden lg:flex items-center gap-8">
                                <a 
                                    href="#about"
                                    className="text-body-md text-on-surface hover:text-primary transition-colors font-medium py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded px-2"
                                    aria-label="About HaloHub"
                                >
                                    About
                                </a>
                                <a 
                                    href="#pricing"
                                    className="text-body-md text-on-surface hover:text-primary transition-colors font-medium flex items-center gap-1 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded px-2"
                                    aria-label="Plans and Pricing"
                                >
                                    Plans & Pricing
                                    <MdKeyboardArrowDown size={18} className="text-on-variant" />
                                </a>
                                <a 
                                    href="#features"
                                    className="text-body-md text-on-surface hover:text-primary transition-colors font-medium flex items-center gap-1 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded px-2"
                                    aria-label="Features"
                                >
                                    Features
                                    <MdKeyboardArrowDown size={18} className="text-on-variant" />
                                </a>
                                <a 
                                    href="#resources"
                                    className="text-body-md text-on-surface hover:text-primary transition-colors font-medium flex items-center gap-1 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded px-2"
                                    aria-label="Resources"
                                >
                                    Resources
                                    <MdKeyboardArrowDown size={18} className="text-on-variant" />
                                </a>
                                <a 
                                    href="#reviews"
                                    className="text-body-md text-on-surface hover:text-primary transition-colors font-medium py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded px-2"
                                    aria-label="Reviews"
                                >
                                    Reviews
                                </a>
                                </div>

                            {/* Right: Auth Buttons */}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => navigate('/login')}
                                    className="text-body-md text-on-surface hover:text-primary transition-colors font-medium hidden sm:block py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 touch-target"
                                    aria-label="Sign in"
                                >
                                    Sign in
                                </button>
                                <button
                                    onClick={() => navigate('/register')}
                                    className="bg-primary hover:bg-primary/90 text-on-primary px-6 py-2.5 rounded-full text-label-md font-semibold transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 touch-target min-h-[44px]"
                                    aria-label="Get started with HaloHub"
                                >
                                    Get started
                                </button>
                                
                                {/* Mobile Menu Button */}
                                <button
                                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                    className="lg:hidden p-2.5 text-on-surface hover:bg-surface-variant rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 touch-target"
                                    aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                                    aria-expanded={mobileMenuOpen}
                                >
                                    {mobileMenuOpen ? <MdClose size={24} /> : <MdMenu size={24} />}
                                </button>
                            </div>
                                </div>

                        {/* Mobile Menu */}
                        {mobileMenuOpen && (
                            <div className="lg:hidden py-4 border-t border-outline-variant animate-in slide-in-from-top">
                                <div className="flex flex-col gap-1">
                                    <a 
                                        href="#about"
                                        className="text-body-md text-on-surface hover:bg-surface-variant hover:text-primary transition-colors font-medium text-left py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 touch-target"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        About
                                    </a>
                                    <a 
                                        href="#pricing"
                                        className="text-body-md text-on-surface hover:bg-surface-variant hover:text-primary transition-colors font-medium text-left py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 touch-target"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Plans & Pricing
                                    </a>
                                    <a 
                                        href="#features"
                                        className="text-body-md text-on-surface hover:bg-surface-variant hover:text-primary transition-colors font-medium text-left py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 touch-target"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Features
                                    </a>
                                    <a 
                                        href="#resources"
                                        className="text-body-md text-on-surface hover:bg-surface-variant hover:text-primary transition-colors font-medium text-left py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 touch-target"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Resources
                                    </a>
                                    <a 
                                        href="#reviews"
                                        className="text-body-md text-on-surface hover:bg-surface-variant hover:text-primary transition-colors font-medium text-left py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 touch-target"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Reviews
                                    </a>
                                    <button
                                        onClick={() => {
                                            setMobileMenuOpen(false);
                                            navigate('/login');
                                        }}
                                        className="text-body-md text-on-surface hover:bg-surface-variant hover:text-primary transition-colors font-medium text-left py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 touch-target mt-2"
                                    >
                                        Sign in
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </nav>

                {/* Hero Section - Split Layout */}
                <section className="min-h-[calc(100vh-64px)] flex flex-col lg:flex-row">
                    {/* Left Side - Light Lavender Background */}
                    <div className="flex-1 bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-50 flex items-center px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8 sm:py-12 md:py-16 lg:py-0">
                        <div className="max-w-2xl w-full mx-auto lg:mx-0">
                            {/* Headline - Material Design Typography - Responsive */}
                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-semibold text-purple-900 mb-4 sm:mb-6 leading-tight tracking-tight">
                                HaloHub: The #1 family locator app & safety membership.
                            </h1>

                            {/* Description - Better line height and spacing - Responsive */}
                            <p className="text-base sm:text-lg md:text-xl lg:text-xl text-purple-800 mb-6 sm:mb-8 md:mb-10 leading-relaxed max-w-xl">
                                Protect and connect your loved ones, pets, & important stuff with HaloHub's advanced location, task management, & digital safety features. Plus, track tasks, manage rewards, and stay connected with real-time messaging.
                            </p>

                            {/* CTA Button - Material Design Button - Responsive */}
                            <button
                                onClick={() => navigate('/register')}
                                className="bg-primary hover:bg-primary/90 text-on-primary px-6 sm:px-8 py-3 sm:py-4 rounded-full text-sm sm:text-base md:text-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] mb-4 sm:mb-6 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-purple-50 touch-target min-h-[48px] sm:min-h-[56px] w-full sm:w-auto"
                                aria-label="Join HaloHub for free"
                            >
                                Join for free
                            </button>

                            {/* Sign In Link - Better typography - Responsive */}
                            <p className="text-sm sm:text-base text-purple-700">
                                Already a member?{' '}
                                <button
                                    onClick={() => navigate('/login')}
                                    className="text-primary hover:text-purple-800 underline font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-purple-50 rounded px-1"
                                    aria-label="Sign in to your account"
                                >
                                    Sign in here.
                                </button>
                            </p>
                        </div>
                    </div>

                    {/* Right Side - Darker Purple Background with Spline 3D Scene */}
                    <div className="flex-1 bg-gradient-to-br from-purple-600 via-indigo-700 to-purple-600 relative overflow-hidden min-h-[400px] sm:min-h-[500px] md:min-h-[600px] lg:min-h-0">
                        {/* Decorative Elements - Subtle and refined - Responsive */}
                        <div className="absolute top-4 right-4 sm:top-10 sm:right-10 w-16 h-16 sm:w-32 sm:h-32 bg-white/10 rounded-full blur-3xl opacity-50 z-0"></div>
                        <div className="absolute bottom-4 left-4 sm:bottom-10 sm:left-10 w-20 h-20 sm:w-40 sm:h-40 bg-white/10 rounded-full blur-3xl opacity-50 z-0"></div>
                        <div className="absolute top-1/2 right-1/4 w-12 h-12 sm:w-24 sm:h-24 bg-white/5 rounded-full blur-2xl opacity-30 z-0"></div>

                        {/* Spline 3D Scene with Fallback - Fills entire container */}
                        <div className="absolute inset-0 z-10">
                            <ErrorBoundary
                                fallback={
                                    // Fallback to phone mockup if Spline fails - Responsive
                                    <div className="flex items-center justify-center h-full w-full p-4">
                                        <div className="w-full max-w-[240px] sm:max-w-[280px] md:max-w-[320px]">
                                            <div className="relative">
                                                <div className="bg-gray-900 rounded-[2rem] p-1.5 shadow-2xl">
                                                    <div className="bg-white rounded-[1.75rem] overflow-hidden">
                                                        <div className="bg-white relative overflow-hidden flex items-center justify-center" style={{ height: '100%', aspectRatio: '9/19.5' }}>
                                                            <img 
                                                                src="/mock.png" 
                                                                alt="HaloHub app interface showing map and location features" 
                                                                className="w-full h-full object-contain"
                                            loading="lazy"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                }
                            >
                                <Suspense
                                    fallback={
                                        <div className="flex items-center justify-center h-full w-full">
                                            <div className="text-center text-white/80 px-4">
                                                <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-white mx-auto mb-4"></div>
                                                <p className="text-sm sm:text-base md:text-lg">Loading 3D scene...</p>
                                    </div>
                                </div>
                                    }
                                >
                                    <SplineComponent 
                                        onError={() => setSplineError(true)}
                                    />
                                </Suspense>
                            </ErrorBoundary>
                        </div>
                    </div>
                </section>

                {/* About Section */}
                <section id="about" className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center">
                            <div className="order-2 lg:order-1">
                                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-purple-900 mb-4 sm:mb-6">
                                    Built for families, by families
                                </h2>
                                <p className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed mb-4 sm:mb-6">
                                    HaloHub was born from a simple need: keeping our loved ones safe and connected in an increasingly busy world. 
                                    We understand the challenges of modern family life—balancing work, school, activities, and quality time together.
                                </p>
                                <p className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed mb-6 sm:mb-8">
                                    That's why we created a platform that doesn't just track locations—it helps families coordinate, communicate, 
                                    and celebrate achievements together. With HaloHub, peace of mind meets practical family management.
                                </p>
                                <div className="flex flex-wrap gap-3 sm:gap-4">
                                    <div className="flex items-center gap-2 text-purple-700">
                                        <MdCheckCircle size={18} className="sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                                        <span className="text-sm sm:text-base font-medium">10,000+ Happy Families</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-purple-700">
                                        <MdCheckCircle size={18} className="sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                                        <span className="text-sm sm:text-base font-medium">99.9% Uptime</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-purple-700">
                                        <MdCheckCircle size={18} className="sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                                        <span className="text-sm sm:text-base font-medium">24/7 Support</span>
                                    </div>
                                </div>
                            </div>
                            <div className="relative order-1 lg:order-2">
                                <img 
                                    src="https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&h=600&fit=crop&q=80" 
                                    alt="Happy family using HaloHub together" 
                                    className="rounded-2xl shadow-xl w-full h-auto"
                                    loading="lazy"
                                />
                                <div className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 bg-purple-600 text-white p-4 sm:p-6 rounded-xl shadow-xl max-w-[180px] sm:max-w-[200px]">
                                    <p className="text-xs sm:text-sm font-semibold mb-1">Trusted by families worldwide</p>
                                    <p className="text-xs sm:text-sm opacity-90">Join thousands of families who trust HaloHub</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-12 sm:py-16 md:py-20 lg:py-24 bg-purple-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-8 sm:mb-10 md:mb-12">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-purple-900 mb-3 sm:mb-4">
                                Everything your family needs, in one place
                            </h2>
                            <p className="text-base sm:text-lg md:text-xl text-gray-700 max-w-2xl mx-auto px-4">
                                Powerful features designed to keep your family safe, organized, and connected
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow group">
                                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                                    <MdLocationOn size={28} className="text-purple-600" />
                                    </div>
                                <h3 className="text-title-md font-semibold text-purple-900 mb-3">Real-time Location</h3>
                                <p className="text-body-md text-gray-700 mb-4">
                                    Track family members in real-time with geofencing alerts and location history. Know where your loved ones are, when they arrive, and get notified of their movements.
                                </p>
                                <img 
                                    src="https://images.unsplash.com/photo-1551650975-87deedd944c3?w=600&h=400&fit=crop&q=80" 
                                    alt="Location tracking feature" 
                                    className="rounded-lg w-full h-48 object-cover"
                                            loading="lazy"
                                        />
                                        </div>
                            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow group">
                                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                                    <MdTaskAlt size={28} className="text-purple-600" />
                                </div>
                                <h3 className="text-title-md font-semibold text-purple-900 mb-3">Task Management</h3>
                                <p className="text-body-md text-gray-700 mb-4">
                                    Assign and verify tasks with photo proof for accountability. Gamify chores with XP points, streaks, and leaderboards to keep everyone motivated.
                                </p>
                                <img 
                                    src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=600&h=400&fit=crop&q=80" 
                                    alt="Task management feature" 
                                    className="rounded-lg w-full h-48 object-cover"
                                    loading="lazy"
                                />
                        </div>
                            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow group">
                                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                                    <MdMessage size={28} className="text-purple-600" />
                    </div>
                                <h3 className="text-title-md font-semibold text-purple-900 mb-3">Secure Messaging</h3>
                                <p className="text-body-md text-gray-700 mb-4">
                                    Stay connected with real-time chat and broadcast alerts to your hub. Share important updates instantly with the whole family.
                                </p>
                                <img 
                                    src="https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=600&h=400&fit=crop&q=80" 
                                    alt="Secure messaging feature" 
                                    className="rounded-lg w-full h-48 object-cover"
                                    loading="lazy"
                                />
                        </div>
                            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow group">
                                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                                    <MdSecurity size={28} className="text-purple-600" />
                                </div>
                                <h3 className="text-title-md font-semibold text-purple-900 mb-3">Digital Vault</h3>
                                <p className="text-body-md text-gray-700 mb-4">
                                    Securely store sensitive information with client-side encryption. Keep important documents, passwords, and notes safe and accessible only to you.
                                </p>
                                <img 
                                    src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&h=400&fit=crop&q=80" 
                                    alt="Digital vault feature" 
                                    className="rounded-lg w-full h-48 object-cover"
                                    loading="lazy"
                                />
                            </div>
                            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow group">
                                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                                    <MdPeople size={28} className="text-purple-600" />
                                </div>
                                <h3 className="text-title-md font-semibold text-purple-900 mb-3">Multi-Hub Support</h3>
                                <p className="text-body-md text-gray-700 mb-4">
                                    Manage multiple groups—family, school, sports teams, and more. Switch between hubs seamlessly and stay organized across all aspects of life.
                                </p>
                                <img 
                                    src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&h=400&fit=crop&q=80" 
                                    alt="Multi-hub support feature" 
                                    className="rounded-lg w-full h-48 object-cover"
                                    loading="lazy"
                                />
                            </div>
                            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow group">
                                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                                    <MdStar size={28} className="text-purple-600" />
                                </div>
                                <h3 className="text-title-md font-semibold text-purple-900 mb-3">Rewards & Gamification</h3>
                                <p className="text-body-md text-gray-700 mb-4">
                                    Earn XP, track streaks, and compete on leaderboards. Make family tasks fun and engaging for everyone, especially kids!
                                </p>
                                <img 
                                    src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&h=400&fit=crop&q=80" 
                                    alt="Rewards and gamification feature" 
                                    className="rounded-lg w-full h-48 object-cover"
                                    loading="lazy"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Plans & Pricing Section */}
                <section id="pricing" className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-purple-900 mb-8 sm:mb-10 md:mb-12 text-center">
                            Plans & Pricing
                                </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
                            <div className="bg-purple-50 rounded-lg p-8 border-2 border-purple-200">
                                <h3 className="text-title-lg font-semibold text-purple-900 mb-2">Free</h3>
                                <p className="text-headline-md font-bold text-purple-900 mb-4">$0<span className="text-body-lg font-normal">/month</span></p>
                                <ul className="space-y-3 mb-6">
                                    <li className="text-body-md text-gray-700">Basic location tracking</li>
                                    <li className="text-body-md text-gray-700">Up to 5 family members</li>
                                    <li className="text-body-md text-gray-700">Task management</li>
                                </ul>
                                <button
                                        onClick={() => navigate('/register')}
                                    className="w-full bg-primary hover:bg-primary/90 text-on-primary px-6 py-3 rounded-full text-label-md font-semibold transition-all duration-200 shadow-md hover:shadow-lg touch-target"
                                >
                                    Get Started
                                </button>
                            </div>
                            <div className="bg-purple-600 rounded-lg p-8 border-2 border-purple-700 text-white">
                                <h3 className="text-title-lg font-semibold mb-2">Premium</h3>
                                <p className="text-headline-md font-bold mb-4">$9.99<span className="text-body-lg font-normal">/month</span></p>
                                <ul className="space-y-3 mb-6">
                                    <li className="text-body-md">Advanced location features</li>
                                    <li className="text-body-md">Unlimited family members</li>
                                    <li className="text-body-md">Priority support</li>
                                    <li className="text-body-md">Digital vault</li>
                                </ul>
                                <button
                                    onClick={() => navigate('/register')}
                                    className="w-full bg-white hover:bg-gray-100 text-purple-600 px-6 py-3 rounded-full text-label-md font-semibold transition-all duration-200 shadow-md hover:shadow-lg touch-target"
                                >
                                    Upgrade Now
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Resources Section */}
                <section id="resources" className="py-12 sm:py-16 md:py-20 lg:py-24 bg-purple-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-purple-900 mb-8 sm:mb-10 md:mb-12 text-center">
                            Resources
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                            <a href="#" className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                                <h3 className="text-title-md font-semibold text-purple-900 mb-2">Help Center</h3>
                                <p className="text-body-sm text-gray-600">Get answers to common questions</p>
                            </a>
                            <a href="#" className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                                <h3 className="text-title-md font-semibold text-purple-900 mb-2">Safety Tips</h3>
                                <p className="text-body-sm text-gray-600">Learn how to stay safe</p>
                            </a>
                            <a href="#" className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                                <h3 className="text-title-md font-semibold text-purple-900 mb-2">Blog</h3>
                                <p className="text-body-sm text-gray-600">Read our latest articles</p>
                            </a>
                            <a href="#" className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                                <h3 className="text-title-md font-semibold text-purple-900 mb-2">Contact</h3>
                                <p className="text-body-sm text-gray-600">Get in touch with us</p>
                            </a>
                                    </div>
                                </div>
                </section>

                {/* Reviews Section */}
                <section id="reviews" className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-8 sm:mb-10 md:mb-12">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-purple-900 mb-3 sm:mb-4">
                                Loved by thousands of families
                            </h2>
                            <p className="text-base sm:text-lg md:text-xl text-gray-700 max-w-2xl mx-auto px-4">
                                See what real families are saying about HaloHub
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                            <div className="bg-purple-50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <MdStar key={i} size={20} className="text-yellow-400 fill-yellow-400" />
                                    ))}
                                </div>
                                <p className="text-body-md text-gray-700 mb-6 italic leading-relaxed">
                                    "HaloHub has given me peace of mind knowing where my kids are at all times. The task management feature is a game-changer!"
                                </p>
                                <div className="flex items-center gap-3">
                                    <img 
                                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&q=80" 
                                        alt="Sarah Johnson" 
                                        className="w-12 h-12 rounded-full object-cover"
                                        loading="lazy"
                                    />
                                    <div>
                                        <p className="text-label-md font-semibold text-purple-900">Sarah Johnson</p>
                                        <p className="text-body-sm text-gray-600">Mother of 3</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-purple-50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <MdStar key={i} size={20} className="text-yellow-400 fill-yellow-400" />
                                    ))}
                                </div>
                                <p className="text-body-md text-gray-700 mb-6 italic leading-relaxed">
                                    "The gamification system keeps my teenagers engaged with chores. They actually compete to complete tasks now!"
                                </p>
                                <div className="flex items-center gap-3">
                                    <img 
                                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&q=80" 
                                        alt="Michael Chen" 
                                        className="w-12 h-12 rounded-full object-cover"
                                        loading="lazy"
                                    />
                                    <div>
                                        <p className="text-label-md font-semibold text-purple-900">Michael Chen</p>
                                        <p className="text-body-sm text-gray-600">Family Organizer</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-purple-50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <MdStar key={i} size={20} className="text-yellow-400 fill-yellow-400" />
                                    ))}
                                </div>
                                <p className="text-body-md text-gray-700 mb-6 italic leading-relaxed">
                                    "Being able to coordinate with my family across multiple hubs has made our lives so much easier."
                                </p>
                                <div className="flex items-center gap-3">
                                    <img 
                                        src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&q=80" 
                                        alt="Emily Rodriguez" 
                                        className="w-12 h-12 rounded-full object-cover"
                                        loading="lazy"
                                    />
                                    <div>
                                        <p className="text-label-md font-semibold text-purple-900">Emily Rodriguez</p>
                                        <p className="text-body-sm text-gray-600">Working Parent</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-gray-900 text-white py-12 md:py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                            {/* Brand Column */}
                            <div className="lg:col-span-2">
                                <div className="flex items-center gap-2.5 mb-4">
                                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-transparent">
                                        <img 
                                            src="/halohub.png" 
                                            alt="HaloHub" 
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                    <span className="text-title-lg font-bold">HaloHub</span>
                                </div>
                                <p className="text-body-md text-gray-400 mb-6 max-w-md leading-relaxed">
                                    The comprehensive family safety platform that brings together location tracking, 
                                    task management, and secure communication in one beautiful app.
                                </p>
                                <div className="flex gap-4">
                                    <a 
                                        href="#" 
                                        className="w-10 h-10 bg-gray-800 hover:bg-purple-600 rounded-lg flex items-center justify-center transition-colors touch-target"
                                        aria-label="Facebook"
                                    >
                                        <MdPublic size={20} />
                                    </a>
                                    <a 
                                        href="#" 
                                        className="w-10 h-10 bg-gray-800 hover:bg-purple-600 rounded-lg flex items-center justify-center transition-colors touch-target"
                                        aria-label="Twitter"
                                    >
                                        <MdShare size={20} />
                                    </a>
                                    <a 
                                        href="#" 
                                        className="w-10 h-10 bg-gray-800 hover:bg-purple-600 rounded-lg flex items-center justify-center transition-colors touch-target"
                                        aria-label="Instagram"
                                    >
                                        <MdPublic size={20} />
                                    </a>
                                    <a 
                                        href="#" 
                                        className="w-10 h-10 bg-gray-800 hover:bg-purple-600 rounded-lg flex items-center justify-center transition-colors touch-target"
                                        aria-label="LinkedIn"
                                    >
                                        <MdShare size={20} />
                                    </a>
                                </div>
                            </div>

                            {/* Product Column */}
                            <div>
                                <h3 className="text-title-md font-semibold mb-4">Product</h3>
                                <ul className="space-y-3">
                                    <li>
                                        <a href="#features" className="text-body-md text-gray-400 hover:text-white transition-colors">
                                            Features
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#pricing" className="text-body-md text-gray-400 hover:text-white transition-colors">
                                            Pricing
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="text-body-md text-gray-400 hover:text-white transition-colors">
                                            Security
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="text-body-md text-gray-400 hover:text-white transition-colors">
                                            Updates
                                        </a>
                                    </li>
                                </ul>
                            </div>

                            {/* Support Column */}
                            <div>
                                <h3 className="text-title-md font-semibold mb-4">Support</h3>
                                <ul className="space-y-3">
                                    <li>
                                        <a href="#resources" className="text-body-md text-gray-400 hover:text-white transition-colors">
                                            Help Center
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="text-body-md text-gray-400 hover:text-white transition-colors">
                                            Contact Us
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="text-body-md text-gray-400 hover:text-white transition-colors">
                                            Privacy Policy
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="text-body-md text-gray-400 hover:text-white transition-colors">
                                            Terms of Service
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Bottom Bar */}
                        <div className="border-t border-gray-800 pt-8">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                <p className="text-body-sm text-gray-400">
                                    &copy; {new Date().getFullYear()} HaloHub. All rights reserved.
                                </p>
                                <div className="flex items-center gap-6">
                                    <a href="#" className="text-body-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                                        <MdEmail size={16} />
                                        <span>hello@halohub.com</span>
                                    </a>
                                    <a href="#" className="text-body-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                                        <MdPhone size={16} />
                                        <span>1-800-HALOHUB</span>
                                    </a>
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
