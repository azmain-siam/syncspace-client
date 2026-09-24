import * as React from 'react';
import { useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { useSocket } from '@/providers/socket-provider';
import type { ApiResponse } from '@/types/domain';
import type {
  PaginatedCommentsResponse,
  CommentSocketCreatedPayload,
  CommentSocketUpdatedPayload,
  CommentSocketDeletedPayload,
  CommentSocketReactionUpdatedPayload,
} from '../types/comment.types';

type CommentsInfiniteData = InfiniteData<ApiResponse<PaginatedCommentsResponse>>;

/**
 * Hook to subscribe to real-time comment and reaction events via Socket.IO
 */
export function useCommentSocket(taskId?: string | null) {
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  React.useEffect(() => {
    if (!taskId || !socket) return;

    // Join task room if backend supports it
    socket.emit('join:task', taskId);
    socket.emit('task:join', taskId);

    const handleCreated = (payload: CommentSocketCreatedPayload) => {
      if (payload?.taskId === taskId) {
        queryClient.invalidateQueries({ queryKey: ['task-comments', taskId] });
        queryClient.invalidateQueries({ queryKey: ['task', taskId] });
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
      }
    };

    const handleUpdated = (payload: CommentSocketUpdatedPayload) => {
      if (payload?.taskId === taskId) {
        queryClient.invalidateQueries({ queryKey: ['task-comments', taskId] });
      }
    };

    const handleDeleted = (payload: CommentSocketDeletedPayload) => {
      if (payload?.taskId === taskId) {
        queryClient.setQueryData<CommentsInfiniteData>(
          ['task-comments', taskId],
          (oldData) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                data: {
                  ...page.data,
                  comments: page.data.comments.filter(
                    (c) => c.id !== payload.commentId,
                  ),
                },
              })),
            };
          },
        );
        queryClient.invalidateQueries({ queryKey: ['task-comments', taskId] });
        queryClient.invalidateQueries({ queryKey: ['task', taskId] });
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
      }
    };

    const handleReactionUpdated = (
      payload: CommentSocketReactionUpdatedPayload,
    ) => {
      if (!payload?.commentId) return;
      if (payload.taskId && payload.taskId !== taskId) return;

      queryClient.setQueryData<CommentsInfiniteData>(
        ['task-comments', taskId],
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              data: {
                ...page.data,
                comments: page.data.comments.map((comment) =>
                  comment.id === payload.commentId
                    ? { ...comment, reactions: payload.reactions }
                    : comment,
                ),
              },
            })),
          };
        },
      );
    };

    socket.on('comment.created', handleCreated);
    socket.on('comment:created', handleCreated);
    socket.on('comment.updated', handleUpdated);
    socket.on('comment:updated', handleUpdated);
    socket.on('comment.deleted', handleDeleted);
    socket.on('comment:deleted', handleDeleted);
    socket.on('comment.reaction_updated', handleReactionUpdated);
    socket.on('comment:reaction_updated', handleReactionUpdated);

    return () => {
      socket.emit('leave:task', taskId);
      socket.emit('task:leave', taskId);
      socket.off('comment.created', handleCreated);
      socket.off('comment:created', handleCreated);
      socket.off('comment.updated', handleUpdated);
      socket.off('comment:updated', handleUpdated);
      socket.off('comment.deleted', handleDeleted);
      socket.off('comment:deleted', handleDeleted);
      socket.off('comment.reaction_updated', handleReactionUpdated);
      socket.off('comment:reaction_updated', handleReactionUpdated);
    };
  }, [taskId, queryClient, socket]);
}
