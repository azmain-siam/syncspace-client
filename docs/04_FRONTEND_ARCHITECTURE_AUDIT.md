# SyncSpace — Audit 4
# Frontend Architecture & Maintainability Audit

You are acting as a **Senior Frontend Architect**.

This audit is ONLY about frontend code architecture and maintainability.

The objective is to make SyncSpace scalable for a real SaaS codebase without over-engineering it.

Do not redesign the UI.

Do not add product features.

Do not change backend APIs.

Do not perform performance optimization yet except where an architectural issue is directly responsible.

---

# Preparation

Read:

1. `AGENTS.md`
2. `.ai/*`
3. `DESIGN_SYSTEM.md`
4. `UX_PRINCIPLES.md`
5. Existing frontend architecture documentation
6. Audit 1–3 if available

Inspect the actual codebase.

---

# 1. Folder Structure

Audit:

- routes
- pages
- components
- features
- hooks
- stores
- services
- API clients
- types
- utilities
- UI primitives

Identify:

- misplaced code
- unclear ownership
- inconsistent naming
- unnecessary nesting
- duplicated structures

---

# 2. Component Architecture

Find:

- giant components
- duplicated components
- components with too many responsibilities
- page-specific components that should be shared
- abstractions that are too generic
- abstractions that are unnecessary

Prefer practical composition.

Do not create abstractions simply for the sake of abstraction.

---

# 3. State Management

Audit:

- local state
- Zustand
- React Query
- URL state
- form state

Determine whether state is stored in the correct layer.

Identify:

- duplicated server state
- unnecessary global state
- derived state stored unnecessarily
- state synchronization problems

---

# 4. React Query / Server State

Audit:

- query keys
- cache invalidation
- mutations
- stale times
- refetch behavior
- duplicate requests
- query dependencies
- optimistic updates

Do not introduce another server-state system.

---

# 5. API Layer

Audit:

- API client
- endpoint organization
- request typing
- response typing
- error handling
- authentication
- refresh handling
- file uploads
- query integration

There should be a consistent approach.

---

# 6. Forms

Audit:

- form library usage
- validation
- DTO alignment
- reusable fields
- error handling
- submission behavior

Identify duplication.

---

# 7. Shared UI

Identify repeated implementations of:

- dialogs
- buttons
- forms
- tables
- filters
- search
- pagination
- empty states
- loading states
- error states
- confirmation dialogs

Recommend shared primitives only where reuse is real.

---

# 8. Routing

Audit:

- route structure
- nested routes
- protected routes
- workspace context
- project context
- invitation routes
- authentication routes
- 404 handling

Identify confusing route ownership.

---

# 9. Type Safety

Search for:

- `any`
- unsafe casts
- duplicated interfaces
- weak API types
- missing generics
- inconsistent enum handling

Do not eliminate useful type assertions blindly.

---

# 10. Dependency Audit

Identify:

- unused dependencies
- duplicated libraries
- libraries solving the same problem
- unnecessary heavy dependencies

Do not recommend replacement libraries unless there is a clear benefit.

---

# 11. Maintainability

Ask:

> If another senior engineer joined the project tomorrow, could they understand the frontend architecture quickly?

Identify the biggest sources of confusion.

---

# Output

Do not modify code.

Produce:

## 1. Architecture Summary

## 2. Critical Problems

## 3. High Priority Problems

## 4. Medium Priority Problems

## 5. Component Architecture Findings

## 6. State Management Findings

## 7. API / React Query Findings

## 8. Routing Findings

## 9. Type Safety Findings

## 10. Dependency Findings

## 11. Recommended Architecture

## 12. Refactoring Plan

Use:

- P0 — Must Fix
- P1 — Should Fix
- P2 — Later

For each recommendation explain why it is justified.

Do not implement changes yet.
