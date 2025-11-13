/**
 * MessageList Component
 * 
 * Scrollable list of messages with auto-scroll to bottom
 */

import { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { MessageBubbleSkeleton } from '@/components/ui/Skeleton';
import type { Message } from '@/types';

interface MessageListProps {
    messages: Message[];
    currentUserId: string;
    isLoading?: boolean;
    onDeleteMessage?: (messageId: string) => void;
}

export const MessageList = ({
    messages,
    currentUserId,
    isLoading = false,
    onDeleteMessage,
}: MessageListProps) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    // Group messages by sender (show avatar only for first message from same sender)
    const groupedMessages: Array<{ message: Message; showAvatar: boolean }> = [];
    
    messages.forEach((message, index) => {
        const prevMessage = index > 0 ? messages[index - 1] : null;
        const showAvatar = 
            !prevMessage || 
            prevMessage.senderId !== message.senderId ||
            (message.timestamp.getTime() - prevMessage.timestamp.getTime()) > 300000; // 5 minutes gap

        groupedMessages.push({ message, showAvatar });
    });

    if (isLoading && messages.length === 0) {
        return (
            <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-4">
                <MessageBubbleSkeleton isOwn={false} />
                <MessageBubbleSkeleton isOwn={true} />
                <MessageBubbleSkeleton isOwn={false} />
                <MessageBubbleSkeleton isOwn={true} />
                <MessageBubbleSkeleton isOwn={false} />
            </div>
        );
    }

    if (messages.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6 min-h-0">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mb-6 shadow-lg">
                    <svg
                        className="w-12 h-12 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                    No messages yet
                </h3>
                <p className="text-sm text-gray-600 max-w-sm">
                    Start the conversation by sending a message to your family
                </p>
            </div>
        );
    }

    return (
        <div
            ref={listRef}
            className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-3"
        >
            {groupedMessages.map(({ message, showAvatar }) => (
                <MessageBubble
                    key={message.id}
                    message={message}
                    isOwnMessage={message.senderId === currentUserId}
                    onDelete={onDeleteMessage}
                    showAvatar={showAvatar}
                />
            ))}
            <div ref={messagesEndRef} />
        </div>
    );
};
