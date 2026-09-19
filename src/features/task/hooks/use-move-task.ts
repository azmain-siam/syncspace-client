import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import type { ApiResponse, Board, Task as DomainTask } from '@/types/domain';
import { taskApi } from '../api/task.api';
import type { PaginatedTasksResponse, Task, TaskStatus } from '../types/task.types';

interface MoveTaskVariables {
  taskId: string;
  targetColumnId: string;
  targetOrder: number;
  status?: TaskStatus;
}

interface MoveTaskContext {
  previousBoard?: ApiResponse<Board>;
  previousColumnQueries?: [readonly unknown[], unknown][];
}

export function useMoveTask(
  workspaceId: string,
  projectId: string,
  boardId: string,
) {
  const queryClient = useQueryClient();
  const boardQueryKey = [
    'workspaces',
    workspaceId,
    'projects',
    projectId,
    'boards',
    boardId,
  ];

  return useMutation<
    ApiResponse<Task>,
    AxiosError<ApiResponse<unknown>>,
    MoveTaskVariables,
    MoveTaskContext
  >({
    mutationFn: ({ taskId, targetColumnId, targetOrder, status }) =>
      taskApi.moveTask(taskId, { targetColumnId, targetOrder, status }),

    onMutate: async ({ taskId, targetColumnId, targetOrder, status }) => {
      // 1. Cancel in-flight queries
      await queryClient.cancelQueries({ queryKey: boardQueryKey });
      await queryClient.cancelQueries({ queryKey: ['columns'] });

      // 2. Snapshot current board & column tasks
      const previousBoard =
        queryClient.getQueryData<ApiResponse<Board>>(boardQueryKey);

      const columnQueries = queryClient.getQueriesData<ApiResponse<PaginatedTasksResponse>>({
        queryKey: ['columns'],
      });
      const previousColumnQueries = columnQueries.map(([key, data]) => [key, data] as [readonly unknown[], unknown]);

      // 3. Find moving task in column queries or board details
      let movingTask: Task | null = null;
      for (const [, queryData] of columnQueries) {
        const found = queryData?.data?.tasks?.find((t) => t.id === taskId);
        if (found) {
          movingTask = found;
          break;
        }
      }

      if (!movingTask && previousBoard?.data?.columns) {
        for (const col of previousBoard.data.columns) {
          const found = col.tasks?.find((t) => t.id === taskId);
          if (found) {
            movingTask = found as unknown as Task;
            break;
          }
        }
      }

      if (movingTask) {
        const updatedTask: Task = {
          ...movingTask,
          columnId: targetColumnId,
          order: targetOrder,
          status: status || movingTask.status,
        };

        // 4. Optimistically update all column queries
        columnQueries.forEach(([queryKey, queryData]) => {
          if (!queryData?.data?.tasks) return;
          const colId = queryKey[1] as string;

          // Remove moving task from all columns
          let updatedTasks = queryData.data.tasks.filter((t) => t.id !== taskId);

          // If this is target column, insert moving task
          if (colId === targetColumnId) {
            const insertIndex = Math.min(Math.max(0, targetOrder), updatedTasks.length);
            updatedTasks.splice(insertIndex, 0, updatedTask);
            updatedTasks = updatedTasks.map((t, idx) => ({ ...t, order: idx }));
          }

          queryClient.setQueryData(queryKey, {
            ...queryData,
            data: {
              ...queryData.data,
              tasks: updatedTasks,
              meta: {
                ...queryData.data.meta,
                total: updatedTasks.length,
              },
            },
          });
        });

        // 5. Also update board query data if columns have tasks embedded
        if (previousBoard?.data?.columns) {
          const updatedColumns = previousBoard.data.columns.map((col) => {
            const filteredTasks = (col.tasks || []).filter((t) => t.id !== taskId);
            if (col.id === targetColumnId) {
              const newTasks = [...filteredTasks];
              const insertIndex = Math.min(Math.max(0, targetOrder), newTasks.length);
              newTasks.splice(insertIndex, 0, updatedTask as unknown as DomainTask);
              return {
                ...col,
                tasks: newTasks.map((t, idx) => ({ ...t, order: idx })),
              };
            }
            return { ...col, tasks: filteredTasks };
          });

          queryClient.setQueryData<ApiResponse<Board>>(boardQueryKey, {
            ...previousBoard,
            data: {
              ...previousBoard.data,
              columns: updatedColumns,
            },
          });
        }
      }

      return { previousBoard, previousColumnQueries };
    },

    onError: (error, _variables, context) => {
      // Revert to snapshot on error
      if (context?.previousBoard) {
        queryClient.setQueryData(boardQueryKey, context.previousBoard);
      }
      if (context?.previousColumnQueries) {
        context.previousColumnQueries.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
      const errorMessage =
        error.response?.data?.message || 'Failed to move task. Reverting to original state.';
      toast.error(errorMessage);
    },

    onSettled: () => {
      // Always re-sync with server
      queryClient.invalidateQueries({ queryKey: ['columns'] });
      queryClient.invalidateQueries({ queryKey: boardQueryKey });
      queryClient.invalidateQueries({
        queryKey: ['workspaces', workspaceId, 'my-tasks'],
      });
    },
  });
}
