# COMPONENT_GUIDELINES.md — Reusable Component System & Composition

Version: 4.0  
Design System Reference: `DESIGN.md` & `DESIGN_SYSTEM.md` (SyncSpace Signature — Serious Software)

---

## 1. Component Hierarchy & Atomic Categories

```
src/
├── components/
│   ├── ui/                    ← Primitive Atom Controls (Button, Input, Badge, Dialog, Card)
│   ├── common/                ← Molecule Layouts (Sidebar, Header, Breadcrumb, ThemeToggle)
│   └── feedback/              ← Loading & Error Controls (SkeletonCard, EmptyState, ErrorBoundary)
└── features/
    ├── auth/components/       ← LoginForm, RegisterForm, ResetPasswordForm
    ├── workspace/components/  ← WorkspaceSelector, MemberTable, ActivityFeedItem
    ├── board/components/      ← BoardKanban, BoardColumn, ColumnHeader
    └── task/components/       ← TaskCard, TaskModal, AttachmentUploader, CommentItem
```

---

## 2. Standard Primitives Rules (`src/components/ui/`)

### Button (`button.tsx`)

Primary buttons feature Electric Indigo (`#4648d4`) background with white text, a **1px inset top-border** (`border-t border-white/20`), and **98% tactile press scale** on click (`active:scale-[0.98]`).

| Variant | Styling Rules |
|---|---|
| `default` | `bg-primary text-primary-foreground border-t border-white/20 hover:bg-primary/90 shadow-xs active:scale-[0.98]` |
| `secondary` | `bg-secondary text-secondary-foreground hover:bg-secondary/80 active:scale-[0.98]` |
| `outline` | `border border-border bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground active:scale-[0.98]` |
| `ghost` | `bg-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground active:scale-[0.98]` |
| `destructive` | `bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-xs active:scale-[0.98]` |

Sizes:
- `sm`: `h-8 px-3 text-xs rounded-md gap-1.5`
- `default`: `h-9 px-4 text-sm rounded-lg gap-2` (Standard 8px base radius)
- `lg`: `h-10 px-6 text-sm rounded-lg gap-2`
- `icon`: `h-9 w-9 rounded-lg`

Must accept `isLoading?: boolean` to render `<Loader2 className="h-4 w-4 animate-spin" />` and set `pointer-events-none opacity-70`.

### Input (`input.tsx`)

```
bg-background border border-input rounded-lg (8px)
h-9 px-3 text-sm
transition-all duration-150
focus:border-primary focus:shadow-[0_0_0_3px_rgba(70,72,212,0.1)] focus:outline-none
disabled:opacity-50 disabled:cursor-not-allowed
```

Supports `error?: boolean` prop for `border-danger focus:ring-danger/20`.

### Badge / Status Chip (`badge.tsx`)

Pill geometry: `rounded-full px-2.5 py-0.5 text-xs font-bold tracking-wider uppercase inline-flex items-center gap-1`.

Used for:
- Task statuses (`TODO`, `IN_PROGRESS`, `REVIEW`, `DONE`)
- Task priorities (`LOW`, `MEDIUM`, `HIGH`, `URGENT`)
- Workspace roles (`OWNER`, `ADMIN`, `MEMBER`)

### Card (`card.tsx`)

Cards are flat by default with a `1px` neutral border (`border border-border rounded-2xl bg-card`), gaining a soft ambient shadow (`hover:shadow-md`) on hover.

```
rounded-2xl border border-border bg-card
p-6 (24px padding)
hover:shadow-md transition-shadow duration-200
```

---

## 3. Layout Molecules (`src/components/common/`)

### Sidebar Navigation
- Active items use `text-primary bg-accent font-semibold` and display a **2px vertical bar in Electric Indigo** on the leading edge (`before:absolute before:left-0 before:top-1/2 before:h-5 before:w-[2px] before:-translate-y-1/2 before:bg-primary before:rounded-r`).

### Header Bar
- Sticky top, `h-14`, `border-b border-border`, `bg-card/80 backdrop-blur-xl`. Holds Workspace Selector, Global Search Palette trigger (`Ctrl+K`), Presence indicator, Notification Bell, and ThemeToggle.

---

## 4. Composition Rules

1. **Plus Jakarta Sans Typography**: Use Plus Jakarta Sans for all UI headings, body copy, labels, and badges.
2. **Standard 8px Radius**: Standard controls (buttons, inputs, dropdowns) use `rounded-lg` (8px). Main cards/containers use `rounded-2xl` (16px). Status chips use `rounded-full`.
3. **No Inline Colors**: All color styling uses token utilities (`bg-primary`, `bg-card`, `text-foreground`, `border-border`).
4. **Tactile Feedback**: Interactive buttons scale to `98%` on click.
