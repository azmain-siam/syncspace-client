'use client';

import * as React from 'react';
import {
  Bold,
  CheckSquare,
  Code,
  Columns2,
  Eye,
  FileCode,
  FileText,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Layers,
  List,
  ListOrdered,
  Loader2,
  PenLine,
  Quote,
  Sparkles,
  Table,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useUpdateProject } from '../hooks/use-update-project';
import {
  PROJECT_BRIEF_TEMPLATES,
  calculateBriefStats,
  type ProjectBriefTemplate,
} from '../lib/project-brief-templates';

interface ProjectBriefModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  projectId: string;
  initialBrief?: string | null;
  initialTemplateId?: string;
  projectTitle?: string;
}

type EditorMode = 'write' | 'preview' | 'split';

// High-fidelity Markdown Renderer for Preview and Viewer
export function MarkdownRenderer({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  if (!content.trim()) {
    return (
      <div className="text-center py-12 text-muted-foreground text-xs italic">
        No content to preview. Write something in Markdown or insert a template.
      </div>
    );
  }

  const lines = content.split('\n');

  return (
    <div
      className={cn(
        'space-y-3 text-xs sm:text-sm text-foreground/90 leading-relaxed font-normal',
        className,
      )}
    >
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        // H1 Heading
        if (trimmed.startsWith('# ')) {
          return (
            <h1
              key={idx}
              className="text-lg sm:text-xl font-extrabold text-foreground mt-5 pt-2 border-b border-border/60 pb-2 first:mt-0 tracking-tight"
            >
              {trimmed.slice(2)}
            </h1>
          );
        }

        // H2 Heading
        if (trimmed.startsWith('## ')) {
          return (
            <h2
              key={idx}
              className="text-base sm:text-lg font-bold text-foreground mt-4 pt-1 border-b border-border/40 pb-1.5 tracking-tight"
            >
              {trimmed.slice(3)}
            </h2>
          );
        }

        // H3 Heading
        if (trimmed.startsWith('### ')) {
          return (
            <h3
              key={idx}
              className="text-sm sm:text-base font-bold text-foreground mt-3 tracking-tight"
            >
              {trimmed.slice(4)}
            </h3>
          );
        }

        // H4 Heading
        if (trimmed.startsWith('#### ')) {
          return (
            <h4
              key={idx}
              className="text-xs sm:text-sm font-bold text-foreground mt-2"
            >
              {trimmed.slice(5)}
            </h4>
          );
        }

        // Task List Checkbox (e.g. - [ ] or - [x])
        if (trimmed.startsWith('- [ ] ') || trimmed.startsWith('- [x] ') || trimmed.startsWith('- [X] ')) {
          const isChecked = trimmed.startsWith('- [x] ') || trimmed.startsWith('- [X] ');
          const taskText = trimmed.slice(6);
          return (
            <div key={idx} className="flex items-center gap-2 pl-2 py-0.5">
              <input
                type="checkbox"
                checked={isChecked}
                readOnly
                className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-0 cursor-default"
              />
              <span className={cn('text-xs', isChecked && 'line-through text-muted-foreground')}>
                {taskText}
              </span>
            </div>
          );
        }

        // Bullet lists
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-3 py-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
              <span>{trimmed.slice(2)}</span>
            </div>
          );
        }

        // Blockquotes
        if (trimmed.startsWith('> ')) {
          return (
            <blockquote
              key={idx}
              className="border-l-3 border-primary/70 bg-primary/5 px-3.5 py-2 rounded-r-xl italic text-foreground/90 my-2"
            >
              {trimmed.slice(2)}
            </blockquote>
          );
        }

        // Horizontal Rule
        if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
          return <hr key={idx} className="border-border/60 my-4" />;
        }

        // Empty line
        if (!trimmed) {
          return <div key={idx} className="h-2" />;
        }

        return <p key={idx}>{line}</p>;
      })}
    </div>
  );
}

function getInitialBriefContent(initialBrief?: string | null, initialTemplateId?: string) {
  if (initialTemplateId) {
    const found = PROJECT_BRIEF_TEMPLATES.find((t) => t.id === initialTemplateId);
    if (found) return found.content;
  }
  return initialBrief || '';
}

