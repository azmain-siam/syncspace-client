import * as React from 'react';
import { BellOff, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NotificationEmptyStateProps {
  tab: 'all' | 'unread';
  onSwitchToAll?: () => void;
}

export function NotificationEmptyState({
  tab,
  onSwitchToAll,
}: NotificationEmptyStateProps) {
  if (tab === 'unread') {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center select-none">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-3 shadow-xs">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h4 className="text-sm font-bold text-foreground">You&apos;re all caught up!</h4>
        <p className="mt-1 text-xs text-muted-foreground max-w-[240px] leading-relaxed">
          There are no unread notifications right now. You can check previous updates in the All tab.
        </p>
        {onSwitchToAll && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onSwitchToAll}
            className="mt-4 h-8 px-3 text-xs font-semibold rounded-lg"
          >
            View All Notifications
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center select-none">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground border border-border/70 mb-3 shadow-xs">
        <BellOff className="h-6 w-6" />
      </div>
      <h4 className="text-sm font-bold text-foreground">No notifications yet</h4>
      <p className="mt-1 text-xs text-muted-foreground max-w-[250px] leading-relaxed">
        When tasks are assigned to you, mentions occur, or workspace invitations are sent, they&apos;ll appear here.
      </p>
    </div>
  );
}
