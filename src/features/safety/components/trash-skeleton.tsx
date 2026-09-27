import * as React from 'react';

interface TrashSkeletonProps {
  count?: number;
}

export function TrashSkeleton({ count = 5 }: TrashSkeletonProps) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden animate-pulse">
      {/* Table Header Skeleton */}
      <div className="h-12 border-b border-border/80 bg-muted/30 px-6 flex items-center justify-between">
        <div className="h-4 w-28 rounded bg-muted/80" />
        <div className="h-4 w-36 rounded bg-muted/60 hidden md:block" />
        <div className="h-4 w-24 rounded bg-muted/60 hidden sm:block" />
        <div className="h-4 w-20 rounded bg-muted/70" />
      </div>

      {/* Table Rows Skeleton */}
      <div className="divide-y divide-border/40">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 sm:px-6 gap-4"
          >
            {/* Title & Type */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="h-8 w-8 rounded-lg bg-muted/70 shrink-0" />
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="h-4 w-3/5 rounded bg-muted/80" />
                <div className="h-3 w-2/5 rounded bg-muted/50" />
              </div>
            </div>

            {/* Container hierarchy */}
            <div className="h-3.5 w-32 rounded bg-muted/60 hidden md:block" />

            {/* Deleted By */}
            <div className="items-center gap-2 hidden sm:flex">
              <div className="h-6 w-6 rounded-full bg-muted/70" />
              <div className="h-3 w-16 rounded bg-muted/60" />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="h-8 w-20 rounded-lg bg-muted/70" />
              <div className="h-8 w-8 rounded-lg bg-muted/50" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
