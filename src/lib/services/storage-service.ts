import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, auth } from '@/config/firebase';

/**
 * Upload a file to Firebase Storage
 */
export const uploadFile = async (
    file: File,
    path: string
): Promise<string> => {
    try {
        const storageRef = ref(storage, path);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (error: any) {
        console.error('Upload file error:', error);
        // Preserve Firebase error codes for better error handling
        if (error?.code) {
            const firebaseError = new Error(error.message || 'Failed to upload file');
            (firebaseError as any).code = error.code;
            throw firebaseError;
        }
        throw new Error('Failed to upload file');
    }
};

/**
 * Upload task proof photo
 */
export const uploadTaskProof = async (
    file: File,
    hubId: string,
    taskId: string
): Promise<string> => {
    const fileName = `${Date.now()}_${file.name}`;
    const path = `tasks/${hubId}/${taskId}/${fileName}`;
    return uploadFile(file, path);
};

/**
 * Upload vault document (for credit cards, IDs, documents)
 */
export const uploadVaultDocument = async (
    file: File,
    userId: string,
    itemId: string
): Promise<string> => {
    // Validate file type
    const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'image/gif',
        'application/pdf',
    ];
    
    if (!allowedTypes.includes(file.type)) {
        throw new Error('File type not supported. Please upload an image (JPEG, PNG, WebP, GIF) or PDF.');
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size must be less than 10MB');
    }

    const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const path = `vault/${userId}/${itemId}/${fileName}`;
    return uploadFile(file, path);
};

/**
 * Upload profile picture
 */
export const uploadProfilePicture = async (
    file: File,
    userId: string
): Promise<string> => {
    // Verify user is authenticated
    const currentUser = auth.currentUser;
    if (!currentUser) {
        throw new Error('User must be authenticated to upload files');
    }

    // Verify userId matches authenticated user
    if (currentUser.uid !== userId) {
        throw new Error('User ID mismatch. Cannot upload to another user\'s profile.');
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
    }

    // Validate file size (2MB max to match storage rules)
    if (file.size > 2 * 1024 * 1024) {
        throw new Error('Image must be less than 2MB');
    }

    const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const path = `profiles/${userId}/${fileName}`;
    return uploadFile(file, path);
};

/**
 * Upload reward image
 */
export const uploadRewardImage = async (
    file: File,
    hubId: string,
    rewardId: string
): Promise<string> => {
    // Verify user is authenticated
    const currentUser = auth.currentUser;
    if (!currentUser) {
        throw new Error('User must be authenticated to upload files');
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image must be less than 5MB');
    }

    const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const path = `rewards/${hubId}/${rewardId}/${fileName}`;
    return uploadFile(file, path);
};

