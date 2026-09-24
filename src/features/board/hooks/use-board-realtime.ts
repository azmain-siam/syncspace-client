'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from '@/providers/socket-provider';

interface UseBoardRealtimeOptions {
  workspaceId?: string;
  projectId?: string;
}

/**
 * Hook to subscribe to a Kanban board room (board:<boardId>) via Socket.IO
 * Automatically invalidates board columns and tasks when other users create, move, update, or delete tasks.
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

    const handleBoardUpdate = () => {
      // Invalidate column tasks
      queryClient.invalidateQueries({ queryKey: ['columns'] });
      // Invalidate board queries
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
      if (workspaceId && projectId) {
        queryClient.invalidateQueries({
          queryKey: ['workspaces', workspaceId, 'projects', projectId, 'boards'],
        });
      }
      // Invalidate general tasks queries
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    };

    socket.on('task:created', handleBoardUpdate);
    socket.on('task:moved', handleBoardUpdate);
    socket.on('task:updated', handleBoardUpdate);
    socket.on('task:deleted', handleBoardUpdate);

    return () => {
      socket.emit('room:leave', {
        roomType: 'board',
        targetId: boardId,
      });
      socket.off('task:created', handleBoardUpdate);
      socket.off('task:moved', handleBoardUpdate);
      socket.off('task:updated', handleBoardUpdate);
      socket.off('task:deleted', handleBoardUpdate);
    };
  }, [socket, isConnected, boardId, workspaceId, projectId, queryClient]);
}
