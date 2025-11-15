// Performance monitoring and optimization utilities

// Core Web Vitals budgets (as per project requirements)
export const PERFORMANCE_BUDGETS = {
    LCP: 2.5, // Largest Contentful Paint (seconds)
    FID: 100, // First Input Delay (milliseconds)
    CLS: 0.1, // Cumulative Layout Shift
    TBT: 200, // Total Blocking Time (milliseconds)
    FCP: 1.8, // First Contentful Paint (seconds)
    TTFB: 600, // Time to First Byte (milliseconds)
};

// Performance monitoring class
export class PerformanceMonitor {
    private metrics: Map<string, number> = new Map();
    private observers: PerformanceObserver[] = [];

    constructor() {
        this.initializeObservers();
    }

    private initializeObservers() {
        // Observe Core Web Vitals
        if ('PerformanceObserver' in window) {
            // LCP Observer
            try {
                const lcpObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1] as PerformanceEventTiming;
                    this.metrics.set('LCP', lastEntry.startTime);
                    this.checkBudget('LCP', lastEntry.startTime);
                });
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
                this.observers.push(lcpObserver);
            } catch (e) {
                console.warn('LCP observer not supported');
            }

            // FID Observer
            try {
                const fidObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach((entry) => {
                        if (entry.entryType === 'first-input' && 'processingStart' in entry && 'startTime' in entry) {
                            const fid = (entry as PerformanceEventTiming).processingStart - entry.startTime;
                            this.metrics.set('FID', fid);
                            this.checkBudget('FID', fid);
                        }
                    });
                });
                fidObserver.observe({ entryTypes: ['first-input'] });
                this.observers.push(fidObserver);
            } catch (e) {
                console.warn('FID observer not supported');
            }

            // CLS Observer
            try {
                let clsValue = 0;
                const clsObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach((entry: any) => {
                        if (!entry.hadRecentInput) {
                            clsValue += entry.value;
                            this.metrics.set('CLS', clsValue);
                            this.checkBudget('CLS', clsValue);
                        }
                    });
                });
                clsObserver.observe({ entryTypes: ['layout-shift'] });
                this.observers.push(clsObserver);
            } catch (e) {
                console.warn('CLS observer not supported');
            }

            // FCP Observer
            try {
                const fcpObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach((entry: PerformancePaintTiming) => {
                        if (entry.name === 'first-contentful-paint') {
                            this.metrics.set('FCP', entry.startTime);
                            this.checkBudget('FCP', entry.startTime);
                        }
                    });
                });
                fcpObserver.observe({ entryTypes: ['paint'] });
                this.observers.push(fcpObserver);
            } catch (e) {
                console.warn('FCP observer not supported');
            }
        }
    }

    private checkBudget(metric: string, value: number) {
        const budget = PERFORMANCE_BUDGETS[metric as keyof typeof PERFORMANCE_BUDGETS];
        if (budget && value > budget) {
            console.warn(`Performance budget exceeded for ${metric}: ${value} > ${budget}`);
            // In production, send to analytics service
            this.reportViolation(metric, value, budget);
        }
    }

    private reportViolation(metric: string, actual: number, budget: number) {
        // Send to analytics service
        if (typeof window !== 'undefined' && 'gtag' in window) {
            (window as any).gtag('event', 'performance_budget_violation', {
                metric_name: metric,
                actual_value: actual,
                budget_value: budget,
                violation_amount: actual - budget,
            });
        }
    }

    // Get current metrics
    getMetrics() {
        return Object.fromEntries(this.metrics);
    }

    // Get specific metric
    getMetric(name: string): number | undefined {
        return this.metrics.get(name);
    }

    // Clean up observers
    disconnect() {
        this.observers.forEach(observer => observer.disconnect());
        this.observers = [];
    }
}

