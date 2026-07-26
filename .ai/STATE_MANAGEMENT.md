# STATE_MANAGEMENT.md — Frontend State Strategy & Stores

This document defines state categorization rules, store structures (Zustand), server cache invalidations (TanStack Query), and Socket synchronizations.

---

## 1. State Classification & Allocation

| State Type | Scope | Solution | Example Use Case |
|---|---|---|---|
| **Server State** | Async / Cached | TanStack Query v5 | Tasks, Comments, Workspaces, Notifications |
| **Global Client State** | App-wide | Zustand v5 (`persist`) | Auth session, Active Workspace ID, Theme |
| **URL Parameter State** | Page / Linkable | Next.js `useSearchParams` | Active Task Modal ID (`?taskId=`), Search Filters |
| **Local Component State**| Isolated Component| React `useState` / `useReducer` | Dropdown open state, Drag hover states |
| **Form State** | Form Isolated | React Hook Form + Zod | Task creation form, Edit profile form |

---

## 2. Zustand Store Definitions

### 2.1 Auth Store (`src/features/auth/stores/use-auth-store.ts`)
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  avatar?: string;
  isEmailVerified: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      setAuth: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken, isAuthenticated: true }),
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      logout: () => set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),
    }),
    { name: 'syncspace-auth-storage' }
  )
);
```

### 2.2 Workspace Context Store (`src/features/workspace/stores/use-workspace-store.ts`)
```typescript
import { create } from 'zustand';

interface WorkspaceState {
  activeWorkspaceId: string | null;
  activeProjectId: string | null;
  activeBoardId: string | null;
  setActiveWorkspace: (id: string) => void;
  setActiveProject: (id: string) => void;
  setActiveBoard: (id: string) => void;
}

export const useWorkspaceStore = create<WorkspaceState>()((set) => ({
  activeWorkspaceId: null,
  activeProjectId: null,
  activeBoardId: null,
  setActiveWorkspace: (id) => set({ activeWorkspaceId: id }),
  setActiveProject: (id) => set({ activeProjectId: id }),
  setActiveBoard: (id) => set({ activeBoardId: id }),
}));
```

---

## 3. Real-Time Socket.IO Synchronization Adapter

When real-time domain events are received over Socket.IO (e.g. `task.moved`, `comment.created`), the socket handler delegates directly to TanStack Query's `queryClient` to update or invalidate the appropriate query key, ensuring seamless live updates across connected clients:

```typescript
// src/lib/socket/socket-query-adapter.ts
import { QueryClient } from '@tanstack/react-query';

export function registerSocketQuerySync(socket: any, queryClient: QueryClient) {
  socket.on('task.created', ({ columnId }: { columnId: string }) => {
    queryClient.invalidateQueries({ queryKey: ['tasks', columnId] });
  });

  socket.on('task.moved', ({ fromColumnId, toColumnId }: { fromColumnId: string; toColumnId: string }) => {
    queryClient.invalidateQueries({ queryKey: ['tasks', fromColumnId] });
    queryClient.invalidateQueries({ queryKey: ['tasks', toColumnId] });
  });

  socket.on('comment.created', ({ taskId }: { taskId: string }) => {
    queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
  });
}
```
