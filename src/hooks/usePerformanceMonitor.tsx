import { useState, useEffect } from 'react';
import { PerformanceMonitor, PERFORMANCE_BUDGETS } from '@/lib/performance';

interface PerformanceViolation {
    metric: string;
    actual: number;
    budget: number;
    timestamp: number;
}

export const usePerformanceMonitor = () => {
    const [metrics, setMetrics] = useState<Record<string, number>>({});
    const [violations, setViolations] = useState<PerformanceViolation[]>([]);
    const [isMonitoring, setIsMonitoring] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const monitor = new PerformanceMonitor();
        setIsMonitoring(true);

        // Update metrics periodically
        const interval = setInterval(() => {
            const currentMetrics = monitor.getMetrics();
            setMetrics(currentMetrics);

            // Check for violations
            Object.entries(currentMetrics).forEach(([metric, value]) => {
                const budget = PERFORMANCE_BUDGETS[metric as keyof typeof PERFORMANCE_BUDGETS];
                if (budget && value > budget) {
                    const violation: PerformanceViolation = {
                        metric,
                        actual: value,
                        budget,
                        timestamp: Date.now(),
                    };

                    setViolations(prev => [...prev, violation]);
                }
            });
        }, 1000);

        return () => {
            clearInterval(interval);
            monitor.disconnect();
            setIsMonitoring(false);
        };
    }, []);

    const getMetricStatus = (metric: string) => {
        const value = metrics[metric];
        const budget = PERFORMANCE_BUDGETS[metric as keyof typeof PERFORMANCE_BUDGETS];

        if (!value || !budget) return 'unknown';

        if (value <= budget) return 'good';
        if (value <= budget * 1.5) return 'needs-improvement';
        return 'poor';
    };

    const clearViolations = () => {
        setViolations([]);
    };

    return {
        metrics,
        violations,
        isMonitoring,
        getMetricStatus,
        clearViolations,
    };
};
