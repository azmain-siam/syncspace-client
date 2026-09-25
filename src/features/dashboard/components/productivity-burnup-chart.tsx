'use client';

import type { ProductivityTimelineItem } from '../types/dashboard.types';

interface ProductivityBurnupChartProps {
  timeline: ProductivityTimelineItem[];
}

export function ProductivityBurnupChart({ timeline }: ProductivityBurnupChartProps) {
  if (timeline.length === 0) {
    return (
      <div className="h-36 rounded-xl border border-dashed border-border/80 bg-muted/10 flex items-center justify-center text-xs text-muted-foreground">
        No throughput in this comparison window
      </div>
    );
  }

  const width = 640;
  const height = 160;
  const padding = { top: 12, right: 12, bottom: 24, left: 12 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const maxValue = Math.max(
    1,
    ...timeline.map((point) =>
      Math.max(point.accumulatedCreated, point.accumulatedCompleted),
    ),
  );

  const toPoint = (index: number, value: number) => {
    const x =
      timeline.length === 1
        ? padding.left + innerWidth / 2
        : padding.left + (index / (timeline.length - 1)) * innerWidth;
    const y = padding.top + innerHeight - (value / maxValue) * innerHeight;
    return `${x},${y}`;
  };

  const createdPath = timeline
    .map((point, index) => toPoint(index, point.accumulatedCreated))
    .join(' ');
  const completedPath = timeline
    .map((point, index) => toPoint(index, point.accumulatedCompleted))
    .join(' ');

  const firstLabel = timeline[0]?.label;
  const lastLabel = timeline[timeline.length - 1]?.label;

  return (
    <div className="space-y-2">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Cumulative tasks created versus completed"
        className="w-full h-40"
      >
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className="text-primary"
          points={createdPath}
        />
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className="text-emerald-500"
          points={completedPath}
        />
      </svg>
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>{firstLabel}</span>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-3 rounded-full bg-primary" /> Created
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-3 rounded-full bg-emerald-500" /> Completed
          </span>
        </div>
        <span>{lastLabel}</span>
      </div>
    </div>
  );
}
