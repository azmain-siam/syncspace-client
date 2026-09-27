import * as React from 'react';
import { AlertCircle, RefreshCw, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  title?: string;
  message?: string;
  onRetry?: () => void;
  action?: React.ReactNode;
}

export function ErrorState({
  icon: Icon = AlertCircle,
  title = 'Something went wrong',
  message = 'An unexpected error occurred while loading this section. Please try again.',
  onRetry,
  action,
  className,
  children,
  ...props
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-destructive/20 bg-destructive/5 space-y-3.5',
        className,
      )}
      {...props}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive border border-destructive/20 shadow-xs mb-1">
        <Icon className="h-6 w-6" />
      </div>

      <div className="space-y-1.5 max-w-sm">
        <h3 className="text-base font-bold text-foreground tracking-tight">
          {title}
        </h3>
        {message && (
          <p className="text-xs text-muted-foreground leading-relaxed">
            {message}
          </p>
        )}
      </div>

      {(onRetry || action || children) && (
        <div className="flex items-center gap-2.5 pt-2 flex-wrap justify-center">
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Retry</span>
            </Button>
          )}

          {action}
          {children}
        </div>
      )}
    </div>
  );
}
