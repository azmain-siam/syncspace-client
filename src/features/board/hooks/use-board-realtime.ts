'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from '@/providers/socket-provider';
import { taskKeys, columnKeys } from '@/features/task/hooks/task-keys';

interface UseBoardRealtimeOptions {
  workspaceId?: string;
  projectId?: string;
}

/**
 * Hook to subscribe to a Kanban board room (board:<boardId>) via Socket.IO.
 * Applies targeted query invalidation instead of broad full-cache invalidations,
 * preventing refetch storms across clients.
 */
export function useBoardRealtime(
  boardId?: string | null,
  options?: UseBoardRealtimeOptions,
) {
  const { socket, isConnected } = useSocket();
  const queryClient = useQueryClient();
  const { workspaceId, projectId } = options || {};

  useEffect(() => {
    if (!socket || !isConnected || !boardId) return;

    // Join board room
    socket.emit('room:join', {
      roomType: 'board',
      targetId: boardId,
    });

    const handleTaskCreated = (payload?: {
      task?: { id?: string; columnId?: string };
      boardId?: string;
    }) => {
      if (payload?.boardId && payload.boardId !== boardId) return;
      if (payload?.task?.columnId) {
        queryClient.invalidateQueries({
          queryKey: columnKeys.columnTasks(payload.task.columnId),
        });
      } else {
        queryClient.invalidateQueries({ queryKey: columnKeys.all });
      }
    };

    const handleTaskMoved = (payload?: {
      taskId?: string;
      sourceColumnId?: string;
      destinationColumnId?: string;
      boardId?: string;
    }) => {
      if (payload?.boardId && payload.boardId !== boardId) return;
      if (payload?.sourceColumnId) {
        queryClient.invalidateQueries({
          queryKey: columnKeys.columnTasks(payload.sourceColumnId),
        });
      }
      if (payload?.destinationColumnId) {
        queryClient.invalidateQueries({
          queryKey: columnKeys.columnTasks(payload.destinationColumnId),
        });
      }
      if (payload?.taskId) {
        queryClient.invalidateQueries({
          queryKey: taskKeys.detail(payload.taskId),
        });
      }
      if (!payload?.sourceColumnId && !payload?.destinationColumnId) {
        queryClient.invalidateQueries({ queryKey: columnKeys.all });
      }
    };

    const handleTaskUpdated = (payload?: {
      taskId?: string;
      task?: { id?: string; columnId?: string };
      boardId?: string;
    }) => {
      if (payload?.boardId && payload.boardId !== boardId) return;
      const tId = payload?.taskId || payload?.task?.id;
      if (tId) {
        queryClient.invalidateQueries({ queryKey: taskKeys.detail(tId) });
      }
      if (payload?.task?.columnId) {
        queryClient.invalidateQueries({
          queryKey: columnKeys.columnTasks(payload.task.columnId),
        });
      }
    };

    const handleTaskDeleted = (payload?: {
      taskId?: string;
      columnId?: string;
      boardId?: string;
    }) => {
      if (payload?.boardId && payload.boardId !== boardId) return;
      if (payload?.taskId) {
        queryClient.removeQueries({ queryKey: taskKeys.detail(payload.taskId) });
      }
      if (payload?.columnId) {
        queryClient.invalidateQueries({
          queryKey: columnKeys.columnTasks(payload.columnId),
        });
      } else {
        queryClient.invalidateQueries({ queryKey: columnKeys.all });
      }
    };

    socket.on('task:created', handleTaskCreated);
    socket.on('task:moved', handleTaskMoved);
    socket.on('task:updated', handleTaskUpdated);
    socket.on('task:deleted', handleTaskDeleted);

    return () => {
      socket.emit('room:leave', {
        roomType: 'board',
        targetId: boardId,
      });
      socket.off('task:created', handleTaskCreated);
      socket.off('task:moved', handleTaskMoved);
      socket.off('task:updated', handleTaskUpdated);
      socket.off('task:deleted', handleTaskDeleted);
    };
  }, [socket, isConnected, boardId, workspaceId, projectId, queryClient]);
}
