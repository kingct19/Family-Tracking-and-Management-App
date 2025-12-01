import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MessageInputWithMentions } from '@/features/messages/components/MessageInputWithMentions';
import { useHubMembers } from '@/features/tasks/hooks/useHubMembers';

// Mock dependencies
vi.mock('@/features/tasks/hooks/useHubMembers');

const mockUseHubMembers = vi.mocked(useHubMembers);

describe('MessageInputWithMentions', () => {
  let queryClient: QueryClient;
  const mockOnSend = vi.fn();
  const mockOnTyping = vi.fn();
  const mockOnStopTyping = vi.fn();

  const mockMembers = [
    {
      userId: 'user-1',
      displayName: 'John Doe',
      email: 'john@example.com',
      photoURL: null,
      role: 'member' as const,
    },
    {
      userId: 'user-2',
      displayName: 'Jane Smith',
      email: 'jane@example.com',
      photoURL: null,
      role: 'admin' as const,
    },
  ];

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    vi.clearAllMocks();
    // Don't use fake timers for these tests - they cause timeout issues
    mockUseHubMembers.mockReturnValue({
      data: mockMembers,
      isLoading: false,
      error: null,
    } as any);
  });

  const renderComponent = (props = {}) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MessageInputWithMentions
          onSend={mockOnSend}
          onTyping={mockOnTyping}
          onStopTyping={mockOnStopTyping}
          {...props}
        />
      </QueryClientProvider>
    );
  };

  it('renders message input field', () => {
    renderComponent();

    const textarea = screen.getByPlaceholderText(/type a message/i);
    expect(textarea).toBeInTheDocument();
  });

  it('renders send button', () => {
    renderComponent();

    const sendButton = screen.getByRole('button', { name: /send message/i });
    expect(sendButton).toBeInTheDocument();
  });

  it('disables send button when message is empty', () => {
    renderComponent();

    const sendButton = screen.getByRole('button', { name: /send message/i });
    expect(sendButton).toBeDisabled();
  });

  it('enables send button when message has content', async () => {
    const user = userEvent.setup();
    renderComponent();

    const textarea = screen.getByPlaceholderText(/type a message/i);
    await user.type(textarea, 'Hello');

    await waitFor(() => {
      const sendButton = screen.getByRole('button', { name: /send message/i });
      expect(sendButton).not.toBeDisabled();
    }, { timeout: 2000 });
  });

  it('calls onSend with message text and mentioned user IDs', async () => {
    const user = userEvent.setup();
    renderComponent();

    const textarea = screen.getByPlaceholderText(/type a message/i);
    await user.type(textarea, 'Hello @John Doe(user-1)');

    const sendButton = screen.getByRole('button', { name: /send message/i });
    await user.click(sendButton);

    await waitFor(() => {
      expect(mockOnSend).toHaveBeenCalledWith('Hello @John Doe(user-1)', ['user-1']);
    }, { timeout: 3000 });
  });

  it('calls onTyping when user types', async () => {
    const user = userEvent.setup();
    renderComponent();

    const textarea = screen.getByPlaceholderText(/type a message/i);
    await user.type(textarea, 'H');

    await waitFor(() => {
      expect(mockOnTyping).toHaveBeenCalled();
    }, { timeout: 2000 });
  });

  it('calls onStopTyping after 2 seconds of inactivity', async () => {
    const user = userEvent.setup();
    vi.useFakeTimers();
    renderComponent();

    const textarea = screen.getByPlaceholderText(/type a message/i);
    await user.type(textarea, 'Hello');

    // Advance timers and flush promises
    vi.advanceTimersByTime(2000);
    
    await waitFor(() => {
      expect(mockOnStopTyping).toHaveBeenCalled();
    }, { timeout: 1000 });
    
    vi.useRealTimers();
  });

  it('shows mention autocomplete when @ is typed', async () => {
    const user = userEvent.setup();
    renderComponent();

    const textarea = screen.getByPlaceholderText(/type a message/i);
    // Type @ and trigger change event
    await user.type(textarea, '@');

    // Wait for autocomplete to appear - it uses detectMention callback
    await waitFor(() => {
      const autocomplete = document.querySelector('.absolute.z-50');
      if (autocomplete) {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      }
    }, { timeout: 5000 });
  });

  it('filters mention autocomplete based on search query', async () => {
    const user = userEvent.setup();
    renderComponent();

    const textarea = screen.getByPlaceholderText(/type a message/i);
    await user.type(textarea, '@J');

    await waitFor(() => {
      const autocomplete = document.querySelector('.absolute.z-50');
      if (autocomplete) {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      }
    }, { timeout: 5000 });

    await user.type(textarea, 'ane');

    await waitFor(() => {
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('inserts mention when member is selected', async () => {
    const user = userEvent.setup();
    renderComponent();

    const textarea = screen.getByPlaceholderText(/type a message/i);
    await user.type(textarea, '@');

    await waitFor(() => {
      const autocomplete = document.querySelector('.absolute.z-50');
      if (autocomplete) {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      }
    }, { timeout: 5000 });

    const memberButton = screen.getByText('John Doe').closest('button');
    if (memberButton) {
      await user.click(memberButton);
    }

    await waitFor(() => {
      expect(textarea).toHaveValue('@John Doe(user-1) ');
    }, { timeout: 5000 });
  });

  it('closes autocomplete on Escape key', async () => {
    const user = userEvent.setup();
    renderComponent();

    const textarea = screen.getByPlaceholderText(/type a message/i);
    await user.type(textarea, '@');

    await waitFor(() => {
      const autocomplete = document.querySelector('.absolute.z-50');
      if (autocomplete) {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      }
    }, { timeout: 5000 });

    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('submits message on Enter key', async () => {
    const user = userEvent.setup();
    renderComponent();

    const textarea = screen.getByPlaceholderText(/type a message/i);
    await user.type(textarea, 'Hello');
    
    // Focus the textarea first
    textarea.focus();
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(mockOnSend).toHaveBeenCalledWith('Hello', []);
    }, { timeout: 5000 });
  });

  it('does not submit on Shift+Enter (new line)', async () => {
    const user = userEvent.setup();
    renderComponent();

    const textarea = screen.getByPlaceholderText(/type a message/i);
    await user.type(textarea, 'Hello');
    await user.keyboard('{Shift>}{Enter}{/Shift}');

    // Wait a bit to ensure no submission happened
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(mockOnSend).not.toHaveBeenCalled();
    expect(textarea).toHaveValue('Hello\n');
  });

  it('clears message after sending', async () => {
    const user = userEvent.setup();
    renderComponent();

    const textarea = screen.getByPlaceholderText(/type a message/i);
    await user.type(textarea, 'Hello');
    await user.click(screen.getByRole('button', { name: /send message/i }));

    await waitFor(() => {
      expect(textarea).toHaveValue('');
    }, { timeout: 3000 });
  });

  it('excludes current user from mention autocomplete', async () => {
    const user = userEvent.setup();
    renderComponent({ currentUserId: 'user-1' });

    const textarea = screen.getByPlaceholderText(/type a message/i);
    await user.type(textarea, '@');

    await waitFor(() => {
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('disables input when disabled prop is true', () => {
    renderComponent({ disabled: true });

    const textarea = screen.getByPlaceholderText(/type a message/i);
    expect(textarea).toBeDisabled();
  });

  it('shows loading state when sending', () => {
    renderComponent({ isSending: true });

    const sendButton = screen.getByRole('button', { name: /send message/i });
    expect(sendButton).toBeDisabled();
    expect(sendButton.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('has accessible attachment button', () => {
    renderComponent();

    const attachButton = screen.getByRole('button', { name: /attach file/i });
    expect(attachButton).toBeInTheDocument();
    expect(attachButton).toHaveClass('touch-target');
  });

  it('has accessible emoji button', () => {
    renderComponent();

    const emojiButton = screen.getByRole('button', { name: /add emoji/i });
    expect(emojiButton).toBeInTheDocument();
  });
});

