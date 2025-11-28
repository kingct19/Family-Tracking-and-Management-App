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

      setCurrentHub: (hub, role) => {
        const current = get();
        // Only update if hub or role actually changed to prevent unnecessary re-renders
        if (
          current.currentHub?.id !== hub.id ||
          current.currentRole !== role
        ) {
          set({
            currentHub: hub,
            currentRole: role,
            featureToggles: hub.featureToggles || defaultFeatureToggles,
          });
        } else {
          // Hub ID and role are the same, but update hub data in case name/description changed
          // Only update if data actually changed
          const hubDataChanged = 
            current.currentHub?.name !== hub.name ||
            current.currentHub?.description !== hub.description ||
            JSON.stringify(current.currentHub?.featureToggles) !== JSON.stringify(hub.featureToggles);
          
          if (hubDataChanged) {
            set({
              currentHub: hub,
              currentRole: role,
              featureToggles: hub.featureToggles || defaultFeatureToggles,
            });
          }
        }
      },

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



