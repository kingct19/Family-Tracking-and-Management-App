/**
 * MessageInput Component
 * 
 * Input field for sending messages (Life360/iMessage style)
 */

import { useState, useRef, useEffect } from 'react';
import { FiSend, FiPaperclip, FiSmile } from 'react-icons/fi';

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
            className="border-t border-gray-200/50 bg-white/95 backdrop-blur-md p-4 md:px-6 shadow-lg"
        >
            <div className="flex items-end gap-3">
                {/* Attachment Button */}
                <button
                    type="button"
                    disabled={disabled}
                    className="flex-shrink-0 w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Attach file"
                >
                    <FiPaperclip size={20} />
                </button>

                {/* Text Input */}
                <div className="flex-1 relative">
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={handleMessageChange}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        disabled={disabled || isSending}
                        rows={1}
                        className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:bg-white resize-none overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                        style={{ minHeight: '48px', maxHeight: '120px' }}
                    />
                    
                    {/* Emoji Button (placeholder) */}
                    <button
                        type="button"
                        disabled={disabled}
                        className="absolute right-12 bottom-3 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all disabled:opacity-50"
                        aria-label="Add emoji"
                    >
                        <FiSmile size={18} />
                    </button>
                </div>

                {/* Send Button */}
                <button
                    type="submit"
                    disabled={!message.trim() || isSending || disabled}
                    className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full transition-all shadow-md ${
                        message.trim() && !isSending && !disabled
                            ? 'bg-gradient-to-br from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 active:scale-95 shadow-purple-200'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                    }`}
                    aria-label="Send message"
                >
                    {isSending ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <FiSend size={20} />
                    )}
                </button>
            </div>
        </form>
    );
};
