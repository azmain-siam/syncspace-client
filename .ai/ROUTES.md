# ROUTES.md — Frontend Route Directory & Guards

Complete routing table for the Next.js 15 App Router (`src/app/`).

---

## 1. Public Routes (Unauthenticated)

| Path | Layout | Description | Guards / Access |
|---|---|---|---|
| `/login` | `AuthLayout` | User login form | Guest only (Redirect to `/` if logged in) |
| `/register` | `AuthLayout` | Account registration | Guest only |
| `/auth/verify-email` | `AuthLayout` | Email verification token handler | Public |
| `/forgot-password` | `AuthLayout` | Password reset request | Guest only |
| `/reset-password` | `AuthLayout` | Password reset confirmation token handler | Public |
| `/invitations/accept` | `AuthLayout` | Workspace invitation landing token handler | Authenticated / Redirect to login |

---

## 2. Protected Routes (Authenticated)

All routes under `(dashboard)` wrap within `WorkspaceAppLayout` requiring a valid JWT session. All workspace parameters use **human-readable slugs** (`:workspaceSlug`).

| Path | Component / View | Breadcrumb Trail | Description |
|---|---|---|---|
| `/` | `WorkspaceRedirect` | Home | Redirects to default workspace dashboard (`/workspaces/:workspaceSlug`) |
| `/workspaces/create` | `CreateWorkspaceModal` | Workspaces > New | Create new workspace |
| `/workspaces/:workspaceSlug` | `DashboardView` | Workspace > Dashboard | High-level analytics summary KPIs |
| `/workspaces/:workspaceSlug/projects` | `ProjectsListView` | Workspace > Projects | Workspace projects overview grid |
| `/workspaces/:workspaceSlug/projects/:projectSlug` | `ProjectDetailView` | Workspace > Projects > Project | Project overview & boards list |
| `/workspaces/:workspaceSlug/projects/:projectSlug/boards/:boardSlug` | `BoardKanbanView` | Workspace > Projects > Project > Board | Interactive Kanban Board |
| `/workspaces/:workspaceSlug/activity` | `ActivityFeedView` | Workspace > Activity | Real-time workspace activity stream |
| `/workspaces/:workspaceSlug/members` | `MembersView` | Workspace > Members | Workspace member list & invitation management |
| `/workspaces/:workspaceSlug/settings` | `WorkspaceSettingsView` | Workspace > Settings | Workspace settings & ownership transfer |
| `/profile` | `UserProfileView` | Profile | Account settings & profile info |

---

## 3. Dynamic Route Parameters & Modals

- **Slug Resolution Hook (`useCurrentWorkspace`)**:
  - Automatically resolves workspace by matching `slug` or `id` (supports both `/workspaces/my-workspace-slug` and legacy UUID `/workspaces/8c359065-...`).
- **Task Details Intercepted Modal**:
  - Modal Route: `/workspaces/:workspaceSlug/projects/:projectSlug/boards/:boardSlug?taskId=:taskId`
  - Rendered over the active Board view as a Radix Dialog overlay so the background board state remains visible.
