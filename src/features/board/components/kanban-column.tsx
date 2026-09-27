'use client';

import * as React from 'react';
import { GripVertical, Loader2, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { TaskCard } from '@/features/task/components/task-card';
import { useColumnTasks } from '@/features/task/hooks/use-column-tasks';
import { useDroppable } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import type { Task } from '@/features/task/types/task.types';
import type { BoardColumn } from '../types/board.types';
import { ColumnActionMenu } from './column-action-menu';

interface KanbanColumnProps {
  column: BoardColumn;
  index: number;
  totalColumns: number;
  canManage: boolean;
  canCreateTask?: boolean;
  canMoveTask?: boolean;
  canDeleteTask?: (taskCreatorId?: string | null) => boolean;
  onEditColumn: (column: BoardColumn) => void;
  onDeleteColumn: (column: BoardColumn) => void;
  onMoveColumn: (fromIndex: number, toIndex: number) => void;
  // Task specific props
  onSelectTask?: (task: Task) => void;
  onAddTask?: (columnId: string) => void;
  availableColumns?: { id: string; title: string }[];
  onMoveTaskToColumn?: (task: Task, targetColumnId: string) => void;
  onDeleteTask?: (task: Task) => void;
}

export function KanbanColumn({
  column,
  index,
  totalColumns,
  canManage,
  canCreateTask,
  canMoveTask,
  canDeleteTask,
  onEditColumn,
  onDeleteColumn,
  onMoveColumn,
  onSelectTask,
  onAddTask,
  availableColumns = [],
  onMoveTaskToColumn,
  onDeleteTask,
}: KanbanColumnProps) {
  const allowCreate = canCreateTask ?? canManage;
  const allowMove = canMoveTask ?? canManage;

  // Pagination limit state to prevent silent truncation of large columns
  const [limit, setLimit] = React.useState(30);

  // Query column tasks from the dedicated API with configurable limit
  const { data: columnTasksResponse, isLoading: tasksLoading, isFetching: tasksFetching } =
    useColumnTasks(column.id, { limit });

  const tasks: Task[] = React.useMemo(() => {
    if (columnTasksResponse?.data?.tasks) {
      return [...columnTasksResponse.data.tasks].sort((a, b) => a.order - b.order);
    }
    return (column.tasks as unknown as Task[]) || [];
  }, [columnTasksResponse, column.tasks]);

  const totalCount = columnTasksResponse?.data?.meta?.total ?? tasks.length;
  const hasMore =
    (columnTasksResponse?.data?.meta?.hasNextPage ?? false) || tasks.length < totalCount;

  const {
    ref: sortableRef,
    handleRef,
    isDragSource,
    isDropTarget: isColumnDropTarget,
  } = useSortable({
    id: column.id,
    index,
    type: 'column',
    accept: ['column'],
    data: {
      type: 'column',
      column,
      columnId: column.id,
      index,
    },
    disabled: !canManage,
  });

  const { ref: droppableRef, isDropTarget: isTaskDropTarget } = useDroppable({
    id: `column-droppable-${column.id}`,
    type: 'column',
    accept: ['item'],
    data: {
      type: 'column',
      column,
      columnId: column.id,
    },
    collisionPriority: 1,
  });

  return (
    <div
      ref={sortableRef}
      id={`column-${column.id}`}
      data-column-id={column.id}
      className={cn(
        'group/column flex flex-col w-[86vw] max-w-[340px] sm:w-80 shrink-0 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-xs transition-all duration-200 snap-center sm:snap-align-none',
        'max-h-[calc(100dvh-220px)] sm:max-h-[calc(100vh-210px)] min-h-[380px] sm:min-h-[420px]',
        isDragSource && 'opacity-40 scale-[0.98] border-dashed border-primary shadow-xl',
        (isColumnDropTarget || isTaskDropTarget) && 'ring-2 ring-primary/70 border-primary/80 bg-primary/5',
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between gap-2 p-3.5 border-b border-border/60 select-none">
        <div className="flex items-center gap-2 min-w-0">
          {canManage && (
            <div
              ref={handleRef}
              className="text-muted-foreground/50 group-hover/column:text-muted-foreground transition-colors -ml-1 p-0.5 rounded hover:bg-muted cursor-grab active:cursor-grabbing"
              title="Drag to reorder column"
            >
              <GripVertical className="h-4 w-4" />
            </div>
          )}

          <h3
            className="text-sm font-semibold text-foreground truncate tracking-tight"
            title={column.title}
          >
            {column.title}
          </h3>

          <Badge
            variant="secondary"
            className="h-5 min-w-5 px-1.5 rounded-full text-[11px] font-semibold text-muted-foreground bg-muted/80 flex items-center justify-center shrink-0"
          >
            {totalCount}
          </Badge>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <ColumnActionMenu
            onEdit={() => onEditColumn(column)}
            onDelete={() => onDeleteColumn(column)}
            onMoveLeft={() => onMoveColumn(index, index - 1)}
            onMoveRight={() => onMoveColumn(index, index + 1)}
            isFirst={index === 0}
            isLast={index === totalColumns - 1}
            disabled={!canManage}
          />
        </div>
      </div>

      {/* Tasks Scroll Container */}
      <div
        ref={droppableRef}
        className={cn(
          'flex-1 overflow-y-auto p-2.5 space-y-2.5 scrollbar-thin min-h-[140px] rounded-b-2xl transition-colors',
          isTaskDropTarget && tasks.length === 0 && 'bg-primary/10 ring-2 ring-primary/60 border-primary border-dashed',
        )}
      >
        {tasksLoading && tasks.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-xs text-muted-foreground">
            Loading tasks...
          </div>
        ) : tasks.length === 0 ? (
          <div
            onClick={() => allowCreate && onAddTask?.(column.id)}
            className="flex flex-col items-center justify-center h-48 rounded-xl border border-dashed border-border/60 bg-muted/20 hover:bg-muted/30 transition-colors p-4 text-center cursor-pointer group/empty"
          >
            <p className="text-xs font-medium text-muted-foreground group-hover/empty:text-foreground transition-colors">
              No tasks in this stage
            </p>
            <p className="text-[11px] text-muted-foreground/70 mt-1">
              {allowCreate ? 'Click to add a task or drag here' : 'Empty stage'}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {tasks.map((task, taskIdx) => (
              <TaskCard
                key={task.id}
                task={task}
                index={taskIdx}
                columnId={column.id}
                canManage={allowMove}
                onSelectTask={onSelectTask}
                availableColumns={availableColumns}
                onMoveToColumn={onMoveTaskToColumn}
                onDeleteTask={
                  onDeleteTask && (canDeleteTask ? canDeleteTask(task.createdBy) : true)
                    ? onDeleteTask
                    : undefined
                }
              />
            ))}

            {/* Load More Button for Columns with >30 Tasks */}
            {hasMore && (
              <div className="pt-1.5 pb-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLimit((prev) => prev + 30)}
                  disabled={tasksFetching}
                  className="w-full h-8 text-[11px] font-semibold text-muted-foreground hover:text-foreground border-dashed rounded-xl"
                >
                  {tasksFetching ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin mr-1.5" /> Loading...
                    </>
                  ) : (
                    `Load more (${tasks.length} of ${totalCount})`
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Column Footer */}
      {allowCreate && (
        <div className="p-2.5 pt-0">
          <Button
            variant="ghost"
            onClick={() => onAddTask?.(column.id)}
            className="w-full justify-start gap-2 h-9 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/70 rounded-xl"
            aria-label={`Add task to ${column.title}`}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add task</span>
          </Button>
        </div>
      )}
    </div>
  );
}
