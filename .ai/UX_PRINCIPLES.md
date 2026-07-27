# UX_PRINCIPLES.md — SyncSpace User Experience Guidelines

Version: 4.0  
Visual Foundation: **SyncSpace Signature — Serious Software** (See `DESIGN.md`, `VISUAL_IDENTITY.md` & `DESIGN_SYSTEM.md`)

---

# Purpose

This document defines how SyncSpace **behaves** — the interaction patterns, feedback strategies, and usability standards that make the product feel responsive, authoritative, trustworthy, and effortless.

`VISUAL_IDENTITY.md` defines what it looks like. `DESIGN_SYSTEM.md` defines how to build it. This document defines how it feels to use.

---

# 1. Core UX Principles

## 1.1 Content-First Utility & Clarity

The interface serves the content. UI chrome (sidebars, headers, navigation, borders) recedes into a subtle monochromatic surface structure, ensuring that the user's work items (tasks, boards, metrics, comments) command primary focus.

**Rules**:
- Navigation items use `on-surface-variant` (`#464554`) at rest. Only the active navigation item receives Electric Indigo (`#4648d4`) highlighting with a 2px leading edge bar.
- Container borders are structural outlines (`1px border border-border`), never decorative.
- Work item data (task titles, metric values, assignee avatars) are the most visually prominent elements on screen.
- Empty states are purposeful invitations with primary CTAs — never dead ends.

## 1.2 Tactile Micro-Elevation & Micro-Interactions

Components respond to user touch and click with physical feedback:
- **Button Inset Accent**: Primary buttons incorporate a `1px` inset top-border (`border-t border-white/20`) to convey a premium editorial feel.
- **Active Press Scale**: Buttons and interactive card controls feature a subtle tactile press state, scaling down to `98%` (`active:scale-[0.98]`) on mouse click or tap.
- **Hover Lift**: Cards are flat by default with a `1px` neutral border, gaining a diffused ambient shadow (`hover:shadow-md`) on hover.
- **Input Focus Glow**: Form inputs shift from a neutral border to Electric Indigo on focus, accented with a 10% opacity indigo glow (`focus:shadow-[0_0_0_3px_rgba(70,72,212,0.1)]`).

## 1.3 Progressive Disclosure

Show the minimum information needed for each context level. Details appear on demand, not upfront.

**Rules**:
- Kanban task cards display title + priority status chip + assignee avatar. Full details, comments, and attachments open in the intercepted Task Detail modal.
- Sidebar displays clear section navigation. Badge counters appear only for unread or high-priority notifications.
- Icon-only actions must provide tooltips on hover (`label-sm` scale).

## 1.4 Spatial Consistency

Users build spatial memory. Interactive controls must retain consistent positions across all screens.

**Rules**:
- Left sidebar for main navigation; top header for search, notifications, and profile.
- Primary confirm actions ("Save", "Create", "Submit") are always rightmost in button groups.
- Destructive actions ("Delete", "Remove") are always leftmost and rendered with destructive color tokens.
- Modals close via top-right close icon or `Escape` key.

## 1.5 Zero-Latency Perception & Optimistic UI

The interface feels instantaneous even during background asynchronous operations.

**Rules**:
- **Optimistic Mutations**: Moving Kanban cards or posting comments updates the UI state immediately (`onMutate`), with automatic rollback if the API call fails.
- **Skeletons**: Initial view loading renders layout-matching skeleton placeholders within `50ms`.
- **Button Loading State**: Buttons preserve width, replacing label with a spinning loader (`Loader2`) and disabling pointer events.
- **Micro-transitions**: 150ms ease-out transitions for hover and state changes.

---

# 2. Interaction Patterns

## 2.1 Navigation

| Interaction | Behavior |
|---|---|
| Sidebar nav click | Instant route transition. Active item displays 2px Electric Indigo leading edge bar. |
| Breadcrumb click | Navigate to parent context. Breadcrumbs maintain full visual path. |
| Workspace switcher | Dropdown menu listing user workspaces + "Create Workspace" modal trigger. |
| `Ctrl+K` / `⌘+K` | Opens Command Palette (Global Search). |

## 2.2 Form Validation & Input Feedback

| Pattern | Implementation |
|---|---|
| Validation timing | Validate on `blur` initially, then `onChange` once an error is flagged. |
| Focus feedback | 1px Electric Indigo border + 10% indigo ambient glow. |
| Submit state | Disable button, show inline `Loader2` spinner. |
| Error feedback | Red error message below input (`text-xs text-danger font-medium`) + red input border. |

## 2.3 Modals & Dialogs

| Pattern | Behavior |
|---|---|
| Open | Fade-in overlay (`bg-black/50 backdrop-blur-xs`) + scale-in dialog from `0.96` (`200ms ease-out`). |
| Close | `Escape` key, background overlay click, or top-right close icon (`150ms ease-in`). |
| Task detail modal | Intercepted route modal overlaying active board (`?taskId=xyz`). |

---

# 3. Status Chips & Pill Geometry

All status indicators, priority tags, and metric trend indicators strictly use **full pill geometry (`rounded-full`)** with low-saturation background tints:

- **Status**: `TODO` (Neutral), `IN_PROGRESS` (Indigo Tint), `REVIEW` (Warm Amber), `DONE` (Emerald Green).
- **Priority**: `LOW` (Neutral), `MEDIUM` (Indigo Tint), `HIGH` (Warm Amber), `URGENT` (Crimson Red).
