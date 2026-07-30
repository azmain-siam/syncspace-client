'use client';

import * as React from 'react';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Workspace } from '@/types/domain';
import { useMyWorkspaces } from '../hooks/use-my-workspaces';
import { useWorkspaceStore } from '../stores/use-workspace-store';
import { CreateWorkspaceModal } from './create-workspace-modal';

export function WorkspaceSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const { data: workspacesResponse, isLoading } = useMyWorkspaces();
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace);
  const setActiveWorkspace = useWorkspaceStore((state) => state.setActiveWorkspace);

  const workspaces = workspacesResponse?.data || [];

  const handleSelectWorkspace = (targetWorkspace: Workspace) => {
    setActiveWorkspace(targetWorkspace);
    const targetSlug = targetWorkspace.slug || targetWorkspace.id;

    if (pathname.includes('/workspaces/')) {
      const pathAfterWorkspaces = pathname.split('/workspaces/')[1] || '';
      const parts = pathAfterWorkspaces.split('/');
      // parts[0] is the current workspace slug/id, parts.slice(1) is the remaining subpath
      const subpathParts = parts.slice(1);
      if (subpathParts.length > 0) {
        const subpath = subpathParts.join('/');
        router.push(`/workspaces/${targetSlug}/${subpath}`);
        return;
      }
    }

    router.push(`/workspaces/${targetSlug}`);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex w-full items-center justify-between gap-3 rounded-xl border border-border/80 bg-card p-2.5 text-left transition-all hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar className="h-8 w-8 rounded-lg border border-border/60">
                {activeWorkspace?.logo && (
                  <AvatarImage src={activeWorkspace.logo} alt={activeWorkspace.name} />
                )}
                <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-bold text-xs">
                  {activeWorkspace?.name ? activeWorkspace.name.substring(0, 2).toUpperCase() : 'WS'}
                </AvatarFallback>
              </Avatar>

              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-foreground truncate">
                  {isLoading ? 'Loading...' : activeWorkspace?.name || 'Select Workspace'}
                </span>
                <span className="text-[10px] font-semibold text-muted-foreground">
                  SyncSpace Workspace
                </span>
              </div>
            </div>

            <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground/70" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-[220px] rounded-xl p-1" align="start">
          <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {workspaces.map((workspace) => {
            const isSelected = activeWorkspace?.id === workspace.id;
            return (
              <DropdownMenuItem
                key={workspace.id}
                onSelect={() => handleSelectWorkspace(workspace)}
                className="flex items-center justify-between cursor-pointer rounded-lg py-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar className="h-6 w-6 rounded-md">
                    {workspace.logo && <AvatarImage src={workspace.logo} alt={workspace.name} />}
                    <AvatarFallback className="rounded-md bg-primary/10 text-primary text-[10px] font-bold">
                      {workspace.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-semibold text-foreground truncate">
                    {workspace.name}
                  </span>
                </div>
                {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
              </DropdownMenuItem>
            );
          })}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setCreateModalOpen(true);
            }}
            className="flex items-center gap-2 text-primary font-semibold cursor-pointer rounded-lg py-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Workspace</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateWorkspaceModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />
    </>
  );
}
