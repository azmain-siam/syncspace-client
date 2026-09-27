'use client';

import * as React from 'react';
import { Activity } from 'lucide-react';
import { useTaskActivities } from '../hooks/use-activities';
import { ActivityFeed } from './activity-feed';

interface TaskActivityHistoryProps {
  taskId: string;
}

export function TaskActivityHistory({ taskId }: TaskActivityHistoryProps) {
  const { data, isLoading } = useTaskActivities(taskId, { page: 1, limit: 30 });
  const activities = data?.activities || [];

  if (isLoading) {
    return (
      <div className="space-y-4 py-3 animate-pulse">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="h-7 w-7 rounded-full bg-muted/80 shrink-0" />
            <div className="space-y-1.5 flex-1">
              <div className="h-3.5 w-32 rounded bg-muted/80" />
              <div className="h-3 w-56 rounded bg-muted/50" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="p-8 text-center select-none rounded-xl border border-dashed border-border/70 bg-muted/20 my-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground border border-border/80 mx-auto mb-2 shadow-2xs">
          <Activity className="h-5 w-5" />
        </div>
        <h5 className="text-xs font-bold text-foreground">No task activity yet</h5>
        <p className="mt-1 text-[11px] text-muted-foreground max-w-xs mx-auto leading-relaxed">
          Updates, moves, checklist toggles, and assignments for this card will appear here automatically.
        </p>
      </div>
    );
  }

  return (
    <div className="py-2">
      <ActivityFeed activities={activities} />
    </div>
  );
}
