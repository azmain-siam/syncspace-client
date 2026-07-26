# DESIGN_SYSTEM.md — SyncSpace UI Design Language & Tokens

This document standardizes visual design tokens, typography, color palettes, spacing, and component variants to ensure a sleek, modern, glassmorphic SaaS interface (dark-mode first, inspired by Linear and Slack).

---

## 1. Color System (Tailwind CSS v4 CSS Variables)

```css
:root {
  --background: oklch(0.98 0 0);
  --foreground: oklch(0.14 0.01 260);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.14 0.01 260);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.14 0.01 260);
  --primary: oklch(0.55 0.22 260); /* Vivid Indigo Accent */
  --primary-foreground: oklch(0.98 0 0);
  --secondary: oklch(0.94 0.02 260);
  --secondary-foreground: oklch(0.2 0.02 260);
  --muted: oklch(0.95 0.01 260);
  --muted-foreground: oklch(0.48 0.02 260);
  --accent: oklch(0.93 0.03 260);
  --accent-foreground: oklch(0.2 0.04 260);
  --destructive: oklch(0.57 0.2 25);
  --border: oklch(0.9 0.01 260);
  --radius: 0.5rem;
}

.dark {
  --background: oklch(0.12 0.02 260); /* Deep Slate/Charcoal */
  --foreground: oklch(0.96 0.01 260);
  --card: oklch(0.16 0.02 260);
  --card-foreground: oklch(0.96 0.01 260);
  --popover: oklch(0.16 0.02 260);
  --popover-foreground: oklch(0.96 0.01 260);
  --primary: oklch(0.62 0.24 265); /* Vibrant Electric Indigo */
  --primary-foreground: oklch(0.98 0 0);
  --secondary: oklch(0.22 0.03 260);
  --secondary-foreground: oklch(0.96 0.01 260);
  --muted: oklch(0.2 0.02 260);
  --muted-foreground: oklch(0.65 0.02 260);
  --accent: oklch(0.24 0.04 260);
  --accent-foreground: oklch(0.96 0.01 260);
  --destructive: oklch(0.55 0.22 22);
  --border: oklch(0.24 0.02 260);
}
```

---

## 2. Priority & Status Color Indicators

| Enum Value | Visual Badge Style | Accent Border |
|---|---|---|
| `TaskPriority.LOW` | Muted Gray (`bg-slate-500/10 text-slate-400 border-slate-500/20`) | Gray |
| `TaskPriority.MEDIUM` | Vibrant Blue (`bg-blue-500/10 text-blue-400 border-blue-500/20`) | Blue |
| `TaskPriority.HIGH` | Amber Orange (`bg-amber-500/10 text-amber-400 border-amber-500/20`) | Amber |
| `TaskPriority.URGENT` | Crimson Red (`bg-red-500/10 text-red-400 border-red-500/20 animate-pulse`) | Red |
| `TaskStatus.TODO` | Subtle Outline (`border-dashed border-muted-foreground`) | Gray |
| `TaskStatus.IN_PROGRESS` | Solid Primary (`border-primary text-primary`) | Indigo |
| `TaskStatus.REVIEW` | Purple Accent (`border-purple-500 text-purple-400`) | Purple |
| `TaskStatus.DONE` | Emerald Green (`border-emerald-500 text-emerald-400`) | Emerald |

---

## 3. Typography & Spacing Scale

- **Font Family**: `Inter`, `system-ui`, sans-serif.
- **Headings**: `h1` (text-2xl font-bold tracking-tight), `h2` (text-xl font-semibold), `h3` (text-lg font-medium).
- **Body & Controls**: `text-sm` (0.875rem) for main table/card text, `text-xs` (0.75rem) for meta badges, tags, and timestamps.
- **Card Radius**: `rounded-lg` (0.5rem) or `rounded-md` (0.375rem).

---

## 4. UI Components & Skeletons

- **Kanban Card**: Glassmorphic card (`bg-card/80 backdrop-blur border border-border/50 hover:border-primary/40 transition-all shadow-sm`).
- **Modal Dialogs**: Centered responsive dialog with backdrop blur (`backdrop-blur-sm bg-background/80`).
- **Skeletons**: Pulsing placeholder containers (`bg-muted/60 animate-pulse rounded-md`).
