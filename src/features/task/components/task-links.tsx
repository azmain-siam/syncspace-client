'use client';

import * as React from 'react';
import {
  ExternalLink,
  Globe,
  Loader2,
  Plus,
  Trash2,
  Copy,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  useLinks,
  useCreateLink,
  useDeleteLink,
} from '../hooks/use-links';
import type { LinkType, TaskLink } from '../types/task.types';

const LINK_TYPE_CONFIG: Record<
  LinkType,
  { label: string; bg: string; text: string; border: string }
> = {
  FIGMA: {
    label: 'Figma',
    bg: 'bg-purple-500/10',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-500/20',
  },
  GITHUB: {
    label: 'GitHub',
    bg: 'bg-slate-500/10',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-500/20',
  },
  GOOGLE_DOC: {
    label: 'Google Doc',
    bg: 'bg-blue-500/10',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-500/20',
  },
  NOTION: {
    label: 'Notion',
    bg: 'bg-stone-500/10',
    text: 'text-stone-700 dark:text-stone-300',
    border: 'border-stone-500/20',
  },
  SWAGGER: {
    label: 'Swagger / API',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/20',
  },
  LOOM: {
    label: 'Loom',
    bg: 'bg-amber-500/10',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/20',
  },
  WEBSITE: {
    label: 'Website',
    bg: 'bg-sky-500/10',
    text: 'text-sky-600 dark:text-sky-400',
    border: 'border-sky-500/20',
  },
  OTHER: {
    label: 'Resource',
    bg: 'bg-primary/10',
    text: 'text-primary',
    border: 'border-primary/20',
  },
};

interface TaskLinksProps {
  taskId: string;
  canManage?: boolean;
}

export function TaskLinks({ taskId, canManage = true }: TaskLinksProps) {
  const { data: linksResponse, isLoading } = useLinks(taskId);
  const links = linksResponse?.data || [];

  const createMutation = useCreateLink(taskId);
  const deleteMutation = useDeleteLink(taskId);

  const [isAdding, setIsAdding] = React.useState(false);
  const [title, setTitle] = React.useState('');
  const [url, setUrl] = React.useState('');
  const [type, setType] = React.useState<LinkType>('OTHER');
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  // Auto detect type based on URL
  const handleUrlChange = (value: string) => {
    setUrl(value);
    const lower = value.toLowerCase();
    if (lower.includes('figma.com')) setType('FIGMA');
    else if (lower.includes('github.com')) setType('GITHUB');
    else if (lower.includes('docs.google.com')) setType('GOOGLE_DOC');
    else if (lower.includes('notion.so') || lower.includes('notion.site')) setType('NOTION');
    else if (lower.includes('loom.com')) setType('LOOM');
    else if (lower.includes('swagger') || lower.includes('openapi')) setType('SWAGGER');
    else if (lower.startsWith('http://') || lower.startsWith('https://')) setType('WEBSITE');
  };

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    let trimmedUrl = url.trim();

    if (!trimmedTitle || !trimmedUrl) return;

    if (!/^https?:\/\//i.test(trimmedUrl)) {
      trimmedUrl = `https://${trimmedUrl}`;
    }

    createMutation.mutate(
      {
        title: trimmedTitle,
        url: trimmedUrl,
        type,
      },
      {
        onSuccess: () => {
          setTitle('');
          setUrl('');
          setType('OTHER');
          setIsAdding(false);
        },
      },
    );
  };

  const handleCopy = (link: TaskLink) => {
    navigator.clipboard.writeText(link.url);
    setCopiedId(link.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between text-xs font-semibold">
        <div className="flex items-center gap-1.5 text-foreground">
          <ExternalLink className="size-4 text-primary" />
          <span>External Resources & Tools</span>
          {links.length > 0 && (
            <span className="text-muted-foreground font-medium">
              ({links.length})
            </span>
          )}
        </div>
        {canManage && !isAdding && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="h-6 text-xs text-primary hover:text-primary/80 px-2"
          >
            <Plus className="size-3 mr-1" />
            Add link
          </Button>
        )}
      </div>

      {/* Add Link Inline Form */}
      {isAdding && (
        <form
          onSubmit={handleAddLink}
          className="rounded-xl border border-border/80 bg-muted/30 p-3 space-y-3"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-foreground">
                Resource Title
              </Label>
              <Input
                placeholder="e.g. Design Specs, PR #42, API Spec"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-8 text-xs"
                autoFocus
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-foreground">
                Type
              </Label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as LinkType)}
                aria-label="Resource Type"
                className="h-8 w-full rounded-md border border-input bg-background px-2.5 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
              >
                <option value="FIGMA">Figma Design</option>
                <option value="GITHUB">GitHub PR / Repo</option>
                <option value="GOOGLE_DOC">Google Doc</option>
                <option value="NOTION">Notion Page</option>
                <option value="SWAGGER">Swagger / OpenAPI</option>
                <option value="LOOM">Loom Recording</option>
                <option value="WEBSITE">Website</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] font-medium text-foreground">
              URL
            </Label>
            <Input
              placeholder="https://..."
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              className="h-8 text-xs font-mono"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsAdding(false);
                setTitle('');
                setUrl('');
              }}
              className="h-7 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!title.trim() || !url.trim() || createMutation.isPending}
              className="h-7 text-xs"
            >
              {createMutation.isPending ? (
                <Loader2 className="size-3 animate-spin mr-1" />
              ) : (
                <Plus className="size-3 mr-1" />
              )}
              Attach Resource
            </Button>
          </div>
        </form>
      )}

      {/* Links List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-4 text-xs text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin mr-2" />
          Loading resources...
        </div>
      ) : links.length === 0 && !isAdding ? (
        <div className="rounded-lg border border-border/40 p-3 text-center text-xs text-muted-foreground">
          No external links attached yet.
        </div>
      ) : (
        <div className="space-y-1.5">
          {links.map((link) => {
            const config = LINK_TYPE_CONFIG[link.type] || LINK_TYPE_CONFIG.OTHER;
            return (
              <div
                key={link.id}
                className="group flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-card/60 p-2.5 transition-all hover:border-border hover:bg-card"
              >
                {/* Badge + Title + URL */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold border shrink-0',
                      config.bg,
                      config.text,
                      config.border,
                    )}
                  >
                    <Globe className="size-3" />
                    {config.label}
                  </span>

                  <div className="flex flex-col min-w-0">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-foreground truncate hover:text-primary transition-colors flex items-center gap-1"
                    >
                      {link.title}
                      <ExternalLink className="size-2.5 opacity-60 inline-block" />
                    </a>
                    <span className="text-[10px] text-muted-foreground truncate font-mono">
                      {link.url}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => handleCopy(link)}
                    className="size-7 text-muted-foreground hover:text-foreground"
                    title="Copy URL"
                  >
                    {copiedId === link.id ? (
                      <Check className="size-3 text-emerald-500" />
                    ) : (
                      <Copy className="size-3" />
                    )}
                  </Button>

                  {canManage && (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      disabled={deleteMutation.isPending}
                      onClick={() => deleteMutation.mutate(link.id)}
                      className="size-7 text-muted-foreground hover:text-destructive"
                      title="Remove link"
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
