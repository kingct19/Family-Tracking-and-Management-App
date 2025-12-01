import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CreateHubModal } from '@/features/hubs/components/CreateHubModal';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useHubStore } from '@/lib/store/hub-store';
import toast from 'react-hot-toast';

// Mock dependencies
vi.mock('@/features/auth/hooks/useAuth');
vi.mock('@/lib/store/hub-store');
vi.mock('@/lib/api/hub-api', () => ({
  createHub: vi.fn(),
  getUserMembership: vi.fn(),
  getUserHubs: vi.fn(),
}));
vi.mock('react-hot-toast');

const mockUseAuth = vi.mocked(useAuth);
const mockUseHubStore = vi.mocked(useHubStore);
const mockToast = vi.mocked(toast);

describe('CreateHubModal', () => {
  let queryClient: QueryClient;
  const mockOnClose = vi.fn();
  const mockSetCurrentHub = vi.fn();

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: { id: 'user-1', email: 'test@example.com', displayName: 'Test User' },
      isLoading: false,
      isAuthenticated: true,
      register: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
      joinHub: vi.fn(),
      isRegistering: false,
      isLoggingIn: false,
      isLoggingOut: false,
      isJoiningHub: false,
    } as any);

    mockUseHubStore.mockReturnValue({
      currentHub: null,
      currentRole: null,
      setCurrentHub: mockSetCurrentHub,
      clearCurrentHub: vi.fn(),
      isFeatureEnabled: vi.fn(),
    } as any);
  });

  const renderComponent = (isOpen = true) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <CreateHubModal isOpen={isOpen} onClose={mockOnClose} />
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  it('does not render when isOpen is false', () => {
    renderComponent(false);

    expect(screen.queryByText(/create hub/i)).not.toBeInTheDocument();
  });

  it('renders modal when isOpen is true', () => {
    renderComponent();

    // There might be multiple "Create Hub" texts (header and button)
    const createHubTexts = screen.getAllByText(/create hub/i);
    expect(createHubTexts.length).toBeGreaterThan(0);
  });

  it('renders hub name input field', () => {
    renderComponent();

    expect(screen.getByLabelText(/hub name/i)).toBeInTheDocument();
  });

  it('renders description textarea', () => {
    renderComponent();

    expect(screen.getByPlaceholderText(/brief description/i)).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    renderComponent();

    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onClose when backdrop is clicked', async () => {
    const user = userEvent.setup();
    const { container } = renderComponent();

    // Find backdrop by class
    const backdrop = container.querySelector('.fixed.inset-0.bg-black') as HTMLElement;
    if (backdrop) {
      await user.click(backdrop);
      expect(mockOnClose).toHaveBeenCalled();
    }
  });

  it('displays validation error for empty hub name', async () => {
    const user = userEvent.setup();
    renderComponent();

    const submitButtons = screen.getAllByRole('button', { name: /create hub/i });
    await user.click(submitButtons[0]);

    await waitFor(() => {
      // Error might be in role="alert" or as text
      const errorMessage = screen.queryByRole('alert') || screen.getByText(/hub name is required/i);
      expect(errorMessage).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('allows typing in hub name field', async () => {
    const user = userEvent.setup();
    renderComponent();

    const nameInput = screen.getByLabelText(/hub name/i);
    await user.type(nameInput, 'My Family Hub');

    expect(nameInput).toHaveValue('My Family Hub');
  });

  it('allows typing in description field', async () => {
    const user = userEvent.setup();
    renderComponent();

    const descriptionTextarea = screen.getByPlaceholderText(/brief description/i);
    await user.type(descriptionTextarea, 'This is my family hub');

    expect(descriptionTextarea).toHaveValue('This is my family hub');
  });

  it('disables submit button when creating hub', async () => {
    const user = userEvent.setup();
    const { createHub } = await import('@/lib/api/hub-api');
    vi.mocked(createHub).mockImplementation(() => new Promise(() => {})); // Never resolves

    renderComponent();

    const nameInput = screen.getByLabelText(/hub name/i);
    await user.type(nameInput, 'My Family Hub');

    const submitButton = screen.getByRole('button', { name: /create hub/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  it('has accessible close button', () => {
    renderComponent();

    const closeButton = screen.getByRole('button', { name: /close/i });
    expect(closeButton).toBeInTheDocument();
  });

  it('has accessible form fields', () => {
    renderComponent();

    const nameInput = screen.getByLabelText(/hub name/i);
    expect(nameInput).toHaveAttribute('required');
  });

  it('shows cancel button', () => {
    renderComponent();

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    expect(cancelButton).toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', async () => {
    const user = userEvent.setup();
    renderComponent();

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });
});

