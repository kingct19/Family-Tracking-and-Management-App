import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { auth } from '@/config/firebase';
import { useAuthStore } from '@/lib/store/auth-store';
import { useHubStore } from '@/lib/store/hub-store';
import {
  registerUser,
  loginUser,
  logoutUser,
  mapFirebaseUser,
  getUserProfile,
} from '../api/auth-api';
import { joinHubWithInvite } from '../api/invite-api';
import { getUserHubs, getUserMembership } from '@/lib/api/hub-api';
import type { RegisterFormData, LoginFormData } from '@/lib/validation/auth-schemas';

/**
 * Main authentication hook
 */
export const useAuth = () => {
  const queryClient = useQueryClient();
  const { user, isLoading, isAuthenticated, setUser, setLoading, logout: clearAuth } = useAuthStore();
  const { setCurrentHub, clearCurrentHub } = useHubStore();

  // Listen to Firebase auth state changes
  useEffect(() => {
    setLoading(true);

    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.log('Auth loading timeout - forcing stop');
      setLoading(false);
    }, 10000); // 10 second timeout

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      clearTimeout(timeout); // Clear timeout when auth state changes

      if (firebaseUser) {
        try {
          const authUser = await mapFirebaseUser(firebaseUser);
          setUser(authUser);

          // Try to load user's hubs (optional - don't fail if no hubs exist)
          try {
            const hubsResponse = await getUserHubs(firebaseUser.uid);
            if (hubsResponse.success && hubsResponse.data && hubsResponse.data.length > 0) {
              // Set first hub as current if none selected
              const firstHub = hubsResponse.data[0];
              const membershipResponse = await getUserMembership(firstHub.id, firebaseUser.uid);

              if (membershipResponse.success && membershipResponse.data) {
                setCurrentHub(firstHub, membershipResponse.data.role);
              }
            }
          } catch (hubError) {
            // Hub loading failed - this is OK for new users
            console.log('No hubs found for user or hub loading failed:', hubError);
          }
        } catch (error) {
          console.error('Error mapping Firebase user:', error);
          setUser(null);
        }
      } else {
        setUser(null);
        clearCurrentHub();
      }

      setLoading(false);
    });

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, [setUser, setLoading, setCurrentHub, clearCurrentHub]);

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (data: RegisterFormData) => registerUser(data),
    onSuccess: (response) => {
      if (response.success && response.data) {
        queryClient.invalidateQueries({ queryKey: ['auth'] });
      }
    },
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (data: LoginFormData) => loginUser(data),
    onSuccess: (response) => {
      if (response.success && response.data) {
        queryClient.invalidateQueries({ queryKey: ['auth'] });
      }
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => logoutUser(),
    onSuccess: () => {
      clearAuth();
      clearCurrentHub();
      queryClient.clear();
    },
  });

  // Join hub with invite mutation
  const joinHubMutation = useMutation({
    mutationFn: (inviteCode: string) => {
      if (!user) throw new Error('User not authenticated');
      return joinHubWithInvite(user.id, inviteCode);
    },
    onSuccess: async (response) => {
      if (response.success && response.data && user) {
        // Reload user's hubs
        queryClient.invalidateQueries({ queryKey: ['hubs', user.id] });

        // Switch to the new hub
        const { hubId, role } = response.data;
        const hubsResponse = await getUserHubs(user.id);
        if (hubsResponse.success && hubsResponse.data) {
          const newHub = hubsResponse.data.find(h => h.id === hubId);
          if (newHub) {
            setCurrentHub(newHub, role);
          }
        }
      }
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated,
    register: registerMutation.mutateAsync,
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    joinHub: joinHubMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isJoiningHub: joinHubMutation.isPending,
  };
};

/**
 * Hook to fetch user profile
 */
export const useUserProfile = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['user', 'profile', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');
      const response = await getUserProfile(userId);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to check if user has a specific role in current hub
 */
export const useHasRole = (requiredRole: 'admin' | 'member' | 'observer') => {
  const { currentRole } = useHubStore();

  if (!currentRole) return false;

  // Admin has all permissions
  if (currentRole === 'admin') return true;

  // Member has member and observer permissions
  if (currentRole === 'member' && (requiredRole === 'member' || requiredRole === 'observer')) {
    return true;
  }

  // Observer only has observer permissions
  if (currentRole === 'observer' && requiredRole === 'observer') {
    return true;
  }

  return false;
};

/**
 * Hook to check if a feature is enabled in current hub
 */
export const useFeatureEnabled = (feature: keyof import('@/types').FeatureToggles) => {
  const { isFeatureEnabled } = useHubStore();
  return isFeatureEnabled(feature);
};
