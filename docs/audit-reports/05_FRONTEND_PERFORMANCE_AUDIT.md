# SyncSpace — Audit 5
# Frontend Performance Audit — Findings Report

**Scope:** Frontend performance only — rendering, data fetching, React Query configuration, bundle size, client/server boundaries, images/assets, Kanban performance at scale, large lists, interaction latency, network efficiency, and production hygiene.
**Out of scope:** UI redesign (Audit 2), architecture refactoring (Audit 4), backend API changes, security/production readiness (Audit 6).
**Method:** A production `next build` (Turbopack), direct inspection of the emitted `.next/static` chunks (raw and gzip size, per-route composition), a `next start` production server on a spare local port used only for measurement and stopped afterward, real-browser CDP measurements (navigation timing, LCP, CLS, long tasks, transferred JS) on `/` and `/login`, and reading the backend (`syncspace-server`) source for pagination defaults, task payloads, and realtime broadcast behavior. No code was modified as part of this audit.

Findings are labeled **Measured** (observed directly), **Confirmed** (verified in frontend or backend source, or library source), or **Suspected** (plausible from the code, needs profiling with real data volume).

---

## 1. Executive Summary

Already in good shape: no polling anywhere, search is properly debounced, task-sheet tabs load only when opened, drag auto-scroll uses refs instead of state, derived values use `useMemo` appropriately, and production output is clean — no stray logging, no devtools, no public source maps.

The problems that matter are network and data problems, not raw rendering speed:

1. **Refetch storms (Confirmed).** Every `task:*` socket event makes every viewer refetch all columns, the board, the boards list, and the open task. The user who performed the move gets a second wave from their own echoed event.
2. **Large boards are truncated (Confirmed).** Column tasks default to 20 per column on the backend, and the frontend never asks for more. There is no way today to see a column's 21st task.
3. **Bundle placement (Measured).** No dynamic imports exist anywhere in the app. zod costs ~64 KB gzipped on every signed-in route. The task sheet costs ~38 KB gzipped on the board, backlog, and my-tasks routes before it's ever opened. socket.io-client and axios load on the public landing page because the root layout wraps every route in `QueryProvider` and `SocketProvider`.
4. **Request waterfall (Confirmed).** A cold board load runs five sequential tiers after hydration, one of which is a duplicate (the board endpoint and the board-columns endpoint return identical column data).
5. **Images (Confirmed pattern, Suspected impact).** Avatars and attachment thumbnails download the full original Cloudinary file to display at 24–40px.

One correction to Audit 4 (item H1, "the board loads task data from three sources"): reading the backend confirms `getBoard` returns columns only, with **no tasks embedded**. So `useBoard` and `useBoardColumns` simply duplicate each other, and the per-column queries are the only real source of tasks. The "choose one data source" question from Audit 4 is answered: keep one query for columns, and the column-task queries for tasks.

---

## 2. Critical Performance Problems

### C1. Every task change triggers a refetch storm (Confirmed; request counts need measuring)

`useBoardRealtime` handles `task:created/moved/updated/deleted` like this:

```ts
queryClient.invalidateQueries({ queryKey: ['columns'] });                       // every column query
queryClient.invalidateQueries({ queryKey: ['board', boardId] });                // matches nothing (Audit 4)
queryClient.invalidateQueries({ queryKey: ['workspaces', ws, 'projects', p, 'boards'] }); // boards list + board + columns
queryClient.invalidateQueries({ queryKey: ['tasks'] });                         // every task detail + tabs
```

- **For every viewer, every event** refetches N columns, the boards list, the board, the board columns, and the open task plus its active tab — roughly N + 3 to N + 5 requests.
- **For the user who dragged,** `useMoveTask.onSettled` runs the same broad invalidation first. Then the backend broadcasts with `server.to(board).to(workspace)`, which includes the sender, so the echo triggers a second wave. TanStack's `invalidateQueries` defaults to `cancelRefetch: true`, so the second wave can cancel and restart the first.
- **The backend already sends what's needed.** The `task:moved` payload carries the source and destination column IDs, `newOrder`, and `boardId` — enough to refresh just the two affected columns, or patch the cache directly.
- **Worked example:** a board with 6 columns and 10 teammates viewing it. One drag produces roughly 10–18 requests for the person dragging, plus roughly 9 for each other viewer — close to 100 requests across the server for a single card move.

