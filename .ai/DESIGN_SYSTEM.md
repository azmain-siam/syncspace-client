# DESIGN_SYSTEM.md — SyncSpace Design System

Version: 4.0  
Visual Language Reference: **SyncSpace Signature — Serious Software** (See `DESIGN.md` & `VISUAL_IDENTITY.md`)

---

# Overview

The SyncSpace Design System translates the **Serious Software** visual identity into implementable tokens, component patterns, and layout rules for the Next.js 15 / Tailwind CSS v4 client (`/client`).

This document is the single source of truth for all visual implementation decisions.

---

# 1. CSS Token Implementation

### Tailwind CSS v4 Theme Variables (`src/app/globals.css`)

```css
@layer base {
  :root {
    /* ─── Light Mode: "Stark Studio" ─── */

    /* Surfaces (M3 Tonal Layering) */
    --background: #fcf8ff;                        /* Canvas */
    --foreground: #1b1b23;                        /* On-Surface Text */

    --card: #ffffff;                              /* Container Lowest */
    --card-foreground: #1b1b23;

    --popover: #ffffff;
    --popover-foreground: #1b1b23;

    /* Primary: Electric Indigo */
    --primary: #4648d4;
    --primary-foreground: #ffffff;
    --primary-container: #6063ee;
    --on-primary-container: #fffbff;

    /* Secondary: Emerald Green */
    --secondary: #006c49;
    --secondary-foreground: #ffffff;
    --secondary-container: #6cf8bb;
    --on-secondary-container: #00714d;

    /* Tertiary: Warm Amber */
    --tertiary: #904900;
    --tertiary-container: #b55d00;

    /* Muted & Accents */
    --muted: #f5f2fe;                             /* Container Low */
    --muted-foreground: #464554;                    /* On-Surface Variant */

    --accent: #efecf8;                            /* Container Standard */
    --accent-foreground: #1b1b23;

    /* Semantic Feedback */
    --success: #e6f9f0;
    --success-foreground: #00714d;

    --warning: #fff4e5;
    --warning-foreground: #904900;

    --danger: #ffdad6;
    --danger-foreground: #93000a;

    --destructive: #ba1a1a;
    --destructive-foreground: #ffffff;

    /* Structural outlines */
    --border: #e2e8f0;                            /* Neutral Border */
    --input: #e2e8f0;
    --outline: #767586;
    --outline-variant: #c7c4d7;
    --ring: #4648d4;
    --radius: 0.5rem;                             /* 8px Base Radius */
  }

  .dark {
    /* ─── Dark Mode: "Midnight Workshop" ─── */

    /* Surfaces */
    --background: #09090b;                        /* Dark Canvas */
    --foreground: #f4f4f5;                        /* Crisp Text */

    --card: #18181b;                              /* Dark Container */
    --card-foreground: #f4f4f5;

    --popover: #27272a;                           /* Elevated Surface */
    --popover-foreground: #f4f4f5;

    /* Primary: Electric Indigo */
    --primary: #4648d4;
    --primary-foreground: #ffffff;
    --primary-container: #6063ee;

    /* Secondary */
    --secondary: #4edea3;
    --secondary-foreground: #002113;

    /* Muted */
    --muted: #27272a;
    --muted-foreground: #a1a1aa;

    /* Accent */
    --accent: #27272a;
    --accent-foreground: #f4f4f5;

    /* Semantic Feedback */
    --success: #003824;
    --success-foreground: #4edea3;

    --warning: #4a2300;
    --warning-foreground: #ffb783;

    --danger: #680007;
    --danger-foreground: #ffb4ab;

    --destructive: #ffb4ab;
    --destructive-foreground: #690005;

    /* Structural */
    --border: #27272a;
    --input: #27272a;
    --ring: #4648d4;
  }
}
```

---

# 2. Tailwind Theme Bridge

Map CSS custom properties to Tailwind v4's `@theme inline` directive:

```css
@theme inline {
  --font-sans: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;

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

  /* Radius System (DESIGN.md) */
  --radius-sm: 0.25rem;                      /* 4px */
  --radius-DEFAULT: 0.5rem;                  /* 8px Base */
  --radius-md: 0.75rem;                      /* 12px */
  --radius-lg: 1.0rem;                       /* 16px Container */
  --radius-xl: 1.5rem;                       /* 24px */
  --radius-full: 9999px;                     /* Full Pill */
}
```

