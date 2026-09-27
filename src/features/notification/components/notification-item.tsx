'use client';

import * as React from 'react';
import {
  AtSign,
  Building2,
  Check,
  Clock,
  FolderPlus,
  Trash2,
  UserCheck,
  ExternalLink,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Notification, NotificationType } from '../types/notification.types';

interface NotificationItemProps {
  notification: Notification;
  onItemClick?: (notification: Notification) => void;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  isMarkingRead?: boolean;
  isDeleting?: boolean;
}

function getNotificationTypeMeta(type: NotificationType) {
  switch (type) {
    case NotificationType.TASK_ASSIGNED:
      return {
        icon: UserCheck,
        badgeClass: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
      };
    case NotificationType.TASK_MENTION:
      return {
        icon: AtSign,
        badgeClass: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
      };
    case NotificationType.TASK_DUE:
      return {
        icon: Clock,
        badgeClass: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
      };
    case NotificationType.WORKSPACE_INVITATION:
      return {
        icon: Building2,
        badgeClass: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      };
    case NotificationType.PROJECT_INVITATION:
      return {
        icon: FolderPlus,
        badgeClass: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
      };
    default:
      return {
        icon: UserCheck,
        badgeClass: 'text-primary bg-primary/10 border-primary/20',
      };
  }
}

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 45) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'Recently';
  }
}

export function NotificationItem({
  notification,
  onItemClick,
  onMarkAsRead,
  onDelete,
  isMarkingRead,
  isDeleting,
}: NotificationItemProps) {
  const { icon: TypeIcon, badgeClass } = getNotificationTypeMeta(
    notification.type,
  );
  const relativeTime = formatRelativeTime(notification.createdAt);

  const actorInitials = notification.actor?.name
    ? notification.actor.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'U';

  const handleContainerClick = () => {
    onItemClick?.(notification);
  };

  const handleMarkReadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!notification.isRead && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(notification.id);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleContainerClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleContainerClick();
        }
      }}
      className={cn(
        'group relative flex items-start gap-3 p-3 sm:px-4 cursor-pointer transition-colors outline-none focus-visible:bg-accent/70 hover:bg-accent/40 text-left border-b border-border/30 last:border-b-0',
        !notification.isRead && 'bg-primary/5 dark:bg-primary/[0.03]',
      )}
    >
      {/* Unread Accent Indicator Dot */}
      {!notification.isRead && (
        <span
          className="absolute left-1.5 top-5 h-1.5 w-1.5 rounded-full bg-primary"
          aria-hidden="true"
        />
      )}

      {/* Avatar with Type Icon Badge Overlay */}
      <div className="relative shrink-0 mt-0.5">
        <Avatar className="h-9 w-9 border border-border/60 shadow-2xs">
          {notification.actor?.avatar && (
            <AvatarImage
              src={notification.actor.avatar}
              alt={notification.actor.name || 'User'}
            />
          )}
          <AvatarFallback className="text-[11px] font-bold bg-muted text-muted-foreground">
            {actorInitials}
          </AvatarFallback>
        </Avatar>
        <div
          className={cn(
            'absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border shadow-2xs',
            badgeClass,
          )}
        >
          <TypeIcon className="h-2.5 w-2.5" />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 min-w-0 pr-1">
        <div className="flex items-center justify-between gap-1.5">
          <p
            className={cn(
              'text-xs font-semibold truncate leading-snug',
              notification.isRead
                ? 'text-foreground/90'
                : 'text-foreground font-bold',
            )}
          >
            {notification.title}
          </p>
          <span className="shrink-0 text-[10px] font-medium text-muted-foreground/80">
            {relativeTime}
          </span>
        </div>

        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {notification.message}
        </p>

        {notification.link && (
          <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-primary hover:underline">
            <span>View details</span>
            <ExternalLink className="h-3 w-3" />
          </div>
        )}
      </div>

      {/* Quick Action Buttons (Hover / Focus visible) */}
      <div className="shrink-0 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
        {!notification.isRead && onMarkAsRead && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleMarkReadClick}
            disabled={isMarkingRead}
            className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-background/80"
            title="Mark as read"
            aria-label="Mark notification as read"
          >
            <Check className="h-3.5 w-3.5" />
          </Button>
        )}
        {onDelete && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleDeleteClick}
            disabled={isDeleting}
            className="h-7 w-7 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            title="Delete notification"
            aria-label="Delete notification"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
