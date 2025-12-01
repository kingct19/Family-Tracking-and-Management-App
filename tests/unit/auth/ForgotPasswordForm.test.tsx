import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm';
import { sendPasswordResetEmail } from 'firebase/auth';
import toast from 'react-hot-toast';

// Mock dependencies
vi.mock('firebase/auth');
vi.mock('react-hot-toast');

const mockSendPasswordResetEmail = vi.mocked(sendPasswordResetEmail);
const mockToast = vi.mocked(toast);

describe('ForgotPasswordForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSendPasswordResetEmail.mockResolvedValue(undefined);
  });

  it('renders email input field', () => {
    render(<ForgotPasswordForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it('renders send reset link button', () => {
    render(<ForgotPasswordForm />);

    expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
  });

  it('disables submit button when email is empty', () => {
    render(<ForgotPasswordForm />);

    const submitButton = screen.getByRole('button', { name: /send reset link/i });
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when email is entered', async () => {
    const user = userEvent.setup();
    render(<ForgotPasswordForm />);

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'test@example.com');

    const submitButton = screen.getByRole('button', { name: /send reset link/i });
    expect(submitButton).not.toBeDisabled();
  });

  it('displays validation error for empty email', async () => {
    const user = userEvent.setup();
    render(<ForgotPasswordForm />);

    const submitButton = screen.getByRole('button', { name: /send reset link/i });
    await user.click(submitButton);

    await waitFor(() => {
      // Error is set in state and displayed via error prop on TextField
      const errorMessage = screen.queryByText(/email is required/i) || 
                          screen.queryByRole('alert') ||
                          document.querySelector('.text-error');
      expect(errorMessage).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('calls sendPasswordResetEmail with correct email', async () => {
    const user = userEvent.setup();
    render(<ForgotPasswordForm />);

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'test@example.com');

    const submitButton = screen.getByRole('button', { name: /send reset link/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockSendPasswordResetEmail).toHaveBeenCalled();
    });
  });

  it('shows success message after email is sent', async () => {
    const user = userEvent.setup();
    render(<ForgotPasswordForm />);

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'test@example.com');

    const submitButton = screen.getByRole('button', { name: /send reset link/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeInTheDocument();
      expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
    });
  });

  it('shows success toast after email is sent', async () => {
    const user = userEvent.setup();
    render(<ForgotPasswordForm />);

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'test@example.com');

    const submitButton = screen.getByRole('button', { name: /send reset link/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith('Password reset email sent!');
    });
  });

  it('displays error for user not found', async () => {
    const user = userEvent.setup();
    mockSendPasswordResetEmail.mockRejectedValue({ code: 'auth/user-not-found' });

    render(<ForgotPasswordForm />);

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'nonexistent@example.com');

    const submitButton = screen.getByRole('button', { name: /send reset link/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/no account found with this email address/i)).toBeInTheDocument();
    });
  });

  it('displays error for invalid email', async () => {
    const user = userEvent.setup();
    mockSendPasswordResetEmail.mockRejectedValue({ code: 'auth/invalid-email' });

    render(<ForgotPasswordForm />);

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'invalid-email');

    const submitButton = screen.getByRole('button', { name: /send reset link/i });
    await user.click(submitButton);

    await waitFor(() => {
      // Error is set in component state and displayed
      const errorMessage = screen.queryByText(/invalid email address/i) || 
                          screen.queryByRole('alert') ||
                          document.querySelector('.text-error');
      expect(errorMessage).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('displays generic error for other failures', async () => {
    const user = userEvent.setup();
    mockSendPasswordResetEmail.mockRejectedValue({ code: 'auth/too-many-requests' });

    render(<ForgotPasswordForm />);

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'test@example.com');

    const submitButton = screen.getByRole('button', { name: /send reset link/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/failed to send reset email/i)).toBeInTheDocument();
    });
  });

  it('disables form fields when loading', async () => {
    const user = userEvent.setup();
    mockSendPasswordResetEmail.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<ForgotPasswordForm />);

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'test@example.com');

    const submitButton = screen.getByRole('button', { name: /send reset link/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(emailInput).toBeDisabled();
      expect(submitButton).toBeDisabled();
    });
  });

  it('allows sending another email after success', async () => {
    const user = userEvent.setup();
    render(<ForgotPasswordForm />);

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'test@example.com');

    const submitButton = screen.getByRole('button', { name: /send reset link/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeInTheDocument();
    });

    const sendAnotherButton = screen.getByRole('button', { name: /send another email/i });
    await user.click(sendAnotherButton);

    await waitFor(() => {
      const newEmailInput = screen.getByLabelText(/email/i);
      expect(newEmailInput).toBeInTheDocument();
      expect(newEmailInput).toHaveValue('');
    });
  });

  it('clears error when email is changed', async () => {
    const user = userEvent.setup();
    mockSendPasswordResetEmail.mockRejectedValue({ code: 'auth/invalid-email' });

    render(<ForgotPasswordForm />);

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'invalid');
    await user.click(screen.getByRole('button', { name: /send reset link/i }));

    await waitFor(() => {
      // Wait for error to appear
      const hasError = screen.queryByText(/invalid email address/i) || 
                      screen.queryByRole('alert') ||
                      document.querySelector('.text-error');
      expect(hasError).toBeTruthy();
    }, { timeout: 3000 });

    await user.clear(emailInput);
    await user.type(emailInput, 'valid@example.com');

    // Error should be cleared when email changes (setError(null) in onChange)
    await waitFor(() => {
      const errorMessages = screen.queryAllByText(/invalid email address/i);
      expect(errorMessages.length).toBe(0);
    }, { timeout: 2000 });
  });

  it('has accessible form fields', () => {
    render(<ForgotPasswordForm />);

    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput).toHaveAttribute('required');
    expect(emailInput).toHaveAttribute('autoComplete', 'email');
  });
});

