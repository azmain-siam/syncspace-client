# Module 13 Dashboard Analytics — Implementation Plan

**Workflow status:** Step 2 (PM assessment) complete. Step 3 approved. Execute one sub-phase at a time. Each phase must pass lint, `tsc --noEmit`, and a clean `next build` before the next starts.

---

## Step 2 — PM assessment (locked)

**Problem.** The dashboard is the post-login landing page. It already fetches live numbers, but four of five blocks are dead-end posters, failed requests render as “Overdue: 0 — All Clear,” and Guests get 403 from all six `/dashboard/*` endpoints.

**Contract integrity.** Module 13 §2.3 and §7 are authoritative. Do not copy §4 hook snippets (`useWorkspaceSummary`, `['workspace-summary']`, `@/lib/api-client`) — they would create a second cache under a different key (Audit 4 C2). Keep `src/features/dashboard/hooks/dashboard-keys.ts` and `src/lib/api/api-client.ts`.

**Open backend items (do not block this plan).** R2-01 labels shape, R2-02/03/04 grouped pagination. Flat `GET /workspaces/:id/tasks` is enough for every drill-down in this wave.

---

## Locked product decisions

- Dashboard stays at `/workspaces/:slug`. Do not create `/dashboard`.
- Every number is a doorway: click opens a right-hand **task list sheet** on the dashboard. “Open in Explorer” is the escape hatch.
- New explorer route: `/workspaces/:slug/tasks` (flat only this wave). My Tasks stays as-is; migration to `assigneeId=me` is a later module.
- Comparison window lives on the productivity card and is passed into `summary?days=` only. Label it **Comparison Window**, never a global page filter.
- Overdue card: current count + action badge. **No trend delta.**
- Total / Story Points deltas: label explicitly as “+N created vs prior period” and “+N SP completed vs prior period.”
- In Progress drill-down uses `status=IN_PROGRESS,REVIEW`.
- Do not render `labels` until R2-01 is confirmed. Show key, title, status, priority, due, assignee, project.
- No Recharts. Existing CSS bars stay; productivity timeline is a small custom SVG (avoids a new ~40–80 KB gzip dependency after Audit 5).
- Guests: hide every `/dashboard/*` section. Keep workspace header + My Work.

---

## Out of scope this wave

- Grouped explorer (`groupBy != none`)
- Label chips on workspace task rows
- Full My Tasks rewrite
- Activity-feed strip
- Global date-range header control
- Overdue historical trend

---

## Architecture

```
Dashboard page
  -> useWorkspacePermissions (isGuest hides analytics)
  -> summary / distribution / productivity / sprint / rollups / workload
  -> KPI / chart / row click
  -> TaskListSheet -> useWorkspaceTasks (flat)
  -> row click -> TaskDetailSheet
  -> Open in Explorer -> /workspaces/:slug/tasks?filters
```

---

## Sub-Phases

1. Trust, empty, Guest (P0)
2. Contract and query layer
3. Drill-down infrastructure (`TaskListSheet`)
4. Interactive existing cards + honest deltas
5. New analytics surfaces (sprint, burn-up, rollups, WIP)
6. Flat task explorer route

## Quality gates (every phase)

- `pnpm lint` — 0 errors
- `pnpm exec tsc --noEmit` — 0 errors, no `any`
- `pnpm exec next build` — clean
- Browser pass: Guest, Member, Admin; failed network on summary; Overdue click → edit due date → sheet refresh
