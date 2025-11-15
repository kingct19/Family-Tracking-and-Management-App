import { FiAlertTriangle, FiInfo, FiClock, FiCheck, FiX } from 'react-icons/fi';
import { useHubBroadcasts, useAcknowledgeBroadcast } from '../hooks/useBroadcasts';
import type { BroadcastAlert } from '../api/broadcast-api';
import { useAuthStore } from '@/lib/store/auth-store';
import { formatDistanceToNow } from 'date-fns';

interface BroadcastHistoryProps {
    onClose: () => void;
}

export const BroadcastHistory = ({ onClose }: BroadcastHistoryProps) => {
    const { data: broadcasts = [], isLoading } = useHubBroadcasts();
    const acknowledgeBroadcast = useAcknowledgeBroadcast();
    const { user } = useAuthStore();

    const handleAcknowledge = (broadcastId: string) => {
        acknowledgeBroadcast.mutate(broadcastId);
    };

    const getBroadcastIcon = (broadcast: BroadcastAlert) => {
        switch (broadcast.type) {
            case 'emergency':
            case 'alert':
                return <FiAlertTriangle size={20} />;
            case 'reminder':
                return <FiClock size={20} />;
            default:
                return <FiInfo size={20} />;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent':
                return 'border-red-500 bg-red-50';
            case 'high':
                return 'border-orange-500 bg-orange-50';
            case 'normal':
                return 'border-blue-500 bg-blue-50';
            default:
                return 'border-gray-500 bg-gray-50';
        }
    };

    const getPriorityTextColor = (priority: string) => {
        switch (priority) {
            case 'urgent':
                return 'text-red-700';
            case 'high':
                return 'text-orange-700';
            case 'normal':
                return 'text-blue-700';
            default:
                return 'text-gray-700';
        }
    };

    const isAcknowledged = (broadcast: BroadcastAlert) => {
        return user && broadcast.readBy.includes(user.id);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-br from-purple-600 to-purple-700 text-white px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold">Broadcast History</h2>
                        <p className="text-purple-100 text-sm mt-1">
                            View all family broadcast alerts
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                        aria-label="Close"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                        </div>
                    ) : broadcasts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mb-4">
                                <FiInfo size={32} className="text-purple-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                No broadcasts yet
                            </h3>
                            <p className="text-sm text-gray-600 max-w-sm">
                                Broadcast alerts sent by admins will appear here
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {broadcasts.map((broadcast: BroadcastAlert) => {
                                const acknowledged = isAcknowledged(broadcast);

                                return (
                                    <div
                                        key={broadcast.id}
                                        className={`border-l-4 rounded-xl p-4 ${getPriorityColor(
                                            broadcast.priority
                                        )} transition-all ${
                                            !acknowledged ? 'shadow-md' : 'opacity-75'
                                        }`}
                                    >
                                        {/* Header */}
                                        <div className="flex items-start justify-between gap-3 mb-2">
                                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                                <div
                                                    className={`flex-shrink-0 ${getPriorityTextColor(
                                                        broadcast.priority
                                                    )}`}
                                                >
                                                    {getBroadcastIcon(broadcast)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3
                                                        className={`font-bold text-lg ${getPriorityTextColor(
                                                            broadcast.priority
                                                        )}`}
                                                    >
                                                        {broadcast.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 mt-0.5">
                                                        From {broadcast.senderName} •{' '}
                                                        {formatDistanceToNow(broadcast.timestamp, {
                                                            addSuffix: true,
                                                        })}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Status Badge */}
                                            {acknowledged ? (
                                                <div className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                                                    <FiCheck size={14} />
                                                    Read
                                                </div>
                                            ) : (
                                                <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                                                    New
                                                </div>
                                            )}
                                        </div>

                                        {/* Message */}
                                        <p className="text-gray-800 text-sm leading-relaxed mb-3 ml-8">
                                            {broadcast.message}
                                        </p>

                                        {/* Footer */}
                                        <div className="flex items-center justify-between ml-8">
                                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                                <span className="px-2 py-1 bg-white rounded-full capitalize">
                                                    {broadcast.type}
                                                </span>
                                                <span className="px-2 py-1 bg-white rounded-full capitalize">
                                                    {broadcast.priority} priority
                                                </span>
                                                {broadcast.expiresAt && (
                                                    <span className="px-2 py-1 bg-white rounded-full flex items-center gap-1">
                                                        <FiClock size={12} />
                                                        Expires{' '}
                                                        {formatDistanceToNow(broadcast.expiresAt, {
                                                            addSuffix: true,
                                                        })}
                                                    </span>
                                                )}
                                            </div>

                                            {!acknowledged && (
                                                <button
                                                    onClick={() => handleAcknowledge(broadcast.id)}
                                                    disabled={acknowledgeBroadcast.isPending}
                                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 shadow-md"
                                                >
                                                    Acknowledge
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

