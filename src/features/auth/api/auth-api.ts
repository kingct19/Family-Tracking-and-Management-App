import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    updateProfile,
    updatePassword,
    EmailAuthProvider,
    reauthenticateWithCredential,
    type User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import type { AuthUser, User, UserPreferences, ApiResponse, UserRole } from '@/types';
import type { RegisterFormData, LoginFormData } from '@/lib/validation/auth-schemas';

/**
 * Convert Firebase user to our AuthUser type
 */
export const mapFirebaseUser = async (firebaseUser: FirebaseUser): Promise<AuthUser> => {
    const tokenResult = await firebaseUser.getIdTokenResult();

    return {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: firebaseUser.displayName || firebaseUser.email!.split('@')[0],
        photoURL: firebaseUser.photoURL || undefined,
        emailVerified: firebaseUser.emailVerified,
        xpTotal: tokenResult.claims.xpTotal as number | undefined,
        customClaims: tokenResult.claims.hubs ? {
            hubs: tokenResult.claims.hubs as Record<string, UserRole>,
            currentHub: tokenResult.claims.currentHub as string | undefined,
        } : undefined,
    };
};

/**
 * Register a new user
 */
export const registerUser = async (
    data: RegisterFormData
): Promise<ApiResponse<AuthUser>> => {
    try {
        // Create Firebase Auth user
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            data.email,
            data.password
        );

        // Update display name
        await updateProfile(userCredential.user, {
            displayName: data.displayName,
        });

        // Create user document in Firestore
        const userDoc: Omit<User, 'id'> = {
            email: data.email,
            displayName: data.displayName,
            xpTotal: 0,
            hubs: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await setDoc(doc(db, 'users', userCredential.user.uid), {
            ...userDoc,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        // Create default preferences
        const defaultPreferences: UserPreferences = {
            theme: 'system',
            notifications: true,
            locationSharing: true,
            lowBatteryAlerts: true,
        };

        await setDoc(doc(db, 'users', userCredential.user.uid, 'private', 'preferences'), defaultPreferences);

        const authUser = await mapFirebaseUser(userCredential.user);

        return {
            success: true,
            data: authUser,
        };
    } catch (error: any) {
        console.error('Registration error:', error);

        let errorMessage = 'Failed to create account';
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'Email is already registered';
        } else if (error.code === 'auth/weak-password') {
            errorMessage = 'Password is too weak';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Invalid email address';
        }

        return {
            success: false,
            error: errorMessage,
        };
    }
};

/**
 * Login user
 */
export const loginUser = async (
    data: LoginFormData
): Promise<ApiResponse<AuthUser>> => {
    try {
        const userCredential = await signInWithEmailAndPassword(
            auth,
            data.email,
            data.password
        );

        const authUser = await mapFirebaseUser(userCredential.user);

        return {
            success: true,
            data: authUser,
        };
    } catch (error: any) {
        console.error('Login error:', error);

        let errorMessage = 'Failed to login';
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            errorMessage = 'Invalid email or password';
        } else if (error.code === 'auth/too-many-requests') {
            errorMessage = 'Too many failed attempts. Please try again later';
        } else if (error.code === 'auth/user-disabled') {
            errorMessage = 'This account has been disabled';
        }

        return {
            success: false,
            error: errorMessage,
        };
    }
};

/**
 * Logout user
 */
export const logoutUser = async (): Promise<ApiResponse<void>> => {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error: any) {
        console.error('Logout error:', error);
        return {
            success: false,
            error: 'Failed to logout',
        };
    }
};

/**
 * Send password reset email
 */
export const sendPasswordReset = async (email: string): Promise<ApiResponse<void>> => {
    try {
        await sendPasswordResetEmail(auth, email);
        return { success: true };
    } catch (error: any) {
        console.error('Password reset error:', error);

        let errorMessage = 'Failed to send reset email';
        if (error.code === 'auth/user-not-found') {
            errorMessage = 'No account found with this email';
        }

        return {
            success: false,
            error: errorMessage,
        };
    }
};

/**
 * Change user password
 */
export const changeUserPassword = async (
    currentPassword: string,
    newPassword: string
): Promise<ApiResponse<void>> => {
    try {
        const user = auth.currentUser;
        if (!user || !user.email) {
            throw new Error('No user logged in');
        }

        // Reauthenticate user
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);

        // Update password
        await updatePassword(user, newPassword);

        return { success: true };
    } catch (error: any) {
        console.error('Password change error:', error);

        let errorMessage = 'Failed to change password';
        if (error.code === 'auth/wrong-password') {
            errorMessage = 'Current password is incorrect';
        } else if (error.code === 'auth/weak-password') {
            errorMessage = 'New password is too weak';
        }

        return {
            success: false,
            error: errorMessage,
        };
    }
};

/**
 * Get user profile from Firestore
 */
export const getUserProfile = async (userId: string): Promise<ApiResponse<User>> => {
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));

        if (!userDoc.exists()) {
            return {
                success: false,
                error: 'User not found',
            };
        }

        const data = userDoc.data();
        const user: User = {
            id: userDoc.id,
            email: data.email,
            displayName: data.displayName,
            photoURL: data.photoURL,
            xpTotal: data.xpTotal || 0,
            hubs: data.hubs || [],
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
        };

        return {
            success: true,
            data: user,
        };
    } catch (error: any) {
        console.error('Get user profile error:', error);
        return {
            success: false,
            error: 'Failed to fetch user profile',
        };
    }
};

/**
 * Update user profile in Firestore
 */
export const updateUserProfile = async (
    userId: string,
    updates: Partial<User>
): Promise<ApiResponse<void>> => {
    try {
        await updateDoc(doc(db, 'users', userId), {
            ...updates,
            updatedAt: serverTimestamp(),
        });

        // Update Firebase Auth display name if provided
        if (updates.displayName && auth.currentUser) {
            await updateProfile(auth.currentUser, {
                displayName: updates.displayName,
            });
        }

        return { success: true };
    } catch (error: any) {
        console.error('Update profile error:', error);
        return {
            success: false,
            error: 'Failed to update profile',
        };
    }
};

