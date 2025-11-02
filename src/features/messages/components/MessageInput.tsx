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
}

export const MessageInput = ({
    onSend,
    isSending = false,
    placeholder = 'Type a message...',
    disabled = false,
}: MessageInputProps) => {
    const [message, setMessage] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

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
        
        // Reset textarea height
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    };

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
            className="border-t border-gray-200 bg-white p-4"
        >
            <div className="flex items-end gap-2">
                {/* Attachment Button */}
                <button
                    type="button"
                    disabled={disabled}
                    className="flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Attach file"
                >
                    <FiPaperclip size={20} />
                </button>

                {/* Text Input */}
                <div className="flex-1 relative">
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        disabled={disabled || isSending}
                        rows={1}
                        className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ minHeight: '44px', maxHeight: '120px' }}
                    />
                    
                    {/* Emoji Button (placeholder) */}
                    <button
                        type="button"
                        disabled={disabled}
                        className="absolute right-12 bottom-2 p-1 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                        aria-label="Add emoji"
                    >
                        <FiSmile size={18} />
                    </button>
                </div>

                {/* Send Button */}
                <button
                    type="submit"
                    disabled={!message.trim() || isSending || disabled}
                    className={`flex-shrink-0 p-3 rounded-full transition-all ${
                        message.trim() && !isSending && !disabled
                            ? 'bg-purple-600 text-white hover:bg-purple-700 active:scale-95'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
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
