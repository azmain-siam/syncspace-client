'use client';

import * as React from 'react';
import { Columns3, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BoardEmptyStateProps {
  canManage: boolean;
  onCreateBoard: () => void;
}

export function BoardEmptyState({
  canManage,
  onCreateBoard,
}: BoardEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[460px] rounded-3xl border border-dashed border-border/80 bg-card/30 p-8 text-center animate-in fade-in-50 duration-300">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4 shadow-sm ring-8 ring-primary/5">
        <Columns3 className="h-8 w-8" />
      </div>

      <h3 className="text-xl font-bold text-foreground tracking-tight">
        No Kanban Boards Yet
      </h3>

      <p className="text-sm text-muted-foreground max-w-md mt-2 mb-6 leading-relaxed">
        {canManage
          ? 'Get started by creating your first Kanban board. Standard workflow stages (Todo, In Progress, Review, Done) can be provisioned automatically.'
          : 'There are no active boards in this project yet. An admin or workspace owner will need to create one.'}
      </p>

      {canManage && (
        <Button
          onClick={onCreateBoard}
          className="h-11 rounded-xl px-6 font-semibold shadow-md gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>Create First Board</span>
        </Button>
      )}
    </div>
  );
}
