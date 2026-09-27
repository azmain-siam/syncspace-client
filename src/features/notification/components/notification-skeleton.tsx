import * as React from 'react';

interface NotificationSkeletonProps {
  count?: number;
}

export function NotificationSkeleton({ count = 4 }: NotificationSkeletonProps) {
  return (
    <div className="divide-y divide-border/40 animate-pulse">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex items-start gap-3 p-3.5 sm:px-4"
        >
          {/* Avatar / Icon Skeleton */}
          <div className="relative shrink-0">
            <div className="h-9 w-9 rounded-full bg-muted/70" />
            <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-muted/90" />
          </div>

          {/* Content Skeletons */}
          <div className="flex-1 min-w-0 space-y-1.5 pt-0.5">
            <div className="flex items-center justify-between gap-2">
              <div className="h-3.5 w-28 rounded-md bg-muted/80" />
              <div className="h-3 w-12 rounded-md bg-muted/60" />
            </div>
            <div className="h-3 w-full rounded-md bg-muted/50" />
            <div className="h-3 w-3/4 rounded-md bg-muted/40" />
          </div>
        </div>
      ))}
    </div>
  );
}
