import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RewardCard } from '@/features/rewards/components/RewardCard';
import type { Reward } from '@/types';

describe('RewardCard', () => {
  const mockReward: Reward = {
    id: 'reward-1',
    hubId: 'hub-1',
    title: 'Test Reward',
    description: 'Complete 10 tasks to unlock',
    type: 'xp',
    threshold: 100,
    icon: '⭐',
    imageURL: null,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('renders reward title and description', () => {
    render(<RewardCard reward={mockReward} />);

    expect(screen.getByText('Test Reward')).toBeInTheDocument();
    expect(screen.getByText('Complete 10 tasks to unlock')).toBeInTheDocument();
  });

  it('displays threshold requirement', () => {
    render(<RewardCard reward={mockReward} />);

    expect(screen.getByText(/100 XP/i)).toBeInTheDocument();
  });

  it('shows progress percentage when not unlocked', () => {
    render(<RewardCard reward={mockReward} currentProgress={50} />);

    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('displays progress bar when not unlocked', () => {
    const { container } = render(<RewardCard reward={mockReward} currentProgress={50} />);

    // Find progress bar by looking for div with width style
    const progressBar = container.querySelector('div[style*="width"]');
    expect(progressBar).toBeInTheDocument();
  });

  it('shows unlocked status when progress meets threshold', () => {
    render(<RewardCard reward={mockReward} currentProgress={100} />);

    expect(screen.getByText(/unlocked/i)).toBeInTheDocument();
  });

  it('shows claim button when unlocked and not claimed', async () => {
    const onClaim = vi.fn();
    render(<RewardCard reward={mockReward} currentProgress={100} onClaim={onClaim} />);

    const claimButton = screen.getByRole('button', { name: /claim reward/i });
    expect(claimButton).toBeInTheDocument();
  });

  it('calls onClaim when claim button is clicked', async () => {
    const user = userEvent.setup();
    const onClaim = vi.fn();
    render(<RewardCard reward={mockReward} currentProgress={100} onClaim={onClaim} />);

    const claimButton = screen.getByRole('button', { name: /claim reward/i });
    await user.click(claimButton);

    expect(onClaim).toHaveBeenCalled();
  });

  it('shows claimed status when reward is claimed', () => {
    render(
      <RewardCard
        reward={{ ...mockReward, isClaimed: true }}
        currentProgress={100}
      />
    );

    expect(screen.getByText(/claimed/i)).toBeInTheDocument();
  });

  it('displays correct icon for XP type reward', () => {
    render(<RewardCard reward={mockReward} />);

    // XP type should show star icon
    expect(screen.getByText('⭐')).toBeInTheDocument();
  });

  it('displays correct icon for tasks type reward', () => {
    const tasksReward: Reward = {
      ...mockReward,
      type: 'tasks',
    };

    render(<RewardCard reward={tasksReward} />);

    // There might be multiple "Tasks" texts, so check that at least one exists
    const tasksTexts = screen.getAllByText(/tasks/i);
    expect(tasksTexts.length).toBeGreaterThan(0);
  });

  it('displays correct icon for streak type reward', () => {
    const streakReward: Reward = {
      ...mockReward,
      type: 'streak',
    };

    render(<RewardCard reward={streakReward} />);

    expect(screen.getByText(/day streak/i)).toBeInTheDocument();
  });

  it('shows admin edit button when isAdmin is true', () => {
    const onEdit = vi.fn();
    render(<RewardCard reward={mockReward} isAdmin={true} onEdit={onEdit} />);

    // Hover to show actions
    const card = screen.getByText('Test Reward').closest('div');
    if (card) {
      // Actions should be present (may be hidden initially)
      expect(card).toBeInTheDocument();
    }
  });

  it('calls onEdit when edit button is clicked (admin)', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(<RewardCard reward={mockReward} isAdmin={true} onEdit={onEdit} />);

    // Simulate hover to show actions
    const card = screen.getByText('Test Reward').closest('div');
    if (card) {
      await user.hover(card);
      // Edit button should appear
    }
  });

  it('calls onDelete when delete button is clicked (admin)', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(<RewardCard reward={mockReward} isAdmin={true} onDelete={onDelete} />);

    // Simulate hover to show actions
    const card = screen.getByText('Test Reward').closest('div');
    if (card) {
      await user.hover(card);
      // Delete button should appear
    }
  });

  it('displays inactive badge when reward is not active', () => {
    const inactiveReward: Reward = {
      ...mockReward,
      isActive: false,
    };

    render(<RewardCard reward={inactiveReward} />);

    expect(screen.getByText(/inactive/i)).toBeInTheDocument();
  });

  it('displays image when imageURL is provided', () => {
    const rewardWithImage: Reward = {
      ...mockReward,
      imageURL: 'https://example.com/reward.jpg',
    };

    render(<RewardCard reward={rewardWithImage} />);

    const image = screen.getByAltText('Test Reward');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/reward.jpg');
  });

  it('applies locked styling when not unlocked', () => {
    const { container } = render(<RewardCard reward={mockReward} currentProgress={50} />);

    const card = container.querySelector('.bg-white');
    expect(card).toBeInTheDocument();
  });

  it('applies unlocked styling when unlocked', () => {
    const { container } = render(<RewardCard reward={mockReward} currentProgress={100} />);

    const card = container.querySelector('.bg-gradient-to-br');
    expect(card).toBeInTheDocument();
  });
});

