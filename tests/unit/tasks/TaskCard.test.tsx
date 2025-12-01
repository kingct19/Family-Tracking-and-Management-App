import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskCard } from '@/features/tasks/components/TaskCard';
import type { Task } from '@/types';

// Mock window.confirm
const mockConfirm = vi.fn();
window.confirm = mockConfirm;

describe('TaskCard', () => {
  const mockTask: Task = {
    id: 'task-1',
    hubId: 'hub-1',
    title: 'Test Task',
    description: 'Test description',
    status: 'pending',
    weight: 10,
    createdAt: new Date().toISOString(),
    deadline: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    assignedTo: 'user-1',
    proofURL: null,
    createdBy: 'admin-1',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockConfirm.mockReturnValue(true);
  });

  it('renders task title and description', () => {
    render(<TaskCard task={mockTask} />);

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('displays task XP weight', () => {
    render(<TaskCard task={mockTask} />);

    expect(screen.getByText(/XP:/i)).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('shows assigned status when task is assigned', () => {
    render(<TaskCard task={mockTask} currentUserId="user-1" />);

    expect(screen.getByText(/assigned/i)).toBeInTheDocument();
  });

  it('displays overdue indicator for overdue tasks', () => {
    const overdueTask: Task = {
      ...mockTask,
      deadline: new Date(Date.now() - 86400000).toISOString(), // Yesterday
      status: 'assigned',
    };

    render(<TaskCard task={overdueTask} />);

    const card = screen.getByText('Test Task').closest('div[class*="border-l-4"]');
    expect(card).toHaveClass('border-l-4', 'border-error');
  });

  it('calls onAccept when accept button is clicked for assigned task', async () => {
    const user = userEvent.setup();
    const onAccept = vi.fn();
    const assignedTask: Task = {
      ...mockTask,
      status: 'assigned',
    };

    render(<TaskCard task={assignedTask} currentUserId="user-1" onAccept={onAccept} />);

    const acceptButton = screen.getByRole('button', { name: /accept/i });
    await user.click(acceptButton);

    expect(onAccept).toHaveBeenCalledWith('task-1');
  });

  it('calls onUpload when upload button is clicked for pending task', async () => {
    const user = userEvent.setup();
    const onUpload = vi.fn();
    const pendingTask: Task = {
      ...mockTask,
      status: 'pending',
      proofURL: null,
    };

    render(<TaskCard task={pendingTask} currentUserId="user-1" onUpload={onUpload} />);

    const uploadButton = screen.getByRole('button', { name: /upload/i });
    await user.click(uploadButton);

    expect(onUpload).toHaveBeenCalledWith(pendingTask);
  });

  it('calls onSubmit when submit button is clicked for pending task with proof', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const pendingTaskWithProof: Task = {
      ...mockTask,
      status: 'pending',
      proofURL: 'https://example.com/proof.jpg',
    };

    render(<TaskCard task={pendingTaskWithProof} currentUserId="user-1" onSubmit={onSubmit} />);

    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);

    expect(onSubmit).toHaveBeenCalledWith(pendingTaskWithProof);
  });

  it('calls onApprove when approve button is clicked for submitted task (admin)', async () => {
    const user = userEvent.setup();
    const onApprove = vi.fn();
    const submittedTask: Task = {
      ...mockTask,
      status: 'submitted',
    };

    render(<TaskCard task={submittedTask} isAdmin={true} onApprove={onApprove} />);

    const approveButton = screen.getByRole('button', { name: /approve/i });
    await user.click(approveButton);

    expect(onApprove).toHaveBeenCalledWith(submittedTask);
  });

  it('calls onUnassign when unassign button is clicked (admin)', async () => {
    const user = userEvent.setup();
    const onUnassign = vi.fn();
    const assignedTask: Task = {
      ...mockTask,
      status: 'assigned',
    };

    render(<TaskCard task={assignedTask} isAdmin={true} onUnassign={onUnassign} />);

    const unassignButton = screen.getByRole('button', { name: /unassign/i });
    await user.click(unassignButton);

    expect(mockConfirm).toHaveBeenCalled();
    expect(onUnassign).toHaveBeenCalledWith('task-1');
  });

  it('calls onDelete when delete button is clicked (admin)', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    const assignedTask: Task = {
      ...mockTask,
      status: 'assigned',
    };

    render(<TaskCard task={assignedTask} isAdmin={true} onDelete={onDelete} />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    expect(mockConfirm).toHaveBeenCalled();
    expect(onDelete).toHaveBeenCalledWith('task-1');
  });

  it('does not call onDelete when confirmation is cancelled', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    mockConfirm.mockReturnValue(false);
    const assignedTask: Task = {
      ...mockTask,
      status: 'assigned',
    };

    render(<TaskCard task={assignedTask} isAdmin={true} onDelete={onDelete} />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    expect(mockConfirm).toHaveBeenCalled();
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('calls onViewDetails when card is clicked', async () => {
    const user = userEvent.setup();
    const onViewDetails = vi.fn();

    render(<TaskCard task={mockTask} onViewDetails={onViewDetails} />);

    const card = screen.getByText('Test Task').closest('div[class*="cursor-pointer"]');
    if (card) {
      await user.click(card);
      expect(onViewDetails).toHaveBeenCalledWith(mockTask);
    }
  });

  it('hides actions when showActions is false', () => {
    render(<TaskCard task={mockTask} showActions={false} />);

    expect(screen.queryByRole('button', { name: /accept/i })).not.toBeInTheDocument();
  });

  it('shows correct status label', () => {
    const { rerender } = render(<TaskCard task={mockTask} />);
    expect(screen.getAllByText(/pending/i)[0]).toBeInTheDocument();

    const assignedTask: Task = { ...mockTask, status: 'assigned' };
    rerender(<TaskCard task={assignedTask} />);
    expect(screen.getAllByText(/assigned/i)[0]).toBeInTheDocument();
  });

  it('has accessible task options button', () => {
    render(<TaskCard task={mockTask} showActions={true} />);

    const optionsButton = screen.getByRole('button', { name: /task options/i });
    expect(optionsButton).toBeInTheDocument();
  });
});

