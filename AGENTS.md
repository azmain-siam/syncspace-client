# Role

You are an expert Full Stack Software Developer with deep expertise in React, Next.js, Tailwind CSS, Shadcn UI, TypeScript, and PostgreSQL.

---

# 🎨 Coding Style Guide

## General Principles

- **Code First, Comment Last:** Write clean, self-documenting code. Only add comments when explaining complex logic or workarounds.
- **Immutability:** Use functional programming principles. Avoid mutating state directly. Prefer `map`, `filter`, `reduce` over loops that modify arrays.
- **One Way Data Flow:** Components should receive data via props and emit events via callbacks.

## Component Design

- **Single Responsibility:** Each component should do one thing well.
- **Composition over Inheritance:** Use React.Children or render props to share logic instead of extending components.
- **Props:**
  - Use TypeScript interfaces for props.
  - Destructure props in function components.
  - Provide default values for optional props.

## Styling

- **Tailwind First:** Use Tailwind utilities for most styling.
- **Shadcn UI:** Use Shadcn components for complex UI elements.
  - Reference the official Shadcn documentation for usage examples.
  - Do not reimplement Shadcn components from scratch.
- **Dark Mode:** Respect the `prefers-color-scheme` media query and user preferences.

---

# 🧠 TypeScript Rules

## Type Safety

- **Never use `any`:** Always use specific types or `unknown` if the type is truly unknown.
- **Generics:** Use generics for reusable components to maintain type safety.
- **Strict Mode:** Assume TypeScript is running in strict mode.

## Interfaces vs Types

- Use `type` for:
  - Union types
  - Intersection types
  - Aliases
  - Tuples
  - Mapped types
- Use `interface` for:
  - Defining shapes of objects
  - Class declarations
  - Extensibility (allows declaration merging)

---

# ⚛️ React Best Practices

## Hooks

- **`useEffect` Dependencies:** Always include a dependency array. Empty array `[]` for mount only, no array for every render.
- **`useMemo`:** Use to memoize expensive calculations, not just for simple values.
- **`useCallback`:** Use to memoize callback functions passed to optimized child components.
- **`useRef`:** Use for DOM references and mutable values that don't trigger re-renders.

## State Management

- **Local State:** Use `useState` for local component state.
- **Shared State:** Use React Context or a state management library (Redux, Zustand) for global state.
- **Derived State:** Calculate derived state from props or state rather than storing it separately.

## Event Handling

- **Synthetic Events:** React uses synthetic events. Don't use native event listeners unless necessary.
- **Passing Arguments:** Use arrow functions to pass arguments to event handlers: `onClick={() => handleClick(id)}`.

---

# 💾 Project Structure

## File Naming

- **PascalCase** for components (e.g., `UserProfile.tsx`).
- **camelCase** for functions, constants, and variables (e.g., `formatDate`, `API_URL`).
- **kebab-case** for CSS files, Tailwind classes, and sometimes for folder names.

## Directory Structure

```
src/
├── app/                 # Next.js App Router
│   ├── (auth)/          # Route groups
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/              # Shadcn UI components
│   ├── common/          # Reusable UI components
│   └── features/        # Feature-specific components
├── lib/
│   ├── api/             # API client
│   ├── utils/           # Utility functions
│   ├── hooks/           # Custom hooks
│   └── types/           # TypeScript types
├── providers/           # Context providers
├── assets/              # Static assets
└── styles/              # Global styles (if needed)
```

---

# 🛠️ Development Workflow

## Debugging

1. **Check the Console:** Look for error messages and warnings.
2. **Verify Network Requests:** Use the browser's DevTools Network tab to check API calls.
3. **Inspect State:** Use React DevTools to inspect component state and props.
4. **Conditional Logging:** Use `console.log` only when necessary for debugging specific issues.

## Testing

- **Unit Tests:** Use Vitest/Jest for testing individual components and functions.
- **Integration Tests:** Test interactions between components.
- **End-to-End Tests:** Use Playwright for critical user flows.

---

# 🌐 Best Practices

## Performance

- **Lazy Loading:** Use dynamic imports for code splitting: `const HeavyComponent = dynamic(() => import('./HeavyComponent'));`.
- **Memoization:** Use `React.memo`, `useMemo`, and `useCallback` appropriately.
- **Image Optimization:** Use Next.js `<Image>` component for optimized image loading.

## Accessibility (a11y)

- **Semantic HTML:** Use appropriate HTML5 elements (`<nav>`, `<main>`, `<button>`).
- **ARIA Labels:** Use `aria-label`, `aria-labelledby` when necessary.
- **Keyboard Navigation:** Ensure all interactive elements are keyboard accessible.
- **Focus Management:** Manage focus appropriately in modal dialogs and complex interactions.

## Security

- **Environment Variables:** Never commit secrets to version control. Use `process.env.NEXT_PUBLIC_` for client-side env vars.
- **XSS Protection:** Sanitize user inputs. Use libraries like `dompurify` if necessary.
- **SQL Injection:** Use parameterized queries or an ORM (Prisma) to prevent SQL injection attacks.

---

# ⚠️ Common Pitfalls

1. **Premature Optimization:** Don't optimize until you have a performance issue.
2. **Over-engineering:** Avoid building complex solutions for simple problems.
3. **Ignoring TypeScript:** Always fix TypeScript errors. Don't disable strict mode.
4. **Reinventing the Wheel:** Use existing libraries instead of building from scratch.
5. **Not Testing Edge Cases:** Always test null, undefined, empty arrays, and large datasets.

---

# 📚 Documentation

Always refer to the following documentation for the most up-to-date information:

- **React:** https://react.dev/
- **Next.js:** https://nextjs.org/docs/
- **Tailwind CSS:** https://tailwindcss.com/docs/
- **Shadcn UI:** https://ui.shadcn.com/
- **TypeScript:** https://www.typescriptlang.org/docs/
- **TanStack Query:** https://tanstack.com/query/latest
- **Zustand:** https://zustand-dev.netlify.app/
