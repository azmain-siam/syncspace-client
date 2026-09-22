'use client';

import * as React from 'react';
import {
  Activity,
  ArrowRight,
  Building2,
  CheckCircle2,
  CheckSquare,
  Clock,
  Folder,
  Layers,
  Link as LinkIcon,
  MessageSquare,
  Paperclip,
  Shield,
  Tag,
  Trash2,
  UserCheck,
  UserMinus,
  UserPlus,
  Zap,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ActivityAction, WorkspaceActivity } from '../types/safety.types';

interface ActivityFeedProps {
  activities: WorkspaceActivity[];
  isLoading?: boolean;
}

function getActivityMeta(action: ActivityAction) {
  switch (action) {
    case ActivityAction.TASK_CREATED:
    case ActivityAction.TASK_RESTORED:
      return {
        icon: CheckSquare,
        colorClass: 'text-primary bg-primary/10 border-primary/25',
        badge: 'TASK',
      };
    case ActivityAction.TASK_MOVED:
    case ActivityAction.TASK_UPDATED:
      return {
        icon: ArrowRight,
        colorClass: 'text-primary bg-primary/10 border-primary/25',
        badge: 'UPDATE',
      };
    case ActivityAction.TASK_ASSIGNED:
      return {
        icon: UserCheck,
        colorClass: 'text-primary bg-primary/10 border-primary/25',
        badge: 'ASSIGNMENT',
      };
    case ActivityAction.TASK_DELETED:
    case ActivityAction.TASKS_BULK_DELETED:
      return {
        icon: Trash2,
        colorClass: 'text-danger-foreground bg-danger border-danger/30',
        badge: 'DELETION',
      };
    case ActivityAction.COMMENT_CREATED:
    case ActivityAction.COMMENT_UPDATED:
    case ActivityAction.COMMENT_REACTION_ADDED:
      return {
        icon: MessageSquare,
        colorClass: 'text-primary bg-primary/10 border-primary/25',
        badge: 'COMMENT',
      };
    case ActivityAction.MEMBER_INVITED:
    case ActivityAction.INVITATION_SENT:
    case ActivityAction.INVITATION_ACCEPTED:
      return {
        icon: UserPlus,
        colorClass: 'text-success-foreground bg-success border-success/30',
        badge: 'TEAM',
      };
    case ActivityAction.MEMBER_REMOVED:
    case ActivityAction.MEMBER_LEFT:
      return {
        icon: UserMinus,
        colorClass: 'text-warning-foreground bg-warning border-warning/30',
        badge: 'TEAM',
      };
    case ActivityAction.ROLE_UPDATED:
      return {
        icon: Shield,
        colorClass: 'text-primary bg-primary/10 border-primary/25',
        badge: 'PERMISSION',
      };
    case ActivityAction.PROJECT_CREATED:
    case ActivityAction.PROJECT_UPDATED:
    case ActivityAction.PROJECT_RESTORED:
      return {
        icon: Folder,
        colorClass: 'text-primary bg-primary/10 border-primary/25',
        badge: 'PROJECT',
      };
    case ActivityAction.PROJECT_ARCHIVED:
    case ActivityAction.PROJECT_DELETED:
      return {
        icon: Folder,
        colorClass: 'text-warning-foreground bg-warning border-warning/30',
        badge: 'PROJECT',
      };
    case ActivityAction.BOARD_CREATED:
    case ActivityAction.COLUMN_CREATED:
    case ActivityAction.COLUMN_REORDERED:
      return {
        icon: Layers,
        colorClass: 'text-muted-foreground bg-muted border-border',
        badge: 'BOARD',
      };
    case ActivityAction.SPRINT_STARTED:
    case ActivityAction.SPRINT_COMPLETED:
    case ActivityAction.TASK_MOVED_TO_SPRINT:
      return {
        icon: Zap,
        colorClass: 'text-warning-foreground bg-warning border-warning/30',
        badge: 'SPRINT',
      };
    case ActivityAction.CHECKLIST_ITEM_TOGGLED:
    case ActivityAction.CHECKLIST_ITEM_CREATED:
      return {
        icon: CheckCircle2,
        colorClass: 'text-success-foreground bg-success border-success/30',
        badge: 'CHECKLIST',
      };
    case ActivityAction.ATTACHMENT_UPLOADED:
      return {
        icon: Paperclip,
        colorClass: 'text-primary bg-primary/10 border-primary/25',
        badge: 'ATTACHMENT',
      };
    case ActivityAction.TASK_LINK_CREATED:
      return {
        icon: LinkIcon,
        colorClass: 'text-primary bg-primary/10 border-primary/25',
        badge: 'LINK',
      };
    case ActivityAction.LABEL_ATTACHED:
    case ActivityAction.LABEL_DETACHED:
      return {
        icon: Tag,
        colorClass: 'text-muted-foreground bg-muted border-border',
        badge: 'LABEL',
      };
    default:
      return {
        icon: Building2,
        colorClass: 'text-muted-foreground bg-muted border-border',
        badge: 'WORKSPACE',
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
      year: 'numeric',
    });
  } catch {
    return 'Recently';
  }
}

