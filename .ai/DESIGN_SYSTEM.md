# DESIGN_SYSTEM.md — SyncSpace Design System

Version: 3.0
Visual Language: **Quiet Precision** (See `VISUAL_IDENTITY.md`)

---

# Overview

The SyncSpace Design System translates the **Quiet Precision** visual identity into implementable tokens, component patterns, and layout rules for the Next.js / Tailwind CSS v4 frontend.

This document is the single source of truth for all visual implementation decisions. When in doubt, refer here — not to any external reference.

---

# 1. CSS Token Implementation

### Tailwind CSS v4 OKLCH Variables (`src/app/globals.css`)

```css
@layer base {
  :root {
    /* ─── Light Mode: "Paper Studio" ─── */

    /* Surfaces */
    --background: oklch(0.965 0.005 260);        /* #F4F6FA  Canvas */
    --foreground: oklch(0.15 0.02 260);           /* #0A1029  Primary Text */

    --card: oklch(1 0 0);                         /* #FFFFFF  Elevated Surface */
    --card-foreground: oklch(0.15 0.02 260);

    --popover: oklch(1 0 0);
    --popover-foreground: oklch(0.15 0.02 260);

    /* Primary: Sapphire Blue (262°) */
    --primary: oklch(0.55 0.24 262);              /* Deep Sapphire */
    --primary-foreground: oklch(0.99 0 0);        /* White */

    /* Secondary */
    --secondary: oklch(0.95 0.008 260);           /* Soft Slate */
    --secondary-foreground: oklch(0.20 0.015 260);

    /* Muted */
    --muted: oklch(0.96 0.005 260);
    --muted-foreground: oklch(0.55 0.02 260);     /* #64748B  Captions */

    /* Accent */
    --accent: oklch(0.95 0.012 260);
    --accent-foreground: oklch(0.18 0.02 260);

    /* Semantic: Soft Pastel Fill + Deep Saturated Text */
    --success: oklch(0.95 0.05 155);
    --success-foreground: oklch(0.45 0.15 155);

    --warning: oklch(0.95 0.05 85);
    --warning-foreground: oklch(0.48 0.14 85);

    --danger: oklch(0.95 0.05 25);
    --danger-foreground: oklch(0.48 0.18 25);

    --destructive: oklch(0.95 0.05 25);
    --destructive-foreground: oklch(0.48 0.18 25);

    /* Structural */
    --border: oklch(0.92 0.008 260);
    --input: oklch(0.92 0.008 260);
    --ring: var(--primary);
    --radius: 0.75rem;                            /* 12px Base Radius */
  }

  .dark {
    /* ─── Dark Mode: "Midnight Workshop" ─── */

    /* Surfaces */
    --background: oklch(0.13 0.02 260);           /* #0C1222  Canvas */
    --foreground: oklch(0.95 0.008 260);          /* #F1F5F9  Primary Text */

    --card: oklch(0.17 0.025 260);                /* #141B2D  Surface */
    --card-foreground: oklch(0.95 0.008 260);

    --popover: oklch(0.20 0.025 260);             /* #1A2338  Elevated */
    --popover-foreground: oklch(0.95 0.008 260);

    /* Primary: Brighter Sapphire for dark backgrounds */
    --primary: oklch(0.62 0.22 262);
    --primary-foreground: oklch(0.99 0 0);

    /* Secondary */
    --secondary: oklch(0.22 0.025 260);
    --secondary-foreground: oklch(0.95 0.008 260);

    /* Muted */
    --muted: oklch(0.21 0.02 260);
    --muted-foreground: oklch(0.65 0.015 260);    /* #94A3B8 */

    /* Accent */
    --accent: oklch(0.23 0.02 260);
    --accent-foreground: oklch(0.95 0.008 260);

    /* Semantic: Deep Jewel Fill + Bright Pastel Text */
    --success: oklch(0.23 0.06 155);
    --success-foreground: oklch(0.75 0.16 155);

    --warning: oklch(0.23 0.06 85);
    --warning-foreground: oklch(0.82 0.14 85);

    --danger: oklch(0.23 0.06 25);
    --danger-foreground: oklch(0.75 0.18 25);

    --destructive: oklch(0.23 0.06 25);
    --destructive-foreground: oklch(0.75 0.18 25);

    /* Structural */
    --border: oklch(0.25 0.02 260);
    --input: oklch(0.25 0.02 260);
    --ring: var(--primary);
  }
}
```

