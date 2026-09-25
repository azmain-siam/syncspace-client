# Walkthrough — Module 13 Dashboard Analytics

## Delivered

- Guest and unknown-role users no longer see `/dashboard/*` analytics. Failed queries show Retry instead of “Overdue: 0 — All Clear.”
- KPI, chart, sprint, project, and workload numbers open a right-hand task list sheet. Rows open `TaskDetailSheet` with per-task permissions.
- Comparison window (7/14/30/90) drives summary deltas and the productivity SVG burn-up only.
- New surfaces: sprint health banner, project portfolio table, WIP/capacity workload columns.
- Flat explorer at `/workspaces/:slug/tasks` with URL-synced filters. Sidebar **Tasks** sits between Projects and My Tasks.

## Files

- Plan: `docs/implementation-plans/13_DASHBOARD_ANALYTICS.md`
- Data: `src/features/dashboard/types/*`, `api/dashboard.api.ts`, `hooks/*`, `lib/*`
- UI: dashboard components + `src/app/(dashboard)/workspaces/[workspaceSlug]/page.tsx`
- Explorer: `src/app/(dashboard)/workspaces/[workspaceSlug]/tasks/page.tsx`
- RBAC: `src/features/workspace/hooks/use-workspace-permissions.ts` (`canViewWorkspaceAnalytics`)

## Quality gates

- `pnpm lint` — 0 errors (pre-existing warnings only)
- `pnpm exec tsc --noEmit` — 0 errors
- `pnpm exec next build` — run at delivery

## Manual checklist

1. Sign in as Guest: header + My Work only; no KPI/sprint/charts.
2. Sign in as Member: My Work appears above KPIs.
3. Sign in as Admin/Owner: KPIs and sprint health appear first.
4. Throttle/offline the summary request: KPI card shows “Couldn’t load” + Retry, never a green overdue zero.
5. Click Workspace overdue → sheet lists overdue tasks → open one → edit due date.
6. Click In Progress, a status row, a priority tile, a member name, and a project overdue count.
7. Change Comparison Window; delta badges and burn-up update; other cards stay all-time.
8. Open `/tasks?dueDate=overdue` and `/tasks?status=IN_PROGRESS,REVIEW` from the sheet footer; filters persist.
9. Confirm workspace task rows render flat label chips when present.
