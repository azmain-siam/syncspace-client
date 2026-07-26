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

All routes under `(dashboard)` wrap within `WorkspaceAppLayout` requiring a valid JWT session.

| Path | Component / View | Breadcrumb Trail | Description |
|---|---|---|---|
| `/` | `WorkspaceRedirect` | Home | Redirects to default workspace dashboard |
| `/workspaces/create` | `CreateWorkspaceModal` | Workspaces > New | Create new workspace |
| `/workspaces/:workspaceId` | `DashboardView` | Workspace > Dashboard | High-level analytics summary KPIs |
| `/workspaces/:workspaceId/projects` | `ProjectsListView` | Workspace > Projects | Workspace projects overview grid |
| `/workspaces/:workspaceId/projects/:projectId` | `ProjectDetailView` | Workspace > Projects > Project | Project overview & boards list |
| `/workspaces/:workspaceId/projects/:projectId/boards/:boardId` | `BoardKanbanView` | Workspace > Projects > Project > Board | Interactive Kanban Board |
| `/workspaces/:workspaceId/activities` | `ActivityFeedView` | Workspace > Activity | Real-time workspace activity stream |
| `/workspaces/:workspaceId/members` | `MembersView` | Workspace > Members | Workspace member list & invitation management |
| `/workspaces/:workspaceId/settings` | `WorkspaceSettingsView` | Workspace > Settings | Workspace settings & ownership transfer |
| `/profile` | `UserProfileView` | Profile | Account settings & profile info |

---

## 3. Dynamic Route Parameters & Modals

- **Task Details Intercepted Modal**:
  - Modal Route: `/workspaces/:wId/projects/:pId/boards/:bId?taskId=:taskId`
  - Rendered over the active Board view as a Radix Dialog overlay so the background board state remains visible.
