# SyncSpace — Audit 2
# Visual Design & Design System Audit — Findings Report

**Scope:** Typography, color system, light/dark themes, spacing, layout width, core UI components (Button, Input, Select, Dropdown, Dialog, Sheet, Tooltip, Badge, Avatar, Card, Table, Tabs, Breadcrumb, Toast, Skeleton, Empty/Error states), enterprise visual restraint, page-level visual consistency, navigation visual language, data-dense interfaces, responsive visual findings (identification only), and accessibility (contrast, focus, touch targets, reduced motion).
**Out of scope:** Product UX / information architecture (see Audit 1), responsive/accessibility behavior in depth (Audit 3), frontend architecture (Audit 4), performance (Audit 5), security/production readiness (Audit 6). No scores or rankings, no code changes, no new implementation.
**Method:** Inspection of `.ai/DESIGN_SYSTEM.md`, `src/app/globals.css`, every file in `src/components/ui/`, the compiled Tailwind output in `.next/static/chunks/*.css` (to verify actual rendered values, not just source intent), and a full grep sweep of `src/` for hardcoded colors, arbitrary sizes, blur/gradient/animation usage, and reduced-motion handling. No Stitch or other design reference images exist in this repo, and `DESIGN.md`/`VISUAL_IDENTITY.md`/`UX_PRINCIPLES.md` referenced by `.ai/DESIGN_SYSTEM.md` were not found. No code was modified as part of this audit.

---

## 1. Executive Summary

SyncSpace has a recognizable identity: dark-first, indigo primary, Plus Jakarta Sans, bordered cards. The dashboard, Kanban board, and task detail sheet look like a modern SaaS product. The design system underneath that surface isn't holding, though:

- **Tokens have drifted from the spec.** `globals.css` doesn't match `.ai/DESIGN_SYSTEM.md`: different primary, "secondary" is slate instead of emerald, and semantic colors are solid instead of tints. The radius overrides also produce a scale that's out of order.
- **There is no semantic color layer.** Roughly 390 raw palette classes (`bg-amber-500/15`, `text-emerald-600`, etc.) are scattered across 37 files. Each feature invents its own status and priority colors, so "In Progress" is blue on one page and amber on another.
- **The primitive layer is incomplete.** Select, Tabs, Tooltip, Skeleton, AlertDialog, EmptyState, and Popover don't exist as shared components. The result is ~14 native `<select>` elements in four different styles, four separate tab implementations, `title=""` used as tooltips, and native `confirm()` for a destructive delete.
- **The type scale isn't used.** There are 212 arbitrary pixel text sizes, including 20 instances of 9px text. On mobile, 49 places shrink body copy to 12px. Page H1s range from `text-xl` to `text-3xl` and mix `bold` with `extrabold`.
- **There's too much decoration for an enterprise tool.** The UI carries glassmorphism, several always-on pulsing dots, gradient text, blur glows, a rotated fake board on the login page, and invented social proof. Nothing respects `prefers-reduced-motion`.

Most of this is a handful of token and primitive fixes that then cascade through the app, not a redesign.

---

## 2. Critical Visual Issues

### 2.1 The radius scale is out of order
`globals.css` overrides Tailwind's radius keys with its own values, but the intended monotonic order (4 → 8 → 12 → 16 → 24px) doesn't survive into the compiled output because `--radius-2xl` and `--radius-3xl` aren't overridden and keep Tailwind's defaults:

| Class | Actual rendered value | Uses in `src/` |
|---|---|---|
| `rounded` | 4px | 99 |
| `rounded-md` | 12px | 49 |
| `rounded-lg` | 16px | 208 |
| `rounded-xl` | **24px** | 161 |
| `rounded-2xl` | **16px** (Tailwind default, unmodified) | 119 |
| `rounded-3xl` | 24px | 3 |

