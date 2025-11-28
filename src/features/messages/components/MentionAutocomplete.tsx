/**
 * MentionAutocomplete Component
 * 
 * Autocomplete dropdown for @ mentioning hub members
 */

import { useState, useEffect, useRef } from 'react';
import type { HubMember } from '@/features/tasks/hooks/useHubMembers';

interface MentionAutocompleteProps {
    members: HubMember[];
    searchQuery: string; // Text after @ symbol
    onSelect: (member: HubMember) => void;
    onClose: () => void;
    position: { top: number; left: number };
    excludeUserId?: string; // Current user's ID to exclude from list
}

export const MentionAutocomplete = ({
    members,
    searchQuery,
    onSelect,
    onClose,
    position,
    excludeUserId,
}: MentionAutocompleteProps) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const listRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

    // Filter members based on search query
    const filteredMembers = members
        .filter((member) => {
            // Exclude current user
            if (excludeUserId && member.userId === excludeUserId) {
                return false;
            }
            // Filter by display name or email
            const query = searchQuery.toLowerCase();
            return (
                member.displayName.toLowerCase().includes(query) ||
                member.email.toLowerCase().includes(query)
            );
        })
        .slice(0, 10); // Limit to 10 results

    // Reset selected index when filtered results change
    useEffect(() => {
        setSelectedIndex(0);
    }, [filteredMembers.length]);

    // Scroll selected item into view
    useEffect(() => {
        const selectedItem = itemRefs.current[selectedIndex];
        if (selectedItem && listRef.current) {
            selectedItem.scrollIntoView({
                block: 'nearest',
                behavior: 'smooth',
            });
        }
    }, [selectedIndex]);

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (filteredMembers.length === 0) return;

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setSelectedIndex((prev) =>
                        prev < filteredMembers.length - 1 ? prev + 1 : 0
                    );
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setSelectedIndex((prev) =>
                        prev > 0 ? prev - 1 : filteredMembers.length - 1
                    );
                    break;
                case 'Enter':
                case 'Tab':
                    e.preventDefault();
                    if (filteredMembers[selectedIndex]) {
                        onSelect(filteredMembers[selectedIndex]);
                    }
                    break;
                case 'Escape':
                    e.preventDefault();
                    onClose();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [filteredMembers, selectedIndex, onSelect, onClose]);

    if (filteredMembers.length === 0) {
        return null;
    }

    return (
        <div
            ref={listRef}
            className="absolute z-50 bg-surface rounded-xl shadow-elevation-3 border border-outline-variant max-h-64 overflow-y-auto min-w-[200px] max-w-[300px]"
            style={{
                top: `${position.top}px`,
                left: `${position.left}px`,
            }}
        >
            {filteredMembers.map((member, index) => (
                <button
                    key={member.userId}
                    ref={(el) => {
                        itemRefs.current[index] = el;
                    }}
                    type="button"
                    onClick={() => onSelect(member)}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-variant transition-colors touch-target ${
                        index === selectedIndex ? 'bg-surface-variant' : ''
                    }`}
                >
                    {/* Avatar */}
                    {member.photoURL ? (
                        <img
                            src={member.photoURL}
                            alt={member.displayName}
                            className="w-8 h-8 rounded-full object-cover"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                            }}
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-on-primary text-label-sm font-semibold">
                            {member.displayName.charAt(0).toUpperCase()}
                        </div>
                    )}

                    {/* Member Info */}
                    <div className="flex-1 text-left min-w-0">
                        <div className="text-body-md font-medium text-on-surface truncate">
                            {member.displayName}
                        </div>
                        {member.role === 'admin' && (
                            <div className="text-label-sm text-on-variant">
                                Admin
                            </div>
                        )}
                    </div>
                </button>
            ))}
        </div>
    );
};

