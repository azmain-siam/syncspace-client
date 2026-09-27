# SyncSpace — Audit 5
# Frontend Performance Audit

You are acting as a **Senior Frontend Performance Engineer**.

This audit is ONLY about frontend performance.

Do not redesign the UI.

Do not add product features.

Do not perform broad architecture refactoring.

Do not optimize based on assumptions. Inspect the implementation and identify actual or highly probable performance problems.

---

# Preparation

Read:

1. `AGENTS.md`
2. `.ai/*`
3. Existing frontend architecture
4. Audit 1–4 if available

Inspect the actual application.

---

# 1. Rendering Performance

Inspect:

- unnecessary re-renders
- large component trees
- unstable props
- expensive derived calculations
- unnecessary state updates
- excessive context updates

Do not recommend `memo`, `useMemo`, or `useCallback` everywhere.

Only use them where they solve a real problem.

---

# 2. Data Fetching

Audit:

- duplicate requests
- waterfalls
- unnecessary refetches
- stale data
- missing caching
- over-fetching
- incorrect query dependencies
- unnecessary polling

---

# 3. React Query

Inspect:

- query keys
- staleTime
- gcTime
- invalidation
- mutation behavior
- refetchOnWindowFocus
- dependent queries

Recommend changes only where appropriate.

---

# 4. Bundle Size

Inspect:

- large dependencies
- duplicate packages
- unnecessary imports
- whole-library imports
- client-side dependencies
- dynamic import opportunities

---

# 5. Client / Server Boundaries

If using a framework with server/client components, inspect whether components are unnecessarily client-side.

Identify:

- excessive client components
- unnecessary browser-only code
- large client bundles

---

# 6. Images and Assets

Audit:

- image sizing
- image optimization
- avatars
- attachments
- icons
- unnecessary large assets

---

# 7. Kanban Performance

This is a core feature.

Evaluate:

- drag/drop rendering
- large task counts
- column rendering
- task card rendering
- list updates
- drag overlays
- unnecessary re-renders

Consider realistic workspaces with hundreds of tasks.

---

# 8. Large Lists

Audit:

- members
- projects
- tasks
- comments
- activity
- notifications

Determine where pagination, infinite scrolling, or virtualization may actually be needed.

Do not add virtualization to small lists.

---

# 9. Interaction Performance

Check:

- modal opening
- navigation
- search
- filtering
- sorting
- drag/drop
- form submission

Look for noticeable delays.

---

# 10. Network Efficiency

Audit:

- request count
- request payload size
- duplicate requests
- unnecessary requests
- caching
- cancellation

---

# 11. Production Performance

Check for:

- console logging
- development-only code
- debug overlays
- source maps/config concerns where relevant
- unnecessary scripts
- unused assets

---

# 12. Performance Measurement

Where possible, identify what should be measured with:

- browser Performance tools
- Network panel
- Lighthouse
- React DevTools Profiler
- bundle analysis

Do not claim measured results unless you actually measured them.

---

# Output

Do not modify code.

Produce:

## 1. Executive Summary

## 2. Critical Performance Problems

## 3. High Priority Problems

## 4. Medium Priority Problems

## 5. Rendering Findings

## 6. Network / Data Fetching Findings

## 7. Bundle Findings

## 8. Kanban / Large List Findings

## 9. Production Findings

## 10. Measurement Plan

## 11. Prioritized Optimization Plan

Use:

- P0 — Must Fix
- P1 — Should Fix
- P2 — Later

Distinguish measured problems from suspected problems.

Do not implement yet.
