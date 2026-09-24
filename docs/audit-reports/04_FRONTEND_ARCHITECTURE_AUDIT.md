# SyncSpace — Audit 4
# Frontend Architecture & Maintainability Audit — Findings Report

**Scope:** Architecture and maintainability only — feature/module boundaries, component composition, state management (Zustand + TanStack Query), API integration patterns, routing, type safety, and dependency health.
**Out of scope:** UI redesign (see Audit 2), new features, backend API changes, performance optimization unless the root cause is architectural, security/production readiness (Audit 6).
**Method:** Static analysis of the full `src/` tree — cross-feature import graph, query key inventory, type definitions, dependency usage counts, and `package.json`. No `.env*` files were read. No code was modified as part of this audit.

---

## 1. Architecture Summary

The overall shape is good. Code is organised by feature under `src/features/*`. Each feature has `api/` (a plain object that returns the `ApiResponse<T>` envelope), `hooks/` (TanStack Query), `components/`, `schemas/` (zod) and `types/`. Other good signs:
- All 18 forms use react-hook-form with zod.
- There is no `any` anywhere, and only five `as unknown as` casts.
- The query client has sensible defaults.
- Optimistic updates exist where they matter: task moves, column reorder, checklists, comments and notifications.

The weaknesses are in the connecting layers rather than the features themselves:
- **Realtime** has two socket connections using two event-name conventions.
- **Cache keys** are defined inline in each hook, so some keys don't match each other.
- **Workspace and user identity** are copies of server data kept in Zustand.
- **Session teardown** is scattered across several places.
- **Permissions** are recomputed in each component.
- **The board and task screens** are "god components" that do too many jobs.

The architecture docs in `.ai/` describe a different stack (Next 15, `@dnd-kit/core`, Zod 3) and a workspace store that doesn't exist. That matters because agents follow those docs.

**Cross-feature dependencies:**

| Feature | Imports from |
|---|---|
| board | task (8), workspace (2), auth (1) |
| task | workspace, safety, comment |
| workspace | auth, realtime |
| auth | workspace (`useLogout`) |
| realtime | notification, task |
| `lib/`, `providers/` | auth store |

There are two import cycles: auth ↔ workspace, and workspace → realtime → task → workspace.

---

## 2. Critical Problems

### C1. Two Socket.IO connections with incompatible protocols

`providers/socket-provider.tsx` opens one connection. `lib/socket/socket-client.ts` opens a second singleton through `getSocket()`.

| | Socket A: `SocketProvider` / `useSocket()` | Socket B: `getSocket()` |
|---|---|---|
| Used by | header, notifications, presence, `useBoardRealtime`, `useTaskRealtime` | `useCommentSocket`, `useSprintSocket` |
| Room join | `room:join {roomType, targetId}` | guesses `join:task` and `task:join`, `join:project` and `project:join` |
| Events | colon names (`task:moved`, `comment:created`), matching contract 09 | dot names (`comment.created`, `sprint.started`, `task.sprint_changed`), not in contract 09 |
| Teardown | reconnects on every token change | `disconnectSocket()` is **never called** |

What this means in practice:
- When a task sheet is open, `useTaskRealtime` (in the sheet) and `useCommentSocket` (in `CommentThread`, inside the sheet) both handle comments for the same task over different connections.
- If the backend follows contract 09, sprint and comment realtime through socket B does nothing at all.
- Socket B survives logout and stays joined to the previous user's rooms.
- Doc 07 contradicts doc 09 on event names, so the frontend implemented both.

**Why it's critical:** duplicate connections double server load. Realtime works for some features and not others with no obvious reason. And a connection that outlives logout belongs to the wrong user.

### C2. Query keys don't match, so refreshes rely on over-broad invalidation

Every query key in the app that isn't built from a factory:

