'use client';

import * as React from 'react';
import { useState } from 'react';
import {
  BookOpen,
  Compass,
  ExternalLink,
  FileText,
  GitBranch,
  Globe,
  Link2,
  Loader2,
  Palette,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { ProjectLink } from '../types/project.types';
import {
  useCreateProjectLink,
  useDeleteProjectLink,
  useProjectLinks,
} from '../hooks/use-project-links';

interface ProjectLinksWidgetProps {
  workspaceId: string;
  projectId: string;
  initialLinks?: ProjectLink[];
  canManage?: boolean;
  className?: string;
}

const LINK_TYPES: Array<{
  value: string;
  label: string;
  icon: typeof Globe;
  badgeStyle: string;
}> = [
  {
    value: 'DOCS',
    label: 'Documentation',
    icon: FileText,
    badgeStyle: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25',
  },
  {
    value: 'FIGMA',
    label: 'Figma Design',
    icon: Palette,
    badgeStyle: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25',
  },
  {
    value: 'GITHUB',
    label: 'GitHub / Code',
    icon: GitBranch,
    badgeStyle: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/25',
  },
  {
    value: 'PRD',
    label: 'Product PRD',
    icon: Compass,
    badgeStyle: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25',
  },
  {
    value: 'NOTION',
    label: 'Notion Wiki',
    icon: BookOpen,
    badgeStyle: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25',
  },
  {
    value: 'OTHER',
    label: 'General Resource',
    icon: Globe,
    badgeStyle: 'bg-muted text-muted-foreground border-border',
  },
];

function getLinkTypeConfig(type?: string | null) {
  if (!type) return LINK_TYPES[5];
  const found = LINK_TYPES.find((t) => t.value.toUpperCase() === type.toUpperCase());
  return found || LINK_TYPES[5];
}

function getHostname(url: string) {
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export function ProjectLinksWidget({
  workspaceId,
  projectId,
  initialLinks,
  canManage = true,
  className,
}: ProjectLinksWidgetProps) {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [linkToDelete, setLinkToDelete] = useState<string | null>(null);

  const { data: linksResponse, isLoading } = useProjectLinks(
    workspaceId,
    projectId,
    initialLinks,
  );
  const links = linksResponse?.data || [];

  const deleteMutation = useDeleteProjectLink(workspaceId, projectId, () => {
    setLinkToDelete(null);
  });

  const handleDelete = (linkId: string) => {
    deleteMutation.mutate(linkId);
  };

  return (
    <div
      className={cn(
        'rounded-2xl border border-border/80 bg-card p-5 space-y-4 shadow-xs',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Link2 className="h-4 w-4" />
          </div>
          <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
            <span>Resources & Links</span>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 rounded-full font-mono">
              {links.length}
            </Badge>
          </h3>
        </div>

        {canManage && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setAddModalOpen(true)}
            className="h-8 rounded-lg gap-1.5 text-xs font-semibold cursor-pointer shadow-2xs hover:bg-muted"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Link</span>
          </Button>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-12 w-full rounded-xl bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : links.length === 0 ? (
        <div className="text-center py-6 px-4 rounded-xl border border-dashed border-border/70 bg-muted/20 space-y-2">
          <p className="text-xs text-muted-foreground">
            No resources or bookmarks attached to this project.
          </p>
          {canManage && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setAddModalOpen(true)}
              className="h-7 rounded-lg gap-1 text-[11px] font-medium"
            >
              <Plus className="h-3 w-3" /> Attach Link
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {links.map((link) => {
            const config = getLinkTypeConfig(link.type);
            const Icon = config.icon;
            const hostname = getHostname(link.url);
            const isDeleting = deleteMutation.isPending && linkToDelete === link.id;

            return (
              <div
                key={link.id}
                className="group flex items-center justify-between gap-3 p-2.5 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/40 hover:border-border transition-all"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="h-8 w-8 rounded-lg bg-card border border-border/70 flex items-center justify-center shrink-0 text-muted-foreground group-hover:text-primary transition-colors">
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-foreground hover:text-primary transition-colors line-clamp-1 flex items-center gap-1.5"
                    >
                      <span>{link.title}</span>
                      <ExternalLink className="h-3 w-3 opacity-60 group-hover:opacity-100 shrink-0" />
                    </a>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground flex-wrap">
                      <span className="truncate max-w-[150px] font-mono text-[10px]">
                        {hostname}
                      </span>
                      {link.type && (
                        <span
                          className={cn(
                            'text-[9px] font-bold px-1.5 py-0 rounded border uppercase select-none',
                            config.badgeStyle,
                          )}
                        >
                          {link.type}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {link.createdBy && (
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Avatar className="h-5 w-5 border border-border/80">
                            {link.createdBy.avatar && (
                              <AvatarImage
                                src={link.createdBy.avatar}
                                alt={link.createdBy.name}
                              />
                            )}
                            <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-bold">
                              {link.createdBy.name.slice(0, 1).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </TooltipTrigger>
                        <TooltipContent>
                          Added by {link.createdBy.name}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}

                  {canManage && (
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={isDeleting}
                      onClick={() => {
                        setLinkToDelete(link.id);
                        handleDelete(link.id);
                      }}
                      className="h-7 w-7 rounded-lg text-muted-foreground hover:text-destructive opacity-40 group-hover:opacity-100 cursor-pointer"
                    >
                      {isDeleting ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                      <span className="sr-only">Delete link</span>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Link Dialog */}
      {addModalOpen && (
        <ProjectAddLinkModal
          open={addModalOpen}
          onOpenChange={setAddModalOpen}
          workspaceId={workspaceId}
          projectId={projectId}
        />
      )}
    </div>
  );
}

interface ProjectAddLinkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  projectId: string;
}

export function ProjectAddLinkModal({
  open,
  onOpenChange,
  workspaceId,
  projectId,
}: ProjectAddLinkModalProps) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState('DOCS');
  const [error, setError] = useState<string | null>(null);

  const createMutation = useCreateProjectLink(workspaceId, projectId, () => {
    setTitle('');
    setUrl('');
    setType('DOCS');
    setError(null);
    onOpenChange(false);
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Please provide a title for this resource.');
      return;
    }

    if (!url.trim()) {
      setError('Please provide a destination URL.');
      return;
    }

    let finalUrl = url.trim();
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = `https://${finalUrl}`;
    }

    try {
      new URL(finalUrl);
    } catch {
      setError('Please provide a valid web URL (e.g. https://figma.com/file/...).');
      return;
    }

    setError(null);
    createMutation.mutate({
      title: title.trim(),
      url: finalUrl,
      type,
    });
  };

  const handleClose = (newOpen: boolean) => {
    if (!newOpen) {
      setTitle('');
      setUrl('');
      setError(null);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md rounded-2xl p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader className="space-y-1 text-left">
            <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Link2 className="h-4 w-4 text-primary" />
              <span>Attach Resource Link</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Bookmark external PRDs, design wireframes, or documentation for this project.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="link-title" className="text-xs font-bold">
                Resource Title
              </Label>
              <Input
                id="link-title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="E.g., Figma Wireframes, API Docs, Product Spec"
                className="h-9 rounded-xl text-xs sm:text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="link-url" className="text-xs font-bold">
                Destination URL
              </Label>
              <Input
                id="link-url"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="https://..."
                className="h-9 rounded-xl text-xs sm:text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="link-type" className="text-xs font-bold">
                Resource Category
              </Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="link-type" className="h-9 w-full rounded-xl text-xs font-semibold cursor-pointer">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="rounded-xl text-xs">
                  {LINK_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {error && (
              <p className="text-[11px] text-destructive font-medium">{error}</p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={createMutation.isPending}
              className="rounded-xl text-xs font-semibold cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={createMutation.isPending}
              className="rounded-xl text-xs font-semibold cursor-pointer gap-2"
            >
              Attach Link
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
