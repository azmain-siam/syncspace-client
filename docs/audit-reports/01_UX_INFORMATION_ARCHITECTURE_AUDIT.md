# SyncSpace — Audit 1
# UX & Information Architecture Audit — Findings Report

**Scope:** Product UX, information architecture, navigation, user flows, information hierarchy, and unnecessary product/UI elements.
**Out of scope:** Visual redesign, architecture refactoring, performance optimization (see audits 2–6).
**Method:** Full inspection of the frontend source (`src/app`, `src/features`, `src/components`), the `.ai/` documentation, and the backend contracts in `.ai/api-integration/`. No code was modified as part of this audit.

---

## 1. Executive Summary

SyncSpace has a solid base: a clear workspace → project → board → task model, a capable task detail panel, working search, notifications, an activity feed, and real-time updates. The problems are in how the pieces connect:

- **Links into tasks are broken.** Notifications and search send users to task URLs that don't exist, and boards have no URL of their own.
- **Permissions contradict the product.** Regular Members, who make up most of a real team, get a read-only board, even though the backend lets them create and move tasks.
- **Onboarding for invited users fails.** An invited user who signs in or registers loses the invitation. A brand-new invitee is pushed to create their own workspace.
- **The dashboard doesn't answer "what needs my attention?"** It's a workspace-wide analytics page with vanity metrics and repeated navigation.
- **A task's status can disagree with its column.** The board, the dashboard and My Tasks can each show a different state for the same task.

None of this needs a redesign. It's mostly routing, permission alignment, and removing things.

---

## 2. Critical UX Problems

### 2.1 Links into tasks lead to pages that don't exist
- **Where:** `notification-popover.tsx` and `use-notification-listener.ts` push `notification.link`, which the backend sends as `/tasks/:id`. `search-command-modal.tsx` builds `/workspaces/:ws/projects/:p/boards/:b?taskId=`. Neither route exists under `src/app`. Comment results go to the projects list and member results go to the members list, so both dead-end.
- **Why it matters:** "I got notified → I open the task" is the core loop for returning users, and right now it ends on a 404.
- **Suggested direction:** Pick one address for a task (for example `/tasks/:KEY`) that resolves to its project and board and opens the detail panel. Point notifications, search, comments and copied links at it.

### 2.2 Members get a read-only board
- **Where:** `kanban-board.tsx` computes a single `canManage` flag from `activeWorkspace.ownerId` and the member's workspace role (Owner/Admin only), and this one flag gates creating tasks, drag-and-drop, quick-move, editing title/description/status/assignee/due date, checklists, attachments and links. The backend (`06_TASKS…md`) allows Members to do all of these.
- **Inconsistency:** My Tasks opens the same task panel with `canManage={true}`, and Sprints defaults `canManage = true`. So what a Member can edit depends on which page they opened the task from.
- **Why it matters:** Most daily users can't do their daily job on the board, and the rules look random.
- **Suggested direction:** Define one set of permissions per action, matching the backend matrix: Members can create, move and edit tasks; Owner/Admin manage board structure and delete. Apply the same rules on the board, the task panel, My Tasks and Sprints.

### 2.3 The invitation flow loses its context
- **Where:** `invitations/accept/page.tsx` passes `?redirect=` to login and register, but `use-login.ts` and `use-register.ts` never read it. Login always goes to `/dashboard`; register goes to `/login`.
- **What happens next:** `/dashboard` sends a user with zero workspaces to `/workspaces/create`. After accepting an invite, `use-accept-invitation.ts` also goes to `/dashboard`, which reopens the previously active workspace rather than the one just joined. `auth-guard.tsx` also drops the page the user was trying to reach.
- **Why it matters:** A new invitee ends up creating an empty workspace of their own instead of joining their team. That's the worst possible first impression.
- **Suggested direction:** Keep the return URL through login, registration, email verification and the auth guard. After accepting, land in the joined workspace. A user with no workspaces but a pending invite should see the invite, not "Create workspace" (note: this needs a backend endpoint to list pending invitations for a user; none exists today).

### 2.4 Boards and project tabs have no URL
- **Where:** On the project page, the active tab (`activeTab`) and the selected board (`selectedBoardId`) are local state only. `.ai/ROUTES.md` documents `/boards/:boardSlug`, but that route doesn't exist.
- **Why it matters:** Refreshing, going back, or sharing a link always resets to the first board on the Boards tab. Multi-board projects can't be linked or bookmarked, and the fix for 2.1 has no board to land on.
- **Suggested direction:** Put the board and the tab (Board / Backlog) in the URL.

