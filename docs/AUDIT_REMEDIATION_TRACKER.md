# SyncSpace — Master Audit Remediation Tracker

**Version:** 1.0  
**Status:** In Progress — Tracking Initialized  
**Source Audits:**
- [Audit 1: UX & Information Architecture](file:///home/siam/Documents/Projects/syncspace-client/docs/audit-reports/01_UX_INFORMATION_ARCHITECTURE_AUDIT.md)
- [Audit 2: Visual Design & Design System](file:///home/siam/Documents/Projects/syncspace-client/docs/audit-reports/02_VISUAL_DESIGN_SYSTEM_AUDIT.md)
- [Audit 3: Responsive Design & Accessibility](file:///home/siam/Documents/Projects/syncspace-client/docs/audit-reports/03_RESPONSIVE_ACCESSIBILITY_AUDIT.md)
- [Audit 4: Frontend Architecture & Maintainability](file:///home/siam/Documents/Projects/syncspace-client/docs/audit-reports/04_FRONTEND_ARCHITECTURE_AUDIT.md)
- [Audit 5: Frontend Performance](file:///home/siam/Documents/Projects/syncspace-client/docs/audit-reports/05_FRONTEND_PERFORMANCE_AUDIT.md)
- [Audit 6: Security & Production Readiness](file:///home/siam/Documents/Projects/syncspace-client/docs/audit-reports/06_SECURITY_PRODUCTION_READINESS_AUDIT.md)

---

## 📊 Executive Progress Dashboard

| Phase | Focus Area | Priority | Status | Completed / Total |
| :--- | :--- | :---: | :---: | :---: |
| **Phase 0** | Security, Dependencies & Core Foundations | **P0** | 🟢 Complete | 7 / 7 |
| **Phase 1** | Routing, Permissions & Data Integrity | **P0** | 🟢 Complete | 8 / 8 |
| **Phase 2** | Design System & Missing Primitives | **P1** | 🟢 Complete | 7 / 7 |
| **Phase 3** | UX Declutter, Dashboard & Performance | **P1 / P2** | 🟢 Complete | 6 / 6 |
| **Total** | **All Remediation Tracks** | — | 🟢 **All Remediations Complete** | **28 / 28** |

---

## 🛠️ Phased Remediation Work Breakdown

### Phase 0: Security, Dependencies & Core Foundations (P0)
*Goal: Eliminate critical RCE vulnerabilities, sanitize credential leaks, unify duplicate realtime sockets, and fix foundational CSS scales.*

- [x] **SEC-01**: Upgrade `next` to `^16.3.6` to resolve critical unauthenticated RCE advisories ([Audit 6: C1](file:///home/siam/Documents/Projects/syncspace-client/docs/audit-reports/06_SECURITY_PRODUCTION_READINESS_AUDIT.md#c1-nextjs-16212-has-two-critical-advisories-confirmed-exploitability-needs-verification)).
- [x] **SEC-02**: Sanitize OAuth callback query string in [`app/auth/google/callback/page.tsx`](file:///home/siam/Documents/Projects/syncspace-client/src/app/auth/google/callback/page.tsx) with synchronous `history.replaceState` before token processing ([Audit 6: C2](file:///home/siam/Documents/Projects/syncspace-client/docs/audit-reports/06_SECURITY_PRODUCTION_READINESS_AUDIT.md#c2-the-oauth-callback-puts-tokens-in-the-url-confirmed)).
- [x] **SEC-03**: Add security headers (`Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`) in [`next.config.ts`](file:///home/siam/Documents/Projects/syncspace-client/next.config.ts) ([Audit 6: H1](file:///home/siam/Documents/Projects/syncspace-client/docs/audit-reports/06_SECURITY_PRODUCTION_READINESS_AUDIT.md#h1-no-security-headers-confirmed-in-the-repo-host-behavior-needs-verification)).
- [x] **ARCH-01**: Unify Socket.IO connections by removing [`lib/socket/socket-client.ts`](file:///home/siam/Documents/Projects/syncspace-client/src/lib/socket/socket-client.ts) (`getSocket()`), consolidating all features onto [`SocketProvider`](file:///home/siam/Documents/Projects/syncspace-client/src/providers/socket-provider.tsx) ([Audit 4: C1](file:///home/siam/Documents/Projects/syncspace-client/docs/audit-reports/04_FRONTEND_ARCHITECTURE_AUDIT.md#c1-two-socketio-connections-with-incompatible-protocols)).
- [x] **ARCH-02**: Implement centralized session teardown in `useLogout`: disconnect all socket rooms, purge `syncspace-auth-storage`, and clear TanStack Query cache ([Audit 4: C1](file:///home/siam/Documents/Projects/syncspace-client/docs/audit-reports/04_FRONTEND_ARCHITECTURE_AUDIT.md#c1-two-socketio-connections-with-incompatible-protocols), [Audit 6: C4](file:///home/siam/Documents/Projects/syncspace-client/docs/audit-reports/06_SECURITY_PRODUCTION_READINESS_AUDIT.md#1-executive-summary)).
- [x] **DES-01**: Fix `globals.css` monotonic radius scale order (`rounded-sm`: 4px, `rounded-md`: 8px, `rounded-lg`: 12px, `rounded-xl`: 16px, `rounded-2xl`: 24px) ([Audit 2: 2.1](file:///home/siam/Documents/Projects/syncspace-client/docs/audit-reports/02_VISUAL_DESIGN_SYSTEM_AUDIT.md#21-the-radius-scale-is-out-of-order)).
- [x] **DES-02**: Install and configure `tw-animate-css` / `tailwindcss-animate` to restore non-functional dialog/sheet transition animations ([Audit 2: 3.2](file:///home/siam/Documents/Projects/syncspace-client/docs/audit-reports/02_VISUAL_DESIGN_SYSTEM_AUDIT.md#32-every-openclose-animation-is-silently-broken)).

---

### Phase 1: Information Architecture, Routing & Data Integrity (P0)
*Goal: Fix broken inbound links (404s), unlock Member permissions on boards, establish single sources of truth for tasks/boards, and prevent cache invalidation storms.*

- [x] **ROUT-01**: Implement Canonical Task Routing (`/tasks/:taskKey` or `/workspaces/:ws/projects/:project?task=:taskKey`) that opens the task detail panel; point notifications, global search, and comments directly to it ([Audit 1: 2.1](file:///home/siam/Documents/Projects/syncspace-client/docs/audit-reports/01_UX_INFORMATION_ARCHITECTURE_AUDIT.md#21-links-into-tasks-lead-to-pages-that-dont-exist)).
- [x] **ROUT-02**: Introduce URL routing for boards and tabs (`/projects/:projectKey/boards/:boardId` and `/projects/:projectKey/backlog`) so page refresh and sharing preserve active context ([Audit 1: 2.4](file:///home/siam/Documents/Projects/syncspace-client/docs/audit-reports/01_UX_INFORMATION_ARCHITECTURE_AUDIT.md#24-boards-and-project-tabs-have-no-url)).
- [x] **PERM-01**: Consolidate RBAC into a single `useWorkspacePermissions` hook matching backend matrix: allow `MEMBER` to create, move, and edit tasks across Board, Sprints, and My Tasks ([Audit 1: 2.2](file:///home/siam/Documents/Projects/syncspace-client/docs/audit-reports/01_UX_INFORMATION_ARCHITECTURE_AUDIT.md#22-members-get-a-read-only-board), [Audit 4: C5](file:///home/siam/Documents/Projects/syncspace-client/docs/audit-reports/04_FRONTEND_ARCHITECTURE_AUDIT.md#1-architecture-summary)).
- [x] **PERM-02**: Restrict project creation, edit, and archive actions to authorized roles only (`OWNER`/`ADMIN`), preventing 403 error toasts ([Audit 1: 3.2](file:///home/siam/Documents/Projects/syncspace-client/docs/audit-reports/01_UX_INFORMATION_ARCHITECTURE_AUDIT.md#32-project-actions-appear-for-people-who-cant-use-them)).
- [x] **AUTH-01**: Preserve `?redirect=` URL query param through login, registration, and email verification so invitees land directly in their joined workspace ([Audit 1: 2.3](file:///home/siam/Documents/Projects/syncspace-client/docs/audit-reports/01_UX_INFORMATION_ARCHITECTURE_AUDIT.md#23-the-invitation-flow-loses-its-context)).
- [x] **DATA-01**: Establish single source of truth for Task Status vs. Column: make column authoritative on the board and remove contradictory status pickers ([Audit 1: 2.5](file:///home/siam/Documents/Projects/syncspace-client/docs/audit-reports/01_UX_INFORMATION_ARCHITECTURE_AUDIT.md#25-a-task-has-two-separate-status-values)).
- [x] **DATA-02**: Fix query key fragmentation and factory usage: eliminate singular `['task', id]` typos and narrow invalidations to affected columns/tasks, stopping 100-request refetch storms ([Audit 4: C2](file:///home/siam/Documents/Projects/syncspace-client/docs/audit-reports/04_FRONTEND_ARCHITECTURE_AUDIT.md#c2-query-keys-dont-match-so-refreshes-rely-on-over-broad-invalidation), [Audit 5: C1](file:///home/siam/Documents/Projects/syncspace-client/docs/audit-reports/05_FRONTEND_PERFORMANCE_AUDIT.md#c1-every-task-change-triggers-a-refetch-storm-confirmed-request-counts-need-measuring)).
- [x] **DATA-03**: Fix Kanban column task truncation: configure explicit page/limit params and add load-more so columns with >20 tasks are not hidden ([Audit 1: 2.6](file:///home/siam/Documents/Projects/syncspace-client/docs/audit-reports/01_UX_INFORMATION_ARCHITECTURE_AUDIT.md#26-kanban-columns-may-silently-hide-tasks), [Audit 5: C2](file:///home/siam/Documents/Projects/syncspace-client/docs/audit-reports/05_FRONTEND_PERFORMANCE_AUDIT.md#c2-large-boards-are-silently-truncated-confirmed)).

---

### Phase 2: Design System & Missing Primitives (P1)
*Goal: Build missing core UI primitives, eliminate 390 raw color classes, restore keyboard accessibility, and enforce WCAG contrast.*

- [x] **PRIM-01**: Implement missing Radix UI primitives:
  - `Select` (replaces ~14 divergent native `<select>` tags)
  - `Tooltip` (replaces raw `title=""` attributes)
  - `AlertDialog` (replaces browser native `confirm()` in task detail sheet)
  - `Tabs` (replaces 4 fragmented tab patterns)
  - `Popover` (replaces nested dropdown traps in popovers)
  - `EmptyState` & `ErrorState` reusable primitives
  ([Audit 2: 3.3](file:///home/siam/Documents/Projects/syncspace-client/docs/audit-reports/02_VISUAL_DESIGN_SYSTEM_AUDIT.md#33-missing-primitives-cause-visual-fragmentation)).
- [x] **TOK-01**: Align design tokens and semantic colors: resolve discrepancies between `.ai/DESIGN_SYSTEM.md` and `globals.css`, eliminating 390 ad-hoc palette classes ([Audit 2: 1. Executive Summary](file:///home/siam/Documents/Projects/syncspace-client/docs/audit-reports/02_VISUAL_DESIGN_SYSTEM_AUDIT.md#1-executive-summary)).
- [x] **TOK-02**: Standardize Task Status and Priority colors across Board, Cards, Task Sheet, My Tasks, Sprints, and Dashboard charts ([Audit 2: 2.2](file:///home/siam/Documents/Projects/syncspace-client/docs/audit-reports/02_VISUAL_DESIGN_SYSTEM_AUDIT.md#22-status-and-priority-colors-contradict-each-other-across-pages)).
- [x] **A11Y-01**: Restore visible keyboard focus rings on `SegmentedControl`, `WorkspaceSettingsNav`, board filters, and notification rows ([Audit 2: 2.3](file:///home/siam/Documents/Projects/syncspace-client/docs/audit-reports/02_VISUAL_DESIGN_SYSTEM_AUDIT.md#23-keyboard-focus-is-invisible-on-several-core-controls), [Audit 3: 2.3](file:///home/siam/Documents/Projects/syncspace-client/docs/audit-reports/03_RESPONSIVE_ACCESSIBILITY_AUDIT.md#23-several-controls-show-no-focus-indicator)).
- [x] **A11Y-02**: Fix Notification popover & Emoji picker keyboard trap: replace `DropdownMenu` wrapper with Radix `Popover` so Tab and arrow keys reach all child items ([Audit 3: 2.1](file:///home/siam/Documents/Projects/syncspace-client/docs/audit-reports/03_RESPONSIVE_ACCESSIBILITY_AUDIT.md#21-notifications-and-emoji-reactions-cant-be-reached-by-keyboard)).
- [x] **A11Y-03**: Fix Kanban card keyboard interaction: separate Enter/Space to open detail sheet from drag-and-drop picking; add sensible accessible announcements ([Audit 3: 2.2](file:///home/siam/Documents/Projects/syncspace-client/docs/audit-reports/03_RESPONSIVE_ACCESSIBILITY_AUDIT.md#22-tasks-cant-be-opened-from-the-board-by-keyboard)).
- [x] **A11Y-04**: Form accessibility: associate error messages using `aria-invalid` and `aria-describedby`; connect all inputs to visible `<label htmlFor>` elements ([Audit 3: 2.4](file:///home/siam/Documents/Projects/syncspace-client/docs/audit-reports/03_RESPONSIVE_ACCESSIBILITY_AUDIT.md#24-form-errors-arent-connected-to-their-fields-and-many-inputs-have-no-real-name)).

---

### Phase 3: UX Declutter, Dashboard & Performance (P1 / P2)
*Goal: Realign executive dashboard around personal actionable work, eliminate dead UI elements, and split heavy client bundles.*

- [x] **DASH-01**: Refactor Workspace Home/Dashboard:
  - Add "My Work" section (assigned tasks due soon/overdue)
  - Keep Overdue tasks alert and Member Workload breakdown
  - Remove vanity "Workspace Scale" card, hardcoded "ACTIVE" badge, and duplicate "Workspace Operations" buttons
  ([Audit 1: Section 8](file:///home/siam/Documents/Projects/syncspace-client/docs/audit-reports/01_UX_INFORMATION_ARCHITECTURE_AUDIT.md#8-dashboard-findings), [Audit 2: 4.1](file:///home/siam/Documents/Projects/syncspace-client/docs/audit-reports/02_VISUAL_DESIGN_SYSTEM_AUDIT.md#4-medium-priority-issues)).
- [x] **NAV-01**: Clean up redundant navigation:
  - Build breadcrumbs from real entity names (Workspace › Project › Board)
  - Remove duplicate "Back to..." buttons
  - Remove placeholder project "Activity" tab and redundant `/projects/:id/backlog` route
  ([Audit 1: 3.3, 3.4](file:///home/siam/Documents/Projects/syncspace-client/docs/audit-reports/01_UX_INFORMATION_ARCHITECTURE_AUDIT.md#33-breadcrumbs-are-built-from-raw-url-segments)).
- [x] **RESP-01**: Fix mobile viewport cutoff: replace `h-screen` with `dvh` in app shell; add `max-h-[85dvh] overflow-y-auto` to all dialogs so submit buttons cannot be hidden offscreen ([Audit 3: 3.1, 3.2](file:///home/siam/Documents/Projects/syncspace-client/docs/audit-reports/03_RESPONSIVE_ACCESSIBILITY_AUDIT.md#31-the-app-shell-uses-h-screen-100vh)).
- [x] **PERF-01**: Implement route-level dynamic imports with `next/dynamic` for heavy components:
  - Task Detail Sheet (saves ~38 KB gzip on board/backlog load)
  - Form dialogs (Workspace Create, Project Create, Invite Modal)
  - Command Palette modal (`SearchCommandModal`)
  ([Audit 5: H1](file:///home/siam/Documents/Projects/syncspace-client/docs/audit-reports/05_FRONTEND_PERFORMANCE_AUDIT.md#h1-there-are-no-dynamic-imports-so-heavy-modules-load-eagerly-measured)).
- [x] **PERF-02**: Decouple public landing & auth routes from the authenticated runtime: move `SocketProvider` and Axios to `(dashboard)` layout so public pages do not ship socket/API client bundles ([Audit 5: H2](file:///home/siam/Documents/Projects/syncspace-client/docs/audit-reports/05_FRONTEND_PERFORMANCE_AUDIT.md#h2-the-landing-and-auth-pages-ship-the-whole-app-runtime-measured)).
- [x] **POLISH-01**: Remove fake enterprise social proof, mock uptime numbers, and dead legal links from public marketing landing page ([Audit 2: 3.8](file:///home/siam/Documents/Projects/syncspace-client/docs/audit-reports/02_VISUAL_DESIGN_SYSTEM_AUDIT.md#38-auth-and-landing-pages-use-a-separate-visual-language), [Audit 6: 1. Executive Summary](file:///home/siam/Documents/Projects/syncspace-client/docs/audit-reports/06_SECURITY_PRODUCTION_READINESS_AUDIT.md#1-executive-summary)).

---

## 🛡️ Remediation Quality Gates Protocol

Every item checked off in this tracker must pass four non-negotiable verification gates:

1. **TypeScript Strict Typecheck**: `npx tsc --noEmit` exits with `0` errors.
2. **ESLint Static Analysis**: `npm run lint` exits with `0` errors and `0` new warnings.
3. **Production Next.js Build**: `npm run build` compiles with 0 build errors across all routes.
4. **Targeted Verification**: Real browser validation confirming the specific bug is resolved and no regressions occurred.