---

# 2. Tailwind Theme Bridge

Map CSS custom properties to Tailwind v4's `@theme inline` directive:

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);

  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);

  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);

  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);

  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);

  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);

  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);

  --color-success: var(--success);
  --color-success-foreground: var(--success-foreground);

  --color-warning: var(--warning);
  --color-warning-foreground: var(--warning-foreground);

  --color-danger: var(--danger);
  --color-danger-foreground: var(--danger-foreground);

  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);

  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);

  --radius-sm: calc(var(--radius) - 4px);    /* 8px  */
  --radius-md: calc(var(--radius) - 2px);    /* 10px */
  --radius-lg: var(--radius);                /* 12px */
  --radius-xl: calc(var(--radius) + 4px);    /* 16px */
  --radius-2xl: calc(var(--radius) + 8px);   /* 20px */
  --radius-full: 9999px;
}
```

---

# 3. Typography Implementation

- **Font Family**: `Inter` (Google Fonts). Fallback: `system-ui, -apple-system, sans-serif`.
- **Font Variable**: `--font-sans` set via `next/font/google`.

### Type Scale Reference

| Class Pattern | Size | Weight | Tracking | Context |
|---|---|---|---|---|
| `text-4xl font-extrabold tracking-tight` | 2.25rem | 800 | tight | Landing hero (mobile) |
| `text-5xl font-extrabold tracking-tight` | 3rem | 800 | tight | Landing hero (desktop) |
| `text-2xl font-bold tracking-tight` | 1.5rem | 700 | tight | Page titles |
| `text-xl font-semibold tracking-tight` | 1.25rem | 600 | tight | Section headings |
| `text-base font-semibold` | 1rem | 600 | normal | Card titles |
| `text-sm` | 0.875rem | 400 | normal | Body text |
| `text-xs font-medium` | 0.75rem | 500 | wide | Captions, timestamps |
| `text-[11px] font-semibold uppercase tracking-widest` | 0.6875rem | 600 | widest | Overline labels |
| `text-2xl font-bold tracking-tight` | 1.5rem | 700 | tight | Metric KPI values |
| `text-[11px] font-semibold` | 0.6875rem | 600 | normal | Badge pill text |

### Text Color Hierarchy

| Level | Token | Usage |
|---|---|---|
| Primary | `text-foreground` | Headings, important values, primary labels |
| Secondary | `text-muted-foreground` | Descriptions, captions, timestamps, breadcrumbs |
| Interactive | `text-primary` | Links, active navigation items, actionable text |
| Disabled | `text-muted-foreground/50` | Disabled controls, placeholder text |
| Inverse | `text-primary-foreground` | Text on primary-colored backgrounds |

---

# 4. Component Styling Patterns

### 4.1 Cards

The fundamental container unit. Cards float on canvas with subtle elevation.

```
┌─────────────────────────────────────────┐
│  Card Container                         │
│  bg-card                                │
│  border border-border                   │
│  rounded-xl (12px)                      │
│  shadow-sm (light) / no shadow (dark)   │
│  p-5 (20px padding)                     │
│                                         │
│  ┌──────────────────────────────────┐   │
│  │ Inner Content Block              │   │
│  │ rounded-lg (8px)                 │   │
│  │ bg-muted/40 or bg-secondary/40  │   │
│  │ p-4 (16px padding)              │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

- **Hover state**: `hover:shadow-md` (light mode), `hover:border-border/80 hover:bg-accent/30` (dark mode).
- **Rule**: Inner elements always use a smaller radius than the parent card.

### 4.2 Metric Cards (Dashboard)

```
Pattern: [Icon] + [Label] + [Value] + [Change Badge]

┌─────────────────────────────────┐
│  📊 Total Tasks                 │
│                                 │
│  248                            │ ← text-2xl font-bold
│  ┌──────────┐                   │
│  │ ↑ +12.8% │                   │ ← rounded-full badge
│  └──────────┘                   │
└─────────────────────────────────┘
```

