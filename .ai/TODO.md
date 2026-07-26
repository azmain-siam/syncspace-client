# TODO.md — Frontend Development Task Tracker

Phase-by-phase implementation checklist for building the SyncSpace frontend client application.

---

# Development Progress Legend
- [ ] ⏳ Planned
- [ ] 🚧 In Progress
- [ ] ✅ Completed

---

# Milestone 1 — Foundation & Authentication Setup
- [ ] ⏳ Initialize Next.js 15 App Router project with Tailwind CSS v4 and `shadcn/ui`.
- [ ] ⏳ Set up Axios `apiClient` with automatic JWT refresh token response interceptor (`src/lib/api/api-client.ts`).
- [ ] ⏳ Implement Zustand `useAuthStore` with persistent storage.
- [ ] ⏳ Build Authentication Layout and Screens (`/login`, `/register`, `/forgot-password`, `/reset-password`, `/auth/verify-email`).
- [ ] ⏳ Implement Google OAuth redirect button & callback handler.

# Milestone 2 — App Shell & Workspace Management
- [ ] ⏳ Implement `WorkspaceAppLayout` with responsive Sidebar, Top Navigation, and Profile Menu.
- [ ] ⏳ Build Workspace Creation Modal (`/workspaces/create`).
- [ ] ⏳ Build Workspace Selector Dropdown and Active Workspace Store (`useWorkspaceStore`).
- [ ] ⏳ Build Workspace Members Table & Email Invitation Modal (`/workspaces/:workspaceId/members`).
- [ ] ⏳ Build Workspace Invitation Acceptance Landing Page (`/invitations/accept?token=...`).

# Milestone 3 — Projects, Boards & Kanban (`dnd-kit`)
- [ ] ⏳ Build Projects Grid View & New Project Modal (`/workspaces/:workspaceId/projects`).
- [ ] ⏳ Build Board Column Layout (`/workspaces/:workspaceId/projects/:pId/boards/:bId`).
- [ ] ⏳ Integrate `dnd-kit` drag-and-drop for task reordering and column transfers.
- [ ] ⏳ Implement optimistic mutations for task moves (`useMoveTaskMutation`).

# Milestone 4 — Task Details, Comments & File Attachments
- [ ] ⏳ Build Task Details Modal (`?taskId=:taskId`).
- [ ] ⏳ Implement Markdown Comment Stream with `@mention` autocomplete popover.
- [ ] ⏳ Build Cloudinary File Attachment Drag-and-Drop Uploader & Asset List.
- [ ] ⏳ Build External Task Links Manager (Figma, GitHub, Notion, Loom, Docs).

# Milestone 5 — Real-Time Integration & Notifications
- [ ] ⏳ Implement Socket.IO Client Provider (`/realtime` namespace).
- [ ] ⏳ Implement Room Join / Leave hooks (`room:join` for board & task rooms).
- [ ] ⏳ Connect Socket events (`task.created`, `task.moved`, `comment.created`) to TanStack Query invalidation.
- [ ] ⏳ Build Notification Bell & Popover List (`/notifications`).

# Milestone 6 — Search, Analytics & Polish
- [ ] ⏳ Build Global Workspace Search Command Palette (`Ctrl+K`).
- [ ] ⏳ Build Dashboard Analytics Summary View (KPI cards, charts, member workload table).
- [ ] ⏳ Add Dark Mode support (`next-themes`).
- [ ] ⏳ Add Skeletons and Empty State fallback components across all views.
