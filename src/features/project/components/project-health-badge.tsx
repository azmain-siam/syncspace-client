import * as React from 'react';
import { ProjectHealth } from '@/types/domain';
import { cn } from '@/lib/utils';

interface ProjectHealthBadgeProps {
  health?: ProjectHealth | null;
  showLabel?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

const HEALTH_CONFIG: Record<
  ProjectHealth,
  { label: string; badge: string; dot: string; ping: string }
> = {
  [ProjectHealth.ON_TRACK]: {
    label: 'On Track',
    badge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25',
    dot: 'bg-emerald-500',
    ping: 'bg-emerald-400',
  },
  [ProjectHealth.AT_RISK]: {
    label: 'At Risk',
    badge: 'bg-amber-500/10 text-amber-800 dark:text-amber-200 border-amber-500/25',
    dot: 'bg-amber-500',
    ping: 'bg-amber-400',
  },
  [ProjectHealth.OFF_TRACK]: {
    label: 'Off Track',
    badge: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/25',
    dot: 'bg-rose-500',
    ping: 'bg-rose-400',
  },
};

export function ProjectHealthBadge({
  health = ProjectHealth.ON_TRACK,
  showLabel = true,
  size = 'md',
  className,
}: ProjectHealthBadgeProps) {
  const current = health && HEALTH_CONFIG[health] ? HEALTH_CONFIG[health] : HEALTH_CONFIG[ProjectHealth.ON_TRACK];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-semibold select-none',
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs',
        current.badge,
        className,
      )}
      aria-label={`Project health: ${current.label}`}
    >
      <span className="relative flex h-1.5 w-1.5">
        <span
          className={cn(
            'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
            current.ping,
          )}
        />
        <span className={cn('relative inline-flex rounded-full h-1.5 w-1.5', current.dot)} />
      </span>
      {showLabel && <span>{current.label}</span>}
    </span>
  );
}
