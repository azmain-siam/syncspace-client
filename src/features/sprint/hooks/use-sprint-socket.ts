import * as React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from '@/providers/socket-provider';

interface SprintSocketPayload {
  projectId?: string;
  sprintId?: string;
  taskId?: string;
}

/**
 * Hook to subscribe to real-time sprint lifecycle and task sprint movement events via Socket.IO
 */
export function useSprintSocket(projectId?: string | null) {
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  React.useEffect(() => {
    if (!projectId || !socket) return;

    // Join project room for project-level sprint updates
    socket.emit('join:project', projectId);
    socket.emit('project:join', projectId);

    const invalidateSprintData = (payload?: SprintSocketPayload) => {
      // Invalidate if event matches current project or is general
      if (!payload?.projectId || payload.projectId === projectId) {
        queryClient.invalidateQueries({ queryKey: ['project-sprints', projectId] });
        queryClient.invalidateQueries({ queryKey: ['project-backlog', projectId] });
        if (payload?.sprintId) {
          queryClient.invalidateQueries({ queryKey: ['sprint', payload.sprintId] });
        }
        if (payload?.taskId) {
          queryClient.invalidateQueries({ queryKey: ['tasks', payload.taskId] });
          queryClient.invalidateQueries({ queryKey: ['task', payload.taskId] });
        }
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
      }
    };

    socket.on('sprint.created', invalidateSprintData);
    socket.on('sprint:created', invalidateSprintData);
    socket.on('sprint.updated', invalidateSprintData);
    socket.on('sprint:updated', invalidateSprintData);
    socket.on('sprint.started', invalidateSprintData);
    socket.on('sprint:started', invalidateSprintData);
    socket.on('sprint.completed', invalidateSprintData);
    socket.on('sprint:completed', invalidateSprintData);
    socket.on('task.sprint_changed', invalidateSprintData);
    socket.on('task:sprint_changed', invalidateSprintData);

    return () => {
      socket.off('sprint.created', invalidateSprintData);
      socket.off('sprint:created', invalidateSprintData);
      socket.off('sprint.updated', invalidateSprintData);
      socket.off('sprint:updated', invalidateSprintData);
      socket.off('sprint.started', invalidateSprintData);
      socket.off('sprint:started', invalidateSprintData);
      socket.off('sprint.completed', invalidateSprintData);
      socket.off('sprint:completed', invalidateSprintData);
      socket.off('task.sprint_changed', invalidateSprintData);
      socket.off('task:sprint_changed', invalidateSprintData);
      socket.emit('leave:project', projectId);
      socket.emit('project:leave', projectId);
    };
  }, [projectId, queryClient, socket]);
}
