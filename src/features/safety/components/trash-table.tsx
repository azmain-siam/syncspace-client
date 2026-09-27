'use client';

import * as React from 'react';
import {
  AlertTriangle,
  CheckSquare,
  Folder,
  Layers,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { TrashItem } from '../types/safety.types';

interface TrashTableProps {
  items: TrashItem[];
  onRestore: (item: TrashItem) => void;
  onPurge: (item: TrashItem) => void;
  isRestoringId?: string | null;
  isPurgingId?: string | null;
}

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 45) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return 'Recently';
  }
}

export function TrashTable({
  items,
  onRestore,
  onPurge,
  isRestoringId,
  isPurgingId,
}: TrashTableProps) {
  if (items.length === 0) {
    return (
      <div className="py-16 text-center rounded-2xl border border-dashed border-border bg-card/50 space-y-4">
        <div className="h-12 w-12 rounded-2xl bg-muted/60 border border-border/80 text-muted-foreground flex items-center justify-center mx-auto">
          <Trash2 className="h-6 w-6" />
        </div>
        <div className="space-y-1 max-w-sm mx-auto">
          <h3 className="font-bold text-foreground text-base">Trash is Empty</h3>
          <p className="text-xs text-muted-foreground">
            There are no soft-deleted tasks or projects in this workspace. Deleted items will be retained here until permanently purged.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="px-3 sm:px-4">Item Name</TableHead>
          <TableHead className="hidden md:table-cell px-4">Hierarchy / Container</TableHead>
          <TableHead className="hidden sm:table-cell px-4">Deleted By</TableHead>
          <TableHead className="px-4">Deleted At</TableHead>
          <TableHead className="text-right px-3 sm:px-4">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => {
          const isProject = item.itemType === 'PROJECT';
          const isParentDeleted = item.container?.projectDeleted;
          const isRestoring = isRestoringId === item.id;
          const isPurging = isPurgingId === item.id;

          const authorInitials = item.deletedBy?.name
            ? item.deletedBy.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .substring(0, 2)
                .toUpperCase()
            : 'U';

          return (
            <TableRow key={item.id}>
              {/* Item Name & Type */}
              <TableCell className="px-3 sm:px-4 min-w-[220px]">
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border shadow-2xs mt-0.5',
                      isProject
                        ? 'bg-primary/10 text-primary border-primary/20'
                        : 'bg-muted text-muted-foreground border-border',
                    )}
                  >
                    {isProject ? (
                      <Folder className="h-4 w-4" />
                    ) : (
                      <CheckSquare className="h-4 w-4" />
                    )}
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-foreground truncate max-w-[200px] sm:max-w-xs">
                        {item.title}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-[10px] font-bold px-2 py-0.5 rounded-full',
                          isProject
                            ? 'bg-primary/10 text-primary border-primary/25'
                            : 'bg-muted text-muted-foreground border-border',
                        )}
                      >
                        {isProject ? 'PROJECT' : 'TASK'}
                      </Badge>
                      {item.key && (
                        <span className="font-mono text-[10px] text-muted-foreground font-semibold">
                          {item.key}
                        </span>
                      )}
                    </div>

                    {/* Parent Project in Trash Dependency Alert */}
                    {isParentDeleted && (
                      <div className="flex items-center gap-1 text-[11px] font-medium text-warning-foreground bg-warning border border-warning/20 rounded px-1.5 py-0.5 w-fit">
                        <AlertTriangle className="h-3 w-3 shrink-0" />
                        <span>Parent project in trash</span>
                      </div>
                    )}
                  </div>
                </div>
              </TableCell>

              {/* Hierarchy Container */}
              <TableCell className="hidden md:table-cell px-4 text-muted-foreground text-xs">
                {item.container ? (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Layers className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                    <span className="truncate max-w-[180px]">
                      {item.container.projectName} &gt; {item.container.columnName}
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground/60 italic">—</span>
                )}
              </TableCell>

              {/* Deleted By */}
              <TableCell className="hidden sm:table-cell px-4">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6 border border-border">
                    {item.deletedBy?.avatar && (
                      <AvatarImage
                        src={item.deletedBy.avatar}
                        alt={item.deletedBy.name}
                      />
                    )}
                    <AvatarFallback className="text-[10px] font-bold bg-muted">
                      {authorInitials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium text-foreground truncate max-w-[120px]">
                    {item.deletedBy?.name || 'Unknown'}
                  </span>
                </div>
              </TableCell>

              {/* Deleted At */}
              <TableCell className="px-4 text-muted-foreground text-xs whitespace-nowrap">
                <span
                  title={new Date(item.deletedAt).toLocaleString()}
                  className="cursor-default"
                >
                  {formatRelativeTime(item.deletedAt)}
                </span>
              </TableCell>

              {/* Actions */}
              <TableCell className="px-3 sm:px-4 text-right whitespace-nowrap">
                <div className="flex items-center justify-end gap-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onRestore(item)}
                    disabled={isRestoring || isPurging}
                    isLoading={isRestoring}
                    className="h-8 px-2.5 text-xs font-semibold rounded-lg text-primary hover:text-primary hover:bg-primary/10 gap-1.5"
                    title={
                      isParentDeleted
                        ? 'Restore parent project first'
                        : 'Restore item to active status'
                    }
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Restore</span>
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onPurge(item)}
                    disabled={isRestoring || isPurging}
                    isLoading={isPurging}
                    className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    title="Permanently purge item"
                    aria-label={`Permanently purge ${item.title}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