- **Label**: `text-xs font-medium text-muted-foreground`
- **Value**: `text-2xl font-bold text-foreground tracking-tight`
- **Change badge**: `rounded-full px-2 py-0.5 text-[11px] font-semibold`
  - Positive: `bg-success text-success-foreground`
  - Negative: `bg-danger text-danger-foreground`
  - Neutral: `bg-muted text-muted-foreground`

### 4.3 Buttons

| Variant | Background | Text | Border | Hover |
|---|---|---|---|---|
| `default` | `bg-primary` | `text-primary-foreground` | none | `bg-primary/90` + slight lift |
| `secondary` | `bg-secondary` | `text-secondary-foreground` | none | `bg-secondary/80` |
| `outline` | `bg-transparent` | `text-foreground` | `border-border` | `bg-accent` |
| `ghost` | `bg-transparent` | `text-muted-foreground` | none | `bg-accent text-accent-foreground` |
| `destructive` | `bg-destructive` | `text-destructive-foreground` | none | `bg-destructive/90` |

**Sizes**:
- `sm`: `h-8 px-3 text-xs rounded-lg gap-1.5`
- `default`: `h-9 px-4 text-sm rounded-xl gap-2`
- `lg`: `h-10 px-6 text-sm rounded-xl gap-2`
- `icon`: `h-9 w-9 rounded-xl` (square, icon-only)

**Loading state**: Replace button label with `<Loader2 className="h-4 w-4 animate-spin" />`, set `pointer-events-none opacity-70`.

### 4.4 Form Inputs

```
bg-background (not bg-card — creates recessed feel)
border border-input
rounded-lg (8px)
h-9 px-3 text-sm
transition-colors duration-150

Focus: ring-2 ring-ring ring-offset-2 ring-offset-background
Error: border-danger ring-danger
Disabled: opacity-50 cursor-not-allowed
```

- **Labels**: `text-sm font-medium text-foreground` — placed above input, `space-y-1.5` gap.
- **Helper text**: `text-xs text-muted-foreground` — below input.
- **Error text**: `text-xs text-danger-foreground` — replaces helper text.

### 4.5 Status Badges (Pills)

All status indicators use full pill geometry. Color is semantic.

```
rounded-full px-2.5 py-0.5 text-[11px] font-semibold
inline-flex items-center gap-1
```

| Status | Light Style | Dark Style |
|---|---|---|
| `TODO` | `bg-muted text-muted-foreground` | `bg-muted text-muted-foreground` |
| `IN_PROGRESS` | `bg-primary/10 text-primary` | `bg-primary/15 text-primary` |
| `REVIEW` | `bg-warning text-warning-foreground` | `bg-warning text-warning-foreground` |
| `DONE` | `bg-success text-success-foreground` | `bg-success text-success-foreground` |

| Priority | Light Style | Dark Style |
|---|---|---|
| `LOW` | `bg-muted text-muted-foreground` | `bg-muted text-muted-foreground` |
| `MEDIUM` | `bg-primary/10 text-primary` | `bg-primary/15 text-primary` |
| `HIGH` | `bg-warning text-warning-foreground` | `bg-warning text-warning-foreground` |
| `URGENT` | `bg-danger text-danger-foreground` | `bg-danger text-danger-foreground` |

### 4.6 Sidebar Navigation

Inspired by Linear's compact density. The sidebar is a quiet navigation rail, not a feature billboard.

```
Width: 240px (desktop), collapsible to 0px (mobile)
Background: bg-card (light) / bg-card (dark)
Border: border-r border-border
```

- **Workspace switcher**: Top of sidebar. Logo + name + chevron dropdown.
- **Section labels**: `overline` type scale, `text-muted-foreground`, `px-3 pt-4 pb-1`.
- **Nav items**:
  - Rest: `text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150`
  - Active: `text-primary bg-primary/10 font-semibold rounded-lg px-3 py-2`
- **Icons**: `18px`, left-aligned with `gap-3` to label.

### 4.7 Tables

Minimal, scannable data presentation.

```
Header row: text-xs font-medium text-muted-foreground uppercase tracking-wider
Body rows: text-sm text-foreground
Row borders: border-b border-border/60 (not full opacity)
Row hover: bg-accent/50 transition-colors duration-150
Cell padding: px-4 py-3
```

