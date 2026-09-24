import * as React from 'react';

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" aria-label="Loading dashboard analytics">
      {/* 1. Header Banner Skeleton */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4 min-w-0">
          <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-muted/70 shrink-0" />
          <div className="space-y-2 min-w-0 flex-1">
            <div className="flex items-center gap-2.5">
              <div className="h-6 w-44 rounded-md bg-muted/80" />
              <div className="h-5 w-16 rounded-full bg-muted/60" />
            </div>
            <div className="h-3.5 w-32 rounded bg-muted/50" />
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="h-9 w-28 rounded-lg bg-muted/70" />
          <div className="h-9 w-9 rounded-lg bg-muted/60" />
        </div>
      </div>

      {/* 2. KPI Cards Grid Skeleton (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border bg-card p-5 sm:p-6 flex flex-col justify-between space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="h-3.5 w-24 rounded bg-muted/60" />
              <div className="h-8 w-8 rounded-xl bg-muted/50" />
            </div>
            <div className="space-y-2">
              <div className="h-8 w-28 rounded-md bg-muted/80" />
              <div className="h-2 w-full rounded-full bg-muted/50" />
            </div>
            <div className="h-3 w-36 rounded bg-muted/40 pt-1" />
          </div>
        ))}
      </div>

      {/* 3. Analytics Distribution Charts Split Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Skeleton */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <div className="h-5 w-36 rounded-md bg-muted/80" />
              <div className="h-3.5 w-48 rounded bg-muted/50" />
            </div>
            <div className="h-7 w-20 rounded-full bg-muted/60" />
          </div>
          <div className="space-y-3.5 pt-2">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="h-3.5 w-24 rounded bg-muted/60" />
                  <div className="h-3.5 w-14 rounded bg-muted/60" />
                </div>
                <div className="h-2 w-full rounded-full bg-muted/50" />
              </div>
            ))}
          </div>
        </div>

        {/* Priority & Productivity Skeleton */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <div className="h-5 w-40 rounded-md bg-muted/80" />
              <div className="h-3.5 w-52 rounded bg-muted/50" />
            </div>
            <div className="h-7 w-24 rounded-full bg-muted/60" />
          </div>
          <div className="h-4 w-full rounded-full bg-muted/50 my-3" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="p-3 rounded-xl border border-border/60 bg-muted/20 space-y-2">
                <div className="h-3 w-12 rounded bg-muted/50" />
                <div className="h-6 w-10 rounded bg-muted/70" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Team Member Workload Table Skeleton */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-border/80 flex items-center justify-between">
          <div className="space-y-1">
            <div className="h-5 w-44 rounded-md bg-muted/80" />
            <div className="h-3.5 w-56 rounded bg-muted/50" />
          </div>
          <div className="h-8 w-24 rounded-lg bg-muted/60" />
        </div>
        <div className="divide-y divide-border/50">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4 sm:px-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="h-9 w-9 rounded-full bg-muted/70 shrink-0" />
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="h-4 w-32 rounded bg-muted/80" />
                  <div className="h-3 w-40 rounded bg-muted/50" />
                </div>
              </div>
              <div className="h-5 w-16 rounded-full bg-muted/60 hidden sm:block" />
              <div className="h-4 w-20 rounded bg-muted/60 hidden md:block" />
              <div className="w-32 space-y-1 hidden sm:block">
                <div className="h-2 w-full rounded-full bg-muted/60" />
                <div className="h-2.5 w-10 rounded bg-muted/50 ml-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
