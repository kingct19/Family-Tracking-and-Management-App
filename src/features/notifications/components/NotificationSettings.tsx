/**
 * NotificationSettings Component
 * 
 * UI for managing notification preferences
 */

import { useState } from 'react';
import { FiBell, FiBellOff, FiCheckCircle, FiXCircle, FiAlertCircle } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { useNotifications } from '../hooks/useNotifications';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export const NotificationSettings = () => {
    const {
        isSupported,
        permissionStatus,
        isEnabled,
        isLoading,
        requestPermission,
        disableNotifications,
    } = useNotifications();

    const [showInfo, setShowInfo] = useState(false);

    if (!isSupported) {
        return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <FiAlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                        <h3 className="font-semibold text-yellow-900 mb-1">
                            Notifications Not Supported
                        </h3>
                        <p className="text-sm text-yellow-700">
                            Your browser does not support push notifications. Please use a modern browser like Chrome, Firefox, or Edge.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                        <FiBell size={20} className="text-purple-600" />
                        Push Notifications
                    </h3>
                    <p className="text-sm text-gray-600">
                        Receive real-time alerts for tasks, messages, and location updates
                    </p>
                </div>
                {isEnabled ? (
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full">
                        <FiCheckCircle size={16} className="text-green-600" />
                        <span className="text-xs font-semibold text-green-700">Enabled</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full">
                        <FiXCircle size={16} className="text-gray-400" />
                        <span className="text-xs font-semibold text-gray-600">Disabled</span>
                    </div>
                )}
            </div>

            {/* Status Message */}
            {permissionStatus === 'denied' && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-2">
                        <FiAlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={16} />
                        <div>
                            <p className="text-sm font-medium text-red-900 mb-1">
                                Notifications Blocked
                            </p>
                            <p className="text-xs text-red-700">
                                Notifications are blocked in your browser settings. To enable them:
                            </p>
                            <ol className="text-xs text-red-700 mt-1 ml-4 list-decimal">
                                <li>Click the lock icon in your browser's address bar</li>
                                <li>Find "Notifications" and change it to "Allow"</li>
                                <li>Refresh this page</li>
                            </ol>
                        </div>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
                {!isEnabled && permissionStatus !== 'denied' && (
                    <Button
                        variant="filled"
                        onClick={requestPermission}
                        disabled={isLoading}
                        loading={isLoading}
                        startIcon={<FiBell size={18} />}
                        className="flex-1"
                    >
                        Enable Notifications
                    </Button>
                )}

                {isEnabled && (
                    <Button
                        variant="outlined"
                        onClick={disableNotifications}
                        disabled={isLoading}
                        startIcon={<FiBellOff size={18} />}
                        className="flex-1"
                    >
                        Disable Notifications
                    </Button>
                )}

                <button
                    onClick={() => setShowInfo(!showInfo)}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                >
                    {showInfo ? 'Hide' : 'Show'} Info
                </button>
            </div>

            {/* Info Section */}
            {showInfo && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">
                        What notifications will you receive?
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-start gap-2">
                            <span className="text-purple-600 mt-0.5">•</span>
                            <span><strong>Task assignments:</strong> When a task is assigned to you</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-purple-600 mt-0.5">•</span>
                            <span><strong>Task approvals:</strong> When someone submits proof for your review</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-purple-600 mt-0.5">•</span>
                            <span><strong>New messages:</strong> When someone sends a message in your hub</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-purple-600 mt-0.5">•</span>
                            <span><strong>Geofence alerts:</strong> When family members enter or leave geofenced areas</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-purple-600 mt-0.5">•</span>
                            <span><strong>XP updates:</strong> When you earn XP or level up</span>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};

