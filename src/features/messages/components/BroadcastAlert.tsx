import { MdWarning, MdError, MdInfo, MdCheck, MdClose } from 'react-icons/md';
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
            icon: MdWarning,
            bgColor: 'bg-error-container',
            borderColor: 'border-error',
            textColor: 'text-on-error-container',
            iconColor: 'text-error',
            buttonColor: 'bg-error hover:bg-error/90',
        },
        urgent: {
            icon: MdError,
            bgColor: 'bg-secondary-container',
            borderColor: 'border-secondary',
            textColor: 'text-on-secondary-container',
            iconColor: 'text-secondary',
            buttonColor: 'bg-secondary hover:bg-secondary/90',
        },
        info: {
            icon: MdInfo,
            bgColor: 'bg-primary-container',
            borderColor: 'border-primary',
            textColor: 'text-on-primary-container',
            iconColor: 'text-primary',
            buttonColor: 'bg-primary hover:bg-primary/90',
        },
    };

    const config = typeConfig[broadcast.type as keyof typeof typeConfig] || typeConfig.info;
    const Icon = config.icon;

    return (
        <div
            className={`${config.bgColor} ${config.borderColor} ${config.textColor} border-2 rounded-card p-4 shadow-elevation-2`}
        >
            <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={`flex-shrink-0 w-10 h-10 ${config.iconColor} flex items-center justify-center rounded-full bg-surface shadow-elevation-1`}>
                    <Icon size={24} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                            <h3 className="font-semibold text-title-md leading-tight">{broadcast.title}</h3>
                            <p className="text-label-sm text-on-variant mt-0.5">
                                {formatDistanceToNow(broadcast.timestamp, { addSuffix: true })} by {broadcast.senderName}
                            </p>
                        </div>
                        {onDismiss && (
                            <button
                                onClick={onDismiss}
                                className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface/50 transition-colors touch-target"
                                aria-label="Dismiss"
                            >
                                <MdClose size={18} />
                            </button>
                        )}
                    </div>

                    <p className="text-body-md leading-relaxed mb-4">{broadcast.message}</p>

                    {/* Acknowledgment Status */}
                    <div className="flex items-center gap-3">
                        {isAcknowledged ? (
                            <div className="flex items-center gap-2 text-label-md font-semibold">
                                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                    <MdCheck size={16} className="text-on-primary" />
                                </div>
                                <span>Acknowledged</span>
                            </div>
                        ) : (
                            <button
                                onClick={handleAcknowledge}
                                disabled={acknowledgeBroadcast.isPending}
                                className={`px-4 py-2 ${config.buttonColor} text-on-primary font-semibold rounded-full transition-colors disabled:opacity-50 text-label-md shadow-elevation-2 touch-target`}
                            >
                                {acknowledgeBroadcast.isPending ? 'Acknowledging...' : 'Acknowledge'}
                            </button>
                        )}

                        {/* Acknowledgment Count */}
                        <div className="text-label-sm text-on-variant">
                            {(broadcast.acknowledgedBy || broadcast.readBy || []).length} acknowledged
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

