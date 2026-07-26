# UI_SPEC.md — Screen & Interface Specifications

Detailed UI/UX specifications for every major view, modal, drawer, and layout in the SyncSpace client.

---

## 1. Authentication Screens

### 1.1 Login Screen (`/login`)
- **Layout**: Centered glassmorphic card on dark background.
- **Form Controls**: Email input (`@IsEmail`), Password input, "Sign in" submit button, Google OAuth button (`/api/v1/auth/google`), "Forgot Password?" link, "Register" link.
- **States**: Default, Submitting (disabled button with spinner), Error toast / helper text (`Invalid credentials`, `Please verify your email`).

### 1.2 Registration Screen (`/register`)
- **Form Controls**: Full Name, Username, Email, Phone (optional), Password, Confirm Password.
- **Interactions**: On successful submit, render success message asking user to check their email for the 24h verification link.

### 1.3 Verify Email Screen (`/auth/verify-email?token=...`)
- **Interactions**: Auto-executes `GET /api/v1/auth/verify-email?token=...` on mount.
- **States**: Loading spinner ("Verifying your email..."), Success screen with "Continue to Login" button, Error screen with "Resend Verification Email" button.

### 1.4 Forgot & Reset Password (`/forgot-password`, `/reset-password?token=...`)
- **Forgot**: Email input. Submits to `POST /auth/forgot-password` (displays non-enumerated success toast).
- **Reset**: Password + Confirm Password inputs. Submits to `POST /auth/reset-password`.

---

## 2. Workspace Shell Layout (`/workspaces/:workspaceId/*`)

### 2.1 Top Navigation Bar
- Workspace Selector Dropdown (Lists user workspaces + "Create Workspace" trigger).
- Global Workspace Search Bar (`Ctrl+K` trigger opening Command Palette).
- Presence Indicator Pill (Online workspace members count & avatars).
- Notification Bell Icon (Unread counter badge + popover dropdown).
- User Profile Menu (Avatar, Name, Email, Settings link, Dark mode toggle, Logout trigger).

### 2.2 Left Sidebar Navigation
- Navigation Links: Dashboard (`/`), Projects (`/projects`), Activity Feed (`/activities`), Members (`/members`), Settings (`/settings`).
- Favorites / Pinned Projects List.
- Active Workspace Role Badge (`OWNER`, `ADMIN`, `MEMBER`).

---

## 3. Workspace Views

### 3.1 Dashboard (`/workspaces/:workspaceId`)
- **Widgets**:
  1. Summary KPI Cards (Total Projects, Total Tasks, Overdue Tasks, Completed This Week).
  2. Task Distribution Chart (Pie / Bar breakdown by Status and Priority).
  3. Productivity Throughput Chart (Tasks created vs. completed over time).
  4. Member Workload Table (Task allocation per team member).

### 3.2 Kanban Board View (`/workspaces/:workspaceId/projects/:projectId/boards/:boardId`)
- **Layout**: Horizontal scroll container of Board Columns.
- **Header**: Board Title, Filter Bar (Filter by Priority, Status, Assignee, Search Query), "Add Column" button, "New Task" trigger.
- **Column Component**: Column Header (Title, Task Count, Drag handle, Dropdown menu: Rename, Delete), Vertical list of Task Cards, "Add Task" quick button at column bottom.
- **Task Card Component**: Priority badge, Task Title, Assignee Avatar, Due date pill (turns red if overdue), Comment & Attachment count icons. Drag handle for `dnd-kit`.

### 3.3 Task Details Modal (`.../tasks/:taskId`)
- **Header**: Column Breadcrumb, Task Title (inline editable), Action Menu (Delete task, Copy link).
- **Left Column**:
  - Description Editor (Markdown / Rich text).
  - External Task Links Section (Add link dialog: Figma, GitHub, Google Doc, Notion, Loom; List with icon previews).
  - Attachments Section (Cloudinary drag-and-drop file uploader, file list with preview/download/delete buttons).
  - Activity & Comments Tab (Real-time comment stream, `@mention` autocomplete popup, markdown comments, edit/delete actions).
- **Right Sidebar**:
  - Status Select Dropdown (`TODO`, `IN_PROGRESS`, `REVIEW`, `DONE`).
  - Priority Select Dropdown (`LOW`, `MEDIUM`, `HIGH`, `URGENT`).
  - Assignee Picker (Workspace members dropdown with search).
  - Due Date Picker (Calendar popover).
  - Creator & Creation Timestamp.

---

## 4. Notifications Popover
- Tabs: All / Unread.
- Notification Items: Actor Avatar, Action Text ("John assigned you to Task #12"), Link to task modal, Relative timestamp ("5m ago"), Mark as Read checkmark button.
- Footer: "Mark all as read" button.
