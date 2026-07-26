# COMPONENT_GUIDELINES.md — Reusable Component System & Composition

Guidelines for building composable, accessible, and high-performance UI components using Radix UI primitives and Tailwind CSS v4.

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

- **Button (`button.tsx`)**:
  - Variants: `default` (primary indigo), `secondary`, `outline`, `ghost`, `destructive`.
  - Sizes: `sm` (h-8 px-3 text-xs), `default` (h-9 px-4 text-sm), `lg` (h-10 px-6), `icon` (h-9 w-9).
  - Must accept `isLoading?: boolean` to render inline spinner and disable interactions automatically.
- **Badge (`badge.tsx`)**:
  - Used for Priorities (`LOW`, `MEDIUM`, `HIGH`, `URGENT`) and Statuses (`TODO`, `IN_PROGRESS`, `REVIEW`, `DONE`).
- **Avatar (`avatar.tsx`)**:
  - Displays user image avatar or fallback initials (`JD`). Incorporates online presence dot badge (`bg-emerald-500`).

---

## 3. Empty States & Loading Skeletons (`src/components/feedback/`)

- **`EmptyState` Component**:
  - Props: `icon: LucideIcon`, `title: string`, `description: string`, `action?: ReactNode`.
  - Used when no projects exist in a workspace, no tasks in a board, or search results are empty.
- **`BoardSkeleton` Component**:
  - Renders 4 column containers with 3 pulsing card skeletons (`h-24 w-full bg-muted/60 animate-pulse rounded-lg`) to prevent layout shifts during initial data query fetches.
