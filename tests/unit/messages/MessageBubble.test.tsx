import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MessageBubble } from '@/features/messages/components/MessageBubble';
import type { Message } from '@/types';

describe('MessageBubble', () => {
  const mockMessage: Message = {
    id: 'msg-1',
    hubId: 'hub-1',
    text: 'Hello, this is a test message',
    senderId: 'user-1',
    senderName: 'John Doe',
    timestamp: new Date(),
    readBy: ['user-1'],
    mentions: [],
    mediaURL: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders message text', () => {
    render(<MessageBubble message={mockMessage} isOwnMessage={false} />);

    expect(screen.getByText('Hello, this is a test message')).toBeInTheDocument();
  });

  it('displays sender name for other users messages', () => {
    render(<MessageBubble message={mockMessage} isOwnMessage={false} showAvatar={true} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('does not display sender name for own messages', () => {
    render(<MessageBubble message={mockMessage} isOwnMessage={true} />);

    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });

  it('formats timestamp as "Just now" for recent messages', () => {
    const recentMessage: Message = {
      ...mockMessage,
      timestamp: new Date(),
    };

    render(<MessageBubble message={recentMessage} isOwnMessage={false} />);

    expect(screen.getByText(/just now/i)).toBeInTheDocument();
  });

  it('formats timestamp as minutes ago', () => {
    const minutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const message: Message = {
      ...mockMessage,
      timestamp: minutesAgo,
    };

    render(<MessageBubble message={message} isOwnMessage={false} />);

    expect(screen.getByText(/5m ago/i)).toBeInTheDocument();
  });

  it('shows read indicator for own messages when read', () => {
    const readMessage: Message = {
      ...mockMessage,
      readBy: ['user-1', 'user-2'],
    };

    const { container } = render(<MessageBubble message={readMessage} isOwnMessage={true} />);

    // Check icon is an SVG, not an img role
    const checkIcon = container.querySelector('svg');
    expect(checkIcon).toBeInTheDocument();
    expect(screen.getByText(/just now/i)).toBeInTheDocument();
  });

  it('displays avatar fallback with first letter when no photoURL', () => {
    render(<MessageBubble message={mockMessage} isOwnMessage={false} showAvatar={true} />);

    const fallback = screen.getByText('J');
    expect(fallback).toBeInTheDocument();
  });

  it('displays avatar image when photoURL is provided', () => {
    render(
      <MessageBubble
        message={mockMessage}
        isOwnMessage={false}
        showAvatar={true}
        photoURL="https://example.com/photo.jpg"
      />
    );

    const avatar = screen.getByAltText('John Doe');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('src', 'https://example.com/photo.jpg');
  });

  it('displays media attachment when mediaURL is present', () => {
    const messageWithMedia: Message = {
      ...mockMessage,
      mediaURL: 'https://example.com/image.jpg',
    };

    render(<MessageBubble message={messageWithMedia} isOwnMessage={false} />);

    const media = screen.getByAltText('Message attachment');
    expect(media).toBeInTheDocument();
    expect(media).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('calls onDelete when delete button is clicked', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();

    render(<MessageBubble message={mockMessage} isOwnMessage={true} onDelete={onDelete} />);

    const menuButton = screen.getByRole('button', { name: /message options/i });
    await user.click(menuButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    expect(onDelete).toHaveBeenCalledWith('msg-1');
  });

  it('shows menu dropdown when menu button is clicked', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();

    render(<MessageBubble message={mockMessage} isOwnMessage={true} onDelete={onDelete} />);

    const menuButton = screen.getByRole('button', { name: /message options/i });
    await user.click(menuButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    });
  });

  it('closes menu when clicking outside', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();

    render(<MessageBubble message={mockMessage} isOwnMessage={true} onDelete={onDelete} />);

    const menuButton = screen.getByRole('button', { name: /message options/i });
    await user.click(menuButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    });

    // Click on the backdrop overlay
    const backdrop = document.querySelector('.fixed.inset-0');
    if (backdrop) {
      await user.click(backdrop);
    } else {
      // Fallback: click on body
      await user.click(document.body);
    }

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('applies correct styling for own messages', () => {
    render(<MessageBubble message={mockMessage} isOwnMessage={true} />);

    const bubble = screen.getByText('Hello, this is a test message').closest('div[class*="bg-primary"]');
    expect(bubble).toBeInTheDocument();
  });

  it('applies correct styling for other users messages', () => {
    render(<MessageBubble message={mockMessage} isOwnMessage={false} />);

    const bubble = screen.getByText('Hello, this is a test message').closest('div[class*="bg-surface"]');
    expect(bubble).toBeInTheDocument();
  });

  it('does not show menu button for other users messages', () => {
    render(<MessageBubble message={mockMessage} isOwnMessage={false} onDelete={vi.fn()} />);

    expect(screen.queryByRole('button', { name: /message options/i })).not.toBeInTheDocument();
  });

  it('handles text with mentions', () => {
    const messageWithMentions: Message = {
      ...mockMessage,
      text: 'Hello @John Doe(user-1)',
      mentions: ['user-1'],
    };

    render(<MessageBubble message={messageWithMentions} isOwnMessage={false} />);

    expect(screen.getByText(/hello/i)).toBeInTheDocument();
  });

  it('has accessible menu button', () => {
    render(<MessageBubble message={mockMessage} isOwnMessage={true} onDelete={vi.fn()} />);

    const menuButton = screen.getByRole('button', { name: /message options/i });
    expect(menuButton).toBeInTheDocument();
    expect(menuButton).toHaveClass('touch-target');
  });
});