### 2.5 A task has two separate "status" values
- **Where:** Each task has a column and a separate `status` field. The task panel lets you set status to "Completed" while the card stays in "To Do". `create-task-modal.tsx` always defaults status to `TODO`, even when the task is created in a "Done" column. The backend only syncs status on a move, and only by guessing from column titles, so custom names like "QA Ready" won't map.
- **Who reads what:** The dashboard, My Tasks and the overdue logic read `status`; the board reads the column.
- **Why it matters:** The same task shows different states in different places, and the dashboard numbers become untrustworthy.
- **Suggested direction:** Make one of them the source of truth. On the board, the column is the natural choice, with status derived from a per-column mapping. Remove the separate status picker from the task panel, or make it move the card.

### 2.6 Kanban columns may silently hide tasks
- **Where:** `use-column-tasks.ts` requests column tasks without page or limit parameters, and there's no "load more". The count badge shows only the loaded count. The API doc example uses `limit=20`, so the backend default needs confirming.
- **Why it matters:** A busy "Done" or "To Do" column would quietly stop showing work, which is effectively data loss from the user's point of view.
- **Suggested direction:** Show the real total, and paginate or virtualize long columns.

---

## 3. High Priority Improvements

### 3.1 The dashboard doesn't show "what needs my attention"
- **Where:** `workspaces/[workspaceSlug]/page.tsx`. It's all workspace-wide analytics: no personal work, no recent activity, no projects.
- **Why it matters:** Returning users land here every day.
- **Suggested direction:** See section 8.

### 3.2 Project actions appear for people who can't use them
- **Where:** New Project, Edit and Archive appear for every role in `projects/page.tsx`, `project-card.tsx` and the project detail page. The backend allows create and edit for Owner/Admin only, and archive for Owner only.
- **Archive problems:** Archive uses a trash icon and red styling, which reads as "delete". Archived projects can't be found or restored anywhere: the list API excludes them and Trash shows only deleted items.
- **Why it matters:** Members hit errors on buttons they were shown. Owners fear, correctly, that archived projects vanish.
- **Suggested direction:** Show these actions only to roles that can use them. Give Archive a neutral icon and copy. Add an "Archived" filter with a Restore action.

### 3.3 Breadcrumbs are built from raw URL segments
- **Where:** `breadcrumb.tsx`. "Workspaces" links to `/workspaces`, which doesn't exist. Projects show a capitalized slug or UUID. Labels come out as "My-tasks" and "Audit-logs". The board and task never appear.
- **Duplication:** The project page and backlog page also add their own "Back to…" links.
- **Suggested direction:** Use real entity names (Workspace › Projects › Project › Board) and remove the duplicate back links.

### 3.4 The project page has placeholder and duplicate tabs
- **Where:** The "Activity" tab renders "Activity Log Shell / prepared". The "Settings" tab contains a single button that duplicates Edit. `/projects/:id/backlog` duplicates the Sprints & Backlog tab.
- **Suggested direction:** Remove the placeholder tab, or feed it the activity endpoint filtered by project. Fold Settings into the project's actions menu. Delete the duplicate route.

### 3.5 Settings mixes up user and workspace levels
- **Where:** Members see Settings in the sidebar. It opens a disabled form with a lock notice, and the only thing they can actually do there is Leave Workspace. The user menu also has "Workspace Settings", which mixes user-level and workspace-level navigation.
- **Suggested direction:** Show Settings to Owner/Admin only. Move "Leave workspace" to the workspace switcher. Keep the user menu about the user.

### 3.6 The app shell breaks when there's no workspace or the slug is wrong
- **Where:** With no active workspace, `sidebar.tsx` links to `/projects`, `/my-tasks` and similar routes, none of which exist, even while the user is on `/workspaces/create`.
- **Wrong workspace:** `use-current-workspace.ts` silently falls back to a different workspace when the slug doesn't match (a stale link, or a user who was removed). The user then sees workspace A under workspace B's URL.
- **Suggested direction:** Show a minimal shell until a workspace exists. Show an explicit "Workspace not found or no access" state instead of falling back.

