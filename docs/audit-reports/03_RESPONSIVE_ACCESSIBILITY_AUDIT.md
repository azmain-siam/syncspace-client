# SyncSpace — Audit 3
# Responsive Design & Accessibility Audit — Findings Report

**Scope:** Responsive behavior across breakpoints, accessibility, keyboard interaction, focus management, semantic HTML, ARIA, screen reader UX, color/non-color indicators, forms, touch interaction, and reduced motion.
**Out of scope:** Visual redesign (see Audit 2), architecture refactoring (Audit 4), backend behavior.
**Method:** Live testing against the running dev server (`localhost:3000`) at 1440, 1280, 1024, 768, 640, and 390px using scripted DOM measurement (overflow, touch-target size, accessible names, heading order) across the public routes (`/`, `/login`, `/register`, `/forgot-password`) — the only routes reachable without a live backend. Authenticated routes (dashboard, board, task sheet, members, etc.) were audited from source. Keyboard and drag behavior were verified against the installed `@radix-ui/react-menu` and `@dnd-kit/dom` source rather than assumed. No code was modified as part of this audit.

---

## 1. Executive Summary

The foundation is better than average. Dialogs and sheets use Radix, so focus trapping, Escape, and focus return work. Most modal forms have real `<label htmlFor>` pairs. `lang`, the viewport tag, and zoom are correct, and no public page scrolls sideways at any tested width. The mobile Kanban has good ideas: stage pills, snap scrolling, and a "Quick move" menu as an alternative to dragging.

The gaps cluster in five areas:

- **Custom panels inside Radix menus.** The notification panel and emoji picker put ordinary buttons inside a menu component that only lets focus reach real menu items.
- **Drag-and-drop taking over the task card.** The drag library makes each card a focusable "draggable" button, so Enter picks up the card instead of opening it.
- **Hover-dependent controls.** Several action buttons are invisible until hover, which hides them from touch users and makes them invisible when focused.
- **Missing semantics.** No tab roles on five tab sets, no `aria-current` anywhere, no error association, placeholder-only names, and no live regions except the toaster.
- **Mobile layout edges.** The shell uses `h-screen` (100vh), several dialogs can't scroll, and some touch targets are 16–28px.

---

## 2. Critical Accessibility Issues

### 2.1 Notifications and emoji reactions can't be reached by keyboard
- **Where:** `notification-popover.tsx` builds the panel inside `DropdownMenuContent`, which renders a Radix menu (`role="menu"`). The panel holds a heading, two tab buttons, "Mark all read", notification rows, and delete buttons, but no `DropdownMenuItem`.
- **Why it breaks:** in the installed Radix menu source, Tab is blocked inside the menu (`if (event.key === "Tab") event.preventDefault()`), and arrow keys only move between real menu items.
- **Result:** a keyboard user can open the bell but can't reach a single notification, the All/Unread tabs, mark-all-read, or delete.
- **Emoji picker:** `emoji-picker-popover.tsx` has the same structure (plain emoji buttons in a menu), so reactions are mouse-only.
- **Nested controls:** each notification row is also a `role="button"` div containing real buttons. Interactive elements nested inside an interactive element aren't reliably announced.

### 2.2 Tasks can't be opened from the board by keyboard
- **How cards become focusable:** `task-card.tsx` opens the task through a `<div onClick>`. `@dnd-kit/dom` automatically adds `tabindex="0"`, `role="button"`, and `aria-roledescription="draggable"` to every draggable element. Its keyboard sensor treats Enter and Space as "pick up".
- **Owners and Admins:** Enter starts a keyboard drag instead of opening the task. The only keyboard route is the "…" menu, then "View Details".
- **Read-only users** (Members under the current permission logic from Audit 1):
  - The card is still focusable but marked `aria-disabled="true"`.
  - Enter does nothing.
  - The "…" menu isn't rendered for them (`canManage &&`).
  - Result: there is no keyboard route to task details at all.
- **Announcements:** the drag library's default screen reader messages use internal ids, for example "Picked up draggable item 3f2a9c…". No custom announcements are configured, so screen reader users hear UUIDs rather than task titles and column names.
- **Arrow-key dragging** moves the card by pixel offsets, not "next column," which makes it hard to aim.

