# API_INTEGRATION.md — Complete Backend API Mapping & Hooks

Mapping of all backend REST API endpoints to frontend components, TanStack Query hooks, cache key strategies, and route parameter assembly rules.

---

## 1. Authentication Endpoints

| Method | Endpoint Path | Hook Name | Type | Purpose | Cache Key / Invalidation |
|---|---|---|---|---|---|
| `POST` | `/auth/register` | `useRegisterMutation` | Mutation | Register new user account | None |
| `GET` | `/auth/verify-email?token=` | `useVerifyEmailQuery` | Query | Verify email address | `['auth', 'verify', token]` |
| `POST` | `/auth/resend-verification` | `useResendVerificationMutation` | Mutation | Resend verification email | None |
| `POST` | `/auth/login` | `useLoginMutation` | Mutation | Authenticate user | Set auth state store |
| `POST` | `/auth/refresh` | `useRefreshTokenMutation` | Mutation | Refresh access token | Set auth tokens store |
| `POST` | `/auth/logout` | `useLogoutMutation` | Mutation | Terminate user session | Clear query client cache |
| `POST` | `/auth/forgot-password` | `useForgotPasswordMutation` | Mutation | Request password reset email | None |
| `POST` | `/auth/reset-password` | `useResetPasswordMutation` | Mutation | Reset password with token | None |
| `GET` | `/user/me` | `useCurrentUserQuery` | Query | Get logged in user profile | `['user', 'me']` |

> **Note on Profile Updates**: `GET /user/me` is currently read-only. Profile editing is disabled until a `PATCH /user/me` endpoint is explicitly added to the backend.

---

## 2. Workspace Endpoints

| Method | Endpoint Path | Hook Name | Type | Purpose | Cache Key / Invalidation |
|---|---|---|---|---|---|
| `POST` | `/workspaces` | `useCreateWorkspaceMutation` | Mutation | Create new workspace | Invalidates `['workspaces', 'my']` |
| `GET` | `/workspaces` | `useMyWorkspacesQuery` | Query | List user workspaces | `['workspaces', 'my']` |
| `GET` | `/workspaces/:id/members` | `useWorkspaceMembersQuery` | Query | List workspace members | `['workspaces', wId, 'members']` |
| `POST` | `/workspaces/:id/invitations` | `useSendInvitationMutation` | Mutation | Invite team member via email | Invalidates `['workspaces', wId, 'activities']` |
| `GET` | `/workspace-invitations/validate?token=` | `useValidateInvitationQuery` | Query | Validate invitation token | `['invitations', 'validate', token]` |
| `POST` | `/workspace-invitations/accept` | `useAcceptInvitationMutation` | Mutation | Accept workspace invitation | Invalidates `['workspaces', 'my']` |
| `POST` | `/workspace-invitations/decline` | `useDeclineInvitationMutation` | Mutation | Decline workspace invitation | None |
| `PATCH` | `/workspaces/:id/settings` | `useUpdateWorkspaceMutation` | Mutation | Update workspace settings | Invalidates `['workspaces', wId]` |
| `POST` | `/workspaces/:id/transfer-ownership` | `useTransferOwnershipMutation` | Mutation | Transfer workspace ownership | Invalidates `['workspaces', wId, 'members']` |

> **Note on Single Workspace Lookup**: Single workspace details (`useWorkspaceQuery`) are resolved client-side by selecting from the cached array returned by `GET /workspaces`.

---

## 3. Projects, Boards & Columns

| Method | Endpoint Path | Hook Name | Type | Purpose | Cache Key / Invalidation |
|---|---|---|---|---|---|
| `POST` | `/workspaces/:wId/projects` | `useCreateProjectMutation` | Mutation | Create project | Invalidates `['projects', wId]` |
| `GET` | `/workspaces/:wId/projects` | `useProjectsQuery` | Query | List workspace projects | `['projects', wId]` |
| `GET` | `/workspaces/:wId/projects/:pId` | `useProjectQuery` | Query | Get single project | `['projects', wId, pId]` |
| `PATCH` | `/workspaces/:wId/projects/:pId` | `useUpdateProjectMutation` | Mutation | Update project | Invalidates `['projects', wId, pId]` |
| `PATCH` | `/workspaces/:wId/projects/:pId/archive` | `useArchiveProjectMutation` | Mutation | Archive project | Invalidates `['projects', wId]` |
| `POST` | `/workspaces/:wId/projects/:pId/boards` | `useCreateBoardMutation` | Mutation | Create Kanban board | Invalidates `['boards', pId]` |
| `GET` | `/workspaces/:wId/projects/:pId/boards` | `useBoardsQuery` | Query | List project boards | `['boards', pId]` |
| `POST` | `/workspaces/:wId/projects/:pId/boards/:bId/columns` | `useCreateColumnMutation` | Mutation | Create board column | Invalidates `['board', bId]` |
| `PATCH` | `/workspaces/:wId/projects/:pId/boards/:bId/columns/reorder` | `useReorderColumnsMutation` | Mutation | Reorder columns | Invalidates `['board', bId]` |
| `PATCH` | `/workspaces/:wId/projects/:pId/boards/:bId/columns/:cId` | `useUpdateColumnMutation` | Mutation | Update column title | Invalidates `['board', bId]` |
| `DELETE` | `/workspaces/:wId/projects/:pId/boards/:bId/columns/:cId` | `useDeleteColumnMutation` | Mutation | Delete column | Invalidates `['board', bId]` |

---

## 4. Tasks & Task Links

> **Full Path Rule**: Backend task and sub-resource routes require all parent IDs in the URL path (`/workspaces/:wId/projects/:pId/boards/:bId/columns/:cId/tasks/...`).

