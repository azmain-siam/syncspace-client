import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm text-foreground transition-all duration-150 placeholder:text-muted-foreground/60 focus:border-primary focus:shadow-[0_0_0_3px_rgba(70,72,212,0.12)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-danger focus:border-danger focus:shadow-[0_0_0_3px_rgba(186,26,26,0.12)]',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export { Input };
