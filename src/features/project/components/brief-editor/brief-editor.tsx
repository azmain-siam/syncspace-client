'use client';

import * as React from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { Markdown, type MarkdownStorage } from 'tiptap-markdown';
import { cn } from '@/lib/utils';
import { BriefEditorToolbar } from './brief-editor-toolbar';
import type { ProjectBriefTemplate } from '../../lib/project-brief-templates';

export interface BriefEditorProps {
  initialContent: string;
  onChange: (markdown: string) => void;
  onApplyTemplate: (template: ProjectBriefTemplate) => void;
  editorRef?: React.MutableRefObject<Editor | null>;
  className?: string;
}

export function BriefEditor({
  initialContent,
  onChange,
  onApplyTemplate,
  editorRef,
  className,
}: BriefEditorProps) {
  const lowlight = React.useMemo(() => createLowlight(common), []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: false, // Replaced by CodeBlockLowlight
      }),
      Placeholder.configure({
        placeholder: 'Start drafting your project brief or specification...',
        emptyEditorClass: 'is-editor-empty',
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Markdown.configure({
        html: false,
        transformPastedText: true,
        transformCopiedText: true,
      }),
    ],
    content: initialContent,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-neutral dark:prose-invert max-w-none text-xs sm:text-sm focus:outline-none min-h-[380px] p-6 leading-relaxed',
          'prose-headings:text-foreground prose-headings:font-bold',
          'prose-p:text-foreground/90 prose-strong:text-foreground prose-strong:font-semibold',
          'prose-code:text-foreground prose-code:font-mono prose-code:bg-muted/70 prose-code:px-1 prose-code:py-0.5 prose-code:rounded',
          'prose-pre:bg-muted/30 prose-pre:border prose-pre:border-border/60 prose-pre:rounded-xl',
        ),
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      // Extract clean GFM serialized markdown
      const storage = currentEditor.storage as unknown as {
        markdown?: MarkdownStorage;
      };
      const markdown = storage.markdown?.getMarkdown?.() ?? '';
      onChange(markdown);
    },
  });

  // Keep parent ref updated
  React.useEffect(() => {
    if (editorRef) {
      editorRef.current = editor;
    }
  }, [editor, editorRef]);

  return (
    <div className={cn('flex flex-col h-full bg-card overflow-hidden', className)}>
      <BriefEditorToolbar editor={editor} onApplyTemplate={onApplyTemplate} />
      <div className="flex-1 overflow-y-auto bg-card cursor-text">
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  );
}
