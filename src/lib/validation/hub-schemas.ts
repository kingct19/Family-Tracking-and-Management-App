import { z } from 'zod';

// Hub creation schema
export const createHubSchema = z.object({
  name: z
    .string()
    .min(3, 'Hub name must be at least 3 characters')
    .max(50, 'Hub name is too long')
    .regex(/^[a-zA-Z0-9\s'-]+$/, 'Hub name contains invalid characters'),
  description: z.string().max(200, 'Description is too long').optional(),
  featureToggles: z
    .object({
      location: z.boolean().default(true),
      tasks: z.boolean().default(true),
      chat: z.boolean().default(true),
      vault: z.boolean().default(false),
      xp: z.boolean().default(true),
      leaderboard: z.boolean().default(true),
      geofencing: z.boolean().default(false),
      deviceMonitoring: z.boolean().default(true),
    })
    .default({
      location: true,
      tasks: true,
      chat: true,
      vault: false,
      xp: true,
      leaderboard: true,
      geofencing: false,
      deviceMonitoring: true,
    }),
});

export type CreateHubFormData = z.infer<typeof createHubSchema>;

// Hub update schema
export const updateHubSchema = z.object({
  name: z
    .string()
    .min(3, 'Hub name must be at least 3 characters')
    .max(50, 'Hub name is too long')
    .optional(),
  description: z.string().max(200, 'Description is too long').optional(),
});

export type UpdateHubFormData = z.infer<typeof updateHubSchema>;

// Feature toggles update schema
export const featureTogglesSchema = z
  .object({
    location: z.boolean(),
    tasks: z.boolean(),
    chat: z.boolean(),
    vault: z.boolean(),
    xp: z.boolean(),
    leaderboard: z.boolean(),
    geofencing: z.boolean(),
    deviceMonitoring: z.boolean(),
  })
  .refine(
    (data) => {
      // Can't enable leaderboard without XP
      if (data.leaderboard && !data.xp) return false;
      return true;
    },
    {
      message: 'Leaderboard requires XP to be enabled',
      path: ['leaderboard'],
    }
  )
  .refine(
    (data) => {
      // Can't enable geofencing without location
      if (data.geofencing && !data.location) return false;
      return true;
    },
    {
      message: 'Geofencing requires location tracking to be enabled',
      path: ['geofencing'],
    }
  );

export type FeatureTogglesFormData = z.infer<typeof featureTogglesSchema>;

// Invite creation schema
export const createInviteSchema = z.object({
  role: z.enum(['admin', 'member', 'observer']).default('member'),
  expiresInDays: z.number().int().min(1).max(30).default(7),
  maxUses: z.number().int().min(1).max(100).optional(),
});

export type CreateInviteFormData = z.infer<typeof createInviteSchema>;

// Geofence schema
export const geofenceSchema = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(50, 'Name is too long'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radius: z.number().int().min(50, 'Radius must be at least 50 meters').max(5000, 'Radius cannot exceed 5000 meters'),
  notifyOnEnter: z.boolean().default(true),
  notifyOnExit: z.boolean().default(true),
});

export type GeofenceFormData = z.infer<typeof geofenceSchema>;



