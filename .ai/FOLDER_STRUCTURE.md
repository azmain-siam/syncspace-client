# FOLDER_STRUCTURE.md — Scalable Feature-First Project Directory

Directory tree for the SyncSpace Next.js 15 App Router frontend repository.

---

```
syncspace-client/
├── .env.example
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── public/
│   ├── favicon.ico
│   └── logo.svg
└── src/
    ├── app/                           ← Next.js App Router (Routing Layer Only)
    │   ├── (auth)/
    │   │   ├── layout.tsx
    │   │   ├── login/page.tsx
    │   │   ├── register/page.tsx
    │   │   ├── forgot-password/page.tsx
    │   │   └── reset-password/page.tsx
    │   ├── (dashboard)/
    │   │   ├── layout.tsx
    │   │   ├── page.tsx
    │   │   ├── profile/page.tsx
    │   │   └── workspaces/
    │   │       ├── create/page.tsx
    │   │       └── [workspaceId]/
    │   │           ├── page.tsx       ← Workspace Dashboard View
    │   │           ├── activities/page.tsx
    │   │           ├── members/page.tsx
    │   │           ├── settings/page.tsx
    │   │           └── projects/
    │   │               ├── page.tsx
    │   │               └── [projectId]/
    │   │                   └── boards/
    │   │                       └── [boardId]/page.tsx ← Kanban View
    │   ├── auth/
    │   │   └── verify-email/page.tsx
    │   ├── invitations/
    │   │   └── accept/page.tsx
    │   ├── api/
    │   ├── layout.tsx                 ← Root Layout (Providers, Fonts)
    │   ├── globals.css                ← Tailwind v4 CSS Tokens
    │   └── not-found.tsx
    ├── components/                    ├── Shared Reusable UI Components
    │   ├── ui/                        ← Radix UI Primitives (Button, Dialog, Badge, Input)
    │   ├── common/                    ← Layout Primitives (Sidebar, Header, SearchModal)
    │   └── feedback/                  ← Skeletons & Empty States
    ├── features/                      ├── Feature Modules (Domain Logic)
    │   ├── auth/
    │   │   ├── api/                   ← Axios API request calls
    │   │   ├── components/            ← LoginForm, RegisterForm
    │   │   ├── hooks/                 ← useLogin, useRegister
    │   │   ├── schemas/               ← Zod Form Schemas
    │   │   ├── stores/                ← useAuthStore (Zustand)
    │   │   └── types/                 ← Auth TypeScript Interfaces
    │   ├── workspace/
    │   ├── project/
    │   ├── board/
    │   ├── task/
    │   ├── comment/
    │   ├── notification/
    │   ├── search/
    │   └── dashboard/
    ├── hooks/                         ← Cross-feature Custom Hooks (use-debounce, use-media-query)
    ├── lib/                           ← Utility Libraries & Configs
    │   ├── api/                       ← Axios Client Setup & Interceptors
    │   ├── socket/                    ← Socket.IO Connection & Listeners
    │   └── utils.ts                   ← Tailwind `cn()` helper
    ├── providers/                     ← React Context Providers (QueryProvider, ThemeProvider)
    └── types/                         ← Global Type Declarations
```
