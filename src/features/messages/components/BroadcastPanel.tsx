import { useState } from 'react';
import { FiX, FiAlertTriangle, FiInfo, FiClock } from 'react-icons/fi';
import { useCreateBroadcast } from '../hooks/useBroadcasts';
import type { BroadcastPriority, BroadcastType } from '../api/broadcast-api';

interface BroadcastPanelProps {
    onClose: () => void;
}

export const BroadcastPanel = ({ onClose }: BroadcastPanelProps) => {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [priority, setPriority] = useState<BroadcastPriority>('normal');
    const [type, setType] = useState<BroadcastType>('announcement');
    const [hasExpiry, setHasExpiry] = useState(false);
    const [expiryHours, setExpiryHours] = useState(24);

    const createBroadcast = useCreateBroadcast();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim() || !message.trim()) {
            return;
        }

        const expiresAt = hasExpiry
            ? new Date(Date.now() + expiryHours * 60 * 60 * 1000)
            : undefined;

        createBroadcast.mutate(
            {
                title: title.trim(),
                message: message.trim(),
                priority,
                type,
                expiresAt,
            },
            {
                onSuccess: () => {
                    onClose();
                },
            }
        );
    };

    const priorityOptions: { value: BroadcastPriority; label: string; color: string }[] = [
        { value: 'low', label: 'Low', color: 'text-gray-600' },
        { value: 'normal', label: 'Normal', color: 'text-blue-600' },
        { value: 'high', label: 'High', color: 'text-orange-600' },
        { value: 'urgent', label: 'Urgent', color: 'text-red-600' },
    ];

    const typeOptions: { value: BroadcastType; label: string; icon: typeof FiInfo }[] = [
        { value: 'announcement', label: 'Announcement', icon: FiInfo },
        { value: 'alert', label: 'Alert', icon: FiAlertTriangle },
        { value: 'reminder', label: 'Reminder', icon: FiClock },
        { value: 'emergency', label: 'Emergency', icon: FiAlertTriangle },
    ];

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-br from-purple-600 to-purple-700 text-white px-6 py-4 rounded-t-3xl flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold">Send Broadcast Alert</h2>
                        <p className="text-purple-100 text-sm mt-1">
                            Send a notification to all family members
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

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Type Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Alert Type
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {typeOptions.map((option) => {
                                const Icon = option.icon;
                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => setType(option.value)}
                                        className={`p-3 rounded-xl border-2 transition-all ${
                                            type === option.value
                                                ? 'border-purple-600 bg-purple-50 text-purple-700'
                                                : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                        }`}
                                    >
                                        <Icon size={18} className="mx-auto mb-1" />
                                        <span className="text-xs font-medium block">
                                            {option.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Priority Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Priority Level
                        </label>
                        <div className="flex gap-2">
                            {priorityOptions.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setPriority(option.value)}
                                    className={`flex-1 px-4 py-2 rounded-xl border-2 transition-all text-sm font-medium ${
                                        priority === option.value
                                            ? 'border-purple-600 bg-purple-50 text-purple-700'
                                            : `border-gray-200 hover:border-gray-300 ${option.color}`
                                    }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Title Input */}
                    <div>
                        <label htmlFor="broadcast-title" className="block text-sm font-semibold text-gray-700 mb-2">
                            Title
                        </label>
                        <input
                            id="broadcast-title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Family Meeting Tonight"
                            maxLength={100}
                            required
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {title.length}/100 characters
                        </p>
                    </div>

                    {/* Message Input */}
                    <div>
                        <label htmlFor="broadcast-message" className="block text-sm font-semibold text-gray-700 mb-2">
                            Message
                        </label>
                        <textarea
                            id="broadcast-message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Enter your broadcast message..."
                            rows={5}
                            maxLength={500}
                            required
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {message.length}/500 characters
                        </p>
                    </div>

                    {/* Expiry Option */}
                    <div className="bg-gray-50 rounded-xl p-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={hasExpiry}
                                onChange={(e) => setHasExpiry(e.target.checked)}
                                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                            />
                            <span className="text-sm font-medium text-gray-700">
                                Set expiration time
                            </span>
                        </label>

                        {hasExpiry && (
                            <div className="mt-3">
                                <label htmlFor="expiry-hours" className="block text-xs text-gray-600 mb-1">
                                    Expires after (hours)
                                </label>
                                <input
                                    id="expiry-hours"
                                    type="number"
                                    value={expiryHours}
                                    onChange={(e) => setExpiryHours(Math.max(1, parseInt(e.target.value) || 1))}
                                    min="1"
                                    max="168"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!title.trim() || !message.trim() || createBroadcast.isPending}
                            className="flex-1 px-6 py-3 bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl font-semibold shadow-lg shadow-purple-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {createBroadcast.isPending ? 'Sending...' : 'Send Broadcast'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
