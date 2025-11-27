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
import type { BroadcastAlert as BroadcastAlertType } from '../api/broadcast-api';
import { TypingIndicator } from '../components/TypingIndicator';
import { useHubMessages, useSendMessage, useDeleteMessage, useMarkMessageAsRead } from '../hooks/useMessages';
import { useHubBroadcasts } from '../hooks/useBroadcasts';
import { useTyping } from '../hooks/useTyping';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useHubStore } from '@/lib/store/hub-store';
import { MdPeople, MdRadio, MdHistory } from 'react-icons/md';
import toast from 'react-hot-toast';

const MessagesPage = () => {
    const { user } = useAuth();
    const { currentHub } = useHubStore();
    const { messages, isLoading } = useHubMessages(currentHub?.id);
    const { data: broadcasts = [] } = useHubBroadcasts();
    const { typingUsers, setTyping, clearTyping } = useTyping(currentHub?.id);
    const { sendMessageAsync, isSending, error: sendError } = useSendMessage();
    const { deleteMessageAsync } = useDeleteMessage();
    const { markAsReadAsync } = useMarkMessageAsRead();
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
                    <title>Messages - HaloHub</title>
                </Helmet>
                <div className="flex flex-col items-center justify-center h-full text-center px-6">
                    <div className="w-24 h-24 bg-primary-container rounded-full flex items-center justify-center mb-6 shadow-elevation-2">
                        <MdPeople size={48} className="text-primary" />
                    </div>
                    <h3 className="text-headline-sm font-semibold text-on-surface mb-2">
                        No hub selected
                    </h3>
                    <p className="text-body-md text-on-variant">
                        Please select a hub to start messaging
                    </p>
                </div>
            </>
        );
    }

    return (
        <>
            <Helmet>
                <title>Messages - {currentHub.name} - HaloHub</title>
                <meta name="description" content="Chat with your family" />
            </Helmet>

            {/* Full screen container - TopBar is handled by AppLayout */}
            <div className="fixed inset-0 flex flex-col bg-background pt-14 sm:pt-16 md:pt-20 z-10 safe-top">
                {/* Hub Info Bar - Below TopBar - Mobile optimized */}
                <div className="flex-shrink-0 px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-5 border-b border-outline-variant bg-surface/95 backdrop-blur-md shadow-elevation-1 safe-top">
                    <div className="flex items-center justify-between gap-2 sm:gap-3 md:gap-4">
                        <div className="flex-1 min-w-0">
                            <h1 className="text-title-md sm:text-title-lg md:text-headline-sm font-semibold text-on-surface truncate">
                                {currentHub.name}
                            </h1>
                            <p className="text-label-sm sm:text-body-sm text-on-variant mt-0.5">
                                {messages.length} {messages.length === 1 ? 'message' : 'messages'}
                            </p>
                        </div>
                        {/* Action Buttons - Mobile optimized */}
                        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0">
                            <button
                                onClick={() => setShowBroadcastHistory(true)}
                                className="flex-shrink-0 px-2.5 py-2 sm:px-3 md:px-4 bg-surface-variant border border-outline-variant text-on-surface rounded-full hover:bg-outline-variant active:bg-outline-variant transition-all shadow-elevation-1 flex items-center gap-1.5 sm:gap-2 font-medium text-label-sm sm:text-label-md touch-target"
                            >
                                <MdHistory size={18} className="sm:w-5 sm:h-5 flex-shrink-0" />
                                <span className="hidden md:inline">History</span>
                            </button>
                            <button
                                onClick={() => setShowBroadcastPanel(true)}
                                className="flex-shrink-0 px-2.5 py-2 sm:px-3 md:px-4 bg-primary text-on-primary rounded-full hover:bg-primary/90 active:bg-primary/80 transition-all shadow-halo-button flex items-center gap-1.5 sm:gap-2 font-medium text-label-sm sm:text-label-md touch-target"
                            >
                                <MdRadio size={18} className="sm:w-5 sm:h-5 flex-shrink-0" />
                                <span className="hidden sm:inline">Broadcast</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Active Broadcasts - Mobile optimized */}
                {broadcasts.length > 0 && (
                    <div className="flex-shrink-0 px-3 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3 md:py-4 space-y-2 sm:space-y-3 bg-surface-variant/50 border-b border-outline-variant">
                        {broadcasts
                            .filter((b: BroadcastAlertType) => !dismissedBroadcasts.includes(b.id))
                            .slice(0, 3)
                            .map((broadcast: BroadcastAlertType) => (
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
