import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useHubStore } from '@/lib/store/hub-store';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { updateFeatureToggles } from '@/lib/api/hub-api';
import { featureTogglesSchema } from '@/lib/validation/hub-schemas';
import type { FeatureToggles } from '@/types';
import toast from 'react-hot-toast';
import {
    FiMapPin,
    FiCheckSquare,
    FiMessageCircle,
    FiLock,
    FiAward,
    FiShield,
    FiSmartphone,
} from 'react-icons/fi';

const featureLabels: Record<keyof FeatureToggles, { label: string; description: string; icon: React.ReactNode }> = {
    location: {
        label: 'Location Tracking',
        description: 'Track and share member locations',
        icon: <FiMapPin size={20} />,
    },
    tasks: {
        label: 'Tasks',
        description: 'Assign and manage tasks',
        icon: <FiCheckSquare size={20} />,
    },
    chat: {
        label: 'Messages',
        description: 'Group messaging and communication',
        icon: <FiMessageCircle size={20} />,
    },
    vault: {
        label: 'Vault',
        description: 'Secure storage for sensitive information',
        icon: <FiLock size={20} />,
    },
    xp: {
        label: 'XP System',
        description: 'Earn points for completing tasks',
        icon: <FiAward size={20} />,
    },
    leaderboard: {
        label: 'Leaderboard',
        description: 'Rank members by XP (requires XP enabled)',
        icon: <FiAward size={20} />,
    },
    geofencing: {
        label: 'Geofencing',
        description: 'Location-based alerts (requires location enabled)',
        icon: <FiShield size={20} />,
    },
    deviceMonitoring: {
        label: 'Device Monitoring',
        description: 'Monitor battery and device status',
        icon: <FiSmartphone size={20} />,
    },
};

export const FeatureTogglesSettings = () => {
    const { currentHub, currentRole, featureToggles, updateFeatureToggles: updateLocalToggles } = useHubStore();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [localToggles, setLocalToggles] = useState<FeatureToggles>(
        featureToggles || {
            location: true,
            tasks: true,
            chat: true,
            vault: false,
            xp: true,
            leaderboard: true,
            geofencing: false,
            deviceMonitoring: true,
        }
    );

    const updateMutation = useMutation({
        mutationFn: async (toggles: FeatureToggles) => {
            if (!currentHub) throw new Error('No hub selected');
            return updateFeatureToggles(currentHub.id, toggles);
        },
        onSuccess: () => {
            updateLocalToggles(localToggles);
            queryClient.invalidateQueries({ queryKey: ['hubs', user?.id] });
            toast.success('Feature toggles updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to update feature toggles');
        },
    });

    const handleToggle = (feature: keyof FeatureToggles) => {
        const newToggles = { ...localToggles, [feature]: !localToggles[feature] };

        // Validate dependencies
        const result = featureTogglesSchema.safeParse(newToggles);
        if (!result.success) {
            const error = result.error.errors[0];
            toast.error(error.message);
            return;
        }

        setLocalToggles(newToggles);
    };

    const handleSave = () => {
        const result = featureTogglesSchema.safeParse(localToggles);
        if (!result.success) {
            toast.error('Invalid feature toggle configuration');
            return;
        }
        updateMutation.mutate(localToggles);
    };

    const hasChanges = JSON.stringify(localToggles) !== JSON.stringify(featureToggles);

    if (!currentHub || currentRole !== 'admin') {
        return null;
    }

    return (
        <Card elevation={1}>
            <CardHeader title="Feature Toggles" />
            <CardContent>
                <p className="text-body-sm text-on-variant mb-6">
                    Enable or disable features for this hub. Some features depend on others.
                </p>

                <div className="space-y-4">
                    {(Object.keys(featureLabels) as Array<keyof FeatureToggles>).map((feature) => {
                        const { label, description, icon } = featureLabels[feature];
                        const isEnabled = localToggles[feature];
                        const isDisabled =
                            (feature === 'leaderboard' && !localToggles.xp) ||
                            (feature === 'geofencing' && !localToggles.location);

                        return (
                            <div
                                key={feature}
                                className={`flex items-start justify-between p-4 rounded-lg border transition-colors ${
                                    isDisabled && !isEnabled
                                        ? 'bg-gray-50 border-gray-200 opacity-60'
                                        : 'bg-white border-gray-200 hover:border-purple-300'
                                }`}
                            >
                                <div className="flex items-start gap-3 flex-1">
                                    <div className={`mt-1 ${isDisabled && !isEnabled ? 'text-gray-400' : 'text-purple-600'}`}>
                                        {icon}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-gray-900">{label}</h3>
                                            {isDisabled && !isEnabled && (
                                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                                    Requires dependency
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">{description}</p>
                                    </div>
                                </div>

                                <label className="relative inline-flex items-center cursor-pointer ml-4">
                                    <input
                                        type="checkbox"
                                        checked={isEnabled}
                                        onChange={() => handleToggle(feature)}
                                        disabled={isDisabled && !isEnabled}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"></div>
                                </label>
                            </div>
                        );
                    })}
                </div>

                {hasChanges && (
                    <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                        <Button
                            variant="outlined"
                            onClick={() => setLocalToggles(featureToggles || localToggles)}
                            disabled={updateMutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="filled"
                            onClick={handleSave}
                            loading={updateMutation.isPending}
                            disabled={updateMutation.isPending}
                        >
                            Save Changes
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