---

# 3. Typography Scale (Plus Jakarta Sans)

- **Font Family**: `Plus Jakarta Sans`
- **Line Height**: Generous body line-height (`1.6`) for legibility; tight headline leading (`1.1`–`1.3`).

### Type Scale Reference

| Token Name | Class Combination | Size | Weight | Tracking | Usage |
|---|---|---|---|---|---|
| `display` | `text-5xl font-extrabold tracking-[-0.04em] leading-[1.1]` | 48px | 800 | -0.04em | Landing page hero title |
| `headline-lg` | `text-3xl font-bold tracking-[-0.03em] leading-[1.2]` | 32px | 700 | -0.03em | Page titles (Desktop) |
| `headline-lg-mobile` | `text-2xl font-bold tracking-[-0.02em] leading-[1.2]` | 28px | 700 | -0.02em | Page titles (Mobile) |
| `headline-md` | `text-xl font-bold tracking-[-0.02em] leading-[1.3]` | 24px | 700 | -0.02em | Section titles, Card headers |
| `body-lg` | `text-lg font-normal tracking-[-0.01em] leading-[1.6]` | 18px | 400 | -0.01em | Subtitles, intro copy |
| `body-md` | `text-base font-normal tracking-normal leading-[1.6]` | 16px | 400 | 0 | Standard body copy |
| `label-md` | `text-sm font-semibold tracking-[0.01em] leading-[1.4]` | 14px | 600 | 0.01em | Form labels, button text |
| `label-sm` | `text-xs font-bold tracking-[0.05em] leading-[1.2]` | 12px | 700 | 0.05em | Badges, status chips, overlines |

---

# 4. Component Styling Specifications

### 4.1 Buttons

Primary buttons feature an Electric Indigo background with white text and a **1px inset top-border** (`border-t border-white/20`) for a premium tactile feel. All buttons scale to `98%` on active click (`active:scale-[0.98]`).

```tsx
// Primary Button Example
<button className="bg-primary text-primary-foreground border-t border-white/20 rounded-lg px-4 py-2 text-sm font-semibold shadow-xs hover:bg-primary/90 active:scale-[0.98] transition-all">
  Save Changes
</button>

// Secondary Button Example (Ghost style with 1px border)
<button className="border border-border bg-transparent text-foreground rounded-lg px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground active:scale-[0.98] transition-all">
  Cancel
</button>
```

### 4.2 Form Input Fields

Inputs feature a 1px border (`border-input`) that transitions to **Electric Indigo** on focus. The focus state uses a **subtle 10% opacity indigo glow** rather than a harsh outline ring.

```tsx
<input className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground/60 transition-all focus:border-primary focus:shadow-[0_0_0_3px_rgba(70,72,212,0.1)] focus:outline-none" />
```

### 4.3 Cards & Containers

Cards have **no shadow by default**, relying on a 1px neutral border (`border border-border`). They gain a soft ambient shadow (`hover:shadow-md`) on hover to signal interactivity.

```tsx
<div className="rounded-2xl border border-border bg-card p-6 transition-shadow duration-200 hover:shadow-md">
  {/* Card Content */}
</div>
```

### 4.4 Status Chips & Badges

Status chips use **full pill geometry (`rounded-full`)** and low-saturation background tints.

```tsx
// Success Status Chip
<span className="inline-flex items-center rounded-full bg-success px-2.5 py-0.5 text-xs font-bold tracking-wider text-success-foreground">
  ACTIVE
</span>
```

### 4.5 Navigation Sidebar

Active items in the sidebar feature a **2px vertical bar in Electric Indigo** on the leading edge.

```tsx
// Active Sidebar Item
<div className="relative flex items-center gap-3 rounded-md bg-accent px-3 py-2 text-sm font-semibold text-primary">
  <span className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 bg-primary rounded-r" />
  <LayoutDashboard className="h-4 w-4 text-primary" />
  <span>Dashboard</span>
</div>
```

---

# 5. Spacing & Grid System

An **8px base unit** governs all layout dimensions:

- `xs`: `4px`
- `base`: `8px`
- `sm`: `12px`
- `md`: `24px`
- `lg`: `48px`
- `xl`: `80px`
- **Max Width**: `1280px` centered container.
- **Margin**: `32px` desktop margins (`16px` mobile).
- **Gutter**: `24px` column gaps.
