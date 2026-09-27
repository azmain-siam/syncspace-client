'use client';

import * as React from 'react';
import {
  AlertTriangle,
  HelpCircle,
  Info,
  Loader2,
  Trash2,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type ConfirmDialogVariant = 'default' | 'destructive' | 'warning' | 'info';

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmDialogVariant;
  icon?: React.ReactNode;
  isLoading?: boolean;
  confirmDisabled?: boolean;
  children?: React.ReactNode;
  className?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

const variantStyles: Record<
  ConfirmDialogVariant,
  {
    iconContainer: string;
    defaultIcon: React.ReactNode;
    confirmButtonVariant: 'default' | 'destructive' | 'secondary';
  }
> = {
  destructive: {
    iconContainer:
      'bg-destructive/10 text-destructive border border-destructive/20 dark:bg-destructive/20',
    defaultIcon: <Trash2 className="size-4.5" />,
    confirmButtonVariant: 'destructive',
  },
  warning: {
    iconContainer:
      'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 dark:bg-amber-500/20',
    defaultIcon: <AlertTriangle className="size-4.5" />,
    confirmButtonVariant: 'default',
  },
  info: {
    iconContainer:
      'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 dark:bg-sky-500/20',
    defaultIcon: <Info className="size-4.5" />,
    confirmButtonVariant: 'default',
  },
  default: {
    iconContainer:
      'bg-primary/10 text-primary border border-primary/20 dark:bg-primary/20',
    defaultIcon: <HelpCircle className="size-4.5" />,
    confirmButtonVariant: 'default',
  },
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  icon,
  isLoading = false,
  confirmDisabled = false,
  children,
  className,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [isInternalPending, setIsInternalPending] = React.useState(false);
  const isPending = isLoading || isInternalPending;

  const currentVariant = variantStyles[variant] || variantStyles.default;
  const displayIcon = icon ?? currentVariant.defaultIcon;

  const handleConfirm = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      const res = onConfirm();
      if (res instanceof Promise) {
        setIsInternalPending(true);
        await res;
      }
    } finally {
      setIsInternalPending(false);
    }
  };

  const handleCancel = () => {
    if (isPending) return;
    onCancel?.();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={isPending ? () => {} : onOpenChange}>
      <AlertDialogContent
        className={cn(
          'max-w-md p-6 border border-border bg-card shadow-2xl rounded-2xl sm:rounded-2xl',
          className,
        )}
      >
        <div className="flex items-start gap-4">
          {displayIcon && (
            <div
              className={cn(
                'flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors',
                currentVariant.iconContainer,
              )}
            >
              {displayIcon}
            </div>
          )}

          <AlertDialogHeader className="space-y-1.5 text-left flex-1 min-w-0">
            <AlertDialogTitle className="text-base font-semibold text-foreground tracking-tight">
              {title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
              {description}
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>

        {children && <div className="mt-2 text-xs">{children}</div>}

        <AlertDialogFooter className="flex flex-row justify-end items-center gap-2 pt-4 border-t border-border/50">
          <AlertDialogCancel
            disabled={isPending}
            onClick={handleCancel}
            className="text-xs h-9 px-4 rounded-lg font-medium cursor-pointer transition-all hover:bg-muted"
          >
            {cancelText}
          </AlertDialogCancel>
          <Button
            type="button"
            variant={currentVariant.confirmButtonVariant}
            size="sm"
            disabled={isPending || confirmDisabled}
            onClick={handleConfirm}
            className={cn(
              'text-xs h-9 px-4 rounded-lg font-semibold gap-1.5 cursor-pointer shadow-xs active:scale-[0.98] transition-all',
              variant === 'warning' &&
                'bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-500 dark:hover:bg-amber-600 dark:text-zinc-950',
            )}
          >
            {isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : null}
            {confirmText}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
