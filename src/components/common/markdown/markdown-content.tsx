'use client';

import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { cn } from '@/lib/utils';
import { markdownComponents } from './markdown-components';

export interface MarkdownContentProps {
  content?: string | null;
  className?: string;
  compact?: boolean;
}

export function MarkdownContent({
  content,
  className,
  compact = false,
}: MarkdownContentProps) {
  if (!content || !content.trim()) {
    return null;
  }

  return (
    <div
      className={cn(
        'prose prose-neutral dark:prose-invert max-w-none text-xs leading-relaxed',
        'prose-headings:text-foreground prose-p:text-foreground/90 prose-strong:text-foreground prose-strong:font-semibold',
        'prose-code:text-foreground prose-pre:bg-muted/30 prose-hr:border-border/60',
        compact && 'prose-sm space-y-1 [&_p]:my-1 [&_h1]:text-sm [&_h2]:text-xs [&_h3]:text-xs [&_ul]:my-1 [&_ol]:my-1',
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
