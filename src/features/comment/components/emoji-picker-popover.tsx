'use client';

import * as React from 'react';
import { Smile, Plus } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface EmojiPickerPopoverProps {
  onSelectEmoji: (emoji: string) => void;
  triggerVariant?: 'icon' | 'pill';
  disabled?: boolean;
  className?: string;
}

const COMMON_EMOJIS = [
  '👍', '❤️', '🎉', '🚀', '👀', '😄', '🔥', '💯',
  '👏', '🙌', '✨', '💡', '💪', '🤝', '🎯', '📌',
];

export function EmojiPickerPopover({
  onSelectEmoji,
  triggerVariant = 'pill',
  disabled = false,
  className,
}: EmojiPickerPopoverProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (emoji: string) => {
    onSelectEmoji(emoji);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        {triggerVariant === 'pill' ? (
          <button
            type="button"
            aria-label="Add reaction"
            className={cn(
              'inline-flex items-center justify-center gap-1 h-6 px-1.5 rounded-full border border-border/70 bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-medium transition-colors cursor-pointer select-none active:scale-95',
              disabled && 'opacity-50 cursor-not-allowed',
              className,
            )}
          >
            <Plus className="size-3" />
            <Smile className="size-3" />
          </button>
        ) : (
          <button
            type="button"
            aria-label="Add reaction"
            className={cn(
              'inline-flex items-center justify-center size-6 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer active:scale-95',
              disabled && 'opacity-50 cursor-not-allowed',
              className,
            )}
          >
            <Smile className="size-3.5" />
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="top"
        sideOffset={6}
        className="w-56 p-2 rounded-xl shadow-lg border border-border bg-popover"
      >
        <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1 pb-1.5">
          Reactions
        </div>
        <div className="grid grid-cols-4 gap-1">
          {COMMON_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleSelect(emoji)}
              className="flex items-center justify-center h-8 w-8 rounded-lg hover:bg-muted/80 text-base transition-transform hover:scale-110 active:scale-95 cursor-pointer"
            >
              {emoji}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