### 2.3 Several controls show no focus indicator
- **Styling removed on purpose:** `segmented-control.tsx` and all four `workspace-settings-nav.tsx` tabs set `outline-none … focus-visible:ring-0`. The notification All/Unread tabs set `outline-none` with no replacement. The projects page filter `<select>`s do the same.
- **Weak indicator:** notification rows only get a faint `bg-accent/70` tint.
- **Buttons invisible when focused:**
  - The task card "…" button is `sm:opacity-0` until hover, with no focus rule. From 640px up, keyboard users tab onto an invisible button.
  - Checklist edit and delete buttons (`task-checklists.tsx`) are `opacity-0 group-hover:opacity-100` with no focus rule at all.
  - Comment options and notification actions do reveal on focus.

### 2.4 Form errors aren't connected to their fields, and many inputs have no real name
- **Errors aren't linked to fields:** there are zero uses of `aria-invalid` or `aria-describedby` anywhere in `src/`. Error messages render as plain `<p className="text-danger">` beside the input (login, register, all modals). Screen readers don't read the error when the field gains focus, and nothing announces it when it appears after submit.
- **Placeholder-only names:** these inputs are named only by their placeholder:
  - project search, activity filter, and trash search;
  - My Tasks search and backlog search;
  - the ⌘K search input;
  - the task title, story points, and checklist "Add item" inputs in the task sheet.
- **Unlabelled fields:**
  - The project-page and backlog `<select>`s have no name at all.
  - The task sheet's "Description" `<Label>` has no `htmlFor`, so it isn't linked to its textarea.
  - The sheet's "Assignee," "Due Date," and "Story Points" labels are `<span>`s.

### 2.5 The ⌘K search and mobile navigation are unnamed dialogs
- **No titles:** `search-command-modal.tsx` and the mobile nav drawer in `(dashboard)/layout.tsx` render `DialogContent` / `SheetContent` without a title, so screen readers announce "dialog" with no name.
- **Results aren't announced:** the search modal handles ArrowUp, ArrowDown, and Enter, but results aren't exposed as a listbox with an active option. Arrowing through results is silent.

---

## 3. Critical Responsive Issues

### 3.1 The app shell uses `h-screen` (100vh)
`(dashboard)/layout.tsx` locks the shell to `h-screen` with `overflow-hidden` and scrolls inside `<main>`. On mobile Safari and Chrome, 100vh is taller than the visible area while the browser toolbar is showing. The bottom of every page (last table row, pagination, "Add task" at the foot of a column) can sit under the toolbar, and the inner scroll container can't bring it into view. `dvh` is already used for Kanban column heights, but not for the shell.

### 3.2 Several dialogs can't scroll
`DialogContent` is vertically centred with a translate and has no maximum height by default.
- **Already safe:** create-task (`max-h-[88dvh] overflow-y-auto`) and create-board.
- **Not safe:** the project create/edit dialog (five fields, a colour picker, and dates), the create, edit, and complete sprint dialogs, the invite modal, and transfer-ownership.
- **Result:** on landscape phones, short screens, or when the on-screen keyboard opens, their top and bottom get cut off. That can include the submit button.

### 3.3 Some actions are invisible on touch devices
- **Always hover-only:** comment options (`opacity-0 group-hover/comment:opacity-100`), notification mark-read/delete, and checklist edit/delete.
- **Hover-only from 640px up:** the task card "…" menu. That covers iPads and other tablets, which are touch devices but get the desktop hover rule.
- On touch these buttons are invisible. Users either can't find them or trigger them by accident when tapping the row.

---

## 4. Keyboard Navigation Findings

