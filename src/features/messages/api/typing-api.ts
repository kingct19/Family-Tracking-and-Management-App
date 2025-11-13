import { doc, setDoc, deleteDoc, onSnapshot, collection, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';

export interface TypingStatus {
    userId: string;
    userName: string;
    timestamp: Date;
}

/**
 * Set typing status for a user in a hub
 */
export const setTypingStatus = async (hubId: string, userId: string, userName: string): Promise<void> => {
    try {
        const typingRef = doc(db, `hubs/${hubId}/typing/${userId}`);
        await setDoc(typingRef, {
            userId,
            userName,
            timestamp: Timestamp.now(),
        });
    } catch (error) {
        console.error('Set typing status error:', error);
    }
};

/**
 * Clear typing status for a user in a hub
 */
export const clearTypingStatus = async (hubId: string, userId: string): Promise<void> => {
    try {
        const typingRef = doc(db, `hubs/${hubId}/typing/${userId}`);
        await deleteDoc(typingRef);
    } catch (error) {
        console.error('Clear typing status error:', error);
    }
};

/**
 * Subscribe to typing status updates
 */
export const subscribeToTypingStatus = (
    hubId: string,
    callback: (typingUsers: TypingStatus[]) => void
): (() => void) => {
    const typingCollectionRef = collection(db, `hubs/${hubId}/typing`);
    
    const unsubscribe = onSnapshot(
        typingCollectionRef,
        (snapshot) => {
            const typingUsers: TypingStatus[] = [];
            
            snapshot.forEach((doc) => {
                const data = doc.data();
                typingUsers.push({
                    userId: data.userId,
                    userName: data.userName,
                    timestamp: data.timestamp?.toDate() || new Date(),
                });
            });
            
            callback(typingUsers);
        },
        (error) => {
            console.error('Subscribe to typing status error:', error);
            callback([]);
        }
    );
    
    return unsubscribe;
};

