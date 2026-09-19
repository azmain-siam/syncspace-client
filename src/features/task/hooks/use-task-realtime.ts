'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from '@/providers/socket-provider';

/**
 * Hook to subscribe to a Task room (task:<taskId>) via Socket.IO
 * Synchronizes task details, comments, and reactions live across users.
 */
export function useTaskRealtime(taskId?: string | null) {
  const { socket, isConnected } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket || !isConnected || !taskId) return;

    // Join task room
    socket.emit('room:join', {
      roomType: 'task',
      targetId: taskId,
    });

    const handleTaskChange = () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      queryClient.invalidateQueries({ queryKey: ['columns'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    };

    const handleCommentsChange = () => {
      queryClient.invalidateQueries({ queryKey: ['task-comments', taskId] });
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    };

    socket.on('task:updated', handleTaskChange);
    socket.on('comment:created', handleCommentsChange);
    socket.on('comment:updated', handleCommentsChange);
    socket.on('comment:deleted', handleCommentsChange);
    socket.on('comment:reaction', handleCommentsChange);

    return () => {
      socket.emit('room:leave', {
        roomType: 'task',
        targetId: taskId,
      });
      socket.off('task:updated', handleTaskChange);
      socket.off('comment:created', handleCommentsChange);
      socket.off('comment:updated', handleCommentsChange);
      socket.off('comment:deleted', handleCommentsChange);
      socket.off('comment:reaction', handleCommentsChange);
    };
  }, [socket, isConnected, taskId, queryClient]);
}
