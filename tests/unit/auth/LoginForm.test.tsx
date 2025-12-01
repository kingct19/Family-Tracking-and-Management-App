import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginForm } from '@/features/auth/components/LoginForm';
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

describe('LoginForm', () => {
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
          <LoginForm />
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  it('renders all form fields with proper labels', () => {
    renderComponent();

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /remember for 30 days/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('displays validation errors for invalid email', async () => {
    const user = userEvent.setup();
    renderComponent();

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'invalid-email');
    
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    await waitFor(() => {
      // Error is displayed via TextField error prop
      const errorMessage = screen.queryByText(/please enter a valid email address/i) ||
                          screen.queryByRole('alert') ||
                          document.querySelector('.text-error');
      expect(errorMessage).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('displays validation error for empty password', async () => {
    const user = userEvent.setup();
    renderComponent();

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'test@example.com');

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    await waitFor(() => {
      // Error is displayed via TextField error prop
      const errorMessage = screen.queryByText(/password is required/i) ||
                          screen.queryByRole('alert') ||
                          document.querySelector('.text-error');
      expect(errorMessage).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('calls login with correct form data on valid submission', async () => {
    const user = userEvent.setup();
    const mockLogin = vi.fn().mockResolvedValue({ success: true });
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      register: vi.fn(),
      login: mockLogin,
      logout: vi.fn(),
      joinHub: vi.fn(),
      isRegistering: false,
      isLoggingIn: false,
      isLoggingOut: false,
      isJoiningHub: false,
    });

    renderComponent();

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'Password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password123',
        rememberMe: false,
      });
    });
  });

  it('shows success toast on successful login', async () => {
    const user = userEvent.setup();
    const mockLogin = vi.fn().mockResolvedValue({ success: true });
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      register: vi.fn(),
      login: mockLogin,
      logout: vi.fn(),
      joinHub: vi.fn(),
      isRegistering: false,
      isLoggingIn: false,
      isLoggingOut: false,
      isJoiningHub: false,
    });

    renderComponent();

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'Password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith('Welcome back!');
    });
  });

  it('shows error toast on failed login', async () => {
    const user = userEvent.setup();
    const mockLogin = vi.fn().mockResolvedValue({ success: false, error: 'Invalid credentials' });
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      register: vi.fn(),
      login: mockLogin,
      logout: vi.fn(),
      joinHub: vi.fn(),
      isRegistering: false,
      isLoggingIn: false,
      isLoggingOut: false,
      isJoiningHub: false,
    });

    renderComponent();

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'Password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Invalid credentials');
    });
  });

  it('disables form fields when logging in', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      register: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
      joinHub: vi.fn(),
      isRegistering: false,
      isLoggingIn: true,
      isLoggingOut: false,
      isJoiningHub: false,
    });

    renderComponent();

    expect(screen.getByLabelText(/email/i)).toBeDisabled();
    expect(screen.getByLabelText(/password/i)).toBeDisabled();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeDisabled();
  });

  it('toggles remember me checkbox', async () => {
    const user = userEvent.setup();
    renderComponent();

    const checkbox = screen.getByRole('checkbox', { name: /remember for 30 days/i });
    expect(checkbox).not.toBeChecked();

    await user.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it('has accessible forgot password link', () => {
    renderComponent();

    const forgotPasswordLink = screen.getByRole('button', { name: /forgot password/i });
    expect(forgotPasswordLink).toBeInTheDocument();
    expect(forgotPasswordLink).toHaveClass('touch-target');
  });

  it('has accessible sign up link', () => {
    renderComponent();

    const signUpLink = screen.getByRole('button', { name: /sign up/i });
    expect(signUpLink).toBeInTheDocument();
    expect(signUpLink).toHaveClass('touch-target');
  });
});

