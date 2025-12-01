import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MentionAutocomplete } from '@/features/messages/components/MentionAutocomplete';
import type { HubMember } from '@/features/tasks/hooks/useHubMembers';

describe('MentionAutocomplete', () => {
  const mockMembers: HubMember[] = [
    {
      userId: 'user-1',
      displayName: 'John Doe',
      email: 'john@example.com',
      photoURL: null,
      role: 'member',
    },
    {
      userId: 'user-2',
      displayName: 'Jane Smith',
      email: 'jane@example.com',
      photoURL: 'https://example.com/jane.jpg',
      role: 'admin',
    },
    {
      userId: 'user-3',
      displayName: 'Bob Johnson',
      email: 'bob@example.com',
      photoURL: null,
      role: 'member',
    },
  ];

  const mockOnSelect = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders filtered members based on search query', () => {
    render(
      <MentionAutocomplete
        members={mockMembers}
        searchQuery="john"
        onSelect={mockOnSelect}
        onClose={mockOnClose}
        position={{ top: 0, left: 0 }}
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
  });

  it('filters members by display name', () => {
    render(
      <MentionAutocomplete
        members={mockMembers}
        searchQuery="jane"
        onSelect={mockOnSelect}
        onClose={mockOnClose}
        position={{ top: 0, left: 0 }}
      />
    );

    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });

  it('filters members by email', () => {
    render(
      <MentionAutocomplete
        members={mockMembers}
        searchQuery="jane@example.com"
        onSelect={mockOnSelect}
        onClose={mockOnClose}
        position={{ top: 0, left: 0 }}
      />
    );

    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('excludes current user from results', () => {
    render(
      <MentionAutocomplete
        members={mockMembers}
        searchQuery=""
        onSelect={mockOnSelect}
        onClose={mockOnClose}
        position={{ top: 0, left: 0 }}
        excludeUserId="user-1"
      />
    );

    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
  });

  it('calls onSelect when member is clicked', async () => {
    const user = userEvent.setup();
    render(
      <MentionAutocomplete
        members={mockMembers}
        searchQuery=""
        onSelect={mockOnSelect}
        onClose={mockOnClose}
        position={{ top: 0, left: 0 }}
      />
    );

    const memberButton = screen.getByText('John Doe').closest('button');
    if (memberButton) {
      await user.click(memberButton);
      expect(mockOnSelect).toHaveBeenCalledWith(mockMembers[0]);
    }
  });

  it('navigates with arrow keys', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <MentionAutocomplete
        members={mockMembers}
        searchQuery=""
        onSelect={mockOnSelect}
        onClose={mockOnClose}
        position={{ top: 0, left: 0 }}
      />
    );

    // Focus the component first
    const autocomplete = container.firstChild as HTMLElement;
    autocomplete.focus();

    await user.keyboard('{ArrowDown}');
    // Wait for state update - check if any button has the highlighted class
    await waitFor(() => {
      const highlightedButtons = container.querySelectorAll('.bg-surface-variant');
      expect(highlightedButtons.length).toBeGreaterThan(0);
    });

    await user.keyboard('{ArrowDown}');
    // Wait for state update
    await waitFor(() => {
      const highlightedButtons = container.querySelectorAll('.bg-surface-variant');
      expect(highlightedButtons.length).toBe(1);
    });
  });

  it('selects member on Enter key', async () => {
    const user = userEvent.setup();
    render(
      <MentionAutocomplete
        members={mockMembers}
        searchQuery=""
        onSelect={mockOnSelect}
        onClose={mockOnClose}
        position={{ top: 0, left: 0 }}
      />
    );

    await user.keyboard('{Enter}');

    expect(mockOnSelect).toHaveBeenCalledWith(mockMembers[0]);
  });

  it('closes on Escape key', async () => {
    const user = userEvent.setup();
    render(
      <MentionAutocomplete
        members={mockMembers}
        searchQuery=""
        onSelect={mockOnSelect}
        onClose={mockOnClose}
        position={{ top: 0, left: 0 }}
      />
    );

    await user.keyboard('{Escape}');

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('limits results to 10 members', () => {
    const manyMembers: HubMember[] = Array.from({ length: 15 }, (_, i) => ({
      userId: `user-${i}`,
      displayName: `User ${i}`,
      email: `user${i}@example.com`,
      photoURL: null,
      role: 'member' as const,
    }));

    render(
      <MentionAutocomplete
        members={manyMembers}
        searchQuery=""
        onSelect={mockOnSelect}
        onClose={mockOnClose}
        position={{ top: 0, left: 0 }}
      />
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeLessThanOrEqual(10);
  });

  it('displays admin badge for admin members', () => {
    render(
      <MentionAutocomplete
        members={mockMembers}
        searchQuery="jane"
        onSelect={mockOnSelect}
        onClose={mockOnClose}
        position={{ top: 0, left: 0 }}
      />
    );

    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('displays avatar image when photoURL is provided', () => {
    render(
      <MentionAutocomplete
        members={mockMembers}
        searchQuery="jane"
        onSelect={mockOnSelect}
        onClose={mockOnClose}
        position={{ top: 0, left: 0 }}
      />
    );

    const avatar = screen.getByAltText('Jane Smith');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('src', 'https://example.com/jane.jpg');
  });

  it('displays fallback initial when no photoURL', () => {
    render(
      <MentionAutocomplete
        members={mockMembers}
        searchQuery="john"
        onSelect={mockOnSelect}
        onClose={mockOnClose}
        position={{ top: 0, left: 0 }}
      />
    );

    const fallback = screen.getByText('J');
    expect(fallback).toBeInTheDocument();
  });

  it('returns null when no members match', () => {
    const { container } = render(
      <MentionAutocomplete
        members={mockMembers}
        searchQuery="nonexistent"
        onSelect={mockOnSelect}
        onClose={mockOnClose}
        position={{ top: 0, left: 0 }}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('applies position styles correctly', () => {
    const { container } = render(
      <MentionAutocomplete
        members={mockMembers}
        searchQuery=""
        onSelect={mockOnSelect}
        onClose={mockOnClose}
        position={{ top: 100, left: 200 }}
      />
    );

    const autocomplete = container.firstChild as HTMLElement;
    expect(autocomplete).toHaveStyle({ top: '100px', left: '200px' });
  });

  it('wraps around when navigating past last item', async () => {
    const user = userEvent.setup();
    render(
      <MentionAutocomplete
        members={mockMembers}
        searchQuery=""
        onSelect={mockOnSelect}
        onClose={mockOnClose}
        position={{ top: 0, left: 0 }}
      />
    );

    // Navigate to last item
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowDown}');

    // Should wrap to first
    const firstItem = screen.getByText('John Doe').closest('button');
    expect(firstItem).toHaveClass('bg-surface-variant');
  });

  it('has accessible member buttons', () => {
    render(
      <MentionAutocomplete
        members={mockMembers}
        searchQuery=""
        onSelect={mockOnSelect}
        onClose={mockOnClose}
        position={{ top: 0, left: 0 }}
      />
    );

    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      expect(button).toHaveClass('touch-target');
    });
  });
});

