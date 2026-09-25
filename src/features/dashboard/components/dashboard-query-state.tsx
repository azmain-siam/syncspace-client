'use client';

import type { ReactNode } from 'react';
import { AlertTriangle, Inbox, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface DashboardQueryErrorProps {
  title: string;
  onRetry?: () => void;
  className?: string;
  compact?: boolean;
}

export function DashboardQueryError({
  title,
  onRetry,
  className,
  compact = false,
}: DashboardQueryErrorProps) {
  return (
    <Card className={cn('rounded-2xl border-border bg-card', className)}>
      <CardContent
        className={cn(
          'flex flex-col items-center justify-center text-center',
          compact ? 'py-8 px-4 space-y-2' : 'py-12 px-6 space-y-3',
        )}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <p className="text-sm font-semibold text-foreground">Couldn’t load {title}</p>
        <p className="text-xs text-muted-foreground max-w-sm">
          The latest numbers aren’t available. Retry to fetch them again — we won’t guess with zeros.
        </p>
        {onRetry && (
          <Button type="button" variant="outline" size="sm" onClick={onRetry} className="mt-1">
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

interface DashboardQueryEmptyProps {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function DashboardQueryEmpty({
  title,
  description,
  icon,
  action,
  className,
}: DashboardQueryEmptyProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-10 px-4 rounded-xl border border-dashed border-border/80 bg-muted/10',
        className,
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground mb-2">
        {icon ?? <Inbox className="h-5 w-5" />}
      </div>
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="text-xs text-muted-foreground mt-1 max-w-sm">{description}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
