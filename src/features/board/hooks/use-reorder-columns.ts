import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import { formatApiErrorMessage } from '@/lib/api/api-error';
import type { ApiResponse } from '@/types/domain';
import { boardApi } from '../api/board.api';
import type { Board, BoardColumn, ReorderColumnsRequest } from '../types/board.types';

interface MutationContext {
  previousColumns?: ApiResponse<BoardColumn[]>;
  previousBoard?: ApiResponse<Board>;
}

export function useReorderColumns(
  workspaceId: string,
  projectId: string,
  boardId: string,
) {
  const queryClient = useQueryClient();
  const columnsQueryKey = [
    'workspaces',
    workspaceId,
    'projects',
    projectId,
    'boards',
    boardId,
    'columns',
  ];
  const boardQueryKey = [
    'workspaces',
    workspaceId,
    'projects',
    projectId,
    'boards',
    boardId,
  ];

  return useMutation<
    ApiResponse<BoardColumn[]>,
    AxiosError<ApiResponse<unknown>>,
    ReorderColumnsRequest,
    MutationContext
  >({
    mutationFn: (data: ReorderColumnsRequest) =>
      boardApi.reorderColumns(workspaceId, projectId, boardId, data),

    onMutate: async (newOrderData) => {
      // 1. Cancel in-flight queries
      await queryClient.cancelQueries({ queryKey: columnsQueryKey });
      await queryClient.cancelQueries({ queryKey: boardQueryKey });

      // 2. Snapshot current state
      const previousColumns =
        queryClient.getQueryData<ApiResponse<BoardColumn[]>>(columnsQueryKey);
      const previousBoard =
        queryClient.getQueryData<ApiResponse<Board>>(boardQueryKey);

      // Create order lookup map
      const orderMap = new Map<string, number>();
      newOrderData.columnOrders.forEach((item) => {
        orderMap.set(item.id, item.order);
      });

      // 3. Optimistically update columns query cache
      if (previousColumns?.data) {
        const reordered = [...previousColumns.data]
          .map((col) => ({
            ...col,
            order: orderMap.has(col.id) ? (orderMap.get(col.id) as number) : col.order,
          }))
          .sort((a, b) => a.order - b.order);

        queryClient.setQueryData<ApiResponse<BoardColumn[]>>(columnsQueryKey, {
          ...previousColumns,
          data: reordered,
        });
      }

      // 4. Optimistically update board query cache (if columns embedded)
      if (previousBoard?.data?.columns) {
        const reordered = [...previousBoard.data.columns]
          .map((col) => ({
            ...col,
            order: orderMap.has(col.id) ? (orderMap.get(col.id) as number) : col.order,
          }))
          .sort((a, b) => a.order - b.order);

        queryClient.setQueryData<ApiResponse<Board>>(boardQueryKey, {
          ...previousBoard,
          data: {
            ...previousBoard.data,
            columns: reordered,
          },
        });
      }

      return { previousColumns, previousBoard };
    },

    onSuccess: (response) => {
      if (response?.data) {
        queryClient.setQueryData<ApiResponse<BoardColumn[]>>(columnsQueryKey, {
          success: true,
          statusCode: 200,
          message: 'Columns reordered successfully',
          data: response.data,
        });
      }
    },

    onError: (error, _variables, context) => {
      // Rollback on error
      if (context?.previousColumns) {
        queryClient.setQueryData(columnsQueryKey, context.previousColumns);
      }
      if (context?.previousBoard) {
        queryClient.setQueryData(boardQueryKey, context.previousBoard);
      }
      toast.error(
        formatApiErrorMessage(error, 'Failed to reorder columns. Reverting changes.'),
      );
    },

    onSettled: () => {
      // Re-fetch to guarantee sync with server
      queryClient.invalidateQueries({ queryKey: columnsQueryKey });
      queryClient.invalidateQueries({ queryKey: boardQueryKey });
    },
  });
}