function cleanActionDescription(description: string, actorName?: string | null): string {
  if (!description) return '';
  if (actorName && description.startsWith(actorName)) {
    return description.slice(actorName.length).trim();
  }
  return description;
}

export function ActivityFeed({ activities, isLoading }: ActivityFeedProps) {
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse p-4 sm:p-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-start gap-4">
            <div className="h-7 w-7 rounded-full bg-muted/80 shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-4 w-48 rounded bg-muted/80" />
              <div className="h-3 w-72 rounded bg-muted/50" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="py-16 text-center rounded-2xl border border-dashed border-border bg-card/50 space-y-4">
        <div className="h-12 w-12 rounded-2xl bg-muted/60 border border-border/80 text-muted-foreground flex items-center justify-center mx-auto">
          <Activity className="h-6 w-6" />
        </div>
        <div className="space-y-1 max-w-sm mx-auto">
          <h4 className="text-base font-bold text-foreground">No Activities Found</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            When team actions, task moves, comments, or project updates occur in this workspace, they will appear here in chronological order.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative pl-7 space-y-5 before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-[2px] before:bg-border/60">
      {activities.map((activity) => {
        const { icon: ActionIcon, colorClass, badge } = getActivityMeta(activity.action);
        const actorName = activity.actor?.name || 'Someone';
        const cleanDesc = cleanActionDescription(
          activity.description || activity.action.replace(/_/g, ' ').toLowerCase(),
          activity.actor?.name,
        );

        const actorInitials = activity.actor?.name
          ? activity.actor.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .substring(0, 2)
              .toUpperCase()
          : 'U';

        return (
          <div
            key={activity.id}
            className="relative flex items-start gap-3.5 group rounded-xl p-2.5 -m-2.5 transition-colors hover:bg-muted/30"
          >
            {/* Timeline Node Badge Icon */}
            <div
              className={cn(
                'absolute -left-7 top-2.5 flex h-7 w-7 items-center justify-center rounded-full border shadow-2xs ring-4 ring-card bg-card transition-transform group-hover:scale-110',
                colorClass,
              )}
            >
              <ActionIcon className="h-3.5 w-3.5" />
            </div>

            {/* Event Content Container */}
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap text-xs">
                {/* Actor Avatar */}
                <Avatar className="h-5 w-5 border border-border shrink-0">
                  {activity.actor?.avatar && (
                    <AvatarImage src={activity.actor.avatar} alt={actorName} />
                  )}
                  <AvatarFallback className="text-[9px] font-bold bg-muted">
                    {actorInitials}
                  </AvatarFallback>
                </Avatar>

                {/* Actor Name */}
                <span className="font-bold text-foreground">
                  {actorName}
                </span>

                {/* Natural Action Sentence */}
                <span className="text-foreground/90 font-normal">
                  {cleanDesc}
                </span>

                {/* Project Context Badge */}
                {activity.project?.title && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-muted/60 border border-border/80 px-2 py-0.5 rounded-full">
                    <Folder className="h-3 w-3 text-muted-foreground" />
                    <span>{activity.project.title}</span>
                  </span>
                )}

                {/* Action Category Badge */}
                <Badge
                  variant="outline"
                  className={cn(
                    'text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ml-auto',
                    colorClass,
                  )}
                >
                  {badge}
                </Badge>
              </div>

              {/* Timestamp */}
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/75 pl-7">
                <Clock className="h-3 w-3" />
                <span title={new Date(activity.createdAt).toLocaleString()}>
                  {formatRelativeTime(activity.createdAt)}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
