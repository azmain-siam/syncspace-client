import { useMemo } from 'react';
import { WorkspaceRole } from '@/types/domain';
import { useAuthStore } from '@/features/auth/stores/use-auth-store';
import { useWorkspaceStore } from '@/features/workspace/stores/use-workspace-store';
import { useWorkspaceMembers } from './use-workspace-members';

export interface WorkspacePermissions {
  // Current user role
  role: WorkspaceRole | null;
  isOwner: boolean;
  isAdmin: boolean;
  isMember: boolean;
  isGuest: boolean;

  // Workspace-level permissions
  canManageWorkspaceSettings: boolean;
  canManageMembers: boolean;
  canDeleteWorkspace: boolean;

  // Project-level permissions (Module 04: Owner/Admin create & edit, Owner only archive)
  canCreateProject: boolean;
  canEditProject: boolean;
  canArchiveProject: boolean;
  canDeleteProject: boolean;

  // Board & Column structure permissions (Module 05: Owner/Admin only)
  canManageBoardStructure: boolean;
  canCreateBoard: boolean;
  canEditBoard: boolean;
  canDeleteBoard: boolean;
  canCreateColumn: boolean;
  canEditColumn: boolean;
  canReorderColumns: boolean;
  canDeleteColumn: boolean;

  // Task & Subtask lifecycle permissions (Module 06: Owner, Admin, & Member)
  canCreateTask: boolean;
  canEditTask: boolean;
  canMoveTask: boolean;
  canDeleteTask: (taskCreatorId?: string | null) => boolean;
  canManageChecklists: boolean;
  canManageAttachments: boolean;
  canManageLinks: boolean;

  // Sprint & Agile backlog permissions (Module 08: Owner, Admin, & Member)
  canManageSprints: boolean;

  // Executive dashboard analytics (Module 13: Owner, Admin, Member — not Guest)
  canViewWorkspaceAnalytics: boolean;

  // Loading state
  isLoading: boolean;
}

/**
 * Centralized Role-Based Access Control (RBAC) hook for SyncSpace.
 * Strictly aligns frontend UI capabilities with backend contracts:
 * - Members have full agency over daily task management, boards, cards, checklists, and sprints.
 * - Board/Column structure management is restricted to Owner/Admin.
 * - Project creation/editing is restricted to Owner/Admin, and Project Archival to Owner only.
 */
export function useWorkspacePermissions(workspaceId?: string | null): WorkspacePermissions {
  const currentUser = useAuthStore((state) => state.user);
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace);

  const effectiveWorkspaceId = workspaceId || activeWorkspace?.id || '';
  const { data: membersResponse, isLoading: membersLoading } = useWorkspaceMembers(effectiveWorkspaceId);

  return useMemo(() => {
    if (!currentUser || !effectiveWorkspaceId) {
      return {
        role: null,
        isOwner: false,
        isAdmin: false,
        isMember: false,
        isGuest: false,
        canManageWorkspaceSettings: false,
        canManageMembers: false,
        canDeleteWorkspace: false,
        canCreateProject: false,
        canEditProject: false,
        canArchiveProject: false,
        canDeleteProject: false,
        canManageBoardStructure: false,
        canCreateBoard: false,
        canEditBoard: false,
        canDeleteBoard: false,
        canCreateColumn: false,
        canEditColumn: false,
        canReorderColumns: false,
        canDeleteColumn: false,
        canCreateTask: false,
        canEditTask: false,
        canMoveTask: false,
        canDeleteTask: () => false,
        canManageChecklists: false,
        canManageAttachments: false,
        canManageLinks: false,
        canManageSprints: false,
        canViewWorkspaceAnalytics: false,
        isLoading: membersLoading,
      };
    }

    const isDirectOwner = activeWorkspace?.id === effectiveWorkspaceId && activeWorkspace?.ownerId === currentUser.id;
    const members = membersResponse?.data || [];
    const currentMember = members.find((m) => m.userId === currentUser.id);

    let role: WorkspaceRole | null = null;
    if (isDirectOwner) {
      role = WorkspaceRole.OWNER;
    } else if (currentMember?.role) {
      role = currentMember.role as WorkspaceRole;
    } else if (activeWorkspace?.ownerId === currentUser.id) {
      role = WorkspaceRole.OWNER;
    } else {
      // Default fallback for authenticated team member
      role = WorkspaceRole.MEMBER;
    }

    const isOwner = role === WorkspaceRole.OWNER;
    const isAdmin = isOwner || role === WorkspaceRole.ADMIN;
    const isMember = isAdmin || role === WorkspaceRole.MEMBER;
    const isGuest = role === WorkspaceRole.GUEST;
    const hasExplicitMembership = Boolean(
      isDirectOwner || currentMember || activeWorkspace?.ownerId === currentUser.id,
    );
    const isRoleResolved = !membersLoading && Boolean(currentUser && effectiveWorkspaceId);

    return {
      role,
      isOwner,
      isAdmin,
      isMember,
      isGuest,

      // Workspace Level
      canManageWorkspaceSettings: isAdmin,
      canManageMembers: isAdmin,
      canDeleteWorkspace: isOwner,

      // Project Level (Per Backend Contract 04)
      canCreateProject: isAdmin,
      canEditProject: isAdmin,
      canArchiveProject: isOwner,
      canDeleteProject: isAdmin,

      // Board & Column Level (Per Backend Contract 05)
      canManageBoardStructure: isAdmin,
      canCreateBoard: isAdmin,
      canEditBoard: isAdmin,
      canDeleteBoard: isAdmin,
      canCreateColumn: isAdmin,
      canEditColumn: isAdmin,
      canReorderColumns: isAdmin,
      canDeleteColumn: isAdmin,

      // Task Level (Per Backend Contract 06: Members have full daily task capabilities!)
      canCreateTask: isMember,
      canEditTask: isMember,
      canMoveTask: isMember,
      canDeleteTask: (taskCreatorId?: string | null) =>
        isAdmin || (Boolean(taskCreatorId) && taskCreatorId === currentUser.id),
      canManageChecklists: isMember,
      canManageAttachments: isMember,
      canManageLinks: isMember,

      // Sprint Level (Per Backend Contract 08)
      canManageSprints: isMember,

      canViewWorkspaceAnalytics:
        isRoleResolved && !isGuest && hasExplicitMembership,

      isLoading: membersLoading,
    };
  }, [currentUser, activeWorkspace, effectiveWorkspaceId, membersResponse, membersLoading]);
}
