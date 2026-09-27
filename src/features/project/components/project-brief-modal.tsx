'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import type { Editor } from '@tiptap/react';
import {
  Eye,
  FileText,
  Loader2,
  PenLine,
  Sparkles,
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
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { MarkdownContent } from '@/components/common/markdown';
import { useUpdateProject } from '../hooks/use-update-project';
import {
  PROJECT_BRIEF_TEMPLATES,
  calculateBriefStats,
  type ProjectBriefTemplate,
} from '../lib/project-brief-templates';

// Lazily load Tiptap editor on client to prevent SSR DOM hydration issues
const BriefEditor = dynamic(
  () => import('./brief-editor').then((mod) => mod.BriefEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[380px] items-center justify-center bg-card text-muted-foreground gap-2">
        <Loader2 className="size-5 animate-spin text-primary" />
        <span className="text-xs font-medium">Loading rich brief editor...</span>
      </div>
    ),
  },
);

interface ProjectBriefModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  projectId: string;
  initialBrief?: string | null;
  initialTemplateId?: string;
  projectTitle?: string;
}

type EditorMode = 'edit' | 'preview';

// Backward-compatible MarkdownRenderer wrapper for existing consumers
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

  return <MarkdownContent content={content} className={className} />;
}

function getInitialBriefContent(
  initialBrief?: string | null,
  initialTemplateId?: string,
) {
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
  const [mode, setMode] = React.useState<EditorMode>('edit');
  const editorRef = React.useRef<Editor | null>(null);

  const updateMutation = useUpdateProject(workspaceId, projectId);
  const stats = React.useMemo(() => calculateBriefStats(content), [content]);

  const [pendingTemplate, setPendingTemplate] =
    React.useState<ProjectBriefTemplate | null>(null);
  const [confirmTemplateOpen, setConfirmTemplateOpen] = React.useState(false);

  const handleApplyTemplate = (template: ProjectBriefTemplate) => {
    if (content.trim().length > 0) {
      setPendingTemplate(template);
      setConfirmTemplateOpen(true);
      return;
    }
    editorRef.current?.commands.setContent(template.content);
    setContent(template.content);
    toast.info(`Applied "${template.title}" template`);
  };

  const handleConfirmTemplate = () => {
    if (pendingTemplate) {
      editorRef.current?.commands.setContent(pendingTemplate.content);
      setContent(pendingTemplate.content);
      toast.info(`Applied "${pendingTemplate.title}" template`);
      setPendingTemplate(null);
    }
    setConfirmTemplateOpen(false);
  };

  const handleSave = React.useCallback(async () => {
    try {
      await updateMutation.mutateAsync({
        brief: content.trim(),
      });
      onOpenChange(false);
    } catch {
      // Error notification handled by useUpdateProject mutation
    }
  }, [content, onOpenChange, updateMutation]);

  // Keyboard shortcut: Cmd+Enter or Ctrl+Enter to save
  React.useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        void handleSave();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handleSave]);

  return (
    <>
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

                {/* View Switcher Tabs (Accessible role="tablist") */}
                <div
                  role="tablist"
                  aria-label="Editor View Modes"
                  className="flex items-center p-0.5 rounded-xl border border-border bg-muted/40 shrink-0"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={mode === 'edit'}
                    onClick={() => setMode('edit')}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer',
                      mode === 'edit'
                        ? 'bg-card text-foreground shadow-2xs'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                    title="Rich editor mode"
                  >
                    <PenLine className="h-3.5 w-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    role="tab"
                    aria-selected={mode === 'preview'}
                    onClick={() => setMode('preview')}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer',
                      mode === 'preview'
                        ? 'bg-card text-foreground shadow-2xs'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                    title="Live preview mode"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Preview</span>
                  </button>
                </div>
              </div>
            </div>
          </DialogHeader>

          {/* 2. Main Editor & Preview Workspace */}
          <div className="flex-1 overflow-hidden relative bg-card">
            {mode === 'edit' && (
              <BriefEditor
                initialContent={content}
                onChange={(md) => setContent(md)}
                onApplyTemplate={handleApplyTemplate}
                editorRef={editorRef}
                className="h-full"
              />
            )}

            {mode === 'preview' && (
              <div className="w-full h-full p-6 overflow-y-auto bg-card">
                <div className="max-w-3xl mx-auto">
                  <MarkdownContent content={content} />
                </div>
              </div>
            )}
          </div>

          {/* 3. Footer Bar */}
          <DialogFooter className="p-4 border-t border-border/80 bg-muted/20 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              <span>ProseMirror powered</span>
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

      {/* Professional Confirmation Modal for Template Replacement */}
      <ConfirmDialog
        open={confirmTemplateOpen}
        onOpenChange={(isOpen) => {
          setConfirmTemplateOpen(isOpen);
          if (!isOpen) setPendingTemplate(null);
        }}
        title="Replace current brief draft?"
        description={
          <span>
            Applying the{' '}
            <strong className="text-foreground font-semibold">
              {pendingTemplate?.title}
            </strong>{' '}
            template will overwrite your current draft in the editor. Any unsaved
            changes will be replaced.
          </span>
        }
        confirmText="Apply Template"
        cancelText="Keep Current Draft"
        variant="warning"
        icon={<Sparkles className="size-4.5" />}
        onConfirm={handleConfirmTemplate}
      />
    </>
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
