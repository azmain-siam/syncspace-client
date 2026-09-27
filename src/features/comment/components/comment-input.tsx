'use client';

import * as React from 'react';
import { Loader2, Send } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/features/auth/stores/use-auth-store';
import { useWorkspaceMembers } from '@/features/workspace/hooks/use-workspace-members';
import type { WorkspaceMember } from '@/types/domain';
import { cn } from '@/lib/utils';
import { MentionPopover } from './mention-popover';

interface CommentInputProps {
  workspaceId: string;
  onSubmit: (content: string) => Promise<unknown> | void;
  isSubmitting?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
}

const MAX_CHARS = 3000;

export function CommentInput({
  workspaceId,
  onSubmit,
  isSubmitting = false,
  placeholder = 'Write a comment... Use @ to mention someone',
  autoFocus = false,
  className,
}: CommentInputProps) {
  const currentUser = useAuthStore((state) => state.user);
  const { data: membersResponse } = useWorkspaceMembers(workspaceId);
  const members = React.useMemo(() => membersResponse?.data || [], [membersResponse]);

  const [content, setContent] = React.useState('');
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Mention autocomplete state
  const [mentionQuery, setMentionQuery] = React.useState<string | null>(null);
  const [mentionStartIndex, setMentionStartIndex] = React.useState<number>(-1);
  const [selectedMentionIndex, setSelectedMentionIndex] = React.useState(0);

  // Filtered members count for keyboard clamp
  const matchingMembers = React.useMemo(() => {
    if (mentionQuery === null) return [];
    const q = mentionQuery.toLowerCase().trim();
    if (!q) return members.slice(0, 8);
    return members
      .filter((m) => {
        const name = m.user?.name?.toLowerCase() || '';
        const username = m.user?.username?.toLowerCase() || '';
        const email = m.user?.email?.toLowerCase() || '';
        return name.includes(q) || username.includes(q) || email.includes(q);
      })
      .slice(0, 8);
  }, [members, mentionQuery]);

  const isMentionOpen = mentionQuery !== null && matchingMembers.length > 0;

  // Auto-resize textarea
  const adjustHeight = React.useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val.length > MAX_CHARS) return;
    setContent(val);
    adjustHeight();

    // Check for @mention trigger
    const cursor = e.target.selectionStart;
    const textBeforeCursor = val.slice(0, cursor);
    const atIndex = textBeforeCursor.lastIndexOf('@');

    if (atIndex !== -1) {
      // Must be at start of line or preceded by whitespace
      const charBeforeAt = atIndex > 0 ? textBeforeCursor[atIndex - 1] : ' ';
      if (/\s/.test(charBeforeAt)) {
        const queryText = textBeforeCursor.slice(atIndex + 1);
        // Valid query shouldn't contain newline or space
        if (!/[\s\n]/.test(queryText)) {
          setMentionQuery(queryText);
          setMentionStartIndex(atIndex);
          setSelectedMentionIndex(0);
          return;
        }
      }
    }

    setMentionQuery(null);
    setMentionStartIndex(-1);
  };

  const handleSelectMember = (member: WorkspaceMember) => {
    if (mentionStartIndex === -1) return;

    const user = member.user;
    const handle = user.username || user.name.toLowerCase().replace(/\s+/g, '');
    const mentionText = `@${handle} `;

    const cursor = textareaRef.current?.selectionStart || content.length;
    const beforeMention = content.slice(0, mentionStartIndex);
    const afterMention = content.slice(cursor);

    const nextContent = beforeMention + mentionText + afterMention;
    setContent(nextContent);
    setMentionQuery(null);
    setMentionStartIndex(-1);

    // Reposition cursor
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const nextPos = beforeMention.length + mentionText.length;
        textareaRef.current.setSelectionRange(nextPos, nextPos);
        adjustHeight();
      }
    }, 0);
  };

  const handleSubmit = async () => {
    const trimmed = content.trim();
    if (!trimmed || isSubmitting) return;

    try {
      await onSubmit(trimmed);
      setContent('');
      setMentionQuery(null);
      setMentionStartIndex(-1);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch {
      // Handled by mutation onError
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (isMentionOpen) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedMentionIndex((prev) =>
          prev < matchingMembers.length - 1 ? prev + 1 : 0,
        );
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedMentionIndex((prev) =>
          prev > 0 ? prev - 1 : matchingMembers.length - 1,
        );
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        if (matchingMembers[selectedMentionIndex]) {
          handleSelectMember(matchingMembers[selectedMentionIndex]);
        }
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setMentionQuery(null);
        return;
      }
    }

    // Submit on Cmd+Enter / Ctrl+Enter
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={cn('relative flex gap-3 pt-2', className)}>
      {/* Current User Avatar */}
      <Avatar className="size-7 shrink-0 mt-0.5 ring-1 ring-border/50">
        {currentUser?.avatar && (
          <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
        )}
        <AvatarFallback className="text-[10px] font-semibold bg-primary/10 text-primary">
          {currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : 'ME'}
        </AvatarFallback>
      </Avatar>

      {/* Input container */}
      <div className="relative flex-1">
        {/* Mention Autocomplete Dropdown */}
        <MentionPopover
          members={matchingMembers}
          query={mentionQuery || ''}
          selectedIndex={selectedMentionIndex}
          onSelectMember={handleSelectMember}
          isOpen={isMentionOpen}
        />

        <div className="relative rounded-xl border border-border/80 bg-muted/20 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/40 focus-within:bg-background transition-all">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={isSubmitting}
            autoFocus={autoFocus}
            placeholder={placeholder}
            rows={2}
            className="w-full bg-transparent px-3 pt-2.5 pb-8 text-xs leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-hidden resize-none scrollbar-thin"
          />

          {/* Bottom Bar: char counter + submit button */}
          <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between pointer-events-none">
            <span
              className={cn(
                'text-[10px] font-mono tracking-tight transition-colors pl-1',
                content.length > MAX_CHARS * 0.9
                  ? 'text-destructive font-semibold'
                  : 'text-muted-foreground/60',
              )}
            >
              {content.length > 0 && `${content.length}/${MAX_CHARS}`}
            </span>

            <div className="flex items-center gap-2 pointer-events-auto">
              <span className="hidden sm:inline-block text-[10px] text-muted-foreground/60 select-none">
                ⌘+Enter
              </span>
              <Button
                type="button"
                size="sm"
                onClick={handleSubmit}
                disabled={!content.trim() || isSubmitting}
                className="h-6 px-2.5 rounded-lg text-xs font-medium gap-1 shadow-xs border-t border-white/20 active:scale-98 cursor-pointer"
              >
                {isSubmitting ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <>
                    <span>Comment</span>
                    <Send className="size-2.5 ml-0.5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
