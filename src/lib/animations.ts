import { gsap } from 'gsap';

// GSAP Animation utilities for the FamilyTracker app

export const animations = {
    // Fade in animation for page transitions
    fadeIn: (element: HTMLElement | string, duration = 0.5, delay = 0) => {
        return gsap.fromTo(element,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration, delay, ease: "power2.out" }
        );
    },

    // Slide in from left animation
    slideInLeft: (element: HTMLElement | string, duration = 0.6, delay = 0) => {
        return gsap.fromTo(element,
            { x: -100, opacity: 0 },
            { x: 0, opacity: 1, duration, delay, ease: "power2.out" }
        );
    },

    // Slide in from right animation
    slideInRight: (element: HTMLElement | string, duration = 0.6, delay = 0) => {
        return gsap.fromTo(element,
            { x: 100, opacity: 0 },
            { x: 0, opacity: 1, duration, delay, ease: "power2.out" }
        );
    },

    // Scale in animation for cards/features
    scaleIn: (element: HTMLElement | string, duration = 0.5, delay = 0) => {
        return gsap.fromTo(element,
            { scale: 0.8, opacity: 0 },
            { scale: 1, opacity: 1, duration, delay, ease: "back.out(1.7)" }
        );
    },

    // Stagger animation for multiple elements
    staggerIn: (elements: HTMLElement[] | string, duration = 0.4, stagger = 0.1) => {
        return gsap.fromTo(elements,
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration, stagger, ease: "power2.out" }
        );
    },

    // Pulse animation for interactive elements
    pulse: (element: HTMLElement | string, duration = 0.3) => {
        return gsap.to(element, {
            scale: 1.05,
            duration: duration / 2,
            ease: "power2.out",
            yoyo: true,
            repeat: 1
        });
    },

    // Shake animation for errors
    shake: (element: HTMLElement | string, duration = 0.5) => {
        return gsap.to(element, {
            x: -10,
            duration: duration / 10,
            ease: "power2.inOut",
            yoyo: true,
            repeat: 9
        });
    },

    // Loading spinner rotation
    spin: (element: HTMLElement | string, duration = 1) => {
        return gsap.to(element, {
            rotation: 360,
            duration,
            ease: "none",
            repeat: -1
        });
    },

    // Typing animation for text
    typeText: (element: HTMLElement | string, text: string, speed = 0.05) => {
        const el = typeof element === 'string' ? document.querySelector(element) as HTMLElement : element;
        if (!el) return Promise.resolve();

        el.textContent = '';
        let i = 0;

        return new Promise<void>((resolve) => {
            const typeInterval = setInterval(() => {
                if (i < text.length) {
                    el.textContent += text.charAt(i);
                    i++;
                } else {
                    clearInterval(typeInterval);
                    resolve();
                }
            }, speed * 1000);
        });
    },

    // Hover animations for buttons
    buttonHover: {
        enter: (element: HTMLElement | string) => {
            return gsap.to(element, {
                scale: 1.05,
                duration: 0.2,
                ease: "power2.out"
            });
        },
        leave: (element: HTMLElement | string) => {
            return gsap.to(element, {
                scale: 1,
                duration: 0.2,
                ease: "power2.out"
            });
        }
    },

    // Page transition animations
    pageTransition: {
        out: (element: HTMLElement | string) => {
            return gsap.to(element, {
                opacity: 0,
                y: -20,
                duration: 0.3,
                ease: "power2.in"
            });
        },
        in: (element: HTMLElement | string) => {
            return gsap.fromTo(element,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
            );
        }
    },

    // Notification animations
    notification: {
        show: (element: HTMLElement | string) => {
            return gsap.fromTo(element,
                { x: 300, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.4, ease: "back.out(1.7)" }
            );
        },
        hide: (element: HTMLElement | string) => {
            return gsap.to(element, {
                x: 300,
                opacity: 0,
                duration: 0.3,
                ease: "power2.in"
            });
        }
    }
};

// Animation presets for common UI patterns
export const animationPresets = {
    // Homepage hero animation
    hero: () => {
        const tl = gsap.timeline();
        tl.add(animations.fadeIn('.hero-title', 0.8, 0.2))
            .add(animations.fadeIn('.hero-description', 0.6, 0.4), '-=0.3')
            .add(animations.staggerIn('.hero-buttons button', 0.5, 0.1), '-=0.2');
        return tl;
    },

    // Features section animation
    features: () => {
        const tl = gsap.timeline({ delay: 0.5 });
        tl.add(animations.staggerIn('.feature-card', 0.6, 0.15));
        return tl;
    },

    // Loading state animation
    loading: () => {
        const tl = gsap.timeline({ repeat: -1 });
        tl.add(animations.spin('.loading-spinner', 1));
        return tl;
    },

    // Error state animation
    error: () => {
        const tl = gsap.timeline();
        tl.add(animations.shake('.error-message', 0.5))
            .add(animations.fadeIn('.error-message', 0.3), '-=0.2');
        return tl;
    }
};

// Utility function to initialize animations on page load
export const initializeAnimations = () => {
    // Set default GSAP settings
    gsap.defaults({
        ease: "power2.out",
        duration: 0.5
    });

    // Initialize scroll-triggered animations if ScrollTrigger is available
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
        // Simple intersection observer for scroll animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const element = entry.target as HTMLElement;
                    const animationType = element.dataset.animation || 'fadeIn';

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
        }, { threshold: 0.1 });

        // Observe elements with animation attributes
        document.querySelectorAll('[data-animation]').forEach((el) => {
            observer.observe(el);
        });
    }
};

// Export GSAP for direct use if needed
export { gsap };
