# UX_PRINCIPLES.md — SyncSpace User Experience Guidelines

Version: 3.0
Visual Foundation: **Quiet Precision** (See `VISUAL_IDENTITY.md` & `DESIGN_SYSTEM.md`)

---

# Purpose

This document defines how SyncSpace **behaves** — the interaction patterns, feedback strategies, and usability standards that make the product feel responsive, trustworthy, and effortless.

`VISUAL_IDENTITY.md` defines what it looks like. `DESIGN_SYSTEM.md` defines how to build it. This document defines how it feels to use.

---

# 1. Core UX Principles

## 1.1 Content-First Hierarchy

The interface serves the content. UI chrome (sidebars, headers, navigation, borders) should be visually quieter than the user's work (tasks, boards, comments, data).

**Rules**:
- Navigation uses `--muted-foreground` at rest. Only the active item uses `--primary`.
- Borders are structural, never decorative — `--border` at low opacity.
- Data values (task counts, KPI metrics, usernames) are always the most visually prominent elements on screen.
- Empty states are invitations, not dead ends — always provide a clear CTA.

## 1.2 Progressive Disclosure

Show the minimum information needed for each context level. Details appear on demand, not upfront.

**Rules**:
- Task cards show title + priority + assignee. Full details open in the intercepted modal.
- Sidebar shows navigation labels only. Counts/badges appear only when relevant (unread notifications, new items).
- Project cards show title + status. Description, dates, and member lists are inside the detail view.
- Use tooltips for icon-only actions. Never require the user to guess what an icon does.

## 1.3 Spatial Consistency

Users build spatial memory. Elements must be in the same place every time.

**Rules**:
- Sidebar is always left. Header is always top. Action buttons are always right-aligned.
- Primary actions ("Create", "Save", "Submit") are always rightmost in button groups.
- Destructive actions ("Delete", "Remove") are always leftmost and use `destructive` variant.
- Modal close is always top-right. Modal confirm/cancel buttons are always bottom-right.

## 1.4 Zero-Latency Perception

The interface should feel instant, even when network operations are pending.

**Rules**:
- **Optimistic mutations**: Moving a Kanban card, posting a comment, or toggling a status updates the UI immediately via `onMutate`. Network failure triggers a silent rollback with an error toast.
- **Skeleton loading**: On initial page load, render page-shaped skeleton placeholders within `50ms`. Never show a blank white screen.
- **Button loading state**: Replace button label with a spinning `Loader2` icon and disable pointer events. Button never visually "jumps" in size.
- **Instant feedback**: Hover effects respond in `150ms`. Focus rings appear immediately. Toasts appear in `300ms`.

## 1.5 Error Recovery, Not Error Punishment

Errors should be recoverable, specific, and never blame the user.

**Rules**:
- Validation errors appear inline below the specific field, not as a page-level alert.
- API errors appear as Sonner toast notifications with specific messages from the backend `message` field.
- Network failures show a toast: "Something went wrong. Please try again." — never a raw error code.
- Optimistic UI rollbacks are silent unless the user needs to retry the action.
- Form data is never lost on error — all inputs retain their values after a failed submission.

---

# 2. Interaction Patterns

## 2.1 Navigation

| Interaction | Behavior |
|---|---|
| Sidebar nav click | Instant route transition. Active item highlights immediately. |
| Breadcrumb click | Navigate to parent context. Breadcrumb always shows full path. |
| Workspace switcher | Dropdown with all user workspaces. Selection changes active context and reloads sidebar. |
| Back button / `Alt+←` | Standard browser back. No custom history management. |
| `Ctrl+K` / `⌘+K` | Opens command palette (global search). Closes with `Escape`. |

## 2.2 Forms & Validation

| Pattern | Implementation |
|---|---|
| Validation timing | Validate on `blur` for first touch, then `onChange` after first error. |
| Submit behavior | Disable button + show spinner. Re-enable on response (success or error). |
| Success feedback | Sonner success toast + redirect to appropriate page. |
| Error feedback | Inline field errors (Zod) + API error toast (Sonner). |
| Password fields | Toggle visibility icon (Eye/EyeOff) inside input. Hidden by default. |

## 2.3 Modals & Dialogs

| Pattern | Behavior |
|---|---|
| Open | Fade-in overlay (`200ms`) + scale-in dialog from `0.96` (`200ms`). |
| Close triggers | Click overlay, press `Escape`, click close button. |
| Close | Fade-out + scale-down (`150ms`). |
| Scroll | Modal body scrolls independently. Overlay and header/footer stay fixed. |
| Confirmation | Destructive actions always require a confirmation dialog with explicit action name. |
| Task detail modal | Intercepted route modal — URL updates to `?taskId=xxx` without losing board scroll context. |

## 2.4 Kanban Board (dnd-kit)

| Interaction | Behavior |
|---|---|
| Card pickup | Instant grab — `0ms` delay. Cursor changes to `grabbing`. |
| Drag indicator | Card lifts with `shadow-lg`. Origin slot shows a ghost placeholder. |
| Column hover | Target column shows a subtle drop indicator line at the insertion point. |
| Card drop | Animate card to final position (`200ms ease-out`). Ghost disappears. |
| Network sync | Optimistic update on drop → `PATCH /tasks/:id/move` → rollback if `4xx`/`5xx`. |
| Horizontal scroll | Board columns scroll horizontally. Each column scrolls vertically for tasks. |