### 3.7 Admins can't see pending invitations
- **Where:** Admins can send invitations but can't see, resend or cancel pending ones. The `useCancelInvitation` hook exists but is never used.
- **Suggested direction:** Add a "Pending" section on the Members page for Owner/Admin.

---

## 4. Medium Priority Improvements

### 4.1 The activity page doesn't hold up at scale
- **Problem:** Search and category filters apply only to the 30 events on the current page. Rows don't link to the task or project they describe. It also shows a permanent "Live Feed" badge.
- **Why it matters:** Filtering gives misleading results, and users can't act on what they read.
- **Suggested direction:** Filter on the server, make rows clickable, and drop the badge.

### 4.2 The connection indicator is loud and contradictory
- **Problem:** The header shows "Offline" in amber while it's still connecting. The sidebar footer shows a pulsing green "Sync Engine" at all times. Both are always visible.
- **Suggested direction:** Show connection status only when it's degraded, and remove the footer indicator and version label.

### 4.3 Notifications are capped at 30
- **Problem:** The header renders the popover without `onLoadMore`, so "Load more" never appears and older notifications can't be reached.
- **Suggested direction:** Enable pagination, or add a full notifications page later.

### 4.4 The task panel hides useful information
- **Problem:** Only Comments shows a count; Attachments and Links don't, so users have to open each tab to find out. Deleting from the panel uses the browser's `confirm()`. Deleting from a card's menu happens immediately, with no confirmation or undo.
- **Suggested direction:** Show counts on every tab, and make deletion consistent: a confirmation or an undo toast, backed by Trash.

### 4.5 Creating a task is heavy
- **Problem:** `create-task-modal.tsx` has 8 fields, including story points and estimated hours, and there's no inline quick-add in a column.
- **Why it matters:** Capturing a task should take seconds.
- **Suggested direction:** Ask for the title only, with optional fields collapsed. Add quick-add at the top or bottom of each column.

### 4.6 The board has no filters
- **Problem:** `UI_SPEC.md` specifies filters for assignee, priority and search, but none are implemented.
- **Why it matters:** With hundreds of tasks, "show only mine" is essential.
- **Suggested direction:** Add a minimal filter for assignee (Me) and search, since the column API already supports these.

### 4.7 Primary actions on the board are inverted
- **Problem:** "Add Column" is the primary button, while "Add task" is a ghost button inside each column. There's also a "N stages" badge, which is noise.
- **Suggested direction:** Make task creation the most prominent action, and put column management in the board menu.

### 4.8 The project list is hard to scan
- **Problem:** Cards show no project key (for example GEN, which appears in every task key), no progress, and no task counts. The filters run client-side only. A grid of cards scales poorly past about 30 projects.
- **Suggested direction:** Add a list view option and show the key. Progress and counts need backend support (see section 8, Missing).

### 4.9 The invite and role menus don't explain roles
- **Problem:** The members table offers "Make Guest", but Guest is never explained anywhere in the UI, and the invite and role menus don't say what each role can do.
- **Suggested direction:** Add a one-line description per role in the invite modal and the role menu.

### 4.10 Registration ends on the login page
- **Problem:** After registering, the user lands on `/login` with only a toast telling them to check their email.
- **Suggested direction:** Show a "Check your inbox" screen with a resend option.

### 4.11 Signed-in users see the marketing page
- **Problem:** At `/`, signed-in users see the landing page instead of their workspace.
- **Suggested direction:** Redirect authenticated users to their last workspace.

---

## 5. Low Priority / Polish

- The dashboard header shows the workspace slug and a hard-coded "ACTIVE" badge. Remove both.
- The sidebar group labels "MENU" and "GENERAL" carry no meaning.
- Labels are inconsistent: "Done" vs "Completed", "Review" vs "In Review", and project "Critical" vs task "Urgent".
- The search palette uses inflated names such as "Executive Dashboard" and "Projects Directory". Use the same labels as the sidebar.
- The theme toggle takes a top-level header slot. It could move into the user menu.
- The KPI footer says "0h logged", but the value is estimated hours, not logged time.

---

## 6. Navigation Findings

**Keep:**
- The workspace switcher at the top of the sidebar.
- Sidebar items: Dashboard, Projects, My Tasks, Members, Activity.
- Header: `⌘K` search, notifications, user menu.
- The mobile drawer that reuses the sidebar.
- The Kanban quick-move menu, which is also a good mobile fallback for drag-and-drop.