| Area | Finding |
|---|---|
| **Page start** | No skip link. Every dashboard page needs about 12+ Tab stops (workspace switcher, sidebar links, breadcrumb, search, bell, theme, profile) before reaching content. |
| **Sidebar** | Real links, so Tab and Enter work. No `aria-current="page"` on the active item. |
| **Workspace switcher, profile menu, row actions, board and column menus** | Real Radix menus: arrow keys, Escape, and typeahead work. |
| **Notification panel, emoji picker** | Contents unreachable (2.1). |
| **Dialogs and sheets** | Focus is trapped and Escape closes. Focus returns to the trigger on close. |
| **Tabs** | Task sheet, project page, board switcher, notification tabs, and settings tabs are plain buttons: no arrow-key movement and no tab roles. The segmented control has `role="tablist"` but no arrow keys and no linked panels. |
| **Kanban** | Keyboard drag exists but is pixel-based with UUID announcements. The "Quick move" menu is the usable keyboard path for Owners and Admins; others have none (2.2). |
| **Forms** | Enter submits in modals. The task sheet saves the title and description on blur only; there's no explicit save, and a failed save shows only a toast. |
| **Search shortcut** | The ⌘K/Ctrl+K handler doesn't check where focus is, so it fires while typing in inputs, comments, and descriptions. |
| **Focus after deleting** | Deleting a task from the sheet or the card menu removes the element that had focus or would receive it back. Focus falls to `<body>` and the user is sent back to the top of the page. |
| **Route changes** | Focus isn't moved to the new page. All dashboard pages share one document title (section 5), so Next.js falls back to announcing the `<h1>`, and Members has no `<h1>`. |

---

## 5. Screen Reader / Semantic Findings

**Landmarks and structure**
- None of the public pages (landing, login, register, forgot-password) has a `<main>` landmark; this was measured.
- The sidebar renders one `<nav>` per group ("MENU," "GENERAL"), giving two unnamed navigation landmarks. The breadcrumb `<nav>` is named correctly.
- Nav items, notifications, and activity entries aren't marked up as lists.

**Headings**
- Login (1024px and up): the hero `<h2>` comes before the page `<h1>`.
- Register (1024px and up): two `<h1>`s on the page.
- Members has no `<h1>`; its heading is an `<h2>` inside the table.
- Every app page uses the same `<title>`, because only the auth pages export metadata. Screen reader users, browser tabs, and history can't tell pages apart.

**Unnamed icon-only buttons**
- The dashboard header settings gear, which is also a `<Button>` nested inside a `<Link>`, so it creates two focus stops.
- The project-details archive (trash) button.
- The project card "…" menu, the task sheet "…" menu, and the members table row actions.
- The landing page theme switch.

**Missing states**
- **Tabs:** no `aria-selected` or `aria-current` on the task sheet tabs, board switcher, project tabs, or settings tabs.
- **Unread notifications:** shown only by a tint, a bold title, and an `aria-hidden` dot. The unread state is never exposed to assistive technology.
- **Status and priority buttons in the task sheet:** they announce as "In Progress, button" with no "Status" context.
- **Mention picker:** has proper listbox and option roles, but the comment textarea isn't linked to it as a combobox, so the highlighted option isn't announced.

**Silent updates**
- Page loading states are icon-only spinners with no status text.
- "Saving…" in the task sheet is hidden on mobile and never announced.
- Realtime changes (a teammate moving a card), filter result counts, and search result counts are never announced.
- The only live region is Sonner's toaster.

**Title attributes used as tooltips:** used as the only explanation in 10+ files, for example "Online now" and "Overdue." These can't be seen on touch or reached by keyboard.

---

## 6. Mobile UX Findings

This covers widths below 640px and the mobile workflows in the audit prompt.

- **Task creation:** the modal scrolls correctly, but it's an 8-field desktop form on a phone. Mobile needs a title-first quick add, ideally from the column itself.
- **Task editing and details:**
  - The sheet goes full width, which is correct.
  - The five tabs scroll sideways with the scrollbar hidden (`scrollbar-none`), so there's no sign that more tabs exist.
  - Field targets are 28px tall (`h-7` date and points inputs).
  - "Saving…" is hidden.
  - Deleting uses the native `confirm()`.
- **Board interaction:**
  - Snap scrolling plus stage pills is a good pattern.
  - Dragging needs a 250ms long press (the library default), with no visible drag handle and no hint.
  - Long-press conflicts with horizontal swiping between columns.
  - The "Quick move" menu is the dependable touch path, but it's a 28px target, and only Owners and Admins get it.
  - Column height uses magic-number `calc(100dvh-220px)`.