| Query | Key |
|---|---|
| Task detail | `['tasks', taskIdOrKey]` |
| Task links, attachments, checklists | `['tasks', id, 'links' \| 'attachments' \| 'checklists']` |
| Column tasks | `['columns', columnId, 'tasks', params]` |
| Board | `['workspaces', ws, 'projects', p, 'boards', b]` |
| Board columns | `[...board, 'columns']` |
| My tasks | `['workspaces', ws, 'my-tasks', params]` |

Two sets of invalidations hit nothing:
- Eight places invalidate `['task', id]` (singular): the comment mutations, comment socket, sprint socket, sprint mutations and task realtime. No query uses that key.
- `useBoardRealtime` invalidates `['board', boardId]`, which is also unused.

Updates only show up because other code invalidates `['tasks']` and `['columns']` without narrowing. That refetches every cached task detail, checklist, link list and attachment list, plus every column of every board visited in the session.

The same task is also cached twice, under its UUID and under its key (for example `SYNC-14`). Only `useUpdateTask` knows to invalidate both.

Key factories already exist in `safety-keys.ts`, `dashboard-keys.ts`, `notification-keys.ts` and `sprint-keys.ts`, but task, board, column, workspace, project and comment don't use them. The literal `'workspaces'` appears 57 times and `'tasks'` 32 times.

**Why it's critical:** these are silent correctness bugs, and they will get worse as features are added. Fixing staleness today means invalidating even more broadly.

### C3. Workspace identity is a copy of server data, and teardown is incomplete

Three separate problems combine here.

**1. The slug fallback.** An unknown slug falls back to a different workspace:

```ts
const currentWorkspace = useMemo(() => {
  if (!workspaceSlug) {
    return activeWorkspace || workspaces[0] || null;
  }
  return (
    workspaces.find(
      (w) => w.slug === workspaceSlug || w.id === workspaceSlug,
    ) || activeWorkspace || workspaces[0] || null
  );
}, [workspaceSlug, workspaces, activeWorkspace]);
```

`/workspaces/typo` renders your first workspace under the wrong URL, where it should return a 404. Every action then runs against a workspace the URL doesn't name.

**2. The persisted object.** The store saves the whole `activeWorkspace` object. Five hooks write to it, and the sidebar, breadcrumb, kanban permissions and the no-slug fallback all read it. It's a copy of server data that can go stale. For example, a rename made in another tab won't show here.

**3. Logout only half-runs on most paths.** Only `useLogout` calls both `queryClient.clear()` and `clearWorkspace()`. The other logout paths don't:
- the three refresh-failure paths in `api-client.ts` call `useAuthStore.getState().logout()` only;
- the invitation page does the same;
- `useChangePassword` clears the query cache but not the workspace store.

On a shared browser, after a forced logout, the next user starts with the previous user's cache and their persisted `activeWorkspace`. That workspace's name and slug then appear in the new user's sidebar and breadcrumb.

**Why it's critical:** it causes wrong-workspace rendering and leaks another account's workspace details on a shared device. Both come directly from treating server data as client state.

---

## 3. High Priority Problems

### H1. The board loads task data from three sources

`KanbanBoard` calls `useBoard`, whose response embeds columns and tasks, and `useBoardColumns`, which returns the same columns. Then every `KanbanColumn` calls `useColumnTasks`:

```ts
const { data: columnTasksResponse, isLoading: tasksLoading } = useColumnTasks(column.id);

const tasks: Task[] = React.useMemo(() => {
  if (columnTasksResponse?.data?.tasks) {
    return [...columnTasksResponse.data.tasks].sort((a, b) => a.order - b.order);
  }
  return (column.tasks as unknown as Task[]) || [];
}, [columnTasksResponse, column.tasks]);
```

The consequences:
- Opening a board fires 3 + N requests (N = number of columns).
- `useMoveTask` has to optimistically patch two caches.
- The drag overlay searches both caches to find the task being dragged.
- Two of the five `as unknown as` casts are needed only to bridge the two data shapes.

**Why:** there's a single task list, but it's duplicated across three caches, so every mutation and realtime handler needs to know about all of them. Which source should win depends on the board and task contracts (docs 05 and 06). That's a decision for step 2 of `.ai/WORKFLOW.md`, not something to guess here.