**Confusing:**
- Settings appears in both the sidebar and the user menu, and for Members it's effectively empty.
- Navigation is repeated on the dashboard three times: the header buttons, the "Workspace Operations" card, and the sidebar.
- Breadcrumbs are built from raw URL segments and include links that 404.
- Project tabs and board pills aren't links, so back and forward don't work.
- The project page duplicates back links and has a separate backlog route.
- "Members & Roles →" inside Settings sends the user back out to a sidebar page.

**May need restructuring:**
- Give boards real routes.
- Move settings sub-navigation (General, Trash, Audit Logs) behind an Owner/Admin-only Settings item.
- Make tasks addressable with one canonical URL.
- On mobile, keep Home, My Tasks and Projects primary. Search and Notifications stay in the header. Members, Activity and Settings can sit in the drawer. Board structure edits (columns, boards) are reasonable to treat as desktop-first.

---

## 7. Information Architecture Findings

The Workspace → Project → Board → Task hierarchy is correct in the data model, but the UI hides the middle levels:

- **Project:** A project is a page with a header card and in-page tabs. It communicates "container" reasonably well.
- **Board:** Boards aren't a navigable level. They're pills inside the Boards tab, with no URL and no place in the breadcrumb. Users can't tell that a project can have several boards unless they notice the pills.
- **Task:** A task opens in a side panel whose `?task=` parameter lives on the project URL, and it isn't reachable from outside the board. From My Tasks, the "project" badge on each row isn't a link.
- **Status:** The task's "status" is a second concept alongside its column (see 2.5), which blurs the Board → Column → Task relationship.
- **Sprints:** Sprints and Backlog sit beside Boards as another way to look at the same tasks. For teams that don't use sprints, that's cognitive overhead (story points appear in the create form, the task panel and the dashboard).

Net effect: the workspace level is clear, the project level is mostly clear, and the board and task levels are unclear.

---

## 8. Dashboard Findings

**Keep**
- **Overdue tasks.** This is the one strong "act now" signal. Make it prominent and link it to a filtered list.
- **Total tasks and completion %.** Useful as a single compact line.
- **Member workload** (assigned, overdue per person). Valuable for Owner/Admin and leads; show the overdue column prominently.

**Question**
- **Story Points** card. It's meaningless for teams that don't estimate. Show it only if the workspace uses points.
- **Productivity Velocity** (created vs completed). Useful for leads, but the copy ("clearance rate", "Positive Throughput") and four timeframe options are more than most users need.
- **Priority Segmentation.** It counts every task, including finished ones, so it rarely drives a decision. "Open Urgent/High" would be actionable.
- **Status Distribution.** Duplicates the completion %. It could be a single compact bar.

**Remove**
- **Workspace Scale** card. Project, member and event counts are vanity numbers, the "Active" sparkle badge is hard-coded, and "N active peers" is the member count, not an activity measure.
- **The progress bar inside "Active Execution"** (in-progress divided by total), which has no meaning.
- **The "Workspace Operations" shortcut card** and **the header's Projects/Members/Settings buttons**, which duplicate the sidebar.
- **The slug display and the "ACTIVE" badge.**

**Missing** (the data already exists in the backend)
- **My work:** tasks assigned to me that are overdue, due today, or due soon (`/my-tasks`).
- **Recent activity:** the latest workspace events, linked to their tasks (`/activities`).
- **Projects:** recently updated or active projects (`/projects`).
- **Active sprint** per project, for teams using sprints (`/sprints`).

**Future backend requirements** (do not fake these on the frontend)
- Per-project progress and task counts on the project list.
- Archived-project listing.
- "Recently viewed".
- An unread-mentions summary.

---

## 9. User Flow Findings

