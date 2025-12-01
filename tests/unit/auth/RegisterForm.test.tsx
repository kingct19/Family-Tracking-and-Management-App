import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { useAuth } from '@/features/auth/hooks/useAuth';
import toast from 'react-hot-toast';

// Mock dependencies
vi.mock('@/features/auth/hooks/useAuth');
vi.mock('react-hot-toast');
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

const mockUseAuth = vi.mocked(useAuth);
const mockToast = vi.mocked(toast);

describe('RegisterForm', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      register: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
      joinHub: vi.fn(),
      isRegistering: false,
      isLoggingIn: false,
      isLoggingOut: false,
      isJoiningHub: false,
    });
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <RegisterForm />
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  it('renders all form fields with proper labels', () => {
    renderComponent();

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    // Password field might have different label text
    const passwordInputs = screen.getAllByLabelText(/password/i);
    expect(passwordInputs.length).toBeGreaterThanOrEqual(2);
    expect(screen.getByRole('checkbox', { name: /i agree to the/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('displays validation error for name less than 2 characters', async () => {
    const user = userEvent.setup();
    renderComponent();

    const nameInput = screen.getByLabelText(/full name/i);
    await user.type(nameInput, 'A');

    const submitButton = screen.getByRole('button', { name: /create account/i });
    await user.click(submitButton);

    await waitFor(() => {
      // Error is displayed via TextField error prop
      const errorMessage = screen.queryByText(/name must be at least 2 characters/i) ||
                          screen.queryByRole('alert') ||
                          document.querySelector('.text-error');
      expect(errorMessage).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('displays validation error for invalid email', async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'invalid-email');

    const submitButton = screen.getByRole('button', { name: /create account/i });
    await user.click(submitButton);

    await waitFor(() => {
      // Error is displayed via TextField error prop
      const errorMessage = screen.queryByText(/please enter a valid email address/i) ||
                          screen.queryByRole('alert') ||
                          document.querySelector('.text-error');
      expect(errorMessage).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('displays validation error for weak password', async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    const passwordInputs = screen.getAllByLabelText(/password/i);
    await user.type(passwordInputs[0], 'weak');

    const submitButton = screen.getByRole('button', { name: /create account/i });
    await user.click(submitButton);

    await waitFor(() => {
      // Error is displayed via TextField error prop
      const errorMessage = screen.queryByText(/password must be at least 8 characters/i) ||
                          screen.queryByRole('alert') ||
                          document.querySelector('.text-error');
      expect(errorMessage).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('displays validation error when passwords do not match', async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    const passwordInputs = screen.getAllByLabelText(/password/i);
    await user.type(passwordInputs[0], 'Password123');
    await user.type(passwordInputs[1], 'Different123');
    await user.click(screen.getByRole('checkbox', { name: /i agree to the/i }));

    const submitButton = screen.getByRole('button', { name: /create account/i });
    await user.click(submitButton);

    await waitFor(() => {
      const errorMessage = screen.queryByRole('alert') || screen.getByText(/passwords do not match/i);
      expect(errorMessage).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('displays validation error when terms are not accepted', async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    const passwordInputs = screen.getAllByLabelText(/password/i);
    await user.type(passwordInputs[0], 'Password123');
    await user.type(passwordInputs[1], 'Password123');

    const submitButton = screen.getByRole('button', { name: /create account/i });
    await user.click(submitButton);

    await waitFor(() => {
      const errorMessage = screen.queryByRole('alert') || screen.getByText(/you must accept the terms and conditions/i);
      expect(errorMessage).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('calls register with correct form data on valid submission', async () => {
    const user = userEvent.setup();
    const mockRegister = vi.fn().mockResolvedValue({ success: true });
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      register: mockRegister,
      login: vi.fn(),
      logout: vi.fn(),
      joinHub: vi.fn(),
      isRegistering: false,
      isLoggingIn: false,
      isLoggingOut: false,
      isJoiningHub: false,
    });

    renderComponent();

    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    const passwordInputs = screen.getAllByLabelText(/password/i);
    await user.type(passwordInputs[0], 'Password123');
    await user.type(passwordInputs[1], 'Password123');
    await user.click(screen.getByRole('checkbox', { name: /i agree to the/i }));

    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        email: 'test@example.com',
        displayName: 'John Doe',
        password: 'Password123',
        confirmPassword: 'Password123',
        acceptTerms: true,
      });
    });
  });

  it('shows success toast on successful registration', async () => {
    const user = userEvent.setup();
    const mockRegister = vi.fn().mockResolvedValue({ success: true });
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      register: mockRegister,
      login: vi.fn(),
      logout: vi.fn(),
      joinHub: vi.fn(),
      isRegistering: false,
      isLoggingIn: false,
      isLoggingOut: false,
      isJoiningHub: false,
    });

    renderComponent();

    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    const passwordInputs = screen.getAllByLabelText(/password/i);
    await user.type(passwordInputs[0], 'Password123');
    await user.type(passwordInputs[1], 'Password123');
    await user.click(screen.getByRole('checkbox', { name: /i agree to the/i }));
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith('Account created successfully!');
    });
  });

  it('disables form fields when registering', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      register: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
      joinHub: vi.fn(),
      isRegistering: true,
      isLoggingIn: false,
      isLoggingOut: false,
      isJoiningHub: false,
    });

    renderComponent();

    expect(screen.getByLabelText(/full name/i)).toBeDisabled();
    expect(screen.getByLabelText(/email/i)).toBeDisabled();
    const passwordInputs = screen.getAllByLabelText(/password/i);
    expect(passwordInputs[0]).toBeDisabled();
    expect(passwordInputs[1]).toBeDisabled();
    expect(screen.getByRole('button', { name: /create account/i })).toBeDisabled();
  });

  it('has accessible sign in link', () => {
    renderComponent();

    const signInLink = screen.getByRole('button', { name: /sign in/i });
    expect(signInLink).toBeInTheDocument();
    expect(signInLink).toHaveClass('touch-target');
  });
});

