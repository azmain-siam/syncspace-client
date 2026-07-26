# USER_JOURNEYS.md — End-to-End Frontend User Flows

Step-by-step user journeys detailing interaction flows, page transitions, and API invocations for primary user personas.

---

## Journey 1: New Team Lead Registration & Workspace Setup

```
1. Landing Page / Login (`/login`)
   └── Click "Register" link ──> Navigate to `/register`

2. Account Registration (`/register`)
   └── Fill Name, Username, Email, Password ──> Submit form
   └── Trigger POST /api/v1/auth/register
   └── UI displays notification: "Check your email inbox for a verification link."

3. Email Verification (`/auth/verify-email?token=xyz`)
   └── User clicks verification link in email client
   └── Mount trigger GET /api/v1/auth/verify-email?token=xyz
   └── UI displays "Email Verified!" ──> Click "Continue to Login"

4. Login (`/login`)
   └── Fill credentials ──> Trigger POST /api/v1/auth/login
   └── Save JWT access & refresh tokens in useAuthStore
   └── Initialize Socket.IO connection `/realtime`
   └── Redirect to default workspace or Workspace Creation Modal (`/workspaces/create`)

5. Workspace Creation (`/workspaces/create`)
   └── Enter Workspace Name ("Acme Engineering") ──> Trigger POST /api/v1/workspaces
   └── Set activeWorkspaceId in store ──> Redirect to `/workspaces/:workspaceId`

6. Team Invitation (`/workspaces/:workspaceId/members`)
   └── Click "Invite Member" ──> Fill email & role ("MEMBER")
   └── Trigger POST /api/v1/workspaces/:workspaceId/invitations
   └── Display Sonner Toast: "Invitation email sent to dev@acme.com"

7. Project & Board Setup (`/workspaces/:workspaceId/projects`)
   └── Click "New Project" ──> Enter Title ("Sprint 1"), Priority ("HIGH")
   └── Trigger POST /api/v1/workspaces/:workspaceId/projects
   └── Create default Board ("Main Board") ──> Create Columns ("Todo", "In Progress", "Done")

8. Task Creation & Drag-and-Drop Collaboration
   └── Click "+ Add Task" in "Todo" Column ──> Title: "Implement JWT Interceptor"
   └── Drag task card from "Todo" to "In Progress"
   └── Trigger PATCH .../tasks/:taskId/move
   └── Socket emits `task.moved` ──> All connected workspace team members see card move live!
```

---

## Journey 2: Invited Team Member Acceptance & Collaboration

```
1. Email Invitation Link
   └── Member receives email with link `/invitations/accept?token=inv-token-999`

2. Token Validation & Account Match Check (`/invitations/accept`)
   └── Mount trigger GET /api/v1/workspace-invitations/validate?token=inv-token-999
   └── Displays Workspace Logo, Name ("Acme Engineering"), Inviter Name ("John Lead")
   └── Member clicks "Accept Invitation"
   └── Trigger POST /api/v1/workspace-invitations/accept

3. Immediate Collaboration
   └── User redirected to `/workspaces/:workspaceId`
   └── Joined room `workspace:workspaceId` on Socket.IO
   └── User sees assigned tasks, opens Task Details Modal (`?taskId=xyz`)
   └── Posts markdown comment with @mention ("@john check this PR")
   └── Uploads design asset file to Cloudinary
```
