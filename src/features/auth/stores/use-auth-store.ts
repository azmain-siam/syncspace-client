import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types/domain';

export const AUTH_STORAGE_KEYS = {
  ACCESS_TOKEN: 'syncspace_access_token',
  REFRESH_TOKEN: 'syncspace_refresh_token',
  STORE: 'syncspace-auth-storage',
} as const;

export function getStoredAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
}

export function getStoredRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      setAuth: (user, accessToken, refreshToken) => {
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, accessToken);
            localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
          } catch {
            // Storage quota or private browsing safeguard
          }
        }
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        });
      },
      setTokens: (accessToken, refreshToken) => {
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, accessToken);
            localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
          } catch {
            // Storage quota or private browsing safeguard
          }
        }
        set({
          accessToken,
          refreshToken,
          isAuthenticated: true,
        });
      },
      setUser: (user) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...user } : user,
        })),
      logout: () => {
        if (typeof window !== 'undefined') {
          try {
            localStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
            localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
          } catch {
            // Storage quota or private browsing safeguard
          }
        }
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: AUTH_STORAGE_KEYS.STORE,
      onRehydrateStorage: () => (state) => {
        if (typeof window !== 'undefined' && state) {
          try {
            if (state.accessToken) {
              localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, state.accessToken);
            }
            if (state.refreshToken) {
              localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, state.refreshToken);
            }
          } catch {
            // Storage quota safeguard
          }
        }
      },
    },
  ),
);