- **New user:** Register → toast → login page (no "check your inbox" screen) → verify → login again → create workspace → dashboard full of zeros. There's no nudge toward "Create your first project". Project and board creation work, but a Member-role user couldn't create tasks.
- **Invited user:** Broken end to end (see 2.3). Even when it succeeds, they land in the previously active workspace. After that, finding assigned work works well through My Tasks. On the board, they're read-only (see 2.2).
- **Returning user:** Lands on the marketing page at `/`, or on an analytics dashboard with nothing personal. Clicking a notification goes to a 404 (see 2.1). My Tasks is the best screen for this persona, but it's the third item in the sidebar.
- **Project workflow:** Finding and opening a project is fine. Board context is lost on refresh, archive feels like delete and can't be undone, and Activity is a placeholder.
- **Task workflow:** Drag-and-drop, quick-move, and the detail panel with comments, checklists, attachments, links and activity are good. The friction is the heavy create form, the dual status, tab contents hidden behind clicks, inconsistent delete confirmations, and the missing "mine" filter.

---

## 10. Empty / Error / Recovery Findings

- **Good:** Empty states for no projects (with a CTA and different copy when filters are active), no boards, no columns, empty column (click to add), no sprints, no activity, notification tabs, and task not found. The projects list has an error state with retry.
- **No workspace:** The shell renders with broken links (see 3.6).
- **Board empty state for Members:** It tells them "an admin will need to create one", which is fine, but it's paired with a board they can't use.
- **No error state on the dashboard, activity page or board.** A failed request looks exactly like "zero data".
- **Project error:** "Project Not Found" is shown for every kind of failure, including network errors.
- **Members error:** It always says "You may not have permission", even when the real cause is a network failure.
- **No global recovery pages:** There's no `not-found.tsx` or `error.tsx`, so broken links get the default Next.js page.
- **Losing connection:** Shown only as a small pill. The user isn't told whether their edits are saved.
- **Task save failures:** The panel saves on blur and shows "Saving…". On failure there's only a toast; the field keeps the unsaved text with no retry.
- **Invitation errors:** Invalid or expired invitations are handled clearly, but the only way out is "Return to Dashboard".

---

## 11. Role-Based UX Findings

- **Owner:** Mostly correct. Settings, the danger zone, transfer ownership and role changes are all shown appropriately.
- **Admin:**
  - The Settings form is shown disabled, which is correct per the matrix but is a "button exists but I can't use it" case.
  - Board management is correct.
  - Archive is shown although it's Owner-only on the backend.
- **Member:**
  - Can't create or move tasks on the board, but can edit them from My Tasks (see 2.2).
  - Sees New Project, Edit and Archive, which the backend will reject.
  - Sees Create Sprint and sprint management because Sprints defaults `canManage` to true.
  - Sees a Settings page where the only real action is leaving.
- **Guest:** Can be assigned through the members table, but nothing anywhere in the UI explains what a Guest can do.
- **General issue:** Role checks are re-implemented differently in each file: `ownerId` in one place, a `workspace.role` cast in another, a members-list lookup in a third. That's why the behaviour is inconsistent. It needs one shared definition of who can do what, applied everywhere.

---

## 12. Scalability Findings

- **Board columns:** Only the first page of tasks may load (see 2.6), there are no board filters, and board pills overflow horizontally when a project has many boards.
- **Projects:** Neither the list nor the grid is paginated, there's no list view, and the sidebar has no pinned or recent projects, so every visit goes through the Projects page.
- **Assignee picker:** A plain dropdown of every member with no search, which becomes unusable at around 50 people. The same applies to the `<select>` in the create modal.
- **Activity:** Filtering covers only the current page of 30 events.
- **Notifications:** Capped at 30 with no way to reach older ones.
- **Members:** No search or role filter.
- **My Tasks:** Filtering and grouping happen client-side, so it depends on how many tasks the endpoint returns. The backend supports server-side `groupBy` and filters.

---

## 13. Unnecessary UI / Complexity

- **Dashboard:** The Workspace Scale card, the "Workspace Operations" card, the header shortcut buttons, the slug, the "ACTIVE" badge, and the in-progress ratio bar.
- **Project page:** The Settings tab (duplicates Edit), the placeholder Activity tab, and the separate `/backlog` route.
- **Settings:** The "Members & Roles →" link inside Settings, and the Settings entry in the user menu.
- **Header and sidebar:** The always-visible Live/Offline pill, the sidebar "Sync Engine" plus version footer, and the "MENU"/"GENERAL" labels.
- **Task panel:** The separate Status picker (see 2.5), and story points and estimated hours shown by default for non-scrum teams.
- **Board:** The "N stages" badge.
- **Search:** The "Executive"/"Directory" naming, and navigation items that repeat the sidebar when the query is empty. Recent items would be more useful there.

