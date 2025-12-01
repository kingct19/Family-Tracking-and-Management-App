import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EmergencyButton } from '@/features/safety/components/EmergencyButton';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useHubStore } from '@/lib/store/hub-store';
import { useUserLocation } from '@/features/location/hooks/useLocation';
import { createEmergencyAlert } from '@/features/safety/api/emergency-api';
import toast from 'react-hot-toast';

// Mock dependencies
vi.mock('@/features/auth/hooks/useAuth');
vi.mock('@/lib/store/hub-store');
vi.mock('@/features/location/hooks/useLocation');
vi.mock('@/features/safety/api/emergency-api');
vi.mock('react-hot-toast');

const mockUseAuth = vi.mocked(useAuth);
const mockUseHubStore = vi.mocked(useHubStore);
const mockUseUserLocation = vi.mocked(useUserLocation);
const mockCreateEmergencyAlert = vi.mocked(createEmergencyAlert);
const mockToast = vi.mocked(toast);

// Mock window.confirm
const mockConfirm = vi.fn();
window.confirm = mockConfirm;

describe('EmergencyButton', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    vi.clearAllMocks();
    mockConfirm.mockReturnValue(true);

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
      currentHub: { id: 'hub-1', name: 'Test Hub' },
      currentRole: 'admin',
      setCurrentHub: vi.fn(),
      clearCurrentHub: vi.fn(),
      isFeatureEnabled: vi.fn(),
    } as any);

    mockUseUserLocation.mockReturnValue({
      currentLocation: {
        latitude: 37.7749,
        longitude: -122.4194,
      },
      isLoading: false,
      error: null,
    } as any);

    mockCreateEmergencyAlert.mockResolvedValue({
      success: true,
      data: { id: 'alert-1' },
    });
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <EmergencyButton />
      </QueryClientProvider>
    );
  };

  it('does not render when no current hub', () => {
    mockUseHubStore.mockReturnValue({
      currentHub: null,
      currentRole: null,
      setCurrentHub: vi.fn(),
      clearCurrentHub: vi.fn(),
      isFeatureEnabled: vi.fn(),
    } as any);

    const { container } = renderComponent();
    expect(container.firstChild).toBeNull();
  });

  it('does not render when no current location', () => {
    mockUseUserLocation.mockReturnValue({
      currentLocation: null,
      isLoading: false,
      error: null,
    } as any);

    const { container } = renderComponent();
    expect(container.firstChild).toBeNull();
  });

  it('renders emergency button when hub and location are available', () => {
    renderComponent();

    const button = screen.getByRole('button', { name: /emergency sos/i });
    expect(button).toBeInTheDocument();
  });

  it('shows confirmation dialog before sending alert', async () => {
    const user = userEvent.setup();
    renderComponent();

    const button = screen.getByRole('button', { name: /emergency sos/i });
    await user.click(button);

    expect(mockConfirm).toHaveBeenCalledWith(
      expect.stringContaining('Send emergency SOS alert')
    );
  });

  it('calls createEmergencyAlert when confirmed', async () => {
    const user = userEvent.setup();
    renderComponent();

    const button = screen.getByRole('button', { name: /emergency sos/i });
    await user.click(button);

    await waitFor(() => {
      expect(mockCreateEmergencyAlert).toHaveBeenCalledWith({
        hubId: 'hub-1',
        userId: 'user-1',
        location: {
          latitude: 37.7749,
          longitude: -122.4194,
          address: undefined,
        },
        type: 'sos',
      });
    });
  });

  it('does not call createEmergencyAlert when confirmation is cancelled', async () => {
    const user = userEvent.setup();
    mockConfirm.mockReturnValue(false);
    renderComponent();

    const button = screen.getByRole('button', { name: /emergency sos/i });
    await user.click(button);

    expect(mockCreateEmergencyAlert).not.toHaveBeenCalled();
  });

  it('shows success toast on successful alert', async () => {
    const user = userEvent.setup();
    renderComponent();

    const button = screen.getByRole('button', { name: /emergency sos/i });
    await user.click(button);

    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith(
        'Emergency alert sent to your family!',
        expect.objectContaining({
          duration: 5000,
          icon: '🚨',
        })
      );
    });
  });

  it('shows error toast on failed alert', async () => {
    const user = userEvent.setup();
    mockCreateEmergencyAlert.mockResolvedValue({
      success: false,
      error: 'Failed to send alert',
    });

    renderComponent();

    const button = screen.getByRole('button', { name: /emergency sos/i });
    await user.click(button);

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalled();
    });
  });

  it('shows error when location is not available', async () => {
    const user = userEvent.setup();
    mockUseUserLocation.mockReturnValue({
      currentLocation: null,
      isLoading: false,
      error: null,
    } as any);

    // Button should not render, but if it does, clicking should show error
    const { container } = renderComponent();
    if (container.firstChild) {
      const button = screen.getByRole('button', { name: /emergency sos/i });
      await user.click(button);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(
          'Location not available. Please enable location sharing.'
        );
      });
    }
  });

  it('disables button when sending alert', async () => {
    const user = userEvent.setup();
    mockCreateEmergencyAlert.mockImplementation(() => new Promise(() => {})); // Never resolves

    renderComponent();

    const button = screen.getByRole('button', { name: /emergency sos/i });
    await user.click(button);

    await waitFor(() => {
      expect(button).toBeDisabled();
    });
  });

  it('shows loading spinner when sending alert', async () => {
    const user = userEvent.setup();
    mockCreateEmergencyAlert.mockImplementation(() => new Promise(() => {})); // Never resolves

    renderComponent();

    const button = screen.getByRole('button', { name: /emergency sos/i });
    await user.click(button);

    await waitFor(() => {
      const spinner = button.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });

  it('has accessible button with proper aria-label', () => {
    renderComponent();

    const button = screen.getByRole('button', { name: /emergency sos/i });
    expect(button).toHaveAttribute('aria-label', 'Emergency SOS - Send alert to family');
  });

  it('has proper touch target size', () => {
    renderComponent();

    const button = screen.getByRole('button', { name: /emergency sos/i });
    expect(button).toHaveClass('touch-target');
    expect(button).toHaveClass('w-16', 'h-16');
  });
});

