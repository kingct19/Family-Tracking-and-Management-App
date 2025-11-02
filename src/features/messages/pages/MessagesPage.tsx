/**
 * MessagesPage Component
 * 
 * Real-time messaging interface (Life360/iMessage style)
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { MessageList } from '../components/MessageList';
import { MessageInput } from '../components/MessageInput';
import { useHubMessages, useSendMessage, useDeleteMessage, useMarkMessageAsRead } from '../hooks/useMessages';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useHubStore } from '@/lib/store/hub-store';
import { FiUsers, FiArrowLeft, FiMenu } from 'react-icons/fi';
import toast from 'react-hot-toast';

const MessagesPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { currentHub } = useHubStore();
    const { messages, isLoading } = useHubMessages(currentHub?.id);
    const { sendMessage, sendMessageAsync, isSending, error: sendError } = useSendMessage();
    const { deleteMessage, deleteMessageAsync } = useDeleteMessage();
    const { markAsRead, markAsReadAsync } = useMarkMessageAsRead();

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

            <div className="flex flex-col h-screen">
                {/* Header */}
                <div className="flex-shrink-0 px-4 py-4 border-b border-gray-200 bg-white">
                    <div className="flex items-center gap-3">
                        {/* Back Button - Mobile */}
                        <button
                            onClick={() => navigate('/')}
                            className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                            aria-label="Back to map"
                        >
                            <FiArrowLeft size={20} />
                        </button>

                        {/* Hub Info */}
                        <div className="flex-1 min-w-0">
                            <h1 className="text-xl md:text-2xl font-bold text-gray-900 truncate">
                                {currentHub.name}
                            </h1>
                            <p className="text-sm text-gray-500">
                                {messages.length} {messages.length === 1 ? 'message' : 'messages'}
                            </p>
                        </div>

                        {/* Menu Button - Desktop */}
                        <button
                            onClick={() => navigate('/')}
                            className="hidden md:flex p-2 text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                            aria-label="Back to map"
                        >
                            <FiMenu size={20} />
                        </button>
                    </div>
                </div>

                {/* Message List */}
                <MessageList
                    messages={messages}
                    currentUserId={user?.id || ''}
                    isLoading={isLoading}
                    onDeleteMessage={handleDelete}
                />

                {/* Message Input */}
                <MessageInput
                    onSend={handleSend}
                    isSending={isSending}
                    placeholder={`Message ${currentHub.name}...`}
                    disabled={!user}
                />
            </div>
        </>
    );
};

export default MessagesPage;
