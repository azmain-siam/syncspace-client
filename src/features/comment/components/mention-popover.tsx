'use client';

import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { WorkspaceMember } from '@/types/domain';
import { cn } from '@/lib/utils';

interface MentionPopoverProps {
  members: WorkspaceMember[];
  query: string;
  selectedIndex: number;
  onSelectMember: (member: WorkspaceMember) => void;
  isOpen: boolean;
  className?: string;
}

export function MentionPopover({
  members,
  query,
  selectedIndex,
  onSelectMember,
  isOpen,
  className,
}: MentionPopoverProps) {
  const filteredMembers = React.useMemo(() => {
    if (!isOpen) return [];
    const q = query.toLowerCase().trim();
    if (!q) return members.slice(0, 8);

    return members
      .filter((m) => {
        const name = m.user?.name?.toLowerCase() || '';
        const username = m.user?.username?.toLowerCase() || '';
        const email = m.user?.email?.toLowerCase() || '';
        return name.includes(q) || username.includes(q) || email.includes(q);
      })
      .slice(0, 8);
  }, [members, query, isOpen]);

  if (!isOpen) return null;

  if (filteredMembers.length === 0) {
    return (
      <div
        className={cn(
          'absolute z-50 bottom-full mb-1 left-0 w-64 rounded-xl border border-border bg-popover p-3 shadow-lg text-xs text-muted-foreground',
          className,
        )}
      >
        No matching members found
      </div>
    );
  }

  return (
    <div
      role="listbox"
      aria-label="Mention members"
      className={cn(
        'absolute z-50 bottom-full mb-1 left-0 w-72 max-h-56 overflow-y-auto rounded-xl border border-border bg-popover p-1.5 shadow-xl scrollbar-thin',
        className,
      )}
    >
      <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
        Mention Team Member
      </div>
      {filteredMembers.map((member, index) => {
        const isSelected = index === selectedIndex;
        const user = member.user;
        const handle = user.username || user.name.toLowerCase().replace(/\s+/g, '');

        return (
          <div
            key={member.id}
            role="option"
            aria-selected={isSelected}
            onMouseDown={(e) => {
              // Prevent textarea blur
              e.preventDefault();
              onSelectMember(member);
            }}
            className={cn(
              'flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg cursor-pointer text-xs transition-colors select-none',
              isSelected
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted text-foreground',
            )}
          >
            <Avatar className="size-6 shrink-0">
              {user.avatar && (
                <AvatarImage src={user.avatar} alt={user.name} />
              )}
              <AvatarFallback
                className={cn(
                  'text-[10px] font-semibold',
                  isSelected
                    ? 'bg-white/20 text-white'
                    : 'bg-primary/10 text-primary',
                )}
              >
                {user.name ? user.name.slice(0, 2).toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-medium truncate leading-tight">
                {user.name}
              </span>
              <span
                className={cn(
                  'text-[10px] truncate',
                  isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground',
                )}
              >
                @{handle}
              </span>
            </div>

            <span
              className={cn(
                'text-[9px] font-medium px-1.5 py-0.5 rounded-sm shrink-0 uppercase tracking-wider',
                isSelected
                  ? 'bg-white/20 text-white'
                  : 'bg-muted-foreground/10 text-muted-foreground',
              )}
            >
              {member.role}
            </span>
          </div>
        );
      })}
    </div>
  );
}
