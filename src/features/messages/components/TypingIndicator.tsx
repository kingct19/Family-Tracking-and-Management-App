import type { TypingStatus } from '../api/typing-api';

interface TypingIndicatorProps {
    typingUsers: TypingStatus[];
}

export const TypingIndicator = ({ typingUsers }: TypingIndicatorProps) => {
    if (typingUsers.length === 0) return null;

    const getTypingText = () => {
        if (typingUsers.length === 1) {
            return `${typingUsers[0].userName} is typing...`;
        } else if (typingUsers.length === 2) {
            return `${typingUsers[0].userName} and ${typingUsers[1].userName} are typing...`;
        } else {
            return `${typingUsers[0].userName} and ${typingUsers.length - 1} others are typing...`;
        }
    };

    return (
        <div className="px-4 md:px-6 py-2 flex items-center gap-2">
            <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-sm text-gray-600 italic">{getTypingText()}</span>
        </div>
    );
};

