/**
 * GeofenceAlertToast Component
 * 
 * Displays geofence alert notifications as toast messages
 */

import { useEffect, useState } from 'react';
import { FiMapPin, FiX, FiBell } from 'react-icons/fi';
import { alertService, type GeofenceAlert } from '../services/alert-service';

export const GeofenceAlertToast = () => {
    const [alerts, setAlerts] = useState<GeofenceAlert[]>([]);
    const [visibleAlerts, setVisibleAlerts] = useState<Set<string>>(new Set());

    // Listen for new geofence alerts
    useEffect(() => {
        const handleGeofenceAlert = (event: CustomEvent<GeofenceAlert>) => {
            const alert = event.detail;
            setAlerts(prev => [alert, ...prev]);
            setVisibleAlerts(prev => new Set([...prev, alert.id]));
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                setVisibleAlerts(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(alert.id);
                    return newSet;
                });
            }, 5000);
        };

        window.addEventListener('geofenceAlert', handleGeofenceAlert as EventListener);
        
        return () => {
            window.removeEventListener('geofenceAlert', handleGeofenceAlert as EventListener);
        };
    }, []);

    // Load existing alerts on mount
    useEffect(() => {
        const existingAlerts = alertService.getAlerts();
        setAlerts(existingAlerts);
    }, []);

    const handleDismiss = (alertId: string) => {
        setVisibleAlerts(prev => {
            const newSet = new Set(prev);
            newSet.delete(alertId);
            return newSet;
        });
        alertService.markAsRead(alertId);
    };

    const getAlertIcon = (type: 'entry' | 'exit') => {
        return type === 'entry' ? (
            <FiMapPin className="text-green-600" size={20} />
        ) : (
            <FiMapPin className="text-red-600" size={20} />
        );
    };

    const getAlertColor = (type: 'entry' | 'exit') => {
        return type === 'entry' 
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-red-50 border-red-200 text-red-800';
    };

    if (alerts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
            {alerts
                .filter(alert => visibleAlerts.has(alert.id))
                .map((alert) => (
                    <div
                        key={alert.id}
                        className={`${getAlertColor(alert.type)} border rounded-lg p-4 shadow-lg animate-slide-in-right`}
                    >
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                                {getAlertIcon(alert.type)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <FiBell size={14} className="text-gray-500" />
                                    <span className="text-sm font-medium">
                                        Geofence Alert
                                    </span>
                                </div>
                                
                                <p className="text-sm font-semibold mb-1">
                                    {alert.message}
                                </p>
                                
                                <p className="text-xs text-gray-600">
                                    {alert.geofenceName} • {alert.timestamp.toLocaleTimeString()}
                                </p>
                            </div>
                            
                            <button
                                onClick={() => handleDismiss(alert.id)}
                                className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                aria-label="Dismiss alert"
                            >
                                <FiX size={16} />
                            </button>
                        </div>
                    </div>
                ))}
        </div>
    );
};
