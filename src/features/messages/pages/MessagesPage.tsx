/**
 * MessagesPage Component
 * 
 * Real-time messaging interface (Life360/iMessage style)
 */

import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { MessageList } from '../components/MessageList';
import { MessageInput } from '../components/MessageInput';
import { BroadcastPanel } from '../components/BroadcastPanel';
import { BroadcastHistory } from '../components/BroadcastHistory';
import { BroadcastAlert } from '../components/BroadcastAlert';
import { TypingIndicator } from '../components/TypingIndicator';
import { useHubMessages, useSendMessage, useDeleteMessage, useMarkMessageAsRead } from '../hooks/useMessages';
import { useHubBroadcasts } from '../hooks/useBroadcasts';
import { useTyping } from '../hooks/useTyping';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useHubStore } from '@/lib/store/hub-store';
import { FiUsers, FiRadio } from 'react-icons/fi';
import toast from 'react-hot-toast';

const MessagesPage = () => {
    const { user } = useAuth();
    const { currentHub } = useHubStore();
    const { messages, isLoading } = useHubMessages(currentHub?.id);
    const { data: broadcasts = [] } = useHubBroadcasts();
    const { typingUsers, setTyping, clearTyping } = useTyping(currentHub?.id);
    const { sendMessage, sendMessageAsync, isSending, error: sendError } = useSendMessage();
    const { deleteMessage, deleteMessageAsync } = useDeleteMessage();
    const { markAsRead, markAsReadAsync } = useMarkMessageAsRead();
    const [showBroadcastPanel, setShowBroadcastPanel] = useState(false);
    const [showBroadcastHistory, setShowBroadcastHistory] = useState(false);
    const [dismissedBroadcasts, setDismissedBroadcasts] = useState<string[]>([]);

    // Mark messages as read when viewing
    useEffect(() => {
        if (!user || !messages.length) return;

        // Mark unread messages as read
        messages.forEach(async (message) => {
            if (message.senderId !== user.id && !message.readBy.includes(user.id)) {
                try {
                    await markAsReadAsync(message.id);
                } catch (error) {
                    // Silently fail - not critical
                }
            }
        });
    }, [messages, user, markAsReadAsync]);

    // Handle send error
    useEffect(() => {
        if (sendError) {
            toast.error(sendError.message || 'Failed to send message');
        }
    }, [sendError]);

    const handleSend = async (text: string) => {
        try {
            await sendMessageAsync(text);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to send message');
        }
    };

    const handleDelete = async (messageId: string) => {
        if (window.confirm('Are you sure you want to delete this message?')) {
            try {
                await deleteMessageAsync(messageId);
                toast.success('Message deleted');
            } catch (error) {
                toast.error(error instanceof Error ? error.message : 'Failed to delete message');
            }
        }
    };

    if (!currentHub) {
        return (
            <>
                <Helmet>
                    <title>Messages - Family Safety App</title>
                </Helmet>
                <div className="flex flex-col items-center justify-center h-full text-center px-6">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <FiUsers size={36} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No hub selected
                    </h3>
                    <p className="text-sm text-gray-500">
                        Please select a hub to start messaging
                    </p>
                </div>
            </>
        );
    }

    return (
        <>
            <Helmet>
                <title>Messages - {currentHub.name} - Family Safety App</title>
                <meta name="description" content="Chat with your family" />
            </Helmet>

            {/* Full screen container - TopBar is handled by AppLayout */}
            <div className="fixed inset-0 flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 pt-20 z-10">
                {/* Hub Info Bar - Below TopBar */}
                <div className="flex-shrink-0 px-4 md:px-6 py-4 border-b border-gray-200/50 bg-white/80 backdrop-blur-md shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <h1 className="text-xl md:text-2xl font-bold text-gray-900 truncate">
                                {currentHub.name}
                            </h1>
                            <p className="text-sm text-gray-600 mt-0.5">
                                {messages.length} {messages.length === 1 ? 'message' : 'messages'}
                            </p>
                        </div>
                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowBroadcastHistory(true)}
                                className="flex-shrink-0 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2 font-semibold text-sm"
                            >
                                <FiRadio size={18} />
                                <span className="hidden md:inline">History</span>
                            </button>
                            <button
                                onClick={() => setShowBroadcastPanel(true)}
                                className="flex-shrink-0 px-4 py-2 bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all shadow-md flex items-center gap-2 font-semibold text-sm"
                            >
                                <FiRadio size={18} />
                                <span className="hidden sm:inline">Broadcast</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Active Broadcasts */}
                {broadcasts.length > 0 && (
                    <div className="flex-shrink-0 px-4 md:px-6 py-3 space-y-3 bg-white/50 border-b border-gray-200/50">
                        {broadcasts
                            .filter((b) => !dismissedBroadcasts.includes(b.id))
                            .slice(0, 3)
                            .map((broadcast) => (
                                <BroadcastAlert
                                    key={broadcast.id}
                                    broadcast={broadcast}
                                    onDismiss={() => setDismissedBroadcasts((prev) => [...prev, broadcast.id])}
                                />
                            ))}
                    </div>
                )}

                {/* Message List */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    <MessageList
                        messages={messages}
                        currentUserId={user?.id || ''}
                        isLoading={isLoading}
                        onDeleteMessage={handleDelete}
                    />
                </div>

                {/* Typing Indicator */}
                <TypingIndicator typingUsers={typingUsers} />

                {/* Message Input */}
                <div className="flex-shrink-0">
                    <MessageInput
                        onSend={handleSend}
                        isSending={isSending}
                        placeholder={`Message ${currentHub.name}...`}
                        disabled={!user}
                        onTyping={setTyping}
                        onStopTyping={clearTyping}
                    />
                </div>
            </div>

            {/* Broadcast Panel */}
            {showBroadcastPanel && (
                <BroadcastPanel onClose={() => setShowBroadcastPanel(false)} />
            )}

            {/* Broadcast History */}
            {showBroadcastHistory && (
                <BroadcastHistory onClose={() => setShowBroadcastHistory(false)} />
            )}
        </>
    );
};

export default MessagesPage;
