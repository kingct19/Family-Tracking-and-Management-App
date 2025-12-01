import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VaultItemCard } from '@/features/vault/components/VaultItemCard';
import { decryptVaultItem } from '@/features/vault/api/vault-api';
import { isVaultSessionValid } from '@/lib/services/vault-storage';
import toast from 'react-hot-toast';
import type { VaultItem } from '@/types';

// Mock dependencies
vi.mock('@/features/vault/api/vault-api');
vi.mock('@/lib/services/vault-storage');
vi.mock('react-hot-toast');

const mockDecryptVaultItem = vi.mocked(decryptVaultItem);
const mockIsVaultSessionValid = vi.mocked(isVaultSessionValid);
const mockToast = vi.mocked(toast);

// Mock clipboard API
const mockWriteText = vi.fn().mockResolvedValue(undefined);
Object.assign(navigator, {
  clipboard: {
    writeText: mockWriteText,
  },
});

describe('VaultItemCard', () => {
  const mockItem: VaultItem = {
    id: 'vault-1',
    hubId: 'hub-1',
    type: 'password',
    title: 'Test Password',
    encryptedContent: 'encrypted-content',
    metadata: {
      favorite: false,
      tags: [],
      fileURL: null,
      fileName: null,
      fileType: null,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    accessedAt: null,
  };

  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockIsVaultSessionValid.mockReturnValue(true);
    mockDecryptVaultItem.mockResolvedValue('decrypted-password');
  });

  it('renders vault item title', () => {
    render(
      <VaultItemCard
        item={mockItem}
        encryptionKey="test-key"
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Test Password')).toBeInTheDocument();
  });

  it('displays item type', () => {
    render(
      <VaultItemCard
        item={mockItem}
        encryptionKey="test-key"
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // Find the type label (capitalized) - there might be multiple, so use getAllByText
    const passwordTexts = screen.getAllByText(/password/i);
    expect(passwordTexts.length).toBeGreaterThan(0);
  });

  it('shows encrypted content placeholder', () => {
    render(
      <VaultItemCard
        item={mockItem}
        encryptionKey="test-key"
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText(/encrypted/i)).toBeInTheDocument();
    expect(screen.getByText(/••••••••••••/i)).toBeInTheDocument();
  });

  it('calls decryptVaultItem when reveal button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <VaultItemCard
        item={mockItem}
        encryptionKey="test-key"
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const revealButton = screen.getByRole('button', { name: /reveal/i });
    await user.click(revealButton);

    await waitFor(() => {
      expect(mockDecryptVaultItem).toHaveBeenCalledWith(mockItem, 'test-key');
    });
  });

  it('displays decrypted content after reveal', async () => {
    const user = userEvent.setup();
    render(
      <VaultItemCard
        item={mockItem}
        encryptionKey="test-key"
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const revealButton = screen.getByRole('button', { name: /reveal/i });
    await user.click(revealButton);

    await waitFor(() => {
      expect(screen.getByText('decrypted-password')).toBeInTheDocument();
    });
  });

  it('shows error toast when session is invalid', async () => {
    const user = userEvent.setup();
    mockIsVaultSessionValid.mockReturnValue(false);

    render(
      <VaultItemCard
        item={mockItem}
        encryptionKey="test-key"
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const revealButton = screen.getByRole('button', { name: /reveal/i });
    await user.click(revealButton);

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Session expired. Please unlock vault again.');
    });
  });

  it('calls onDelete when delete button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <VaultItemCard
        item={mockItem}
        encryptionKey="test-key"
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /delete item/i });
    await user.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith('vault-1');
  });

  it('calls onEdit when edit button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <VaultItemCard
        item={mockItem}
        encryptionKey="test-key"
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const editButton = screen.getByRole('button', { name: /edit item/i });
    await user.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockItem, '');
  });

  it('copies content to clipboard when copy button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <VaultItemCard
        item={mockItem}
        encryptionKey="test-key"
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // First reveal the content
    const revealButton = screen.getByRole('button', { name: /reveal/i });
    await user.click(revealButton);

    await waitFor(() => {
      expect(screen.getByText('decrypted-password')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Wait for state to update (decryptedContent to be set)
    await waitFor(() => {
      // Check that content is revealed
      const revealedContent = screen.getByText('decrypted-password');
      expect(revealedContent).toBeInTheDocument();
    }, { timeout: 2000 });

    // Then copy - the handleCopy function checks if decryptedContent exists
    const copyButton = screen.getByRole('button', { name: /copy content/i });
    await user.click(copyButton);

    // Wait for clipboard write - handleCopy is async and uses await
    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalled();
    }, { timeout: 3000 });
    
    // Verify it was called with the correct content
    expect(mockWriteText).toHaveBeenCalledWith('decrypted-password');
    
    // Toast is called after clipboard write
    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith('Copied to clipboard');
    }, { timeout: 2000 });
  });

  it('displays favorite star when item is favorited', () => {
    const favoritedItem: VaultItem = {
      ...mockItem,
      metadata: {
        ...mockItem.metadata,
        favorite: true,
      },
    };

    render(
      <VaultItemCard
        item={favoritedItem}
        encryptionKey="test-key"
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // Check that the title is present (star icon is next to it)
    expect(screen.getByText('Test Password')).toBeInTheDocument();
    // Star icon should be in the document (as SVG)
    const starIcon = document.querySelector('svg');
    expect(starIcon).toBeInTheDocument();
  });

  it('displays tags when present', () => {
    const itemWithTags: VaultItem = {
      ...mockItem,
      metadata: {
        ...mockItem.metadata,
        tags: ['work', 'important'],
      },
    };

    render(
      <VaultItemCard
        item={itemWithTags}
        encryptionKey="test-key"
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('work')).toBeInTheDocument();
    expect(screen.getByText('important')).toBeInTheDocument();
  });

  it('displays file attachment when fileURL is present', () => {
    const itemWithFile: VaultItem = {
      ...mockItem,
      metadata: {
        ...mockItem.metadata,
        fileURL: 'https://example.com/file.pdf',
        fileName: 'document.pdf',
        fileType: 'application/pdf',
      },
    };

    render(
      <VaultItemCard
        item={itemWithFile}
        encryptionKey="test-key"
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('document.pdf')).toBeInTheDocument();
    expect(screen.getByText(/pdf document/i)).toBeInTheDocument();
  });

  it('shows hide button when content is revealed', async () => {
    const user = userEvent.setup();
    render(
      <VaultItemCard
        item={mockItem}
        encryptionKey="test-key"
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const revealButton = screen.getByRole('button', { name: /reveal/i });
    await user.click(revealButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /hide/i })).toBeInTheDocument();
    });
  });

  it('has accessible action buttons', () => {
    render(
      <VaultItemCard
        item={mockItem}
        encryptionKey="test-key"
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByRole('button', { name: /edit item/i })).toHaveClass('touch-target');
    expect(screen.getByRole('button', { name: /delete item/i })).toHaveClass('touch-target');
  });
});

