export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" aria-label="Loading dashboard analytics">
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4 min-w-0">
          <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-muted/70 shrink-0" />
          <div className="space-y-2 min-w-0 flex-1">
            <div className="h-6 w-44 rounded-md bg-muted/80" />
            <div className="h-3.5 w-32 rounded bg-muted/50" />
          </div>
        </div>
        <div className="h-4 w-28 rounded bg-muted/50" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border bg-card p-5 sm:p-6 flex flex-col justify-between space-y-4"
          >
            <div className="h-3.5 w-24 rounded bg-muted/60" />
            <div className="h-8 w-28 rounded-md bg-muted/80" />
            <div className="h-2 w-full rounded-full bg-muted/50" />
          </div>
        ))}
      </div>

      <div className="h-32 rounded-2xl border border-border bg-card" />

      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <div className="h-5 w-40 rounded bg-muted/80" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-12 rounded-xl bg-muted/30" />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border bg-card p-6 h-64" />
        <div className="rounded-2xl border border-border bg-card p-6 h-64" />
      </div>

      <div className="h-56 rounded-2xl border border-border bg-card" />
      <div className="h-56 rounded-2xl border border-border bg-card" />
    </div>
  );
}
