import { z } from 'zod';

// Task creation schema
export const createTaskSchema = z.object({
  title: z
    .string()
    .min(3, 'Task title must be at least 3 characters')
    .max(100, 'Task title is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
  assignedTo: z.string().optional(),
  weight: z
    .number()
    .int('Weight must be a whole number')
    .min(1, 'Weight must be at least 1')
    .max(10, 'Weight cannot exceed 10'),
  deadline: z.date().optional(),
  requiresProof: z.boolean().default(false),
});

export type CreateTaskFormData = z.infer<typeof createTaskSchema>;

// Task update schema
export const updateTaskSchema = createTaskSchema.partial();

export type UpdateTaskFormData = z.infer<typeof updateTaskSchema>;

// Photo proof validation
export const photoProofSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, 'File size must be less than 5MB')
    .refine(
      (file) => ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type),
      'File must be a JPEG, PNG, or WebP image'
    ),
  notes: z.string().max(200, 'Notes are too long').optional(),
});

export type PhotoProofFormData = z.infer<typeof photoProofSchema>;

// Task filter schema
export const taskFilterSchema = z.object({
  status: z.enum(['all', 'pending', 'assigned', 'submitted', 'done']).default('all'),
  assignedTo: z.string().optional(),
  sortBy: z.enum(['deadline', 'createdAt', 'weight', 'title']).default('deadline'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type TaskFilterOptions = z.infer<typeof taskFilterSchema>;



