'use client';

import * as React from 'react';

export function KanbanSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Board Controls Bar Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-36 rounded-xl bg-muted/60" />
          <div className="h-9 w-28 rounded-xl bg-muted/40" />
          <div className="h-8 w-8 rounded-lg bg-muted/40" />
        </div>

        <div className="flex items-center gap-2">
          <div className="h-9 w-28 rounded-xl bg-muted/60" />
          <div className="h-9 w-9 rounded-xl bg-muted/40" />
        </div>
      </div>

      {/* Horizontal Columns Skeleton */}
      <div className="flex gap-5 overflow-x-auto pb-4 pt-1">
        {[1, 2, 3, 4].map((col) => (
          <div
            key={col}
            className="flex flex-col w-72 sm:w-80 shrink-0 rounded-2xl border border-border/70 bg-card/40 p-3.5 space-y-4 min-h-[440px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-4 w-24 rounded bg-muted/70" />
                <div className="h-4 w-5 rounded-full bg-muted/50" />
              </div>
              <div className="h-6 w-6 rounded bg-muted/50" />
            </div>

            {/* Task Card Skeletons */}
            <div className="space-y-3 flex-1">
              <div className="h-20 rounded-xl border border-border/50 bg-muted/30 p-3 space-y-2">
                <div className="h-3.5 w-3/4 rounded bg-muted/60" />
                <div className="h-3 w-1/2 rounded bg-muted/40" />
              </div>
              <div className="h-24 rounded-xl border border-border/50 bg-muted/30 p-3 space-y-2">
                <div className="h-3.5 w-5/6 rounded bg-muted/60" />
                <div className="h-3 w-2/3 rounded bg-muted/40" />
                <div className="flex justify-between items-center pt-2">
                  <div className="h-4 w-12 rounded bg-muted/40" />
                  <div className="h-5 w-5 rounded-full bg-muted/50" />
                </div>
              </div>
              <div className="h-16 rounded-xl border border-border/50 bg-muted/30 p-3 space-y-2">
                <div className="h-3.5 w-2/3 rounded bg-muted/60" />
                <div className="h-3 w-1/3 rounded bg-muted/40" />
              </div>
            </div>

            {/* Add task button skeleton */}
            <div className="h-8 rounded-xl bg-muted/30" />
          </div>
        ))}
      </div>
    </div>
  );
}
