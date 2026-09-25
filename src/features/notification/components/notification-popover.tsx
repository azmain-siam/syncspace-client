'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Notification,
  NotificationPaginationMeta,
} from '../types/notification.types';
import {
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
} from '../hooks/use-notifications';
import { NotificationItem } from './notification-item';
import { NotificationSkeleton } from './notification-skeleton';
import { NotificationEmptyState } from './notification-empty-state';

export interface NotificationPopoverProps {
  notifications?: Notification[];
  meta?: NotificationPaginationMeta;
  isLoading?: boolean;
  isFetchingNextPage?: boolean;
  onItemClick?: (notification: Notification) => void;
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onDelete?: (id: string) => void;
  onLoadMore?: () => void;
  isMarkingAllRead?: boolean;
}

export function NotificationPopover({
  notifications: notificationsProp,
  meta: metaProp,
  isLoading: isLoadingProp,
  isFetchingNextPage = false,
  onItemClick: onItemClickProp,
  onMarkAsRead: onMarkAsReadProp,
  onMarkAllAsRead: onMarkAllAsReadProp,
  onDelete: onDeleteProp,
  onLoadMore,
  isMarkingAllRead: isMarkingAllReadProp,
}: NotificationPopoverProps = {}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'all' | 'unread'>('all');

  // React Query hooks for automated data management
  const notificationsQuery = useNotifications({ page: 1, limit: 30 });
  const markReadMutation = useMarkNotificationAsRead();
  const markAllReadMutation = useMarkAllNotificationsAsRead();
  const deleteMutation = useDeleteNotification();

  // Resolved state prioritizing props over query defaults
  const rawNotifications =
    notificationsProp ?? notificationsQuery.data?.notifications;
  const meta = metaProp ?? notificationsQuery.data?.meta;
  const isLoading = isLoadingProp ?? notificationsQuery.isLoading;
  const isMarkingAllRead =
    isMarkingAllReadProp ?? markAllReadMutation.isPending;

  const unreadCount = meta?.unreadCount ?? 0;

  const filteredNotifications = React.useMemo(() => {
    const list = rawNotifications || [];
    if (activeTab === 'unread') {
      return list.filter((n) => !n.isRead);
    }
    return list;
  }, [rawNotifications, activeTab]);

  const handleNotificationClick = (notification: Notification) => {
    if (onItemClickProp) {
      onItemClickProp(notification);
    } else {
      if (!notification.isRead) {
        markReadMutation.mutate(notification.id);
      }
      if (notification.link) {
        const dest = notification.link.startsWith('/') ? notification.link : `/${notification.link}`;
        router.push(dest);
      }
    }
    setOpen(false);
  };

  const handleMarkAsRead = (id: string) => {
    if (onMarkAsReadProp) {
      onMarkAsReadProp(id);
    } else {
      markReadMutation.mutate(id);
    }
  };

  const handleMarkAllAsRead = () => {
    if (onMarkAllAsReadProp) {
      onMarkAllAsReadProp();
    } else {
      markAllReadMutation.mutate();
    }
  };

  const handleDelete = (id: string) => {
    if (onDeleteProp) {
      onDeleteProp(id);
    } else {
      deleteMutation.mutate(id);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={
            unreadCount > 0
              ? `${unreadCount} unread notifications`
              : 'Notifications'
          }
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-primary text-[10px] font-extrabold text-primary-foreground shadow-xs animate-in zoom-in-50">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[360px] sm:w-[420px] p-0 rounded-2xl border border-border bg-popover shadow-xl overflow-hidden z-50 flex flex-col max-h-[580px]"
      >
        {/* Popover Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-muted/20">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-foreground">Notifications</h3>
            {unreadCount > 0 && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                {unreadCount} new
              </span>
            )}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              handleMarkAllAsRead();
            }}
            disabled={unreadCount === 0 || isMarkingAllRead}
            className="h-7 px-2 text-xs font-semibold text-muted-foreground hover:text-foreground disabled:opacity-40"
            title="Mark all notifications as read"
          >
            {isMarkingAllRead ? (
              <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
            ) : (
              <CheckCheck className="h-3.5 w-3.5 mr-1.5 text-primary" />
            )}
            <span>Mark all read</span>
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className="flex border-b border-border/40 px-3 pt-2 gap-1 bg-background/50">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={cn(
              'flex items-center gap-1.5 pb-2 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer outline-none',
              activeTab === 'all'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            <span>All</span>
            {meta?.total !== undefined && (
              <span className="rounded-full bg-muted px-1.5 py-0.2 text-[10px] font-semibold text-muted-foreground">
                {meta.total}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('unread')}
            className={cn(
              'flex items-center gap-1.5 pb-2 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer outline-none',
              activeTab === 'unread'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            <span>Unread</span>
            {unreadCount > 0 && (
              <span className="rounded-full bg-primary/15 text-primary px-1.5 py-0.2 text-[10px] font-bold">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Notification Scrollable Feed */}
        <div className="flex-1 overflow-y-auto min-h-[160px] max-h-[380px] divide-y divide-border/20">
          {isLoading ? (
            <NotificationSkeleton count={4} />
          ) : filteredNotifications.length === 0 ? (
            <NotificationEmptyState
              tab={activeTab}
              onSwitchToAll={() => setActiveTab('all')}
            />
          ) : (
            filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onItemClick={handleNotificationClick}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDelete}
                isMarkingRead={markReadMutation.isPending}
                isDeleting={deleteMutation.isPending}
              />
            ))
          )}
        </div>

        {/* Footer / Pagination */}
        {meta?.hasNextPage && onLoadMore && (
          <div className="p-2 border-t border-border/40 bg-muted/10 text-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                onLoadMore();
              }}
              disabled={isFetchingNextPage}
              className="w-full h-8 text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              {isFetchingNextPage ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  Loading...
                </>
              ) : (
                'Load more notifications'
              )}
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
