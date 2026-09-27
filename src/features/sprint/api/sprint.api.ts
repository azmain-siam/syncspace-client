import { apiClient } from '@/lib/api/api-client';
import type { ApiResponse } from '@/types/domain';
import type {
  Sprint,
  PaginatedSprintsResponse,
  BacklogResponse,
  SprintCompletionResponse,
  CreateSprintRequest,
  UpdateSprintRequest,
  CompleteSprintRequest,
  AssignTaskToSprintRequest,
  AssignTaskToSprintResponse,
  SprintQueryParams,
  BacklogQueryParams,
} from '../types/sprint.types';

export const sprintApi = {
  // 1. List project sprints with capacity metrics
  getProjectSprints: async (
    projectId: string,
    params?: SprintQueryParams,
  ): Promise<ApiResponse<PaginatedSprintsResponse>> => {
    const response = await apiClient.get<ApiResponse<PaginatedSprintsResponse>>(
      `/projects/${projectId}/sprints`,
      { params },
    );
    return response.data;
  },

  // 2. Dedicated project backlog triage view
  getProjectBacklog: async (
    projectId: string,
    params?: BacklogQueryParams,
  ): Promise<ApiResponse<BacklogResponse>> => {
    const response = await apiClient.get<ApiResponse<BacklogResponse>>(
      `/projects/${projectId}/backlog`,
      { params },
    );
    return response.data;
  },

  // 3. Get sprint by ID with task breakdown
  getSprint: async (sprintId: string): Promise<ApiResponse<Sprint>> => {
    const response = await apiClient.get<ApiResponse<Sprint>>(
      `/sprints/${sprintId}`,
    );
    return response.data;
  },

  // 4. Create sprint in planning state
  createSprint: async (
    projectId: string,
    data: CreateSprintRequest,
  ): Promise<ApiResponse<Sprint>> => {
    const response = await apiClient.post<ApiResponse<Sprint>>(
      `/projects/${projectId}/sprints`,
      data,
    );
    return response.data;
  },

  // 5. Update sprint details
  updateSprint: async (
    sprintId: string,
    data: UpdateSprintRequest,
  ): Promise<ApiResponse<Sprint>> => {
    const response = await apiClient.patch<ApiResponse<Sprint>>(
      `/sprints/${sprintId}`,
      data,
    );
    return response.data;
  },

  // 6. Start sprint (enforces single active sprint per project)
  startSprint: async (sprintId: string): Promise<ApiResponse<Sprint>> => {
    const response = await apiClient.post<ApiResponse<Sprint>>(
      `/sprints/${sprintId}/start`,
      {},
    );
    return response.data;
  },

  // 7. Complete sprint with unfinished task rollover
  completeSprint: async (
    sprintId: string,
    data?: CompleteSprintRequest,
  ): Promise<ApiResponse<SprintCompletionResponse>> => {
    const response = await apiClient.post<ApiResponse<SprintCompletionResponse>>(
      `/sprints/${sprintId}/complete`,
      data || {},
    );
    return response.data;
  },

  // 8. Soft-delete sprint and push tasks to backlog
  deleteSprint: async (sprintId: string): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/sprints/${sprintId}`,
    );
    return response.data;
  },

  // 9. Assign / move task to sprint or backlog
  assignTaskToSprint: async (
    taskId: string,
    data: AssignTaskToSprintRequest,
  ): Promise<ApiResponse<AssignTaskToSprintResponse>> => {
    const response = await apiClient.post<ApiResponse<AssignTaskToSprintResponse>>(
      `/tasks/${taskId}/sprint`,
      data,
    );
    return response.data;
  },
};