Consequences:
- Buttons and inputs using `rounded-lg` render 16px corners at 36–44px height, close to pill-shaped.
- Dropdowns, task cards, and popovers using `rounded-xl` render rounder (24px) than the cards and dialogs (`rounded-2xl`, 16px) that contain them.
- Reaching for "a bit rounder" produces the opposite result, which is likely why the codebase has drifted into five different radii in practice.

### 2.2 Status and priority colors contradict each other across pages
Each feature defines its own color map instead of sharing one. The same concept renders differently depending on where a user looks:

| Status | My Tasks / task sheet / task card | Sprint items | Dashboard status chart |
|---|---|---|---|
| To Do | slate | muted | slate |
| In Progress | **blue** | **blue** | **amber** |
| In Review | **amber** | **purple** | **indigo** |
| Done | emerald ("Completed") | emerald ("Done") | emerald ("Done") |

Priority has the same problem: Urgent is `red` in the task card, My Tasks, and the task sheet, but `rose` on the dashboard chart. Medium is `blue` in some places and `sky` in others. On My Tasks, "In Review" (amber) sits beside "High" priority (also amber) in the same row, so two unrelated meanings share a color.

Files involved: `task-card.tsx`, `task-detail-sheet.tsx`, `my-tasks/page.tsx`, `sprint-task-item.tsx`, `task-status-chart.tsx`, `task-priority-chart.tsx`.

### 2.3 Keyboard focus is invisible on several core controls
- `segmented-control.tsx` explicitly zeroes out focus styling on every option button (`outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0`).
- `workspace-settings-nav.tsx` repeats the same pattern on all four settings tabs.
- Native `<select>` filters on the projects page use `focus:outline-none` with no replacement style.
- Notification items only get a faint `bg-accent/70` tint on focus.

This fails WCAG 2.4.7 (Focus Visible) and contradicts the design system's stated focus-ring requirement.

### 2.4 Semantic chips fail contrast in light mode
- The shared `Badge` `success` and `warning` variants render solid-token text (`#16a34a` / `#d97706`) on a 15%-opacity tint of the same color at 11px semibold — roughly 3:1, below the 4.5:1 minimum.
- Notification type chips (`text-blue-500`, `text-amber-500`, `text-emerald-500`, `text-purple-500`) and dashboard chart legends have no darker light-mode variant. `amber-500` on white is roughly 2.1:1.

Light mode is where these chips are least readable, and they carry status meaning.

---

## 3. High Priority Issues

### 3.1 Tokens have drifted from `.ai/DESIGN_SYSTEM.md`
The spec and the shipped code disagree on primary color, what "secondary" means, and whether semantic colors are tints or solids (full comparison in Section 6). The team needs to decide which is the source of truth before further design work.

### 3.2 Every open/close animation is silently broken
`dialog.tsx`, `sheet.tsx`, `dropdown-menu.tsx`, and `board-empty-state.tsx` all use classes like `animate-in`, `fade-in-0`, `zoom-in-95`, and `slide-in-from-right`. These require `tw-animate-css` or `tailwindcss-animate`, and neither is installed — `animate-in` appears zero times in the compiled CSS. Every modal, sheet, and menu pops in and out instantly with no transition; the `duration-300`/`duration-400` values on the sheet do nothing.

### 3.3 Missing primitives cause visual fragmentation

| Missing primitive | What the code does today |
|---|---|
| **Select** | ~14 native `<select>` elements in four styles: transparent inline (projects filters), `h-11 rounded-lg` with a hardcoded indigo glow (invite modal), `h-10 rounded-xl` with a ring (create-task), `h-11 pl-10` (profile form). Native OS dropdowns often ignore the app's dark theme. |
| **Date picker** | Nine native `type="date"` inputs, each styled entirely by the OS. |
| **Tabs** | Four implementations: underline `border-b-2` (settings), pills (project page), segmented control, and a bespoke one in the notification popover. |
| **Tooltip** | `title=""` attributes in 10+ files — slow, unstyled, and invisible on touch devices. |
| **AlertDialog** | Native `confirm()` for task deletion in `task-detail-sheet.tsx`, visually inconsistent with the custom confirm dialogs used for sprints and workspaces. |
| **Skeleton / EmptyState / ErrorState** | Hand-rolled per file (see 4.8, 4.9). |

