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
