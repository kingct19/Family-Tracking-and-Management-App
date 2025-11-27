import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    collection,
    query,
    where,
    orderBy,
    getDocs,
    serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { Task, ApiResponse } from '@/types';
import type { CreateTaskFormData } from '@/lib/validation/task-schemas';

/**
 * Create a new task
 */
export const createTask = async (
    hubId: string,
    data: CreateTaskFormData,
    createdBy: string
): Promise<ApiResponse<Task>> => {
    try {
        const taskRef = doc(collection(db, 'hubs', hubId, 'tasks'));

        const task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
            hubId,
            title: data.title,
            description: data.description,
            createdBy,
            assignedTo: data.assignedTo,
            status: data.assignedTo ? 'assigned' : 'pending',
            weight: data.weight,
            deadline: data.deadline,
        };

        await setDoc(taskRef, {
            ...task,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        return {
            success: true,
            data: {
                id: taskRef.id,
                ...task,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        };
    } catch (error: any) {
        console.error('Create task error:', error);
        return {
            success: false,
            error: 'Failed to create task',
        };
    }
};

/**
 * Get task by ID
 */
export const getTaskById = async (
    hubId: string,
    taskId: string
): Promise<ApiResponse<Task>> => {
    try {
        const taskDoc = await getDoc(doc(db, 'hubs', hubId, 'tasks', taskId));

        if (!taskDoc.exists()) {
            return {
                success: false,
                error: 'Task not found',
            };
        }

        const data = taskDoc.data();
        const task: Task = {
            id: taskDoc.id,
            hubId: data.hubId,
            title: data.title,
            description: data.description,
            createdBy: data.createdBy,
            assignedTo: data.assignedTo,
            status: data.status,
            weight: data.weight,
            deadline: data.deadline?.toDate(),
            proofURL: data.proofURL,
            proofStatus: data.proofStatus,
            proofSubmittedAt: data.proofSubmittedAt?.toDate(),
            proofReviewedBy: data.proofReviewedBy,
            proofReviewedAt: data.proofReviewedAt?.toDate(),
            completedAt: data.completedAt?.toDate(),
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
        };

        return {
            success: true,
            data: task,
        };
    } catch (error: any) {
        console.error('Get task error:', error);
        return {
            success: false,
            error: 'Failed to fetch task',
        };
    }
};

/**
 * Get all tasks for a hub
 */
export const getHubTasks = async (hubId: string): Promise<ApiResponse<Task[]>> => {
    try {
        const tasksQuery = query(
            collection(db, 'hubs', hubId, 'tasks'),
            orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(tasksQuery);

        const tasks: Task[] = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            tasks.push({
                id: doc.id,
                hubId: data.hubId,
                title: data.title,
                description: data.description,
                createdBy: data.createdBy,
                assignedTo: data.assignedTo,
                status: data.status,
                weight: data.weight,
                deadline: data.deadline?.toDate(),
                proofURL: data.proofURL,
                proofStatus: data.proofStatus,
                proofSubmittedAt: data.proofSubmittedAt?.toDate(),
                proofReviewedBy: data.proofReviewedBy,
                proofReviewedAt: data.proofReviewedAt?.toDate(),
                completedAt: data.completedAt?.toDate(),
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
            });
        });

        return {
            success: true,
            data: tasks,
        };
    } catch (error: any) {
        console.error('Get hub tasks error:', error);
        return {
            success: false,
            error: 'Failed to fetch tasks',
        };
    }
};

/**
 * Get tasks assigned to a specific user
 */
export const getUserTasks = async (
    hubId: string,
    userId: string
): Promise<ApiResponse<Task[]>> => {
    try {
        const tasksQuery = query(
            collection(db, 'hubs', hubId, 'tasks'),
            where('assignedTo', '==', userId),
            orderBy('deadline', 'asc')
        );
        const snapshot = await getDocs(tasksQuery);

        const tasks: Task[] = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            tasks.push({
                id: doc.id,
                hubId: data.hubId,
                title: data.title,
                description: data.description,
                createdBy: data.createdBy,
                assignedTo: data.assignedTo,
                status: data.status,
                weight: data.weight,
                deadline: data.deadline?.toDate(),
                proofURL: data.proofURL,
                proofStatus: data.proofStatus,
                proofSubmittedAt: data.proofSubmittedAt?.toDate(),
                proofReviewedBy: data.proofReviewedBy,
                proofReviewedAt: data.proofReviewedAt?.toDate(),
                completedAt: data.completedAt?.toDate(),
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
            });
        });

        return {
            success: true,
            data: tasks,
        };
    } catch (error: any) {
        console.error('Get user tasks error:', error);
        return {
            success: false,
            error: 'Failed to fetch user tasks',
        };
    }
};

