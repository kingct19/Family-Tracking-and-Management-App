/**
 * Mention Parser Utilities
 * 
 * Functions to parse @ mentions from message text and extract user IDs
 */

export interface MentionMatch {
    displayName: string;
    userId: string;
    startIndex: number;
    endIndex: number;
}

/**
 * Parse @ mentions from text using format @displayName(userId)
 * This format allows us to store the actual user ID while displaying the name
 * Handles names with spaces by matching everything up to the opening parenthesis
 */
export function parseMentions(text: string): MentionMatch[] {
    // Match @ followed by any characters (including spaces) up to (userId)
    const mentionRegex = /@([^(]+)\(([^)]+)\)/g;
    const mentions: MentionMatch[] = [];
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
        const displayName = match[1].trim(); // Trim any trailing spaces
        mentions.push({
            displayName,
            userId: match[2],
            startIndex: match.index,
            endIndex: match.index + match[0].length,
        });
    }

    return mentions;
}

/**
 * Extract user IDs from parsed mentions
 */
export function extractMentionedUserIds(text: string): string[] {
    const mentions = parseMentions(text);
    const userIds = mentions.map((m) => m.userId);
    // Remove duplicates
    return [...new Set(userIds)];
}

/**
 * Format a mention in the text as @displayName(userId)
 */
export function formatMention(displayName: string, userId: string): string {
    // Escape parentheses in display name
    const escapedName = displayName.replace(/[()]/g, '');
    return `@${escapedName}(${userId})`;
}

/**
 * Replace @ mentions with display names for rendering
 * Converts @displayName(userId) to @displayName
 * Handles names with spaces by matching everything up to the opening parenthesis
 */
export function renderMentions(text: string): string {
    // Match @ followed by any characters (including spaces) up to (userId) and replace with just @displayName
    return text.replace(/@([^(]+)\(([^)]+)\)/g, (match, displayName) => {
        return `@${displayName.trim()}`;
    });
}

