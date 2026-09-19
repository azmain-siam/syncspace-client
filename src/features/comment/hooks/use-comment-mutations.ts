import {
  useMutation,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { formatApiErrorMessage } from '@/lib/api/api-error';
import type { ApiResponse } from '@/types/domain';
import { useAuthStore } from '@/features/auth/stores/use-auth-store';
import { commentApi } from '../api/comment.api';
import type {
  PaginatedCommentsResponse,
  AggregatedReaction,
  UserMinimal,
} from '../types/comment.types';

type CommentsInfiniteData = InfiniteData<ApiResponse<PaginatedCommentsResponse>>;

/**
 * Hook to create a comment with cache invalidation
 */
export function useCreateComment(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: string) => {
      return commentApi.createComment(taskId, { content });
    },
    onSuccess: () => {
      // Invalidate comments for this task
      queryClient.invalidateQueries({ queryKey: ['task-comments', taskId] });
      // Invalidate task details to update comment count badge
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Comment added');
    },
    onError: (error) => {
      toast.error(formatApiErrorMessage(error, 'Failed to add comment'));
    },
  });
}

/**
 * Hook to update a comment
 */
export function useUpdateComment(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      commentId,
      content,
    }: {
      commentId: string;
      content: string;
    }) => {
      return commentApi.updateComment(taskId, commentId, { content });
    },
    onSuccess: (res, { commentId, content }) => {
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
                  comment.id === commentId
                    ? {
                        ...comment,
                        content: res.data?.content || content,
                        isEdited: true,
                        editedAt: res.data?.editedAt || new Date().toISOString(),
                      }
                    : comment,
                ),
              },
            })),
          };
        },
      );
      queryClient.invalidateQueries({ queryKey: ['task-comments', taskId] });
      toast.success('Comment updated');
    },
    onError: (error) => {
      toast.error(formatApiErrorMessage(error, 'Failed to update comment'));
    },
  });
}

/**
 * Hook to soft-delete a comment
 */
export function useDeleteComment(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId: string) => {
      return commentApi.deleteComment(taskId, commentId);
    },
    onSuccess: (_res, commentId) => {
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
                comments: page.data.comments.filter((c) => c.id !== commentId),
              },
            })),
          };
        },
      );
      queryClient.invalidateQueries({ queryKey: ['task-comments', taskId] });
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Comment deleted');
    },
    onError: (error) => {
      toast.error(formatApiErrorMessage(error, 'Failed to delete comment'));
    },
  });
}

/**
 * Hook to toggle emoji reactions with optimistic updates and rollback
 */
export function useToggleReaction(taskId: string) {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: async ({
      commentId,
      emoji,
    }: {
      commentId: string;
      emoji: string;
    }) => {
      return commentApi.toggleReaction(taskId, commentId, { emoji });
    },
    onMutate: async ({ commentId, emoji }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['task-comments', taskId] });

      const previousData = queryClient.getQueryData<CommentsInfiniteData>([
        'task-comments',
        taskId,
      ]);

      if (!previousData || !currentUser) {
        return { previousData };
      }

      const minimalUser: UserMinimal = {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        avatar: currentUser.avatar,
      };

      // Optimistically update reactions
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
                comments: page.data.comments.map((comment) => {
                  if (comment.id !== commentId) return comment;

                  const existingReactions = comment.reactions || [];
                  const existingReaction = existingReactions.find(
                    (r) => r.emoji === emoji,
                  );

                  let updatedReactions: AggregatedReaction[];

                  if (existingReaction) {
                    if (existingReaction.hasReacted) {
                      // Remove user reaction
                      const nextCount = existingReaction.count - 1;
                      if (nextCount <= 0) {
                        updatedReactions = existingReactions.filter(
                          (r) => r.emoji !== emoji,
                        );
                      } else {
                        updatedReactions = existingReactions.map((r) =>
                          r.emoji === emoji
                            ? {
                                ...r,
                                count: nextCount,
                                hasReacted: false,
                                users: r.users.filter((u) => u.id !== currentUser.id),
                              }
                            : r,
                        );
                      }
                    } else {
                      // Add user reaction to existing emoji
                      updatedReactions = existingReactions.map((r) =>
                        r.emoji === emoji
                          ? {
                              ...r,
                              count: r.count + 1,
                              hasReacted: true,
                              users: [...r.users, minimalUser],
                            }
                          : r,
                      );
                    }
                  } else {
                    // New reaction emoji
                    updatedReactions = [
                      ...existingReactions,
                      {
                        emoji,
                        count: 1,
                        hasReacted: true,
                        users: [minimalUser],
                      },
                    ];
                  }

                  return {
                    ...comment,
                    reactions: updatedReactions,
                  };
                }),
              },
            })),
          };
        },
      );

      return { previousData };
    },
    onError: (error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          ['task-comments', taskId],
          context.previousData,
        );
      }
      toast.error(formatApiErrorMessage(error, 'Failed to update reaction'));
    },
    onSuccess: (res, { commentId }) => {
      // Reconcile with authoritative server reactions payload
      if (res.data?.reactions) {
        const serverReactions = res.data.reactions;
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
                    comment.id === commentId
                      ? { ...comment, reactions: serverReactions }
                      : comment,
                  ),
                },
              })),
            };
          },
        );
      }
    },
  });
}
