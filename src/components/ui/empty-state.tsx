import * as React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  } | React.ReactNode;
  secondaryAction?: {
    label: string;
    onClick: () => void;
  } | React.ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  children,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-border/80 bg-card/40 backdrop-blur-xs space-y-3.5',
        className,
      )}
      {...props}
    >
      {Icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-xs mb-1">
          <Icon className="h-6 w-6" />
        </div>
      )}

      <div className="space-y-1.5 max-w-sm">
        <h3 className="text-base font-bold text-foreground tracking-tight">
          {title}
        </h3>
        {description && (
          <p className="text-xs text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {(action || secondaryAction || children) && (
        <div className="flex items-center gap-2.5 pt-2 flex-wrap justify-center">
          {action &&
            (React.isValidElement(action) ? (
              action
            ) : (
              // @ts-expect-error action is an object here
              <Button onClick={action.onClick} size="sm" className="gap-1.5 text-xs">
                {/* @ts-expect-error action.icon can exist */}
                {action.icon && <action.icon className="h-3.5 w-3.5" />}
                {/* @ts-expect-error action.label is string */}
                <span>{action.label}</span>
              </Button>
            ))}

          {secondaryAction &&
            (React.isValidElement(secondaryAction) ? (
              secondaryAction
            ) : (
              // @ts-expect-error secondaryAction is an object
              <Button onClick={secondaryAction.onClick} variant="outline" size="sm" className="text-xs">
                {/* @ts-expect-error secondaryAction.label is string */}
                <span>{secondaryAction.label}</span>
              </Button>
            ))}

          {children}
        </div>
      )}
    </div>
  );
}