### 3.4 Control heights and focus treatments are inconsistent
- `Button` defaults to `h-11` (44px) while `Input` defaults to `h-9` (36px), so a default button and input never align in a row. Heights are overridden constantly at call sites: `h-7` ×25, `h-8` ×75, `h-9` ×50, `h-10` ×78, `h-11` ×85, `h-12` ×26.
- Three different input focus styles exist: `Input` uses a border + a glow hardcoded to `rgba(79,70,229,…)` (the light-mode primary, even in dark mode); `Textarea` uses `ring-2`; the invite-modal `<select>` uses `rgba(70,72,212,…)` — the spec's primary rather than the code's.
- `Input` uses `text-sm`; `Textarea` uses `text-xs sm:text-sm`.

### 3.5 The type scale isn't used
- **Arbitrary sizes:** 212 instances (`text-[11px]` ×100, `text-[10px]` ×92, `text-[9px]` ×20). 9px text appears on the login page, audit log, task cards, and search modal.
- **Mobile shrink:** `text-xs sm:text-sm` appears 49 times across table cells, card descriptions, dialog descriptions, and nav labels — mobile gets 12px body text, the opposite of what small screens need.
- **H1s aren't consistent** in size (`text-xl` to `sm:text-3xl`), weight (`bold` vs `extrabold`), or whether an icon is included. Members has no H1 at all — its heading is an `<h2>` inside the table component.
- Five font weights are loaded (400–800); `extrabold` (53 uses) is the de facto heading weight.
- `CardTitle` (`text-xl bold`), `DialogTitle` (`text-xl bold`), and `SheetTitle` (`text-lg semibold`) don't share a scale, and page H1s are sometimes smaller than card titles.

### 3.6 Every card looks clickable
The base `Card` component includes `hover:shadow-md` unconditionally. Chart cards, settings forms, KPI cards (which layer on `hover:border-primary/40`), and the dashboard operations card all lift on hover even though most do nothing when clicked. The design system intends hover elevation only for interactive cards.

### 3.7 Loading states don't match each other
- **Centered `Loader2` spinners:** members, settings, profile, the dashboard resolver, the auth guard, the guest guard, verify-email, and invitation-accept pages — forbidden for page layouts per `.ai/WORKFLOW.md`.
- **Skeletons:** dashboard, Kanban, notifications, audit logs, trash, and backlog use generic blocks that don't resemble real content, so pages jump when data arrives.
- **Plain text:** Kanban columns show "Loading tasks...".

### 3.8 Auth and landing pages use a separate visual language
`login-form.tsx` and `register-form.tsx` use hardcoded hex gradients (`from-[#1e1b4b] via-[#0f172a] to-[#020617]`) and surfaces (`bg-[#09090b]`, `#18181c`), a `-rotate-1` "fake board" with 9px text, and `text-white` throughout — always dark regardless of theme. The landing page (`app/page.tsx`) adds gradient text via `bg-clip-text`, a blurred `rounded-3xl` glow, invented trust logos (Vercel, Supabase, Linear), a "99.9%" uptime figure, and pricing copy. Audit 1 flagged the fabricated social proof from a UX angle; visually it also breaks token discipline.

---

## 4. Medium Priority Issues

