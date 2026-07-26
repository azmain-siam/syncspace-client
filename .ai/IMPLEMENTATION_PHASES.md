# IMPLEMENTATION_PHASES.md — Milestones & Testing Strategy

Incremental milestones breaking down frontend development into independently testable steps.

---

## Milestone 1: Authentication & Session Management
- **Deliverables**: Login, Registration, Password Reset, Email Verification, Google OAuth, Session Persistence.
- **Acceptance Criteria**:
  1. User can register, receive email verification notice, and verify account.
  2. Logged in user stores JWT access token in `useAuthStore`.
  3. Expired `401` access token automatically triggers `/auth/refresh` without logging the user out.

## Milestone 2: Workspace Navigation & Team Invitations
- **Deliverables**: Workspace Shell Layout, Workspace Switcher, Members Table, Tokenized Invitations.
- **Acceptance Criteria**:
  1. User can create new workspace and switch active workspace context.
  2. Owner/Admin can send email invitations (`POST /workspaces/:id/invitations`).
  3. Recipient clicking email link can validate and accept workspace invitation (`/invitations/accept`).

## Milestone 3: Kanban Board & Task Drag-and-Drop
- **Deliverables**: Project & Board Views, Board Columns, `dnd-kit` Task Cards.
- **Acceptance Criteria**:
  1. Board displays columns (`Todo`, `In Progress`, `Review`, `Done`) with ordered task cards.
  2. Dragging card to new column optimistically moves card and calls `PATCH .../tasks/:id/move`.
  3. Network failure rolls back card position smoothly.

## Milestone 4: Task Modal, Sub-resources & Real-Time Sync
- **Deliverables**: Task Modal, Markdown Comments, Mentions, Cloudinary Uploads, External Links, Socket Sync.
- **Acceptance Criteria**:
  1. Clicking card opens Task Modal dialog (`?taskId=...`).
  2. Comments render markdown and highlight `@username` mentions.
  3. Real-time updates reflect live across multiple browser windows without manual page refresh.
