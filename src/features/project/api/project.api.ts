import { apiClient } from '@/lib/api/api-client';
import type { ApiResponse, Project } from '@/types/domain';
import type { CreateProjectInput } from '../schemas/create-project.schema';
import type { UpdateProjectInput } from '../schemas/update-project.schema';

export const projectApi = {
  // Get all projects in workspace
  getWorkspaceProjects: async (workspaceId: string): Promise<ApiResponse<Project[]>> => {
    const response = await apiClient.get<ApiResponse<Project[]>>(
      `/workspaces/${workspaceId}/projects`,
    );
    return response.data;
  },

  // Get single project detail
  getProject: async (
    workspaceId: string,
    projectId: string,
  ): Promise<ApiResponse<Project>> => {
    const response = await apiClient.get<ApiResponse<Project>>(
      `/workspaces/${workspaceId}/projects/${projectId}`,
    );
    return response.data;
  },

  // Create new project
  createProject: async (
    workspaceId: string,
    data: CreateProjectInput,
  ): Promise<ApiResponse<Project>> => {
    const response = await apiClient.post<ApiResponse<Project>>(
      `/workspaces/${workspaceId}/projects`,
      data,
    );
    return response.data;
  },

  // Update existing project
  updateProject: async (
    workspaceId: string,
    projectId: string,
    data: UpdateProjectInput,
  ): Promise<ApiResponse<Project>> => {
    const response = await apiClient.patch<ApiResponse<Project>>(
      `/workspaces/${workspaceId}/projects/${projectId}`,
      data,
    );
    return response.data;
  },

  // Archive (delete) project
  archiveProject: async (
    workspaceId: string,
    projectId: string,
  ): Promise<ApiResponse<Project>> => {
    const response = await apiClient.patch<ApiResponse<Project>>(
      `/workspaces/${workspaceId}/projects/${projectId}/archive`,
    );
    return response.data;
  },
};
