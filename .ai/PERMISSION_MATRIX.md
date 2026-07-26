# PERMISSION_MATRIX.md — Role-Based Access Control (RBAC) Matrix

Frontend visibility and mutation authorization Matrix based on `WorkspaceRole` (`OWNER`, `ADMIN`, `MEMBER`) and `ProjectMemberRole` (`MANAGER`, `LEAD`, `MEMBER`, `VIEWER`).

---

## 1. Workspace Permission Matrix

| Feature / UI Action | Owner | Admin | Member | Frontend Permission Check |
|---|:---:|:---:|:---:|---|
| View Workspace Dashboard & Summary | ✅ | ✅ | ✅ | `hasWorkspaceAccess()` |
| View Members List | ✅ | ✅ | ✅ | `hasWorkspaceAccess()` |
| Send Workspace Invitations | ✅ | ✅ | ❌ | `role === 'OWNER' || role === 'ADMIN'` |
| Cancel Pending Invitations | ✅ | ✅ | ❌ | `role === 'OWNER' || role === 'ADMIN'` |
| Change Member Role | ✅ | ❌ | ❌ | `role === 'OWNER'` |
| Remove Member | ✅ | ✅* | ❌ | `role === 'OWNER'` (Admin cannot remove Owner/Admin) |
| Transfer Workspace Ownership | ✅ | ❌ | ❌ | `role === 'OWNER'` |
| Update Workspace Settings | ✅ | ❌ | ❌ | `role === 'OWNER'` |
| Delete Workspace | ✅ | ❌ | ❌ | `role === 'OWNER'` |

---

## 2. Project, Board & Task Permission Matrix

| Feature / UI Action | Owner / Admin | Project Lead / Manager | Workspace Member | Non-Member / Viewer |
|---|:---:|:---:|:---:|:---:|
| Create Project | ✅ | ✅ | ✅ | ❌ |
| Archive / Update Project | ✅ | ✅ | ❌ | ❌ |
| Create / Reorder Board & Columns | ✅ | ✅ | ✅ | ❌ |
| Delete Board / Column | ✅ | ✅ | ❌ | ❌ |
| Create & Reorder Tasks | ✅ | ✅ | ✅ | ❌ |
| Edit Task Title & Description | ✅ | ✅ | ✅ | ❌ |
| Delete Task | ✅ | ✅ | Author Only | ❌ |
| Add Comment & Upload Attachment | ✅ | ✅ | ✅ | ❌ |
| Delete Comment / Attachment | ✅ | ✅ | Author Only | ❌ |

---

## 3. Frontend Permission Hook Pattern (`src/hooks/use-permissions.ts`)

```typescript
import { useAuthStore } from '@/features/auth/stores/use-auth-store';
import { useWorkspaceMembersQuery } from '@/features/workspace/api/use-workspace-members-query';

export function usePermissions(workspaceId: string) {
  const user = useAuthStore((s) => s.user);
  const { data: members = [] } = useWorkspaceMembersQuery(workspaceId);

  const currentMember = members.find((m) => m.userId === user?.id);
  const role = currentMember?.role;

  return {
    role,
    isOwner: role === 'OWNER',
    isAdmin: role === 'ADMIN',
    isMember: role === 'MEMBER',
    canManageWorkspace: role === 'OWNER',
    canInvite: role === 'OWNER' || role === 'ADMIN',
    canManageRoles: role === 'OWNER',
  };
}
```
