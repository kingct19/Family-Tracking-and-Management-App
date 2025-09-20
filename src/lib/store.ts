import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// UI State
interface UIState {
    sidebarOpen: boolean;
    currentTheme: 'light' | 'dark' | 'system';
    loading: boolean;
    error: string | null;
}

interface UIActions {
    setSidebarOpen: (open: boolean) => void;
    setTheme: (theme: 'light' | 'dark' | 'system') => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    clearError: () => void;
}

// App State
interface AppState {
    currentHub: string | null;
    lastActiveRoute: string;
    onboardingCompleted: boolean;
}

interface AppActions {
    setCurrentHub: (hubId: string | null) => void;
    setLastActiveRoute: (route: string) => void;
    setOnboardingCompleted: (completed: boolean) => void;
}

// Location State
interface LocationState {
    isTracking: boolean;
    currentLocation: {
        latitude: number;
        longitude: number;
        accuracy: number;
        timestamp: Date;
    } | null;
    permissionsGranted: boolean;
}

interface LocationActions {
    setIsTracking: (tracking: boolean) => void;
    setCurrentLocation: (location: LocationState['currentLocation']) => void;
    setPermissionsGranted: (granted: boolean) => void;
}

// Create stores
export const useUIStore = create<UIState & UIActions>()(
    devtools(
        persist(
            (set) => ({
                // State
                sidebarOpen: false,
                currentTheme: 'system',
                loading: false,
                error: null,

                // Actions
                setSidebarOpen: (open) => set({ sidebarOpen: open }),
                setTheme: (theme) => set({ currentTheme: theme }),
                setLoading: (loading) => set({ loading }),
                setError: (error) => set({ error }),
                clearError: () => set({ error: null })
            }),
            {
                name: 'ui-storage',
                partialize: (state) => ({
                    currentTheme: state.currentTheme,
                    sidebarOpen: state.sidebarOpen
                })
            }
        ),
        {
            name: 'ui-store'
        }
    )
);

export const useAppStore = create<AppState & AppActions>()(
    devtools(
        persist(
            (set) => ({
                // State
                currentHub: null,
                lastActiveRoute: '/dashboard',
                onboardingCompleted: false,

                // Actions
                setCurrentHub: (hubId) => set({ currentHub: hubId }),
                setLastActiveRoute: (route) => set({ lastActiveRoute: route }),
                setOnboardingCompleted: (completed) => set({ onboardingCompleted: completed })
            }),
            {
                name: 'app-storage',
                partialize: (state) => ({
                    currentHub: state.currentHub,
                    lastActiveRoute: state.lastActiveRoute,
                    onboardingCompleted: state.onboardingCompleted
                })
            }
        ),
        {
            name: 'app-store'
        }
    )
);

export const useLocationStore = create<LocationState & LocationActions>()(
    devtools(
        (set) => ({
            // State
            isTracking: false,
            currentLocation: null,
            permissionsGranted: false,

            // Actions
            setIsTracking: (tracking) => set({ isTracking: tracking }),
            setCurrentLocation: (location) => set({ currentLocation: location }),
            setPermissionsGranted: (granted) => set({ permissionsGranted: granted })
        }),
        {
            name: 'location-store'
        }
    )
);

// Combined store for easy access
export const useStore = () => ({
    ui: useUIStore(),
    app: useAppStore(),
    location: useLocationStore()
});
