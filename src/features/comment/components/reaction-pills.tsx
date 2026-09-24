'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { AggregatedReaction } from '../types/comment.types';
import { EmojiPickerPopover } from './emoji-picker-popover';

interface ReactionPillsProps {
  reactions?: AggregatedReaction[];
  onToggleReaction: (emoji: string) => void;
  disabled?: boolean;
  className?: string;
}

export function ReactionPills({
  reactions = [],
  onToggleReaction,
  disabled = false,
  className,
}: ReactionPillsProps) {
  // Generate friendly tooltip text
  const formatTooltip = (reaction: AggregatedReaction) => {
    const userNames = (reaction.users || [])
      .map((u) => u.name)
      .filter(Boolean);

    if (userNames.length === 0) {
      return `${reaction.count} reacted with ${reaction.emoji}`;
    }

    if (userNames.length === 1) {
      return `${userNames[0]} reacted with ${reaction.emoji}`;
    }

    if (userNames.length === 2) {
      return `${userNames[0]} and ${userNames[1]} reacted with ${reaction.emoji}`;
    }

    const firstTwo = userNames.slice(0, 2).join(', ');
    const remaining = userNames.length - 2;
    return `${firstTwo}, and ${remaining} more reacted with ${reaction.emoji}`;
  };

  return (
    <div className={cn('flex flex-wrap items-center gap-1.5 pt-1.5', className)}>
      {reactions.map((reaction) => (
        <button
          key={reaction.emoji}
          type="button"
          disabled={disabled}
          onClick={() => onToggleReaction(reaction.emoji)}
          title={formatTooltip(reaction)}
          aria-label={`Reaction ${reaction.emoji}, ${reaction.count} users`}
          className={cn(
            'inline-flex items-center gap-1 h-6 px-2 rounded-full text-xs font-medium border transition-all cursor-pointer select-none active:scale-95',
            reaction.hasReacted
              ? 'bg-primary/15 border-primary/50 text-primary hover:bg-primary/20 shadow-xs'
              : 'bg-muted/50 border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted/80',
            disabled && 'opacity-50 cursor-not-allowed',
          )}
        >
          <span className="text-xs leading-none">{reaction.emoji}</span>
          <span className="text-[11px] font-semibold">{reaction.count}</span>
        </button>
      ))}

      {/* Add reaction picker button */}
      <EmojiPickerPopover
        onSelectEmoji={onToggleReaction}
        triggerVariant="pill"
        disabled={disabled}
      />
    </div>
  );
}
