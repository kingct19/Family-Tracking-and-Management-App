/**
 * MessageBubble Component
 * 
 * Individual message bubble display (Life360/iMessage style)
 */

import { useState } from 'react';
import { FiMoreVertical, FiTrash2, FiCheck } from 'react-icons/fi';
import type { Message } from '@/types';

interface MessageBubbleProps {
    message: Message;
    isOwnMessage: boolean;
    onDelete?: (messageId: string) => void;
    showAvatar?: boolean;
}

export const MessageBubble = ({
    message,
    isOwnMessage,
    onDelete,
    showAvatar = true,
}: MessageBubbleProps) => {
    const [showMenu, setShowMenu] = useState(false);

    // Format timestamp
    const formatTime = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (diff < 86400000) {
            return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        }
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    // Check if message is read
    const isRead = message.readBy.length > 1; // More than just sender

    return (
        <div
            className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} group`}
        >
            {/* Avatar */}
            {showAvatar ? (
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-sm font-semibold shadow-md ring-2 ring-white">
                    {message.senderName.charAt(0).toUpperCase()}
                </div>
            ) : (
                <div className="flex-shrink-0 w-10" />
            )}

            {/* Message Content */}
            <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} max-w-[75%] md:max-w-[65%]`}>
                {/* Sender Name (only for others' messages) */}
                {!isOwnMessage && showAvatar && (
                    <span className="text-xs font-medium text-gray-600 mb-1.5 px-1">
                        {message.senderName}
                    </span>
                )}

                {/* Bubble */}
                <div
                    className={`relative px-4 py-2.5 rounded-2xl ${
                        isOwnMessage
                            ? 'bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-br-sm shadow-md'
                            : 'bg-white text-gray-900 rounded-bl-sm shadow-sm border border-gray-200/50'
                    }`}
                >
                    {/* Message Text */}
                    <p className="text-sm whitespace-pre-wrap break-words">
                        {message.text}
                    </p>

                    {/* Media (if any) */}
                    {message.mediaURL && (
                        <div className="mt-2 rounded-lg overflow-hidden">
                            <img
                                src={message.mediaURL}
                                alt="Message attachment"
                                className="max-w-full h-auto rounded-lg"
                            />
                        </div>
                    )}

                    {/* Timestamp & Read Status */}
                    <div className={`flex items-center gap-1.5 mt-1.5 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                        <span className={`text-xs ${isOwnMessage ? 'text-purple-100/90' : 'text-gray-500'}`}>
                            {formatTime(message.timestamp)}
                        </span>
                        {isOwnMessage && (
                            <FiCheck
                                size={14}
                                className={isRead ? 'text-blue-200' : 'text-purple-200/70'}
                            />
                        )}
                    </div>
                </div>

                {/* Menu Button (only for own messages) */}
                {isOwnMessage && onDelete && (
                    <div className="relative">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 transition-opacity"
                            aria-label="Message options"
                        >
                            <FiMoreVertical size={14} />
                        </button>

                        {/* Dropdown Menu */}
                        {showMenu && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowMenu(false)}
                                />
                                <div className="absolute right-0 top-6 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 min-w-[120px]">
                                    <button
                                        onClick={() => {
                                            onDelete(message.id);
                                            setShowMenu(false);
                                        }}
                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        <FiTrash2 size={14} />
                                        Delete
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
