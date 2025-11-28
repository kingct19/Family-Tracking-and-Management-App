/**
 * MessageInput Component with @ Mention Support
 * 
 * Enhanced input field with @ mention autocomplete functionality
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { MdSend, MdAttachFile, MdEmojiEmotions } from 'react-icons/md';
import { MentionAutocomplete } from './MentionAutocomplete';
import { formatMention } from '../utils/mention-parser';
import { useHubMembers } from '@/features/tasks/hooks/useHubMembers';
import type { HubMember } from '@/features/tasks/hooks/useHubMembers';

interface MessageInputWithMentionsProps {
    onSend: (text: string, mentionedUserIds: string[]) => void;
    isSending?: boolean;
    placeholder?: string;
    disabled?: boolean;
    onTyping?: () => void;
    onStopTyping?: () => void;
    currentUserId?: string;
}

export const MessageInputWithMentions = ({
    onSend,
    isSending = false,
    placeholder = 'Type a message...',
    disabled = false,
    onTyping,
    onStopTyping,
    currentUserId,
}: MessageInputWithMentionsProps) => {
    const [message, setMessage] = useState('');
    const [showMentionAutocomplete, setShowMentionAutocomplete] = useState(false);
    const [mentionQuery, setMentionQuery] = useState('');
    const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
    const [mentionStartIndex, setMentionStartIndex] = useState(0);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout>();

    const { data: hubMembers = [] } = useHubMembers();

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [message]);

    // Detect @ mentions in text
    const detectMention = useCallback((text: string, cursorPosition: number) => {
        // Find the last @ symbol before cursor
        const textBeforeCursor = text.substring(0, cursorPosition);
        const lastAtIndex = textBeforeCursor.lastIndexOf('@');

        if (lastAtIndex === -1) {
            setShowMentionAutocomplete(false);
            return;
        }

        // Check if there's a space or newline after @ (mention already completed)
        const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
        if (textAfterAt.includes(' ') || textAfterAt.includes('\n')) {
            setShowMentionAutocomplete(false);
            return;
        }

        // Extract the query (text after @)
        const query = textAfterAt.trim();
        
        // Show autocomplete if query is empty or matches member names
        setShowMentionAutocomplete(true);
        setMentionQuery(query);
        setMentionStartIndex(lastAtIndex);

        // Calculate position for autocomplete dropdown
        if (textareaRef.current && containerRef.current) {
            const textareaRect = textareaRef.current.getBoundingClientRect();
            const containerRect = containerRef.current.getBoundingClientRect();
            
            // Approximate position based on cursor (this is simplified)
            setMentionPosition({
                top: textareaRect.top - containerRect.top - 200, // Above input
                left: textareaRect.left - containerRect.left,
            });
        }
    }, []);

    const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        const cursorPosition = e.target.selectionStart;
        
        setMessage(newValue);

        // Detect mentions
        detectMention(newValue, cursorPosition);

        // Trigger typing indicator
        if (onTyping && newValue.trim()) {
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

    const handleMentionSelect = (member: HubMember) => {
        if (!textareaRef.current) return;

        const mentionText = formatMention(member.displayName, member.userId);
        const textBeforeMention = message.substring(0, mentionStartIndex);
        // Find the cursor position (after @ and query)
        const cursorPosition = textareaRef.current.selectionStart;
        const textAfterMention = message.substring(cursorPosition);
        const newText = textBeforeMention + mentionText + ' ' + textAfterMention;
        
        setMessage(newText);
        setShowMentionAutocomplete(false);

        // Set cursor position after the mention
        setTimeout(() => {
            if (textareaRef.current) {
                const newCursorPos = textBeforeMention.length + mentionText.length + 1;
                textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
                textareaRef.current.focus();
            }
        }, 0);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const trimmedMessage = message.trim();
        if (!trimmedMessage || isSending || disabled) return;

        // Extract mentioned user IDs from the message
        const mentionedUserIds = message.match(/@[^(]+\(([^)]+)\)/g)?.map((match) => {
            const userIdMatch = match.match(/\(([^)]+)\)$/);
            return userIdMatch ? userIdMatch[1] : '';
        }).filter(Boolean) || [];

        onSend(trimmedMessage, mentionedUserIds);
        setMessage('');
        setShowMentionAutocomplete(false);
        
        // Clear typing status
        if (onStopTyping) {
            onStopTyping();
        }
        
        // Reset textarea height
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
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
        // Close autocomplete on Escape
        if (e.key === 'Escape' && showMentionAutocomplete) {
            e.preventDefault();
            setShowMentionAutocomplete(false);
            return;
        }

        // Don't submit on Enter if autocomplete is open
        if (showMentionAutocomplete) {
            return; // Let autocomplete handle Enter
        }

        // Send on Enter (but allow Shift+Enter for new line)
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    // Close autocomplete when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setShowMentionAutocomplete(false);
            }
        };

        if (showMentionAutocomplete) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showMentionAutocomplete]);

    return (
        <div ref={containerRef} className="relative">
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

            {/* Mention Autocomplete */}
            {showMentionAutocomplete && (
                <MentionAutocomplete
                    members={hubMembers}
                    searchQuery={mentionQuery}
                    onSelect={handleMentionSelect}
                    onClose={() => setShowMentionAutocomplete(false)}
                    position={mentionPosition}
                    excludeUserId={currentUserId}
                />
            )}
        </div>
    );
};

