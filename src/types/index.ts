// User and Authentication Types
export interface User {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    emailVerified: boolean;
    createdAt: Date;
    lastLoginAt: Date;
}

export interface UserProfile extends User {
    familyId?: string;
    role: UserRole;
    preferences: UserPreferences;
    onboardingCompleted: boolean;
}

export type UserRole = 'owner' | 'admin' | 'parent' | 'child' | 'guardian' | 'viewer';

export interface UserPreferences {
    theme: 'light' | 'dark' | 'system';
    notifications: NotificationPreferences;
    privacy: PrivacyPreferences;
    location: LocationPreferences;
}

export interface NotificationPreferences {
    locationAlerts: boolean;
    taskReminders: boolean;
    messageNotifications: boolean;
    pushNotifications: boolean;
    emailNotifications: boolean;
}

export interface PrivacyPreferences {
    locationSharing: boolean;
    onlineStatus: boolean;
    profileVisibility: 'public' | 'family' | 'private';
    dataBackup: boolean;
}

export interface LocationPreferences {
    updateFrequency: number; // minutes
    accuracyLevel: 'high' | 'medium' | 'low';
    backgroundTracking: boolean;
    retentionPeriod: number; // days
}

// Family Hub Types
export interface FamilyHub {
    id: string;
    name: string;
    description: string;
    type: HubType;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    members: FamilyMember[];
    settings: HubSettings;
    geofences: Geofence[];
}

export type HubType = 'family' | 'sports' | 'school' | 'work' | 'other';

export interface FamilyMember {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    role: UserRole;
    joinedAt: Date;
    isOnline: boolean;
    lastSeen: Date;
    location?: LocationData;
}

export interface HubSettings {
    locationTracking: boolean;
    taskNotifications: boolean;
    messageNotifications: boolean;
    allowMemberInvites: boolean;
    requireApprovalForTasks: boolean;
}

// Location Types
export interface LocationData {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude?: number;
    heading?: number;
    speed?: number;
    timestamp: Date;
    address?: string;
}

export interface Geofence {
    id: string;
    name: string;
    description?: string;
    center: {
        latitude: number;
        longitude: number;
    };
    radius: number; // meters
    isActive: boolean;
    notifications: boolean;
    createdBy: string;
    createdAt: Date;
    hubId: string;
}

// Task Types
export interface Task {
    id: string;
    title: string;
    description?: string;
    hubId: string;
    assignedTo: string;
    assignedBy: string;
    createdAt: Date;
    dueDate?: Date;
    completedAt?: Date;
    status: TaskStatus;
    priority: TaskPriority;
    category: TaskCategory;
    requiresPhoto: boolean;
    photoUrl?: string;
    points: number;
    tags: string[];
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskCategory = 'chore' | 'homework' | 'exercise' | 'other';

export interface TaskCompletion {
    taskId: string;
    userId: string;
    completedAt: Date;
    photoUrl?: string;
    notes?: string;
    verifiedBy?: string;
    verifiedAt?: Date;
}

export interface LeaderboardEntry {
    userId: string;
    displayName: string;
    photoURL?: string;
    totalPoints: number;
    completedTasks: number;
    rank: number;
}

// Message Types
export interface Conversation {
    id: string;
    hubId: string;
    type: 'group' | 'direct';
    participants: string[];
    lastMessage?: Message;
    unreadCount: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    type: 'text' | 'image' | 'location' | 'task';
    timestamp: Date;
    readBy: string[];
    replyTo?: string;
}

// Vault Types
export interface VaultItem {
    id: string;
    title: string;
    category: VaultCategory;
    hubId: string;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    isEncrypted: boolean;
    metadata: VaultItemMetadata;
}

export type VaultCategory = 'password' | 'document' | 'note' | 'card' | 'other';

export interface VaultItemMetadata {
    username?: string;
    url?: string;
    description?: string;
    tags: string[];
    lastUsed?: Date;
    expiryDate?: Date;
    attachments?: string[];
}

export interface VaultAccess {
    id: string;
    vaultItemId: string;
    userId: string;
    accessLevel: 'view' | 'edit' | 'admin';
    grantedBy: string;
    grantedAt: Date;
    expiresAt?: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// Form Types
export interface LoginForm {
    email: string;
    password: string;
    rememberMe: boolean;
}

export interface RegisterForm {
    displayName: string;
    email: string;
    password: string;
    confirmPassword: string;
    acceptTerms: boolean;
}

export interface TaskForm {
    title: string;
    description?: string;
    assignedTo: string;
    dueDate?: Date;
    priority: TaskPriority;
    category: TaskCategory;
    requiresPhoto: boolean;
    points: number;
    tags: string[];
}

// Error Types
export interface AppError {
    code: string;
    message: string;
    details?: any;
}

export type ErrorCode =
    | 'AUTH_REQUIRED'
    | 'PERMISSION_DENIED'
    | 'HUB_NOT_FOUND'
    | 'TASK_NOT_FOUND'
    | 'LOCATION_DENIED'
    | 'NETWORK_ERROR'
    | 'VALIDATION_ERROR'
    | 'UNKNOWN_ERROR';
