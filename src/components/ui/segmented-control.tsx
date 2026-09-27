'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SegmentedControlOption<T extends string> {
  value: T;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  count?: number;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const buttonRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});

  const [indicator, setIndicator] = React.useState<{
    left: number;
    width: number;
    ready: boolean;
  }>({ left: 0, width: 0, ready: false });

  const updateIndicator = React.useCallback(() => {
    const currentBtn = buttonRefs.current[value];
    if (currentBtn && containerRef.current) {
      setIndicator({
        left: currentBtn.offsetLeft,
        width: currentBtn.offsetWidth,
        ready: true,
      });
    }
  }, [value]);

  React.useLayoutEffect(() => {
    updateIndicator();
  }, [updateIndicator]);

  React.useEffect(() => {
    const handleResize = () => updateIndicator();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateIndicator]);

  return (
    <div
      ref={containerRef}
      role="tablist"
      className={cn(
        'relative inline-flex h-11 items-center p-1 bg-muted/60 rounded-md border border-border/70 select-none overflow-x-auto scrollbar-none',
        className,
      )}
    >
      {/* Sliding Active Indicator Pill */}
      {indicator.ready && (
        <span
          className="absolute top-1 bottom-1 rounded-md bg-card shadow-xs border border-border/60 transition-all duration-200 ease-out pointer-events-none"
          style={{
            left: `${indicator.left}px`,
            width: `${indicator.width}px`,
          }}
        />
      )}

      {options.map((option) => {
        const Icon = option.icon;
        const isActive = option.value === value;

        return (
          <button
            key={option.value}
            ref={(node) => {
              buttonRefs.current[option.value] = node;
            }}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.value)}
            className={cn(
              'relative z-10 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors duration-150 cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background active:scale-[0.98]',
              isActive
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
            <span>{option.label}</span>
            {option.count !== undefined && (
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-muted text-muted-foreground ml-0.5">
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
