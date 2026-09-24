'use client';

import * as React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  useTaskComments,
  extractDeduplicatedComments,
} from '../hooks/use-task-comments';
import {
  useCreateComment,
  useUpdateComment,
  useDeleteComment,
  useToggleReaction,
} from '../hooks/use-comment-mutations';
import { useCommentSocket } from '../hooks/use-comment-socket';
import { CommentInput } from './comment-input';
import { CommentList } from './comment-list';

interface CommentThreadProps {
  taskId: string;
  workspaceId: string;
  className?: string;
}

export function CommentThread({
  taskId,
  workspaceId,
  className,
}: CommentThreadProps) {
  // Real-time synchronization
  useCommentSocket(taskId);

  // Query
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useTaskComments(taskId);

  // Mutations
  const createMutation = useCreateComment(taskId);
  const updateMutation = useUpdateComment(taskId);
  const deleteMutation = useDeleteComment(taskId);
  const toggleReactionMutation = useToggleReaction(taskId);

  // Extract comments
  const comments = React.useMemo(() => {
    return extractDeduplicatedComments(data?.pages);
  }, [data?.pages]);

  const handleCreateComment = async (content: string) => {
    await createMutation.mutateAsync(content);
  };

  const handleUpdateComment = async (commentId: string, content: string) => {
    await updateMutation.mutateAsync({ commentId, content });
  };

  const handleDeleteComment = async (commentId: string) => {
    await deleteMutation.mutateAsync(commentId);
  };

  const handleToggleReaction = async (commentId: string, emoji: string) => {
    await toggleReactionMutation.mutateAsync({ commentId, emoji });
  };

  return (
    <div className={className}>
      <div className="space-y-4">
        {/* Comment Input at top for quick interaction */}
        <CommentInput
          workspaceId={workspaceId}
          onSubmit={handleCreateComment}
          isSubmitting={createMutation.isPending}
        />

        {/* Error Boundary / Fallback */}
        {isError ? (
          <div className="flex flex-col items-center justify-center p-6 text-center rounded-xl border border-destructive/20 bg-destructive/5 space-y-2">
            <AlertCircle className="size-5 text-destructive" />
            <p className="text-xs text-destructive font-medium">
              Failed to load comments. {error?.message || ''}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="text-xs h-7 gap-1.5 cursor-pointer"
            >
              <RefreshCw className="size-3" />
              Retry
            </Button>
          </div>
        ) : (
          /* Comment Feed */
          <CommentList
            comments={comments}
            workspaceId={workspaceId}
            isLoading={isLoading}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
            onFetchNextPage={fetchNextPage}
            onUpdateComment={handleUpdateComment}
            onDeleteComment={handleDeleteComment}
            onToggleReaction={handleToggleReaction}
            updatingCommentId={
              updateMutation.isPending ? updateMutation.variables?.commentId : null
            }
            deletingCommentId={
              deleteMutation.isPending ? deleteMutation.variables : null
            }
          />
        )}
      </div>
    </div>
  );
}
