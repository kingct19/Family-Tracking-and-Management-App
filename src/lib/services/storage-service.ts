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

