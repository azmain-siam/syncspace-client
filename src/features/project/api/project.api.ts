import { apiClient } from '@/lib/api/api-client';
import type { ApiResponse, Project } from '@/types/domain';
import type { CreateProjectInput } from '../schemas/create-project.schema';
import type { UpdateProjectInput } from '../schemas/update-project.schema';
import type {
  ProjectDetail,
  ProjectHealth,
  ProjectLink,
  ProjectStatusUpdate,
  ProjectTaskItem,
  ProjectTasksResponse,
} from '../types/project.types';

export const projectApi = {
  // Get all projects in workspace
  getWorkspaceProjects: async (workspaceId: string): Promise<ApiResponse<Project[]>> => {
    const response = await apiClient.get<ApiResponse<Project[]>>(
      `/workspaces/${workspaceId}/projects`,
    );
    return response.data;
  },

  // Get single project detail by UUID or Slug
  getProject: async (
    workspaceId: string,
    projectId: string,
  ): Promise<ApiResponse<ProjectDetail>> => {
    const response = await apiClient.get<ApiResponse<ProjectDetail>>(
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

  // Archive project (Owner dedicated endpoint)
  archiveProject: async (
    workspaceId: string,
    projectId: string,
  ): Promise<ApiResponse<Project>> => {
    const response = await apiClient.patch<ApiResponse<Project>>(
      `/workspaces/${workspaceId}/projects/${projectId}/archive`,
    );
    return response.data;
  },

  // Soft delete project
  deleteProject: async (
    workspaceId: string,
    projectId: string,
  ): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/workspaces/${workspaceId}/projects/${projectId}`,
    );
    return response.data;
  },

  // Restore soft-deleted project
  restoreProject: async (
    workspaceId: string,
    projectId: string,
  ): Promise<ApiResponse<Project>> => {
    const response = await apiClient.patch<ApiResponse<Project>>(
      `/workspaces/${workspaceId}/projects/${projectId}/restore`,
    );
    return response.data;
  },

  // Get flat list of tasks in a project
  getProjectTasks: async (
    workspaceId: string,
    projectId: string,
  ): Promise<ApiResponse<ProjectTasksResponse | ProjectTaskItem[]>> => {
    const response = await apiClient.get<ApiResponse<ProjectTasksResponse | ProjectTaskItem[]>>(
      `/workspaces/${workspaceId}/projects/${projectId}/tasks`,
    );
    return response.data;
  },

  // Links sub-resource
  getProjectLinks: async (
    workspaceId: string,
    projectId: string,
  ): Promise<ApiResponse<ProjectLink[]>> => {
    const response = await apiClient.get<ApiResponse<ProjectLink[]>>(
      `/workspaces/${workspaceId}/projects/${projectId}/links`,
    );
    return response.data;
  },

  createProjectLink: async (
    workspaceId: string,
    projectId: string,
    data: { title: string; url: string; type?: string },
  ): Promise<ApiResponse<ProjectLink>> => {
    const response = await apiClient.post<ApiResponse<ProjectLink>>(
      `/workspaces/${workspaceId}/projects/${projectId}/links`,
      data,
    );
    return response.data;
  },

  deleteProjectLink: async (
    workspaceId: string,
    projectId: string,
    linkId: string,
  ): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/workspaces/${workspaceId}/projects/${projectId}/links/${linkId}`,
    );
    return response.data;
  },

  // Status updates sub-resource
  getProjectStatusUpdates: async (
    workspaceId: string,
    projectId: string,
  ): Promise<ApiResponse<ProjectStatusUpdate[]>> => {
    const response = await apiClient.get<ApiResponse<ProjectStatusUpdate[]>>(
      `/workspaces/${workspaceId}/projects/${projectId}/status-updates`,
    );
    return response.data;
  },

  createProjectStatusUpdate: async (
    workspaceId: string,
    projectId: string,
    data: { health: ProjectHealth; message: string },
  ): Promise<ApiResponse<ProjectStatusUpdate>> => {
    const response = await apiClient.post<ApiResponse<ProjectStatusUpdate>>(
      `/workspaces/${workspaceId}/projects/${projectId}/status-updates`,
      data,
    );
    return response.data;
  },
};

