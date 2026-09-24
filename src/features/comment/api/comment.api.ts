import { apiClient } from '@/lib/api/api-client';
import type { ApiResponse } from '@/types/domain';
import type {
  Comment,
  PaginatedCommentsResponse,
  AggregatedReaction,
  ToggleReactionResponse,
  CreateCommentRequest,
  UpdateCommentRequest,
  ToggleReactionRequest,
} from '../types/comment.types';

export const commentApi = {
  // 1. Get task comments with cursor pagination
  getTaskComments: async (
    taskId: string,
    params?: { cursor?: string; limit?: number },
  ): Promise<ApiResponse<PaginatedCommentsResponse>> => {
    const response = await apiClient.get<ApiResponse<PaginatedCommentsResponse>>(
      `/tasks/${taskId}/comments`,
      { params },
    );
    return response.data;
  },

  // 2. Get single comment details
  getComment: async (
    taskId: string,
    commentId: string,
  ): Promise<ApiResponse<Comment>> => {
    const response = await apiClient.get<ApiResponse<Comment>>(
      `/tasks/${taskId}/comments/${commentId}`,
    );
    return response.data;
  },

  // 3. Create a comment with optional @mentions
  createComment: async (
    taskId: string,
    data: CreateCommentRequest,
  ): Promise<ApiResponse<Comment>> => {
    const response = await apiClient.post<ApiResponse<Comment>>(
      `/tasks/${taskId}/comments`,
      data,
    );
    return response.data;
  },

  // 4. Update comment content (author only)
  updateComment: async (
    taskId: string,
    commentId: string,
    data: UpdateCommentRequest,
  ): Promise<ApiResponse<Comment>> => {
    const response = await apiClient.patch<ApiResponse<Comment>>(
      `/tasks/${taskId}/comments/${commentId}`,
      data,
    );
    return response.data;
  },

  // 5. Soft-delete comment (author or workspace OWNER/ADMIN)
  deleteComment: async (
    taskId: string,
    commentId: string,
  ): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/tasks/${taskId}/comments/${commentId}`,
    );
    return response.data;
  },

  // 6. Toggle emoji reaction
  toggleReaction: async (
    taskId: string,
    commentId: string,
    data: ToggleReactionRequest,
  ): Promise<ApiResponse<ToggleReactionResponse>> => {
    const response = await apiClient.post<ApiResponse<ToggleReactionResponse>>(
      `/tasks/${taskId}/comments/${commentId}/reactions`,
      data,
    );
    return response.data;
  },

  // 7. Get aggregated reactions for a comment
  getReactions: async (
    taskId: string,
    commentId: string,
  ): Promise<ApiResponse<AggregatedReaction[]>> => {
    const response = await apiClient.get<ApiResponse<AggregatedReaction[]>>(
      `/tasks/${taskId}/comments/${commentId}/reactions`,
    );
    return response.data;
  },
};
