'use client';

import * as React from 'react';
import { GripVertical, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { BoardColumn } from '../types/board.types';
import { ColumnActionMenu } from './column-action-menu';

interface KanbanColumnProps {
  column: BoardColumn;
  index: number;
  totalColumns: number;
  canManage: boolean;
  onEditColumn: (column: BoardColumn) => void;
  onDeleteColumn: (column: BoardColumn) => void;
  onMoveColumn: (fromIndex: number, toIndex: number) => void;
  onDragStart?: (columnId: string) => void;
  onDragOver?: (columnId: string) => void;
  onDrop?: (columnId: string) => void;
  onDragEnd?: () => void;
  isDragging?: boolean;
  isDragOver?: boolean;
}

export function KanbanColumn({
  column,
  index,
  totalColumns,
  canManage,
  onEditColumn,
  onDeleteColumn,
  onMoveColumn,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDragging = false,
  isDragOver = false,
}: KanbanColumnProps) {
  const taskCount = column.tasks?.length || 0;

  return (
    <div
      draggable={canManage}
      onDragStart={(e) => {
        if (!canManage) return;
        e.dataTransfer.setData('text/plain', column.id);
        e.dataTransfer.effectAllowed = 'move';
        onDragStart?.(column.id);
      }}
      onDragOver={(e) => {
        if (canManage) {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          onDragOver?.(column.id);
        }
      }}
      onDrop={(e) => {
        if (canManage) {
          e.preventDefault();
          onDrop?.(column.id);
        }
      }}
      onDragEnd={() => onDragEnd?.()}
      className={cn(
        'group/column flex flex-col w-72 sm:w-80 shrink-0 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-xs transition-all duration-200',
        'max-h-[calc(100vh-210px)] min-h-[420px]',
        isDragging && 'opacity-40 scale-[0.98] border-dashed border-primary shadow-xl',
        isDragOver && !isDragging && 'ring-2 ring-primary/70 border-primary/80 bg-primary/5',
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between gap-2 p-3.5 border-b border-border/60">
        <div className="flex items-center gap-2 min-w-0">
          {canManage && (
            <div
              className="cursor-grab active:cursor-grabbing text-muted-foreground/50 group-hover/column:text-muted-foreground transition-colors -ml-1 p-0.5 rounded hover:bg-muted"
              title="Drag to reorder column"
            >
              <GripVertical className="h-4 w-4" />
            </div>
          )}

          <h3
            className="text-sm font-semibold text-foreground truncate select-none tracking-tight"
            title={column.title}
          >
            {column.title}
          </h3>

          <Badge
            variant="secondary"
            className="h-5 min-w-5 px-1.5 rounded-full text-[11px] font-semibold text-muted-foreground bg-muted/80 flex items-center justify-center shrink-0"
          >
            {taskCount}
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
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 scrollbar-thin">
        {taskCount === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 rounded-xl border border-dashed border-border/60 bg-muted/20 p-4 text-center">
            <p className="text-xs font-medium text-muted-foreground">
              No tasks in this stage
            </p>
            <p className="text-[11px] text-muted-foreground/70 mt-1">
              Drag tasks here or create one below
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {column.tasks?.map((task) => (
              <div
                key={task.id}
                className="rounded-xl border border-border/70 bg-card p-3 shadow-xs hover:border-primary/40 hover:shadow-sm transition-all"
              >
                <h4 className="text-xs font-semibold text-foreground line-clamp-2">
                  {task.title}
                </h4>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Column Footer */}
      {canManage && (
        <div className="p-2.5 pt-0">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 h-9 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/70 rounded-xl"
            disabled
            title="Task creation will be enabled in Module 6"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add task</span>
          </Button>
        </div>
      )}
    </div>
  );
}
