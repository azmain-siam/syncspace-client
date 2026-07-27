# VISUAL_IDENTITY.md — SyncSpace Visual Identity & Design Language

Version: 4.0  
Identity Concept: **SyncSpace Signature — Serious Software**  
Reference Specification: `DESIGN.md`

---

## 1. Design Philosophy

SyncSpace is engineered for **"Serious Software"** — tools that demand high cognitive focus, extreme reliability, and structural speed without sacrificing a contemporary edge. The brand personality is authoritative yet approachable, characterized by a refined minimalism that prioritizes clarity over decoration.

The aesthetic sits at the intersection of **Modern Minimalism** and **Functional Precision**:
- **Clarity Over Decoration**: UI chrome (sidebars, borders, headers) recedes into a monochromatic surface hierarchy, allowing content and work items to take center stage.
- **Electric Indigo Signal**: Color is never arbitrary. Primary "Electric Indigo" (`#4648d4`) is used intentionally as a high-visibility signal for intelligence, active navigation, and primary user actions against a stark canvas.
- **Spacious & Balanced Grid**: Utilizes an 8px base spacing grid with generous section breaks (48px–80px) to reduce visual fatigue, giving the application a high-end editorial feel.

```
┌──────────────────────────────────────────────────────────────────┐
│  SYNCSPACE SIGNATURE VISUAL DNA                                 │
├──────────────────────────────────────────────────────────────────┤
│  • Philosophy:       Serious Software — Content-first utility    │
│  • Primary Signal:   Electric Indigo (#4648d4)                   │
│  • Surface System:   M3 Tonal Layering (Lowest → Base → Elevated)  │
│  • Typography:       Plus Jakarta Sans — Tight headlines, 1.6 body│
│  • Standard Radius:  8px (0.5rem) base, 16px (1rem) containers   │
│  • Pill Architecture: Full-pill (9999px) status chips only       │
│  • Border Strategy:  1px neutral outline, hover-only shadow lift │
│  • Tactile Motion:   Subtle press scale (98%) + 150ms transitions│
└──────────────────────────────────────────────────────────────────┘
```

---

## 2. Dual-Theme Surface Architecture

Light and Dark modes are independently crafted tonal compositions based on Material Design 3 surface container hierarchy.

### Light Mode — "Stark Studio"
- **Background & Canvas**: Off-white `#fcf8ff` (or `#fcfcfd`) to reduce eye strain compared to blinding pure white.
- **Primary Surfaces**: Containers and cards sit on `#ffffff` (Container Lowest) or `#f5f2fe` (Container Low) to create clear surface separation.
- **Subtle Outline**: Structural 1px neutral borders (`#e2e8f0` / `#c7c4d7`) demarcate container boundaries without heavy shadows.

| Surface Tier | Value / Token | Hex Equivalent | Role |
|---|---|---|---|
| Canvas / Background | `background` | `#fcf8ff` | Page background canvas |
| Container Lowest | `surface-container-lowest` | `#ffffff` | Elevated pure white cards, inputs |
| Container Low | `surface-container-low` | `#f5f2fe` | Recessed panels, table headers |
| Container Standard | `surface-container` | `#efecf8` | Sidebar surface, toolbar panels |
| Container High | `surface-container-high` | `#e9e6f3` | Hover highlights, active chips |
| Container Highest | `surface-container-highest` | `#e4e1ed` | Modal overlays, popovers |

### Dark Mode — "Midnight Workshop"
- **Background & Canvas**: Deep, low-fatigue slate `#09090b` for maximum contrast during extended work sessions.
- **Surfaces**: Floating panels sit on elevated dark surfaces (`#18181b` / `#27272a`) with subtle 1px luminous borders.
- **High-Contrast Text**: Bright crisp text (`#f4f4f5`) ensures high legibility.

---

## 3. Color Token System

### Primary Palette (Electric Indigo)
"Electric Indigo" serves as the precise signal for action and intelligence across the application.