### H2. Domain types are defined twice, with three enum styles

- `Task` is defined in both `types/domain.ts` and `features/task/types/task.types.ts`. The feature version adds `key`, `sprintId`, `labels`, `checklists` and more, and uses `UserMinimal` where the global one uses `User`.
- `Comment`, `Notification`, `NotificationType`, `TaskLink` and `WorkspaceActivity` are each defined twice.
- `PaginationMeta` is defined three times and `UserMinimal` five times.
- `types/domain.ts` has 97 importers.

Enums come in three styles:
- `domain.ts` pairs a union type with a const object (`WorkspaceRole`, `ProjectStatus`);
- seven feature files use TypeScript `enum` (`SprintStatus`, `NotificationType`, `RoomType`, …);
- pages compare raw strings, for example `=== 'DONE'` eight times in `my-tasks/page.tsx`.

**Why:** a type that's defined twice drifts. The `as unknown as Task` casts in `useMoveTask` show that drift has already happened. Pick one style: union plus const object is already dominant and works with erasable-syntax TypeScript.

### H3. God components

| File | Lines | Mixed responsibilities |
|---|---|---|
| `app/page.tsx` | 1015 | the whole landing page in one file |
| `kanban-board.tsx` | 889 | permissions; board selection; merging two column sources; 8 modal states; drag-and-drop plus a hand-written `requestAnimationFrame` auto-scroll; mobile carousel `IntersectionObserver`; task-drawer URL sync; hosting the task sheet |
| `task-detail-sheet.tsx` | 670 | fetching, editing every field, tabs, realtime, deletion |
| `my-tasks/page.tsx` | 517 | filtering, grouping, status logic, drawer |
| `search-command-modal.tsx` | 451 | lives in `components/common` but is a dashboard/search feature |

A specific case in `KanbanBoard`: the drawer state is held in both local `clientTaskId` and the `?task=` search param. Next.js keeps `useSearchParams` in sync with `window.history.replaceState`, so the URL alone is enough. The local mirror is redundant state.

**Why:** these files are where regressions will concentrate. They can't be tested in pieces, and every future board feature has to touch the 889-line file.

### H4. Mutation hooks have an inconsistent and leaky API

- **Positional arguments.** Hooks take arguments like `useMoveTask(workspaceId, projectId, boardId)` and `useCreateProject(workspaceId, onSuccessCallback?)`. Fourteen hooks take a positional `onSuccessCallback`. The IDs exist only to build invalidation keys, which is a side effect of C2.
- **Toasts inside hooks.** 45 hook files import `sonner` and toast internally, so callers can't suppress a toast or change its text.
- **Error parsing bypassed.** `formatApiErrorMessage` exists, but 20 files still read `error.response?.data?.message` directly. The backend can send that field as an array.
- **Error type repeated by hand.** 46 files import `AxiosError` only to write `AxiosError<ApiResponse<unknown>>` in generics.

**Why:** every new mutation copies these patterns. TanStack Query already offers the fix without any new abstraction:
- `mutate(vars, { onSuccess })` for callbacks at the call site;
- a `MutationCache` `onError` that handles errors in one place using `formatApiErrorMessage`;
- a `Register { defaultError }` module declaration to type errors once.

### H5. Permissions are ad hoc and "fail open"

- `KanbanBoard` computes `canManage` from `activeWorkspace.ownerId` plus the members list.
- `MembersTable` computes it again from `currentMember.role`.
- `CommentItem` checks `userRole === 'OWNER' || 'ADMIN'`.
- The settings page checks `ownerId === currentUser.id`.
- Six components (`TaskDetailSheet`, `TaskChecklists`, `TaskLinks`, `TaskAttachments`, `BacklogSection`, `SprintTaskItem`) default the prop to `canManage = true`, and `my-tasks/page.tsx` passes `canManage={true}` outright.

