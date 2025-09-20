import { useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { animations, animationPresets } from '@/lib/animations';

export const useGSAP = () => {
    const timelineRef = useRef<gsap.core.Timeline | null>(null);

    // Create a timeline
    const createTimeline = useCallback(() => {
        if (timelineRef.current) {
            timelineRef.current.kill();
        }
        timelineRef.current = gsap.timeline();
        return timelineRef.current;
    }, []);

    // Clean up on unmount
    useEffect(() => {
        return () => {
            if (timelineRef.current) {
                timelineRef.current.kill();
            }
        };
    }, []);

    return {
        gsap,
        animations,
        animationPresets,
        createTimeline,
        timeline: timelineRef.current,
    };
};

// Hook for element-specific animations
export const useGSAPAnimation = (animationType?: string) => {
    const elementRef = useRef<HTMLElement>(null);

    const animate = useCallback((type: string = animationType || 'fadeIn', options?: any) => {
        if (!elementRef.current) return;

        const element = elementRef.current;

        switch (type) {
            case 'fadeIn':
                return animations.fadeIn(element, options?.duration, options?.delay);
            case 'slideInLeft':
                return animations.slideInLeft(element, options?.duration, options?.delay);
            case 'slideInRight':
                return animations.slideInRight(element, options?.duration, options?.delay);
            case 'scaleIn':
                return animations.scaleIn(element, options?.duration, options?.delay);
            case 'pulse':
                return animations.pulse(element, options?.duration);
            case 'shake':
                return animations.shake(element, options?.duration);
            default:
                return animations.fadeIn(element, options?.duration, options?.delay);
        }
    }, [animationType]);

    const setRef = useCallback((element: HTMLElement | null) => {
        elementRef.current = element;
    }, []);

    return {
        ref: setRef,
        animate,
        element: elementRef.current,
    };
};

// Hook for scroll-triggered animations
export const useScrollAnimation = (animationType: string = 'fadeIn', threshold = 0.1) => {
    const elementRef = useRef<HTMLElement>(null);
    const hasAnimated = useRef(false);

    useEffect(() => {
        const element = elementRef.current;
        if (!element || hasAnimated.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !hasAnimated.current) {
                        hasAnimated.current = true;

                        switch (animationType) {
                            case 'fadeIn':
                                animations.fadeIn(element);
                                break;
                            case 'slideInLeft':
                                animations.slideInLeft(element);
                                break;
                            case 'slideInRight':
                                animations.slideInRight(element);
                                break;
                            case 'scaleIn':
                                animations.scaleIn(element);
                                break;
                        }

                        observer.unobserve(element);
                    }
                });
            },
            { threshold }
        );

        observer.observe(element);

        return () => {
            observer.disconnect();
        };
    }, [animationType, threshold]);

    const setRef = useCallback((element: HTMLElement | null) => {
        elementRef.current = element;
    }, []);

    return {
        ref: setRef,
        hasAnimated: hasAnimated.current,
    };
};
