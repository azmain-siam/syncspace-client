'use client';

import * as React from 'react';
import {
  Edit2,
  Loader2,
  MoreVertical,
  Trash2,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/features/auth/stores/use-auth-store';
import { useWorkspaceMembers } from '@/features/workspace/hooks/use-workspace-members';
import type { WorkspaceRole } from '@/types/domain';
import type { Comment } from '../types/comment.types';
import { DeleteCommentDialog } from './delete-comment-dialog';
import { ReactionPills } from './reaction-pills';

interface CommentItemProps {
  comment: Comment;
  workspaceId: string;
  onUpdateComment: (commentId: string, content: string) => Promise<unknown> | void;
  onDeleteComment: (commentId: string) => Promise<unknown> | void;
  onToggleReaction: (commentId: string, emoji: string) => Promise<unknown> | void;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

// Lightweight relative time helper
function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

// Tokenize and highlight @mentions
function renderFormattedContent(text: string) {
  // Regex splitting by @username (keeping the token)
  const parts = text.split(/(@[a-zA-Z0-9_.-]+)/g);

  return parts.map((part, index) => {
    if (part.startsWith('@') && part.length > 1) {
      return (
        <span
          key={index}
          className="inline-block font-semibold text-primary bg-primary/10 px-1 py-0.5 rounded-sm mx-0.5 select-all"
        >
          {part}
        </span>
      );
    }
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

export function CommentItem({
  comment,
  workspaceId,
  onUpdateComment,
  onDeleteComment,
  onToggleReaction,
  isUpdating = false,
  isDeleting = false,
}: CommentItemProps) {
  const currentUser = useAuthStore((state) => state.user);
  const { data: membersResponse } = useWorkspaceMembers(workspaceId);
  const members = membersResponse?.data || [];

  // Determine user workspace role
  const userMember = members.find((m) => m.userId === currentUser?.id);
  const userRole: WorkspaceRole | undefined = userMember?.role;

  const isAuthor = currentUser?.id === comment.userId;
  const canEdit = isAuthor;
  const canDelete = isAuthor || userRole === 'OWNER' || userRole === 'ADMIN';

  // Inline edit state
  const [isEditing, setIsEditing] = React.useState(false);
  const [editContent, setEditContent] = React.useState(comment.content);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

  const handleSaveEdit = async () => {
    const trimmed = editContent.trim();
    if (!trimmed || trimmed === comment.content) {
      setIsEditing(false);
      return;
    }

    try {
      await onUpdateComment(comment.id, trimmed);
      setIsEditing(false);
    } catch {
      // Handled by caller
    }
  };

  const handleCancelEdit = () => {
    setEditContent(comment.content);
    setIsEditing(false);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit();
    } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSaveEdit();
    }
  };

  return (
    <div className="group/comment relative flex gap-3 p-3 rounded-xl hover:bg-muted/30 transition-colors border border-transparent hover:border-border/40">
      {/* Author Avatar */}
      <Avatar className="size-7 shrink-0 ring-1 ring-border/60">
        {comment.user.avatar && (
          <AvatarImage src={comment.user.avatar} alt={comment.user.name} />
        )}
        <AvatarFallback className="text-[10px] font-semibold bg-primary/10 text-primary">
          {comment.user.name ? comment.user.name.slice(0, 2).toUpperCase() : 'U'}
        </AvatarFallback>
      </Avatar>

      {/* Main Comment Body */}
      <div className="flex-1 min-w-0 space-y-1">
        {/* Header: Author Name, Timestamp, Edited indicator, and Actions */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="font-semibold text-foreground truncate">
              {comment.user.name}
            </span>
            <span className="text-[11px] text-muted-foreground/80">
              {formatRelativeTime(comment.createdAt)}
            </span>
            {comment.isEdited && (
              <span
                className="text-[10px] text-muted-foreground/60 italic"
                title={
                  comment.editedAt
                    ? `Edited ${new Date(comment.editedAt).toLocaleString()}`
                    : 'Edited'
                }
              >
                (edited)
              </span>
            )}
          </div>

          {/* Action Menu (Edit / Delete) */}
          {(canEdit || canDelete) && !isEditing && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Comment options"
                  className="size-6 inline-flex items-center justify-center rounded-md opacity-0 group-hover/comment:opacity-100 hover:bg-muted text-muted-foreground hover:text-foreground transition-opacity cursor-pointer focus:opacity-100"
                >
                  <MoreVertical className="size-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32 rounded-xl text-xs">
                {canEdit && (
                  <DropdownMenuItem
                    onClick={() => {
                      setEditContent(comment.content);
                      setIsEditing(true);
                    }}
                    className="cursor-pointer gap-2 py-1.5"
                  >
                    <Edit2 className="size-3.5 text-muted-foreground" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                )}
                {canDelete && (
                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    className="cursor-pointer gap-2 py-1.5 text-destructive focus:text-destructive focus:bg-destructive/10"
                  >
                    <Trash2 className="size-3.5" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Content Area or Inline Edit Mode */}
        {isEditing ? (
          <div className="pt-1 space-y-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={handleEditKeyDown}
              disabled={isUpdating}
              autoFocus
              rows={3}
              className="w-full rounded-lg border border-primary/40 bg-background p-2.5 text-xs leading-relaxed text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary resize-none"
            />
            <div className="flex items-center justify-end gap-1.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isUpdating}
                onClick={handleCancelEdit}
                className="h-7 px-2.5 text-xs rounded-lg cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={!editContent.trim() || isUpdating}
                onClick={handleSaveEdit}
                className="h-7 px-3 text-xs rounded-lg cursor-pointer gap-1 shadow-xs"
              >
                {isUpdating ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  'Save'
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed break-words pt-0.5">
            {renderFormattedContent(comment.content)}
          </div>
        )}

        {/* Emoji Reactions Row */}
        {!isEditing && (
          <ReactionPills
            reactions={comment.reactions}
            onToggleReaction={(emoji) => onToggleReaction(comment.id, emoji)}
          />
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteCommentDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirmDelete={() => onDeleteComment(comment.id)}
        isDeleting={isDeleting}
      />
    </div>
  );
}