function ProjectBriefModalContent({
  open,
  onOpenChange,
  workspaceId,
  projectId,
  initialBrief,
  initialTemplateId,
  projectTitle,
}: ProjectBriefModalProps) {
  const [content, setContent] = React.useState<string>(() =>
    getInitialBriefContent(initialBrief, initialTemplateId),
  );
  const [mode, setMode] = React.useState<EditorMode>('write');
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const updateMutation = useUpdateProject(workspaceId, projectId);

  const stats = React.useMemo(() => calculateBriefStats(content), [content]);

  // Insert markdown helper around selected text or at cursor
  const insertFormatting = (prefix: string, suffix = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const previous = textarea.value;
    const selected = previous.substring(start, end);

    const replacement = `${prefix}${selected || 'text'}${suffix}`;
    const nextValue =
      previous.substring(0, start) + replacement + previous.substring(end);

    setContent(nextValue);

    // Re-focus and update cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + (selected ? selected.length : 4),
      );
    }, 0);
  };

  const handleApplyTemplate = (template: ProjectBriefTemplate) => {
    if (
      content.trim().length > 0 &&
      !window.confirm(
        'Applying this template will replace your current brief draft. Do you want to proceed?',
      )
    ) {
      return;
    }
    setContent(template.content);
  };

  const handleSave = async () => {
    await updateMutation.mutateAsync({
      brief: content.trim(),
    });
    onOpenChange(false);
  };

  // Keyboard shortcut: Cmd+Enter or Ctrl+Enter to save
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      void handleSave();
    }
    // Tab key inserts 2 spaces
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const val = textarea.value;
      setContent(val.substring(0, start) + '  ' + val.substring(end));
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl sm:max-w-5xl h-[88vh] flex flex-col p-0 gap-0 overflow-hidden rounded-2xl bg-card border border-border shadow-2xl">
        {/* 1. Header Bar */}
        <DialogHeader className="p-5 border-b border-border/80 bg-muted/20 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                  <span>Project Brief & Specification</span>
                  {projectTitle && (
                    <span className="text-xs font-normal text-muted-foreground hidden sm:inline">
                      · {projectTitle}
                    </span>
                  )}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Document strategic context, core requirements, technical decisions, and release KPIs.
                </DialogDescription>
              </div>
            </div>

            {/* Reading Telemetry & Mode Buttons */}
            <div className="flex items-center gap-2">
              <div className="text-[11px] font-mono text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-lg border border-border/60 shrink-0 hidden sm:flex items-center gap-1.5">
                <span>{stats.words} words</span>
                <span>·</span>
                <span>~{stats.minutes} min read</span>
              </div>

              {/* View Switcher Tabs */}
              <div className="flex items-center p-0.5 rounded-xl border border-border bg-muted/40 shrink-0">
                <button
                  type="button"
                  onClick={() => setMode('write')}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer',
                    mode === 'write'
                      ? 'bg-card text-foreground shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                  title="Write mode"
                >
                  <PenLine className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Write</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMode('preview')}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer',
                    mode === 'preview'
                      ? 'bg-card text-foreground shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                  title="Preview mode"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Preview</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMode('split')}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer hidden md:flex',
                    mode === 'split'
                      ? 'bg-card text-foreground shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                  title="Split side-by-side mode"
                >
                  <Columns2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Split</span>
                </button>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* 2. Formatting Toolbar (visible in write and split modes) */}
        {mode !== 'preview' && (
          <div className="px-4 py-2 border-b border-border/60 bg-muted/10 flex flex-wrap items-center justify-between gap-2 shrink-0 text-xs">
            <div className="flex items-center flex-wrap gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertFormatting('# ')}
                className="h-7 w-7 p-0 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                title="Heading 1"
              >
                <Heading1 className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertFormatting('## ')}
                className="h-7 w-7 p-0 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                title="Heading 2"
              >
                <Heading2 className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertFormatting('### ')}
                className="h-7 w-7 p-0 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                title="Heading 3"
              >
                <Heading3 className="h-3.5 w-3.5" />
              </Button>

              <div className="h-4 w-px bg-border/60 mx-1" />

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertFormatting('**', '**')}
                className="h-7 w-7 p-0 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                title="Bold"
              >
                <Bold className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertFormatting('*', '*')}
                className="h-7 w-7 p-0 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                title="Italic"
              >
                <Italic className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertFormatting('`', '`')}
                className="h-7 w-7 p-0 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                title="Inline Code"
              >
                <Code className="h-3.5 w-3.5" />
              </Button>

              <div className="h-4 w-px bg-border/60 mx-1" />

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertFormatting('- ')}
                className="h-7 w-7 p-0 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                title="Bullet List"
              >
                <List className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertFormatting('1. ')}
                className="h-7 w-7 p-0 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                title="Numbered List"
              >
                <ListOrdered className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertFormatting('- [ ] ')}
                className="h-7 w-7 p-0 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                title="Checklist Item"
              >
                <CheckSquare className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertFormatting('> ')}
                className="h-7 w-7 p-0 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                title="Quote"
              >
                <Quote className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertFormatting('```typescript\n', '\n```')}
                className="h-7 w-7 p-0 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                title="Code Block"
              >
                <FileCode className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  insertFormatting(
                    '| Feature | Status | Notes |\n|---|---|---|\n| Item 1 | In Progress | Planned |\n',
                  )
                }
                className="h-7 w-7 p-0 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                title="Insert Table"
              >
                <Table className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Template Selector Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2.5 rounded-lg text-xs gap-1.5 cursor-pointer shadow-2xs font-semibold"
                >
                  <Sparkles className="h-3 w-3 text-primary" />
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
                    onClick={() => handleApplyTemplate(tmpl)}
                    className="cursor-pointer space-y-0.5 flex flex-col items-start p-2"
                  >
                    <div className="font-semibold text-xs flex items-center gap-1.5 text-foreground">
                      <Layers className="h-3 w-3 text-primary" />
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
        )}

        {/* 3. Main Editor & Preview Workspace */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 relative">
          {mode === 'write' && (
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Write your project brief in Markdown (e.g., # Overview, ## Objectives, - Goals, etc.)..."
              className="w-full h-full p-6 font-mono text-xs sm:text-sm bg-background/50 resize-none focus:outline-none focus:ring-0 leading-relaxed text-foreground placeholder:text-muted-foreground/60 overflow-y-auto"
              aria-label="Project Brief Content"
            />
          )}

          {mode === 'preview' && (
            <div className="w-full h-full p-6 overflow-y-auto bg-card">
              <div className="max-w-3xl mx-auto">
                <MarkdownRenderer content={content} />
              </div>
            </div>
          )}

          {mode === 'split' && (
            <div className="grid grid-cols-2 divide-x divide-border/60 h-full">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Write your project brief in Markdown..."
                className="w-full h-full p-5 font-mono text-xs bg-background/50 resize-none focus:outline-none focus:ring-0 leading-relaxed text-foreground placeholder:text-muted-foreground/60 overflow-y-auto"
                aria-label="Project Brief Markdown"
              />
              <div className="w-full h-full p-5 overflow-y-auto bg-card">
                <MarkdownRenderer content={content} />
              </div>
            </div>
          )}
        </div>

        {/* 4. Footer */}
        <DialogFooter className="p-4 border-t border-border/80 bg-muted/20 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <span>Markdown supported</span>
            <span>·</span>
            <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px] font-mono">
              Ctrl+Enter
            </kbd>{' '}
            <span>to save</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="rounded-xl text-xs h-9 px-3 cursor-pointer"
            >
              Cancel
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={() => void handleSave()}
              disabled={updateMutation.isPending}
              className="rounded-xl text-xs h-9 px-4 cursor-pointer gap-1.5 font-bold"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Saving Brief...</span>
                </>
              ) : (
                <>
                  <FileText className="h-3.5 w-3.5" />
                  <span>Save Project Brief</span>
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ProjectBriefModal(props: ProjectBriefModalProps) {
  if (!props.open) return null;

  return (
    <ProjectBriefModalContent
      {...props}
      key={`${props.projectId}-${props.initialTemplateId || 'custom'}`}
    />
  );
}
