# Module 04: Single Project Hub & Details Page — Redesign Implementation Plan

**Workflow Standard:** Following [`.ai/WORKFLOW.md`](file:///home/siam/Documents/Projects/syncspace-client/.ai/WORKFLOW.md) (6-Step Lifecycle).  
**Target:** Enterprise-Grade / Linear & Height-Class SaaS UX.  
**Audience:** Workspace Owners, Admins, Project Managers, and Engineers.  
**Route:** `/workspaces/:workspaceSlug/projects/:projectId`

---

## 1. Problem Statement & UX Audit

### Current Implementation Issues (Identified via Screenshot & Code Review):
1. **Anemic Hero Header**:
   - The current header is a basic white card displaying only title, description, generic status badge, priority text, and dates.
   - **10 Backend Fields Completely Ignored**:
     - `icon`: No project icon badge or accent styling.
     - `key`: Monospace project key (e.g. `TEST`, `AUTH`) is nowhere to be seen.
     - `health`: Pulsing health indicator (`ON_TRACK`, `AT_RISK`, `OFF_TRACK`) is missing.
     - `lead`: Project lead avatar, name, and email tooltip are absent.
     - `visibility`: Private lock badge vs public indicator is missing.
     - `repoUrl`: External repository button (GitHub/GitLab) is not rendered.
     - `timeline`: Start date to due date range is unformatted.
     - `_count`: Deliverables counters (members, boards, sprints, links) are missing.
     - `brief`: Rich scope & objectives text is never rendered.
     - `statusUpdates`: Executive progress reports log is unrendered.
2. **Missing Sub-Views & Tabs**:
   - The page currently only toggles between `Boards` and `Sprints & Backlog`.
   - Teams lack an **Overview & Brief** tab to read project scope, view executive status reports, and inspect the team roster.
   - Teams lack a **Tasks / List View** tab for dense tabular task sorting, filtering, and bulk triage.
   - Teams lack a **Resources & Links** section to attach Figma files, PRDs, and documentation.
3. **Action Architecture**:
   - Only two basic buttons exist (`Edit`, `Archive`).
   - Missing quick actions: `Post Status Update`, `Copy Project URL`, `Open Repository`, and `+ New Task`.

---

## 2. Backend Contract Alignment

Per [`.ai/api-integration/04_PROJECTS_AND_VIEWS.md`](file:///home/siam/Documents/Projects/syncspace-client/.ai/api-integration/04_PROJECTS_AND_VIEWS.md):

| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/api/v1/workspaces/:wId/projects/:pId` | `GET` | Fetches `ProjectDetail` with `projectMembers`, `links`, `statusUpdates`, `boards`, `sprints`, and `_count`. |
| `/api/v1/workspaces/:wId/projects/:pId` | `PATCH` | Updates project attributes. |
| `/api/v1/workspaces/:wId/projects/:pId/status-updates` | `GET`, `POST` | Fetches and posts executive progress updates with health synchronization. |
| `/api/v1/workspaces/:wId/projects/:pId/links` | `GET`, `POST`, `DELETE` | Manages external documentation, Figma, and repository bookmarks. |
| `/api/v1/workspaces/:wId/projects/:pId/tasks` | `GET` | Fetches flat paginated project tasks with status/priority filtering. |

---

## 3. Proposed Architecture & Layout

```
Single Project Page (/workspaces/:slug/projects/:projectId)
  ├── 1. Enterprise Project Hero Banner
  │     ├── Top Accent Strip (Styled with project.color)
  │     ├── Left: ProjectIconBadge + Title + Key [KEY] + Visibility Lock + Telemetry Badges (Health, Priority, Status)
  │     ├── Right: Action Suite (+ New Task, Post Status Update, Edit, More Menu)
  │     ├── Description / Short Brief Preview
  │     └── Quick Telemetry Ribbon:
  │           ├── Lead Avatar & Name
  │           ├── Team Members Stack (+X members)
  │           ├── Timeline Range (Oct 1 – Dec 15 · 14d left / overdue alert)
  │           ├── External Repo Link (GitHub / GitLab button)
  │           └── Deliverables Counters (X Boards, Y Sprints, Z Links)
  ├── 2. Navigation Tab Bar (URL-Synchronized: ?tab=boards|tasks|overview|sprints)
  │     ├── Tab 1: "Boards" (Active Kanban Board + Board Switcher)
  │     ├── Tab 2: "Sprints & Backlog" (Active Sprint & Backlog Management)
  │     ├── Tab 3: "Overview & Brief" (Markdown Brief, Status Update Feed, Team Roster, Links)
  │     └── Tab 4: "Task List" (Dense Tabular View of all Project Tasks with Filters)
  └── 3. Dynamic Tab Content Shell
        ├── View A: KanbanBoard (Preserved & Enhanced)
        ├── View B: SprintBacklogView (Preserved & Enhanced)
        ├── View C: ProjectOverviewTab (Brief reader, Status updates feed, Resource links, Team)
        └── View D: ProjectTasksListTab (Filterable table with search, priority, status)
```

---

## 4. Sub-Phased Implementation Plan

### Sub-Phase 1: Enterprise Project Hero Banner (`ProjectHeader`) (Completed ✅)
- ✅ Created [`src/features/project/components/project-header.tsx`](file:///home/siam/Documents/Projects/syncspace-client/src/features/project/components/project-header.tsx):
  - **Identity**: `ProjectIconBadge` with color accent, project title, monospace key pill (`[KEY]`), and private project lock indicator.
  - **Telemetry Badges**: `ProjectHealthBadge` (pulsing dot with label), refined priority pill, and status badge.
  - **Quick Telemetry Ribbon**: Lead avatar with email tooltip, team member count, start/due date range with relative deadline calculation, repository link button, and deliverable badges.
  - **Action Suite**:
    - `Update Health` / `+ Post Status Update` button.
    - `Edit Project` button (opens `ProjectDialogModal`).
    - More options dropdown: `Copy Project URL` (with toast confirmation), `Open Repository`, and `Archive Project`.
- ✅ Integrated into [`src/app/(dashboard)/workspaces/[workspaceSlug]/projects/[projectId]/page.tsx`](file:///home/siam/Documents/Projects/syncspace-client/src/app/(dashboard)/workspaces/[workspaceSlug]/projects/[projectId]/page.tsx) with upgraded layout-matched skeletons.
- ✅ Exported from [`src/features/project/index.ts`](file:///home/siam/Documents/Projects/syncspace-client/src/features/project/index.ts).
- ✅ Verified with `npx tsc --noEmit` (0 errors), `npm run lint` (0 errors), and `npm run build` (Turbopack production build succeeded in 2.2s).

### Sub-Phase 2: Status Updates Dialog & API Hooks (Completed ✅)
- ✅ Created [`src/features/project/hooks/use-project-status-updates.ts`](file:///home/siam/Documents/Projects/syncspace-client/src/features/project/hooks/use-project-status-updates.ts):
  - `useProjectStatusUpdates`: Query hook fetching status update history.
  - `useCreateProjectStatusUpdate`: Mutation hook posting update with invalidation for status updates, project detail (health synced), and workspace projects list.
- ✅ Created [`src/features/project/components/project-status-update-modal.tsx`](file:///home/siam/Documents/Projects/syncspace-client/src/features/project/components/project-status-update-modal.tsx):
  - Visual 3-way health selector card grid (`ON_TRACK`, `AT_RISK`, `OFF_TRACK` with color cues and descriptions).
  - Progress summary textarea with validation and helper copy.
  - Submits to `/workspaces/:wId/projects/:pId/status-updates` with loading state and optimistic feedback.
- ✅ Integrated into [`src/app/(dashboard)/workspaces/[workspaceSlug]/projects/[projectId]/page.tsx`](file:///home/siam/Documents/Projects/syncspace-client/src/app/(dashboard)/workspaces/[workspaceSlug]/projects/[projectId]/page.tsx).
- ✅ Exported from [`src/features/project/index.ts`](file:///home/siam/Documents/Projects/syncspace-client/src/features/project/index.ts).
- ✅ Verified with `npx tsc --noEmit` (0 errors), `npm run lint` (0 errors), and `npm run build` (Turbopack production build succeeded in 1.37s).

### Sub-Phase 3: Links & Resources Management (`ProjectLinksWidget`) (Completed ✅)
- ✅ Created [`src/features/project/hooks/use-project-links.ts`](file:///home/siam/Documents/Projects/syncspace-client/src/features/project/hooks/use-project-links.ts):
  - `useProjectLinks`: Query hook fetching project links with `initialData` support.
  - `useCreateProjectLink`: Mutation hook adding links with URL validation and cache invalidation.
  - `useDeleteProjectLink`: Mutation hook deleting links with optimistic feedback.
- ✅ Created [`src/features/project/components/project-links-widget.tsx`](file:///home/siam/Documents/Projects/syncspace-client/src/features/project/components/project-links-widget.tsx):
  - Visual resource cards with category badges (`DOCS`, `FIGMA`, `GITHUB`, `PRD`, `NOTION`, `OTHER`), hostname formatting, and creator attribution.
  - `ProjectAddLinkModal` dialog with URL validation, category selector, and responsive layout.
  - Delete button with loading spinner.
- ✅ Exported from [`src/features/project/index.ts`](file:///home/siam/Documents/Projects/syncspace-client/src/features/project/index.ts).
- ✅ Verified with `npx tsc --noEmit` (0 errors), `npm run lint` (0 errors), and `npm run build` (Turbopack production build succeeded in 1.07s).

### Sub-Phase 4: Overview & Brief Tab (`ProjectOverviewTab`) (Completed ✅)
- ✅ Created [`src/features/project/components/project-overview-tab.tsx`](file:///home/siam/Documents/Projects/syncspace-client/src/features/project/components/project-overview-tab.tsx):
  - **Left Column (65%)**:
    - **Scope & Objectives**: Rendered markdown of `project.brief` with empty fallback CTA to write a brief.
    - **Executive Status History**: Chronological feed of status updates with author avatars, timestamp, pulsing health pill, and update message.
  - **Right Column (35%)**:
    - **Resource Links**: Integrated `ProjectLinksWidget` with instant modal creation and deletion.
    - **Team Roster**: Roster cards for project lead and members with role badges (`LEAD`, `MANAGER`, `MEMBER`, `VIEWER`), avatars, and email.
    - **Project Metadata**: Project key, status, visibility, creator attribution, created date, and last updated timestamp.
- ✅ Exported from [`src/features/project/index.ts`](file:///home/siam/Documents/Projects/syncspace-client/src/features/project/index.ts).
- ✅ Verified with `npx tsc --noEmit` (0 errors), `npm run lint` (0 errors).

### Sub-Phase 5: Project Tasks List Tab (`ProjectTasksTab`) (Completed ✅)
- ✅ Created [`src/features/project/hooks/use-project-tasks.ts`](file:///home/siam/Documents/Projects/syncspace-client/src/features/project/hooks/use-project-tasks.ts):
  - TanStack Query hook fetching from `projectApi.getProjectTasks(workspaceId, projectId)`.
- ✅ Created [`src/features/project/components/project-tasks-tab.tsx`](file:///home/siam/Documents/Projects/syncspace-client/src/features/project/components/project-tasks-tab.tsx):
  - Linear/Height-class tabular task list with columns: Key, Title & Counters, Status, Priority, Assignee, Due Date.
  - Interactive filter toolbar: Live keyword search, status pills ribbon (`ALL`, `TODO`, `IN_PROGRESS`, `REVIEW`, `DONE`) with badge counts, and priority dropdown.
  - Due date intelligence (relative day calculation, overdue alert highlight).
  - Direct row click opens the slide-over `TaskDetailSheet`.
  - Layout-matched skeletons, empty states, and telemetry footer with progress percentage.
- ✅ Exported from [`src/features/project/index.ts`](file:///home/siam/Documents/Projects/syncspace-client/src/features/project/index.ts).
- ✅ Verified with `npx tsc --noEmit` (0 errors), `npm run lint` (0 errors).

### Sub-Phase 6: Unified Page Assembly & Routing (Completed ✅)
- ✅ Updated [`src/app/(dashboard)/workspaces/[workspaceSlug]/projects/[projectId]/page.tsx`](file:///home/siam/Documents/Projects/syncspace-client/src/app/(dashboard)/workspaces/[workspaceSlug]/projects/[projectId]/page.tsx):
  - Upgraded navigation tab bar to 4 full views:
    1. **Boards**: `KanbanBoard` with Kanban icon and board counter pill.
    2. **Sprints & Backlog**: `SprintBacklogView` with Flag icon and active sprint counter pill.
    3. **Overview & Brief**: `ProjectOverviewTab` with FileText icon (Scope & Objectives markdown brief, Status update history feed, Resources & Links widget, Team roster, and project metadata).
    4. **Task List**: `ProjectTasksTab` with ListTodo icon (dense filterable tabular list, live search, status pills ribbon, due date intelligence, and `TaskDetailSheet` slide-over integration).
  - Hydration-safe, URL query synchronized state (`?tab=sprints|overview|tasks`, default `boards`).
  - Integrated high-fidelity layout-matched skeletons for the hero banner, 4-tab bar, and content shells.
  - Wire actions: `ProjectHeader` edit, archive, and status update modals.

### Sub-Phase 7: Quality Gates & Verification (Completed ✅)
- ✅ `npx tsc --noEmit`: 0 TypeScript errors across the entire repository.
- ✅ `npm run lint`: 0 ESLint errors across all modified and newly created files.
- ✅ `npm run build`: Next.js 16.3.6 Turbopack production build succeeded cleanly in 2.1s (static generation and dynamic route compilation confirmed for `/workspaces/[workspaceSlug]/projects/[projectId]`).

---

## 5. Summary of Deliverables

All 7 sub-phases of the Single Project Details Redesign have been successfully completed:
1. **`ProjectHeader`**: Enterprise hero banner with color accent, icon badge, key pill, visibility lock, pulsing health indicator, lead avatar, date range, repo link, and action suite.
2. **`ProjectStatusUpdateModal` & `useProjectStatusUpdates`**: Visual 3-card health selector and status update history query/mutation with multi-cache invalidation.
3. **`ProjectLinksWidget` & `useProjectLinks`**: Categorized resource cards (`DOCS`, `FIGMA`, `GITHUB`, `PRD`, `NOTION`, `OTHER`) and modal for resource management.
4. **`ProjectOverviewTab`**: 2-column layout with Markdown brief reader, chronological executive status history timeline, team roster, and project metadata.
5. **`ProjectTasksTab` & `useProjectTasks`**: Linear-class dense task table with live search, status filter pills ribbon, priority selector, due date intelligence, and slide-over `TaskDetailSheet`.
6. **Unified Assembly**: Integrated 4-tab App Router experience with URL synchronization and layout-matched skeletons.
7. **Strict Quality Gates**: Zero `any` types, 0 TypeScript errors, 0 ESLint errors, and clean Turbopack production build.
