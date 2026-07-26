# VISUAL_IDENTITY.md — SyncSpace Visual Identity & Design Language

Version: 3.0
Identity Concept: **Quiet Precision**

---

## 1. Design Philosophy

SyncSpace is a tool teams live in for hours every day. The interface must disappear — becoming a calm, precise instrument that lets work take center stage.

**Quiet Precision** means:
- **Quiet**: The UI chrome (sidebars, headers, borders) is visually softer than the content it holds. No element competes for attention unless it carries semantic meaning.
- **Precision**: Every spacing value, every shadow, every color choice follows a deliberate system. Nothing is arbitrary.

This is not a "beautiful dashboard demo." It is a production workspace that earns trust through consistency and reduces cognitive load through visual hierarchy.

### Core Visual Attributes

```
┌──────────────────────────────────────────────────────────────────┐
│  SYNCSPACE VISUAL DNA                                            │
├──────────────────────────────────────────────────────────────────┤
│  • Philosophy:       Content-first. Chrome recedes.              │
│  • Surface Strategy: Three-tier depth (Canvas → Surface → Float) │
│  • Primary Hue:      Sapphire Blue (262° OKLCH)                  │
│  • Color Usage:      Semantic only. Color = Meaning.             │
│  • Shape Language:   Mixed radii (16/12/8/full-pill)             │
│  • Shadow System:    Ambient float, never harsh                  │
│  • Border Style:     Ultra-thin, low-opacity, structural only    │
│  • Typography:       Inter — tight headings, relaxed body        │
│  • Density:          Spacious app shell, compact data regions    │
│  • Motion:           Fast, smooth, invisible — 150ms default     │
└──────────────────────────────────────────────────────────────────┘
```

---

## 2. Dual-Theme Architecture

Light and Dark modes are **independently designed compositions**, not inversions of each other. Each has its own surface strategy, border approach, and shadow treatment.

### Light Mode — "Paper Studio"

An airy, tinted workspace that feels like a well-lit modern office. Content floats on elevated white surfaces against a cool-grey canvas.

| Layer | Role | Value | Hex |
|---|---|---|---|
| Canvas | Page background | `oklch(0.965 0.005 260)` | `#F4F6FA` |
| Surface | Cards, sidebars, panels | `oklch(1 0 0)` | `#FFFFFF` |
| Recessed | Input fields, code blocks | `oklch(0.97 0.005 260)` | `#F8F9FC` |

- **Borders**: `1px` at `oklch(0.92 0.008 260)` — barely visible, structural only.
- **Shadows**: Multi-layer ambient float (see Section 6).
- **Status badges**: Soft pastel fill + deep saturated text (e.g., mint green fill with forest green text).

### Dark Mode — "Midnight Workshop"

A low-fatigue deep slate environment for extended work sessions. Cards gain definition through subtle surface stepping and thin luminous borders, not shadows.

| Layer | Role | Value | Hex |
|---|---|---|---|
| Canvas | Page background | `oklch(0.13 0.02 260)` | `#0C1222` |
| Surface | Cards, sidebars, panels | `oklch(0.17 0.025 260)` | `#141B2D` |
| Elevated | Popovers, dropdowns, modals | `oklch(0.20 0.025 260)` | `#1A2338` |

- **Borders**: `1px` at `oklch(0.25 0.02 260)` — subtle separation, slightly luminous.
- **Shadows**: Replaced by increased border visibility and surface stepping.
- **Status badges**: Deep jewel-tone fill + bright pastel text (e.g., dark emerald fill with mint green text).

---

## 3. Color Token System

### Primary Palette (Sapphire Blue)

The primary color is a rich sapphire blue (hue 262°) — warmer and deeper than generic UI blue, conveying trust and focus without corporate coldness.

| Token | Light Mode | Dark Mode | Usage |
|---|---|---|---|
| `--primary` | `oklch(0.55 0.24 262)` | `oklch(0.62 0.22 262)` | Primary buttons, active navigation, links, focus rings |
| `--primary-foreground` | `oklch(0.99 0 0)` | `oklch(0.99 0 0)` | Text on primary buttons |
| `--primary-hover` | `oklch(0.50 0.24 262)` | `oklch(0.57 0.22 262)` | Button hover state |
| `--primary-muted` | `oklch(0.95 0.03 262)` | `oklch(0.22 0.06 262)` | Soft highlight fills, selected row backgrounds |

