'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import type { ApiResponse } from '@/types/domain';
import { safetyApi } from '../api/safety.api';
import { safetyKeys } from './safety-keys';
import type {
  PaginatedTrashResponse,
  TrashQueryParams,
  RestoreTrashItemPayload,
  EmptyTrashQueryParams,
} from '../types/safety.types';

/**
 * Hook to query soft-deleted tasks & projects in the workspace trash bin
 */
export function useTrashItems(
  workspaceId: string,
  params?: TrashQueryParams,
) {
  return useQuery<PaginatedTrashResponse>({
    queryKey: safetyKeys.trash(workspaceId, params),
    queryFn: async () => {
      const res = await safetyApi.getTrashItems(workspaceId, params);
      return res.data;
    },
    enabled: Boolean(workspaceId),
    staleTime: 10 * 1000,
  });
}

/**
 * Mutation to restore a soft-deleted item from trash
 */
export function useRestoreTrashItem(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RestoreTrashItemPayload) => {
      const res = await safetyApi.restoreTrashItem(workspaceId, data);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Item restored successfully');
      queryClient.invalidateQueries({ queryKey: ['safety', 'trash', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['board'] });
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
      queryClient.invalidateQueries({ queryKey: ['safety', 'workspace-activities', workspaceId] });
    },
    onError: (error: AxiosError<ApiResponse<unknown>>) => {
      const message =
        (error.response?.data?.message as string) ||
        error.message ||
        'Failed to restore item from trash';
      toast.error(message);
    },
  });
}

/**
 * Mutation to permanently purge items from the trash bin
 */
export function useEmptyTrash(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params?: EmptyTrashQueryParams) => {
      const res = await safetyApi.emptyTrash(workspaceId, params);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Trash emptied successfully');
      queryClient.invalidateQueries({ queryKey: ['safety', 'trash', workspaceId] });
    },
    onError: (error: AxiosError<ApiResponse<unknown>>) => {
      const message =
        (error.response?.data?.message as string) ||
        error.message ||
        'Failed to empty trash';
      toast.error(message);
    },
  });
}
