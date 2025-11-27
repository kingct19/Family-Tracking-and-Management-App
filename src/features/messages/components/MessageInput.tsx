/**
 * MessageInput Component
 * 
 * Input field for sending messages (Life360/iMessage style)
 */

import { useState, useRef, useEffect } from 'react';
import { MdSend, MdAttachFile, MdEmojiEmotions } from 'react-icons/md';

interface MessageInputProps {
    onSend: (text: string) => void;
    isSending?: boolean;
    placeholder?: string;
    disabled?: boolean;
    onTyping?: () => void;
    onStopTyping?: () => void;
}

export const MessageInput = ({
    onSend,
    isSending = false,
    placeholder = 'Type a message...',
    disabled = false,
    onTyping,
    onStopTyping,
}: MessageInputProps) => {
    const [message, setMessage] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout>();

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [message]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const trimmedMessage = message.trim();
        if (!trimmedMessage || isSending || disabled) return;

        onSend(trimmedMessage);
        setMessage('');
        
        // Clear typing status
        if (onStopTyping) {
            onStopTyping();
        }
        
        // Reset textarea height
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    };

    const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value);

        // Trigger typing indicator
        if (onTyping && e.target.value.trim()) {
            onTyping();
        }

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Auto-stop typing after 2 seconds of inactivity
        if (onStopTyping) {
            typingTimeoutRef.current = setTimeout(() => {
                onStopTyping();
            }, 2000);
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            if (onStopTyping) {
                onStopTyping();
            }
        };
    }, [onStopTyping]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // Send on Enter (but allow Shift+Enter for new line)
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="border-t border-outline-variant bg-surface/95 backdrop-blur-md px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 pb-5 sm:pb-6 shadow-elevation-2 safe-bottom"
        >
            <div className="flex items-center gap-2 sm:gap-3">
                {/* Attachment Button */}
                <button
                    type="button"
                    disabled={disabled}
                    className="flex-shrink-0 w-12 h-12 flex items-center justify-center text-on-variant hover:text-on-surface hover:bg-surface-variant rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-target"
                    aria-label="Attach file"
                >
                    <MdAttachFile size={20} />
                </button>

                {/* Text Input */}
                <div className="flex-1 relative flex items-center">
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={handleMessageChange}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        disabled={disabled || isSending}
                        rows={1}
                        className="w-full px-4 py-3 pr-14 bg-surface-variant border border-outline-variant rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary focus:bg-surface resize-none overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-elevation-1 text-base sm:text-body-md text-on-surface placeholder:text-on-variant"
                        style={{ minHeight: '48px', maxHeight: '120px', fontSize: '16px' }}
                    />
                    
                    {/* Emoji Button - Properly aligned */}
                    <button
                        type="button"
                        disabled={disabled}
                        className="absolute right-3 w-8 h-8 flex items-center justify-center text-on-variant hover:text-on-surface hover:bg-surface-variant rounded-full transition-all disabled:opacity-50 touch-target"
                        aria-label="Add emoji"
                    >
                        <MdEmojiEmotions size={18} />
                    </button>
                </div>

                {/* Send Button */}
                <button
                    type="submit"
                    disabled={!message.trim() || isSending || disabled}
                    className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full transition-all shadow-halo-button touch-target ${
                        message.trim() && !isSending && !disabled
                            ? 'bg-primary text-on-primary hover:bg-primary/90 active:scale-95'
                            : 'bg-surface-variant text-on-variant cursor-not-allowed shadow-none'
                    }`}
                    aria-label="Send message"
                >
                    {isSending ? (
                        <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <MdSend size={20} />
                    )}
                </button>
            </div>
        </form>
    );
};
