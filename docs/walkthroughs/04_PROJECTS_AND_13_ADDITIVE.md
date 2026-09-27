# Walkthrough — Module 04 expansion + Module 13 additive fields

## Delivered

- Project create/edit now sends visibility, health, lead, icon, brief, repo URL, optional key, and start date.
- Project priority form uses `URGENT`. Legacy `CRITICAL` / `PLANNING` / `ON_HOLD` still render.
- Private project detail shows **Private Project: Request Access** on HTTP 403.
- Project cards show key, health, private badge, lead, and member count.
- Resources (links) and executive status updates live on the project detail page. Posting an update invalidates `dashboardKeys.projectRollups`.
- New **Task list** tab (`?tab=list`) loads `GET /workspaces/:id/projects/:projectId/tasks`. Sprints & Backlog stays on `?tab=tasks`.
- Dashboard portfolio table shows lead and icon. Workspace explorer shows flat label chips.
- Soft-delete and restore API hooks exist; no new recycle-bin UI.

## Files

- Types: `src/types/domain.ts`
- API/hooks: `src/features/project/api/project.api.ts`, `src/features/project/hooks/*`
- UI: `project-dialog-modal.tsx`, `project-card.tsx`, `project-links-panel.tsx`, `project-status-updates-panel.tsx`, `project-tasks-table.tsx`
- Pages: project list/detail, workspace tasks explorer
- Dashboard: `ProjectRollupItem` + `project-rollup-table.tsx`

## Quality gates

- `pnpm lint` — 0 errors
- `pnpm exec tsc --noEmit` — 0 errors
- `pnpm exec next build` — passed

## Manual checklist

1. Create a project with visibility, health, lead, brief, repo URL.
2. Open a private project as a non-member: 403 empty state.
3. Add a resource link and delete it.
4. Post a status update; confirm health changes on the project header and dashboard rollup.
5. Open Task list, filter, and open a row in the task sheet.
6. Confirm Sprints & Backlog still works on `?tab=tasks`.
7. Confirm workspace `/tasks` rows show label chips when present.