### Neutral Palette (Cool Slate)

All neutrals carry a `260°` hue tint for visual cohesion. No pure greys.

| Token | Light Mode | Dark Mode | Usage |
|---|---|---|---|
| `--background` | `oklch(0.965 0.005 260)` | `oklch(0.13 0.02 260)` | Page canvas |
| `--foreground` | `oklch(0.15 0.02 260)` | `oklch(0.95 0.008 260)` | Primary text, headings |
| `--card` | `oklch(1 0 0)` | `oklch(0.17 0.025 260)` | Card/panel surfaces |
| `--card-foreground` | `oklch(0.15 0.02 260)` | `oklch(0.95 0.008 260)` | Text on cards |
| `--muted` | `oklch(0.96 0.005 260)` | `oklch(0.21 0.02 260)` | Disabled backgrounds, skeleton fills |
| `--muted-foreground` | `oklch(0.55 0.02 260)` | `oklch(0.65 0.015 260)` | Secondary text, captions, timestamps |
| `--accent` | `oklch(0.95 0.012 260)` | `oklch(0.23 0.02 260)` | Hover backgrounds, subtle highlights |
| `--accent-foreground` | `oklch(0.18 0.02 260)` | `oklch(0.95 0.008 260)` | Text on accent backgrounds |

### Semantic Palette (Status & Feedback)

Color is reserved for meaning. These tokens drive all status indicators, priority badges, and data visualizations.

| Semantic | Light Fill | Light Text | Dark Fill | Dark Text |
|---|---|---|---|---|
| **Success** | `oklch(0.95 0.05 155)` | `oklch(0.45 0.15 155)` | `oklch(0.23 0.06 155)` | `oklch(0.75 0.16 155)` |
| **Warning** | `oklch(0.95 0.05 85)` | `oklch(0.48 0.14 85)` | `oklch(0.23 0.06 85)` | `oklch(0.82 0.14 85)` |
| **Danger** | `oklch(0.95 0.05 25)` | `oklch(0.48 0.18 25)` | `oklch(0.23 0.06 25)` | `oklch(0.75 0.18 25)` |

### Functional Tokens

| Token | Light Mode | Dark Mode | Usage |
|---|---|---|---|
| `--border` | `oklch(0.92 0.008 260)` | `oklch(0.25 0.02 260)` | Container outlines, dividers |
| `--input` | `oklch(0.92 0.008 260)` | `oklch(0.25 0.02 260)` | Form input borders |
| `--ring` | `var(--primary)` | `var(--primary)` | Focus ring outline |
| `--popover` | `oklch(1 0 0)` | `oklch(0.20 0.025 260)` | Dropdown, popover surfaces |
| `--popover-foreground` | `oklch(0.15 0.02 260)` | `oklch(0.95 0.008 260)` | Text in popovers |
| `--destructive` | `oklch(0.95 0.05 25)` | `oklch(0.23 0.06 25)` | Destructive action backgrounds |
| `--destructive-foreground` | `oklch(0.48 0.18 25)` | `oklch(0.75 0.18 25)` | Destructive action text |
| `--secondary` | `oklch(0.95 0.008 260)` | `oklch(0.22 0.025 260)` | Secondary button fills |
| `--secondary-foreground` | `oklch(0.20 0.015 260)` | `oklch(0.95 0.008 260)` | Secondary button text |

---

## 4. Corner Radius System

Radii create visual rhythm through deliberate variation. Containers are generous, interactive elements are compact, status indicators are pills.

| Scale | Value | Tailwind | Usage |
|---|---|---|---|
| `--radius` (base) | `0.75rem` (12px) | — | Default base radius |
| `radius-sm` | `0.5rem` (8px) | `rounded-lg` | Inputs, small cards, inline tags |
| `radius-md` | `0.625rem` (10px) | `rounded-xl` | Buttons, dropdowns, inner panels |
| `radius-lg` | `0.75rem` (12px) | `rounded-xl` | Standard cards, modals, sidebars |
| `radius-xl` | `1rem` (16px) | `rounded-2xl` | Hero containers, landing cards, large panels |
| `radius-2xl` | `1.25rem` (20px) | `rounded-2xl` | Landing page feature sections |
| `radius-full` | `9999px` | `rounded-full` | Badges, pills, avatars, status dots |

