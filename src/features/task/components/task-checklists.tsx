'use client';

import * as React from 'react';
import {
  Check,
  CheckSquare,
  Loader2,
  Plus,
  Trash2,
  X,
  Edit2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  useChecklists,
  useAddChecklistItem,
  useToggleChecklistItem,
  useUpdateChecklistItem,
  useDeleteChecklistItem,
} from '../hooks/use-checklists';
import type { TaskChecklistItem } from '../types/task.types';

interface TaskChecklistsProps {
  taskId: string;
  canManage?: boolean;
}

export function TaskChecklists({ taskId, canManage = true }: TaskChecklistsProps) {
  const { data: checklistsResponse, isLoading } = useChecklists(taskId);
  const checklistItems = checklistsResponse?.data || [];

  const addMutation = useAddChecklistItem(taskId);
  const toggleMutation = useToggleChecklistItem(taskId);
  const updateMutation = useUpdateChecklistItem(taskId);
  const deleteMutation = useDeleteChecklistItem(taskId);

  const [newItemTitle, setNewItemTitle] = React.useState('');
  const [isAdding, setIsAdding] = React.useState(false);
  const [editingItemId, setEditingItemId] = React.useState<string | null>(null);
  const [editingTitle, setEditingTitle] = React.useState('');

  const completedCount = checklistItems.filter((i) => i.isCompleted).length;
  const totalCount = checklistItems.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleAddItem = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = newItemTitle.trim();
    if (!trimmed) return;

    addMutation.mutate(
      {
        title: trimmed,
        order: totalCount,
      },
      {
        onSuccess: () => {
          setNewItemTitle('');
        },
      },
    );
  };

  const handleToggle = (item: TaskChecklistItem) => {
    if (!canManage) return;
    toggleMutation.mutate(item.id);
  };

  const handleStartEdit = (item: TaskChecklistItem) => {
    if (!canManage) return;
    setEditingItemId(item.id);
    setEditingTitle(item.title);
  };

  const handleSaveEdit = (itemId: string) => {
    const trimmed = editingTitle.trim();
    if (!trimmed) {
      setEditingItemId(null);
      return;
    }

    updateMutation.mutate(
      {
        itemId,
        data: { title: trimmed },
      },
      {
        onSuccess: () => {
          setEditingItemId(null);
        },
      },
    );
  };

  return (
    <div className="space-y-3.5">
      {/* Header & Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-foreground">
            <CheckSquare className="size-4 text-primary" />
            <span>Checklist & Subtasks</span>
            {totalCount > 0 && (
              <span className="text-muted-foreground font-medium">
                ({completedCount}/{totalCount})
              </span>
            )}
          </div>
          {totalCount > 0 && (
            <span
              className={cn(
                'font-mono font-medium transition-colors',
                progressPercent === 100 ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-muted-foreground',
              )}
            >
              {progressPercent}%
            </span>
          )}
        </div>

        {totalCount > 0 && (
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary/80">
            <div
              className={cn(
                'h-full transition-all duration-300 ease-out rounded-full',
                progressPercent === 100
                  ? 'bg-emerald-500'
                  : 'bg-primary',
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </div>

      {/* Checklist Items List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin mr-2" />
          Loading checklist...
        </div>
      ) : checklistItems.length === 0 && !isAdding ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/80 p-4 text-center">
          <p className="text-xs text-muted-foreground">
            No acceptance checklist items yet.
          </p>
          {canManage && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsAdding(true)}
              className="mt-2 text-xs text-primary hover:text-primary/80"
            >
              <Plus className="size-3.5 mr-1" />
              Add item
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-1.5">
          {checklistItems.map((item) => (
            <div
              key={item.id}
              className={cn(
                'group flex items-center justify-between gap-2.5 rounded-lg border border-transparent px-2.5 py-1.5 transition-colors',
                'hover:border-border/60 hover:bg-muted/40',
                item.isCompleted && 'bg-muted/20',
              )}
            >
              {/* Checkbox + Title */}
              <div className="flex flex-1 items-center gap-2.5 min-w-0">
                <button
                  type="button"
                  disabled={!canManage || toggleMutation.isPending}
                  onClick={() => handleToggle(item)}
                  className={cn(
                    'flex size-4.5 shrink-0 items-center justify-center rounded border transition-all cursor-pointer',
                    item.isCompleted
                      ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                      : 'border-muted-foreground/40 bg-background hover:border-primary/60',
                    (!canManage || toggleMutation.isPending) && 'cursor-not-allowed opacity-60',
                  )}
                  aria-label={item.isCompleted ? 'Mark uncompleted' : 'Mark completed'}
                >
                  {item.isCompleted && <Check className="size-3 stroke-[3]" />}
                </button>

                {editingItemId === item.id ? (
                  <div className="flex flex-1 items-center gap-1.5">
                    <Input
                      aria-label="Edit checklist item title"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit(item.id);
                        if (e.key === 'Escape') setEditingItemId(null);
                      }}
                      autoFocus
                      className="h-7 text-xs"
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      aria-label="Save checklist item title"
                      className="size-6 text-emerald-600 hover:text-emerald-700"
                      onClick={() => handleSaveEdit(item.id)}
                    >
                      <Check className="size-3.5" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      aria-label="Cancel editing checklist item"
                      className="size-6 text-muted-foreground hover:text-foreground"
                      onClick={() => setEditingItemId(null)}
                    >
                      <X className="size-3.5" />
                    </Button>
                  </div>
                ) : (
                  <span
                    onClick={() => handleStartEdit(item)}
                    className={cn(
                      'flex-1 text-xs truncate transition-all cursor-pointer select-none',
                      item.isCompleted
                        ? 'line-through text-muted-foreground/70'
                        : 'text-foreground hover:text-primary',
                    )}
                  >
                    {item.title}
                  </span>
                )}
              </div>

              {/* Actions */}
              {canManage && editingItemId !== item.id && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus-within:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(item)}
                    className="rounded p-1 text-muted-foreground/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden transition-colors cursor-pointer"
                    aria-label="Edit item"
                    title="Edit item"
                  >
                    <Edit2 className="size-3" />
                  </button>
                  <button
                    type="button"
                    disabled={deleteMutation.isPending}
                    onClick={() => deleteMutation.mutate(item.id)}
                    className="rounded p-1 text-muted-foreground/60 hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden transition-colors cursor-pointer"
                    aria-label="Delete item"
                    title="Delete item"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Item Form */}
      {canManage && (
        <>
          {isAdding || checklistItems.length > 0 ? (
            <form onSubmit={handleAddItem} className="flex items-center gap-2 pt-1">
              <Input
                placeholder="Add checklist item..."
                aria-label="Add checklist item"
                value={newItemTitle}
                onChange={(e) => setNewItemTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setIsAdding(false);
                    setNewItemTitle('');
                  }
                }}
                className="h-8 text-xs placeholder:text-muted-foreground/60"
              />
              <Button
                type="submit"
                size="sm"
                disabled={!newItemTitle.trim() || addMutation.isPending}
                className="h-8 px-3 text-xs"
              >
                {addMutation.isPending ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <>
                    <Plus className="size-3.5 mr-1" />
                    Add
                  </>
                )}
              </Button>
            </form>
          ) : null}
        </>
      )}
    </div>
  );
}
