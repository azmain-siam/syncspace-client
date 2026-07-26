# AGENTS.md — Frontend AI Agent Execution Rules

This document defines mandatory rules, design patterns, architectural guardrails, and coding conventions for AI agents (and human developers) building the SyncSpace Next.js frontend client.

---

## 1. Core Principles

1. **Backend as Ground Truth**: Never invent API endpoints, field names, WebSocket payload shapes, or permission rules. Always match the backend schema precisely as defined in `prisma/schema.prisma` and OpenAPI specification (`/api/v1`).
2. **Feature-First Architecture**: Group code by feature (e.g. `src/features/auth`, `src/features/workspace`, `src/features/task`) rather than by technical layer alone.
3. **Type Safety & Strict Contracts**: Utilize TypeScript strict mode everywhere. Share DTO schemas across forms (via Zod) and API requests (via Axios / TanStack Query).
4. **Server vs. Client Component Boundaries**:
   - Default to Server Components (`RSC`) for page shells, static SEO layout, and initial data fetching where possible.
   - Use Client Components (`"use client"`) ONLY when interactive state, browser hooks, form handlers, drag-and-drop (`dnd-kit`), or Socket.IO listeners are required.
5. **Zero Ad-hoc Styling**: Strict adherence to standard tokens from Tailwind CSS v4 and `shadcn/ui`. Never hardcode custom hex colors or arbitrary inline pixel values.

---

## 2. Coding Rules & Guidelines

- **File Naming**:
  - Components: `kebab-case.tsx` (e.g., `task-card.tsx`, `workspace-sidebar.tsx`)
  - Hooks: `use-kebab-case.ts` (e.g., `use-task-move.ts`, `use-realtime-room.ts`)
  - Utilities / Services: `kebab-case.ts` (e.g., `api-client.ts`, `date-formatter.ts`)
- **State Selection**:
  - Server Data & Cache → TanStack Query (`useQuery`, `useMutation`).
  - Persistent UI & Active Workspace Context → Zustand stores (`useWorkspaceStore`).
  - Transient Form State → React Hook Form + Zod.
  - Route parameters & Filters → Next.js `useSearchParams` & `useParams`.
- **API Requests**:
  - Always use the centralized `apiClient` instance configured with response interceptors for automatic JWT refresh (`/auth/refresh`) and error normalization.

---

## 3. Interaction & Accessibility Standards

- All interactive controls (buttons, dropdowns, inputs, dialogs) MUST have accessible labels (`aria-label`, `htmlFor`), keyboard navigation, and visible focus rings (`focus-visible:ring-2`).
- Loading states must use skeleton screens matching the exact DOM layout rather than generic centered spinners.
- Toast notifications MUST use `sonner` with clear user action feedback.

---

## 4. AI Agent Workflow Instructions

1. **Read Task & Target Feature**: Inspect `.frontend-ai/FEATURES.md` and `.frontend-ai/ROUTES.md` before implementing any page or component.
2. **Verify API Endpoints**: Cross-reference `.frontend-ai/API_INTEGRATION.md` for exact URLs, request payloads, response data structures, and query key invalidation targets.
3. **Check Permission Matrix**: Inspect `.frontend-ai/PERMISSION_MATRIX.md` to ensure correct RBAC checks (Owner, Admin, Member) are rendered using permission hooks.
4. **Verify WebSocket Sync**: Check `.frontend-ai/WEBSOCKET_EVENTS.md` if the feature requires real-time presence or live board/task synchronization.