- No zebra striping — rely on hover for row identification.
- Status and priority columns use pill badges.
- Action columns use ghost icon buttons.

### 4.8 Modals / Dialogs

```
Overlay: bg-black/50 (light) / bg-black/60 (dark), backdrop-blur-sm
Container: bg-card border border-border rounded-xl shadow-xl
Animation: fade-in + scale from 0.96 → 1 (200ms ease-out)
Max width: sm (400px), md (500px), lg (640px), xl (800px)
Padding: p-6
```

- **Header**: `text-xl font-semibold` + optional close button (ghost, top-right)
- **Footer**: `flex justify-end gap-3 pt-4 border-t border-border`

---

# 5. Layout Grid

### App Shell Layout

```
┌──────────────────────────────────────────────────────────────┐
│ [Sidebar 240px] │ [Content Area: flex-1]                     │
│                 │ ┌──────────────────────────────────────┐   │
│ Workspace Logo  │ │ Top Header Bar (h-14)                │   │
│ ─────────────── │ │ Breadcrumb + Search + Notif + Avatar │   │
│ Nav Items       │ ├──────────────────────────────────────┤   │
│ ...             │ │                                      │   │
│                 │ │ Page Content Area                    │   │
│ ─────────────── │ │ max-w-7xl mx-auto px-6 py-6         │   │
│ Section Label   │ │                                      │   │
│ Nav Items       │ │                                      │   │
│ ...             │ │                                      │   │
└──────────────────────────────────────────────────────────────┘
```

- **Sidebar**: Fixed left, full height, `border-r border-border`.
- **Header**: Sticky top within content area, `h-14`, `border-b border-border`, `bg-card/80 backdrop-blur-xl`.
- **Content area**: Scrollable, max-width constrained, comfortable padding.

### Auth Layout

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│          ┌─────────────────────────────┐                     │
│          │                             │                     │
│          │   Logo + App Name           │                     │
│          │   ─────────────────         │                     │
│          │   Form Card (max-w-md)      │                     │
│          │   bg-card rounded-xl p-8    │                     │
│          │   shadow-lg                 │                     │
│          │                             │                     │
│          └─────────────────────────────┘                     │
│                                                              │
│          bg-background (full page canvas)                    │
└──────────────────────────────────────────────────────────────┘
```

- Centered vertically and horizontally.
- Single column. No split-panel hero — keep auth screens focused and fast.
- Card width: `max-w-[420px]` for login/register, `max-w-sm` for simpler forms.

---

# 6. Responsive Breakpoints

| Breakpoint | Width | Behavior |
|---|---|---|
| `sm` | `640px` | Stack auth form cards, single-column metric grids |
| `md` | `768px` | Show sidebar as overlay drawer, 2-column grids |
| `lg` | `1024px` | Persistent sidebar, 3-column metric grids |
| `xl` | `1280px` | Full app shell, 4-column grids where applicable |

### Mobile Sidebar Behavior
- Below `lg`: Sidebar hidden by default. Hamburger menu in header triggers slide-in drawer overlay.
- Above `lg`: Sidebar always visible. No hamburger.

---

# 7. Z-Index Scale

| Layer | Value | Usage |
|---|---|---|
| `z-0` | `0` | Page content |
| `z-10` | `10` | Sticky headers, floating action buttons |
| `z-20` | `20` | Dropdowns, popovers, tooltips |
| `z-30` | `30` | Sidebar overlay (mobile) |
| `z-40` | `40` | Modal overlay + dialog |
| `z-50` | `50` | Toast notifications, command palette |

---

# 8. Accessibility Checklist

- **Focus rings**: `ring-2 ring-ring ring-offset-2 ring-offset-background` on all interactive elements.
- **Color contrast**: All text-on-background combinations meet WCAG 2.1 AA (4.5:1 for body text, 3:1 for large text).
- **Keyboard navigation**: All interactive elements reachable via Tab. `Escape` closes modals/dropdowns.
- **ARIA labels**: All icon-only buttons must have `aria-label`. All form inputs must have associated `<Label>`.
- **Reduced motion**: Wrap animations in `@media (prefers-reduced-motion: no-preference)`.
