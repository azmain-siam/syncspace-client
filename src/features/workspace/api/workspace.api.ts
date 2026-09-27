import { apiClient } from '@/lib/api/api-client';
import type {
  ApiResponse,
  DirectAddMemberRequest,
  SendInvitationResponse,
  Workspace,
  WorkspaceInvitationDetails,
  WorkspaceMember,
  WorkspaceRole,
} from '@/types/domain';
import type { CreateWorkspaceInput } from '../schemas/create-workspace.schema';
import type { InviteMemberInput } from '../schemas/invite-member.schema';
import type { UpdateWorkspaceSettingsInput } from '../schemas/update-settings.schema';

export type ValidateInvitationResponse = WorkspaceInvitationDetails;

export const workspaceApi = {
  // 1. Get all user workspaces
  getMyWorkspaces: async (): Promise<ApiResponse<Workspace[]>> => {
    const res = await apiClient.get<ApiResponse<Workspace[]>>('/workspaces');
    return res.data;
  },

  // 2. Create workspace
  createWorkspace: async (
    data: CreateWorkspaceInput,
  ): Promise<ApiResponse<Workspace>> => {
    const res = await apiClient.post<ApiResponse<Workspace>>('/workspaces', data);
    return res.data;
  },

  // 3. Update workspace settings
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

  // 4. Soft-delete workspace (Owner only)
  deleteWorkspace: async (workspaceId: string): Promise<ApiResponse<null>> => {
    const res = await apiClient.delete<ApiResponse<null>>(
      `/workspaces/${workspaceId}`,
    );
    return res.data;
  },

  // 5. Leave workspace voluntarily (Non-owners only)
  leaveWorkspace: async (workspaceId: string): Promise<ApiResponse<null>> => {
    const res = await apiClient.post<ApiResponse<null>>(
      `/workspaces/${workspaceId}/leave`,
    );
    return res.data;
  },

  // 6. Transfer workspace ownership (Owner only)
  transferOwnership: async (
    workspaceId: string,
    memberId: string,
  ): Promise<ApiResponse<null>> => {
    const res = await apiClient.patch<ApiResponse<null>>(
      `/workspaces/${workspaceId}/transfer-ownership`,
      { memberId },
    );
    return res.data;
  },

  // 7. Get workspace members
  getWorkspaceMembers: async (
    workspaceId: string,
  ): Promise<ApiResponse<WorkspaceMember[]>> => {
    const res = await apiClient.get<ApiResponse<WorkspaceMember[]>>(
      `/workspaces/${workspaceId}/members`,
    );
    return res.data;
  },

  // 8. Direct member addition by email
  directAddMember: async (
    workspaceId: string,
    data: DirectAddMemberRequest,
  ): Promise<ApiResponse<WorkspaceMember>> => {
    const res = await apiClient.post<ApiResponse<WorkspaceMember>>(
      `/workspaces/${workspaceId}/members`,
      data,
    );
    return res.data;
  },

  // 9. Update member role (memberId is target userId)
  updateMemberRole: async (
    workspaceId: string,
    memberId: string,
    role: WorkspaceRole,
  ): Promise<ApiResponse<null>> => {
    const res = await apiClient.patch<ApiResponse<null>>(
      `/workspaces/${workspaceId}/members/${memberId}/role`,
      { role },
    );
    return res.data;
  },

  // 10. Remove member from workspace
  removeMember: async (
    workspaceId: string,
    userId: string,
  ): Promise<ApiResponse<null>> => {
    const res = await apiClient.delete<ApiResponse<null>>(
      `/workspaces/${workspaceId}/members/${userId}`,
    );
    return res.data;
  },

  // 11. Send tokenized workspace invitation email
  inviteMember: async (
    workspaceId: string,
    data: InviteMemberInput,
  ): Promise<ApiResponse<SendInvitationResponse>> => {
    const res = await apiClient.post<ApiResponse<SendInvitationResponse>>(
      `/workspaces/${workspaceId}/invitations`,
      data,
    );
    return res.data;
  },

  // 12. Cancel / revoke pending workspace invitation
  cancelInvitation: async (
    workspaceId: string,
    invitationId: string,
  ): Promise<ApiResponse<{ message: string }>> => {
    const res = await apiClient.delete<ApiResponse<{ message: string }>>(
      `/workspaces/${workspaceId}/invitations/${invitationId}`,
    );
    return res.data;
  },

  // 13. Validate invitation token (Public landing page)
  validateInvitation: async (
    token: string,
  ): Promise<ApiResponse<WorkspaceInvitationDetails>> => {
    const res = await apiClient.get<ApiResponse<WorkspaceInvitationDetails>>(
      `/workspace-invitations/validate?token=${encodeURIComponent(token)}`,
    );
    return res.data;
  },

  // 14. Accept invitation (Authenticated)
  acceptInvitation: async (
    token: string,
  ): Promise<ApiResponse<{ message: string }>> => {
    const res = await apiClient.post<ApiResponse<{ message: string }>>(
      '/workspace-invitations/accept',
      { token },
    );
    return res.data;
  },

  // 15. Decline invitation (Authenticated)
  declineInvitation: async (
    token: string,
  ): Promise<ApiResponse<{ message: string }>> => {
    const res = await apiClient.post<ApiResponse<{ message: string }>>(
      '/workspace-invitations/decline',
      { token },
    );
    return res.data;
  },
};
