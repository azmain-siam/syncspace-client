'use client';

import * as React from 'react';
import { Loader2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Comment } from '../types/comment.types';
import { CommentItem } from './comment-item';

interface CommentListProps {
  comments: Comment[];
  workspaceId: string;
  isLoading?: boolean;
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  onFetchNextPage?: () => void;
  onUpdateComment: (commentId: string, content: string) => Promise<unknown> | void;
  onDeleteComment: (commentId: string) => Promise<unknown> | void;
  onToggleReaction: (commentId: string, emoji: string) => Promise<unknown> | void;
  updatingCommentId?: string | null;
  deletingCommentId?: string | null;
}

// Skeleton component mirroring exact CommentItem geometry
function CommentSkeleton() {
  return (
    <div className="flex gap-3 p-3 rounded-xl animate-pulse">
      <div className="size-7 rounded-full bg-muted/60 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-3.5 w-24 rounded-md bg-muted/60" />
          <div className="h-3 w-14 rounded-md bg-muted/40" />
        </div>
        <div className="space-y-1.5 pt-0.5">
          <div className="h-3 w-4/5 rounded-md bg-muted/50" />
          <div className="h-3 w-3/5 rounded-md bg-muted/40" />
        </div>
        <div className="flex gap-1.5 pt-1">
          <div className="h-6 w-12 rounded-full bg-muted/40" />
          <div className="h-6 w-12 rounded-full bg-muted/40" />
        </div>
      </div>
    </div>
  );
}

export function CommentList({
  comments,
  workspaceId,
  isLoading = false,
  isFetchingNextPage = false,
  hasNextPage = false,
  onFetchNextPage,
  onUpdateComment,
  onDeleteComment,
  onToggleReaction,
  updatingCommentId,
  deletingCommentId,
}: CommentListProps) {
  if (isLoading) {
    return (
      <div className="space-y-2 py-2">
        <CommentSkeleton />
        <CommentSkeleton />
        <CommentSkeleton />
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 text-center rounded-2xl border border-dashed border-border/80 bg-muted/10 my-2">
        <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
          <MessageSquare className="size-5" />
        </div>
        <h4 className="text-xs font-semibold text-foreground mb-1">
          No comments yet
        </h4>
        <p className="text-[11px] text-muted-foreground max-w-xs leading-relaxed">
          Start the conversation, ask questions, or mention teammates using{' '}
          <span className="font-semibold text-primary">@username</span>.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* List of comments */}
      <div className="divide-y divide-border/30">
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            workspaceId={workspaceId}
            onUpdateComment={onUpdateComment}
            onDeleteComment={onDeleteComment}
            onToggleReaction={onToggleReaction}
            isUpdating={updatingCommentId === comment.id}
            isDeleting={deletingCommentId === comment.id}
          />
        ))}
      </div>

      {/* Pagination button if has more comments */}
      {hasNextPage && onFetchNextPage && (
        <div className="flex justify-center pt-3 pb-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onFetchNextPage}
            disabled={isFetchingNextPage}
            className="text-xs text-muted-foreground hover:text-foreground h-7 rounded-lg gap-1.5 cursor-pointer"
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="size-3 animate-spin" />
                <span>Loading older comments...</span>
              </>
            ) : (
              <span>Load older comments</span>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
