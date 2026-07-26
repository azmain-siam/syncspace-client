'use client';

import * as React from 'react';
import { Separator } from '@/components/ui/separator';

export function AuthDivider({ text = 'or continue with' }: { text?: string }) {
  return (
    <div className="relative my-4 flex items-center justify-center">
      <Separator className="absolute inset-0 my-auto" />
      <span className="relative bg-card px-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {text}
      </span>
    </div>
  );
}
