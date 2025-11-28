/**
 * MentionText Component
 * 
 * Renders message text with highlighted @ mentions
 */

import { useMemo } from 'react';
import { renderMentions } from '../utils/mention-parser';

interface MentionTextProps {
    text: string;
    isOwnMessage?: boolean;
}

export const MentionText = ({ text, isOwnMessage = false }: MentionTextProps) => {
    const renderedText = useMemo(() => {
        // Parse mentions to find where they are in the text
        const mentionRegex = /@([^(]+)\(([^)]+)\)/g;
        const parts: Array<{ text: string; isMention: boolean }> = [];
        let lastIndex = 0;
        let match;

        // Find all mentions and split the text around them
        while ((match = mentionRegex.exec(text)) !== null) {
            // Add text before the mention
            if (match.index > lastIndex) {
                parts.push({
                    text: text.substring(lastIndex, match.index),
                    isMention: false,
                });
            }

            // Add the mention (just the display name part, highlighted)
            const displayName = match[1].trim();
            parts.push({
                text: `@${displayName}`,
                isMention: true,
            });

            lastIndex = match.index + match[0].length;
        }

        // Add remaining text after last mention
        if (lastIndex < text.length) {
            parts.push({
                text: text.substring(lastIndex),
                isMention: false,
            });
        }

        // If no mentions found, return the original text
        if (parts.length === 0) {
            return <span>{text}</span>;
        }

        // Render parts with mentions highlighted
        // Use different colors based on message type for better visibility
        const mentionClassName = isOwnMessage
            ? 'font-semibold text-on-primary underline decoration-on-primary/60'
            : 'font-semibold text-primary underline decoration-primary/40';
        
        return parts.map((part, index) => {
            if (part.isMention) {
                return (
                    <span key={index} className={mentionClassName}>
                        {part.text}
                    </span>
                );
            }
            return <span key={index}>{part.text}</span>;
        });
    }, [text]);

    return (
        <span className="whitespace-pre-wrap break-words">
            {renderedText}
        </span>
    );
};

