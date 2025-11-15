import { FiAlertTriangle, FiAlertCircle, FiInfo, FiCheck, FiX } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import type { BroadcastAlert as BroadcastAlertType } from '../api/broadcast-api';
import { useAcknowledgeBroadcast } from '../hooks/useBroadcasts';
import { useAuthStore } from '@/lib/store/auth-store';

interface BroadcastAlertProps {
    broadcast: BroadcastAlertType;
    onDismiss?: () => void;
}

export const BroadcastAlert = ({ broadcast, onDismiss }: BroadcastAlertProps) => {
    const { user } = useAuthStore();
    const acknowledgeBroadcast = useAcknowledgeBroadcast();

    const handleAcknowledge = () => {
        acknowledgeBroadcast.mutate(broadcast.id);
    };

    const isAcknowledged = user ? (broadcast.acknowledgedBy || broadcast.readBy || []).includes(user.id) : false;

    const typeConfig = {
        emergency: {
            icon: FiAlertTriangle,
            bgColor: 'bg-red-50',
            borderColor: 'border-red-300',
            textColor: 'text-red-900',
            iconColor: 'text-red-600',
            buttonColor: 'bg-red-600 hover:bg-red-700',
        },
        urgent: {
            icon: FiAlertCircle,
            bgColor: 'bg-orange-50',
            borderColor: 'border-orange-300',
            textColor: 'text-orange-900',
            iconColor: 'text-orange-600',
            buttonColor: 'bg-orange-600 hover:bg-orange-700',
        },
        info: {
            icon: FiInfo,
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-300',
            textColor: 'text-blue-900',
            iconColor: 'text-blue-600',
            buttonColor: 'bg-blue-600 hover:bg-blue-700',
        },
    };

    const config = typeConfig[broadcast.type as keyof typeof typeConfig] || typeConfig.info;
    const Icon = config.icon;

    return (
        <div
            className={`${config.bgColor} ${config.borderColor} ${config.textColor} border-2 rounded-2xl p-4 shadow-lg`}
        >
            <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={`flex-shrink-0 w-10 h-10 ${config.iconColor} flex items-center justify-center rounded-full bg-white shadow-sm`}>
                    <Icon size={24} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                            <h3 className="font-bold text-lg leading-tight">{broadcast.title}</h3>
                            <p className="text-xs opacity-75 mt-0.5">
                                {formatDistanceToNow(broadcast.timestamp, { addSuffix: true })} by {broadcast.senderName}
                            </p>
                        </div>
                        {onDismiss && (
                            <button
                                onClick={onDismiss}
                                className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/50 transition-colors"
                                aria-label="Dismiss"
                            >
                                <FiX size={16} />
                            </button>
                        )}
                    </div>

                    <p className="text-sm leading-relaxed mb-4">{broadcast.message}</p>

                    {/* Acknowledgment Status */}
                    <div className="flex items-center gap-3">
                        {isAcknowledged ? (
                            <div className="flex items-center gap-2 text-sm font-semibold">
                                <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                                    <FiCheck size={16} className="text-white" />
                                </div>
                                <span>Acknowledged</span>
                            </div>
                        ) : (
                            <button
                                onClick={handleAcknowledge}
                                disabled={acknowledgeBroadcast.isPending}
                                className={`px-4 py-2 ${config.buttonColor} text-white font-semibold rounded-lg transition-colors disabled:opacity-50 text-sm shadow-md`}
                            >
                                {acknowledgeBroadcast.isPending ? 'Acknowledging...' : 'Acknowledge'}
                            </button>
                        )}

                        {/* Acknowledgment Count */}
                        <div className="text-xs opacity-75">
                            {(broadcast.acknowledgedBy || broadcast.readBy || []).length} acknowledged
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

