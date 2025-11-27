/**
 * MessageBubble Component
 * 
 * Individual message bubble display (Life360/iMessage style)
 */

import { useState } from 'react';
import { MdMoreVert, MdDelete, MdCheck, MdCheckCircle } from 'react-icons/md';
import type { Message } from '@/types';

interface MessageBubbleProps {
    message: Message;
    isOwnMessage: boolean;
    onDelete?: (messageId: string) => void;
    showAvatar?: boolean;
    photoURL?: string;
}

export const MessageBubble = ({
    message,
    isOwnMessage,
    onDelete,
    showAvatar = true,
    photoURL,
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
            className={`flex gap-2 sm:gap-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} group`}
        >
            {/* Avatar */}
            {showAvatar ? (
                <div className="relative flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10">
                    {photoURL ? (
                        <img
                            src={photoURL}
                            alt={message.senderName}
                            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover shadow-elevation-2 ring-2 ring-surface"
                            onError={(e) => {
                                // Hide image and show fallback initial on error
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const fallback = target.parentElement?.querySelector('.avatar-fallback') as HTMLElement;
                                if (fallback) fallback.style.display = 'flex';
                            }}
                        />
                    ) : null}
                    <div 
                        className={`avatar-fallback absolute inset-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-on-primary text-label-sm sm:text-label-md font-semibold shadow-elevation-2 ring-2 ring-surface ${photoURL ? 'hidden' : 'flex'}`}
                    >
                        {message.senderName.charAt(0).toUpperCase()}
                    </div>
                </div>
            ) : (
                <div className="flex-shrink-0 w-9 sm:w-10" />
            )}

            {/* Message Content */}
            <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} max-w-[80%] sm:max-w-[75%] md:max-w-[65%] min-w-0`}>
                {/* Sender Name (only for others' messages) */}
                {!isOwnMessage && showAvatar && (
                    <span className="text-label-sm font-medium text-on-variant mb-1 sm:mb-1.5 px-1">
                        {message.senderName}
                    </span>
                )}

                {/* Bubble */}
                <div
                    className={`relative px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl ${
                        isOwnMessage
                            ? 'bg-primary text-on-primary rounded-br-sm shadow-elevation-2'
                            : 'bg-surface text-on-surface rounded-bl-sm shadow-elevation-1 border border-outline-variant'
                    }`}
                >
                    {/* Message Text */}
                    <p className="text-body-md sm:text-body-md whitespace-pre-wrap break-words select-text">
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
                    <div className={`flex items-center gap-1 sm:gap-1.5 mt-1 sm:mt-1.5 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                        <span className={`text-label-sm ${isOwnMessage ? 'text-on-primary/80' : 'text-on-variant'}`}>
                            {formatTime(message.timestamp)}
                        </span>
                        {isOwnMessage && (
                            <MdCheckCircle
                                size={12}
                                className={`sm:w-3.5 sm:h-3.5 ${isRead ? 'text-on-primary' : 'text-on-primary/60'}`}
                            />
                        )}
                    </div>
                </div>

                {/* Menu Button (only for own messages) - More accessible on mobile */}
                {isOwnMessage && onDelete && (
                    <div className="relative">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-2 sm:p-1 text-on-variant hover:text-on-surface active:text-on-surface transition-opacity touch-target"
                            aria-label="Message options"
                        >
                            <MdMoreVert size={18} className="sm:w-4 sm:h-4" />
                        </button>

                        {/* Dropdown Menu */}
                        {showMenu && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowMenu(false)}
                                />
                                <div className={`absolute ${isOwnMessage ? 'right-0' : 'left-0'} top-8 sm:top-6 bg-surface rounded-xl shadow-elevation-3 border border-outline-variant py-1 z-20 min-w-[140px] sm:min-w-[120px]`}>
                                    <button
                                        onClick={() => {
                                            onDelete(message.id);
                                            setShowMenu(false);
                                        }}
                                        className="w-full flex items-center gap-2 px-4 py-3 sm:py-2 text-body-md text-error hover:bg-error-container active:bg-error-container transition-colors touch-target"
                                    >
                                        <MdDelete size={18} className="sm:w-4 sm:h-4" />
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