**Rule**: Interior elements always use a smaller radius than their parent container. A card (`12px`) contains inputs (`8px`), not the reverse.

---

## 5. Spacing System

An 8px grid with deliberate density zones. The app shell is spacious; data regions (tables, kanban columns) are compact.

| Token | Value | Usage |
|---|---|---|
| `space-0.5` | `2px` | Dot separators, inline micro-gaps |
| `space-1` | `4px` | Icon-to-label gaps, badge internal padding |
| `space-1.5` | `6px` | Compact list item vertical padding |
| `space-2` | `8px` | Standard internal gap, form field spacing |
| `space-3` | `12px` | Card internal padding (compact), sidebar item padding |
| `space-4` | `16px` | Standard card padding, section gaps |
| `space-5` | `20px` | Card padding (comfortable), form group spacing |
| `space-6` | `24px` | Section separators, panel padding |
| `space-8` | `32px` | Page-level section spacing |
| `space-10` | `40px` | Hero section vertical padding |
| `space-12` | `48px` | Landing page section spacing |
| `space-16` | `64px` | Major page section breaks |

### Density Zones

- **Spacious**: Landing page, auth screens, empty states — generous padding (`space-8` to `space-16`), large type.
- **Comfortable**: Dashboard, settings, member lists — balanced padding (`space-4` to `space-6`), standard type.
- **Compact**: Kanban columns, task cards, comment threads, table rows — tight padding (`space-2` to `space-3`), smaller type.

---

## 6. Elevation & Shadow Architecture

Shadows create depth hierarchy. They are always soft, diffused, and multi-layered. Harsh drop shadows are never used.

### Light Mode Shadows

| Level | CSS Value | Usage |
|---|---|---|
| `shadow-xs` | `0 1px 2px 0 oklch(0.15 0.02 260 / 0.04)` | Subtle baseline lift for inputs, badges |
| `shadow-sm` | `0 2px 8px -2px oklch(0.15 0.02 260 / 0.06), 0 1px 3px -1px oklch(0.15 0.02 260 / 0.04)` | Cards at rest |
| `shadow-md` | `0 6px 20px -4px oklch(0.15 0.02 260 / 0.08), 0 2px 8px -2px oklch(0.15 0.02 260 / 0.04)` | Cards on hover, active states |
| `shadow-lg` | `0 12px 32px -6px oklch(0.15 0.02 260 / 0.12), 0 4px 12px -2px oklch(0.15 0.02 260 / 0.06)` | Modals, floating panels, dragging elements |
| `shadow-xl` | `0 20px 48px -8px oklch(0.15 0.02 260 / 0.16), 0 8px 20px -4px oklch(0.15 0.02 260 / 0.08)` | Command palette, overlay panels |

### Dark Mode Shadows

In dark mode, shadows become nearly invisible. Depth is communicated through **surface stepping** (progressively lighter surfaces) and **border luminance** instead.

| Level | Approach |
|---|---|
| Rest | Surface `oklch(0.17)` on canvas `oklch(0.13)` — no shadow needed |
| Hover | Surface lightens to `oklch(0.19)` + border brightens to `oklch(0.28)` |
| Float | Surface `oklch(0.20)` + border `oklch(0.30)` + `0 4px 16px oklch(0 0 0 / 0.4)` |

---

## 7. Typography Scale

Font: **Inter** (`--font-sans`). All sizes follow a modular scale with deliberate tracking and leading adjustments.

| Scale | Size | Weight | Tracking | Leading | Usage |
|---|---|---|---|---|---|
| `display` | `3rem` (48px) | `800` | `-0.025em` | `1.1` | Landing page hero heading |
| `h1` | `2rem` (32px) | `700` | `-0.02em` | `1.2` | Page titles ("Dashboard", "Projects") |
| `h2` | `1.5rem` (24px) | `700` | `-0.015em` | `1.25` | Section headings, card titles |
| `h3` | `1.125rem` (18px) | `600` | `-0.01em` | `1.3` | Sub-section headings |
| `body` | `0.875rem` (14px) | `400` | `0em` | `1.6` | Standard body text, descriptions |
| `body-sm` | `0.8125rem` (13px) | `400` | `0em` | `1.5` | Comment text, table content |
| `caption` | `0.75rem` (12px) | `500` | `0.01em` | `1.4` | Timestamps, metadata, breadcrumbs |
| `overline` | `0.6875rem` (11px) | `600` | `0.05em` | `1.3` | Section labels ("MENU", "GENERAL"), uppercased |
| `metric` | `1.75rem` (28px) | `700` | `-0.02em` | `1.1` | Dashboard KPI values |
| `badge` | `0.6875rem` (11px) | `600` | `0.01em` | `1` | Pill badge text |

