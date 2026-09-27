# Backend Request 01 — Module 13 Clarifications & Change Requests

**Re:** `.ai/api-integration/13_WORKSPACE_TASKS_AND_EXECUTIVE_DASHBOARD_ANALYTICS.md`
**From:** Frontend
**Date:** 2026-09-25
**Status:** Round 1 answered by backend (Module 13 §7). Round 2 open — see [Round 2](#round-2--follow-ups-after-backend-response).

---

## Summary

Module 13 covers everything the frontend asked for, and the sprint health, project rollup, and workload/WIP payloads go beyond the original request. The type changes to `DashboardSummaryResponse`, `ProductivityMetricsResponse`, and `MemberWorkloadItem` are all additive, so nothing we ship today breaks.

Before we start implementation we need answers on **8 items**. Four are blocking, three are change requests that materially affect the planned UX, and one is a cleanup. A short list of minor confirmations follows at the end.

| ID | Item | Type | Blocking? |
| :--- | :--- | :--- | :--- |
| BE-13-01 | `days` parameter coverage across analytics endpoints | Clarify / scope | Yes |
| BE-13-02 | Missing deltas for Overdue and Completion % KPI cards | Change request | Yes |
| BE-13-03 | Multi-value `status` / `priority` filters | Change request | Yes |
| BE-13-04 | Pagination semantics for grouped task responses | Clarify + change | Yes |
| BE-13-05 | Per-task permission flags in cross-project results | Change request | No — degrades UX |
| BE-13-06 | Project-level visibility scoping on `/workspaces/:id/tasks` | Clarify — security | Yes |
| BE-13-07 | GUEST role access to dashboard analytics endpoints | Confirm behaviour | Yes |
| BE-13-08 | Filter enum divergence vs `/users/me/tasks` | Alignment | No |

---

## Blocking

### BE-13-01 — Which endpoints does `days` actually apply to?

**Observed.** `days` is documented only on `/dashboard/summary` (§3.2) and `/dashboard/productivity` (§3.4). `task-distribution`, `sprint-health`, `project-rollups`, and `member-workload` accept no time parameter.

Additionally, on `/dashboard/summary` the `days` value appears to scope only `currentPeriod`, `previousPeriod`, and `deltas`. The top-level fields (`totalTasks`, `completedTasks`, `inProgressTasks`, `overdueTasks`, `completionPercentage`, `totalStoryPoints`, `totalEstimatedHours`) look like all-time workspace totals.

**Why it matters.** The §5 wireframe places a global `[ Filter Range: Past 30 Days ▾ ]` control in the dashboard header, which implies the entire page responds to it. As specified, it would visibly change only one card group and the velocity chart. Worse, a user who selects "Past 7 days" and reads `Total Tasks: 48` will reasonably conclude 48 tasks were created in the last week.

**What we need:**
1. Confirm whether the top-level `summary` fields are all-time or windowed by `days`.
2. State whether extending `days` to `task-distribution`, `project-rollups`, and `member-workload` is in scope. Sprint health is inherently current-state, so we assume it is exempt.

**If the answer is "not in scope":** we will drop the global range control and scope the selector to the productivity card only. That is an acceptable v1 — we just need to know now, because it changes the dashboard header layout.

---

### BE-13-02 — Two of the four KPI cards have no delta to display

**Observed.** `deltas` contains exactly three fields: `createdTasksDelta`, `completedTasksDelta`, `completedStoryPointsDelta`.

The §5 wireframe and the §6 checklist ("Render 4 primary KPI cards ... displaying trend delta badges") assume more than that:

| KPI card | Delta shown in wireframe | Available in payload? |
| :--- | :--- | :--- |
| Total Tasks | `↑ +4 tasks vs baseline` | ⚠️ Only `createdTasksDelta` — different meaning, see below |
| In Progress | `23% active load` | ✅ Derivable, not a delta |
| Overdue Tasks | `↑ +1 vs last period` | ❌ **Not available** |
| Story Points | `↑ +12 SP velocity` | ✅ `completedStoryPointsDelta` |

**The semantic problem on Total Tasks.** `createdTasksDelta: 4` means "4 more tasks were *created* this period than last period." Rendering that badge beneath a card reading `Total Tasks: 48` will be read as "the total grew by 4," which is a different number. We will not ship that pairing without a label change.

**What we need:**
1. Can `previousPeriod` include `overdueTasks` (and ideally `completionPercentage`)? We recognise overdue is a point-in-time state and a historical value may require snapshots that do not exist. **A clear "no" is a perfectly good answer** — we will remove the trend badge from the Overdue card.
2. Confirm our reading of `createdTasksDelta` so we can label it explicitly as "+4 created vs prior period" rather than implying total growth.

---

### BE-13-03 — `status` and `priority` need to accept multiple values

**Observed.** `WorkspaceTasksQueryDto` types both as single enum values.

**Why it matters.** Two of our highest-traffic task buckets are unions and cannot be expressed in one request:

- **"Needs Attention"** = overdue **OR** `priority=URGENT`
- **"In Progress"** tab = `status=IN_PROGRESS` **OR** `status=REVIEW` (this is the existing behaviour on both the My Tasks page and the dashboard My Work card)

As specified, each of these requires two round-trips merged client-side. That also invalidates `meta.total` and breaks pagination for those views, since neither response's total reflects the union.

**Request.** Accept repeated or comma-separated values on `status`, `priority`, and ideally `projectId`:

```
GET /workspaces/:id/tasks?status=IN_PROGRESS,REVIEW
GET /workspaces/:id/tasks?priority=HIGH&priority=URGENT
```

Single values must continue to work unchanged. Either encoding style is fine — please tell us which you pick.

---

### BE-13-04 — Grouped responses have no pagination contract

**Observed.** `GroupedWorkspaceTasksResponse` returns `groupedBy`, `groups[]` (each with `key`, `label`, `tasksCount`, `tasks[]`), and a top-level `total`. There is no `meta` object, and the doc does not state how `page` / `limit` interact with grouping. The §3.1 Example 2 shows the `DONE` group with all 32 tasks inline.

**Why it matters.** If `limit` does not apply per group, then `groupBy=project` on a workspace with a few thousand tasks returns the entire task table — with nested project, board, sprint, labels, and `_count` on every row — in a single response. We have an open performance finding on unbounded list payloads elsewhere in the product and do not want to add another.

**What we need:**
1. Document how `page` and `limit` behave when `groupBy != 'none'`. Applied per group, globally, or ignored?
2. If not already the case, please cap tasks per group (we suggest `limit`, default 20) and add `hasMore: boolean` to each group so we can render a "Show all N" affordance.
3. Confirm whether `tasksCount` is the true group total or just `tasks.length`. We are assuming the true total.

---

### BE-13-06 — Does `/workspaces/:id/tasks` scope results to the caller's projects?

**Observed.** The endpoint permits `OWNER`, `ADMIN`, `MEMBER`, **and `GUEST`**, and returns tasks across all projects in the workspace. Projects carry their own `membersCount` (§3.6), which implies project-level membership exists.

**Why it matters.** If results are not filtered to projects the caller belongs to, any Guest can enumerate every task title, description, assignee, story points, and comment/attachment counts across the entire workspace in one request. The response shape is well suited to bulk extraction.

**What we need — explicit confirmation of one of these:**
- (a) Results are already filtered to projects where the caller holds membership; or
- (b) Workspace membership intentionally grants visibility into all projects, and this is the product decision; or
- (c) This was not considered and needs to be addressed.

We are treating this as a security question and will not ship the cross-project explorer until it is answered in writing.

---

### BE-13-07 — GUEST gets 403 on six of seven dashboard endpoints

**Observed.** Per the §1 route table, `/workspaces/:id/tasks` allows `GUEST`, but all six `/dashboard/*` analytics endpoints allow only `OWNER`, `ADMIN`, `MEMBER`.

**Why it matters.** The workspace dashboard issues all of these calls on load. A Guest will receive 403 from six of the seven. We are fixing the frontend side of this regardless — the current UI has no error handling and renders a failed summary as a page of zeros including a green "Overdue: 0 — All Clear," which we have raised internally as a P0.

**What we need:**
1. Confirm 403 (not 200 with empty data) is the intended response for Guests.
2. Confirm the intent is that Guests should not see workspace analytics at all. If so we will hide the analytics sections for Guests rather than render error states — but we want the product intent confirmed rather than inferred from the role table.

---

## Change requests (non-blocking, but they shape the UX)

### BE-13-05 — Per-task permission flags in cross-project results

**Context.** Our task detail panel takes `canManage` and `canDelete`. Inside a single board we derive these from project context. A cross-project result set has no single project context, and permissions can legitimately differ per task within one response.

**Request.** Add a per-task block to `WorkspaceTaskItem`:

```jsonc
"permissions": {
  "canEdit": true,
  "canDelete": false,
  "canAssign": true
}
```

**Impact if declined.** The dashboard drill-down panel becomes read-only and users must navigate to the originating board to act. That removes the "spot the overdue task and fix its due date without leaving the dashboard" loop, which is the primary reason we requested the cross-project endpoint. We would rather not fall back to inferring permissions from workspace role, since that risks showing edit controls that then 403 on submit.

---

## Alignment

### BE-13-08 — Filter enums diverge from `/users/me/tasks`

The same concepts use different string values across the two task endpoints:

| Concept | `/users/me/tasks` (Module 04) | `/workspaces/:id/tasks` (Module 13) |
| :--- | :--- | :--- |
| Upcoming / this week | `upcoming` | `this_week` |
| No due date | `nodate` | `no_due_date` |
| Group by due date | `dueDate` | *(absent)* |
| Group by assignee | *(absent)* | `assignee` |
| Explicit "no grouping" | *(absent)* | `none` |

**Why it matters.** We intend to build one shared filter component serving both views. As specified it needs a per-endpoint translation layer, which is a durable source of bugs.

**Preferred resolution.** We are evaluating retiring `/users/me/tasks` on the frontend and reimplementing "My Tasks" as `/workspaces/:id/tasks?assigneeId=<currentUserId>`. That removes the divergence entirely and is our recommended path.

**Please confirm:**
1. Is `/workspaces/:id/tasks?assigneeId=<me>` functionally equivalent to `/users/me/tasks` for a single workspace? Any behavioural differences in what counts as "assigned"?
2. If yes, is `/users/me/tasks` a candidate for deprecation, or should it remain?
3. Could `groupBy` gain `dueDate` on the workspace endpoint, for parity?

---

## Minor confirmations

No response needed on these unless we have read the contract incorrectly — a one-line yes/no each is enough.

1. **`netVelocity` in `timeline[]` is per-bucket, not cumulative.** Derived from the `2026-08-27` sample (`createdCount: 0`, `completedCount: 2`, `netVelocity: 2`) despite `accumulatedCreated: 2` / `accumulatedCompleted: 3`. The name sits next to the `accumulated*` fields and reads ambiguously; we just want it confirmed. Sign convention appears to be `completed - created`.

2. **`assigneeId` has no sentinel for unassigned tasks.** "Show me everything with no owner" is a common triage filter. Is there a supported value (e.g. `assigneeId=null` or `unassigned`)? Also confirming there is no `me` shorthand and we should pass the resolved UUID.

3. **`project.slug` and `project.key` are nullable** in `WorkspaceTaskItem.column.board.project`. We will handle null in routing and labels. `project.id` is non-null, which is what our task detail panel needs — confirming that is guaranteed.

4. **`/dashboard/project-rollups` returns a bare array with no pagination.** Fine for typical workspaces. Is there a practical upper bound on projects per workspace, or should we expect to need paging later?

5. **No column list in the task payload.** `column.board.id` is present but not that board's set of columns, so a status/column change from the drill-down panel requires a second call to the board columns endpoint. We are fine with this — just confirming no column list is coming.

---

## Notes on §4 and §5 (frontend-side, no action required)

Recording these so the docs and the implementation do not drift:

- **§4 hook examples** use naming and import paths that differ from our codebase conventions (`useWorkspaceSummary` / `['workspace-summary']` / `@/lib/api-client` versus our `useDashboardSummary` / `dashboardKeys.summary()` / `@/lib/api/api-client`). We will follow our existing query-key factory. Treating §4 as illustrative pseudocode.
- **§6 references `/workspaces/:slug/dashboard`.** Our dashboard is the workspace root route `/workspaces/:slug`; `/dashboard` already redirects there. No new route will be created.
- **§6 specifies drill-down as full navigation** ("Clicking Overdue Tasks navigates to `/tasks?dueDate=overdue`"). For small result sets we intend to open a slide-over panel on the dashboard instead, with "Open in Explorer" as the escape hatch, reserving full navigation for broad queries. The endpoint supports both identically — this is purely a frontend interaction choice, flagged so the docs are not surprising later.

---

# Round 2 — Follow-ups after backend response

**Backend response received:** Module 13 §7 "Backend Clarifications & Technical Responses"
**Date:** 2026-09-25

## Round 1 outcome

All eight items are answered and **six are already implemented and live**. This is enough to start building. Thank you — `assigneeId=me`, the dual enum aliases, and `groupBy=dueDate` in particular remove a whole translation layer we were bracing for.

| ID | Outcome | Frontend action |
| :--- | :--- | :--- |
| BE-13-01 | Answered — top-level fields are all-time; only `summary` deltas and `productivity` are windowed | Relabel header control as **"Comparison Window"**; no global range filter |
| BE-13-02 | Declined with reason — no historical overdue snapshots | Overdue card shows current count + action badge, no trend badge |
| BE-13-03 | ✅ Implemented — CSV and repeated keys on `status`, `priority`, `projectId` | Use `?status=IN_PROGRESS,REVIEW` for the In Progress bucket |
| BE-13-04 | ✅ Implemented — `hasMore` per group, global `meta` | See R2-02 / R2-03 / R2-04 below |
| BE-13-05 | ✅ Implemented — `permissions` per task | Drill-down panel can be fully interactive |
| BE-13-06 | ✅ Implemented — Guests scoped to explicit project membership | See R2-07 below |
| BE-13-07 | Confirmed — 403 is intended | `useWorkspacePermissions().isGuest` already exists; we will hide analytics for Guests |
| BE-13-08 | ✅ Aligned — full alias parity | We will migrate My Tasks onto `/workspaces/:id/tasks?assigneeId=me` |

---

## R2-01 — `labels` shape contradicts itself (highest risk)

**Blocking. This is the one item that will silently break at runtime.**

The two halves of the doc now disagree:

- **§2.3 `WorkspaceTaskItem`** — `labels: TaskLabelMinimal[];` → flat array
- **§3.1 Example 1** — `"labels": [ { "label": { "id": ..., "name": ..., "color": ... } } ]` → array of Prisma join-row wrappers

These are incompatible. If we type it flat and the API sends wrappers, labels render as empty chips with no error thrown — it will reach production unnoticed.

**We are assuming §2.3 (flat) is correct,** because it matches our existing `Task.labels?: TaskLabel[]` and looks like a deliberate improvement over the raw join shape.

**Please confirm in one line which is correct, and update the other.** If it is flat, §3.1 Example 1 needs its `labels` block replaced with:

```jsonc
"labels": [
  { "id": "label-uuid-1", "name": "Bug", "color": "#EF4444" }
]
```

---

## R2-02 — Grouped responses now serialize the same tasks up to three times

The updated `GroupedWorkspaceTasksResponse` contains three separate carriers for the same task objects:

```ts
groups: Array<{ key; label; tasksCount; tasks: WorkspaceTaskItem[]; hasMore }>;
grouped?: Record<string, WorkspaceTaskItem[]>;
tasks: WorkspaceTaskItem[];
meta: PaginationMeta;
```

`WorkspaceTaskItem` is a heavy object — nested project, board, sprint, labels, permissions, and `_count`. At `limit=100`, emitting each task three times roughly triples an already large payload. The original intent of BE-13-04 was to *reduce* worst-case response size, so we want to flag this before it ships widely.

**Questions:**
1. Is `grouped` actually populated, or is it a backwards-compatibility field mirroring `MyTasksResponse.grouped` from Module 04 that will be left `undefined`?
2. When `groupBy != 'none'`, is the flat `tasks[]` populated in addition to `groups[].tasks`?
3. Could the redundant carriers be dropped, or gated behind an opt-in param?

**Our preference:** when grouped, return `groups[]` + `meta` only. We do not need `grouped` and we do not need the flat `tasks[]` — we can flatten `groups[]` ourselves if a flat view is needed. If the redundancy must stay for other consumers, an opt-in (`?shape=groups`) would let us avoid paying for it.

---

## R2-03 — `tasksCount` is page-scoped, so we cannot show group totals

§7 states `tasksCount` is "the true group count **within the page**."

That means with `hasMore: true` we know more exists but not how much, so we cannot render the group header every grouped view needs:

```
▸ TODO (47)
▸ IN PROGRESS (11)
▸ DONE (312)
```

We would have to render `▸ TODO (20+)`, which is noticeably worse and makes the grouped view unusable for capacity scanning — the main reason to group at all.

**Request.** Add a second field per group holding the total matching the current filters, ignoring pagination:

```jsonc
{
  "key": "TODO",
  "label": "To Do",
  "tasksCount": 20,     // items present in this response
  "groupTotal": 47,     // total matching the filter set
  "hasMore": true,
  "tasks": [ ... ]
}
```

If a per-group total is expensive, a cheaper alternative works for us: a top-level `groupTotals: Record<string, number>` computed with one grouped count query.

---

## R2-04 — Confirming the pagination model (yes/no)

Reading §7 together with the new type, our understanding is:

> `page` and `limit` paginate a **single global flat result set**. Grouping is then applied as a presentation transform over that page. `meta.total` is the global total across all groups. `hasMore` per group means "this group has additional items beyond the current page window."

**Implications we would design around, if correct:**
- Page 2 re-buckets the next N tasks globally, so groups can appear and disappear between pages.
- There is no per-group "Load more" — only global pagination.
- We would build a single paginated list with sticky group headers, **not** independently expandable group sections.

**Please confirm yes/no.** If we have this backwards and pagination is per-group, the UI design changes materially, so we would rather be wrong now than after building it.

---

## R2-05 — §3.1 and §2.1 are stale relative to §2.3 and §7

The updates landed in the TypeScript interfaces and the §7 response table, but the prose contract and enums were not refreshed. Specific contradictions:

| Location | Says | Should say (per §2.3 / §7) |
| :--- | :--- | :--- |
| §3.1 params — `status`, `priority` | Single enum value | Also accepts CSV / repeated keys |
| §3.1 params — `projectId` | Single UUID | Also accepts CSV |
| §3.1 params — `dueDate` | 4 values | 6 values incl. `upcoming`, `nodate` |
| §3.1 params — `groupBy` | No `dueDate` | Includes `dueDate` |
| §3.1 params — `sortBy` | No `status` | Includes `status` |
| §3.1 params — `assigneeId` | "string/UUID" | Also `me`, `unassigned`, `none` |
| §3.1 params — `sprintId` | "string/UUID" | Also `none` |
| §3.1 Example 2 | Top-level `total`, no `meta`, no `hasMore`, no flat `tasks[]` | Should match the new type |
| §2.1 `WorkspaceTasksDueDateFilter` | 4 members | 6, to match the §2.3 union |
| §2.1 `WorkspaceTasksGroupBy` | No `DUE_DATE` | Should include it |

**We are treating §2.3 and §7 as authoritative.** Please confirm that is right and refresh §3.1 and §2.1 when convenient. Not blocking — but the §2.1 enums are exported types we would otherwise import directly, and they currently cannot express the values the API accepts.

---

## R2-06 — §5 wireframe still shows two retired features

Noting these so the wireframe is not later read as a spec we failed to implement:

1. **`[ Filter Range: Past 30 Days ▾ ]`** in the dashboard header implies global scoping. Per BE-13-01 it applies only to summary deltas and the productivity chart. We will label it **"Comparison Window"** and place it accordingly.
2. **`↑ +1 vs last period`** on the Overdue card. Per BE-13-02 this data does not exist. We will not render it.

No response needed.

---

## R2-07 — Please record the non-Guest visibility model in the permission matrix

BE-13-06 confirms Guests are scoped to projects where they hold explicit membership, and that `OWNER`, `ADMIN`, and `MEMBER` have **workspace-wide project visibility**.

The consequence worth writing down: a workspace `MEMBER` who is *not* a member of project X can still read every task in project X — its titles, descriptions, assignees, and estimates. That makes project membership an assignment and notification concept rather than a read-access boundary.

We are not disputing it; for an internal team tool it is a reasonable default. But `.ai/PERMISSION_MATRIX.md` does not currently state it:

- §1 Workspace matrix lists only `OWNER`, `ADMIN`, `MEMBER` — **`GUEST` does not appear at all**, despite now having distinct documented behaviour on two endpoints.
- §2 Project matrix has a "Non-Member / Viewer" column marked ❌ across the board, which reads as "no access." It only covers *mutations* and never defines **read** visibility.

**Request.** Add a `GUEST` column to §1 and a "Read / view tasks" row to §2 so the boundary is explicit. We build our client-side permission gates from that file, and right now it would lead us to hide things the API happily returns.

---

## Minor — performance note on `permissions`

`permissions` is derived per task from workspace role, project role, creator, and assignee. At `limit=100` across many projects, please confirm this resolves from data already loaded in the main query rather than adding per-task or per-project round trips. Purely a heads-up; we have no evidence of a problem.

---

## What we are unblocked to build now

Independent of the Round 2 answers:

- Error, empty, and Guest states across all dashboard cards (P0 — BE-13-07 confirmed Guests get 403, and `useWorkspacePermissions().isGuest` already exists)
- KPI card and chart drill-downs using flat `?dueDate=overdue` / `?status=IN_PROGRESS,REVIEW` queries — flat responses have no open questions
- Interactive task drill-down panel with edit actions, using per-task `permissions`
- Trend badges on the Created and Story Points cards
- Productivity burn-up chart from `timeline[]`
- Sprint health banner and project portfolio table
- Member workload table with WIP and `capacityStatus`

**Gated on Round 2:** the grouped view of the task explorer (R2-02, R2-03, R2-04) and anything rendering labels (R2-01).
