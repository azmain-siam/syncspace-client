import { apiClient } from '@/lib/api/api-client';
import type {
  ApiResponse,
  User,
  Workspace,
  WorkspaceInvitation,
  WorkspaceMember,
  WorkspaceRole,
} from '@/types/domain';
import type { CreateWorkspaceInput } from '../schemas/create-workspace.schema';
import type { InviteMemberInput } from '../schemas/invite-member.schema';
import type { UpdateWorkspaceSettingsInput } from '../schemas/update-settings.schema';

export interface ValidateInvitationResponse {
  invitation: WorkspaceInvitation;
  workspace: Workspace;
  inviter: User;
}

export const workspaceApi = {
  // Get all user workspaces
  getMyWorkspaces: async (): Promise<ApiResponse<Workspace[]>> => {
    const res = await apiClient.get<ApiResponse<Workspace[]>>('/workspaces');
    return res.data;
  },

  // Create workspace
  createWorkspace: async (
    data: CreateWorkspaceInput,
  ): Promise<ApiResponse<Workspace>> => {
    const res = await apiClient.post<ApiResponse<Workspace>>('/workspaces', data);
    return res.data;
  },

  // Update workspace settings
  updateWorkspaceSettings: async (
    workspaceId: string,
    data: UpdateWorkspaceSettingsInput,
  ): Promise<ApiResponse<Workspace>> => {
    const res = await apiClient.patch<ApiResponse<Workspace>>(
      `/workspaces/${workspaceId}/settings`,
      data,
    );
    return res.data;
  },

  // Transfer ownership
  transferOwnership: async (
    workspaceId: string,
    newOwnerId: string,
  ): Promise<ApiResponse<Workspace>> => {
    const res = await apiClient.patch<ApiResponse<Workspace>>(
      `/workspaces/${workspaceId}/transfer-ownership`,
      { newOwnerId },
    );
    return res.data;
  },

  // Get workspace members
  getWorkspaceMembers: async (
    workspaceId: string,
  ): Promise<ApiResponse<WorkspaceMember[]>> => {
    const res = await apiClient.get<ApiResponse<WorkspaceMember[]>>(
      `/workspaces/${workspaceId}/members`,
    );
    return res.data;
  },

  // Invite member by email
  inviteMember: async (
    workspaceId: string,
    data: InviteMemberInput,
  ): Promise<ApiResponse<WorkspaceInvitation>> => {
    const res = await apiClient.post<ApiResponse<WorkspaceInvitation>>(
      `/workspaces/${workspaceId}/invitations`,
      data,
    );
    return res.data;
  },

  // Remove member from workspace
  removeMember: async (
    workspaceId: string,
    userId: string,
  ): Promise<ApiResponse<null>> => {
    const res = await apiClient.delete<ApiResponse<null>>(
      `/workspaces/${workspaceId}/members/${userId}`,
    );
    return res.data;
  },

  // Update member role
  updateMemberRole: async (
    workspaceId: string,
    memberId: string,
    role: WorkspaceRole,
  ): Promise<ApiResponse<WorkspaceMember>> => {
    const res = await apiClient.patch<ApiResponse<WorkspaceMember>>(
      `/workspaces/${workspaceId}/members/${memberId}/role`,
      { role },
    );
    return res.data;
  },

  // Validate invitation token (Public)
  validateInvitation: async (
    token: string,
  ): Promise<ApiResponse<ValidateInvitationResponse>> => {
    const res = await apiClient.get<ApiResponse<ValidateInvitationResponse>>(
      `/workspace-invitations/validate?token=${encodeURIComponent(token)}`,
    );
    return res.data;
  },

  // Accept invitation (Authenticated)
  acceptInvitation: async (
    token: string,
  ): Promise<ApiResponse<{ workspace: Workspace }>> => {
    const res = await apiClient.post<ApiResponse<{ workspace: Workspace }>>(
      '/workspace-invitations/accept',
      { token },
    );
    return res.data;
  },

  // Decline invitation (Authenticated)
  declineInvitation: async (
    token: string,
  ): Promise<ApiResponse<null>> => {
    const res = await apiClient.post<ApiResponse<null>>(
      '/workspace-invitations/decline',
      { token },
    );
    return res.data;
  },
};
