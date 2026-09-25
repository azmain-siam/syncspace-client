'use client';

import * as React from 'react';
import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Folder,
  Layers,
  Search,
  ShieldAlert,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  SegmentedControl,
  type SegmentedControlOption,
} from '@/components/ui/segmented-control';
import { useAuthStore } from '@/features/auth/stores/use-auth-store';
import { useCurrentWorkspace } from '@/features/workspace/hooks/use-current-workspace';
import { WorkspaceSettingsNav } from '@/features/workspace/components/workspace-settings-nav';
import {
  useTrashItems,
  useRestoreTrashItem,
  useEmptyTrash,
} from '@/features/safety';
import { TrashTable } from '@/features/safety/components/trash-table';
import { TrashSkeleton } from '@/features/safety/components/trash-skeleton';
import { EmptyTrashDialog } from '@/features/safety/components/empty-trash-dialog';
import type { TrashItem } from '@/features/safety';
import { toast } from 'sonner';

const TRASH_TYPE_OPTIONS: SegmentedControlOption<'ALL' | 'TASK' | 'PROJECT'>[] = [
  { value: 'ALL', label: 'All Items', icon: Layers },
  { value: 'TASK', label: 'Tasks', icon: CheckSquare },
  { value: 'PROJECT', label: 'Projects', icon: Folder },
];

export default function WorkspaceTrashPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const { workspaceSlug } = use(params);
  const { workspace, isLoading: wsLoading } = useCurrentWorkspace(workspaceSlug);
  const currentUser = useAuthStore((s) => s.user);

  const [typeFilter, setTypeFilter] = useState<'ALL' | 'TASK' | 'PROJECT'>('ALL');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [itemToPurge, setItemToPurge] = useState<TrashItem | null>(null);

  // Debounce search input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const workspaceId = workspace?.id || '';
  const isOwnerOrAdmin = !!(
    workspace &&
    currentUser &&
    (workspace.ownerId === currentUser.id ||
      (workspace as { role?: string }).role === 'ADMIN' ||
      (workspace as { role?: string }).role === 'OWNER')
  );

  const { data, isLoading } = useTrashItems(workspaceId, {
    type: typeFilter,
    search: debouncedSearch || undefined,
    page,
    limit: 20,
  });

  const restoreMutation = useRestoreTrashItem(workspaceId);
  const emptyTrashMutation = useEmptyTrash(workspaceId);

  const handleRestore = (item: TrashItem) => {
    if (item.container?.projectDeleted) {
      toast.error(
        `Cannot restore task "${item.title}" because parent project "${item.container.projectName}" is in trash. Please restore the project first.`,
      );
      return;
    }
    restoreMutation.mutate({ itemId: item.id, itemType: item.itemType });
  };

  const handlePurgeSingle = (item: TrashItem) => {
    setItemToPurge(item);
    setModalOpen(true);
  };

  const handleEmptyAll = () => {
    setItemToPurge(null);
    setModalOpen(true);
  };

  const handleConfirmPurge = () => {
    if (itemToPurge) {
      emptyTrashMutation.mutate(
        { itemId: itemToPurge.id, itemType: itemToPurge.itemType },
        {
          onSuccess: () => {
            setModalOpen(false);
            setItemToPurge(null);
          },
        },
      );
    } else {
      emptyTrashMutation.mutate(
        {},
        {
          onSuccess: () => {
            setModalOpen(false);
          },
        },
      );
    }
  };

  if (wsLoading && !workspace) {
    return (
      <div className="w-full space-y-6">
        <div className="h-20 rounded-2xl bg-card animate-pulse border border-border" />
        <TrashSkeleton count={5} />
      </div>
    );
  }

  // RBAC Access Guard (Owner & Admin only)
  if (workspace && !isOwnerOrAdmin) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 rounded-2xl border border-border bg-card text-center space-y-4 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mx-auto">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold text-foreground">Access Restricted</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Only workspace <strong>Owners</strong> and <strong>Admins</strong> have permission to access the Workspace Trash Bin and manage soft-deleted items.
        </p>
        <Link href={`/workspaces/${workspaceSlug}/settings`}>
          <Button variant="outline" size="sm" className="mt-2 text-xs font-semibold rounded-lg">
            Return to Settings
          </Button>
        </Link>
      </div>
    );
  }

  const items = data?.items || [];
  const meta = data?.meta;
  const totalItems = meta?.total ?? 0;

  return (
    <div className="w-full space-y-6">
      {/* Settings Navigation Header */}
      <WorkspaceSettingsNav
        workspaceSlug={workspaceSlug}
        isOwnerOrAdmin={isOwnerOrAdmin}
      />

      {/* Sub-heading & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-primary" /> Workspace Trash Bin
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Recover soft-deleted projects and tasks in{' '}
            <strong className="text-foreground">{workspace?.name}</strong>, or purge them permanently.
          </p>
        </div>

        {/* Empty Trash Trigger */}
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={handleEmptyAll}
          disabled={isLoading || totalItems === 0 || emptyTrashMutation.isPending}
          className="h-10 px-4 text-xs font-semibold rounded-lg gap-2 shadow-xs shrink-0 self-start sm:self-auto"
        >
          <Trash2 className="h-4 w-4" />
          <span>Empty Trash</span>
        </Button>
      </div>

      {/* Filter Tabs & Search Bar Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-card rounded-2xl border border-border">
        {/* Search */}
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search deleted items by title or key..."
            className="pl-10 h-11 rounded-lg bg-background border-border/80 text-sm"
          />
        </div>

        {/* Segmented Filter Control */}
        <SegmentedControl
          options={TRASH_TYPE_OPTIONS}
          value={typeFilter}
          onChange={(val) => {
            setTypeFilter(val);
            setPage(1);
          }}
        />
      </div>

      {/* Main Table or Skeleton */}
      {isLoading ? (
        <TrashSkeleton count={5} />
      ) : (
        <TrashTable
          items={items}
          onRestore={handleRestore}
          onPurge={handlePurgeSingle}
          isRestoringId={restoreMutation.isPending ? restoreMutation.variables?.itemId : null}
          isPurgingId={emptyTrashMutation.isPending ? emptyTrashMutation.variables?.itemId : null}
        />
      )}

      {/* Pagination Bar */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between px-2 pt-2 text-xs text-muted-foreground">
          <span className="font-medium">
            Page <strong className="text-foreground">{meta.page}</strong> of{' '}
            <strong className="text-foreground">{meta.totalPages}</strong> ({meta.total} total)
          </span>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!meta.hasPrevPage || isLoading}
              className="h-8 px-2 text-xs font-semibold rounded-lg"
            >
              <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={!meta.hasNextPage || isLoading}
              className="h-8 px-2 text-xs font-semibold rounded-lg"
            >
              Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Empty Trash High-Friction Confirmation Dialog */}
      <EmptyTrashDialog
        open={modalOpen}
        onOpenChange={setModalOpen}
        onConfirm={handleConfirmPurge}
        isPending={emptyTrashMutation.isPending}
        itemToPurge={itemToPurge}
      />
    </div>
  );
}
