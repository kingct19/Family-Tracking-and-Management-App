import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    PerformanceMonitor,
    PERFORMANCE_BUDGETS,
    checkPerformanceBudget,
    reportPerformance,
    performanceUtils
} from './performance';

// Mock PerformanceObserver
const mockObserver = {
    observe: vi.fn(),
    disconnect: vi.fn(),
};

global.PerformanceObserver = vi.fn().mockImplementation(() => mockObserver);

// Mock window.gtag
global.gtag = vi.fn();

describe('Performance Monitoring', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('PerformanceMonitor', () => {
        it('should initialize without errors', () => {
            expect(() => new PerformanceMonitor()).not.toThrow();
        });

        it('should create performance observers', () => {
            new PerformanceMonitor();

            expect(PerformanceObserver).toHaveBeenCalledWith(expect.any(Function));
            expect(mockObserver.observe).toHaveBeenCalled();
        });

        it('should track metrics', () => {
            const monitor = new PerformanceMonitor();

            // Simulate setting a metric
            monitor.getMetrics();

            // Should return empty object initially
            expect(monitor.getMetrics()).toEqual({});
        });

        it('should clean up observers on disconnect', () => {
            const monitor = new PerformanceMonitor();
            monitor.disconnect();

            expect(mockObserver.disconnect).toHaveBeenCalled();
        });
    });

    describe('Performance Budgets', () => {
        it('should have defined budgets for all Core Web Vitals', () => {
            expect(PERFORMANCE_BUDGETS.LCP).toBeDefined();
            expect(PERFORMANCE_BUDGETS.FID).toBeDefined();
            expect(PERFORMANCE_BUDGETS.CLS).toBeDefined();
            expect(PERFORMANCE_BUDGETS.TBT).toBeDefined();
            expect(PERFORMANCE_BUDGETS.FCP).toBeDefined();
            expect(PERFORMANCE_BUDGETS.TTFB).toBeDefined();
        });

        it('should have reasonable budget values', () => {
            expect(PERFORMANCE_BUDGETS.LCP).toBeLessThanOrEqual(2.5);
            expect(PERFORMANCE_BUDGETS.FID).toBeLessThanOrEqual(100);
            expect(PERFORMANCE_BUDGETS.CLS).toBeLessThanOrEqual(0.1);
            expect(PERFORMANCE_BUDGETS.TBT).toBeLessThanOrEqual(200);
            expect(PERFORMANCE_BUDGETS.FCP).toBeLessThanOrEqual(1.8);
            expect(PERFORMANCE_BUDGETS.TTFB).toBeLessThanOrEqual(600);
        });
    });

    describe('checkPerformanceBudget', () => {
        it('should return true for values within budget', () => {
            expect(checkPerformanceBudget('LCP', 2.0)).toBe(true);
            expect(checkPerformanceBudget('FID', 50)).toBe(true);
            expect(checkPerformanceBudget('CLS', 0.05)).toBe(true);
        });

        it('should return false for values exceeding budget', () => {
            expect(checkPerformanceBudget('LCP', 3.0)).toBe(false);
            expect(checkPerformanceBudget('FID', 150)).toBe(false);
            expect(checkPerformanceBudget('CLS', 0.2)).toBe(false);
        });

        it('should handle unknown metrics', () => {
            expect(checkPerformanceBudget('UNKNOWN_METRIC', 1000)).toBe(true);
        });
    });

    describe('reportPerformance', () => {
        it('should report performance metrics', () => {
            const result = reportPerformance('LCP', 2.0, 'test-page');

            expect(result).toBe(true);
            expect(global.gtag).toHaveBeenCalledWith('event', 'performance_metric', {
                metric_name: 'LCP',
                metric_value: 2.0,
                budget_value: 2.5,
                within_budget: true,
                context: 'test-page',
            });
        });

        it('should report budget violations', () => {
            const result = reportPerformance('LCP', 3.0, 'test-page');

            expect(result).toBe(false);
            expect(global.gtag).toHaveBeenCalledWith('event', 'performance_metric', {
                metric_name: 'LCP',
                metric_value: 3.0,
                budget_value: 2.5,
                within_budget: false,
                context: 'test-page',
            });
        });
    });

    describe('performanceUtils', () => {
        describe('debounce', () => {
            it('should debounce function calls', (done) => {
                const mockFn = vi.fn();
                const debouncedFn = performanceUtils.debounce(mockFn, 100);

                debouncedFn();
                debouncedFn();
                debouncedFn();

                expect(mockFn).not.toHaveBeenCalled();

                setTimeout(() => {
                    expect(mockFn).toHaveBeenCalledTimes(1);
                    done();
                }, 150);
            });
        });

        describe('throttle', () => {
            it('should throttle function calls', (done) => {
                const mockFn = vi.fn();
                const throttledFn = performanceUtils.throttle(mockFn, 100);

                throttledFn();
                throttledFn();
                throttledFn();

                expect(mockFn).toHaveBeenCalledTimes(1);

                setTimeout(() => {
                    throttledFn();
                    expect(mockFn).toHaveBeenCalledTimes(2);
                    done();
                }, 150);
            });
        });

        describe('lazyLoadImages', () => {
            it('should not throw when IntersectionObserver is not available', () => {
                const originalIO = global.IntersectionObserver;
                delete (global as any).IntersectionObserver;

                expect(() => performanceUtils.lazyLoadImages()).not.toThrow();

                global.IntersectionObserver = originalIO;
            });
        });

        describe('preloadCriticalResources', () => {
            it('should create preload links', () => {
                const originalAppendChild = document.head.appendChild;
                const mockAppendChild = vi.fn();
                document.head.appendChild = mockAppendChild;

                performanceUtils.preloadCriticalResources();

                expect(mockAppendChild).toHaveBeenCalled();

                document.head.appendChild = originalAppendChild;
            });
        });

        describe('optimizeAnimations', () => {
            it('should add animation optimization styles', () => {
                const originalAppendChild = document.head.appendChild;
                const mockAppendChild = vi.fn();
                document.head.appendChild = mockAppendChild;

                performanceUtils.optimizeAnimations();

                expect(mockAppendChild).toHaveBeenCalled();

                document.head.appendChild = originalAppendChild;
            });
        });

        describe('optimizeServiceWorker', () => {
            it('should not throw when serviceWorker is not available', () => {
                const originalSW = navigator.serviceWorker;
                delete (navigator as any).serviceWorker;

                expect(() => performanceUtils.optimizeServiceWorker()).not.toThrow();

                navigator.serviceWorker = originalSW;
            });
        });
    });
});