| Token Name | Hex Code | Role / Usage |
|---|---|---|
| `primary` | `#4648d4` | Primary buttons, active nav bars, key focus states |
| `on-primary` | `#ffffff` | Text & icons on primary buttons |
| `primary-container` | `#6063ee` | Prominent highlights, badge fills |
| `on-primary-container` | `#fffbff` | High-contrast text on primary containers |
| `surface-tint` | `#494bd6` | Primary focus rings & active indicator bars |
| `inverse-primary` | `#c0c1ff` | Dark mode primary accents |

### Secondary & Tertiary Palettes
- **Secondary (Emerald Green)**: `#006c49` (Container `#6cf8bb`, text `#00714d`). Used for success states, completed tasks, positive metric badges (`+18.4%`).
- **Tertiary (Warm Amber)**: `#904900` (Container `#b55d00`). Used for warnings, in-review status, urgent priority badges.
- **Error (Crimson Red)**: `#ba1a1a` (Container `#ffdad6`, text `#93000a`). Used for danger actions, overdue tasks, invalid form inputs.

### Neutral & Border Tokens
- `on-surface`: `#1b1b23` (Primary text)
- `on-surface-variant`: `#464554` (Secondary text, captions, metadata)
- `outline`: `#767586` (Subtle borders)
- `outline-variant`: `#c7c4d7` (Dividers, container outlines)

---

## 4. Typography System (Plus Jakarta Sans)

SyncSpace uses **Plus Jakarta Sans** for a modern, slightly geometric aesthetic that remains highly readable at all scales.

### Type Scale

| Scale Token | Font Family | Size | Weight | Tracking | Leading | Usage |
|---|---|---|---|---|---|---|
| `display` | Plus Jakarta Sans | `48px` (3rem) | `800` (ExtraBold) | `-0.04em` | `1.1` | Hero title |
| `headline-lg` | Plus Jakarta Sans | `32px` (2rem) | `700` (Bold) | `-0.03em` | `1.2` | Page titles (Desktop) |
| `headline-lg-mobile` | Plus Jakarta Sans | `28px` (1.75rem) | `700` (Bold) | `-0.02em` | `1.2` | Page titles (Mobile) |
| `headline-md` | Plus Jakarta Sans | `24px` (1.5rem) | `700` (Bold) | `-0.02em` | `1.3` | Card headers, section titles |
| `body-lg` | Plus Jakarta Sans | `18px` (1.125rem) | `400` (Regular) | `-0.01em` | `1.6` | Subtitles, intro text |
| `body-md` | Plus Jakarta Sans | `16px` (1rem) | `400` (Regular) | `0em` | `1.6` | Body copy, descriptions |
| `label-md` | Plus Jakarta Sans | `14px` (0.875rem) | `600` (SemiBold) | `0.01em` | `1.4` | Form labels, button text |
| `label-sm` | Plus Jakarta Sans | `12px` (0.75rem) | `700` (Bold) | `0.05em` | `1.2` | Badges, overlines, status chips |

---

## 5. Shape & Corner Radius Architecture

SyncSpace enforces strict rules on component radii:

- **Standard Base (`8px` / `0.5rem`)**: Used for Buttons, Input fields, Dropdowns, and small Cards.
- **Large Container (`16px` / `1rem`)**: Used for Main Content Cards, Modals, and Dashboard Widgets.
- **Full Pill (`9999px`)**: Used **exclusively** for status chips (e.g., "Active", "Done", "High Priority") and toggle switches.

---

## 6. Micro-Elevation & Tactile Motion

- **Cards at Rest**: Cards have **no shadow by default**, relying on a clean 1px border (`#e2e8f0`).
- **Hover Lift**: Interactive cards gain a soft ambient shadow on hover (`shadow-md`).
- **Tactile Feedback**: Buttons and interactive items utilize a subtle "pressed" transition — scaling to `98%` (`active:scale-[0.98]`) on click.
- **Primary Button Inset**: Primary buttons incorporate a 1px inset top-border (`border-t border-white/20`) for a subtle, high-end editorial feel.
- **Sidebar Leading Indicator**: Active navigation items display a 2px vertical bar in Electric Indigo (`#4648d4`) on the leading edge.
