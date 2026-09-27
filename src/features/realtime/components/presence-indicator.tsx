'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface PresenceIndicatorProps {
  isOnline: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showText?: boolean;
  showOffline?: boolean;
  className?: string;
}

const SIZE_CONFIG = {
  xs: 'h-1.5 w-1.5',
  sm: 'h-2 w-2',
  md: 'h-2.5 w-2.5',
  lg: 'h-3 w-3',
};

export function PresenceIndicator({
  isOnline,
  size = 'sm',
  showText = false,
  showOffline = false,
  className,
}: PresenceIndicatorProps) {
  if (!isOnline && !showOffline) {
    return null;
  }

  const dotSize = SIZE_CONFIG[size] || SIZE_CONFIG.sm;

  return (
    <span
      className={cn('inline-flex items-center gap-1.5 select-none', className)}
      title={isOnline ? 'Online' : 'Offline'}
    >
      <span className={cn('relative flex shrink-0', dotSize)}>
        {isOnline ? (
          <>
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-full w-full bg-emerald-500 ring-1.5 ring-background" />
          </>
        ) : (
          <span className="relative inline-flex rounded-full h-full w-full bg-muted-foreground/40 ring-1.5 ring-background" />
        )}
      </span>

      {showText && (
        <span
          className={cn(
            'text-[11px] font-semibold',
            isOnline
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-muted-foreground',
          )}
        >
          {isOnline ? 'Online' : 'Offline'}
        </span>
      )}
    </span>
  );
}