**Why:** any caller that forgets the prop shows owner/admin controls to guests. The backend still rejects the request, but the user sees controls they can't use and then gets an error toast. The permission rule also exists in four slightly different versions.

### H6. Every workspace page resolves the workspace itself

Each `[workspaceSlug]` page repeats the same steps: `use(params)`, then `useCurrentWorkspace(slug)`, then its own loading gate. There's no `[workspaceSlug]/layout.tsx`.

The sidebar takes its slug from the store rather than the route. When the store is empty, it falls back to `/projects`, `/my-tasks`, `/members` and `/activity`, and none of those routes exist.

**Why:** a shared layout is the App Router's built-in way to resolve a workspace once. It would also be the one place to call `notFound()`, which fixes the C3 fallback.

---

## 4. Medium Priority Problems

- **M1. Dual token storage.** The auth store persists tokens in `syncspace-auth-storage` and also mirrors them to `syncspace_access_token` and `syncspace_refresh_token`. It then re-syncs in `onRehydrateStorage`, and the api-client and socket both read `accessToken || getStoredAccessToken()`. Two sources of truth for one value add bug surface and no benefit. (Whether tokens belong in localStorage at all is for Audit 6.)
- **M2. Duplicate and dead code.**
  - There are two `useCurrentUser` hooks. They share the key `['user','me']` but have different query functions and return types (`User` vs `UserProfile`); the one in auth has no importers.
  - `useUserNotifications` in realtime is unused.
  - `transfer-ownership.schema.ts` is unused.
  - Two same-key queries with different result shapes will corrupt each other's cache as soon as both are mounted.
- **M3. Misplaced modules.**
  - Workspace search lives under `dashboard/hooks`.
  - `UserProfileMenu` lives in `workspace/components`.
  - `SearchCommandModal` lives in `components/common`.
  - These are minor, but they make things harder to find.
- **M4. Duplicated utilities.**
  - `formatRelativeTime` is copied into four files (notification item, comment item, trash table, activity feed).
  - Initials logic is inlined in four or more places.
  - Status and priority colour maps appear in six files (see Audit 2).
  - `lib/utils.ts` contains only `cn`.
  - The copies already differ slightly, so the same timestamp can read differently in different panels.
- **M5. Server state mirrored into the auth store.** `useCurrentUser`'s query function calls `setUser()`, and components read `useAuthStore((s) => s.user)`. This is the same pattern as C3, but lower risk because the user object rarely changes.
- **M6. Import cycles and inverted layering.**
  - Auth imports the workspace store (`useLogout`), and workspace imports auth.
  - Workspace → realtime → task → workspace.
  - `lib/api` and `providers` import `features/auth`.
  - The single session-teardown function in P0-3 removes the auth ↔ workspace edge naturally.
- **M7. Scattered `staleTime` values.** Values of 10s, 15s, 30s, 2min, 3min, 5min and Infinity are set per hook with no stated policy. Once key factories exist, defaults can live next to them per resource type.
- **M8. Routing hygiene.**
  - Auth routes are split between `(auth)/` and `auth/`, and `invitations/` sits outside both groups.
  - There is no `not-found.tsx`, `error.tsx` or `loading.tsx` anywhere.
  - The whole `(dashboard)/layout.tsx` is a client component.
  - Only the auth pages export metadata.

  Route protection is client-side only, through `AuthGuard` and `GuestGuard`. Tokens live in localStorage, so a Next 16 `proxy.ts` couldn't see them anyway. The client guards are the right choice for now; revisit them only if auth moves to cookies (Audit 6).
- **M9. Stale architecture docs.** `.ai/FRONTEND_ARCHITECTURE.md` and `.ai/STATE_MANAGEMENT.md` describe packages, files and a store shape that don't exist. The workflow makes agents follow these docs, so they actively spread mistakes.

---

## 5. Component Architecture Findings

- **What works well:**
  - Dialogs are their own files (create, edit and delete for board, column, sprint and so on).
  - Skeletons and empty states are separate components.
  - `TaskCard` and `KanbanColumn` receive data through props and report actions through callbacks.
