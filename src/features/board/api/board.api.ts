import { apiClient } from '@/lib/api/api-client';
import type { ApiResponse } from '@/types/domain';
import type {
  Board,
  BoardColumn,
  CreateBoardRequest,
  UpdateBoardRequest,
  CreateColumnRequest,
  UpdateColumnRequest,
  ReorderColumnsRequest,
} from '../types/board.types';

export const boardApi = {
  // 1. List all boards in project
  getProjectBoards: async (
    workspaceId: string,
    projectId: string,
  ): Promise<ApiResponse<Board[]>> => {
    const response = await apiClient.get<ApiResponse<Board[]>>(
      `/workspaces/${workspaceId}/projects/${projectId}/boards`,
    );
    return response.data;
  },

  // 2. Create board
  createBoard: async (
    workspaceId: string,
    projectId: string,
    data: CreateBoardRequest,
  ): Promise<ApiResponse<Board>> => {
    const response = await apiClient.post<ApiResponse<Board>>(
      `/workspaces/${workspaceId}/projects/${projectId}/boards`,
      data,
    );
    return response.data;
  },

  // 3. Get single board
  getBoard: async (
    workspaceId: string,
    projectId: string,
    boardId: string,
  ): Promise<ApiResponse<Board>> => {
    const response = await apiClient.get<ApiResponse<Board>>(
      `/workspaces/${workspaceId}/projects/${projectId}/boards/${boardId}`,
    );
    return response.data;
  },

  // 4. Update board title
  updateBoard: async (
    workspaceId: string,
    projectId: string,
    boardId: string,
    data: UpdateBoardRequest,
  ): Promise<ApiResponse<Board>> => {
    const response = await apiClient.patch<ApiResponse<Board>>(
      `/workspaces/${workspaceId}/projects/${projectId}/boards/${boardId}`,
      data,
    );
    return response.data;
  },

  // 5. Delete board
  deleteBoard: async (
    workspaceId: string,
    projectId: string,
    boardId: string,
  ): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/workspaces/${workspaceId}/projects/${projectId}/boards/${boardId}`,
    );
    return response.data;
  },

  // 6. List columns in board
  getBoardColumns: async (
    workspaceId: string,
    projectId: string,
    boardId: string,
  ): Promise<ApiResponse<BoardColumn[]>> => {
    const response = await apiClient.get<ApiResponse<BoardColumn[]>>(
      `/workspaces/${workspaceId}/projects/${projectId}/boards/${boardId}/columns`,
    );
    return response.data;
  },

  // 7. Create column
  createColumn: async (
    workspaceId: string,
    projectId: string,
    boardId: string,
    data: CreateColumnRequest,
  ): Promise<ApiResponse<BoardColumn>> => {
    const response = await apiClient.post<ApiResponse<BoardColumn>>(
      `/workspaces/${workspaceId}/projects/${projectId}/boards/${boardId}/columns`,
      data,
    );
    return response.data;
  },

  // 8. Update column title
  updateColumn: async (
    workspaceId: string,
    projectId: string,
    boardId: string,
    columnId: string,
    data: UpdateColumnRequest,
  ): Promise<ApiResponse<BoardColumn>> => {
    const response = await apiClient.patch<ApiResponse<BoardColumn>>(
      `/workspaces/${workspaceId}/projects/${projectId}/boards/${boardId}/columns/${columnId}`,
      data,
    );
    return response.data;
  },

  // 9. Reorder columns (batch drag-and-drop)
  reorderColumns: async (
    workspaceId: string,
    projectId: string,
    boardId: string,
    data: ReorderColumnsRequest,
  ): Promise<ApiResponse<BoardColumn[]>> => {
    const response = await apiClient.patch<ApiResponse<BoardColumn[]>>(
      `/workspaces/${workspaceId}/projects/${projectId}/boards/${boardId}/columns/reorder`,
      data,
    );
    return response.data;
  },

  // 10. Delete column
  deleteColumn: async (
    workspaceId: string,
    projectId: string,
    boardId: string,
    columnId: string,
  ): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/workspaces/${workspaceId}/projects/${projectId}/boards/${boardId}/columns/${columnId}`,
    );
    return response.data;
  },
};