/**
 * Update task
 */
export const updateTask = async (
    hubId: string,
    taskId: string,
    updates: Partial<Task>
): Promise<ApiResponse<void>> => {
    try {
        await updateDoc(doc(db, 'hubs', hubId, 'tasks', taskId), {
            ...updates,
            updatedAt: serverTimestamp(),
        });

        return { success: true };
    } catch (error: any) {
        console.error('Update task error:', error);
        return {
            success: false,
            error: 'Failed to update task',
        };
    }
};

/**
 * Delete task
 */
export const deleteTask = async (
    hubId: string,
    taskId: string
): Promise<ApiResponse<void>> => {
    try {
        await deleteDoc(doc(db, 'hubs', hubId, 'tasks', taskId));
        return { success: true };
    } catch (error: any) {
        console.error('Delete task error:', error);
        return {
            success: false,
            error: 'Failed to delete task',
        };
    }
};

/**
 * Assign task to a user
 */
export const assignTask = async (
    hubId: string,
    taskId: string,
    userId: string
): Promise<ApiResponse<void>> => {
    try {
        await updateDoc(doc(db, 'hubs', hubId, 'tasks', taskId), {
            assignedTo: userId,
            status: 'assigned',
            updatedAt: serverTimestamp(),
        });

        return { success: true };
    } catch (error: any) {
        console.error('Assign task error:', error);
        return {
            success: false,
            error: 'Failed to assign task',
        };
    }
};

/**
 * Mark task as done (without proof)
 */
export const completeTask = async (
    hubId: string,
    taskId: string
): Promise<ApiResponse<void>> => {
    try {
        await updateDoc(doc(db, 'hubs', hubId, 'tasks', taskId), {
            status: 'done',
            completedAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        return { success: true };
    } catch (error: any) {
        console.error('Complete task error:', error);
        return {
            success: false,
            error: 'Failed to complete task',
        };
    }
};

/**
 * Accept a task (moves from ASSIGNED to PENDING)
 */
export const acceptTask = async (
    hubId: string,
    taskId: string
): Promise<ApiResponse<void>> => {
    try {
        await updateDoc(doc(db, 'hubs', hubId, 'tasks', taskId), {
            status: 'pending',
            updatedAt: serverTimestamp(),
        });

        return { success: true };
    } catch (error: any) {
        console.error('Accept task error:', error);
        return {
            success: false,
            error: 'Failed to accept task',
        };
    }
};

/**
 * Submit task proof with photo (moves from PENDING to SUBMITTED)
 */
export const submitTaskProof = async (
    hubId: string,
    taskId: string,
    proofURL: string,
    notes?: string
): Promise<ApiResponse<void>> => {
    try {
        await updateDoc(doc(db, 'hubs', hubId, 'tasks', taskId), {
            proofURL,
            proofStatus: 'pending',
            proofSubmittedAt: serverTimestamp(),
            status: 'submitted',
            updatedAt: serverTimestamp(),
        });

        return { success: true };
    } catch (error: any) {
        console.error('Submit task proof error:', error);
        return {
            success: false,
            error: 'Failed to submit task proof',
        };
    }
};

/**
 * Approve task proof (moves from SUBMITTED to DONE)
 */
export const approveTaskProof = async (
    hubId: string,
    taskId: string,
    reviewedBy: string
): Promise<ApiResponse<void>> => {
    try {
        await updateDoc(doc(db, 'hubs', hubId, 'tasks', taskId), {
            status: 'done',
            proofStatus: 'approved',
            proofReviewedBy: reviewedBy,
            proofReviewedAt: serverTimestamp(),
            completedAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        return { success: true };
    } catch (error: any) {
        console.error('Approve task proof error:', error);
        return {
            success: false,
            error: 'Failed to approve task proof',
        };
    }
};

/**
 * Unassign a task (removes assignedTo and moves back to pending)
 */
export const unassignTask = async (
    hubId: string,
    taskId: string
): Promise<ApiResponse<void>> => {
    try {
        await updateDoc(doc(db, 'hubs', hubId, 'tasks', taskId), {
            assignedTo: null,
            status: 'pending',
            updatedAt: serverTimestamp(),
        });

        return { success: true };
    } catch (error: any) {
        console.error('Unassign task error:', error);
        return {
            success: false,
            error: 'Failed to unassign task',
        };
    }
};



