'use client';

import * as React from 'react';
import type { Editor } from '@tiptap/react';
import {
  Bold,
  CheckSquare,
  Code,
  FileCode,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Layers,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo,
  Sparkles,
  Table as TableIcon,
  Undo,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import {
  PROJECT_BRIEF_TEMPLATES,
  type ProjectBriefTemplate,
} from '../../lib/project-brief-templates';

interface BriefEditorToolbarProps {
  editor: Editor | null;
  onApplyTemplate: (template: ProjectBriefTemplate) => void;
}

interface ToolbarButtonProps {
  label: string;
  shortcut?: string;
  icon: React.ReactNode;
  isActive?: boolean;
  isDisabled?: boolean;
  onClick: () => void;
}

function ToolbarButton({
  label,
  shortcut,
  icon,
  isActive = false,
  isDisabled = false,
  onClick,
}: ToolbarButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={label}
          aria-pressed={isActive}
          disabled={isDisabled}
          onClick={onClick}
          className={cn(
            'inline-flex size-7 items-center justify-center rounded-lg text-xs transition-all cursor-pointer select-none',
            'disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed',
            isActive
              ? 'bg-primary/15 text-primary font-semibold shadow-2xs'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/70',
          )}
        >
          {icon}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs flex items-center gap-1.5 py-1 px-2">
        <span>{label}</span>
        {shortcut && (
          <kbd className="font-mono text-[10px] text-muted-foreground bg-muted px-1 rounded border border-border/60">
            {shortcut}
          </kbd>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

export function BriefEditorToolbar({
  editor,
  onApplyTemplate,
}: BriefEditorToolbarProps) {
  if (!editor) {
    return null;
  }

  return (
    <TooltipProvider delayDuration={250}>
      <div
        role="toolbar"
        aria-label="Brief Formatting Toolbar"
        className="px-4 py-2 border-b border-border/60 bg-muted/10 flex flex-wrap items-center justify-between gap-2 shrink-0 text-xs select-none"
      >
        <div className="flex items-center flex-wrap gap-0.5 sm:gap-1">
          {/* Headings */}
          <ToolbarButton
            label="Heading 1"
            shortcut="Ctrl+Alt+1"
            icon={<Heading1 className="size-3.5" />}
            isActive={editor.isActive('heading', { level: 1 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
          />
          <ToolbarButton
            label="Heading 2"
            shortcut="Ctrl+Alt+2"
            icon={<Heading2 className="size-3.5" />}
            isActive={editor.isActive('heading', { level: 2 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
          />
          <ToolbarButton
            label="Heading 3"
            shortcut="Ctrl+Alt+3"
            icon={<Heading3 className="size-3.5" />}
            isActive={editor.isActive('heading', { level: 3 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
          />

          <div className="h-4 w-px bg-border/60 mx-1" />

          {/* Inline styles */}
          <ToolbarButton
            label="Bold"
            shortcut="⌘B"
            icon={<Bold className="size-3.5" />}
            isActive={editor.isActive('bold')}
            onClick={() => editor.chain().focus().toggleBold().run()}
          />
          <ToolbarButton
            label="Italic"
            shortcut="⌘I"
            icon={<Italic className="size-3.5" />}
            isActive={editor.isActive('italic')}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          />
          <ToolbarButton
            label="Inline Code"
            shortcut="⌘E"
            icon={<Code className="size-3.5" />}
            isActive={editor.isActive('code')}
            onClick={() => editor.chain().focus().toggleCode().run()}
          />

          <div className="h-4 w-px bg-border/60 mx-1" />

          {/* Lists */}
          <ToolbarButton
            label="Bullet List"
            shortcut="⇧⌘8"
            icon={<List className="size-3.5" />}
            isActive={editor.isActive('bulletList')}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          />
          <ToolbarButton
            label="Numbered List"
            shortcut="⇧⌘7"
            icon={<ListOrdered className="size-3.5" />}
            isActive={editor.isActive('orderedList')}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          />
          <ToolbarButton
            label="Task Checklist"
            shortcut="⇧⌘9"
            icon={<CheckSquare className="size-3.5" />}
            isActive={editor.isActive('taskList')}
            onClick={() => editor.chain().focus().toggleTaskList().run()}
          />

          <div className="h-4 w-px bg-border/60 mx-1" />

          {/* Blocks */}
          <ToolbarButton
            label="Blockquote"
            icon={<Quote className="size-3.5" />}
            isActive={editor.isActive('blockquote')}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          />
          <ToolbarButton
            label="Code Block"
            icon={<FileCode className="size-3.5" />}
            isActive={editor.isActive('codeBlock')}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          />
          <ToolbarButton
            label="Insert Table"
            icon={<TableIcon className="size-3.5" />}
            isActive={editor.isActive('table')}
            onClick={() =>
              editor
                .chain()
                .focus()
                .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                .run()
            }
          />
          <ToolbarButton
            label="Horizontal Rule"
            icon={<Minus className="size-3.5" />}
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
          />

          <div className="h-4 w-px bg-border/60 mx-1" />

          {/* History */}
          <ToolbarButton
            label="Undo"
            shortcut="⌘Z"
            icon={<Undo className="size-3.5" />}
            isDisabled={!editor.can().undo()}
            onClick={() => editor.chain().focus().undo().run()}
          />
          <ToolbarButton
            label="Redo"
            shortcut="⇧⌘Z"
            icon={<Redo className="size-3.5" />}
            isDisabled={!editor.can().redo()}
            onClick={() => editor.chain().focus().redo().run()}
          />
        </div>

        {/* Template Selector Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2.5 rounded-lg text-xs gap-1.5 cursor-pointer shadow-2xs font-semibold"
            >
              <Sparkles className="size-3 text-primary" />
              <span>Insert Template</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel className="text-xs">
              Pre-built PRD Templates
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {PROJECT_BRIEF_TEMPLATES.map((tmpl) => (
              <DropdownMenuItem
                key={tmpl.id}
                onClick={() => onApplyTemplate(tmpl)}
                className="cursor-pointer space-y-0.5 flex flex-col items-start p-2"
              >
                <div className="font-semibold text-xs flex items-center gap-1.5 text-foreground">
                  <Layers className="size-3 text-primary" />
                  <span>{tmpl.title}</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  {tmpl.subtitle}
                </p>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </TooltipProvider>
  );
}
