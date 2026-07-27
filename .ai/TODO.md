# TODO.md — Frontend Development Task Tracker

Phase-by-phase implementation checklist for building the SyncSpace frontend client application (`/client`).

---

# Development Progress Legend
- [ ] ⏳ Planned
- [ ] 🚧 In Progress
- [ ] ✅ Completed

---

# Phase 1 — Foundation & Core Infrastructure
- [x] ✅ Initialize Next.js 15 App Router project (`/client`) with Tailwind CSS v4, OKLCH variables, and `shadcn/ui`.
- [x] ✅ Set up Axios `apiClient` with automatic JWT refresh response interceptors (`/auth/refresh`) and error normalization (`src/lib/api/api-client.ts`).
- [x] ✅ Implement Zustand `useAuthStore` with persistent storage (`syncspace-auth-storage`).
- [x] ✅ Set up global providers (`QueryProvider`, `ThemeProvider`).

# Phase 2 — Authentication & Session Management
- [x] ✅ Build Auth Layout and screens (`/login`, `/register`, `/forgot-password`, `/reset-password`, `/auth/verify-email`).
- [x] ✅ Implement Google OAuth button and callback page handler (`/auth/google/callback`).
- [x] ✅ Build guest and authenticated route protection wrappers (`GuestGuard`, `AuthGuard`).

# Phase 3 — App Shell & Workspace Management
- [x] ✅ Implement `WorkspaceAppLayout` with responsive Sidebar (2px Electric Indigo active leading edge), Top Navigation Bar, and User Profile Menu.
- [x] ✅ Build Workspace Creation Modal (`create-workspace-modal.tsx`) & Standalone View (`/workspaces/create`).
- [x] ✅ Build Workspace Selector Dropdown and Active Workspace Store (`useWorkspaceStore`).
- [x] ✅ Build Workspace Members Table (`/workspaces/:workspaceId/members`) & Email Invitation Modal.
- [x] ✅ Build Workspace Invitation Acceptance Landing Page (`/invitations/accept?token=...`).

# Phase 4 — Projects, Boards & Kanban (`dnd-kit`)
- [ ] ⏳ Build Projects Grid View & New Project Modal (`/workspaces/:workspaceId/projects`).
- [ ] ⏳ Build Board Column Layout (`/workspaces/:workspaceId/projects/:projectId/boards/:boardId`).
- [ ] ⏳ Integrate `dnd-kit` drag-and-drop for task card reordering and column transfers.
- [ ] ⏳ Implement optimistic mutations for task moves (`useMoveTaskMutation`).

# Phase 5 — Task Details Intercepted Modal & Sub-resources
- [ ] ⏳ Build Task Details Modal (`?taskId=:taskId`).
- [ ] ⏳ Implement Markdown Comment Stream with `@mention` user autocomplete popover.
- [ ] ⏳ Build Cloudinary File Attachment Drag-and-Drop Uploader & Asset List.
- [ ] ⏳ Build External Task Links Manager (Figma, GitHub, Notion, Loom, Docs).

# Phase 6 — Real-Time Socket.IO Integration & Notifications
- [ ] ⏳ Implement Socket.IO Client Provider (`/realtime` namespace) with Bearer token handshake.
- [ ] ⏳ Implement Room Join / Leave hooks (`room:join` for workspace, board, & task rooms).
- [ ] ⏳ Connect Socket events (`task.created`, `task.moved`, `comment.created`) to TanStack Query invalidation.
- [ ] ⏳ Build Notification Bell & Popover List (`/notifications`).

# Phase 7 — Search, Analytics & UI Polish
- [ ] ⏳ Build Global Workspace Search Command Palette (`Ctrl+K`).
- [ ] ⏳ Build Dashboard Analytics View (KPI summary cards, task distribution charts, member workload table).
- [ ] ⏳ Add Dark Mode support (`next-themes`).
- [ ] ⏳ Add Skeletons and Empty State fallback components across all views.
