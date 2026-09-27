# Module 04: Projects Hub & Portfolio View — Redesign Implementation Plan

**Workflow Standard:** Following [`.ai/WORKFLOW.md`](file:///home/siam/Documents/Projects/syncspace-client/.ai/WORKFLOW.md) (6-Step Lifecycle).  
**Target:** Enterprise-Grade / Linear & Height-Class SaaS UX.  
**Audience:** Workspace Owners, Admins, Project Managers, and Engineers.

---

## 1. Problem Statement & UX Audit

### Visual & Usability Issues in Current Implementation:
1. **Unbalanced & Empty Header**: The header is bare (icon + text + lonely button) with zero portfolio telemetry or situational awareness.
2. **Clunky Filter Toolbar**: A massive container stretching across the screen with an oversized search input and two stacked dropdowns in the corner, lacking quick status tabs (`Active` / `Archived`), sort options, and filter tags.
3. **Anemic Project Cards Ignoring Backend Data**:
   - Backend now provides: `key`, `icon`, `visibility`, `health`, `lead`, `_count` (`projectMembers`, `boards`, `sprints`, `links`), `startDate`, `repoUrl`, and `metadata`.
   - Frontend was ignoring all of these! Cards only showed title, description, two plain badges, and a link.
4. **Missing List/Table View**: Power users and managers in organizations with 5–50+ projects cannot switch to a dense, compact data table view with sortable columns.
5. **Create/Edit Modal Lacks New Fields**: `ProjectDialogModal` only accepted title, description, color, priority, and due date. It lacked `key`, `icon`, `leadId`, `visibility`, `health`, `startDate`, and `repoUrl`.

---

## 2. Backend Contract & Field Inventory

Per [`.ai/api-integration/04_PROJECTS_AND_VIEWS.md`](file:///home/siam/Documents/Projects/syncspace-client/.ai/api-integration/04_PROJECTS_AND_VIEWS.md) and [`docs/backend-requests/02_MODULE_04_AND_13.md`](file:///home/siam/Documents/Projects/syncspace-client/docs/backend-requests/02_MODULE_04_AND_13.md):

| Field | Type | Description & UI Placement |
| :--- | :--- | :--- |
| `key` | `string` | Short project key (e.g. `AUTH`, `SYNC`). Displayed as mono badge in card/table headers. |
| `slug` | `string` | URL slug identifier (e.g. `auth-and-sso-service`). Used in navigation routes. |
| `icon` | `string \| null` | Lucide icon name (e.g. `shield-check`, `zap`, `code`, `database`, `folder`). Displayed in `ProjectIconBadge`. |
| `color` | `string` | Hex accent color (e.g. `#3B82F6`). Used for monogram background tint and border glow. |
| `visibility` | `'PUBLIC' \| 'PRIVATE'` | Project visibility. Private projects display a subtle lock badge. |
| `priority` | `'LOW' \| 'MEDIUM' \| 'HIGH' \| 'URGENT'` | Priority pill badge. |
| `health` | `'ON_TRACK' \| 'AT_RISK' \| 'OFF_TRACK'` | Pulsing dot status badge (`On Track`, `At Risk`, `Off Track`). |
| `status` | `'ACTIVE' \| 'ARCHIVED' \| 'COMPLETED'` | Status badge and segment tab filtering. |
| `lead` | `UserMinimal \| null` | Project lead object (`id`, `name`, `email`, `avatar`). Avatar shown in card footer & table column. |
| `leadId` | `string \| null` | UUID of project lead (configured in Create/Edit modal). |
| `startDate` | `string \| null` | Start timestamp. Displayed in timeline range `Oct 1 – Dec 15`. |
| `dueDate` | `string \| null` | Target completion date. Highlighted with overdue badge if past due. |
| `repoUrl` | `string \| null` | External repository link (GitHub/GitLab). Displays quick link badge. |
| `_count` | `{ projectMembers, boards, sprints, links }` | Deliverable counters (`5 members`, `1 board`, `2 sprints`, `3 links`). |

---

## 3. Proposed Architecture & Visual Layout

```
Projects Page (/workspaces/:slug/projects)
  ├── 1. Header & Actions (Title, Description, "+ New Project" button)
  ├── 2. Portfolio Health & Telemetry Strip (4 KPI chips: Total, Active, On Track %, Deliverables)
  ├── 3. Control & Filter Toolbar
  │     ├── Status Tabs: "All" | "Active" | "Archived"
  │     ├── Debounced Search (with Clear button & shortcut hint)
  │     ├── Priority Filter (All, Urgent, High, Medium, Low)
  │     ├── Health Filter (All, On Track, At Risk, Off Track)
  │     ├── Sort Dropdown (Updated, Due Date, Name A-Z, Priority)
  │     └── View Mode Switcher (Grid Cards vs Compact Table)
  ├── 4. Active Filters Bar (Pills + "Clear all" button when filtered)
  └── 5. Dynamic Content Area
        ├── Loading Skeletons (Layout-matched for Grid & Table)
        ├── Empty State (with contextual actions)
        ├── View A: Redesigned Project Grid Cards (Rich telemetry, leads, monograms)
        └── View B: Enterprise Project Table (Dense rows, sortable, status indicators)
```

---

## 4. Sub-Phased Implementation Plan

### Sub-Phase 1: Domain & Schema Alignment for New Fields (Completed ✅)
- ✅ Updated `Project` and `ProjectCountMeta` in [`src/types/domain.ts`](file:///home/siam/Documents/Projects/syncspace-client/src/types/domain.ts) to include all new backend fields (`key`, `icon`, `brief`, `visibility`, `health`, `leadId`, `lead`, `startDate`, `repoUrl`, `metadata`, `_count`).
- ✅ Exported `ProjectVisibility` and `ProjectHealth` enums.
- ✅ Updated [`create-project.schema.ts`](file:///home/siam/Documents/Projects/syncspace-client/src/features/project/schemas/create-project.schema.ts) and [`update-project.schema.ts`](file:///home/siam/Documents/Projects/syncspace-client/src/features/project/schemas/update-project.schema.ts) with validation rules for all 13 fields.
- ✅ Created [`src/features/project/lib/project-icons.ts`](file:///home/siam/Documents/Projects/syncspace-client/src/features/project/lib/project-icons.ts) for icon presets and key auto-generation.
- ✅ Upgraded [`ProjectDialogModal`](file:///home/siam/Documents/Projects/syncspace-client/src/features/project/components/project-dialog-modal.tsx) with key generation, icon picker, lead selector, visibility, health, timeline dates, and repo URL.
- ✅ Verified 0 TypeScript errors and 0 ESLint errors.

### Sub-Phase 2: Design System Primitives & Micro-Components (Completed ✅)
- ✅ **`ProjectIconBadge`** ([`src/features/project/components/project-icon-badge.tsx`](file:///home/siam/Documents/Projects/syncspace-client/src/features/project/components/project-icon-badge.tsx)): 40×40 rounded-xl container styled with `project.color` with custom Lucide icon or 2-letter uppercase monogram.
- ✅ **`ProjectHealthBadge`** ([`src/features/project/components/project-health-badge.tsx`](file:///home/siam/Documents/Projects/syncspace-client/src/features/project/components/project-health-badge.tsx)): Pulse-indicator pill with color-coded dot and ping animation for `ON_TRACK`, `AT_RISK`, `OFF_TRACK`.
- ✅ **`ProjectDeliverablesCounter`** ([`src/features/project/components/project-deliverables-counter.tsx`](file:///home/siam/Documents/Projects/syncspace-client/src/features/project/components/project-deliverables-counter.tsx)): Compact badge group displaying `_count.boards` boards, `_count.sprints` sprints, `_count.links` links, `_count.projectMembers`, and `repoUrl` external link with tooltips.
- ✅ Verified 0 TypeScript errors and 0 ESLint errors.

### Sub-Phase 3: Portfolio Telemetry Strip (`ProjectPortfolioStats`) (Completed ✅)
- ✅ **`ProjectPortfolioStats`** ([`src/features/project/components/project-portfolio-stats.tsx`](file:///home/siam/Documents/Projects/syncspace-client/src/features/project/components/project-portfolio-stats.tsx)): 4 executive stat chips summarizing:
  1. **Initiatives**: Active vs total initiatives count, interactive filter trigger.
  2. **Portfolio Health**: Percentage of initiatives `On Track` with at-risk/off-track breakdowns.
  3. **Workflows**: Total active boards and running sprints across projects.
  4. **Schedule Pressure**: Overdue initiatives count with critical alert styling vs due soon in 14 days.
- ✅ Verified 0 TypeScript errors and 0 ESLint errors.

### Sub-Phase 4: Search, Filter, Sort & View-Mode Toolbar (Completed ✅)
- ✅ **`ProjectToolbar`** ([`src/features/project/components/project-toolbar.tsx`](file:///home/siam/Documents/Projects/syncspace-client/src/features/project/components/project-toolbar.tsx)):
  - Segmented status tabs (`All`, `Active`, `Archived`) with live pill counters.
  - Search input with clear button (`X`), shortcut hint (`/`), and auto-focus listener.
  - Priority dropdown (`Urgent`, `High`, `Medium`, `Low`).
  - Health dropdown (`On Track`, `At Risk`, `Off Track`).
  - Sort dropdown (`Recently Updated`, `Due Date`, `Name A-Z`, `Priority`).
  - View mode switcher (`Grid` vs `Table`).
  - Dynamic active filter tags with one-click "Clear all" button.
- ✅ Verified 0 TypeScript errors and 0 ESLint errors.

### Sub-Phase 5: Redesigned Enterprise Project Card (`ProjectCard`) (Completed ✅)
- ✅ **Tactile Surface**: Clickable card with `hover:-translate-y-0.5 hover:shadow-lg` and custom top accent strip based on `project.color`.
- ✅ **Header**:
  - `ProjectIconBadge` with custom color, Lucide icon, and fallback monogram.
  - Project Title + Project Key badge in `font-mono text-[11px] font-bold uppercase`.
  - Privacy lock icon tooltip for private projects.
  - Context menu (3 dots) with `Open in New Tab`, `Edit Project`, and `Archive Project`.
- ✅ **Badges**: `ProjectHealthBadge` + Priority pill + Status badge (if not `ACTIVE`).
- ✅ **Body**: Clean description with 2-line clamp and proper typographic hierarchy.
- ✅ **Deliverables**: Compact `ProjectDeliverablesCounter` displaying boards, sprints, links, and repo link.
- ✅ **Footer**:
  - Project Lead avatar with name and email tooltip + member count badge (`_count.projectMembers`).
  - Relative due date indicator with overdue alert (rose badge), due soon warning (amber badge), or formatted calendar date.
- ✅ Verified 0 TypeScript errors and 0 ESLint errors.

### Sub-Phase 6: Enterprise Project Table View & Page Integration (`ProjectTableView` & Page) (Completed ✅)
- ✅ **`ProjectTableView`**:
  - Dense, structured tabular view tailored for engineering leads and managers.
  - Columns: Project & Key, Lead & Team, Health, Priority, Status, Deliverables, Due Date, and Actions.
  - Interactive rows with keyboard accessibility and stopPropagation guards.
- ✅ **Main Page Integration** ([`src/app/(dashboard)/workspaces/[workspaceSlug]/projects/page.tsx`](file:///home/siam/Documents/Projects/syncspace-client/src/app/(dashboard)/workspaces/[workspaceSlug]/projects/page.tsx)):
  - Wired `ProjectPortfolioStats` with interactive filter triggers (Health & Status).
  - Wired `ProjectToolbar` with status tabs, search across title/key/description/brief, priority filter, health filter, sort dropdown, and view switcher.
  - Toggle between Grid and Table views with `localStorage` preference persistence.
  - Layout-matched skeletons for both Grid and Table view modes.
  - Empty state with reset filters button and contextual "Create First Project" call to action.
- ✅ Verified 0 TypeScript errors, 0 ESLint errors, and clean Next.js 16 Turbopack production build.

### Sub-Phase 7: Quality Gates & Verification (Completed ✅)
- ✅ `npx tsc --noEmit` — 0 errors.
- ✅ `npm run lint` — 0 errors.
- ✅ `npm run build` — clean Next.js 16 Turbopack production build (all routes static/dynamic generated in 2.6s).
