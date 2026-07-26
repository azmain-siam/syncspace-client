# PROJECT_CONTEXT.md — Frontend Domain & Context Overview

SyncSpace is a production-grade, real-time team collaboration platform designed for modern software, product, and cross-functional teams (inspired by Jira, Linear, Notion, and Slack).

---

## 1. Domain Entities & Hierarchy

```
Platform User
  └── Workspaces (Tenant / Organization level)
        ├── Workspace Members (Role: OWNER | ADMIN | MEMBER)
        ├── Workspace Invitations (Token-based flow)
        ├── Workspace Activity Logs (Append-only feed)
        ├── Projects (Workspace-scoped project container)
        │     ├── Project Members (Role: MANAGER | LEAD | MEMBER | VIEWER)
        │     └── Boards (Kanban board view containers)
        │           └── Board Columns (Ordered workflow stages: Todo, In Progress, Review, Done)
        │                 └── Tasks (Work items with priority, order, due date, assignee)
        │                       ├── Comments (Mentions, edit tracking, cursor pagination)
        │                       ├── Attachments (Cloudinary file metadata)
        │                       └── External Task Links (Figma, GitHub, Notion, Loom, Docs)
        ├── Notifications (Event-driven: Task Assigned, Mention, Invitation)
        └── Realtime Gateway (Socket.IO namespace `/realtime` for presence & live updates)
```

---

## 2. Core Concepts & Definitions

### Workspace
Top-level multi-tenant context (`/workspaces/:workspaceId`). Every project, board, and task belongs to a single workspace. Users have role-based permissions (`OWNER`, `ADMIN`, `MEMBER`).

### Project & Board
Projects (`/workspaces/:workspaceId/projects/:projectId`) encapsulate specific initiatives, sprints, or milestone targets. Each project contains one or more Boards holding ordered workflow Columns (`TODO`, `IN_PROGRESS`, `REVIEW`, `DONE`).

### Task
The core work item inside a Board Column. Supports:
- Reordering & drag-and-drop column transfers (`dnd-kit`).
- Assignee allocation, priority levels (`LOW`, `MEDIUM`, `HIGH`, `URGENT`), due date.
- Rich attachments, external links, and activity feed.

### Activity & Audit Logs
- **Workspace Activity**: Append-only user-facing activity stream logged during task/project operations.
- **Platform Audit Log**: Security audit log for authentication events, role transfers, and invitation lifecycle.

### Real-Time Presence & Collaboration
Socket.IO connection (`/realtime`) provides user online status indicators, workspace room subscriptions, and instantaneous UI state synchronization without manual page refreshes.