### Typography Rules

- **Headings**: Always use `font-bold` or `font-semibold` with negative tracking (`tracking-tight`).
- **Metric values**: Large, bold, tight tracking — the most visually prominent element in data cards.
- **Secondary text**: Always `--muted-foreground` — never the same color as primary text.
- **Overline labels**: Always uppercased, wider tracking, `--muted-foreground`.

---

## 8. Iconography

- **Library**: Lucide React (outline, 1.5px stroke weight)
- **Default size**: `16px` (inline text context), `20px` (buttons, navigation), `24px` (page headers)
- **Color**: Inherits text color via `currentColor`. Never uses a separate icon color unless semantically meaningful.
- **Sidebar icons**: `18px`, `--muted-foreground` at rest, `--foreground` when active.
- **Inline icons**: Same size and color as adjacent text.

---

## 9. Motion Design

Motion is functional, not decorative. Every animation communicates state change.

| Pattern | Duration | Easing | Usage |
|---|---|---|---|
| Micro-interaction | `150ms` | `ease-out` | Button hover, input focus, badge appear |
| Panel transition | `200ms` | `ease-in-out` | Sidebar collapse, dropdown open, tab switch |
| Modal enter | `200ms` | `ease-out` | Dialog fade-in + scale from `0.96` to `1` |
| Modal exit | `150ms` | `ease-in` | Dialog fade-out + scale to `0.96` |
| Page transition | `250ms` | `ease-in-out` | Route changes, skeleton → content |
| Drag feedback | `0ms` (instant) | — | Card pickup is instant, drop animates `200ms` |
| Toast enter | `300ms` | `spring(1, 80, 10)` | Slide-in from right |

### Motion Rules

- **No bounce**: Spring animations are critically damped. The interface is precise, not playful.
- **No delay**: Interactions respond immediately. If async, show skeleton/spinner instantly.
- **Hover transitions**: Always `150ms` — fast enough to feel instant, slow enough to be smooth.
- **Reduced motion**: Respect `prefers-reduced-motion` — collapse all transitions to `0ms`.

---

## 10. Data Visualization

Charts, graphs, and progress indicators follow the semantic palette.

| Data Type | Color | Usage |
|---|---|---|
| Primary metric | `--primary` | Main data series, active bars |
| Secondary metric | `oklch(0.68 0.12 262)` | Comparison series, lighter bars |
| Positive trend | `--success-foreground` | Upward arrows, green sparklines |
| Negative trend | `--danger-foreground` | Downward arrows, red sparklines |
| Neutral/baseline | `--muted-foreground` | Grid lines, axis labels, zero line |
| Area fill | `--primary` at `10%` opacity | Chart area fills |

### Chart Typography
- **Axis labels**: `caption` scale, `--muted-foreground`
- **Tooltip values**: `body` scale, `--foreground`, bold
- **Chart titles**: `h3` scale

---

## 11. Landing Page vs. App Shell Distinction

The marketing surface and the application surface have different visual temperatures.

| Attribute | Landing Page | App Shell |
|---|---|---|
| Background | May use gradient washes, hero patterns | Flat canvas only (`--background`) |
| Border radius | Generous (`16–20px`) | Standard (`8–12px`) |
| Typography | Larger scale (`display`, `h1`) | Compact scale (`h2`, `body`) |
| Spacing | Spacious density zone | Comfortable/Compact density |
| Color | Primary + subtle gradient accents allowed | Semantic color only |
| Shadows | More pronounced (`shadow-md` to `shadow-xl`) | Subtle (`shadow-xs` to `shadow-sm`) |
| Animation | Scroll-triggered fade-ins allowed | Micro-interactions only |
