'use client';

import * as React from 'react';
import type { Components } from 'react-markdown';
import { cn } from '@/lib/utils';

export const markdownComponents: Components = {
  // Links: open securely in new tab
  a: ({ href, children, ...props }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
      {...props}
    >
      {children}
    </a>
  ),

  // Tables: responsive overflow wrapper with styled header and borders
  table: ({ children, ...props }) => (
    <div className="my-4 w-full overflow-x-auto rounded-xl border border-border/80 bg-card/60 shadow-2xs">
      <table className="w-full border-collapse text-xs" {...props}>
        {children}
      </table>
    </div>
  ),

  thead: ({ children, ...props }) => (
    <thead
      className="bg-muted/50 border-b border-border/70 text-left font-semibold text-foreground"
      {...props}
    >
      {children}
    </thead>
  ),

  th: ({ children, ...props }) => (
    <th
      className="px-3.5 py-2.5 font-semibold text-foreground text-left"
      {...props}
    >
      {children}
    </th>
  ),

  td: ({ children, ...props }) => (
    <td
      className="px-3.5 py-2 border-t border-border/40 text-foreground/90 align-top"
      {...props}
    >
      {children}
    </td>
  ),

  // Code: distinct styling for inline badges vs syntax-highlighted blocks
  code: ({ className, children, ...props }) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code
          className="rounded-md bg-muted/80 px-1.5 py-0.5 font-mono text-[11px] font-medium text-foreground border border-border/50"
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <code className={cn('font-mono text-xs', className)} {...props}>
        {children}
      </code>
    );
  },

  // Code Block Container
  pre: ({ children, ...props }) => (
    <div className="my-4 rounded-xl border border-border/80 bg-muted/30 overflow-hidden shadow-2xs">
      <pre
        className="p-4 overflow-x-auto font-mono text-xs leading-relaxed"
        {...props}
      >
        {children}
      </pre>
    </div>
  ),

  // Blockquotes: clean callout card styling
  blockquote: ({ children, ...props }) => (
    <blockquote
      className="my-3 border-l-3 border-primary/70 bg-muted/20 py-2 px-4 rounded-r-lg text-muted-foreground italic text-xs leading-relaxed"
      {...props}
    >
      {children}
    </blockquote>
  ),

  // Lists: support standard bullets, ordered, and GFM task checklists
  ul: ({ className, children, ...props }) => {
    const isTaskList = className?.includes('contains-task-list');
    return (
      <ul
        className={cn(
          isTaskList
            ? 'list-none pl-0 space-y-1 my-2'
            : 'list-disc pl-5 space-y-1 my-2',
          className,
        )}
        {...props}
      >
        {children}
      </ul>
    );
  },

  ol: ({ className, children, ...props }) => (
    <ol
      className={cn('list-decimal pl-5 space-y-1 my-2', className)}
      {...props}
    >
      {children}
    </ol>
  ),

  li: ({ className, children, ...props }) => {
    const isTaskItem = className?.includes('task-list-item');
    if (isTaskItem) {
      // Flatten children: react-markdown wraps the label text in a <p>,
      // which adds top/bottom margin and causes the checkbox to misalign.
      // We render the children directly inside an aligned flex row.
      return (
        <li
          className={cn('flex items-center gap-2 list-none my-0.5', className)}
          {...props}
        >
          {children}
        </li>
      );
    }
    return (
      <li
        className={cn('leading-relaxed text-xs text-foreground/90', className)}
        {...props}
      >
        {children}
      </li>
    );
  },

  // Checkbox input for GFM task lists
  input: ({ type, checked, ...props }) => {
    if (type === 'checkbox') {
      return (
        <input
          type="checkbox"
          checked={checked}
          disabled
          aria-label="Task checklist item"
          className="h-3.5 w-3.5 shrink-0 rounded border-border text-primary accent-primary m-0 cursor-default pointer-events-none self-center"
          {...props}
        />
      );
    }
    return <input type={type} {...props} />;
  },

  // Headings with consistent margins and crisp typography
  h1: ({ children, ...props }) => (
    <h1
      className="text-lg font-bold text-foreground mt-6 mb-2 tracking-tight first:mt-0"
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2
      className="text-base font-bold text-foreground mt-5 mb-2 tracking-tight first:mt-0"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3
      className="text-sm font-bold text-foreground mt-4 mb-1.5 tracking-tight first:mt-0"
      {...props}
    >
      {children}
    </h3>
  ),

  // Paragraphs
  p: ({ children, ...props }) => (
    <p className="text-xs leading-relaxed text-foreground/90 my-2" {...props}>
      {children}
    </p>
  ),

  // Horizontal divider
  hr: ({ ...props }) => <hr className="my-5 border-border/60" {...props} />,
};