- **Member management:** the table hides "Joined" and truncates names using an `xs:` breakpoint that doesn't exist in Tailwind v4, so the truncation classes do nothing. Row actions are a 28–36px "…" button with no name.
- **Invitations:** the invite modal can't scroll (3.2). The accept page works on mobile.
- **Workspace switching:** only reachable through the hamburger drawer (the sidebar is hidden below 1024px). The drawer is an unnamed dialog (2.5).
- **Notifications:**
  - The panel is a fixed `w-[360px]` dropdown, leaving about 15px of margin at 390px.
  - Row actions are hover-only (3.3).
  - The panel should become a full-screen sheet on phones.
- **Header:** connection status is hidden below 768px. The search button collapses to an icon (it does have a name).
- **Touch targets:**
  - Measured on login and register: the password show/hide toggle is 16×16px, and 6 of 9 login controls are under 44px tall.
  - In app code: `h-7` (28px) is used 25 times, and `size-6` (24px) for comment options and the emoji trigger. Notification and task card actions are 28px, and header icons are 36px.

---

## 7. Tablet Findings

This covers 640–1023px.

- **Sidebar:** the persistent sidebar only appears at 1024px and up, so portrait tablets (768–1023px) use the phone-style drawer.
- **Hover rules on touch screens:** from 640px up, tablets are treated as mouse devices. The task card "…" menu becomes invisible, and hover-only controls stay hidden on a touch screen. Controls should be revealed based on hover capability (for example a `(hover: hover)` media query), not on width.
- **Kanban:** stage pills disappear at 768px (`md:hidden`) and snap scrolling turns off at 640px (`sm:snap-none`). Between 768 and 1023px, users swipe 320px columns freely with no stage navigation.
- **Connection status:** the "Live" pill appears from 768px up, but the search label only appears from 640px up, so header density jumps twice.
- **Tables:** Members is readable at 768px, where it gains the "Joined" column.
- **Dialogs:** at 1024px the KPI grid switches to four columns and becomes cramped (noted in Audit 2).

---

## 8. Desktop Findings

This covers 1024px and up.

- **Measured:** no horizontal overflow on public pages at 1024, 1280, or 1440px.
- **Kanban width:** the board is capped by the layout's `max-w-7xl`, so at 1440px about 160px of useful width is lost.
- **Nested page widths:** pages add their own width caps on top of the layout's (noted in Audit 2).
- **Hover-reveal:** the "…" menus depend on hover, which slows discovery for keyboard and mouse users alike.
- **Sticky header:** the translucent 56px header can cover focused elements when the browser scrolls them into view near the top of `<main>`.
- **What works:** Radix dialogs and menus behave well with keyboard and mouse. The ⌘K palette works with arrow keys, but is silent to screen readers (2.5).

---

## 9. WCAG-Relevant Findings

These are mapped to WCAG 2.2 principles for orientation only. This is not a formal conformance claim.

| Principle (success criterion) | Related findings |
|---|---|
| 1.1.1 Non-text content | Unnamed icon-only buttons; unread dot hidden with nothing replacing it |
| 1.3.1 Info and relationships | Unassociated labels and errors; tabs without roles; two h1s; h2 before h1; missing `<main>`; menu used for non-menu content |
| 1.3.5 Identify input purpose | No `autoComplete` on login, register, or change-password |
| 1.4.1 Use of color | Overdue shown by red and bold only; online presence by a green dot only; board tab selection by fill only |
| 1.4.3 / 1.4.11 Contrast | See Audit 2 section 2.4 (semantic chips in light mode) |
| 1.4.10 Reflow | Dialogs that can't scroll on short or landscape screens |
| 2.1.1 Keyboard | Notification panel, emoji reactions, opening a task from the board, checklist actions |
| 2.2.2 Pause, stop, hide | Indefinite `animate-pulse` and `animate-ping` indicators |
| 2.3.3 Animation from interactions | No `prefers-reduced-motion` handling in app code; smooth scrolling, drag rotate/scale, emoji hover scale |
| 2.4.1 Bypass blocks | No skip link |
| 2.4.2 Page titled | Identical `<title>` on all app pages |
| 2.4.3 Focus order | Focus lost to `<body>` after deleting; nested link and button |
| 2.4.7 / 2.4.11 Focus visible, not obscured | Removed focus rings; focusable invisible buttons; sticky header |
| 2.5.7 Dragging movements | A single-pointer alternative (Quick move) exists only for Owners and Admins |
| 2.5.8 Target size (minimum) | 16px password toggle; 24–28px action buttons |
| 3.3.1 / 3.3.2 Error identification, labels | Errors not linked to fields; placeholder-only names |
| 4.1.2 Name, role, value | Unnamed dialogs; `aria-disabled` focusable cards; missing tab and current states |
| 4.1.3 Status messages | Saving, loading, result counts, and realtime updates aren't announced; drag announcements use UUIDs |