- **Split `KanbanBoard` along its existing seams**, as plain extractions within `features/board`, without introducing new abstractions:

  | Extract | Responsibility |
  |---|---|
  | `useBoardSelection` | active board selection |
  | `useTaskDrawerParam` | URL-only drawer state |
  | `useDragAutoScroll` | the `requestAnimationFrame` loop |
  | `useMobileColumnTracker` | the `IntersectionObserver` |
  | `BoardToolbar` | toolbar UI |
  | `BoardDialogs` | the eight modal states |
  | `BoardCanvas` | the drag-and-drop provider and columns |

- **Split `TaskDetailSheet` by section:** header and fields, a description editor, a tabs container, and an activity/comments panel.
- **Split `app/page.tsx` into section components** under `components/marketing/`. That's a pure move with no logic change.
- **Hand-rolled primitives** such as tabs, native `<select>`, `confirm()` and custom empty states were covered in Audits 2 and 3. Architecturally they should become the missing Shadcn components (Tabs, Select, AlertDialog) rather than new custom ones.

## 6. State Management Findings

| Store | Holds | Verdict |
|---|---|---|
| `useAuthStore` | tokens, `isAuthenticated`, `user` | Keep tokens and the flag, and store tokens once (M1). `user` should come from the query. |
| `useWorkspaceStore` | `activeWorkspaceId` and the whole `activeWorkspace` object | Keep only the last-used slug or id, for the `/dashboard` redirect. The object is server state (C3). |

- Zustand is used appropriately elsewhere (only two stores). No new state library is needed.
- Derived state is mostly done well; `activeBoardId` in `KanbanBoard` is derived instead of synced through an effect.
- **Exception:** `useCurrentWorkspace` writes to the store inside a `useEffect` during render. That's the sync-effect pattern the rest of the code avoids, and it goes away once the store no longer holds the object.

## 7. API / React Query Findings

- **API layer:** consistent and fine. Every module returns `response.data` typed as `ApiResponse<T>`. Keep it.
- **Keys:** extend the existing `*-keys.ts` factory convention to task, board, column, workspace, project, comment and user (C2). Include a `taskKeys.detail(id)` that's used for both the UUID and the key, or cache only by UUID and resolve keys to UUIDs.
- **Invalidation:** targeted invalidation becomes possible once keys are hierarchical. For example `boardKeys.detail(b)` would cover the board's columns, and `columnKeys.tasks(c)` a single column. Today's broad `['columns']` and `['tasks']` calls can then be removed.
- **Mutations:** see H4.
- **Realtime to cache:** one socket from `SocketProvider`; one `useRealtimeRoom(roomType, id)` hook that emits `room:join`/`room:leave`; one typed event map from contract 09; handlers that call the key factories. Delete `lib/socket/socket-client.ts`, and rewrite `useCommentSocket` and `useSprintSocket` on top of `useRealtimeRoom`. Sprint events aren't in contract 09 at all, so they need backend confirmation before any rewrite.
- **Socket reconnects:** `SocketProvider` reconnects on every token refresh. The socket-client already shows the better pattern, `auth: (cb) => cb({ token })`, which reads the token per handshake. Adopt that pattern in the provider.
- **Session teardown:** create one `endSession()` that clears tokens, calls `queryClient.clear()`, resets the workspace store and disconnects the socket. The api-client, `useLogout`, `useChangePassword` and the invitation page should all call it. That requires a query client reachable from outside React, via TanStack's documented browser-singleton `getQueryClient()` pattern.

## 8. Routing Findings

