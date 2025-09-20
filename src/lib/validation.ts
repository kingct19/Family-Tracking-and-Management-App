import { z } from 'zod';

// User authentication schemas
export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    confirmPassword: z.string(),
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

// Family/Hub schemas
export const createHubSchema = z.object({
    name: z.string().min(2, 'Hub name must be at least 2 characters').max(50, 'Hub name must be less than 50 characters'),
    description: z.string().max(200, 'Description must be less than 200 characters').optional(),
    type: z.enum(['family', 'school', 'sports', 'work', 'other']),
});

export const inviteMemberSchema = z.object({
    email: z.string().email('Invalid email address'),
    role: z.enum(['parent', 'child', 'viewer']),
    message: z.string().max(200, 'Message must be less than 200 characters').optional(),
});

// Task/Chore schemas
export const createTaskSchema = z.object({
    title: z.string().min(3, 'Task title must be at least 3 characters').max(100, 'Task title must be less than 100 characters'),
    description: z.string().max(500, 'Description must be less than 500 characters').optional(),
    assignedTo: z.string().min(1, 'Please select a family member'),
    dueDate: z.date().optional(),
    points: z.number().min(1, 'Points must be at least 1').max(100, 'Points must be less than 100').default(10),
    requiresPhoto: z.boolean().default(false),
    category: z.enum(['chore', 'homework', 'exercise', 'other']).default('chore'),
});

export const completeTaskSchema = z.object({
    taskId: z.string().min(1, 'Task ID is required'),
    photoUrl: z.string().url('Invalid photo URL').optional(),
    notes: z.string().max(300, 'Notes must be less than 300 characters').optional(),
});

// Location schemas
export const locationUpdateSchema = z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    accuracy: z.number().min(0).optional(),
    timestamp: z.date().default(() => new Date()),
});

export const geofenceSchema = z.object({
    name: z.string().min(2, 'Geofence name must be at least 2 characters'),
    center: z.object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
    }),
    radius: z.number().min(10, 'Radius must be at least 10 meters').max(10000, 'Radius must be less than 10km'),
    type: z.enum(['arrival', 'departure', 'both']).default('both'),
});

// Vault schemas
export const vaultEntrySchema = z.object({
    title: z.string().min(2, 'Title must be at least 2 characters').max(100, 'Title must be less than 100 characters'),
    type: z.enum(['password', 'document', 'note', 'banking', 'medical', 'other']),
    content: z.string().min(1, 'Content is required'),
    tags: z.array(z.string()).max(10, 'Maximum 10 tags allowed').default([]),
    isEncrypted: z.boolean().default(true),
});

// Message schemas
export const messageSchema = z.object({
    content: z.string().min(1, 'Message cannot be empty').max(1000, 'Message must be less than 1000 characters'),
    type: z.enum(['text', 'image', 'location', 'task_update']).default('text'),
    recipientId: z.string().optional(), // For direct messages
    hubId: z.string().min(1, 'Hub ID is required'),
    priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
});

// Settings schemas
export const userSettingsSchema = z.object({
    notifications: z.object({
        email: z.boolean().default(true),
        push: z.boolean().default(true),
        sms: z.boolean().default(false),
    }),
    privacy: z.object({
        shareLocation: z.boolean().default(true),
        showOnlineStatus: z.boolean().default(true),
        allowInvites: z.boolean().default(true),
    }),
    location: z.object({
        updateInterval: z.number().min(30, 'Update interval must be at least 30 seconds').default(300),
        shareWithFamily: z.boolean().default(true),
        shareWithEmergency: z.boolean().default(true),
    }),
});

// Validation helper functions
export const validateInput = <T>(schema: z.ZodSchema<T>, data: unknown): { success: boolean; data?: T; errors?: string[] } => {
    try {
        const result = schema.parse(data);
        return { success: true, data: result };
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
            return { success: false, errors };
        }
        return { success: false, errors: ['Validation failed'] };
    }
};

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateHubInput = z.infer<typeof createHubSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type CompleteTaskInput = z.infer<typeof completeTaskSchema>;
export type LocationUpdateInput = z.infer<typeof locationUpdateSchema>;
export type GeofenceInput = z.infer<typeof geofenceSchema>;
export type VaultEntryInput = z.infer<typeof vaultEntrySchema>;
export type MessageInput = z.infer<typeof messageSchema>;
export type UserSettingsInput = z.infer<typeof userSettingsSchema>;
