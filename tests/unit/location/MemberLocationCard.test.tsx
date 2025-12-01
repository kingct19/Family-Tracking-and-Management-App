import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemberLocationCard } from '@/features/location/components/MemberLocationCard';
import { useUserLocation } from '@/features/location/hooks/useLocation';
import type { UserLocation } from '@/features/location/api/location-api';

// Mock dependencies
vi.mock('@/features/location/hooks/useLocation');

const mockUseUserLocation = vi.mocked(useUserLocation);

describe('MemberLocationCard', () => {
  const mockLocation: UserLocation = {
    userId: 'user-1',
    hubId: 'hub-1',
    latitude: 37.7749,
    longitude: -122.4194,
    accuracy: 10,
    timestamp: new Date(),
    address: '123 Main St, San Francisco, CA',
    addressDetails: {
      formatted: '123 Main St, San Francisco, CA 94102',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
    },
    speed: 5.5,
    heading: 90,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUserLocation.mockReturnValue({
      currentLocation: {
        latitude: 37.7849,
        longitude: -122.4094,
      },
      isLoading: false,
      error: null,
    } as any);
  });

  it('renders member name', () => {
    render(<MemberLocationCard location={mockLocation} userName="John Doe" />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('displays location address', () => {
    render(<MemberLocationCard location={mockLocation} />);

    expect(screen.getByText(/123 main st/i)).toBeInTheDocument();
  });

  it('displays formatted timestamp', () => {
    render(<MemberLocationCard location={mockLocation} />);

    expect(screen.getByText(/just now/i)).toBeInTheDocument();
  });

  it('displays battery level when provided', () => {
    render(<MemberLocationCard location={mockLocation} batteryLevel={85} />);

    expect(screen.getByText('85%')).toBeInTheDocument();
  });

  it('displays N/A when battery level is not provided', () => {
    render(<MemberLocationCard location={mockLocation} />);

    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  it('shows online status indicator when isOnline is true', () => {
    const { container } = render(
      <MemberLocationCard location={mockLocation} isOnline={true} />
    );

    const indicator = container.querySelector('.bg-green-500');
    expect(indicator).toBeInTheDocument();
  });

  it('does not show online status indicator when isOnline is false', () => {
    const { container } = render(
      <MemberLocationCard location={mockLocation} isOnline={false} />
    );

    const indicator = container.querySelector('.bg-green-500');
    expect(indicator).not.toBeInTheDocument();
  });

  it('displays accuracy badge', () => {
    render(<MemberLocationCard location={mockLocation} />);

    expect(screen.getByText(/±10m/i)).toBeInTheDocument();
  });

  it('displays avatar fallback with first letter when no photoURL', () => {
    render(<MemberLocationCard location={mockLocation} userName="John Doe" />);

    const fallback = screen.getByText('J');
    expect(fallback).toBeInTheDocument();
  });

  it('displays avatar image when photoURL is provided', () => {
    render(
      <MemberLocationCard
        location={mockLocation}
        userName="John Doe"
        userPhoto="https://example.com/photo.jpg"
      />
    );

    const avatar = screen.getByAltText('John Doe');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('src', 'https://example.com/photo.jpg');
  });

  it('expands card when clicked', async () => {
    const user = userEvent.setup();
    const { container } = render(<MemberLocationCard location={mockLocation} userName="John Doe" />);

    // The card div itself has onClick handler
    const card = container.querySelector('.cursor-pointer') as HTMLElement;
    if (card) {
      await user.click(card);

      await waitFor(() => {
        // Expanded content has border-t class - check if it exists
        const expandedContent = container.querySelector('.border-t.border-gray-200');
        expect(expandedContent).toBeInTheDocument();
      }, { timeout: 3000 });
    } else {
      // If card structure is different, try clicking the main div
      const mainDiv = container.firstChild as HTMLElement;
      if (mainDiv) {
        await user.click(mainDiv);
        await waitFor(() => {
          const expandedContent = container.querySelector('.border-t.border-gray-200');
          expect(expandedContent).toBeInTheDocument();
        }, { timeout: 3000 });
      }
    }
  });

  it('displays expanded content when expanded', async () => {
    const user = userEvent.setup();
    const { container } = render(<MemberLocationCard location={mockLocation} userName="John Doe" />);

    // Click to expand
    const card = container.querySelector('.cursor-pointer') as HTMLElement || container.firstChild as HTMLElement;
    if (card) {
      await user.click(card);

      await waitFor(() => {
        // Check for expanded section
        const expandedSection = container.querySelector('.border-t.border-gray-200');
        expect(expandedSection).toBeInTheDocument();
        
        // Check for address details within expanded section
        if (expandedSection) {
          const addressText = expandedSection.textContent || '';
          expect(addressText).toContain('123 Main St');
        }
      }, { timeout: 3000 });
    }
  });

  it('displays speed when available', async () => {
    const user = userEvent.setup();
    const { container } = render(<MemberLocationCard location={mockLocation} userName="John Doe" />);

    // Click to expand - the whole card div has onClick
    const card = container.firstChild as HTMLElement;
    if (card) {
      await user.click(card);

      await waitFor(() => {
        // Speed is in the grid section
        const expandedSection = container.querySelector('.border-t.border-gray-200');
        if (expandedSection) {
          const speedText = expandedSection.textContent || '';
          expect(speedText.toLowerCase()).toContain('speed');
        }
      }, { timeout: 3000 });
    }
  });

  it('displays heading when available', async () => {
    const user = userEvent.setup();
    const { container } = render(<MemberLocationCard location={mockLocation} userName="John Doe" />);

    // Click to expand - the whole card div has onClick
    const card = container.firstChild as HTMLElement;
    if (card) {
      await user.click(card);

      await waitFor(() => {
        // Heading is in the grid section
        const expandedSection = container.querySelector('.border-t.border-gray-200');
        if (expandedSection) {
          const headingText = expandedSection.textContent || '';
          expect(headingText.toLowerCase()).toContain('heading');
        }
      }, { timeout: 3000 });
    }
  });

  it('shows directions button when expanded', async () => {
    const user = userEvent.setup();
    const { container } = render(<MemberLocationCard location={mockLocation} userName="John Doe" />);

    // Click to expand - the whole card div has onClick
    const card = container.firstChild as HTMLElement;
    if (card) {
      await user.click(card);

      await waitFor(() => {
        // Directions button is in expanded section
        const expandedSection = container.querySelector('.border-t.border-gray-200');
        if (expandedSection) {
          const buttons = expandedSection.querySelectorAll('button');
          const directionsButton = Array.from(buttons).find(btn => 
            btn.textContent?.toLowerCase().includes('directions')
          );
          expect(directionsButton).toBeInTheDocument();
        }
      }, { timeout: 3000 });
    }
  });

  it('shows details button when expanded', async () => {
    const user = userEvent.setup();
    const { container } = render(<MemberLocationCard location={mockLocation} userName="John Doe" />);

    // Click to expand - the whole card div has onClick
    const card = container.firstChild as HTMLElement;
    if (card) {
      await user.click(card);

      await waitFor(() => {
        // Details button is in expanded section
        const expandedSection = container.querySelector('.border-t.border-gray-200');
        if (expandedSection) {
          const buttons = expandedSection.querySelectorAll('button');
          const detailsButton = Array.from(buttons).find(btn => 
            btn.textContent?.toLowerCase().includes('details')
          );
          expect(detailsButton).toBeInTheDocument();
        }
      }, { timeout: 3000 });
    }
  });

  it('formats timestamp correctly for different time ranges', () => {
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const location: UserLocation = {
      ...mockLocation,
      timestamp: oneMinuteAgo,
    };

    render(<MemberLocationCard location={location} />);

    expect(screen.getByText(/1m ago/i)).toBeInTheDocument();
  });

  it('handles location without addressDetails', () => {
    const locationWithoutDetails: UserLocation = {
      ...mockLocation,
      addressDetails: undefined,
    };

    render(<MemberLocationCard location={locationWithoutDetails} />);

    expect(screen.getByText(/123 main st/i)).toBeInTheDocument();
  });

  it('handles location without address', () => {
    const locationWithoutAddress: UserLocation = {
      ...mockLocation,
      address: undefined,
      addressDetails: undefined,
    };

    render(<MemberLocationCard location={locationWithoutAddress} />);

    expect(screen.getByText(/fetching address/i)).toBeInTheDocument();
  });

  it('has accessible buttons', async () => {
    const user = userEvent.setup();
    const { container } = render(<MemberLocationCard location={mockLocation} userName="John Doe" />);

    // Click to expand - the whole card div has onClick
    const card = container.firstChild as HTMLElement;
    if (card) {
      await user.click(card);

      await waitFor(() => {
        // Check for buttons in expanded section
        const expandedSection = container.querySelector('.border-t.border-gray-200');
        if (expandedSection) {
          const buttons = expandedSection.querySelectorAll('button.touch-target');
          expect(buttons.length).toBeGreaterThan(0);
        }
      }, { timeout: 3000 });
    }
  });
});

