/**
 * PWA Install Prompt Component
 * 
 * Shows a banner prompting users to install the PWA on their device
 * Only shows if:
 * - PWA is not already installed
 * - Browser supports PWA installation
 * - User hasn't dismissed the prompt
 */

import { useState, useEffect } from 'react';
import { MdClose, MdGetApp, MdPhoneAndroid, MdPhoneIphone } from 'react-icons/md';
import { Button } from './ui/Button';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Check if running on iOS
        const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        setIsIOS(iOS);

        // Check if already installed (standalone mode)
        const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                         (window.navigator as any).standalone === true;
        setIsStandalone(standalone);

        // Check if user has dismissed the prompt before
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        if (dismissed || standalone) {
            return;
        }

        // Listen for the beforeinstallprompt event (Android/Chrome)
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setIsVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // For iOS, show instructions after a delay
        if (iOS && !standalone) {
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 3000); // Show after 3 seconds
            return () => clearTimeout(timer);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstall = async () => {
        if (deferredPrompt) {
            // Android/Chrome installation
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            
            if (outcome === 'accepted') {
                setIsVisible(false);
            }
            
            setDeferredPrompt(null);
        }
    };

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem('pwa-install-dismissed', 'true');
    };

    if (!isVisible || isStandalone) {
        return null;
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 safe-bottom bg-white border-t-2 border-primary shadow-elevation-3">
            <div className="max-w-2xl mx-auto flex items-center gap-4">
                {isIOS ? (
                    <>
                        <div className="flex-shrink-0">
                            <MdPhoneIphone size={32} className="text-primary" />
                        </div>
                        <div className="flex-1">
                            <p className="text-body-md font-semibold text-on-surface mb-1">
                                Install HaloHub on your iPhone
                            </p>
                            <p className="text-body-sm text-on-variant">
                                Tap <MdGetApp className="inline" size={16} /> then &quot;Add to Home Screen&quot;
                            </p>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex-shrink-0">
                            <MdPhoneAndroid size={32} className="text-primary" />
                        </div>
                        <div className="flex-1">
                            <p className="text-body-md font-semibold text-on-surface mb-1">
                                Install HaloHub for a better experience
                            </p>
                            <p className="text-body-sm text-on-variant">
                                Get quick access, offline support, and faster loading
                            </p>
                        </div>
                        <Button
                            variant="filled"
                            onClick={handleInstall}
                            startIcon={<MdGetApp size={20} />}
                            className="flex-shrink-0"
                        >
                            Install
                        </Button>
                    </>
                )}
                <button
                    onClick={handleDismiss}
                    className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant transition-colors touch-target"
                    aria-label="Dismiss install prompt"
                >
                    <MdClose size={20} className="text-on-variant" />
                </button>
            </div>
        </div>
    );
};

