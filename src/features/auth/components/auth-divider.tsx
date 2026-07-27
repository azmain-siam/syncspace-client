'use client';

import * as React from 'react';

export function AuthDivider({ text = 'OR CONTINUE WITH EMAIL' }: { text?: string }) {
  return (
    <div className="relative my-6 flex items-center justify-center">
      <div className="w-full border-t border-border/80" />
      <span className="absolute bg-background px-3 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70">
        {text}
      </span>
    </div>
  );
}
