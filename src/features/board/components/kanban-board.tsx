'use client';

import * as React from 'react';
import { useState, useMemo } from 'react';
import {
  Columns3,
  Edit2,
  Kanban,
  MoreVertical,
  Plus,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/features/auth/stores/use-auth-store';
import { useWorkspaceStore } from '@/features/workspace/stores/use-workspace-store';
import { useWorkspaceMembers } from '@/features/workspace/hooks/use-workspace-members';
import { WorkspaceRole, type BoardColumn } from '@/types/domain';

import {
  useProjectBoards,
  useBoard,
  useBoardColumns,
  useReorderColumns,
} from '../hooks';

import { KanbanColumn } from './kanban-column';
import { KanbanSkeleton } from './kanban-skeleton';
import { BoardEmptyState } from './board-empty-state';
import { CreateBoardModal } from './create-board-modal';
import { EditBoardModal } from './edit-board-modal';
import { DeleteBoardDialog } from './delete-board-dialog';
import { CreateColumnModal } from './create-column-modal';
import { EditColumnModal } from './edit-column-modal';
import { DeleteColumnDialog } from './delete-column-dialog';

interface KanbanBoardProps {
  workspaceId: string;
  projectId: string;
}

export function KanbanBoard({ workspaceId, projectId }: KanbanBoardProps) {
  // Current user & RBAC
  const currentUser = useAuthStore((state) => state.user);
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace);
  const { data: membersResponse } = useWorkspaceMembers(workspaceId);

  const canManage = useMemo(() => {
    if (!currentUser) return false;
    if (activeWorkspace?.ownerId === currentUser.id) return true;
    const members = membersResponse?.data || [];
    const member = members.find((m) => m.userId === currentUser.id);
    return member?.role === WorkspaceRole.OWNER || member?.role === WorkspaceRole.ADMIN;
  }, [currentUser, activeWorkspace, membersResponse]);

  // Project Boards
  const {
    data: boardsResponse,
    isLoading: boardsLoading,
  } = useProjectBoards(workspaceId, projectId);

  const boards = useMemo(() => boardsResponse?.data || [], [boardsResponse]);

  // Active Board Selection (derived state avoids cascading effect re-renders)
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);

  const activeBoardId = useMemo(() => {
    if (selectedBoardId && boards.some((b) => b.id === selectedBoardId)) {
      return selectedBoardId;
    }
    return boards[0]?.id || null;
  }, [boards, selectedBoardId]);

  const activeBoard = useMemo(
    () => boards.find((b) => b.id === activeBoardId) || null,
    [boards, activeBoardId],
  );

  // Active Board Columns Query
  const {
    data: boardDetailsResponse,
    isLoading: boardDetailsLoading,
  } = useBoard(workspaceId, projectId, activeBoard?.id);

  const {
    data: columnsResponse,
    isLoading: columnsLoading,
  } = useBoardColumns(workspaceId, projectId, activeBoard?.id);

  // Combined columns resolution (prefer direct columns endpoint if loaded, fallback to board.columns)
  const columns: BoardColumn[] = useMemo(() => {
    if (columnsResponse?.data && columnsResponse.data.length > 0) {
      return [...columnsResponse.data].sort((a, b) => a.order - b.order);
    }
    if (boardDetailsResponse?.data?.columns) {
      return [...boardDetailsResponse.data.columns].sort((a, b) => a.order - b.order);
    }
    return [];
  }, [columnsResponse, boardDetailsResponse]);

  // Modals state
  const [createBoardOpen, setCreateBoardOpen] = useState(false);
  const [editBoardOpen, setEditBoardOpen] = useState(false);
  const [deleteBoardOpen, setDeleteBoardOpen] = useState(false);

  const [createColumnOpen, setCreateColumnOpen] = useState(false);
  const [columnToEdit, setColumnToEdit] = useState<BoardColumn | null>(null);
  const [columnToDelete, setColumnToDelete] = useState<BoardColumn | null>(null);

  // Drag-and-Drop state
  const [draggingColumnId, setDraggingColumnId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);

  // Reorder hook
  const reorderColumnsMutation = useReorderColumns(
    workspaceId,
    projectId,
    activeBoard?.id || '',
  );

  // Drag handlers
  const handleDragStart = (columnId: string) => {
    if (!canManage) return;
    setDraggingColumnId(columnId);
    setDragOverColumnId(null);
  };

  const handleDragOver = (targetColumnId: string) => {
    if (!canManage || !draggingColumnId) return;

    // If hovering back over the dragged column itself (previous/original place),
    // clear the drop target indicator so no other column remains highlighted
    if (draggingColumnId === targetColumnId) {
      if (dragOverColumnId !== null) {
        setDragOverColumnId(null);
      }
      return;
    }

    if (dragOverColumnId !== targetColumnId) {
      setDragOverColumnId(targetColumnId);
    }
  };

  const handleDrop = (targetColumnId: string) => {
    if (!canManage || !draggingColumnId) return;

    // If dropped back onto itself (previous place), do nothing
    if (draggingColumnId === targetColumnId) {
      setDraggingColumnId(null);
      setDragOverColumnId(null);
      return;
    }

    const fromIndex = columns.findIndex((c) => c.id === draggingColumnId);
    const toIndex = columns.findIndex((c) => c.id === targetColumnId);

    if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
      handleMoveColumn(fromIndex, toIndex);
    }

    setDraggingColumnId(null);
    setDragOverColumnId(null);
  };

  const handleDragEnd = () => {
    // If drag ended or cancelled without dropping on a different column, reset state cleanly
    setDraggingColumnId(null);
    setDragOverColumnId(null);
  };

  // Keyboard / action menu column mover
  const handleMoveColumn = (fromIndex: number, toIndex: number) => {
    if (!activeBoard || toIndex < 0 || toIndex >= columns.length) return;

    const reordered = [...columns];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);

    const columnOrders = reordered.map((col, idx) => ({
      id: col.id,
      order: idx,
    }));

    reorderColumnsMutation.mutate({ columnOrders });
  };

  // 1. Loading State
  if (boardsLoading) {
    return <KanbanSkeleton />;
  }

  // 2. Empty Boards State
  if (boards.length === 0) {
    return (
      <>
        <BoardEmptyState
          canManage={canManage}
          onCreateBoard={() => setCreateBoardOpen(true)}
        />
        <CreateBoardModal
          open={createBoardOpen}
          onOpenChange={setCreateBoardOpen}
          workspaceId={workspaceId}
          projectId={projectId}
          onBoardCreated={(board) => {
            setSelectedBoardId(board.id);
          }}
        />
      </>
    );
  }

  const isColumnsLoading = boardDetailsLoading || columnsLoading;

  return (
    <div className="space-y-6">
      {/* Board Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-3">
        {/* Board Switcher Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-none">
          {boards.map((board) => {
            const isActive = board.id === activeBoardId;
            return (
              <button
                key={board.id}
                onClick={() => setSelectedBoardId(board.id)}
                className={`group flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-xs font-bold'
                    : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Kanban className="h-3.5 w-3.5 shrink-0" />
                <span>{board.title}</span>
              </button>
            );
          })}

          {/* New Board Button */}
          {canManage && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCreateBoardOpen(true)}
              className="h-8 rounded-xl px-2.5 text-xs font-semibold gap-1.5 shrink-0 border-dashed hover:border-primary hover:text-primary"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Board</span>
            </Button>
          )}
        </div>

        {/* Board Header Actions */}
        {activeBoard && (
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {canManage && (
              <Button
                variant="default"
                size="sm"
                onClick={() => setCreateColumnOpen(true)}
                className="h-9 rounded-xl px-3.5 text-xs font-semibold gap-1.5 shadow-xs"
              >
                <Plus className="h-4 w-4" />
                <span>Add Column</span>
              </Button>
            )}

            {canManage && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground"
                    aria-label="Board options"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44 rounded-xl p-1 shadow-lg">
                  <DropdownMenuItem
                    onClick={() => setEditBoardOpen(true)}
                    className="cursor-pointer gap-2 rounded-lg text-xs font-medium py-2"
                  >
                    <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Rename Board</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={() => setDeleteBoardOpen(true)}
                    className="cursor-pointer gap-2 rounded-lg text-xs font-medium py-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete Board</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )}
      </div>

      {/* Active Board Summary Banner */}
      {activeBoard && (
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold text-foreground tracking-tight">
              {activeBoard.title}
            </h2>
            <Badge variant="secondary" className="text-xs px-2 py-0.5 rounded-full font-medium">
              {columns.length} {columns.length === 1 ? 'stage' : 'stages'}
            </Badge>
          </div>
        </div>
      )}

      {/* Columns Container */}
      {isColumnsLoading ? (
        <KanbanSkeleton />
      ) : columns.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[380px] rounded-3xl border border-dashed border-border/80 bg-card/30 p-8 text-center space-y-3">
          <Columns3 className="h-10 w-10 text-muted-foreground/60 mx-auto" />
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="font-bold text-foreground text-base">
              No Columns in this Board
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Create your first workflow stage column (e.g. &quot;To Do&quot;, &quot;In Progress&quot;, &quot;Done&quot;) to start organizing tasks.
            </p>
          </div>
          {canManage && (
            <Button
              onClick={() => setCreateColumnOpen(true)}
              className="h-10 rounded-xl px-5 text-xs font-semibold gap-2 shadow-xs"
            >
              <Plus className="h-4 w-4" />
              <span>Add First Column</span>
            </Button>
          )}
        </div>
      ) : (
        <div
          className="flex items-start gap-5 overflow-x-auto pb-6 pt-1 max-w-full scrollbar-thin"
          onDragOver={(e) => {
            if (canManage) e.preventDefault();
          }}
          onDrop={(e) => {
            // Dropping on empty container space cancels the drag
            if (canManage) {
              e.preventDefault();
              setDraggingColumnId(null);
              setDragOverColumnId(null);
            }
          }}
        >
          {columns.map((column, index) => (
            <KanbanColumn
              key={column.id}
              column={column}
              index={index}
              totalColumns={columns.length}
              canManage={canManage}
              onEditColumn={(col) => setColumnToEdit(col)}
              onDeleteColumn={(col) => setColumnToDelete(col)}
              onMoveColumn={handleMoveColumn}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
              isDragging={draggingColumnId === column.id}
              isDragOver={dragOverColumnId === column.id}
            />
          ))}

          {/* Quick Add Column Card */}
          {canManage && (
            <button
              type="button"
              onClick={() => setCreateColumnOpen(true)}
              className="group flex flex-col items-center justify-center w-72 sm:w-80 shrink-0 min-h-[160px] rounded-2xl border-2 border-dashed border-border/80 hover:border-primary/60 bg-muted/20 hover:bg-primary/5 transition-all cursor-pointer p-6 space-y-2 text-muted-foreground hover:text-primary"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background border border-border group-hover:border-primary/40 group-hover:bg-primary/10 transition-colors">
                <Plus className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold tracking-wide">
                Add another column
              </span>
            </button>
          )}
        </div>
      )}

      {/* Board Modals */}
      <CreateBoardModal
        open={createBoardOpen}
        onOpenChange={setCreateBoardOpen}
        workspaceId={workspaceId}
        projectId={projectId}
        onBoardCreated={(board) => {
          setSelectedBoardId(board.id);
        }}
      />

      <EditBoardModal
        open={editBoardOpen}
        onOpenChange={setEditBoardOpen}
        workspaceId={workspaceId}
        projectId={projectId}
        board={activeBoard}
      />

      <DeleteBoardDialog
        open={deleteBoardOpen}
        onOpenChange={setDeleteBoardOpen}
        workspaceId={workspaceId}
        projectId={projectId}
        board={activeBoard}
        onBoardDeleted={() => {
          setSelectedBoardId(null);
        }}
      />

      {/* Column Modals */}
      {activeBoard && (
        <>
          <CreateColumnModal
            open={createColumnOpen}
            onOpenChange={setCreateColumnOpen}
            workspaceId={workspaceId}
            projectId={projectId}
            boardId={activeBoard.id}
            nextOrderIndex={columns.length}
          />

          <EditColumnModal
            open={Boolean(columnToEdit)}
            onOpenChange={(open) => {
              if (!open) setColumnToEdit(null);
            }}
            workspaceId={workspaceId}
            projectId={projectId}
            boardId={activeBoard.id}
            column={columnToEdit}
          />

          <DeleteColumnDialog
            open={Boolean(columnToDelete)}
            onOpenChange={(open) => {
              if (!open) setColumnToDelete(null);
            }}
            workspaceId={workspaceId}
            projectId={projectId}
            boardId={activeBoard.id}
            column={columnToDelete}
          />
        </>
      )}
    </div>
  );
}
