// Core type definitions for the Group Safety App

export type UserRole = 'admin' | 'member' | 'observer';
export type MembershipStatus = 'pending' | 'active' | 'suspended';
export type TaskStatus = 'pending' | 'assigned' | 'submitted' | 'approved' | 'rejected' | 'done';
export type MessageType = 'text' | 'broadcast' | 'system' | 'media';
export type VaultItemType = 'password' | 'note' | 'card' | 'identity' | 'document';

// User types
export interface User {
    id: string;
    email: string;
    displayName: string;
    photoURL?: string;
    xpTotal: number;
    hubs: string[]; // Array of hub IDs user belongs to
    createdAt: Date;
    updatedAt: Date;
}

export interface UserProfile extends User {
    phone?: string;
    dateOfBirth?: Date;
    preferences: UserPreferences;
}

export interface UserPreferences {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
    locationSharing: boolean;
    lowBatteryAlerts: boolean;
}

// Hub types
export interface Hub {
    id: string;
    name: string;
    description?: string;
    createdBy: string; // User ID
    createdAt: Date;
    updatedAt: Date;
    featureToggles: FeatureToggles;
    members: string[]; // Array of user IDs
    inviteCode?: string;
}

export interface FeatureToggles {
    location: boolean;
    tasks: boolean;
    chat: boolean;
    vault: boolean;
    xp: boolean;
    leaderboard: boolean;
    geofencing: boolean;
    deviceMonitoring: boolean;
}

// Membership types
export interface Membership {
    userId: string;
    hubId: string;
    role: UserRole;
    status: MembershipStatus;
    joinedAt: Date;
    invitedBy?: string;
}

// Task types
export interface Task {
    id: string;
    hubId: string;
    title: string;
    description?: string;
    createdBy: string; // User ID
    assignedTo?: string; // User ID
    status: TaskStatus;
    weight: number; // XP value (1-10)
    deadline?: Date;
    proofURL?: string;
    proofStatus?: 'pending' | 'approved' | 'rejected';
    proofSubmittedAt?: Date;
    proofReviewedBy?: string;
    proofReviewedAt?: Date;
    completedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

// XP types
export interface XPRecord {
    id: string;
    userId: string;
    hubId: string;
    taskId?: string;
    xpValue: number;
    reason: string;
    streakMultiplier?: number;
    timestamp: Date;
}

export interface LeaderboardEntry {
    userId: string;
    displayName: string;
    photoURL?: string;
    xpTotal: number;
    rank: number;
    streak: number;
}

// Message types
export interface Message {
    id: string;
    hubId: string;
    senderId: string;
    senderName: string;
    text: string;
    type: MessageType;
    mediaURL?: string;
    timestamp: Date;
    readBy: string[]; // Array of user IDs
}

export interface Broadcast {
    id: string;
    hubId: string;
    createdBy: string;
    title: string;
    body: string;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    timestamp: Date;
    sentTo: string[]; // Array of user IDs
}

// Location types
export interface Location {
    userId: string;
    hubId: string;
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: Date;
    batteryLevel?: number;
    isOnline: boolean;
    address?: string;
    addressDetails?: {
        formatted: string;
        street?: string;
        city?: string;
        state?: string;
        zipCode?: string;
        country?: string;
    };
}

export interface Geofence {
    id: string;
    hubId: string;
    name: string;
    latitude: number;
    longitude: number;
    radius: number; // meters
    notifyOnEnter: boolean;
    notifyOnExit: boolean;
    activeMembers: string[]; // User IDs currently inside
    createdBy: string;
    createdAt: Date;
}

// Vault types
export interface VaultItem {
    id: string;
    userId: string; // Vault is per-user, not per-hub
    type: VaultItemType;
    title: string;
    ciphertext: string; // Encrypted data
    metadata: VaultMetadata;
    createdAt: Date;
    updatedAt: Date;
    accessedAt?: Date;
}

export interface VaultMetadata {
    icon?: string;
    category?: string;
    tags: string[];
    favorite: boolean;
    fileURL?: string; // URL to uploaded document/image
    fileName?: string; // Original file name
    fileType?: string; // MIME type of uploaded file
}

// Invite types
export interface Invite {
    code: string;
    hubId: string;
    createdBy: string;
    role: UserRole;
    expiresAt: Date;
    maxUses?: number;
    usedBy: string[]; // Array of user IDs
    createdAt: Date;
}

// Event log types
export interface EventLog {
    id: string;
    hubId: string;
    actorId: string;
    action: string;
    target: string;
    targetId: string;
    metadata?: Record<string, any>;
    timestamp: Date;
}

// Device status types
export interface DeviceStatus {
    userId: string;
    hubId: string;
    batteryLevel: number;
    isCharging: boolean;
    isOnline: boolean;
    lastSeen: Date;
    platform?: string;
}

// Auth types
export interface AuthUser {
    id: string;
    email: string;
    displayName: string;
    photoURL?: string;
    emailVerified: boolean;
    xpTotal?: number;
    customClaims?: CustomClaims;
}

export interface CustomClaims {
    hubs: Record<string, UserRole>; // { hubId: role }
    currentHub?: string;
}

// Reward types
export type RewardType = 'xp' | 'tasks' | 'streak';

export interface Reward {
    id: string;
    hubId: string;
    title: string;
    description: string;
    icon: string; // emoji
    type: RewardType;
    threshold: number; // XP amount, task count, or streak days
    createdBy: string; // admin userId
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserReward {
    id: string;
    hubId: string;
    userId: string;
    rewardId: string;
    unlockedAt: Date;
    claimedAt?: Date;
}

// API Response types
export interface ApiResponse<T> {
    data?: T;
    error?: string;
    success: boolean;
}

// Pagination types
export interface PaginationParams {
    limit: number;
    cursor?: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    nextCursor?: string;
    hasMore: boolean;
    total?: number;
}