| Method | Endpoint Path | Hook Name | Type | Purpose | Cache Key / Invalidation |
|---|---|---|---|---|---|
| `POST` | `/workspaces/:wId/projects/:pId/boards/:bId/columns/:cId/tasks` | `useCreateTaskMutation` | Mutation | Create task | Invalidates `['tasks', cId]` |
| `GET` | `/workspaces/:wId/projects/:pId/boards/:bId/columns/:cId/tasks` | `useTasksQuery` | Query | List column tasks | `['tasks', cId, query]` |
| `PATCH` | `/workspaces/:wId/projects/:pId/boards/:bId/columns/:cId/tasks/:tId` | `useUpdateTaskMutation` | Mutation | Update task details | Invalidates `['task', tId]` |
| `PATCH` | `/workspaces/:wId/projects/:pId/boards/:bId/columns/:cId/tasks/:tId/move` | `useMoveTaskMutation` | Mutation | Move task across columns/orders | Optimistic updates on `['tasks', cId]` |
| `DELETE` | `/workspaces/:wId/projects/:pId/boards/:bId/columns/:cId/tasks/:tId` | `useDeleteTaskMutation` | Mutation | Soft delete task | Invalidates `['tasks', cId]` |
| `POST` | `/workspaces/:wId/projects/:pId/boards/:bId/columns/:cId/tasks/:tId/links` | `useCreateTaskLinkMutation` | Mutation | Attach external URL link | Invalidates `['task-links', tId]` |
| `GET` | `/workspaces/:wId/projects/:pId/boards/:bId/columns/:cId/tasks/:tId/links` | `useTaskLinksQuery` | Query | Get task links | `['task-links', tId]` |
| `PATCH` | `/workspaces/:wId/projects/:pId/boards/:bId/columns/:cId/tasks/:tId/links/:lId` | `useUpdateTaskLinkMutation` | Mutation | Update task link | Invalidates `['task-links', tId]` |
| `DELETE` | `/workspaces/:wId/projects/:pId/boards/:bId/columns/:cId/tasks/:tId/links/:lId` | `useDeleteTaskLinkMutation` | Mutation | Delete task link | Invalidates `['task-links', tId]` |

---

## 5. Comments, Attachments, Notifications, Search & Analytics

| Method | Endpoint Path | Hook Name | Type | Purpose | Cache Key / Invalidation |
|---|---|---|---|---|---|
| `POST` | `/workspaces/:wId/projects/:pId/boards/:bId/columns/:cId/tasks/:tId/comments` | `useCreateCommentMutation` | Mutation | Post comment with `@mentions` | Invalidates `['comments', tId]` |
| `GET` | `/workspaces/:wId/projects/:pId/boards/:bId/columns/:cId/tasks/:tId/comments` | `useTaskCommentsInfiniteQuery` | Infinite Query | Cursor paginated task comments | `['comments', tId]` |
| `PATCH` | `/workspaces/:wId/projects/:pId/boards/:bId/columns/:cId/tasks/:tId/comments/:cId` | `useUpdateCommentMutation` | Mutation | Update comment content | Invalidates `['comments', tId]` |
| `DELETE` | `/workspaces/:wId/projects/:pId/boards/:bId/columns/:cId/tasks/:tId/comments/:cId` | `useDeleteCommentMutation` | Mutation | Delete comment | Invalidates `['comments', tId]` |
| `POST` | `/workspaces/:wId/projects/:pId/boards/:bId/columns/:cId/tasks/:tId/attachments` | `useUploadAttachmentMutation` | Mutation | Upload Cloudinary attachment | Invalidates `['attachments', tId]` |
| `GET` | `/workspaces/:wId/projects/:pId/boards/:bId/columns/:cId/tasks/:tId/attachments` | `useTaskAttachmentsQuery` | Query | Get task attachments | `['attachments', tId]` |
| `DELETE` | `/workspaces/:wId/projects/:pId/boards/:bId/columns/:cId/tasks/:tId/attachments/:aId` | `useDeleteAttachmentMutation` | Mutation | Delete attachment | Invalidates `['attachments', tId]` |
| `GET` | `/workspaces/:wId/activities` | `useWorkspaceActivitiesQuery` | Query | Activity feed stream | `['activities', wId]` |
| `GET` | `/notifications` | `useNotificationsQuery` | Query | List user notifications | `['notifications']` |
| `PATCH` | `/notifications/:id/read` | `useMarkNotificationReadMutation` | Mutation | Mark notification read | Invalidates `['notifications']` |
| `PATCH` | `/notifications/read-all` | `useMarkAllNotificationsReadMutation` | Mutation | Mark all read | Invalidates `['notifications']` |
| `GET` | `/workspaces/:wId/search` | `useWorkspaceSearchQuery` | Query | Global workspace search | `['search', wId, query]` |
| `GET` | `/workspaces/:wId/dashboard/summary` | `useDashboardSummaryQuery` | Query | Analytics summary KPIs | `['dashboard', 'summary', wId]` |
| `GET` | `/workspaces/:wId/dashboard/task-distribution` | `useTaskDistributionQuery` | Query | Status/priority distribution | `['dashboard', 'distribution', wId]` |
| `GET` | `/workspaces/:wId/dashboard/productivity` | `useProductivityQuery` | Query | Tasks created vs completed | `['dashboard', 'productivity', wId]` |
| `GET` | `/workspaces/:wId/dashboard/member-workload` | `useMemberWorkloadQuery` | Query | Workload per member | `['dashboard', 'workload', wId]` |
