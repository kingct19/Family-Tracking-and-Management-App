/**
 * VaultAuthGate Component
 * 
 * PIN/biometric authentication gate for vault access
 */

import { useState, useEffect } from 'react';
import { MdLock, MdVisibility, MdVisibilityOff, MdVpnKey, MdSecurity } from 'react-icons/md';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { hashPIN } from '@/lib/services/encryption-service';
import { storePINHash, getPINHash, createVaultSession, hasPIN } from '@/lib/services/vault-storage';
import toast from 'react-hot-toast';

interface VaultAuthGateProps {
    onAuthenticated: (pin?: string) => void;
    onSetupComplete?: () => void;
}

export const VaultAuthGate = ({ onAuthenticated, onSetupComplete }: VaultAuthGateProps) => {
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [showPin, setShowPin] = useState(false);
    const [isSettingUp, setIsSettingUp] = useState(false);
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const pinExists = hasPIN();

    useEffect(() => {
        // Check if session is still valid
        const checkSession = () => {
            const sessionValid = localStorage.getItem('vault_session');
            if (sessionValid && parseInt(sessionValid) > Date.now()) {
                onAuthenticated();
            }
        };
        checkSession();
    }, [onAuthenticated]);

    const handleSetupPIN = async () => {
        setError(null);

        // Validate PIN
        if (pin.length < 4) {
            setError('PIN must be at least 4 digits');
            return;
        }

        if (pin.length > 8) {
            setError('PIN must be no more than 8 digits');
            return;
        }

        if (!/^\d+$/.test(pin)) {
            setError('PIN must contain only numbers');
            return;
        }

        if (pin !== confirmPin) {
            setError('PINs do not match');
            return;
        }

        setIsSettingUp(true);
        try {
            // Hash and store PIN
            const pinHash = await hashPIN(pin);
            storePINHash(pinHash);
            createVaultSession();
            
            toast.success('Vault PIN set up successfully');
            const setupPin = pin; // Save PIN before clearing
            setPin('');
            setConfirmPin('');
            onSetupComplete?.();
            onAuthenticated(setupPin);
        } catch (err) {
            console.error('Failed to set up PIN:', err);
            setError('Failed to set up PIN. Please try again.');
        } finally {
            setIsSettingUp(false);
        }
    };

    const handleAuthenticate = async () => {
        setError(null);

        if (pin.length < 4) {
            setError('Please enter your PIN');
            return;
        }

        setIsAuthenticating(true);
        try {
            // Hash entered PIN and compare with stored hash
            const enteredPinHash = await hashPIN(pin);
            const storedPinHash = getPINHash();

            if (enteredPinHash !== storedPinHash) {
                setError('Incorrect PIN. Please try again.');
                setPin('');
                return;
            }

            // Create session
            createVaultSession();
            toast.success('Vault unlocked');
            const authPin = pin; // Save PIN before clearing
            setPin('');
            onAuthenticated(authPin);
        } catch (err) {
            console.error('Authentication error:', err);
            setError('Authentication failed. Please try again.');
        } finally {
            setIsAuthenticating(false);
        }
    };

    const handleBiometricAuth = async () => {
        // Check if WebAuthn is available
        if (!window.PublicKeyCredential) {
            toast.error('Biometric authentication not available on this device');
            return;
        }

        try {
            // For now, we'll use a simple prompt
            // In production, implement proper WebAuthn API
            toast('Biometric authentication coming soon', { icon: '🔐' });
        } catch (err) {
            console.error('Biometric auth error:', err);
            toast.error('Biometric authentication failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 safe-top safe-bottom">
            <div className="w-full max-w-md">
                <div className="bg-surface rounded-card shadow-elevation-5 p-6 sm:p-8 md:p-10">
                    {/* Header */}
                    <div className="text-center mb-6 sm:mb-8">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-primary to-primary-light rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-elevation-3">
                            <MdLock size={32} className="sm:w-10 sm:h-10 text-on-primary" />
                        </div>
                        <h1 className="text-headline-md sm:text-headline-lg font-semibold text-on-surface mb-2">
                            {pinExists ? 'Unlock Vault' : 'Set Up Vault'}
                        </h1>
                        <p className="text-body-md text-on-variant">
                            {pinExists
                                ? 'Enter your PIN to access your secure vault'
                                : 'Create a PIN to secure your vault (4-8 digits)'}
                        </p>
                    </div>

                    {/* Encryption Badge */}
                    <div className="mb-6 flex items-center justify-center gap-2 text-label-md text-on-primary-container bg-primary-container rounded-full px-4 py-2">
                        <MdSecurity size={16} />
                        <span className="font-medium">AES-256 Encrypted</span>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-error-container border border-error rounded-input text-on-error-container text-body-sm">
                            {error}
                        </div>
                    )}

                    {/* PIN Input */}
                    <div className="space-y-4 mb-6">
                        <div>
                            <label className="block text-label-md font-medium text-on-surface mb-2">
                                PIN
                            </label>
                            <div className="relative">
                                <TextField
                                    type={showPin ? 'text' : 'password'}
                                    value={pin}
                                    onChange={(e) => {
                                        setPin(e.target.value);
                                        setError(null);
                                    }}
                                    placeholder={pinExists ? 'Enter your PIN' : 'Enter PIN (4-8 digits)'}
                                    fullWidth
                                    maxLength={8}
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    startAdornment={<MdLock size={20} className="text-on-variant" />}
                                    endAdornment={
                                        <button
                                            type="button"
                                            onClick={() => setShowPin(!showPin)}
                                            className="p-2 text-on-variant hover:text-on-surface hover:bg-surface-variant rounded-lg transition-colors touch-target"
                                            aria-label={showPin ? 'Hide PIN' : 'Show PIN'}
                                        >
                                            {showPin ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
                                        </button>
                                    }
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            if (pinExists) {
                                                handleAuthenticate();
                                            } else {
                                                handleSetupPIN();
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        {/* Confirm PIN (only during setup) */}
                        {!pinExists && (
                            <div>
                                <label className="block text-label-md font-medium text-on-surface mb-2">
                                    Confirm PIN
                                </label>
                                <TextField
                                    type={showPin ? 'text' : 'password'}
                                    value={confirmPin}
                                    onChange={(e) => {
                                        setConfirmPin(e.target.value);
                                        setError(null);
                                    }}
                                    placeholder="Confirm PIN"
                                    fullWidth
                                    maxLength={8}
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    startAdornment={<MdLock size={20} className="text-on-variant" />}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleSetupPIN();
                                        }
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        {pinExists ? (
                            <>
                                <Button
                                    variant="filled"
                                    size="large"
                                    fullWidth
                                    onClick={handleAuthenticate}
                                    disabled={isAuthenticating || pin.length < 4}
                                    loading={isAuthenticating}
                                    className="touch-target"
                                >
                                    Unlock Vault
                                </Button>
                                {window.PublicKeyCredential && (
                                    <Button
                                        variant="outlined"
                                        size="large"
                                        fullWidth
                                        onClick={handleBiometricAuth}
                                        startIcon={<MdVpnKey size={20} />}
                                        className="touch-target"
                                    >
                                        Use Biometric
                                    </Button>
                                )}
                            </>
                        ) : (
                            <Button
                                variant="filled"
                                size="large"
                                fullWidth
                                onClick={handleSetupPIN}
                                disabled={isSettingUp || pin.length < 4 || pin !== confirmPin}
                                loading={isSettingUp}
                                className="touch-target"
                            >
                                Set Up Vault
                            </Button>
                        )}
                    </div>

                    {/* Security Info */}
                    <div className="mt-6 pt-6 border-t border-outline-variant">
                        <div className="text-label-sm text-on-variant space-y-2">
                            <p className="flex items-center gap-2">
                                <MdSecurity size={14} />
                                Your PIN is hashed and never stored in plain text
                            </p>
                            <p className="flex items-center gap-2">
                                <MdLock size={14} />
                                All vault data is encrypted with AES-256
                            </p>
                            <p className="flex items-center gap-2">
                                <MdLock size={14} />
                                Session expires after 15 minutes of inactivity
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

