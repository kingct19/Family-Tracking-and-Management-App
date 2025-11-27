import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/config/firebase';

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
    } catch (error) {
        console.error('Upload file error:', error);
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

