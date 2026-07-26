# COMPONENT_GUIDELINES.md — Reusable Component System & Composition

Version: 3.0
Design System Reference: `DESIGN_SYSTEM.md` (Quiet Precision)

---

## 1. Component Hierarchy & Atomic Categories

```
src/
├── components/
│   ├── ui/                    ← Primitive Atom Controls (Button, Input, Badge, Dialog)
│   ├── common/                ← Molecule Layouts (Sidebar, Header, Breadcrumb, SearchModal)
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

Variants follow the design system's button pattern table:

| Variant | Classes |
|---|---|
| `default` | `bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm` |
| `secondary` | `bg-secondary text-secondary-foreground hover:bg-secondary/80` |
| `outline` | `border border-border bg-transparent text-foreground hover:bg-accent` |
| `ghost` | `bg-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground` |
| `destructive` | `bg-destructive text-destructive-foreground hover:bg-destructive/90` |

Sizes:
- `sm`: `h-8 px-3 text-xs rounded-lg gap-1.5`
- `default`: `h-9 px-4 text-sm rounded-xl gap-2`
- `lg`: `h-10 px-6 text-sm rounded-xl gap-2`
- `icon`: `h-9 w-9 rounded-xl`

Must accept `isLoading?: boolean` to render `<Loader2 className="h-4 w-4 animate-spin" />` and set `pointer-events-none opacity-70`.

### Badge (`badge.tsx`)

Full pill geometry: `rounded-full px-2.5 py-0.5 text-[11px] font-semibold inline-flex items-center gap-1`.

Used for:
- Task statuses (`TODO`, `IN_PROGRESS`, `REVIEW`, `DONE`)
- Task priorities (`LOW`, `MEDIUM`, `HIGH`, `URGENT`)
- Metric change indicators (`+12.8%`, `-3.2%`)
- Workspace roles (`OWNER`, `ADMIN`, `MEMBER`)

Color mapping follows the semantic palette defined in `DESIGN_SYSTEM.md` Section 4.5.

### Avatar (`avatar.tsx`)

Displays user image or fallback initials (e.g., "JD" for John Doe).

- Sizes: `sm` (24px), `default` (32px), `lg` (40px)
- Shape: `rounded-full`
- Fallback: `bg-muted text-muted-foreground font-medium` with initials
- Online indicator: `absolute bottom-0 right-0` dot, `h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-card`

### Input (`input.tsx`)

```
bg-background border border-input rounded-lg
h-9 px-3 text-sm
transition-colors duration-150
focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
disabled:opacity-50 disabled:cursor-not-allowed
```

Must support `error?: boolean` prop to apply `border-danger focus-visible:ring-danger`.

### Card (`card.tsx`)

```
bg-card text-card-foreground
border border-border
rounded-xl
shadow-sm (light mode only)
```

Subcomponents: `CardHeader` (p-5 pb-0), `CardContent` (p-5), `CardFooter` (p-5 pt-0 flex justify-end gap-3).

---

## 3. Empty States & Loading Skeletons (`src/components/feedback/`)

### EmptyState Component

Props: `icon: LucideIcon`, `title: string`, `description: string`, `action?: ReactNode`.

```
Centered in content area.
Icon: 48px, text-muted-foreground.
Title: text-lg font-semibold text-foreground.
Description: text-sm text-muted-foreground max-w-sm text-center.
Action: Primary button CTA below description, mt-4.
```

**Copy rules**:
- Title is specific to the missing resource: "No projects yet", "No tasks in this column".
- Description is an invitation: "Create your first project to get started with your team."
- Never use generic "No data found" or "Nothing here."

### Skeleton Components

- **BoardSkeleton**: 4 column containers with 3 pulsing card shapes each (`h-24 w-full bg-muted/60 animate-pulse rounded-lg`).
- **MetricSkeleton**: 3-4 card containers with pulsing value blocks (`h-8 w-24 bg-muted/60 animate-pulse rounded-md`).
- **TableSkeleton**: 5 rows with alternating width pulsing bars.
- **FormSkeleton**: Stacked input-sized bars with label placeholders.

All skeletons must match the final layout's exact dimensions to prevent Cumulative Layout Shift.

---

## 4. Composition Rules

1. **Feature components import from `@/components/ui/`**, never from external libraries directly. Radix primitives are always wrapped in the `ui/` layer.
2. **No inline colors or hardcoded values**. All colors use CSS custom property tokens (`text-foreground`, `bg-card`, etc.).
3. **Every interactive element has a visible focus ring** (`focus-visible:ring-2 ring-ring ring-offset-2`).
4. **Motion values are consistent**: `transition-colors duration-150` for micro-interactions, `transition-all duration-200` for layout changes.
5. **Icon sizes match their context**: `16px` inline, `18px` sidebar, `20px` buttons, `24px` page headers.
