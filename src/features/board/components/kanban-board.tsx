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
import { cn } from '@/lib/utils';
import { useWorkspacePermissions } from '@/features/workspace/hooks/use-workspace-permissions';
import type { ApiResponse, BoardColumn } from '@/types/domain';

import {
  useProjectBoards,
  useBoard,
  useBoardColumns,
  useReorderColumns,
  useBoardRealtime,
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

import { usePathname, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { DragDropProvider, DragOverlay, type DragStartEvent, type DragEndEvent } from '@dnd-kit/react';
import { useMoveTask, useDeleteTask } from '@/features/task/hooks';
import { CreateTaskModal } from '@/features/task/components/create-task-modal';
import { TaskDetailSheet } from '@/features/task/components/task-detail-sheet';
import { TaskCard } from '@/features/task/components/task-card';
import type { Task, PaginatedTasksResponse } from '@/features/task/types/task.types';

interface KanbanBoardProps {
  workspaceId: string;
  projectId: string;
}

export function KanbanBoard({ workspaceId, projectId }: KanbanBoardProps) {
  // Centralized RBAC
  const permissions = useWorkspacePermissions(workspaceId);
  const canManageBoard = permissions.canManageBoardStructure;

  // Routing & URL synchronization
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const boardParam = searchParams.get('board');

  // Project Boards
  const {
    data: boardsResponse,
    isLoading: boardsLoading,
  } = useProjectBoards(workspaceId, projectId);

  const boards = useMemo(() => boardsResponse?.data || [], [boardsResponse]);

  // Active Board Selection (derived state avoids cascading effect re-renders)
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);

  const activeBoardId = useMemo(() => {
    if (boardParam && boards.some((b) => b.id === boardParam)) {
      return boardParam;
    }
    if (selectedBoardId && boards.some((b) => b.id === selectedBoardId)) {
      return selectedBoardId;
    }
    return boards[0]?.id || null;
  }, [boards, boardParam, selectedBoardId]);

  const handleSelectBoard = (boardId: string) => {
    setSelectedBoardId(boardId);
    const params = new URLSearchParams(searchParams.toString());
    params.set('board', boardId);
    window.history.replaceState(null, '', `${pathname}?${params.toString()}`);
  };

  const activeBoard = useMemo(
    () => boards.find((b) => b.id === activeBoardId) || null,
    [boards, activeBoardId],
  );

  // Subscribe to real-time board updates (card moves, creates, deletes)
  useBoardRealtime(activeBoard?.id, { workspaceId, projectId });

  // Active Board Columns Query
  const {
    data: boardDetailsResponse,
    isLoading: boardDetailsLoading,
  } = useBoard(workspaceId, projectId, activeBoard?.id);

  const {
    data: columnsResponse,
    isLoading: columnsLoading,
  } = useBoardColumns(workspaceId, projectId, activeBoard?.id);

  // Combined columns resolution (prefer boardDetailsResponse since it embeds tasks and receives optimistic task moves)
  const columns: BoardColumn[] = useMemo(() => {
    if (boardDetailsResponse?.data?.columns && boardDetailsResponse.data.columns.length > 0) {
      return [...boardDetailsResponse.data.columns].sort((a, b) => a.order - b.order);
    }
    if (columnsResponse?.data && columnsResponse.data.length > 0) {
      return [...columnsResponse.data].sort((a, b) => a.order - b.order);
    }
    return [];
  }, [boardDetailsResponse, columnsResponse]);

  // Modals state
  const [createBoardOpen, setCreateBoardOpen] = useState(false);
  const [editBoardOpen, setEditBoardOpen] = useState(false);
  const [deleteBoardOpen, setDeleteBoardOpen] = useState(false);

  const [createColumnOpen, setCreateColumnOpen] = useState(false);
  const [columnToEdit, setColumnToEdit] = useState<BoardColumn | null>(null);
  const [columnToDelete, setColumnToDelete] = useState<BoardColumn | null>(null);

  const queryClient = useQueryClient();

  // Task Drag-and-Drop active states for DragOverlay
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);

  const activeTask = useMemo(() => {
    if (!activeTaskId) return null;
    for (const col of columns) {
      const found = col.tasks?.find((t) => t.id === activeTaskId);
      if (found) return found;
    }
    const queries = queryClient.getQueriesData<ApiResponse<PaginatedTasksResponse>>({
      queryKey: ['columns'],
    });
    for (const [, queryData] of queries) {
      const found = queryData?.data?.tasks?.find((t) => t.id === activeTaskId);
      if (found) return found;
    }
    return null;
  }, [activeTaskId, columns, queryClient]);

  const activeColumn = useMemo(() => {
    if (!activeColumnId) return null;
    return columns.find((c) => c.id === activeColumnId) || null;
  }, [activeColumnId, columns]);

  const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false);
  const [createTaskColumnId, setCreateTaskColumnId] = useState<string>('');

  // Task Detail Drawer state & URL synchronization
  const taskParam = searchParams.get('task') || searchParams.get('taskId');
  const [clientTaskId, setClientTaskId] = useState<string | null>(null);

  const selectedTaskIdOrKey = clientTaskId || taskParam || null;
  const taskDetailOpen = Boolean(selectedTaskIdOrKey);

  const handleOpenTask = (task: Task) => {
    const keyOrId = task.key || task.id;
    setClientTaskId(keyOrId);

    const params = new URLSearchParams(searchParams.toString());
    params.set('task', keyOrId);
    window.history.replaceState(null, '', `${pathname}?${params.toString()}`);
  };

  const handleCloseTaskDetail = (open: boolean) => {
    if (!open) {
      setClientTaskId(null);
      const params = new URLSearchParams(searchParams.toString());
      params.delete('task');
      params.delete('taskId');
      const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      window.history.replaceState(null, '', newUrl);
    }
  };



  // Mobile Stage Carousel Tracking
  const [selectedMobileColumnId, setSelectedMobileColumnId] = useState<string | null>(null);
  const columnsContainerRef = React.useRef<HTMLDivElement>(null);

  const activeMobileColumnId = useMemo(() => {
    if (selectedMobileColumnId && columns.some((c) => c.id === selectedMobileColumnId)) {
      return selectedMobileColumnId;
    }
    return columns[0]?.id || null;
  }, [columns, selectedMobileColumnId]);

  // Observer to update selectedMobileColumnId when swiping through columns
  React.useEffect(() => {
    const container = columnsContainerRef.current;
    if (!container || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            const colId = entry.target.getAttribute('data-column-id');
            if (colId) {
              setSelectedMobileColumnId(colId);
            }
          }
        });
      },
      {
        root: container,
        threshold: 0.5,
      },
    );

    const columnElements = container.querySelectorAll('[data-column-id]');
    columnElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [columns]);

  const handleScrollToColumn = (columnId: string) => {
    setSelectedMobileColumnId(columnId);
    const element = document.getElementById(`column-${columnId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  };

  // Column Reorder hook
  const reorderColumnsMutation = useReorderColumns(
    workspaceId,
    projectId,
    activeBoard?.id || '',
  );

  // Task Move & Delete hooks
  const moveTaskMutation = useMoveTask(
    workspaceId,
    projectId,
    activeBoard?.id || '',
  );

  const deleteTaskMutation = useDeleteTask(
    workspaceId,
    projectId,
    activeBoard?.id || '',
  );

  const handleMoveTaskToColumn = (task: Task, targetColumnId: string) => {
    if (!permissions.canMoveTask) return;
    const targetCol = columns.find((c) => c.id === targetColumnId);
    const targetOrder = targetCol?.tasks?.length || 0;
    moveTaskMutation.mutate({
      taskId: task.id,
      targetColumnId,
      targetOrder,
    });
  };

  const handleDeleteTask = (task: Task) => {
    if (!permissions.canDeleteTask(task.createdBy)) return;
    deleteTaskMutation.mutate(task.id);
  };

  // Auto-scroll loop for dragging near viewport/container edges
  const scrollSpeedRef = React.useRef(0);
  const animFrameRef = React.useRef<number | null>(null);

  const stopAutoScroll = React.useCallback(() => {
    scrollSpeedRef.current = 0;
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
  }, []);

  const startAutoScrollLoop = React.useCallback(() => {
    if (animFrameRef.current !== null) return;

    const step = () => {
      const container = columnsContainerRef.current;
      if (container && scrollSpeedRef.current !== 0) {
        container.scrollLeft += scrollSpeedRef.current;
        animFrameRef.current = requestAnimationFrame(step);
      } else {
        animFrameRef.current = null;
      }
    };

    animFrameRef.current = requestAnimationFrame(step);
  }, []);

  const updateScrollSpeedFromPointer = React.useCallback(
    (clientX: number) => {
      const container = columnsContainerRef.current;
      if (!container) {
        scrollSpeedRef.current = 0;
        return;
      }

      const rect = container.getBoundingClientRect();
      const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1000;
      const leftEdge = Math.max(0, rect.left);
      const rightEdge = Math.min(viewportWidth, rect.right);
      const EDGE_ZONE = 75; // 75px activation zone from edge
      const MIN_SPEED = 6;
      const MAX_SPEED = 22;

      if (clientX >= rightEdge - EDGE_ZONE) {
        // Approaching or beyond right edge -> scroll right
        const progress = Math.min(1, Math.max(0, (clientX - (rightEdge - EDGE_ZONE)) / EDGE_ZONE));
        scrollSpeedRef.current = Math.round(MIN_SPEED + (MAX_SPEED - MIN_SPEED) * progress);
        startAutoScrollLoop();
      } else if (clientX <= leftEdge + EDGE_ZONE) {
        // Approaching or beyond left edge -> scroll left
        const progress = Math.min(1, Math.max(0, ((leftEdge + EDGE_ZONE) - clientX) / EDGE_ZONE));
        scrollSpeedRef.current = -Math.round(MIN_SPEED + (MAX_SPEED - MIN_SPEED) * progress);
        startAutoScrollLoop();
      } else {
        scrollSpeedRef.current = 0;
      }
    },
    [startAutoScrollLoop],
  );

  React.useEffect(() => {
    const isDragging = Boolean(activeTaskId || activeColumnId);
    if (!isDragging) {
      stopAutoScroll();
      return;
    }

    const handlePointerMove = (e: PointerEvent) => {
      updateScrollSpeedFromPointer(e.clientX);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        updateScrollSpeedFromPointer(e.touches[0].clientX);
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      stopAutoScroll();
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [activeTaskId, activeColumnId, updateScrollSpeedFromPointer, stopAutoScroll]);

  // DragDropProvider event handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { source } = event.operation;
    if (!source) return;
    if (source.type === 'item') {
      if (!permissions.canMoveTask) return;
      setActiveTaskId(String(source.id));
      setActiveColumnId(null);
    } else if (source.type === 'column') {
      if (!canManageBoard) return;
      setActiveColumnId(String(source.id));
      setActiveTaskId(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    stopAutoScroll();
    setActiveTaskId(null);
    setActiveColumnId(null);

    if (event.canceled) return;

    const { source, target } = event.operation;
    if (!source || !target) return;

    // 1. Column Reordering
    if (source.type === 'column') {
      if (!canManageBoard) return;
      const sourceColumnId = String(source.id).replace('column-droppable-', '');
      let targetColumnId = String(target.id).replace('column-droppable-', '');

      // If dropped over a task inside a column, resolve the parent column
      if (target.type === 'item') {
        const parentCol = columns.find((col) =>
          col.tasks?.some((t) => t.id === target.id),
        );
        if (parentCol) {
          targetColumnId = parentCol.id;
        } else {
          const queries = queryClient.getQueriesData<ApiResponse<PaginatedTasksResponse>>({
            queryKey: ['columns'],
          });
          for (const [, queryData] of queries) {
            const found = queryData?.data?.tasks?.find((t) => t.id === target.id);
            if (found) {
              targetColumnId = found.columnId;
              break;
            }
          }
        }
      }

      if (sourceColumnId !== targetColumnId) {
        const fromIndex = columns.findIndex((c) => c.id === sourceColumnId);
        const toIndex = columns.findIndex((c) => c.id === targetColumnId);
        if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
          handleMoveColumn(fromIndex, toIndex);
        }
      }
      return;
    }

    // 2. Task Moving / Reordering
    if (source.type === 'item') {
      if (!permissions.canMoveTask) return;
      const taskId = String(source.id);
      let targetColumnId: string | null = null;
      let targetOrder = 0;

      if (target.type === 'column') {
        targetColumnId = String(target.id).replace('column-droppable-', '');
        targetOrder = 0;
      } else if (target.type === 'item') {
        const sortableTarget = target as unknown as {
          group?: string;
          index?: number;
          sortable?: { group?: string; index?: number };
        };
        targetColumnId =
          sortableTarget.group ||
          sortableTarget.sortable?.group ||
          null;
        targetOrder =
          sortableTarget.index ??
          sortableTarget.sortable?.index ??
          0;

        if (targetColumnId) {
          targetColumnId = targetColumnId.replace('column-droppable-', '');
        }

        if (!targetColumnId) {
          const queries = queryClient.getQueriesData<ApiResponse<PaginatedTasksResponse>>({
            queryKey: ['columns'],
          });
          for (const [, queryData] of queries) {
            const found = queryData?.data?.tasks?.find((t) => t.id === target.id);
            if (found) {
              targetColumnId = found.columnId;
              targetOrder = found.order;
              break;
            }
          }
        }
      }

      // Check if source sortable has group/index
      const sortableSource = source as unknown as {
        group?: string;
        index?: number;
        initialGroup?: string;
        initialIndex?: number;
        sortable?: {
          group?: string;
          index?: number;
          initialGroup?: string;
          initialIndex?: number;
        };
      };

      const resolvedTargetCol = (
        targetColumnId ||
        sortableSource.group ||
        sortableSource.sortable?.group
      )?.replace('column-droppable-', '');

      const resolvedOrder =
        sortableSource.index ??
        sortableSource.sortable?.index ??
        targetOrder;

      const initialGroup = (
        sortableSource.initialGroup ||
        sortableSource.sortable?.initialGroup
      )?.replace('column-droppable-', '');

      const initialIndex =
        sortableSource.initialIndex ??
        sortableSource.sortable?.initialIndex;

      if (!resolvedTargetCol) return;

      // Avoid unnecessary API call if dropped back in exact same position
      if (
        resolvedTargetCol === initialGroup &&
        resolvedOrder === initialIndex
      ) {
        return;
      }

      moveTaskMutation.mutate({
        taskId,
        targetColumnId: resolvedTargetCol,
        targetOrder: resolvedOrder,
      });
    }
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
          canManage={canManageBoard}
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
                onClick={() => handleSelectBoard(board.id)}
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
          {canManageBoard && (
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
            {canManageBoard && (
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

            {canManageBoard && (
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold text-foreground tracking-tight">
              {activeBoard.title}
            </h2>
            <Badge variant="secondary" className="text-xs px-2 py-0.5 rounded-full font-medium">
              {columns.length} {columns.length === 1 ? 'stage' : 'stages'}
            </Badge>
          </div>

          {/* Mobile Stage Switcher Pills (visible only on mobile) */}
          {columns.length > 0 && (
            <div className="flex md:hidden items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none -mx-1 px-1">
              {columns.map((col) => {
                const isSelected = activeMobileColumnId === col.id;
                const taskCount = col.tasks?.length || 0;
                return (
                  <button
                    key={col.id}
                    data-column-id={col.id}
                    type="button"
                    onClick={() => handleScrollToColumn(col.id)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer border',
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                        : 'bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border-border/60',
                    )}
                  >
                    <span className="truncate max-w-[120px]">{col.title}</span>
                    <span
                      className={cn(
                        'h-4 min-w-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center',
                        isSelected
                          ? 'bg-primary-foreground/20 text-primary-foreground'
                          : 'bg-muted-foreground/15 text-muted-foreground',
                      )}
                    >
                      {taskCount}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Columns Container */}
      {isColumnsLoading ? (
        <KanbanSkeleton />
      ) : columns.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[340px] sm:min-h-[380px] rounded-3xl border border-dashed border-border/80 bg-card/30 p-6 sm:p-8 text-center space-y-3">
          <Columns3 className="h-10 w-10 text-muted-foreground/60 mx-auto" />
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="font-bold text-foreground text-base">
              No Columns in this Board
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Create your first workflow stage column (e.g. &quot;To Do&quot;, &quot;In Progress&quot;, &quot;Done&quot;) to start organizing tasks.
            </p>
          </div>
          {canManageBoard && (
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
        <DragDropProvider onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div
            ref={columnsContainerRef}
            data-kanban-container="true"
            className={cn(
              "flex items-start gap-4 sm:gap-5 overflow-x-auto pb-6 pt-1 max-w-full scrollbar-thin px-1",
              (activeTaskId || activeColumnId)
                ? "snap-none scroll-auto"
                : "snap-x snap-mandatory sm:snap-none scroll-smooth"
            )}
          >
            {columns.map((column, index) => (
              <KanbanColumn
                key={column.id}
                column={column}
                index={index}
                totalColumns={columns.length}
                canManage={canManageBoard}
                canCreateTask={permissions.canCreateTask}
                canMoveTask={permissions.canMoveTask}
                canDeleteTask={permissions.canDeleteTask}
                onEditColumn={(col) => setColumnToEdit(col)}
                onDeleteColumn={(col) => setColumnToDelete(col)}
                onMoveColumn={handleMoveColumn}
                onAddTask={(colId) => {
                  setCreateTaskColumnId(colId);
                  setCreateTaskModalOpen(true);
                }}
                availableColumns={columns.map((c) => ({ id: c.id, title: c.title }))}
                onMoveTaskToColumn={handleMoveTaskToColumn}
                onDeleteTask={handleDeleteTask}
                onSelectTask={handleOpenTask}
              />
            ))}

            {/* Quick Add Column Card */}
            {canManageBoard && (
              <button
                type="button"
                onClick={() => setCreateColumnOpen(true)}
                className="group flex flex-col items-center justify-center w-[86vw] max-w-[340px] sm:w-80 shrink-0 snap-center sm:snap-align-none min-h-[160px] rounded-2xl border-2 border-dashed border-border/80 hover:border-primary/60 bg-muted/20 hover:bg-primary/5 transition-all cursor-pointer p-6 space-y-2 text-muted-foreground hover:text-primary"
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

          <DragOverlay>
            {activeTask ? (
              <div className="w-[86vw] max-w-[340px] sm:w-80 pointer-events-none">
                <TaskCard
                  task={activeTask}
                  canManage={false}
                  columnId={activeTask.columnId}
                  isOverlay
                />
              </div>
            ) : activeColumn ? (
              <div className="w-[86vw] max-w-[340px] sm:w-80 rounded-2xl border-2 border-primary bg-card/95 shadow-2xl p-3.5 backdrop-blur-md opacity-95 pointer-events-none">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground truncate">{activeColumn.title}</h3>
                  <Badge variant="secondary" className="h-5 px-1.5 rounded-full text-xs">
                    {activeColumn.tasks?.length || 0}
                  </Badge>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DragDropProvider>
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

          {/* Create Task Modal */}
          <CreateTaskModal
            open={createTaskModalOpen}
            onOpenChange={setCreateTaskModalOpen}
            workspaceId={workspaceId}
            projectId={projectId}
            boardId={activeBoard.id}
            columnId={createTaskColumnId || columns[0]?.id || ''}
            columns={columns.map((c) => ({ id: c.id, title: c.title }))}
          />

          {/* Task Detail Sheet */}
          <TaskDetailSheet
            taskIdOrKey={selectedTaskIdOrKey}
            open={taskDetailOpen}
            onOpenChange={handleCloseTaskDetail}
            workspaceId={workspaceId}
            projectId={projectId}
            boardId={activeBoard.id}
            columns={columns.map((c) => ({ id: c.id, title: c.title }))}
            canManage={permissions.canEditTask}
          />
        </>
      )}
    </div>
  );
}
