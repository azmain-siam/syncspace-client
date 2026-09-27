import { apiClient } from '@/lib/api/api-client';
import type { ApiResponse } from '@/types/domain';
import type {
  Task,
  PaginatedTasksResponse,
  MyTasksResponse,
  TaskChecklistItem,
  TaskAttachment,
  TaskLink,
  CreateTaskRequest,
  UpdateTaskRequest,
  MoveTaskRequest,
  BulkUpdateTasksRequest,
  BulkDeleteTasksRequest,
  CreateChecklistItemRequest,
  UpdateChecklistItemRequest,
  CreateTaskLinkRequest,
  UpdateTaskLinkRequest,
  ColumnTasksParams,
  MyTasksParams,
} from '../types/task.types';

export const taskApi = {
  // 1. Create task in a column
  createTask: async (
    columnId: string,
    data: CreateTaskRequest,
  ): Promise<ApiResponse<Task>> => {
    const response = await apiClient.post<ApiResponse<Task>>(
      `/columns/${columnId}/tasks`,
      data,
    );
    return response.data;
  },

  // 2. List tasks in column (paginated/filtered)
  getColumnTasks: async (
    columnId: string,
    params?: ColumnTasksParams,
  ): Promise<ApiResponse<PaginatedTasksResponse>> => {
    const response = await apiClient.get<ApiResponse<PaginatedTasksResponse>>(
      `/columns/${columnId}/tasks`,
      { params },
    );
    return response.data;
  },

  // 3. Get single task details (supports UUID or key like SYNC-14)
  getTask: async (taskIdOrKey: string): Promise<ApiResponse<Task>> => {
    const response = await apiClient.get<ApiResponse<Task>>(`/tasks/${taskIdOrKey}`);
    return response.data;
  },

  // 4. Update task properties
  updateTask: async (
    taskId: string,
    data: UpdateTaskRequest,
  ): Promise<ApiResponse<Task>> => {
    const response = await apiClient.patch<ApiResponse<Task>>(`/tasks/${taskId}`, data);
    return response.data;
  },

  // 5. Move task across columns or reorder within column
  moveTask: async (
    taskId: string,
    data: MoveTaskRequest,
  ): Promise<ApiResponse<Task>> => {
    const response = await apiClient.post<ApiResponse<Task>>(
      `/tasks/${taskId}/move`,
      data,
    );
    return response.data;
  },

  // 6. Delete task (soft-delete)
  deleteTask: async (taskId: string): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(`/tasks/${taskId}`);
    return response.data;
  },

  // 7. Personal workspace inbox: "My Tasks"
  getMyTasks: async (
    workspaceId: string,
    params?: MyTasksParams,
  ): Promise<ApiResponse<MyTasksResponse>> => {
    const response = await apiClient.get<ApiResponse<MyTasksResponse>>(
      `/workspaces/${workspaceId}/my-tasks`,
      { params },
    );
    return response.data;
  },

  // 8. Bulk update multiple tasks
  bulkUpdateTasks: async (
    data: BulkUpdateTasksRequest,
    workspaceId?: string,
  ): Promise<ApiResponse<{ updatedCount: number; tasks: Task[] }>> => {
    const url = workspaceId
      ? `/workspaces/${workspaceId}/tasks/bulk-update`
      : `/tasks/bulk-update`;
    const response = await apiClient.post<
      ApiResponse<{ updatedCount: number; tasks: Task[] }>
    >(url, data);
    return response.data;
  },

  // 9. Bulk delete multiple tasks
  bulkDeleteTasks: async (
    data: BulkDeleteTasksRequest,
  ): Promise<ApiResponse<{ deletedCount: number; taskIds: string[] }>> => {
    const response = await apiClient.post<
      ApiResponse<{ deletedCount: number; taskIds: string[] }>
    >(`/tasks/bulk-delete`, data);
    return response.data;
  },

  // 10. Get task checklist items
  getChecklists: async (
    taskId: string,
  ): Promise<ApiResponse<TaskChecklistItem[]>> => {
    const response = await apiClient.get<ApiResponse<TaskChecklistItem[]>>(
      `/tasks/${taskId}/checklists`,
    );
    return response.data;
  },

  // 11. Add checklist item
  addChecklistItem: async (
    taskId: string,
    data: CreateChecklistItemRequest,
  ): Promise<ApiResponse<TaskChecklistItem>> => {
    const response = await apiClient.post<ApiResponse<TaskChecklistItem>>(
      `/tasks/${taskId}/checklists`,
      data,
    );
    return response.data;
  },

  // 12. Update checklist item
  updateChecklistItem: async (
    taskId: string,
    itemId: string,
    data: UpdateChecklistItemRequest,
  ): Promise<ApiResponse<TaskChecklistItem>> => {
    const response = await apiClient.patch<ApiResponse<TaskChecklistItem>>(
      `/tasks/${taskId}/checklists/${itemId}`,
      data,
    );
    return response.data;
  },

  // 13. Toggle checklist item completion
  toggleChecklistItem: async (
    taskId: string,
    itemId: string,
  ): Promise<ApiResponse<TaskChecklistItem>> => {
    const response = await apiClient.patch<ApiResponse<TaskChecklistItem>>(
      `/tasks/${taskId}/checklists/${itemId}/toggle`,
      {},
    );
    return response.data;
  },

  // 14. Delete checklist item
  deleteChecklistItem: async (
    taskId: string,
    itemId: string,
  ): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/tasks/${taskId}/checklists/${itemId}`,
    );
    return response.data;
  },

  // 15. Upload file attachment (Cloudinary)
  uploadAttachment: async (
    taskId: string,
    file: File,
  ): Promise<ApiResponse<TaskAttachment>> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<ApiResponse<TaskAttachment>>(
      `/tasks/${taskId}/attachments`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return response.data;
  },

  // 16. List file attachments
  getAttachments: async (
    taskId: string,
  ): Promise<ApiResponse<TaskAttachment[]>> => {
    const response = await apiClient.get<ApiResponse<TaskAttachment[]>>(
      `/tasks/${taskId}/attachments`,
    );
    return response.data;
  },

  // 17. Delete file attachment
  deleteAttachment: async (
    taskId: string,
    attachmentId: string,
  ): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/tasks/${taskId}/attachments/${attachmentId}`,
    );
    return response.data;
  },

  // 18. Create external resource link
  createLink: async (
    taskId: string,
    data: CreateTaskLinkRequest,
  ): Promise<ApiResponse<TaskLink>> => {
    const response = await apiClient.post<ApiResponse<TaskLink>>(
      `/tasks/${taskId}/links`,
      data,
    );
    return response.data;
  },

  // 19. List external links
  getLinks: async (taskId: string): Promise<ApiResponse<TaskLink[]>> => {
    const response = await apiClient.get<ApiResponse<TaskLink[]>>(
      `/tasks/${taskId}/links`,
    );
    return response.data;
  },

  // 20. Get single external link
  getLink: async (
    taskId: string,
    linkId: string,
  ): Promise<ApiResponse<TaskLink>> => {
    const response = await apiClient.get<ApiResponse<TaskLink>>(
      `/tasks/${taskId}/links/${linkId}`,
    );
    return response.data;
  },

  // 21. Update external link
  updateLink: async (
    taskId: string,
    linkId: string,
    data: UpdateTaskLinkRequest,
  ): Promise<ApiResponse<TaskLink>> => {
    const response = await apiClient.patch<ApiResponse<TaskLink>>(
      `/tasks/${taskId}/links/${linkId}`,
      data,
    );
    return response.data;
  },

  // 22. Delete external link
  deleteLink: async (
    taskId: string,
    linkId: string,
  ): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/tasks/${taskId}/links/${linkId}`,
    );
    return response.data;
  },
};
