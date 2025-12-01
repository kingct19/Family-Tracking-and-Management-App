import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskList, TaskFilter, TaskSort } from '@/features/tasks/components/TaskList';
import type { Task } from '@/types';

describe('TaskList', () => {
  const mockTasks: Task[] = [
    {
      id: 'task-1',
      hubId: 'hub-1',
      title: 'Task 1',
      description: 'Description 1',
      status: 'pending',
      weight: 10,
      createdAt: new Date('2024-01-01').toISOString(),
      deadline: new Date('2024-01-05').toISOString(),
      assignedTo: 'user-1',
      proofURL: null,
      createdBy: 'admin-1',
    },
    {
      id: 'task-2',
      hubId: 'hub-1',
      title: 'Task 2',
      description: 'Description 2',
      status: 'assigned',
      weight: 20,
      createdAt: new Date('2024-01-02').toISOString(),
      deadline: new Date('2024-01-06').toISOString(),
      assignedTo: 'user-2',
      proofURL: null,
      createdBy: 'admin-1',
    },
    {
      id: 'task-3',
      hubId: 'hub-1',
      title: 'Task 3',
      description: 'Description 3',
      status: 'done',
      weight: 15,
      createdAt: new Date('2024-01-03').toISOString(),
      deadline: new Date('2024-01-04').toISOString(),
      assignedTo: 'user-1',
      proofURL: null,
      createdBy: 'admin-1',
    },
  ];

  it('renders all tasks when filter is "all"', () => {
    render(<TaskList tasks={mockTasks} />);

    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
    expect(screen.getByText('Task 3')).toBeInTheDocument();
  });

  it('filters tasks by status', () => {
    render(<TaskList tasks={mockTasks} filter="pending" />);

    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.queryByText('Task 2')).not.toBeInTheDocument();
    expect(screen.queryByText('Task 3')).not.toBeInTheDocument();
  });

  it('sorts tasks by deadline', () => {
    render(<TaskList tasks={mockTasks} sortBy="deadline" />);

    const taskElements = screen.getAllByText(/Task \d/i);
    // Task 3 has earliest deadline (Jan 4), Task 1 (Jan 5), Task 2 (Jan 6)
    expect(taskElements[0]).toHaveTextContent('Task 3');
    expect(taskElements[1]).toHaveTextContent('Task 1');
    expect(taskElements[2]).toHaveTextContent('Task 2');
  });

  it('sorts tasks by weight', () => {
    render(<TaskList tasks={mockTasks} sortBy="weight" />);

    const taskElements = screen.getAllByText(/Task \d/i);
    // Task 2 has highest weight (20), Task 3 (15), Task 1 (10)
    expect(taskElements[0]).toHaveTextContent('Task 2');
    expect(taskElements[1]).toHaveTextContent('Task 3');
    expect(taskElements[2]).toHaveTextContent('Task 1');
  });

  it('sorts tasks by createdAt', () => {
    render(<TaskList tasks={mockTasks} sortBy="createdAt" />);

    const taskElements = screen.getAllByText(/Task \d/i);
    // Newest first: Task 3 (Jan 3), Task 2 (Jan 2), Task 1 (Jan 1)
    expect(taskElements[0]).toHaveTextContent('Task 3');
    expect(taskElements[1]).toHaveTextContent('Task 2');
    expect(taskElements[2]).toHaveTextContent('Task 1');
  });

  it('displays empty state when no tasks match filter', () => {
    render(<TaskList tasks={mockTasks} filter="submitted" />);

    expect(screen.getByText(/no tasks found/i)).toBeInTheDocument();
    expect(screen.getByText(/no submitted tasks at the moment/i)).toBeInTheDocument();
  });

  it('displays empty state message for all tasks', () => {
    render(<TaskList tasks={[]} />);

    expect(screen.getByText(/no tasks found/i)).toBeInTheDocument();
    expect(screen.getByText(/create a new task to get started/i)).toBeInTheDocument();
  });

  it('passes props to TaskCard components', () => {
    const onAccept = vi.fn();
    const onUpload = vi.fn();

    render(
      <TaskList
        tasks={mockTasks}
        currentUserId="user-1"
        onAccept={onAccept}
        onUpload={onUpload}
        isAdmin={true}
      />
    );

    // Verify TaskCards are rendered (they will have the task titles)
    expect(screen.getByText('Task 1')).toBeInTheDocument();
  });
});

describe('TaskFilter', () => {
  it('renders all filter options', () => {
    const onChange = vi.fn();
    render(<TaskFilter currentFilter="all" onChange={onChange} />);

    expect(screen.getByRole('button', { name: /all/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /pending/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /assigned/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submitted/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /done/i })).toBeInTheDocument();
  });

  it('calls onChange when filter is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TaskFilter currentFilter="all" onChange={onChange} />);

    const pendingButton = screen.getByRole('button', { name: /pending/i });
    await user.click(pendingButton);

    expect(onChange).toHaveBeenCalledWith('pending');
  });

  it('highlights current filter', () => {
    render(<TaskFilter currentFilter="pending" onChange={vi.fn()} />);

    const pendingButton = screen.getByRole('button', { name: /pending/i });
    expect(pendingButton).toHaveClass('bg-secondary-container', 'text-on-secondary-container');
  });

  it('displays counts when provided', () => {
    const counts = {
      all: 5,
      pending: 2,
      assigned: 1,
      submitted: 1,
      done: 1,
    };

    render(<TaskFilter currentFilter="all" onChange={vi.fn()} counts={counts} />);

    expect(screen.getByText('(5)')).toBeInTheDocument();
    expect(screen.getByText('(2)')).toBeInTheDocument();
  });

  it('has accessible focus states', () => {
    render(<TaskFilter currentFilter="all" onChange={vi.fn()} />);

    const allButton = screen.getByRole('button', { name: /all/i });
    expect(allButton).toHaveClass('focus:ring-2', 'focus:ring-primary');
  });
});

describe('TaskSort', () => {
  it('renders all sort options', () => {
    const onChange = vi.fn();
    render(<TaskSort currentSort="deadline" onChange={onChange} />);

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    expect(screen.getByText('Due date')).toBeInTheDocument();
    expect(screen.getByText('XP value')).toBeInTheDocument();
    expect(screen.getByText('Created date')).toBeInTheDocument();
  });

  it('calls onChange when sort option is selected', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TaskSort currentSort="deadline" onChange={onChange} />);

    const select = screen.getByRole('combobox');
    await user.selectOptions(select, 'weight');

    expect(onChange).toHaveBeenCalledWith('weight');
  });

  it('displays current sort value', () => {
    render(<TaskSort currentSort="weight" onChange={vi.fn()} />);

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('weight');
  });

  it('has accessible styling', () => {
    render(<TaskSort currentSort="deadline" onChange={vi.fn()} />);

    const select = screen.getByRole('combobox');
    expect(select).toHaveClass('focus:ring-2', 'focus:ring-primary', 'touch-target');
  });
});