## 2.5 Toast Notifications (Sonner)

| Type | Duration | Behavior |
|---|---|---|
| Success | `3s` | Auto-dismiss. Green left accent. |
| Error | `5s` | Auto-dismiss. Red left accent. Has dismiss button. |
| Warning | `4s` | Auto-dismiss. Amber left accent. |
| Info | `3s` | Auto-dismiss. Blue left accent. |
| Loading | Persists | Stays until resolved. Shows spinner. |

- **Position**: `top-right`.
- **Stacking**: Max 3 visible. Older toasts slide up.
- **Rich content**: May include action buttons (e.g., "Undo" for destructive operations).

---

# 3. State Management UX

## 3.1 Loading States

| Context | Loading Pattern |
|---|---|
| Initial page load | Full-page skeleton matching final layout shape |
| Data refetch | No skeleton — existing data stays visible. Subtle spinner in header if long. |
| Mutation pending | Button spinner (forms). Optimistic UI (Kanban). |
| Image/avatar | Blur placeholder → sharp image on load |

## 3.2 Empty States

When a list, grid, or board has no content, show an empty state component — never a blank area.

**Structure**:
```
┌─────────────────────────────────────────┐
│                                         │
│            [Illustration Icon]          │ ← Lucide icon, 48px, muted-foreground
│                                         │
│         "No projects yet"               │ ← text-lg font-semibold
│   "Create your first project to get     │ ← text-sm text-muted-foreground
│    started with your team."             │
│                                         │
│        [+ Create Project]               │ ← Primary button CTA
│                                         │
└─────────────────────────────────────────┘
```

- Centered in the content area.
- Friendly, specific copy — never generic "No data found."
- Always include a CTA to create the missing resource.

## 3.3 Error States

| Scenario | Display |
|---|---|
| 404 route | Full-page "Page not found" with illustration + "Go home" button |
| API fetch error | Inline error card in the content area: "Failed to load [resource]. Try again." |
| Permission denied | Inline error card: "You don't have access to this resource." |
| Network offline | Persistent toast banner: "You're offline. Changes will sync when reconnected." |

---

# 4. Keyboard Accessibility

## 4.1 Global Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+K` / `⌘+K` | Open command palette |
| `Escape` | Close topmost modal, dropdown, or popover |

## 4.2 Focus Management

- **Tab order**: Follows visual reading order (left-to-right, top-to-bottom).
- **Focus rings**: `ring-2 ring-ring ring-offset-2 ring-offset-background` on all interactive elements. Visible on `:focus-visible` only (not on mouse click).
- **Focus trap**: Modals and dialogs trap focus. Tab cycles within the dialog until closed.
- **Auto-focus**: Modals focus the first interactive element on open. Search palette focuses the search input.

## 4.3 Screen Reader

- All icon-only buttons have `aria-label`.
- All form inputs have associated `<Label>` with `htmlFor`.
- Dynamic content updates use `aria-live="polite"` regions.
- Badge counts announce via `aria-label` (e.g., "3 unread notifications").

---

# 5. Responsive Behavior

| Viewport | Sidebar | Metric Grid | Kanban Board | Task Modal |
|---|---|---|---|---|
| Mobile (< 640px) | Hidden (hamburger) | 1 column | Horizontal scroll | Full-screen sheet |
| Tablet (640–1023px) | Overlay drawer | 2 columns | Horizontal scroll | Centered dialog (lg) |
| Desktop (≥ 1024px) | Persistent rail | 3–4 columns | Full horizontal layout | Centered dialog (xl) |

**Touch considerations**:
- Kanban drag-and-drop works on touch via `dnd-kit`'s touch sensor with `250ms` activation delay to distinguish scroll from drag.
- All interactive targets are minimum `44px` touch area.
- No hover-only interactions — everything accessible via tap/click.

---

# 6. Theme Switching

- Managed by `next-themes` with `attribute="class"` strategy.
- **Default**: System preference (`enableSystem`).
- **Toggle location**: User profile menu dropdown.
- **Transition**: `disableTransitionOnChange` set to `true` — no flash or transition on theme toggle. Instant swap.
- **Persistence**: Theme choice stored in `localStorage` via `next-themes` default.

---

# 7. Performance UX

| Metric | Target | Strategy |
|---|---|---|
| First Contentful Paint | < 1.5s | Server-rendered layout shell, client-side data fetch |
| Largest Contentful Paint | < 2.5s | Skeleton placeholders, lazy-loaded heavy components |
| Cumulative Layout Shift | < 0.1 | Fixed sidebar width, skeleton dimensions match content |
| Interaction to Next Paint | < 200ms | Optimistic mutations, local state updates |

**Rules**:
- Never block rendering on data fetches. Show skeleton → swap with real data.
- Heavy components (rich text editor, chart libraries) are `React.lazy()` + `Suspense`.
- Images use `next/image` with `blur` placeholder.
- Query cache (`staleTime: 5min`) prevents redundant refetches on navigation.
