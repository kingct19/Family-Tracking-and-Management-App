/**
 * VaultAuthGate Component
 * 
 * PIN/biometric authentication gate for vault access
 */

import { useState, useEffect } from 'react';
import { FiLock, FiEye, FiEyeOff, FiKey, FiShield } from 'react-icons/fi';
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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <FiLock size={32} className="text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {pinExists ? 'Unlock Vault' : 'Set Up Vault'}
                        </h1>
                        <p className="text-gray-600">
                            {pinExists
                                ? 'Enter your PIN to access your secure vault'
                                : 'Create a PIN to secure your vault (4-8 digits)'}
                        </p>
                    </div>

                    {/* Encryption Badge */}
                    <div className="mb-6 flex items-center justify-center gap-2 text-sm text-green-700 bg-green-50 rounded-xl px-4 py-2">
                        <FiShield size={16} />
                        <span className="font-medium">AES-256 Encrypted</span>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    {/* PIN Input */}
                    <div className="space-y-4 mb-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                                    startAdornment={<FiLock size={20} className="text-gray-400" />}
                                    endAdornment={
                                        <button
                                            type="button"
                                            onClick={() => setShowPin(!showPin)}
                                            className="p-2 text-gray-400 hover:text-gray-600"
                                            aria-label={showPin ? 'Hide PIN' : 'Show PIN'}
                                        >
                                            {showPin ? <FiEyeOff size={20} /> : <FiEye size={20} />}
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
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                                    startAdornment={<FiLock size={20} className="text-gray-400" />}
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
                                >
                                    Unlock Vault
                                </Button>
                                {window.PublicKeyCredential && (
                                    <Button
                                        variant="outlined"
                                        size="large"
                                        fullWidth
                                        onClick={handleBiometricAuth}
                                        startIcon={<FiKey size={20} />}
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
                            >
                                Set Up Vault
                            </Button>
                        )}
                    </div>

                    {/* Security Info */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="text-xs text-gray-500 space-y-1">
                            <p className="flex items-center gap-2">
                                <FiShield size={12} />
                                Your PIN is hashed and never stored in plain text
                            </p>
                            <p className="flex items-center gap-2">
                                <FiLock size={12} />
                                All vault data is encrypted with AES-256
                            </p>
                            <p className="flex items-center gap-2">
                                <FiLock size={12} />
                                Session expires after 15 minutes of inactivity
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

