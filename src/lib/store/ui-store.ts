import { create } from 'zustand';
import type { ComponentType } from 'react';

interface Modal {
    id: string;
    component: ComponentType<any>;
    props?: Record<string, any>;
}

interface UIState {
    // Modal state
    modals: Modal[];

    // Sidebar state
    isSidebarOpen: boolean;

    // Loading states
    globalLoading: boolean;

    // Actions
    openModal: (id: string, component: ComponentType<any>, props?: Record<string, any>) => void;
    closeModal: (id: string) => void;
    closeAllModals: () => void;
    toggleSidebar: () => void;
    setSidebarOpen: (isOpen: boolean) => void;
    setGlobalLoading: (isLoading: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
    modals: [],
    isSidebarOpen: false,
    globalLoading: false,

    openModal: (id, component, props) =>
        set((state) => ({
            modals: [...state.modals, { id, component, props }],
        })),

    closeModal: (id) =>
        set((state) => ({
            modals: state.modals.filter((modal) => modal.id !== id),
        })),

    closeAllModals: () =>
        set({ modals: [] }),

    toggleSidebar: () =>
        set((state) => ({
            isSidebarOpen: !state.isSidebarOpen,
        })),

    setSidebarOpen: (isOpen) =>
        set({ isSidebarOpen: isOpen }),

    setGlobalLoading: (isLoading) =>
        set({ globalLoading: isLoading }),
}));

