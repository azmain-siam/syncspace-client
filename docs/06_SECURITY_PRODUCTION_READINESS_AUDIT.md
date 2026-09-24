# SyncSpace — Audit 6
# Frontend Security & Production Readiness Audit

You are acting as a **Senior Frontend Security Engineer and Production Readiness Engineer**.

This audit is ONLY about frontend-side security risks and production readiness.

Do not claim that the backend is secure based on frontend inspection.

Do not change backend code.

Do not redesign the UI.

Do not perform broad performance optimization.

---

# Preparation

Read:

1. `AGENTS.md`
2. `.ai/*`
3. Frontend architecture documentation
4. Audit 1–5 if available

Inspect the actual frontend implementation.

---

# 1. Secrets

Search for:

- API keys
- private keys
- service credentials
- database credentials
- server secrets
- tokens accidentally committed
- secrets embedded in client bundles

Distinguish public client configuration from actual secrets.

---

# 2. Authentication

Audit frontend handling of:

- access tokens
- refresh tokens
- login
- logout
- token refresh
- session expiration
- protected routes
- authentication redirects

Identify unsafe or inconsistent patterns.

Do not assume a token-storage approach is insecure without explaining the actual risk.

---

# 3. Sensitive Data

Check whether sensitive user/workspace information is unnecessarily:

- stored in localStorage
- persisted in Zustand
- exposed in URLs
- logged to console
- rendered into public pages
- included in analytics payloads

---

# 4. XSS / Unsafe Rendering

Search for:

- `dangerouslySetInnerHTML`
- raw HTML rendering
- markdown rendering
- user-controlled URLs
- unsanitized content
- iframe usage
- external content embedding

Inspect whether untrusted content is handled safely.

---

# 5. URL Handling

Audit:

- redirects
- invitation tokens
- callback URLs
- external links
- attachment URLs
- user-provided links

Identify open redirect or unsafe navigation patterns where applicable.

---

# 6. Error Exposure

Check whether frontend errors expose:

- stack traces
- internal paths
- database information
- API internals
- secrets
- unnecessary technical details

Users should receive useful errors without exposing internal implementation details.

---

# 7. Production Cleanup

Search for:

- `console.log`
- debug panels
- development overlays
- test accounts
- mock data
- temporary routes
- TODOs that affect production
- placeholder content
- fake metrics
- development-only controls

The screenshot currently shows a possible development issue indicator. Determine whether any such overlay is development-only and ensure it is not part of the production product.

---

# 8. Dependency Security

Inspect package configuration for:

- outdated critical dependencies
- duplicate packages
- suspicious packages
- unnecessary packages

Do not claim a vulnerability without checking the package metadata or available audit tooling.

---

# 9. Environment Configuration

Audit:

- environment variables
- public/private prefixes
- API URLs
- development URLs
- production URLs
- accidental environment coupling

---

# 10. Production UX Readiness

Check for:

- broken links
- missing 404
- missing error boundary
- missing offline/network handling
- browser console errors
- unhandled promise errors
- broken loading states

---

# 11. Security Boundaries

Clearly distinguish:

- frontend validation
- frontend authorization UX
- actual backend authorization

The frontend must never be treated as the security boundary.

---

# Output

Do not modify code.

Produce:

## 1. Executive Summary

## 2. Critical Security Issues

## 3. High Priority Production Issues

## 4. Medium Priority Issues

## 5. Authentication Findings

## 6. Data Exposure Findings

## 7. XSS / Unsafe Rendering Findings

## 8. Environment / Secrets Findings

## 9. Development Artifact Findings

## 10. Dependency Findings

## 11. Production Readiness Checklist

## 12. Prioritized Remediation Plan

Use:

- P0 — Must Fix Before Production
- P1 — Should Fix
- P2 — Later

Do not implement changes yet.

Clearly distinguish confirmed findings from things that require runtime verification.