- **4.1 Decorative color in KPI cards.** Each of the four dashboard KPI cards uses a different accent (indigo, amber, `indigo-500`, violet) with little semantic tie to its content; a "Sparkles Active" badge under Workspace Scale carries no information. Numbers use `font-mono` for alignment where `tabular-nums` would suffice.
- **4.2 Too much continuous motion.** Header Live/Offline dots and the sidebar "Sync Engine" dot use `animate-pulse`; sprint cards, the backlog view, and the presence indicator use `animate-ping`. Up to five perpetually animating elements can appear on one screen, and no `motion-reduce:` handling exists anywhere in the codebase. The sidebar dot also duplicates the header status and always shows green, even offline.
- **4.3 Glassmorphism on working surfaces.** The header uses `bg-card/80 backdrop-blur-xl`; Kanban columns use `bg-card/60 backdrop-blur-xs`; the drag overlay uses `backdrop-blur-md`; dialog/sheet overlays use `backdrop-blur-xs`. Blur on surfaces that sit on a flat background adds cost without visual benefit.
- **4.4 No elevation scale.** `shadow-2xl` (sheet, task sheet, search modal, mobile drawer), `shadow-xl` (dialog, notification popover, mention popover), and `shadow-lg`/`shadow-md` (dropdowns, depending on call site) — nine distinct shadow tokens in use with no rule for which to pick.
- **4.5 The sidebar differs from the spec.** Active item uses a 3px bar (spec calls for 2px); nav labels drop to `text-xs` on mobile; "MENU"/"GENERAL" group labels add little for six total items.
- **4.6 Badges don't carry consistent meaning.** Raw uppercase enums are rendered directly (`OWNER`, `ACTIVE`, `HIGH PRIORITY`, `{project.status}`); the project details page renders every status as the same default indigo badge while the project card maps statuses to different variants, so the same project looks different on two pages. The Admin role badge uses `warning` (amber), which reads as "problem" rather than "privileged".
- **4.7 Colors outside the palette.** The "Start Sprint" button uses a bespoke `bg-emerald-600 text-white`, effectively a second primary color; sprint accents also use purple, which isn't in the token set.
- **4.8 Empty states are several unrelated designs.** Board empty state (`rounded-3xl`, a `ring-8` halo, a no-op `animate-in`), column empty state (a dashed box), notification empty state, and separate designs again on projects, members, activity, and My Tasks.
- **4.9 Error states aren't unified.** Members (card + `ShieldAlert` + `h3`), project-not-found (`h2 text-lg`), trash/audit-logs "Access Restricted" (a different layout again), and the task sheet (amber `AlertTriangle`) all diverge.
- **4.10 Markup issues that also affect visuals.** Dashboard header actions nest `<Button>` inside `<Link>` (double focus stop); the dashboard settings gear and the project-details archive icon are icon-only buttons with no `aria-label`.
- **4.11 Low-opacity text stacking.** `text-muted-foreground/70`, `/60`, `/50`, and `opacity-60` stack on an already-muted token; several combinations fall under 4.5:1 in light mode.

---

## 5. Low Priority Polish