// Performance optimization utilities
export const performanceUtils = {
    // Debounce function for performance
    debounce<T extends (...args: any[]) => any>(
        func: T,
        wait: number
    ): (...args: Parameters<T>) => void {
        let timeout: NodeJS.Timeout;
        return (...args: Parameters<T>) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    },

    // Throttle function for performance
    throttle<T extends (...args: any[]) => any>(
        func: T,
        limit: number
    ): (...args: Parameters<T>) => void {
        let inThrottle: boolean;
        return (...args: Parameters<T>) => {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => (inThrottle = false), limit);
            }
        };
    },

    // Lazy load images
    lazyLoadImages() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const img = entry.target as HTMLImageElement;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                            imageObserver.unobserve(img);
                        }
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach((img) => {
                imageObserver.observe(img);
            });
        }
    },

    // Preload critical resources
    preloadCriticalResources() {
        const criticalResources = [
            { href: '/fonts/inter.woff2', as: 'font', type: 'font/woff2', crossorigin: 'anonymous' },
            { href: '/css/critical.css', as: 'style' },
        ];

        criticalResources.forEach((resource) => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource.href;
            link.as = resource.as;
            if (resource.type) link.type = resource.type;
            if (resource.crossorigin) link.crossOrigin = resource.crossorigin;
            document.head.appendChild(link);
        });
    },

    // Optimize animations for performance
    optimizeAnimations() {
        // Use transform and opacity for animations
        const style = document.createElement('style');
        style.textContent = `
      .animate-transform {
        will-change: transform;
      }
      .animate-opacity {
        will-change: opacity;
      }
      .animate-complex {
        will-change: transform, opacity;
      }
    `;
        document.head.appendChild(style);
    },

    // Service worker performance optimization
    optimizeServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').then(() => {
                console.log('Service Worker registered for performance optimization');
            });
        }
    },

    // Bundle size optimization
    optimizeBundleSize() {
        // Dynamic imports for code splitting
        const dynamicImports = {
            maps: () => import('@googlemaps/js-api-loader'),
        };

        return dynamicImports;
    },

    // Memory optimization
    optimizeMemory() {
        // Clean up event listeners
        const cleanup = () => {
            // Remove unused event listeners
            window.removeEventListener('beforeunload', cleanup);
        };

        window.addEventListener('beforeunload', cleanup);
    },
};

// Performance monitoring hooks (React hook - would be imported from React in actual usage)
export const createPerformanceMonitorHook = () => {
    // This would be a proper React hook in a .tsx file
    return () => {
        // Hook implementation would go here
        return { metrics: {}, violations: [] };
    };
};

// Performance budget checker
export const checkPerformanceBudget = (metric: string, value: number): boolean => {
    const budget = PERFORMANCE_BUDGETS[metric as keyof typeof PERFORMANCE_BUDGETS];
    return budget ? value <= budget : true;
};

// Performance reporting
export const reportPerformance = (metric: string, value: number, context?: string) => {
    const budget = PERFORMANCE_BUDGETS[metric as keyof typeof PERFORMANCE_BUDGETS];
    const isWithinBudget = budget ? value <= budget : true;

    // Send to analytics
    if (typeof window !== 'undefined' && 'gtag' in window) {
        (window as any).gtag('event', 'performance_metric', {
            metric_name: metric,
            metric_value: value,
            budget_value: budget,
            within_budget: isWithinBudget,
            context: context || 'unknown',
        });
    }

    return isWithinBudget;
};

// Critical resource hints
export const addResourceHints = () => {
    const hints = [
        { rel: 'dns-prefetch', href: 'https://fonts.googleapis.com' },
        { rel: 'dns-prefetch', href: 'https://fonts.gstatic.com' },
        { rel: 'dns-prefetch', href: 'https://maps.googleapis.com' },
        { rel: 'dns-prefetch', href: 'https://firebase.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
    ];

    hints.forEach((hint) => {
        const link = document.createElement('link');
        link.rel = hint.rel;
        link.href = hint.href;
        if (hint.crossorigin) link.crossOrigin = hint.crossorigin;
        document.head.appendChild(link);
    });
};

// Initialize performance optimizations
export const initializePerformance = () => {
    addResourceHints();
    performanceUtils.preloadCriticalResources();
    performanceUtils.optimizeAnimations();
    performanceUtils.optimizeServiceWorker();
    performanceUtils.optimizeMemory();

    // Start performance monitoring
    const monitor = new PerformanceMonitor();

    return monitor;
};
