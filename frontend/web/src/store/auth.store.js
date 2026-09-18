import { create } from "zustand";
import { persist } from "zustand/middleware";
import { jwtDecode } from "jwt-decode";
import { loginUser, registerUser } from "../api/auth.api";
import { authClient } from "../api/clients";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      verificationStatus: null,

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await registerUser(userData);
          
          if (response?.success) {
            const { user, token } = response.data;
            localStorage.setItem("token", token);
            const decodedUser = jwtDecode(token);
            set({ 
              user: { ...decodedUser, verification_status: user?.verification_status || 'UNVERIFIED' }, 
              token, 
              isLoading: false,
              verificationStatus: user?.verification_status || 'UNVERIFIED'
            });
            return { success: true };
          }
          set({ error: response?.message, isLoading: false });
          return { success: false, error: response?.message };
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return { success: false, error: error.message };
        }
      },

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await loginUser(credentials);
          
          if (response?.success) {
            const { user, token } = response.data;
            localStorage.setItem("token", token);
            const decodedUser = jwtDecode(token);
            set({ 
              user: { ...decodedUser, verification_status: user?.verification_status || 'UNVERIFIED' }, 
              token, 
              isLoading: false,
              verificationStatus: user?.verification_status || 'UNVERIFIED'
            });
            return { success: true, user: { ...decodedUser, verification_status: user?.verification_status || 'UNVERIFIED' } };
          }
          set({ error: response?.message, isLoading: false });
          return { success: false, error: response?.message };
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return { success: false, error: error.message };
        }
      },

      logout: () => {
        localStorage.removeItem("token");
        set({ user: null, token: null, verificationStatus: null });
      },

      refreshUserData: async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) return null;
          
          const response = await authClient.get("/auth/check-verification");
          if (response.data.success) {
            const { verified, verificationStatus } = response.data.data;
            const currentUser = get().user;
            set({ 
              verificationStatus: verificationStatus,
              user: currentUser ? { ...currentUser, verification_status: verificationStatus } : null
            });
            return { verified, verificationStatus };
          }
        } catch (error) {
          console.error("Refresh user error:", error);
          if (error.response?.status === 401) {
            get().logout();
          }
        }
        return null;
      },

      refreshUser: async () => {
        return get().user;
      },

      updateVerificationStatus: (status) => {
        const currentUser = get().user;
        set({ 
          user: currentUser ? { ...currentUser, verification_status: status } : null,
          verificationStatus: status
        });
      },

      isVerified: () => {
        const status = get().verificationStatus || get().user?.verification_status;
        return status === 'VERIFIED';
      },

      requiresVerification: () => {
        const status = get().verificationStatus || get().user?.verification_status;
        return status !== 'VERIFIED';
      }
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token,
        verificationStatus: state.verificationStatus 
      }),
    }
  )
);