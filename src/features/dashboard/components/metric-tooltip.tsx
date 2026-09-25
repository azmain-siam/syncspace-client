'use client';

import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface MetricTooltipProps {
  label: string;
  definition: string;
  className?: string;
}

export function MetricTooltip({ label, definition, className }: MetricTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            'inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground',
            className,
          )}
        >
          {label}
          <Info className="h-3 w-3 text-muted-foreground/70" aria-hidden />
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs leading-relaxed">
        {definition}
      </TooltipContent>
    </Tooltip>
  );
}