---

## 14. Recommended UX Structure

```text
Workspace (switcher: switch · create · leave)
├── Home            — my overdue/due-soon work · recent activity · active projects (+ overdue & workload for Owner/Admin)
├── My Tasks
├── Projects        — list/grid · Active / Archived filter
│   └── Project     /projects/:key
│       ├── Board               /projects/:key/boards/:board   (default)
│       │   └── Task panel      ?task=KEY   (canonical /tasks/:KEY redirects here)
│       ├── Backlog & Sprints   /projects/:key/backlog         (only if the team uses sprints)
│       └── ⋯ menu (Owner/Admin): Edit · Archive · Delete
├── Activity        — server-filtered, rows link to their task or project
├── Members         — roster · Pending invitations (Owner/Admin)
└── Settings        — Owner/Admin only: General · Trash · Audit logs · Danger zone

Header:    Search (⌘K) · Notifications · User menu (Profile, Theme, Sign out)
           Connection status appears only when degraded
Mobile:    Home · My Tasks · Projects primary; everything else in the drawer
```

---

## 15. Prioritized Action Plan (Phases)

### Phase 0 (P0) — Must Fix
Foundational correctness issues that break core loops or contradict the backend contract.

1. **Canonical task URL.** Define one address for a task (e.g. `/tasks/:KEY`) that resolves and opens the detail panel. Fix notification, search, and comment links to point at it.
2. **Real routes for boards and project tabs.** Add a URL segment for the active board and the active project tab (Board / Backlog) so refresh, back/forward, and sharing all work.
3. **Align permissions with the backend.** Replace the ad-hoc `canManage` checks (board, task panel, My Tasks, Sprints) with one shared permission definition so Members can create, move, and edit tasks as the backend allows.
4. **Fix the invitation → auth → workspace redirect chain.** Preserve `?redirect=` through login, registration, and the auth guard. After accepting an invite, land in the newly joined workspace, not the previously active one.
5. **Pick one source of truth for task status.** Make the column authoritative on the board; derive/display status from the column mapping instead of allowing an independent status picker to disagree with the card's column.
6. **Fix column task pagination.** Confirm/apply page & limit params on column task fetches; show real totals and add load-more so tasks can't silently disappear from a column.

### Phase 1 (P1) — Should Fix
Structural and role-correctness issues that affect trust and day-to-day usability.

1. Rebuild the workspace Home/Dashboard around personal work, recent activity, and projects; remove vanity cards (Workspace Scale, Workspace Operations) and duplicate navigation.
2. Hide project create/edit/archive from roles that can't use them; give Archive neutral styling/copy; add an Archived filter with Restore.
3. Build breadcrumbs from real entity names instead of raw URL segments; remove duplicate "Back to…" links.
4. Remove the placeholder project Activity tab, the duplicate project Settings tab, and the redundant `/backlog` route.
5. Make Settings visible to Owner/Admin only; move "Leave workspace" to the workspace switcher; remove "Workspace Settings" from the user menu.
6. Add a minimal shell and explicit "workspace not found / no access" state instead of the silent workspace fallback.
7. Add a pending-invitations list (view/resend/cancel) for Owner/Admin on the Members page.
8. Add real error states (not just empty states) to the dashboard, activity page, and board; add `not-found.tsx` / `error.tsx`.

### Phase 2 (P2) — Later
Polish, scalability, and quality-of-life improvements.

1. Board filters (assignee = me, search); inline quick-add task; lighter create-task form.
2. Server-side filtering for Activity; clickable activity rows; notification pagination ("load more").
3. Searchable assignee picker; member search/filter; a list view for Projects showing project key.
4. Connection status shown only when degraded; consistent status/priority labels across board, dashboard, and My Tasks; short role descriptions in invite/role menus.
5. Redirect authenticated users away from the marketing landing page; "check your inbox" screen after registration.
6. Backend follow-ups to unblock further frontend work: per-project progress/task counts, archived-project listing endpoint, "recently viewed", unread-mentions summary, pending-invitations-by-user endpoint.

---

*This document records findings only. No code was modified. Implementation should proceed phase by phase, per `.ai/WORKFLOW.md` (PM assessment → sub-phased implementation plan → approval gate → execution → quality gates → walkthrough), starting with Phase 0.*
