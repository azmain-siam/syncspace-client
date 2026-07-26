# CODING_STANDARDS.md — Frontend Engineering Standards

Coding standards, type safety constraints, performance guidelines, and error handling rules for the SyncSpace frontend client.

---

## 1. Type Safety & TypeScript Constraints

- **No `any`**: Explicit type definitions for all API responses, component props, and Zustand store states. Use `unknown` with Zod validation if dynamic API responses require runtime parsing.
- **Strict Null Checks**: Handle optional properties (`avatar?: string`, `assigneeId?: string`) explicitly with optional chaining (`user?.avatar`) or fallback UI indicators.
- **Shared Enums**: Mirror backend enums (`TaskPriority`, `TaskStatus`, `WorkspaceRole`, `LinkType`) strictly in TypeScript declarations (`src/types/domain.ts`).

---

## 2. Form & Validation Standards

- All forms MUST use `react-hook-form` with `@hookform/resolvers/zod`.
- Inline error messages MUST appear beneath invalid controls (`text-xs text-destructive`).
- Form buttons MUST disable and display loading state during active submission to prevent duplicate POST mutations.

```typescript
// Example Form Schema
import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(150),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  assigneeId: z.string().optional(),
  dueDate: z.string().optional(),
});
```

---

## 3. Performance & Asset Optimization

- **Dynamic Imports**: Use `next/dynamic` or `React.lazy` for heavy client components (e.g. `CommandPaletteModal`, Markdown editor, Charts).
- **Image Optimization**: Use Next.js `<Image />` component with `width`, `height`, and `alt` tags for all user avatars and workspace logos.
- **Debounced Inputs**: Debounce text input handlers on global search and filter bars by `300ms` using `useDebounce` hook.

---

## 4. Accessibility & Error Boundaries

- Wrap feature route roots in React Error Boundaries (`error.tsx` in App Router) to display friendly fallback UI on unexpected runtime exceptions.
- Ensure all interactive modals (`Dialog`, `DropdownMenu`) lock focus inside and close on `Esc` key or backdrop click.
