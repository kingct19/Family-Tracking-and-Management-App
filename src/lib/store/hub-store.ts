import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Hub, UserRole, FeatureToggles } from '@/types';

interface HubState {
  currentHub: Hub | null;
  currentRole: UserRole | null;
  featureToggles: FeatureToggles | null;
  
  // Actions
  setCurrentHub: (hub: Hub, role: UserRole) => void;
  updateFeatureToggles: (toggles: FeatureToggles) => void;
  clearCurrentHub: () => void;
  isFeatureEnabled: (feature: keyof FeatureToggles) => boolean;
}

const defaultFeatureToggles: FeatureToggles = {
  location: true,
  tasks: true,
  chat: true,
  vault: false,
  xp: true,
  leaderboard: true,
  geofencing: false,
  deviceMonitoring: true,
};

export const useHubStore = create<HubState>()(
  persist(
    (set, get) => ({
      currentHub: null,
      currentRole: null,
      featureToggles: null,

      setCurrentHub: (hub, role) =>
        set({
          currentHub: hub,
          currentRole: role,
          featureToggles: hub.featureToggles || defaultFeatureToggles,
        }),

      updateFeatureToggles: (toggles) =>
        set((state) => ({
          featureToggles: toggles,
          currentHub: state.currentHub
            ? {
                ...state.currentHub,
                featureToggles: toggles,
              }
            : null,
        })),

      clearCurrentHub: () =>
        set({
          currentHub: null,
          currentRole: null,
          featureToggles: null,
        }),

      isFeatureEnabled: (feature) => {
        const toggles = get().featureToggles;
        // If no hub selected, use default toggles (show all features)
        if (!toggles) {
          return defaultFeatureToggles[feature] ?? true;
        }
        return toggles[feature] ?? false;
      },
    }),
    {
      name: 'hub-storage',
      partialize: (state) => ({
        currentHub: state.currentHub,
        currentRole: state.currentRole,
        featureToggles: state.featureToggles,
      }),
    }
  )
);



