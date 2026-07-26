# FRONTEND_ARCHITECTURE.md — Technical Architecture & Strategy

This document outlines the architectural decisions, design patterns, data flows, and state boundaries for the SyncSpace Next.js 15 client application.

---

## 1. Technical Stack Specifications

- **Framework**: Next.js 15 (App Router, React 19)
- **Styling**: Tailwind CSS v4 + `shadcn/ui` (Radix UI primitives)
- **Data Fetching & Caching**: TanStack Query v5 (React Query)
- **Global / App State**: Zustand v5
- **Forms & Validation**: React Hook Form v7 + Zod v3
- **HTTP Client**: Axios with interceptors
- **Real-Time Client**: Socket.IO Client v4
- **Drag-and-Drop**: `dnd-kit` (`@dnd-kit/core`, `@dnd-kit/sortable`)
- **Toast Notifications**: Sonner
- **Icons**: Lucide React

---

## 2. Server vs. Client Component Strategy

```
┌─────────────────────────────────────────────────────────────┐
│ Next.js App Router Page (Server Component / RSC)             │
│  ├── Fetches initial static parameters & metadata            │
│  └── Wraps interactive client views in Providers             │
│        │                                                    │
│        ▼                                                    │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ WorkspaceAppLayout (Client Shell)                        │ │
│ │  ├── Authenticated Session Guard & Socket Provider      │ │
│ │  ├── Sidebar & Header Navigation                       │ │
│ │  └── Feature View Container                             │ │
│ │        ├── BoardView (Client Component - dnd-kit)        │ │
│ │        ├── TaskModal (Client Component - RHF + TanStack) │ │
│ │        └── RealtimeRoomSync (Client Hook Component)     │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Layer Separation & Responsibilities

1. **App Routes (`src/app/`)**: Pure route handlers, page layouts, and page parameters. Minimal UI logic.
2. **Feature Modules (`src/features/`)**: Self-contained domain modules containing components, hooks, stores, and API calls for a specific feature.
3. **Shared Components (`src/components/ui/` & `src/components/common/`)**: Reusable UI primitives (`Button`, `Dialog`, `Avatar`, `Skeleton`) and global layouts (`Navbar`, `Sidebar`, `Breadcrumb`).
4. **Data Access Layer (`src/lib/api/` & `src/hooks/use-*.ts`)**: Axios interceptors, TanStack Query hooks, and typed API endpoints.
5. **Real-Time Layer (`src/lib/socket/`)**: Socket.IO client setup, event handlers, and cache invalidation adapters.

---

## 4. Architectural Decisions & Justifications

- **Why TanStack Query over pure Server Actions for board interactions?**: Kanban drag-and-drop operations demand instant optimistic updates (`onMutate`), immediate cache rollback on network errors (`onError`), and background cache revalidation (`onSettled`). TanStack Query provides robust optimistic UI mutation APIs out of the box.
- **Why Zustand for active workspace context?**: Workspace selection, active board rooms, and user presence toggles need synchronous cross-component state access without deep prop-drilling or Context API re-render penalties.