**Why it's critical:** the cost grows with columns × viewers × activity — exactly what grows as a team adopts the product. It's also the most likely cause of cards visibly jumping back after a drag, since a broad refetch can land mid-drag.

### C2. Large boards are silently truncated (Confirmed)

- `useColumnTasks(column.id)` passes no parameters.
- The backend's `getTasks` uses `query.limit ?? 20`.
- The UI has no "load more", infinite scroll, or page control.
- The column badge shows `tasks.length`, so it caps at 20 too.
- A move to position 25 in a 40-task column operates on data the user can't see.

**Why it's critical:** users with real workloads see an incomplete board with no warning. It also means every rendering finding in section 8 is currently hidden by the cap. Fixing this naively (e.g. `limit=500`) would immediately expose the full-board re-render cost, so the pagination fix and the rendering fix need to be designed together.

---

## 3. High Priority Problems

### H1. There are no dynamic imports, so heavy modules load eagerly (Measured)

JavaScript loaded per route, from the production build (gzipped bytes of all chunks referenced by the route's HTML):

| Route | Chunks | Raw | Gzip |
|---|---|---|---|
| `/` (landing) | 17 | 1.02 MB | 309 KB |
| `/login`, `/register` | 20 | 1.31 MB | 381 KB |
| `/dashboard` (redirect only) | 21 | 1.38 MB | 396 KB |
| Typical workspace page | 21–22 | 1.39–1.42 MB | 397–407 KB |
| My Tasks | 23 | 1.52 MB | 431 KB |
| Backlog | 24 | 1.58 MB | 444 KB |
| **Board** | 25 | 1.76 MB | **497 KB** |

The framework itself (React DOM, the RSC client, the Next runtime) accounts for roughly 180–200 KB gzipped of every route. The app-controlled weight on top of that:

- **zod 4: ~64 KB gzipped (283 KB raw), in one chunk.** It loads on every signed-in route, including `/dashboard`, which renders only a spinner. The reason is that modals with forms (e.g. Create Workspace in the workspace selector) are statically imported into the always-mounted shell. All 19 schema files use `import { z } from 'zod'`.
- **The task sheet: ~23 KB gzipped (87 KB raw), plus ~15 KB gzipped (68 KB raw) of related code.** It loads on the board, backlog, and my-tasks routes. That covers the sheet, comments, checklists, attachments, and the emoji picker. The build also emits a separate byte-identical-size copy per route — three variants with different module IDs — so moving from board to my-tasks downloads it again.
- **The board's drag-and-drop and kanban code: ~50 KB gzipped (175 KB raw).** Route-specific, which is appropriate.

**Why:** users pay for the sheet and every modal before they open one. Loading the sheet, the eight board modals, and the ⌘K search modal with `next/dynamic` removes that cost from first load without changing behavior. zod has two parts here: taking form modals out of the always-mounted shell stops zod loading on pages without a form open; separately, `zod/mini` would shrink zod itself but means rewriting 19 schemas, so that's a P2 decision to make only after measuring the first fix.

### H2. The landing and auth pages ship the whole app runtime (Measured)

- The root layout wraps every route in `QueryProvider` and `SocketProvider`.
- `QueryProvider` imports the default `axios` export just to call `axios.isAxiosError`, pulling axios into the root bundle.
- `SocketProvider` statically imports `socket.io-client`, ~13 KB gzipped alone.
- `app/page.tsx` is a single 1015-line `"use client"` file, even though its only state is two `useState` calls (the billing toggle and the mobile menu).

**Measured in the browser** on the production server over localhost: the landing page transferred 362 KB of JavaScript (1.25 MB decoded) across 21 scripts, with LCP at 172ms and CLS at 0. Localhost LCP says nothing about real networks; the transfer size is the number that carries over.

**Why:** the landing and auth pages are the first impression and the SEO surface. Neither needs a socket, a query cache, or axios until the user signs in. Mounting those providers only in the `(dashboard)` layout, and making the landing page a server component with two small client pieces, is standard App Router practice.

### H3. The board request waterfall (Confirmed from code)

A cold load of `/workspaces/:slug/projects/:projectId` runs five sequential tiers after hydration and the client-only `AuthGuard` check:

1. `GET /workspaces/my`, alongside notifications.
2. `GET project detail`, which needs the workspace ID from tier 1.
3. `GET boards` and `GET members` — waits for the project to resolve, even though `projectId` is already in the URL.
4. `GET board` **and** `GET board columns` — identical column data (see the correction in section 1).
5. N × `GET columns/:id/tasks`.

**Why:** each tier adds a full round trip. On a 150ms mobile connection, that's 750ms+ of waiting after the JavaScript has already loaded. Removing the duplicate column request and starting the boards query from the URL's `projectId` cuts one tier and one request without any restructuring.

### H4. Kanban re-render fan-out (Suspected for large boards; causes Confirmed)

`KanbanBoard` owns all interactive state, and no child is memoized. Any of these re-renders **every column and every card**:
- opening a task (both `setClientTaskId` and the URL change);
- opening or closing any of the eight modals;
- drag start and drag end;
- the mobile `IntersectionObserver` updating the selected column while swiping;
- any board-query refetch, which C1 makes frequent.

Each column also receives `availableColumns={columns.map(...)}` — a new array on every render — which busts the `useMemo` calls inside every `TaskCard`. Each card runs `useSortable`, seven `useMemo` calls, a Radix dropdown trigger, and an Avatar.

Today, the 20-per-column cap (C2) keeps a board at roughly 80–120 cards, where this is probably fine. At a few hundred cards, opening a task or a modal would re-render the entire board synchronously.

The auto-scroll is **also doubled (Confirmed in library source):**
- `@dnd-kit/dom` 0.5's `defaultPreset` already includes `AutoScroller`, and `DragDropProvider` doesn't override the plugins;
- the board also runs its own `requestAnimationFrame` scroller on the same container;
- the custom scroller calls `getBoundingClientRect()` on every `pointermove`.

**Why:** this should only be fixed after profiling (see section 10). The fix is targeted, not "memoize everything":
- make `availableColumns` stable;
- wrap `KanbanColumn` and `TaskCard` in `memo` with stable callbacks;
- move the drawer and modal state out of the component that renders the columns;
- remove one of the two auto-scrollers.

### H5. Images download at full original size (Confirmed pattern; savings Suspected)

- **Avatars:** 24 `AvatarImage` uses render Cloudinary avatar URLs (uploads up to 5MB) as plain `<img>` tags at 24–40px.
- **Attachment thumbnails:** `next/image` with `unoptimized` inside a 40px box loads the original file, which can be up to 10MB.
- **Scale:** each unique user's avatar downloads once per session; every open task with image attachments downloads each full image.

**Why:** Cloudinary resizes images when the URL requests it (e.g. `/upload/w_80,h_80,c_fill,f_auto,q_auto/`). A small URL helper, or a custom `next/image` loader, would cut these downloads to a few kilobytes each without adding any libraries. The real size of the saving depends on what users actually upload, so it should be measured (section 10) rather than assumed.

---

## 4. Medium Priority Problems

- **M1. The task sheet refetches data it already has (Confirmed).** `getTask` already includes checklists, attachments, links, and labels. The Checklists, Attachments, and Links tabs each fire their own request anyway. Separately, opening a task shows a spinner even though the card already holds most of the task. Seeding those caches from the task detail, and seeding the detail from the card with `placeholderData`, would make the sheet open instantly.
- **M2. Lists that quietly stop at the first page (Confirmed).**
  - **My Tasks** fetches only the backend default of 50 tasks, then filters, groups, and computes summary counts in the browser — wrong beyond 50 tasks, even though the backend supports `status`, `priority`, `dueDate`, `projectId`, and `page`.
  - **Notifications** fetches `{ page: 1, limit: 30 }`. The popover supports `onLoadMore`, but no caller passes it, so the button never appears.
  - **Activity** filters only the current 30-item page. The backend's `ActivityQueryDto` accepts only pagination, so fixing the search/category filter server-side is a backend change, outside this audit.
  - **Pagination** on activity, trash, and audit logs uses no `placeholderData`, so each page change flashes a loading state.
- **M3. Stale data after the socket drops (Confirmed).**
  - `SocketProvider` tears down and reconnects on every access-token refresh.
  - Nothing refetches after a reconnect.
  - Window-focus refetching is off globally and board queries use the 5-minute default `staleTime`.

  So after a laptop sleeps or the network blips, the board can stay stale for up to five minutes. Two fixes: read the token per handshake (the `auth` callback pattern), and invalidate the active board and column queries on `connect`.
- **M4. No request cancellation (Confirmed).** No query function passes TanStack's `signal` to axios. Abandoned requests — a superseded search, or a board switch mid-load — still run to completion. The fix is a one-line change per API function, most worth doing for search and column tasks.
- **M5. Duplicate task-detail cache entries (Confirmed, from Audit 4).** A task opened from a `?task=SYNC-14` link and then from a card (by UUID) is fetched twice.

---

## 5. Rendering Findings

- **Good:**
  - `activeBoardId` and the mobile column are derived rather than synced through effects.
  - The task-sheet tabs mount only when opened.
  - Auto-scroll speed lives in refs.
  - Card-level derived values are memoized.
  - The search modal re-renders on its own, not the whole page.
- **Board fan-out:** see H4. The concrete unstable inputs are `availableColumns` (a new array each render), inline `onEditColumn`, `onDeleteColumn`, and `onAddTask` handlers, and a new `data` object passed to every `useSortable` call on each render.
- **`my-tasks/page.tsx`** recomputes filtering and grouping in `useMemo`, which is fine at 50 tasks. It only becomes a real problem once the list shows everything (M2), and at that point server-side filtering is the better fix, not more memoization.
- **Not recommended:** blanket `memo`, `useMemo`, or `useCallback`. Outside the board there's no evidence of rendering cost — the other lists are small or paginated.

## 6. Network / Data Fetching Findings

- **No polling anywhere (Confirmed).** Freshness depends entirely on realtime, which is why C1 and M3 matter.
- **Query defaults:**
  - Global `staleTime` is 5 minutes, window-focus refetching is off, and retries skip 401/403 — sensible defaults.
  - Per-hook overrides range from 10 seconds to Infinity with no stated policy (Audit 4, M7).
  - Nothing sets `gcTime`; the 5-minute default is fine.
- **Invalidation:** too broad (C1), and partly aimed at keys that match nothing (Audit 4, C2).
- **Duplicates:**
  - `useBoard` and `useBoardColumns` return the same data (see the correction in section 1).
  - The task sheet's tabs duplicate data already in the task detail (M1).
  - The task detail is cached under both its UUID and its key (M5).
- **Waterfall:** see H3.
- **Over-fetching:**
  - Column tasks include each task's full checklists, which the card uses only for a done/total count.
  - `_count` is already available on the task detail but isn't used for this on the column-tasks endpoint.
  - Trimming this is a backend decision — noted here for the contract review rather than assumed as a frontend fix.
- **Cancellation:** see M4.

## 7. Bundle Findings

- **Measured totals:** 2.41 MB raw / 646 KB gzipped of client JavaScript across all routes, plus 120 KB raw / 18 KB gzipped of CSS.
- **Per-route weight:** see the table in H1 — board 497 KB, landing 309 KB, and 380–430 KB for everything else, all gzipped.
- **Biggest app-controlled items:**
  - zod: 64 KB gzipped, on every signed-in route;
  - the task sheet group: 38 KB gzipped, duplicated per route;
  - the board's drag-and-drop and kanban code: 50 KB gzipped, board only;
  - socket.io-client: 13 KB gzipped, on every route including the landing page;
  - axios, with related code: 24 KB gzipped, on every route.
- **Import style is fine:**
  - `lucide-react` named imports are optimized by Next by default.
  - The Radix `import * as` pattern is the standard Shadcn form and tree-shakes.
  - No whole-library utility imports found.
- **Unused packages** (`@dnd-kit/helpers`, the Babel and SWC packages, from Audit 4) add nothing to the client bundle — they're install-time weight only.
- **Client/server boundaries:**
  - 19 of 21 pages are `"use client"`.
  - `(dashboard)/layout.tsx` is a client component.
  - The landing page is client-rendered even though it's almost entirely static (H2).
  - The workspace pages are data-driven and fetch on the client with localStorage tokens (Audit 4, M8), so converting them to server components wouldn't pay off yet. The landing page, the root providers, and the dashboard layout shell are the worthwhile boundary changes.
- **Dynamic-import candidates, in order of value:**
  1. `TaskDetailSheet`, on three routes;
  2. the board modals (create/edit/delete for board, column, and task);
  3. `SearchCommandModal`;
  4. the emoji picker;
  5. the sprint modals;
  6. the invite and transfer-ownership modals.

## 8. Kanban / Large List Findings

**Kanban** (the core feature):

| Aspect | Finding |
|---|---|
| Task count | Capped at 20 per column (C2). This has to be fixed before any performance work at scale can be judged. |
| Loading | 2 duplicate column requests, plus N column-task requests, in a waterfall (H3). |
| Updates | Each event refetches everything instead of the affected columns (C1). The `move` payload is enough to patch the cache in place. |
| Rendering | The whole board re-renders on modal, drawer, and drag state changes (H4). |
| Drag overlay | Correct: renders a single non-sortable `TaskCard`, and the `activeTask` lookup is linear but only runs on drag start. |
| Auto-scroll | Doubled — the library's `AutoScroller` plus the custom `requestAnimationFrame` loop — with a layout read on every `pointermove` (H4). |

**Recommended approach for hundreds of tasks:**
- Per-column infinite loading, with `useInfiniteQuery` on the existing `page`/`limit` API and a "load more" at the bottom of each column.
- Combine it with the memoization fix in H4.
- Virtualization is **not** recommended yet. Columns are independent scroll containers, and virtualizing sortable drag lists with dnd-kit is complex. Revisit only if profiling a single column with 200+ loaded cards shows a real problem.

**Other lists:**

| List | Current | Recommendation |
|---|---|---|
| Members | Loads everything | Fine — workspaces are small. |
| Projects | Loads everything | Fine. |
| Comments | Cursor-based infinite loading, 20/page | Good as it is. |
| Notifications | 30, no load more | Wire up the existing `onLoadMore` with `useInfiniteQuery` (M2). |
| Activity, trash, audit logs | Server pages of 30 | Add `placeholderData: keepPreviousData` (M2). |
| My Tasks | First 50, filtered in the browser | Server-side filters and paging (M2). |

## 9. Production Findings (Measured / Confirmed)

- Only two `console.warn` calls exist, both gated to development.
- No React Query devtools, no `debugger` statements, no debug overlays.
- No `.map` files in `.next/static`, so browser source maps aren't published.
- `public/` contains only the five default Next SVGs, unused. Harmless (4KB each) but can be deleted.
- The font setup is right: one `next/font` Plus Jakarta Sans, and one woff2 file was fetched on `/login`.
- The build compiles in 4.3s and type-checks in 5.4s, with no warnings.

## 10. Measurement Plan

Nothing below has been measured yet, except where marked.

1. **Network panel, realtime cost (C1).** Open the same board in two browser windows and drag one card. Record the request count in each window, then repeat after the fix.
2. **Seeded large board (C2, H4).** Seed a board with 6 columns × 60 tasks. After pagination is in place, use the React DevTools Profiler to record:
   - opening a task;
   - opening a modal;
   - a drag start and drop;
   - a remote `task:moved` event.

   Look for commits longer than 16ms and the render count of `TaskCard`.
3. **Performance panel with 4× CPU slowdown.**
   - Record a board load and a drag.
   - Check for long tasks and layout thrashing from the auto-scroll.
   - Baseline already measured: `/login` showed two 105ms long tasks during hydration at 4× throttle; the landing page showed none.
4. **Lighthouse on mobile.** Run it on `/` and `/login` against `next start`, before and after moving the root providers (H2).
5. **Bundle analysis.**
   - Re-run the per-route chunk measurement used in this audit, or use Next 16's Turbopack bundle analyzer.
   - Confirm the drop from dynamic imports (H1).
   - Current baseline: board 497 KB, landing 309 KB, typical workspace page ~400 KB, all gzipped.
6. **Image weight (H5).** In the Network panel with the "Img" filter, compare transferred bytes on the members page and a task with image attachments, before and after Cloudinary resizing.
7. **Waterfall (H3).** Record the board's cold-load waterfall with the "Fast 4G" preset, and count the sequential tiers before and after.

## 11. Prioritized Optimization Plan

### P0 — Must Fix

1. **Targeted realtime and mutation invalidation.**
   - Use the `task:moved` / `task:*` payload to invalidate or patch only the affected columns and the open task.
   - Skip the refetch for echoes of the user's own move, since the optimistic update already shows it.
   - Narrow `useMoveTask.onSettled` to the two affected columns.

   *Why:* removes the largest source of avoidable requests (C1). Depends on the Audit 4 key factories (P0-2) and socket consolidation (P0-1).
2. **Per-column pagination** on the board, with `useInfiniteQuery` and "load more", and a correct count badge using `meta.total`. *Why:* boards are silently truncated today (C2).
3. **Remove the duplicate board-columns request,** and start `useProjectBoards` from the URL's `projectId` instead of waiting for the project to load. *Why:* one fewer request and one fewer waterfall tier on the most-used page (H3).

### P1 — Should Fix

4. **Load on demand with `next/dynamic`:** `TaskDetailSheet`, the board modals, `SearchCommandModal`, the emoji picker, and the sprint and workspace modals. Keep form modals out of the always-mounted shell until opened. *Why:* ~38 KB gzipped off three routes, and zod (64 KB gzipped) off routes without an open form (H1).
5. **Move `QueryProvider` and `SocketProvider` into the `(dashboard)` layout** and wherever auth flows need them. Replace `axios.isAxiosError` in the provider with a type-only import or an `instanceof` check, and make `app/page.tsx` a server component with small client pieces. *Why:* removes socket.io, axios, and TanStack Query from the landing and auth pages (H2).
6. **Targeted board rendering fix** after profiling (H4):
   - stable `availableColumns` and callbacks;
   - `memo` on `KanbanColumn` and `TaskCard`;
   - drawer and modal state moved out of the column renderer;
   - remove the custom auto-scroller in favor of dnd-kit's built-in `AutoScroller`, or disable the built-in one.
7. **A Cloudinary resize helper** for avatars and attachment thumbnails (H5).
8. **Resync on socket reconnect,** and stop reconnecting on every token refresh (M3).

### P2 — Later

9. **Seed the task sheet from existing data:** checklists, attachments, and links from the task detail, and the detail from the card via `placeholderData` (M1).
10. **Fix truncated lists:** server-side filters and paging for My Tasks; wire up notification "load more"; `keepPreviousData` on paginated tables (M2).
11. **Pass TanStack's `signal` to axios** for search and column tasks (M4).
12. **Evaluate `zod/mini`** once the measurement after item 4 shows whether zod still matters. It means rewriting the 19 schemas, so only do it if the numbers justify it.
13. **Delete the unused `public/*.svg` files.** Raise card-payload trimming (checklist counts instead of full checklists) in the backend contract review.

P0-1 depends on the socket consolidation and key factories from Audit 4, so those should come first or together. Per `.ai/WORKFLOW.md`, P0-1 and P0-2 touch contract behavior (event payloads and pagination), so they need the contract and edge-case review before implementation.

---

*This document records findings only. No code was modified. Implementation should proceed phase by phase, per `.ai/WORKFLOW.md` (PM assessment → sub-phased implementation plan → approval gate → execution → quality gates → walkthrough), starting with P0.*