**Reduced motion in detail:** app code has no `motion-reduce:` classes. The only reduced-motion rule loaded on the page comes from Sonner. Continuous motion includes the header and sidebar pulses and three ping indicators. Interaction motion includes `scrollIntoView({ behavior: 'smooth' })`, `scroll-smooth`, and `transition-all` on many elements. Important interactions stay usable with reduced motion because nothing depends on the animation finishing. Dialog animations are already non-functional (Audit 2 section 3.2), so they don't add motion today, but they will once the animation plugin is installed.

---

## 10. Prioritized Fix Plan

### P0 — Blocking
1. **Notification panel and emoji picker:** move both out of the menu component into a proper Popover (or build them from menu items) so Tab and arrow keys reach every control. Remove the nested `role="button"` wrapper from notification rows (2.1).
2. **Keyboard route to open a task** for every role:
   - Put a real link or button on the card title that opens the task.
   - Use a dedicated drag handle so Enter no longer means "pick up."
   - Configure drag announcements with task titles and column names (2.2).
3. **Restore visible focus** on the segmented control, settings tabs, notification tabs and rows, and native selects. Make hover-revealed buttons visible on focus (2.3).
4. **Link errors to fields** with `aria-invalid` and `aria-describedby` in every form. Give every input and select a real label or `aria-label` (2.4).
5. **Name the ⌘K dialog and the mobile nav drawer.** Expose search results as a listbox with an active option (2.5).
6. **Dynamic viewport height** for the app shell (`h-dvh`), and max-height with scrolling on every dialog (3.1, 3.2).

### P1 — Important
1. Show touch-hidden actions based on hover capability rather than width: comments, notifications, checklists, task card menu (3.3, section 7).
2. Add a skip link, `aria-current="page"` in the sidebar and breadcrumb, a named single sidebar `<nav>`, and `<main>` on public pages.
3. Proper tab semantics with arrow keys for the task sheet, project, board, notification, and settings tabs, ideally one shared Tabs primitive (see Audit 2).
4. A unique `<title>` per app page. Fix heading order (login, register, Members `<h1>`).
5. Name every icon-only button. Remove the `<Link><Button>` nesting on the dashboard.
6. Move focus somewhere sensible after deleting a task, and after route changes.
7. Touch targets of at least 24px everywhere and 44px for primary mobile actions, including the password toggle, card and row menus, and task sheet fields.
8. `autoComplete` on auth and password forms.
9. Global `prefers-reduced-motion` handling, and stop the indefinite pulse and ping animations.

### P2 — Later
1. Mobile-specific interactions: title-first quick add in a column, the notification panel as a full-screen sheet, a visible drag handle or hint, and a larger Quick-move control.
2. Tablet behavior: stage navigation between 768 and 1023px, and a persistent or collapsible sidebar option.
3. Announce status changes: saving and saved, filter and search result counts, and realtime board changes (polite live region).
4. Non-color indicators: an "Overdue" text label, "Online" text or a tooltip, and a visible unread label.
5. Connect the mention picker to the textarea as a combobox. Scope the ⌘K shortcut so it doesn't fire while typing.
6. Remove the Kanban width cap at large desktop sizes. Replace magic-number column heights.

---

*This document records findings only. No code was modified. Implementation should proceed phase by phase, per `.ai/WORKFLOW.md` (PM assessment → sub-phased implementation plan → approval gate → execution → quality gates → walkthrough), starting with P0.*
