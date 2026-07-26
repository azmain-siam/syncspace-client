# AUTH_FLOW.md — Authentication & Token Lifecycle Guide

This document defines the frontend client authentication mechanics, token handling, OAuth integration, and automatic refresh interceptor flows.

---

## 1. Token Architecture

The SyncSpace backend uses dual-token JWT authentication:
- **Access Token**: Short-lived JWT (`15m`). Stored in-memory in Zustand `useAuthStore` (or `localStorage` fallback) and attached as Bearer header: `Authorization: Bearer <accessToken>`.
- **Refresh Token**: Long-lived JWT (`7d`). Stored in `hashedRefreshToken` on user model and stored in HttpOnly secure cookie or returned in JSON login response.

---

## 2. Authentication Flows

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Registration & Verification                              │
│   User fills Register Form ──> POST /api/v1/auth/register   │
│   Backend sends 24h verification link                       │
│   User clicks email link ──> GET /api/v1/auth/verify-email  │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Login & Session Setup                                    │
│   User fills Login Form ──> POST /api/v1/auth/login         │
│   Returns: { user, tokens: { accessToken, refreshToken } }  │
│   Save accessToken & user in useAuthStore                   │
│   Initialize Socket.IO connection with Bearer token          │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Google OAuth Flow                                        │
│   User clicks "Sign in with Google"                          │
│   Redirect to GET /api/v1/auth/google                       │
│   Callback to GET /api/v1/auth/google/callback             │
│   Frontend extracts tokens from OAuth callback URL / params │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Axios Automatic Refresh Token Interceptor

```typescript
// src/lib/api/api-client.ts
import axios from 'axios';
import { useAuthStore } from '@/features/auth/stores/use-auth-store';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token!);
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response.data, // Strip standard { success: true, data: ... } wrapper
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          {},
          { headers: { Authorization: `Bearer ${useAuthStore.getState().refreshToken}` } }
        );

        const newTokens = refreshResponse.data.data;
        useAuthStore.getState().setTokens(newTokens.accessToken, newTokens.refreshToken);

        processQueue(null, newTokens.accessToken);
        originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        useAuthStore.getState().logout();
        window.location.href = '/login?expired=true';
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error.response?.data || error);
  }
);
```