- Add `app/(dashboard)/workspaces/[workspaceSlug]/layout.tsx`. It should resolve the workspace once, call `notFound()` when the slug doesn't match, and provide `{ workspace, role }` through context to pages and the sidebar (H6, C3).
- Add a root `not-found.tsx` and `error.tsx`, plus an `error.tsx` in the dashboard group, so the segment-level error boundaries exist.
- Move `auth/google/callback`, `auth/verify-email` and `invitations/accept` into one clear group, keeping the URLs the same (route groups don't affect URLs). Right now it's unclear which layout and guard apply to them.
- Keep the client guards (see M8). Make `(dashboard)/layout.tsx` a server layout that wraps a client `AuthGuard`, so the static shell isn't client-rendered for no reason.
- The sidebar should build links from the route param, with no dead fallback hrefs.

## 9. Type Safety Findings

- **What's good:** strict mode, no `any`, zod schemas as the input types for create/update DTOs, and discriminated role unions.
- **Merge duplicate types (H2).** Each domain type should live in the feature that owns it. `types/` should keep only truly shared shapes: `ApiResponse`, `PaginationMeta`, `UserMinimal`.
- **Standardise enums** on union plus const object, and replace raw string comparisons with the constants.
- **Casts:**
  - The three `as unknown as` casts in `useMoveTask` and `KanbanColumn` disappear once there is one `Task` type.
  - The two in `kanban-board.tsx` narrow `@dnd-kit` drag event payloads. Those are justified, because the library types the payload loosely; keep them and give them a local type guard.
  - The ~107 `as React…` matches are type-only references such as `React.ComponentProps`, not assertions.
- **Error typing:** use `Register { defaultError: AxiosError<ApiErrorResponse> }` (H4).

## 10. Dependency Findings

| Package | Finding | Recommendation |
|---|---|---|
| `@dnd-kit/helpers` | 0 imports | Remove it, or use its `move()` helper in `useMoveTask` if that simplifies the reorder logic. |
| `@babel/core` 8, `babel-preset-next` | No Babel config exists. `babel-preset-next` is a third-party package; Next's own preset is `next/babel`. | Remove both. A Babel config would switch off SWC. |
| `@next/swc-linux-x64-gnu`, `@next/swc-wasm-nodejs` | Next installs its platform binary automatically. Pinning linux-x64 as a direct dependency is dead weight on Linux and a likely install failure on macOS/ARM. | Remove both. |
| `tw-animate-css` | Imported by the Shadcn animation classes but not installed (Audit 2). | Add it. |
| `package.json` | Name is `temp-app`. No `typecheck` or `test` scripts. `@types/node` ^20. | Rename the package and add a `tsc --noEmit` script, so type safety is checked in CI and not only in the editor. |

There's no case for replacing any library. The stack is modern and each dependency fills a distinct role.

## 11. Recommended Architecture

```text
src/
├── app/
│   ├── (auth)/…                     # login, register, reset, verify-email, google callback
│   ├── (dashboard)/
│   │   ├── layout.tsx               # server layout → client AuthGuard + shell
│   │   └── workspaces/[workspaceSlug]/
│   │       ├── layout.tsx           # resolve workspace once → notFound() → WorkspaceProvider
│   │       └── …pages               # read useWorkspace() from context
│   ├── not-found.tsx, error.tsx
├── features/<feature>/
│   ├── api/                         # unchanged
│   ├── keys.ts                      # query key factory (existing convention, extended)
│   ├── hooks/                       # queries + mutations; vars in mutate(), no positional IDs
│   ├── types/                       # owns its domain types
│   └── components/
├── features/workspace/
│   ├── context/workspace-context.tsx   # { workspace, role }
│   └── hooks/use-workspace-permissions.ts  # single RBAC source; defaults to false
├── features/auth/session.ts         # endSession(): tokens, queryClient.clear(), stores, socket
├── features/realtime/
│   ├── events.ts                    # typed event map from contract 09
│   └── hooks/use-realtime-room.ts   # room:join / room:leave on the one provider socket
├── lib/
│   ├── api/                         # api-client, api-error
│   ├── query/query-client.ts        # getQueryClient(), MutationCache onError, Register types
│   └── format/                      # relative time, initials, bytes
└── types/api.ts                     # ApiResponse, PaginationMeta, UserMinimal only
```

The key principles:
- TanStack Query holds all server data. Zustand holds only tokens and UI memory, such as the last-used workspace slug.
- The route decides which workspace is shown.
- There is one socket and one event protocol.
- There is one session-teardown function.
- Permissions come from one hook that fails closed.

Everything above uses built-in features of Next.js, TanStack Query or React context. No new libraries are needed.

## 12. Refactoring Plan

### P0 — Must Fix
1. **Consolidate on one socket and one event protocol.** Remove `lib/socket/socket-client.ts`; add `useRealtimeRoom` and a typed event map; move comment and sprint realtime onto it; make the provider read the token per handshake instead of reconnecting on each refresh. *Why:* it fixes duplicate connections, handlers that never fire, and a socket that outlives logout. First, per WORKFLOW step 2, confirm sprint events and dot-vs-colon names with the backend.
2. **Add key factories for task, board, column and comment, and fix every invalidation.** Replace the `['task', id]` and `['board', id]` calls, then narrow the broad `['tasks']` and `['columns']` calls. *Why:* the current invalidations either do nothing or refetch far too much, and the factory pattern already exists in four features.
3. **Add a single `endSession()`**, used by the api-client, `useLogout`, `useChangePassword` and the invitation page. *Why:* forced logouts currently leave the previous user's cache and workspace behind.
4. **Resolve the workspace from the route in `[workspaceSlug]/layout.tsx` and call `notFound()` on a mismatch.** Stop persisting the `activeWorkspace` object. *Why:* the fallback shows the wrong workspace under the wrong URL, and the persisted object is stale server data.

### P1 — Should Fix
5. **Create `useWorkspacePermissions()` and change the default to `canManage = false` everywhere.** *Why:* the current defaults show controls to users who can't use them, and the permission rule exists in four versions.
6. **Pick one data source for board tasks** after checking contracts 05 and 06, and remove the duplicate query. *Why:* 3 + N requests, two caches to keep in sync, and casts.
7. **Merge duplicate domain types and standardise on union plus const-object enums.** *Why:* the duplicates have already drifted, and the casts show it.
8. **Reshape mutation hooks:** IDs derived from keys, callbacks through `mutate(vars, { onSuccess })`, a global `MutationCache` `onError` using `formatApiErrorMessage`, and `Register` error typing. *Why:* it removes 45 in-hook toast setups and 20 unsafe error reads.
9. **Split `KanbanBoard` and `TaskDetailSheet`** along the seams listed in section 5, and remove the redundant `clientTaskId`. *Why:* these two files are where most regressions will happen.
10. **Clean up dependencies:** remove the Babel and SWC packages and the unused `@dnd-kit/helpers`, add `tw-animate-css`, add a `typecheck` script, and rename the package. *Why:* it removes dead or risky installs and gets types checked in CI.

### P2 — Later
11. **Store tokens once in the auth store** (M1). The storage mechanism itself is for Audit 6.
12. **Delete dead code:** the auth `useCurrentUser`, `useUserNotifications` and the transfer-ownership schema. Move search and `UserProfileMenu` to their proper features. Stop mirroring `user` into the store.
13. **Move formatting helpers into `lib/format/*`**, and put the status and priority maps in their owning features.
14. **Add a `staleTime` policy** per resource next to the key factories.
15. **Routing hygiene:** regroup the auth and invitation routes, make the dashboard layout a server component, add per-page metadata, and split `app/page.tsx` into marketing sections.
16. **Rewrite `.ai/FRONTEND_ARCHITECTURE.md` and `.ai/STATE_MANAGEMENT.md`** to match the result. *Why:* agents treat these docs as instructions.

Items P0-1 and P1-6 involve contract questions. Per `.ai/WORKFLOW.md`, they need the contract and edge-case review before implementation, and should be delivered as reviewable sub-phases.

---

*This document records findings only. No code was modified. Implementation should proceed phase by phase, per `.ai/WORKFLOW.md` (PM assessment → sub-phased implementation plan → approval gate → execution → quality gates → walkthrough), starting with P0.*
