import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import type { ApiResponse } from '@/types/domain';
import { taskApi } from '../api/task.api';
import type { TaskAttachment } from '../types/task.types';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

// 1. Get task attachments
export function useAttachments(taskId?: string) {
  return useQuery({
    queryKey: ['tasks', taskId, 'attachments'],
    queryFn: async () => {
      if (!taskId) throw new Error('Task ID is required');
      return taskApi.getAttachments(taskId);
    },
    enabled: Boolean(taskId),
  });
}

// 2. Upload file attachment (Cloudinary)
export function useUploadAttachment(
  taskId: string,
  onSuccessCallback?: (attachment: TaskAttachment) => void,
) {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<TaskAttachment>,
    AxiosError<ApiResponse<unknown>>,
    File
  >({
    mutationFn: async (file: File) => {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        throw new Error(
          `File size exceeds 10MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB). Please choose a smaller file.`,
        );
      }
      return taskApi.uploadAttachment(taskId, file);
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId, 'attachments'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] });
      toast.success(response.message || 'File uploaded successfully');
      if (onSuccessCallback && response.data) {
        onSuccessCallback(response.data);
      }
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error && !('response' in error)
          ? error.message
          : (error as AxiosError<ApiResponse<unknown>>).response?.data?.message ||
            'Failed to upload attachment.';
      toast.error(errorMessage);
    },
  });
}

// 3. Delete file attachment
export function useDeleteAttachment(
  taskId: string,
  onSuccessCallback?: () => void,
) {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<null>,
    AxiosError<ApiResponse<unknown>>,
    string // attachmentId
  >({
    mutationFn: (attachmentId: string) =>
      taskApi.deleteAttachment(taskId, attachmentId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId, 'attachments'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] });
      toast.success(response.message || 'Attachment deleted');
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || 'Failed to delete attachment.';
      toast.error(errorMessage);
    },
  });
}