- The font token is defined twice: `@theme` hardcodes `'Plus Jakarta Sans', system-ui`, overriding next/font's `"Plus Jakarta Sans Fallback"`, which exists specifically to prevent layout shift while the font loads — so text still reflows on load.
- `:root --radius: 0.5rem` isn't referenced by any utility.
- The search shortcut hint shows `⌘K` regardless of OS (Windows/Linux users don't have a ⌘ key).
- The theme toggle's sun rotates on hover and uses `amber-400`, another one-off decorative accent.
- The project header uses a one-off 1.5px inline-colored accent strip; the landing page has a one-off `tracking-[-0.03em]`.
- The transfer-ownership modal uses a native checkbox; the create-board modal hand-rolls its own switch.
- The Kanban drag overlay combines `rotate-1 scale-[1.02] shadow-2xl ring-2 blur` — a lot of simultaneous effects for one state.
- Task card titles render at `text-xs`, the smallest size on the card despite being its primary content.
- `DialogFooter` adds a `border-t`; `SheetFooter` doesn't.

---

## 6. Design Token Findings

| Token | `.ai/DESIGN_SYSTEM.md` | `globals.css` today |
|---|---|---|
| Primary (light) | `#4648d4` | `#4f46e5` (Tailwind indigo-600) |
| Primary (dark) | not specified | `#6366f1` |
| Secondary | Emerald `#006c49` / dark `#4edea3` | Slate `#f1f5f9` (a neutral). The emerald secondary is gone; raw `emerald-*` classes fill the gap ad hoc. |
| Tertiary | Amber `#904900` | `#b45309`, defined but never mapped into `@theme`, so it's unusable. |
| Success / warning / danger | Tinted containers | Solid 600-level colors; `Badge` then re-tints them at 15%, causing the contrast failure in 2.4. |
| Container / outline tokens | Spec-defined | `--primary-container`, `--outline`, `--outline-variant`, `--secondary-container` exist in light mode only, aren't in `@theme`, and are never referenced. |
| Radius | 4 / 8 / 12 / 16 / 24 | Out of order — see 2.1. |
| Type scale | display, headline-lg, headline-md, body, label-md, label-sm | Not defined as tokens; 212 arbitrary sizes used instead. |
| Elevation | Flat cards, hover-md for interactive only | No tokens; nine shadow levels in ad hoc use. |
| Spacing / width | 8px unit, 1280px max, 32/16px margins, 24px gutters | Roughly followed in the shared layout (`p-4 sm:p-6 lg:p-8`, `max-w-7xl`), but pages nest their own conflicting widths (Section 9). |
| Status / priority | Not defined | Missing entirely — root cause of 2.2. |
| Motion | Not defined | No duration/easing tokens; no reduced-motion support. |

---

## 7. Component Consistency Findings

| Component | Status | Notes |
|---|---|---|
| **Button** | Partial | Variants are solid, including the spec's `border-t` highlight and `active:scale`. Default is 44px while inputs default to 36px; `rounded-lg` renders 16px; heavy height overrides at call sites; a custom emerald sprint button bypasses the variants entirely. |
| **Input / Textarea** | Diverging | Different focus styles, heights, and text sizes; the input focus glow is hardcoded rgba and ignores the active theme. |
| **Select** | Missing | Native, in four distinct styles (3.3). |
| **Dropdown** | OK, but | Radix-based; 24px radius; animations are no-ops; call sites override radius and shadow inconsistently. |
| **Dialog** | OK, but | No animation; `shadow-xl`; title (`text-xl bold`) is larger than some page H1s. |
| **Sheet** | OK, but | No animation; `shadow-2xl`; mobile nav and the task sheet override widths ad hoc. |
| **Tooltip** | Missing | `title=""` everywhere (3.3). |
| **Badge** | Diverging | Six variants, but call sites override size, radius, and color (indigo/violet on `variant="default"`); parallel inline "chips" exist outside `Badge` in the task card, My Tasks, sprint items, and notifications. |
| **Avatar** | OK | Initials logic is duplicated per file; online dots use raw `emerald-500` rather than a token. |
| **Card** | Diverging | False hover affordance on every card (3.6); most call sites redundantly repeat the already-default `rounded-2xl border-border bg-card`. |
| **Table** | OK, but | 11px bold uppercase headers; cells drop to `text-xs` on mobile; wrapper uses `rounded-xl` (24px, inconsistent with cards at 16px). |
| **Tabs** | Missing | Four implementations; two remove focus rings entirely. |
| **Breadcrumb** | OK | Consistent in the header. |
| **Toast** | OK | Sonner `richColors` uses Sonner's own palette rather than app tokens, so toasts look visually foreign, especially in dark mode. |
| **Skeleton** | Missing | Every file hand-rolls `animate-pulse` blocks (3.7). |
| **Empty state** | Missing | Three-plus distinct designs (4.8). |
| **Error state** | Missing | Four-plus distinct designs (4.9). |

---

## 8. Light/Dark Theme Findings

- **System preference is ignored.** `<html className="... dark">` is hardcoded and `defaultTheme="dark"` is set, so users with a light OS preference land in dark mode — contradicts `AGENTS.md`'s requirement to respect `prefers-color-scheme`.
- **Light mode is the weaker theme.** It carries the contrast failures from 2.4 and the low-opacity muted text from 4.11. Palette maps that include a `dark:` variant (task card, My Tasks) are acceptable; maps without one (notifications, charts, icons) are too faint on white.
- **Dark tokens are incomplete.** Container, outline, and tertiary tokens aren't redefined in `.dark`, so they'd silently inherit light values if ever used.
- **Some surfaces are permanently dark.** The auth hero, its fake board preview, and the landing preview use `bg-[#09090b]`/`text-white` regardless of the active theme.
- **The input focus glow is always light-indigo** because it's a hardcoded rgba value.
- **`--success-foreground: #000` in dark mode** makes solid success elements black-on-green while danger stays white-on-red — semantic tokens don't share a consistent foreground rule.
- **The overlay (`bg-black/60`) is identical in both themes**, which is acceptable, though light mode could reasonably use a lighter scrim.

---

## 9. Responsive Visual Findings

Identification only; behavior is covered in Audit 3.

- **1440 / 1280px:** The shared layout already wraps content in `max-w-7xl`, but pages add another `max-w-7xl` (projects, project details, backlog) or `max-w-5xl` (settings, activity, audit logs, trash) on top, so page width visibly jumps between sections. The Kanban board is capped at 1280px, wasting the horizontal space the board most needs.
- **1024px:** The 240px sidebar leaves ~720px of content; the 4-column KPI grid and 2-column chart grid both switch right at this width and feel cramped.
- **768px:** The header's "Live" pill disappears below `md`, so connection status is invisible on tablets; Members hides its "Joined" column.
- **640px:** Header search collapses to an icon-only button; body text drops to 12px wherever `text-xs sm:text-sm` is used.
- **390px:** Kanban columns use `w-[86vw] max-w-[340px]` with a magic-number `max-h-[calc(100dvh-220px)]` that breaks if header/tab heights change; the notification popover is a fixed `w-[360px]`; Members truncation uses an `xs:` breakpoint that isn't defined in Tailwind v4 and does nothing; touch targets fall below 44px in several places (`h-7` task menus, `h-6` comment buttons, `h-8` icon buttons).

---

## 10. Unnecessary Visual Elements

- Sidebar "Sync Engine" pulsing dot and `v1.0.0` footer (duplicates the header status).
- Pulsing Live/Offline dots and `animate-ping` presence/sprint indicators — one static dot plus a label would communicate the same thing.
- `backdrop-blur` on the header, Kanban columns, and drag overlay.
- Gradient text, blur glow, rotated preview card, fake trust logos, uptime figure, and pricing copy on the landing and auth pages.
- The rainbow of KPI icon colors and the "Sparkles Active" badge.
- The `ring-8` halo and `rounded-3xl` on the board empty state.
- The workspace "ACTIVE" badge with a Shield icon and the slug display on the dashboard header.
- Icons inside page H1s on some pages but not others.
- "MENU" and "GENERAL" sidebar group labels.
- Hover shadow/border effects on non-interactive cards.

---

## 11. Recommended Design System Changes

1. **Decide the source of truth.** Either update `.ai/DESIGN_SYSTEM.md` to match the shipped palette, or move the code back to `#4648d4` and restore the emerald secondary. Delete or properly map any token that isn't currently usable.
2. **Fix the radius scale.** Stop overriding Tailwind's scale keys inconsistently, or use a clean monotonic scale: `sm` 4, `md` 6, `lg` 8, `xl` 12, `2xl` 16. Apply a rule: 8px for controls, 12px for cards/menus/popovers, 16px for dialogs/sheets, `full` for chips/avatars.
3. **Add status and priority tokens.** Define `--status-todo/in-progress/review/done/blocked` and `--priority-urgent/high/medium/low`, each with light/dark foreground+background pairs. Expose them through a single shared `StatusBadge` and `PriorityBadge`, and reuse the same tokens in charts.
4. **Make semantic chips readable.** Tint background + darker foreground text (700-level in light, 300-level in dark) to guarantee at least 4.5:1 contrast.
5. **Add a real type scale** via `@theme` tokens (`display`, `h1`, `h2`, `h3`, `body`, `body-sm`, `label`, `caption` ≥ 11px). Ban arbitrary sub-11px sizes, standardize on one page-H1 style, and never shrink body text on mobile.
6. **Add elevation and motion tokens.** Three elevation levels (flat, raised, overlay); two motion durations and one easing curve; install `tw-animate-css` so existing Radix animation classes actually work; add global `motion-reduce` handling.
7. **Add the missing primitives** (standard Shadcn versions): Select, Tabs, Tooltip, Skeleton, AlertDialog, Popover, Checkbox, Switch, a date picker, plus shared `PageHeader`, `EmptyState`, and `ErrorState`.
8. **Unify control sizing** across Button, Input, and Select on one height scale (e.g. `sm` 32 / `default` 36 / `lg` 40), while keeping mobile touch targets at ≥44px via padding/hit-area rather than visual size.
9. **Standardize focus** to a single `focus-visible:ring-2 ring-ring ring-offset-2` on every interactive primitive, driven by the ring token rather than hardcoded rgba values.
10. **Separate interactive and static cards.** Make `Card` static by default; add an explicit `interactive` variant that opts into the hover lift.

---

## 12. Prioritized Implementation Plan (Phases)

### Phase 0 (P0) — Must Fix
Token-level defects that actively cause incorrect or inaccessible rendering and drive most downstream inconsistency.

1. **Fix the radius scale** in `globals.css` so `rounded-lg/xl/2xl/3xl` render in ascending order (2.1).
2. **Create the status/priority token layer** with shared `StatusBadge`/`PriorityBadge` components; replace the six independent local color maps in task card, task sheet, My Tasks, sprint item, and the two dashboard charts (2.2).
3. **Restore visible keyboard focus** on the segmented control, settings tabs, native selects, and notification items (2.3).
4. **Fix light-mode contrast** on the `Badge` success/warning variants, notification type chips, and chart legends (2.4).
5. **Reconcile the token source of truth** between `.ai/DESIGN_SYSTEM.md` and the shipped palette (3.1).

### Phase 1 (P1) — Should Fix
Structural primitive and consistency gaps that affect day-to-day polish and trust.

1. Install the animation plugin so dialogs/sheets/menus animate again; add `motion-reduce` support globally (3.2, 4.2).
2. Build the missing primitives — Select, Tabs, Tooltip, AlertDialog, Skeleton, EmptyState, ErrorState, PageHeader — and migrate the native `<select>`s and `confirm()` call onto them (3.3).
3. Unify control heights and focus styles across Button, Input, and Textarea (3.4).
4. Add type-scale tokens, remove sub-11px text and the mobile text-shrink pattern, and standardize page H1s (3.5).
5. Make `Card` static by default; add an explicit interactive variant (3.6).
6. Replace page-level centered spinners with content-shaped skeletons (3.7).
7. Respect system theme preference by default instead of forcing dark (Section 8).
8. Remove the fabricated trust logos/metrics on the landing page and move the auth hero onto design tokens (3.8).

### Phase 2 (P2) — Later
Polish, restraint, and layout normalization.

1. Define the elevation scale; remove glassmorphism from working surfaces (4.3, 4.4).
2. Align the sidebar active-state indicator with the spec; calm the KPI card accent colors; remove decorative badges/dots (4.1, 4.5, Section 10).
3. Standardize badge copy (no raw enums) and fix role-color semantics, e.g. Admin shouldn't use the "warning" token (4.6).
4. Normalize nested page container widths; give the Kanban board full available width; fix the non-functional `xs:` breakpoint usage (Section 9).
5. Address the remaining low-priority polish items in Section 5.

---

*This document records findings only. No code was modified. Implementation should proceed phase by phase, per `.ai/WORKFLOW.md` (PM assessment → sub-phased implementation plan → approval gate → execution → quality gates → walkthrough), starting with Phase 0.*
